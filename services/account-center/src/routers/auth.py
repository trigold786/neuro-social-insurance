import logging
from fastapi import APIRouter, Depends, HTTPException, status, Request
from sqlalchemy.ext.asyncio import AsyncSession
from ..db import get_db
from ..schemas import (
    SendSmsRequest, SendSmsResponse, SendCodeRequest, SendCodeResponse,
    LoginSmsRequest, LoginPasswordRequest, RegisterRequest, ChangePasswordRequest,
    ForgotPasswordRequest, TokenResponse, RefreshTokenRequest,
)
from ..services import auth_service, verification_service
from ..dependencies import get_current_identity
from ..models import Identity
from ..utils.crypto import validate_password_strength

logger = logging.getLogger(__name__)
router = APIRouter()


@router.post("/send-sms", response_model=SendSmsResponse)
async def send_sms(req: SendSmsRequest, db: AsyncSession = Depends(get_db)):
    try:
        task_id = await verification_service.create_verification(db, req.phone, "sms", "register")
        await db.commit()
        return SendSmsResponse(task_id=task_id, status="sent")
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_429_TOO_MANY_REQUESTS, detail=str(e))
    except Exception:
        logger.exception("send_sms error")
        raise HTTPException(status_code=500, detail="Internal server error")


@router.post("/send-code", response_model=SendCodeResponse)
async def send_code(req: SendCodeRequest, db: AsyncSession = Depends(get_db)):
    try:
        task_id = await verification_service.create_verification(db, req.target, req.channel, req.purpose)
        await db.commit()
        return SendCodeResponse(task_id=task_id, status="sent", message=f"验证码已发送至{req.target}")
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_429_TOO_MANY_REQUESTS, detail=str(e))
    except Exception:
        logger.exception("send_code error")
        raise HTTPException(status_code=500, detail="Internal server error")


@router.post("/register", response_model=TokenResponse)
async def register(req: RegisterRequest, db: AsyncSession = Depends(get_db)):
    if req.password:
        is_valid, error_msg = validate_password_strength(req.password)
        if not is_valid:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=error_msg)
    try:
        result = await verification_service.register(db, req.target, req.channel, req.code, req.password)
        await db.commit()
        return TokenResponse(
            access_token=result["access_token"],
            refresh_token=result["refresh_token"],
            identity_type=result["identity_type"],
        )
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))
    except Exception:
        logger.exception("register error")
        raise HTTPException(status_code=500, detail="Internal server error")


@router.post("/login/sms", response_model=TokenResponse)
async def login_sms(req: LoginSmsRequest, db: AsyncSession = Depends(get_db)):
    try:
        result = await auth_service.login_by_sms(db, req.phone, req.code)
        await db.commit()
        return TokenResponse(
            access_token=result["access_token"],
            refresh_token=result["refresh_token"],
            identity_type=result["identity_type"],
        )
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))
    except Exception:
        logger.exception("login_sms error")
        raise HTTPException(status_code=500, detail="Internal server error")


@router.post("/login/password", response_model=TokenResponse)
async def login_password(req: LoginPasswordRequest, db: AsyncSession = Depends(get_db)):
    try:
        result = await auth_service.login_by_password(db, req.target, req.password, req.channel)
        return TokenResponse(
            access_token=result["access_token"],
            refresh_token=result["refresh_token"],
            identity_type=result["identity_type"],
        )
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail=str(e))
    except Exception:
        logger.exception("login_password error")
        raise HTTPException(status_code=500, detail="Internal server error")


@router.post("/change-password")
async def change_password(
    req: ChangePasswordRequest,
    identity: Identity = Depends(get_current_identity),
    db: AsyncSession = Depends(get_db),
):
    is_valid, error_msg = validate_password_strength(req.new_password)
    if not is_valid:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=error_msg)
    try:
        if req.old_password:
            from ..utils.crypto import verify_password
            if not verify_password(req.old_password, identity.password_hash or ""):
                raise ValueError("当前密码错误")

        result = await verification_service.change_password(
            db, identity, req.new_password, req.code, req.channel, req.target
        )
        await db.commit()
        return result
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))
    except Exception:
        logger.exception("change_password error")
        raise HTTPException(status_code=500, detail="Internal server error")


@router.post("/forgot-password", response_model=TokenResponse)
async def forgot_password(req: ForgotPasswordRequest, db: AsyncSession = Depends(get_db)):
    is_valid, error_msg = validate_password_strength(req.new_password)
    if not is_valid:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=error_msg)
    try:
        result = await verification_service.forgot_password(
            db, req.target, req.channel, req.code, req.new_password
        )
        await db.commit()
        return TokenResponse(
            access_token=result["access_token"],
            refresh_token=result["refresh_token"],
            identity_type=result["identity_type"],
        )
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))
    except Exception:
        logger.exception("forgot_password error")
        raise HTTPException(status_code=500, detail="Internal server error")


@router.post("/refresh", response_model=TokenResponse)
async def refresh_token(req: RefreshTokenRequest):
    try:
        result = await auth_service.refresh_access_token(req.refresh_token)
        return TokenResponse(
            access_token=result["access_token"],
            refresh_token=result.get("refresh_token", ""),
            identity_type=result.get("identity_type", "individual"),
        )
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail=str(e))
