import uuid
from datetime import datetime, timezone
from typing import List
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func
from ..models import Identity, EnterpriseProfile, OrgMember, IndividualProfile
from ..utils.crypto import encrypt_pii
from ..schemas import OrgCreateRequest, OrgOut, OrgMemberOut, OrgInviteRequest

async def create_organization(db: AsyncSession, owner_identity_id: uuid.UUID, data: OrgCreateRequest) -> OrgOut:
    """创建企业组织"""
    # 创建企业 Identity
    org_identity = Identity(
        id=uuid.uuid4(),
        identity_type="enterprise",
        status="active",
    )
    db.add(org_identity)
    await db.flush()
    
    # 创建企业档案
    profile = EnterpriseProfile(
        identity_id=org_identity.id,
        org_name=data.org_name,
        org_code=data.org_code,
        contact_phone_enc=encrypt_pii(data.contact_phone) if data.contact_phone else None,
        contact_email_enc=encrypt_pii(data.contact_email) if data.contact_email else None,
    )
    db.add(profile)
    
    # 创建拥有者成员关系
    member = OrgMember(
        id=uuid.uuid4(),
        org_identity_id=org_identity.id,
        user_identity_id=owner_identity_id,
        role="owner",
    )
    db.add(member)
    await db.flush()
    
    return OrgOut(
        identity_id=org_identity.id,
        org_name=data.org_name,
        org_code=data.org_code,
        verified=False,
        member_count=1,
        created_at=datetime.now(timezone.utc),
    )

async def list_my_organizations(db: AsyncSession, user_identity_id: uuid.UUID) -> List[OrgOut]:
    """列出我参与的所有企业"""
    result = await db.execute(
        select(OrgMember, EnterpriseProfile)
        .join(EnterpriseProfile, OrgMember.org_identity_id == EnterpriseProfile.identity_id)
        .where(OrgMember.user_identity_id == user_identity_id)
    )
    rows = result.all()
    orgs = []
    for member, profile in rows:
        count_result = await db.execute(
            select(func.count()).where(OrgMember.org_identity_id == profile.identity_id)
        )
        count = count_result.scalar()
        orgs.append(OrgOut(
            identity_id=profile.identity_id,
            org_name=profile.org_name,
            org_code=profile.org_code,
            verified=profile.verified_at is not None,
            member_count=count,
            created_at=profile.created_at,
        ))
    return orgs

async def list_org_members(db: AsyncSession, org_identity_id: uuid.UUID) -> List[OrgMemberOut]:
    """列出企业成员"""
    result = await db.execute(
        select(OrgMember).where(OrgMember.org_identity_id == org_identity_id)
    )
    members = result.scalars().all()
    return [
        OrgMemberOut(
            member_id=m.id,
            user_identity_id=m.user_identity_id,
            role=m.role,
            joined_at=m.joined_at,
        )
        for m in members
    ]

async def invite_member(db: AsyncSession, org_identity_id: uuid.UUID, data: OrgInviteRequest) -> OrgMemberOut:
    """邀请成员：通过手机号查找已注册用户 identity"""
    from ..utils.crypto import hash_phone

    phone_hash = hash_phone(data.phone)
    result = await db.execute(
        select(IndividualProfile).where(IndividualProfile.phone_hash == phone_hash)
    )
    profile = result.scalar_one_or_none()

    if profile is not None:
        user_identity_id = profile.identity_id
    else:
        raise ValueError("User not found. They must register first.")

    existing = await db.execute(
        select(OrgMember).where(
            OrgMember.org_identity_id == org_identity_id,
            OrgMember.user_identity_id == user_identity_id,
        )
    )
    if existing.scalar_one_or_none() is not None:
        raise ValueError("User is already a member of this organization")

    member = OrgMember(
        id=uuid.uuid4(),
        org_identity_id=org_identity_id,
        user_identity_id=user_identity_id,
        role=data.role,
    )
    db.add(member)
    await db.flush()

    return OrgMemberOut(
        member_id=member.id,
        user_identity_id=member.user_identity_id,
        role=member.role,
        joined_at=member.joined_at,
    )
