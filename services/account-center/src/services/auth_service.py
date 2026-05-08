import uuid
import logging
from typing import Optional
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from ..models import Identity, IndividualProfile
from ..utils.jwt import create_access_token, create_refresh_token, verify_refresh_token
from ..utils.crypto import hash_phone, encrypt_pii, verify_password
from .verification_service import verify_code, increment_attempts

logger = logging.getLogger(__name__)


async def login_by_sms(db: AsyncSession, phone: str, code: str):
    if not await verify_code(db, phone, "sms", code, "register"):
        await increment_attempts(db, phone, "register")
        raise ValueError("验证码错误或已过期")

    phone_hash = hash_phone(phone)
    result = await db.execute(
        select(IndividualProfile).where(IndividualProfile.phone_hash == phone_hash)
    )
    profile = result.scalar_one_or_none()

    if profile:
        identity_result = await db.execute(
            select(Identity).where(Identity.id == profile.identity_id)
        )
        identity = identity_result.scalar_one()
        if identity.status == "pending_deletion":
            raise ValueError("账户正在注销冷静期，请先撤销注销申请")
        if identity.status == "deleted":
            raise ValueError("账户已注销")
    else:
        identity = Identity(
            id=uuid.uuid4(),
            identity_type="individual",
            status="active",
            auth_method="sms",
        )
        db.add(identity)
        await db.flush()

        profile = IndividualProfile(
            identity_id=identity.id,
            phone_hash=phone_hash,
            phone_enc=encrypt_pii(phone),
        )
        db.add(profile)
        await db.flush()

    access_token = create_access_token(str(identity.id), identity.identity_type)
    refresh_token = create_refresh_token(str(identity.id), identity.identity_type)

    return {
        "access_token": access_token,
        "refresh_token": refresh_token,
        "identity_type": identity.identity_type,
    }


async def login_by_password(db: AsyncSession, target: str, password: str, channel: str = "sms"):
    if channel == "sms":
        phone_hash = hash_phone(target)
        result = await db.execute(
            select(IndividualProfile).where(IndividualProfile.phone_hash == phone_hash)
        )
    else:
        from ..utils.crypto import hash_email
        email_hash = hash_email(target)
        result = await db.execute(
            select(IndividualProfile).where(IndividualProfile.email_hash == email_hash)
        )

    profile = result.scalar_one_or_none()
    if not profile:
        raise ValueError("账号不存在")

    identity_result = await db.execute(
        select(Identity).where(Identity.id == profile.identity_id)
    )
    identity = identity_result.scalar_one()

    if identity.status == "pending_deletion":
        raise ValueError("账户正在注销冷静期，请先撤销注销申请")
    if identity.status == "deleted":
        raise ValueError("账户已注销")

    if not identity.password_hash:
        raise ValueError("该账号未设置密码，请使用验证码登录")

    if not verify_password(password, identity.password_hash):
        raise ValueError("密码错误")

    access_token = create_access_token(str(identity.id), identity.identity_type)
    refresh_token = create_refresh_token(str(identity.id), identity.identity_type)

    return {
        "access_token": access_token,
        "refresh_token": refresh_token,
        "identity_type": identity.identity_type,
    }


async def refresh_access_token(refresh_token_str: str):
    payload = verify_refresh_token(refresh_token_str)
    if not payload:
        raise ValueError("Invalid or expired refresh token")

    identity_id = payload.get("sub")
    identity_type = payload.get("type", "individual")
    scope = payload.get("scope")

    access_token = create_access_token(identity_id, identity_type)
    new_refresh = create_refresh_token(identity_id, identity_type)
    return {
        "access_token": access_token,
        "refresh_token": new_refresh,
        "token_type": "bearer",
        "identity_type": identity_type,
        "scope": scope,
    }
