import logging
from fastapi import APIRouter, Depends, HTTPException, status, Request
from sqlalchemy.ext.asyncio import AsyncSession
from ..db import get_db
from ..dependencies import get_current_identity
from ..models import Identity
from ..schemas import DeleteAccountRequest, DeleteDataRequest
from ..services import verification_service

logger = logging.getLogger(__name__)
router = APIRouter()


@router.post("/me/delete-request")
async def delete_account_request(
    req: DeleteAccountRequest,
    identity: Identity = Depends(get_current_identity),
    db: AsyncSession = Depends(get_db),
    request: Request = None,
):
    try:
        ip_address = request.client.host if request else None
        result = await verification_service.request_account_deletion(
            db, str(identity.id), req.channel, req.target, req.code, req.reason
        )
        await db.commit()
        return result
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))
    except Exception:
        logger.exception("delete_account_request error")
        raise HTTPException(status_code=500, detail="Internal server error")


@router.post("/me/delete-cancel")
async def delete_account_cancel(
    identity: Identity = Depends(get_current_identity),
    db: AsyncSession = Depends(get_db),
):
    try:
        result = await verification_service.cancel_account_deletion(db, str(identity.id))
        await db.commit()
        return result
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))
    except Exception:
        logger.exception("delete_account_cancel error")
        raise HTTPException(status_code=500, detail="Internal server error")


@router.post("/me/delete-confirm")
async def delete_account_confirm(
    req: DeleteAccountRequest,
    identity: Identity = Depends(get_current_identity),
    db: AsyncSession = Depends(get_db),
):
    try:
        if not await verification_service.verify_code(db, req.target, req.channel, req.code, "delete_account"):
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="验证码错误")

        from datetime import datetime, timezone
        identity.status = "deleted"
        identity.deleted_at = datetime.now(timezone.utc)
        await db.flush()
        await db.commit()

        return {"deleted": True, "message": "账户已注销，数据将在24小时内完成清理"}
    except HTTPException:
        raise
    except Exception:
        logger.exception("delete_account_confirm error")
        raise HTTPException(status_code=500, detail="Internal server error")


@router.delete("/me/data")
async def delete_data(
    req: DeleteDataRequest,
    identity: Identity = Depends(get_current_identity),
    db: AsyncSession = Depends(get_db),
    request: Request = None,
):
    try:
        ip_address = request.client.host if request else None
        result = await verification_service.delete_data_by_category(
            db, str(identity.id), req.categories, req.channel, req.target, req.code, ip_address
        )
        await db.commit()
        return result
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))
    except Exception:
        logger.exception("delete_data error")
        raise HTTPException(status_code=500, detail="Internal server error")


@router.get("/me/export")
async def export_data(
    identity: Identity = Depends(get_current_identity),
    db: AsyncSession = Depends(get_db),
):
    try:
        return await verification_service.export_personal_data(db, str(identity.id))
    except Exception:
        logger.exception("export_data error")
        raise HTTPException(status_code=500, detail="Internal server error")
