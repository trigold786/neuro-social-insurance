import logging
import httpx
from typing import Dict, Any
from fastapi import HTTPException
from ..config import settings
from ..schemas import SandboxCalcRequest, DeepPlanRequest, TaxRequest

logger = logging.getLogger(__name__)

_shared_client = httpx.AsyncClient(timeout=10.0)

async def call_actuarial_sandbox(req: SandboxCalcRequest) -> Dict[str, Any]:
    """调用精算引擎沙盒计算"""
    try:
        resp = await _shared_client.post(
            f"{settings.actuarial_url}/v1/calc/sandbox",
            json=req.model_dump(),
            timeout=5.0,
        )
        resp.raise_for_status()
        return resp.json()
    except (httpx.TimeoutException, httpx.ConnectError):
        return _fallback_calc(req)
    except Exception as exc:
        logger.exception("actuarial sandbox call failed")
        raise HTTPException(status_code=502, detail=f"精算引擎调用失败: {exc}") from exc

async def call_actuarial_tax(req: TaxRequest) -> Dict[str, Any]:
    """调用精算引擎税务计算"""
    try:
        resp = await _shared_client.post(
            f"{settings.actuarial_url}/v1/calc/tax",
            json=req.model_dump(),
            timeout=5.0,
        )
        resp.raise_for_status()
        return resp.json()
    except (httpx.TimeoutException, httpx.ConnectError):
        return _fallback_tax(req)
    except Exception as exc:
        logger.exception("actuarial tax call failed")
        raise HTTPException(status_code=502, detail=f"精算引擎税务计算失败: {exc}") from exc


async def call_actuarial_deep_plan(req: DeepPlanRequest) -> Dict[str, Any]:
    """调用精算引擎深度规划"""
    try:
        resp = await _shared_client.post(
            f"{settings.actuarial_url}/v1/calc/deep-plan",
            json=req.model_dump(),
            timeout=10.0,
        )
        resp.raise_for_status()
        return resp.json()
    except (httpx.TimeoutException, httpx.ConnectError):
        return _fallback_deep_plan(req)
    except Exception as exc:
        logger.exception("actuarial deep-plan call failed")
        raise HTTPException(status_code=502, detail=f"精算引擎调用失败: {exc}") from exc

def _fallback_calc(req: SandboxCalcRequest) -> Dict[str, Any]:
    years = req.retirement_age - req.age
    monthly_pay = req.base_salary * 0.20
    total_invested = monthly_pay * 12 * years
    monthly_pension = req.base_salary * 0.45
    years_receive = 85 - req.retirement_age
    total_benefit = monthly_pension * 12 * years_receive
    
    return {
        "strategy": req.strategy,
        "total_invested": round(total_invested, 2),
        "total_benefit": round(total_benefit, 2),
        "irr": 0.048,
        "break_even_age": 71,
        "monthly_pension_estimate": round(monthly_pension, 2),
        "is_fallback": True,
        "fallback_reason": "精算引擎超时，已切换至国家标准模型简化计算",
        "cashflows": [],
    }

def _fallback_tax(req: TaxRequest) -> Dict[str, Any]:
    monthlyIncome = req.annual_income / 12
    socialMonthly = (req.social_insurance or 0) / 12
    basicDeduct = 5000.0
    additional = 0.0
    if req.special_deductions:
        d = req.special_deductions
        additional = d.children_education + d.continuing_education + d.serious_illness_medical/12 + d.housing_rent + d.housing_loan_interest + d.elderly_care + d.childcare_under_3
    taxable = monthlyIncome - socialMonthly - basicDeduct - additional
    if taxable <= 0:
        return {"monthly_tax": 0, "after_tax_income": monthlyIncome - socialMonthly, "is_fallback": True}
    if taxable <= 3000:
        tax = taxable * 0.03
    elif taxable <= 12000:
        tax = taxable*0.10 - 210
    elif taxable <= 25000:
        tax = taxable*0.20 - 1410
    elif taxable <= 35000:
        tax = taxable*0.25 - 2660
    elif taxable <= 55000:
        tax = taxable*0.30 - 4410
    elif taxable <= 80000:
        tax = taxable*0.35 - 7160
    else:
        tax = taxable*0.45 - 15160
    return {"monthly_tax": round(tax, 2), "after_tax_income": round(monthlyIncome - socialMonthly - tax, 2), "is_fallback": True}


def _fallback_deep_plan(req: DeepPlanRequest) -> Dict[str, Any]:
    return {
        "strategies": [],
        "recommendation": "balanced",
        "is_fallback": True,
        "fallback_reason": "精算引擎超时，已切换至国家标准模型简化计算",
    }

async def close_shared_client():
    await _shared_client.aclose()
