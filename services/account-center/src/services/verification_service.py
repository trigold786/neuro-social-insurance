import uuid
import hashlib
import logging
from datetime import datetime, timedelta, timezone
from typing import Optional
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, and_, func
from ..models import Identity, IndividualProfile, VerificationCode, AccountDeletionRequest, ComplianceLog
from ..utils.crypto import hash_phone, encrypt_pii, decrypt_pii, hash_password, verify_password, hash_email
from .notification_service import send_sms_code, send_email_code, generate_code, hash_code
from ..utils.jwt import create_access_token, create_refresh_token
from ..config import settings

logger = logging.getLogger(__name__)


async def _check_rate_limit(db: AsyncSession, target: str) -> None:
    one_hour_ago = datetime.now(timezone.utc) - timedelta(hours=1)
    result = await db.execute(
        select(func.count()).where(
            and_(
                VerificationCode.target == target,
                VerificationCode.created_at > one_hour_ago,
            )
        )
    )
    count = result.scalar()
    if count >= settings.verification_code_rate_limit_per_hour:
        raise ValueError("验证码发送过于频繁，请稍后再试")

    result_recent = await db.execute(
        select(VerificationCode)
        .where(VerificationCode.target == target)
        .order_by(VerificationCode.created_at.desc())
        .limit(1)
    )
    recent = result_recent.scalar_one_or_none()
    if recent and recent.created_at:
        elapsed = (datetime.now(timezone.utc) - recent.created_at).total_seconds()
        if elapsed < settings.verification_code_cooldown_seconds:
            remaining = int(settings.verification_code_cooldown_seconds - elapsed)
            raise ValueError(f"请{remaining}秒后再试")


async def create_verification(
    db: AsyncSession,
    target: str,
    channel: str,
    purpose: str,
) -> str:
    await _check_rate_limit(db, target)

    code = generate_code(channel)
    code_hash_str = hash_code(code)

    expires = datetime.now(timezone.utc) + timedelta(minutes=10 if channel == "email" else 5)

    record = VerificationCode(
        target=target,
        channel=channel,
        code_hash=code_hash_str,
        purpose=purpose,
        max_attempts=5,
        expires_at=expires,
    )
    db.add(record)
    await db.flush()

    if channel == "sms":
        await send_sms_code(target, code)
    else:
        purpose_map = {
            "register": "注册",
            "change_password": "修改密码",
            "delete_account": "注销账户",
            "delete_data": "删除数据",
            "forgot_password": "找回密码",
            "bind_phone": "绑定手机",
            "bind_email": "绑定邮箱",
        }
        await send_email_code(target, code, purpose_map.get(purpose, "验证"))

    return str(record.id)


async def verify_code(
    db: AsyncSession,
    target: str,
    channel: str,
    code: str,
    purpose: str,
) -> bool:
    """Verify verification code with atomic attempt counting to prevent race conditions."""
    code_hash_str = hash_code(code)

    result = await db.execute(
        select(VerificationCode)
        .where(
            and_(
                VerificationCode.target == target,
                VerificationCode.channel == channel,
                VerificationCode.purpose == purpose,
                VerificationCode.used_at.is_(None),
                VerificationCode.expires_at > datetime.now(timezone.utc),
            )
        )
        .order_by(VerificationCode.created_at.desc())
        .with_for_update()
    )
    record = result.scalar_one_or_none()

    if not record:
        return False

    if record.attempts >= record.max_attempts:
        return False

    if not hmac.compare_digest(record.code_hash, code_hash_str):
        record.attempts += 1
        await db.flush()
        return False

    record.used_at = datetime.now(timezone.utc)
    await db.flush()
    return True


async def increment_attempts(db: AsyncSession, target: str, purpose: str):
    result = await db.execute(
        select(VerificationCode)
        .where(
            and_(
                VerificationCode.target == target,
                VerificationCode.purpose == purpose,
                VerificationCode.used_at.is_(None),
            )
        )
        .order_by(VerificationCode.created_at.desc())
    )
    record = result.scalar_one_or_none()
    if record:
        record.attempts += 1
        await db.flush()


