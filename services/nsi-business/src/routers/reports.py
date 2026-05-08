from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.responses import FileResponse
from sqlalchemy.ext.asyncio import AsyncSession
from ..db import get_db
from ..schemas import ReportCreateRequest, ReportStatusOut
from ..services import report_service
from ..dependencies import get_current_identity_id
from ..services.pdf_generator import REPORTS_DIR

router = APIRouter()

@router.post("", response_model=ReportStatusOut)
async def create_report(
    req: ReportCreateRequest,
    db: AsyncSession = Depends(get_db),
    identity_id: str = Depends(get_current_identity_id),
):
    try:
        result = await report_service.create_report_task(db, identity_id, req)
        await db.commit()
        return result
    except Exception as e:
        import logging
        logging.getLogger(__name__).exception("Internal error")
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Internal server error")

@router.get("/{task_id}", response_model=ReportStatusOut)
async def get_report_status(
    task_id: str,
    db: AsyncSession = Depends(get_db),
    identity_id: str = Depends(get_current_identity_id),
):
    """查询报告生成状态"""
    result = await report_service.get_report_status(db, task_id)
    if not result:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Task not found")
    return result

@router.get("/download/{task_id}")
async def download_report(
    task_id: str,
    db: AsyncSession = Depends(get_db),
    identity_id: str = Depends(get_current_identity_id),
):
    """下载生成的PDF报告"""
    status_result = await report_service.get_report_status(db, task_id)
    if not status_result or status_result.status != "completed":
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Report not ready")
    import os
    filename = f"report_{task_id.replace('-', '')}.pdf"
    filepath = REPORTS_DIR / filename
    if not filepath.exists():
        for f in REPORTS_DIR.glob("report_*.pdf"):
            if task_id.replace('-', '') in f.name:
                filepath = f
                break
    if not filepath.exists():
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Report file not found")
    return FileResponse(
        path=str(filepath),
        media_type="application/pdf",
        filename=f"NSI_Report_{task_id[:8]}.pdf",
    )
