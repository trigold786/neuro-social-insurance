from fastapi import APIRouter, Depends, HTTPException, status
from ..schemas import SandboxCalcRequest, DeepPlanRequest, TaxRequest
from ..services import calc_service
from ..dependencies import get_current_identity_id

router = APIRouter()

@router.post("/sandbox")
async def calc_sandbox(
    req: SandboxCalcRequest,
    identity_id: str = Depends(get_current_identity_id),
):
    try:
        result = await calc_service.call_actuarial_sandbox(req)
        return result
    except Exception as e:
        import logging
        logging.getLogger(__name__).exception("Internal error")
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Internal server error")

@router.post("/deep-plan")
async def calc_deep_plan(
    req: DeepPlanRequest,
    identity_id: str = Depends(get_current_identity_id),
):
    try:
        result = await calc_service.call_actuarial_deep_plan(req)
        return result
    except Exception as e:
        import logging
        logging.getLogger(__name__).exception("Internal error")
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Internal server error")

@router.post("/tax")
async def calc_tax(
    req: TaxRequest,
    identity_id: str = Depends(get_current_identity_id),
):
    try:
        result = await calc_service.call_actuarial_tax(req)
        return result
    except Exception as e:
        import logging
        logging.getLogger(__name__).exception("Internal error")
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Tax calculation failed")
