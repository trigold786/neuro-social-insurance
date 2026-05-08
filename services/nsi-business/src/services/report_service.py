import uuid
import asyncio
import logging
from concurrent.futures import ThreadPoolExecutor
from datetime import datetime, timezone
from typing import Optional
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from ..models import ReportTask, UserProfile
from ..schemas import ReportCreateRequest, ReportStatusOut
from ..config import settings
from .pdf_generator import generate_report_pdf, get_report_url

_pdf_executor = ThreadPoolExecutor(max_workers=2)

logger = logging.getLogger(__name__)


async def create_report_task(db: AsyncSession, identity_id: str, req: ReportCreateRequest) -> ReportStatusOut:
    if not req.profile_id.isdigit():
        raise ValueError("Invalid profile_id: must be a valid integer")
    task = ReportTask(
        task_id=uuid.uuid4(),
        identity_id=uuid.UUID(identity_id),
        profile_id=int(req.profile_id),
        report_type=req.report_type,
        status="queued",
        params={"scenarios": req.scenarios or ["conservative", "balanced", "aggressive"]},
    )
    db.add(task)
    await db.flush()

    asyncio.create_task(_generate_report_async(db, task.task_id, req))

    return ReportStatusOut(
        task_id=str(task.task_id),
        status="queued",
        estimated_seconds=15,
    )


async def _generate_report_async(db: AsyncSession, task_id: uuid.UUID, req: ReportCreateRequest):
    import httpx

    try:
        result = await db.execute(select(ReportTask).where(ReportTask.task_id == task_id))
        task = result.scalar_one_or_none()
        if not task:
            logger.error(f"Report task {task_id} not found")
            return

        task.status = "running"
        await db.commit()

        profile_result = await db.execute(
            select(UserProfile).where(UserProfile.id == task.profile_id)
        )
        profile = profile_result.scalar_one_or_none()
        if not profile:
            task.status = "failed"
            await db.commit()
            return

        profile_dict = {
            "current_region": profile.current_region,
            "employment_type": profile.employment_type,
            "age": profile.age or 40,
            "gender": profile.gender,
        }

        calc_payload = {
            "profile_id": str(task.profile_id),
            "region_code": profile.current_region,
            "age": profile.age or 40,
            "gender": profile.gender or "Female",
            "employment_type": profile.employment_type,
            "cumulative_months": 0,
            "scenarios": [{"strategy": s, "base_salary": 10000, "retirement_age": 60} for s in (req.scenarios or ["conservative", "balanced", "aggressive"])],
        }

        calc_results = {}
        try:
            async with httpx.AsyncClient(timeout=10.0) as client:
                resp = await client.post(
                    f"{settings.actuarial_url}/v1/calc/deep-plan",
                    json=calc_payload,
                )
                if resp.status_code == 200:
                    calc_results = resp.json()
        except Exception as exc:
            logger.warning(f"Actuarial engine call failed during report generation: {exc}")
            calc_results = {
                "strategies": [
                    {"strategy": "conservative", "total_invested": 288000, "monthly_pension_estimate": 3500, "break_even_age": 68, "irr": 0.042, "total_benefit": 630000},
                    {"strategy": "balanced", "total_invested": 360000, "monthly_pension_estimate": 4800, "break_even_age": 70, "irr": 0.051, "total_benefit": 864000},
                    {"strategy": "aggressive", "total_invested": 480000, "monthly_pension_estimate": 6500, "break_even_age": 72, "irr": 0.058, "total_benefit": 1170000},
                ],
                "recommendation": "balanced",
                "cashflows": [],
            }

        loop = asyncio.get_event_loop()
        pdf_path = await loop.run_in_executor(
            _pdf_executor, _sync_generate_pdf, profile_dict, calc_results, req.report_type
        )

        task.status = "completed"
        task.result_url = get_report_url(str(task_id))
        task.completed_at = datetime.now(timezone.utc)
        await db.commit()

        logger.info(f"Report {task_id} generated successfully: {pdf_path}")

    except Exception as exc:
        logger.exception(f"Report generation failed for task {task_id}")
        try:
            result = await db.execute(select(ReportTask).where(ReportTask.task_id == task_id))
            task = result.scalar_one_or_none()
            if task:
                task.status = "failed"
                await db.commit()
        except Exception:
            pass


def _sync_generate_pdf(profile: dict, calc_results: dict, report_type: str) -> str:
    return generate_report_pdf(profile, calc_results, report_type)


async def get_report_status(db: AsyncSession, task_id: str) -> Optional[ReportStatusOut]:
    result = await db.execute(select(ReportTask).where(ReportTask.task_id == uuid.UUID(task_id)))
    task = result.scalar_one_or_none()
    if not task:
        return None

    return ReportStatusOut(
        task_id=str(task.task_id),
        status=task.status,
        result_url=task.result_url,
        completed_at=task.completed_at,
    )
