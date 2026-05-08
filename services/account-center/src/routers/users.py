import logging
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from ..dependencies import get_db, get_current_identity
from ..models import Identity
from ..schemas import UserMeOut, UserMePatch, BindPhoneRequest, BindEmailRequest
from ..services import user_service, verification_service

logger = logging.getLogger(__name__)
router = APIRouter()


@router.get("/me", response_model=UserMeOut)
async def get_me(
    identity: Identity = Depends(get_current_identity),
    db: AsyncSession = Depends(get_db),
):
    try:
        return await user_service.get_user_me(db, identity)
    except Exception:
        logger.exception("get_me error")
        raise HTTPException(status_code=500, detail="Internal server error")


@router.patch("/me")
async def patch_me(
    req: UserMePatch,
    identity: Identity = Depends(get_current_identity),
    db: AsyncSession = Depends(get_db),
):
    try:
        return await user_service.patch_user_profile(db, identity, req)
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))
    except Exception:
        logger.exception("patch_me error")
        raise HTTPException(status_code=500, detail="Internal server error")


@router.post("/me/bind-phone")
async def bind_phone(
    req: BindPhoneRequest,
    identity: Identity = Depends(get_current_identity),
    db: AsyncSession = Depends(get_db),
):
    try:
        result = await verification_service.bind_phone(db, identity, req.phone, req.code)
        await db.commit()
        return result
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))
    except Exception:
        logger.exception("bind_phone error")
        raise HTTPException(status_code=500, detail="Internal server error")


@router.post("/me/bind-email")
async def bind_email(
    req: BindEmailRequest,
    identity: Identity = Depends(get_current_identity),
    db: AsyncSession = Depends(get_db),
):
    try:
        result = await verification_service.bind_email(db, identity, req.email, req.code)
        await db.commit()
        return result
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))
    except Exception:
        logger.exception("bind_email error")
        raise HTTPException(status_code=500, detail="Internal server error")
