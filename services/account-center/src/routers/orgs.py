import uuid
from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from ..dependencies import get_db, get_current_identity
from ..models import Identity, OrgMember
from ..schemas import OrgCreateRequest, OrgOut, OrgMemberOut, OrgInviteRequest
from ..services import org_service

router = APIRouter()

@router.post("", response_model=OrgOut)
async def create_org(
    req: OrgCreateRequest,
    identity: Identity = Depends(get_current_identity),
    db: AsyncSession = Depends(get_db),
):
    """创建企业组织"""
    try:
        org = await org_service.create_organization(db, identity.id, req)
        await db.commit()
        return org
    except Exception as e:
        import logging
        logging.getLogger(__name__).exception("Internal error")
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Internal server error")

@router.get("/me", response_model=List[OrgOut])
async def list_my_orgs(
    identity: Identity = Depends(get_current_identity),
    db: AsyncSession = Depends(get_db),
):
    """获取我参与的所有企业"""
    return await org_service.list_my_organizations(db, identity.id)

@router.get("/{org_id}/members", response_model=List[OrgMemberOut])
async def list_members(
    org_id: uuid.UUID,
    identity: Identity = Depends(get_current_identity),
    db: AsyncSession = Depends(get_db),
):
    """获取企业成员列表"""
    member_check = await db.execute(
        select(OrgMember).where(
            OrgMember.org_identity_id == org_id,
            OrgMember.user_identity_id == identity.id,
        )
    )
    if not member_check.scalar_one_or_none():
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not a member of this organization")
    return await org_service.list_org_members(db, org_id)

@router.post("/{org_id}/members", response_model=OrgMemberOut)
async def invite_member(
    org_id: uuid.UUID,
    req: OrgInviteRequest,
    identity: Identity = Depends(get_current_identity),
    db: AsyncSession = Depends(get_db),
):
    """邀请成员加入企业"""
    member_check = await db.execute(
        select(OrgMember).where(
            OrgMember.org_identity_id == org_id,
            OrgMember.user_identity_id == identity.id,
        )
    )
    if not member_check.scalar_one_or_none():
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not a member of this organization")
    try:
        member = await org_service.invite_member(db, org_id, req)
        await db.commit()
        return member
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(e))
    except Exception as e:
        import logging
        logging.getLogger(__name__).exception("Internal error")
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Internal server error")