import hmac


async def register(
    db: AsyncSession,
    target: str,
    channel: str,
    code: str,
    password: Optional[str] = None,
) -> dict:
    if not await verify_code(db, target, channel, code, "register"):
        await increment_attempts(db, target, "register")
        raise ValueError("验证码错误或已过期")

    if channel == "sms":
        phone_hash = hash_phone(target)
        result = await db.execute(
            select(IndividualProfile).where(IndividualProfile.phone_hash == phone_hash)
        )
    else:
        email_hash_val = hash_email(target)
        result = await db.execute(
            select(IndividualProfile).where(IndividualProfile.email_hash == email_hash_val)
        )

    existing = result.scalar_one_or_none()
    if existing:
        raise ValueError("该账号已注册，请直接登录")

    identity = Identity(
        id=uuid.uuid4(),
        identity_type="individual",
        status="active",
        auth_method=channel,
        password_hash=hash_password(password) if password else None,
    )
    db.add(identity)
    await db.flush()

    profile = IndividualProfile(
        identity_id=identity.id,
        phone_hash=hash_phone(target) if channel == "sms" else None,
        phone_enc=encrypt_pii(target) if channel == "sms" else None,
        email_hash=hash_email(target) if channel == "email" else None,
        email_enc=encrypt_pii(target) if channel == "email" else None,
        email_verified=(channel == "email"),
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


async def change_password(
    db: AsyncSession,
    identity: Identity,
    new_password: str,
    code: str,
    channel: str,
    target: str,
) -> dict:
    if not await verify_code(db, target, channel, code, "change_password"):
        await increment_attempts(db, target, "change_password")
        raise ValueError("验证码错误或已过期")

    identity.password_hash = hash_password(new_password)
    identity.updated_at = datetime.now(timezone.utc)
    await db.flush()

    return {"updated": True, "message": "密码修改成功"}


async def forgot_password(
    db: AsyncSession,
    target: str,
    channel: str,
    code: str,
    new_password: str,
) -> dict:
    if not await verify_code(db, target, channel, code, "forgot_password"):
        await increment_attempts(db, target, "forgot_password")
        raise ValueError("验证码错误或已过期")

    if channel == "sms":
        phone_hash = hash_phone(target)
        result = await db.execute(
            select(IndividualProfile).where(IndividualProfile.phone_hash == phone_hash)
        )
    else:
        email_hash_val = hash_email(target)
        result = await db.execute(
            select(IndividualProfile).where(IndividualProfile.email_hash == email_hash_val)
        )
    profile = result.scalar_one_or_none()
    if not profile:
        raise ValueError("该账号不存在")

    identity_result = await db.execute(select(Identity).where(Identity.id == profile.identity_id))
    identity = identity_result.scalar_one()
    identity.password_hash = hash_password(new_password)
    identity.updated_at = datetime.now(timezone.utc)
    await db.flush()

    access_token = create_access_token(str(identity.id), identity.identity_type)
    refresh_token = create_refresh_token(str(identity.id), identity.identity_type)

    return {
        "updated": True,
        "message": "密码重置成功",
        "access_token": access_token,
        "refresh_token": refresh_token,
        "identity_type": identity.identity_type,
    }


async def bind_phone(db: AsyncSession, identity: Identity, phone: str, code: str) -> dict:
    if not await verify_code(db, phone, "sms", code, "bind_phone"):
        await increment_attempts(db, phone, "bind_phone")
        raise ValueError("验证码错误或已过期")

    phone_hash = hash_phone(phone)
    existing = await db.execute(
        select(IndividualProfile).where(IndividualProfile.phone_hash == phone_hash)
    )
    if existing.scalar_one_or_none():
        raise ValueError("该手机号已被其他账号绑定")

    result = await db.execute(
        select(IndividualProfile).where(IndividualProfile.identity_id == identity.id)
    )
    profile = result.scalar_one_or_none()
    if not profile:
        raise ValueError("用户档案不存在")

    profile.phone_hash = phone_hash
    profile.phone_enc = encrypt_pii(phone)
    await db.flush()

    return {"updated": True, "message": "手机号绑定成功"}


async def bind_email(db: AsyncSession, identity: Identity, email: str, code: str) -> dict:
    if not await verify_code(db, email, "email", code, "bind_email"):
        await increment_attempts(db, email, "bind_email")
        raise ValueError("验证码错误或已过期")

    email_hash_val = hash_email(email)
    existing = await db.execute(
        select(IndividualProfile).where(IndividualProfile.email_hash == email_hash_val)
    )
    if existing.scalar_one_or_none():
        raise ValueError("该邮箱已被其他账号绑定")

    result = await db.execute(
        select(IndividualProfile).where(IndividualProfile.identity_id == identity.id)
    )
    profile = result.scalar_one_or_none()
    if not profile:
        raise ValueError("用户档案不存在")

    profile.email_hash = email_hash_val
    profile.email_enc = encrypt_pii(email)
    profile.email_verified = True
    await db.flush()

    return {"updated": True, "message": "邮箱绑定成功"}


async def request_account_deletion(
    db: AsyncSession,
    identity_id: str,
    channel: str,
    target: str,
    code: str,
    reason: Optional[str] = None,
) -> dict:
    if not await verify_code(db, target, channel, code, "delete_account"):
        await increment_attempts(db, target, "delete_account")
        raise ValueError("验证码错误或已过期")

    result = await db.execute(
        select(AccountDeletionRequest).where(
            and_(
                AccountDeletionRequest.identity_id == identity_id,
                AccountDeletionRequest.status == "pending",
            )
        )
    )
    if result.scalar_one_or_none():
        raise ValueError("您已提交注销申请，30天冷静期内可撤销")

    deletion_request = AccountDeletionRequest(
        identity_id=uuid.UUID(identity_id),
        status="pending",
        scheduled_deletion_at=datetime.now(timezone.utc) + timedelta(days=30),
        verification_method=channel,
        reason=reason,
    )
    db.add(deletion_request)
    await db.flush()

    identity_result = await db.execute(select(Identity).where(Identity.id == identity_id))
    identity = identity_result.scalar_one()
    identity.status = "pending_deletion"
    await db.flush()

    log = ComplianceLog(
        identity_id=uuid.UUID(identity_id),
        action="account_delete",
        details={"step": "request", "scheduled_at": deletion_request.scheduled_deletion_at.isoformat()},
    )
    db.add(log)
    await db.flush()

    return {
        "request_id": deletion_request.id,
        "status": "pending",
        "scheduled_deletion_at": deletion_request.scheduled_deletion_at.isoformat(),
        "message": "注销申请已提交，30天冷静期内可撤销",
    }


async def cancel_account_deletion(db: AsyncSession, identity_id: str) -> dict:
    result = await db.execute(
        select(AccountDeletionRequest).where(
            and_(
                AccountDeletionRequest.identity_id == identity_id,
                AccountDeletionRequest.status == "pending",
            )
        )
    )
    deletion_request = result.scalar_one_or_none()
    if not deletion_request:
        raise ValueError("没有待处理的注销申请")

    deletion_request.status = "cancelled"
    deletion_request.cancelled_at = datetime.now(timezone.utc)

    identity_result = await db.execute(select(Identity).where(Identity.id == identity_id))
    identity = identity_result.scalar_one()
    identity.status = "active"
    await db.flush()

    log = ComplianceLog(
        identity_id=uuid.UUID(identity_id),
        action="account_delete",
        details={"step": "cancel"},
    )
    db.add(log)
    await db.flush()

    return {"cancelled": True, "message": "注销申请已撤销"}


async def delete_data_by_category(
    db: AsyncSession,
    identity_id: str,
    categories: list,
    channel: str,
    target: str,
    code: str,
    ip_address: Optional[str] = None,
) -> dict:
    """Delete or anonymize personal data by category per PIPL requirements.

    Categories:
    - calculation_history: anonymized in nsi_business service (not account-center)
    - profile_data: anonymizes PII fields in IndividualProfile
    - policy_preferences: anonymized in nsi_business service
    - all: marks identity as deleted (hard delete after cooling period)

    Note: Actual deletion of business data (calculation_history, policy_preferences)
    must be handled by nsi_business service which owns that data.
    """
    if not await verify_code(db, target, channel, code, "delete_data"):
        await increment_attempts(db, target, "delete_data")
        raise ValueError("验证码错误或已过期")

    result = await db.execute(
        select(IndividualProfile).where(IndividualProfile.identity_id == identity_id)
    )
    profile = result.scalar_one_or_none()
    deleted_items = []

    for category in categories:
        if category == "calculation_history":
            deleted_items.append("参保历史(由业务服务处理)")
        elif category == "assets":
            deleted_items.append("资产信息(由业务服务处理)")
        elif category == "preferences":
            deleted_items.append("偏好设置(由业务服务处理)")
        elif category == "ocr":
            deleted_items.append("OCR账单记录(由业务服务处理)")
        elif category == "calculation_logs":
            deleted_items.append("精算记录(由业务服务处理)")
        elif category == "profile_data":
            if profile:
                profile.phone_enc = None
                profile.email_enc = None
                profile.id_card_enc = None
                profile.real_name_enc = None
            deleted_items.append("个人资料(PII已匿名化)")
        elif category == "all":
            identity_result = await db.execute(select(Identity).where(Identity.id == identity_id))
            identity = identity_result.scalar_one()
            identity.status = "deleted"
            identity.deleted_at = datetime.now(timezone.utc)
            if profile:
                profile.phone_enc = None
                profile.email_enc = None
                profile.id_card_enc = None
                profile.real_name_enc = None
            deleted_items.append("全部个人信息(已匿名化)")

    await db.flush()

    log = ComplianceLog(
        identity_id=uuid.UUID(identity_id),
        action="data_delete",
        category=",".join(categories),
        details={"deleted_items": deleted_items},
        ip_address=ip_address,
    )
    db.add(log)
    await db.flush()

    return {
        "deleted": True,
        "categories": categories,
        "deleted_items": deleted_items,
        "message": f"已处理: {', '.join(deleted_items)}",
    }


async def export_personal_data(db: AsyncSession, identity_id: str) -> dict:
    identity_result = await db.execute(select(Identity).where(Identity.id == identity_id))
    identity = identity_result.scalar_one_or_none()

    profile_result = await db.execute(
        select(IndividualProfile).where(IndividualProfile.identity_id == identity_id)
    )
    profile = profile_result.scalar_one_or_none()

    profile_data = {}
    if profile:
        phone_plain = decrypt_pii(profile.phone_enc) if profile.phone_enc else None
        email_plain = decrypt_pii(profile.email_enc) if profile.email_enc else None
        real_name_plain = decrypt_pii(profile.real_name_enc) if profile.real_name_enc else None
        profile_data = {
            "phone": phone_plain,
            "email": email_plain,
            "email_verified": profile.email_verified,
            "real_name": real_name_plain,
        }

    data = {
        "identity": {
            "id": str(identity.id) if identity else None,
            "type": identity.identity_type if identity else None,
            "status": identity.status if identity else None,
            "auth_method": identity.auth_method if identity else None,
            "created_at": identity.created_at.isoformat() if identity else None,
        },
        "profile": profile_data,
        "payment_history": [],
        "assets": {},
        "preferences": {},
        "ocr_tasks": [],
        "calculation_logs": [],
    }

    log = ComplianceLog(
        identity_id=uuid.UUID(identity_id),
        action="data_export",
        details={"data_keys": list(data.keys())},
    )
    db.add(log)
    await db.flush()

    return {"data": data, "exported_at": datetime.now(timezone.utc).isoformat()}
