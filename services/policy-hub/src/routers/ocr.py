from typing import Optional
from fastapi import APIRouter, UploadFile, File, Form, HTTPException, status, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from ..db import get_db
from ..schemas import OcrUploadResponse
from ..services import ocr_service
import uuid

router = APIRouter()

@router.post("/upload", response_model=OcrUploadResponse)
async def upload_bill(
    file: UploadFile = File(...),
    region_code: str = Form(...),
    user_id: Optional[str] = Form(None),
    db: AsyncSession = Depends(get_db),
):
    """众包OCR账单上传（Plan C）"""
    effective_user_id = uuid.UUID(user_id) if user_id else uuid.uuid4()
    if not file.content_type or not file.content_type.startswith("image/"):
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Only image files allowed")
    
    safe_filename = f"{uuid.uuid4().hex}_{file.filename.replace('/', '_').replace('\\', '_')}"
    mock_path = f"ocr/{region_code}/{effective_user_id}/{safe_filename}"
    
    try:
        result = await ocr_service.create_ocr_task(db, effective_user_id, region_code, mock_path)
        await db.commit()
        return result
    except Exception as e:
        import logging
        logging.getLogger(__name__).exception("Internal error")
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Internal server error")
