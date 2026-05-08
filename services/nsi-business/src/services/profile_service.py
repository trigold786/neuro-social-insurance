from datetime import datetime, timezone
from typing import Optional, List
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from uuid import UUID
from ..models import UserProfile
from ..schemas import ProfileCreateRequest, ProfilePatchRequest, ProfileOut, NextStep, ProfileCreateResponse

def _calc_completeness(profile: UserProfile) -> float:
    """计算档案完整度 0.0~1.0"""
    score = 0.0
    if profile.age: score += 0.15
    if profile.current_region: score += 0.15
    if profile.employment_type: score += 0.15
    if profile.payment_history and len(profile.payment_history) > 0: score += 0.20
    if profile.assets and len(profile.assets) > 0: score += 0.15
    if profile.preferences and len(profile.preferences) > 0: score += 0.20
    return min(1.0, score)

def _get_next_steps(profile: UserProfile) -> List[NextStep]:
    """根据缺失字段生成引导步骤"""
    steps = []
    if not profile.payment_history or len(profile.payment_history) == 0:
        steps.append(NextStep(field="payment_history", reason="补充参保历史可优化累计年限计算", priority=1))
    if not profile.assets or len(profile.assets) == 0:
        steps.append(NextStep(field="assets", reason="补充资产信息可生成更精准的三策略对比", priority=2))
    if not profile.preferences or len(profile.preferences) == 0:
        steps.append(NextStep(field="preferences", reason="补充风险偏好与月预算可优化IRR估算", priority=3))
    return steps

async def create_profile(db: AsyncSession, identity_id: str, req: ProfileCreateRequest) -> ProfileCreateResponse:
    """创建用户档案（漏斗Step1）"""
    profile = UserProfile(
        identity_id=UUID(identity_id),
        current_region=req.current_region,
        employment_type=req.employment_type,
        age=req.age,
    )
    db.add(profile)
    await db.flush()
    
    completeness = _calc_completeness(profile)
    next_steps = _get_next_steps(profile)
    
    return ProfileCreateResponse(
        profile_id=str(profile.id),
        next_steps=next_steps,
        completeness=completeness,
    )

async def get_profile_by_identity(db: AsyncSession, identity_id: str) -> Optional[ProfileOut]:
    """通过identity_id查询档案"""
    result = await db.execute(
        select(UserProfile).where(UserProfile.identity_id == UUID(identity_id))
    )
    profile = result.scalar_one_or_none()
    if not profile:
        return None
    return _to_profile_out(profile)

async def patch_profile(db: AsyncSession, identity_id: str, req: ProfilePatchRequest) -> ProfileOut:
    """增量更新档案"""
    result = await db.execute(
        select(UserProfile).where(UserProfile.identity_id == UUID(identity_id))
    )
    profile = result.scalar_one_or_none()
    if not profile:
        raise ValueError("Profile not found")
    
    if req.assets is not None:
        profile.assets = req.assets.model_dump(exclude_none=True)
    if req.preferences is not None:
        profile.preferences = req.preferences.model_dump(exclude_none=True)
    if req.payment_history is not None:
        profile.payment_history = [h.model_dump() for h in req.payment_history]
    if req.gender is not None:
        profile.gender = req.gender
    
    profile.updated_at = datetime.now(timezone.utc)
    await db.flush()
    
    return _to_profile_out(profile)

def _to_profile_out(profile: UserProfile) -> ProfileOut:
    return ProfileOut(
        profile_id=str(profile.id),
        identity_id=str(profile.identity_id),
        current_region=profile.current_region,
        employment_type=profile.employment_type,
        age=profile.age,
        gender=profile.gender,
        payment_history=profile.payment_history or [],
        assets=profile.assets or {},
        preferences=profile.preferences or {},
        completeness=_calc_completeness(profile),
        last_calc_at=profile.last_calc_at,
        created_at=profile.created_at,
    )
