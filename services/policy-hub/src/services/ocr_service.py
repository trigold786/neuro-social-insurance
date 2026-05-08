import uuid
from datetime import datetime, timedelta, timezone
from uuid import UUID
from sqlalchemy.ext.asyncio import AsyncSession
from ..models import OcrTask
from ..schemas import OcrUploadResponse

async def create_ocr_task(
    db: AsyncSession,
    user_id: UUID,
    region_code: str,
    image_path: str,
) -> OcrUploadResponse:
    """创建OCR众包任务"""
    task = OcrTask(
        task_id=uuid.uuid4(),
        user_id=user_id,
        region_code=region_code,
        image_path=image_path,
        delete_after=datetime.now(timezone.utc) + timedelta(hours=1),
    )
    db.add(task)
    await db.flush()
    
    return OcrUploadResponse(
        task_id=str(task.task_id),
        status=task.status,
        delete_after=task.delete_after,
    )
