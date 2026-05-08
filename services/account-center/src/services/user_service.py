from typing import Optional
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from uuid import UUID
from ..models import Identity, IndividualProfile
from ..utils.crypto import decrypt_pii
from ..schemas import UserMeOut, IndividualProfileOut, UserMePatch

async def get_user_me(db: AsyncSession, identity: Identity) -> UserMeOut:
    """获取当前用户完整信息"""
    profile_out = None
    if identity.identity_type == "individual":
        result = await db.execute(
            select(IndividualProfile).where(IndividualProfile.identity_id == identity.id)
        )
        profile = result.scalar_one_or_none()
        if profile:
            # 脱敏展示
            phone_plain = decrypt_pii(profile.phone_enc)
            phone_masked = phone_plain[:3] + "****" + phone_plain[-4:]
            profile_out = IndividualProfileOut(
                phone=phone_masked,
                email=decrypt_pii(profile.email_enc) if profile.email_enc else None,
                real_name=decrypt_pii(profile.real_name_enc) if profile.real_name_enc else None,
            )
    
    # TODO: 查询关联的企业列表
    return UserMeOut(
        identity=identity,
        profile=profile_out,
        enterprises=[],
    )

async def patch_user_profile(db: AsyncSession, identity: Identity, data: UserMePatch) -> dict:
    """更新用户档案"""
    if identity.identity_type != "individual":
        raise ValueError("Only individual profiles can be patched")
    
    result = await db.execute(
        select(IndividualProfile).where(IndividualProfile.identity_id == identity.id)
    )
    profile = result.scalar_one_or_none()
    if not profile:
        raise ValueError("Profile not found")
    
    # 加密更新
    if data.email is not None:
        from ..utils.crypto import encrypt_pii, hash_email
        profile.email_enc = encrypt_pii(data.email) if data.email else None
        profile.email_hash = hash_email(data.email) if data.email else None
        profile.email_verified = False
    if data.real_name is not None:
        from ..utils.crypto import encrypt_pii
        profile.real_name_enc = encrypt_pii(data.real_name) if data.real_name else None
    
    await db.commit()
    return {"updated": True}
