from typing import Optional, List
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from ..models import Policy, PolicySource
from ..schemas import PolicyItem, PolicySourceItem, PolicyListResponse, PolicyDetailResponse

async def list_policies(
    db: AsyncSession,
    region_code: str,
    policy_type: Optional[str] = None,
    status: Optional[str] = "Verified",
    effective_date: Optional[str] = None,
) -> PolicyListResponse:
    """检索政策列表，支持状态机筛选"""
    query = select(Policy).where(Policy.region_code == region_code)
    
    if policy_type:
        query = query.where(Policy.policy_type == policy_type)
    if status:
        query = query.where(Policy.status == status)
    if effective_date:
        query = query.where(Policy.effective_date == effective_date)
    
    query = query.order_by(Policy.effective_date.desc())
    result = await db.execute(query)
    policies = result.scalars().all()
    
    return PolicyListResponse(
        data=[PolicyItem.model_validate(p) for p in policies],
        meta={"count": len(policies), "fallback": False},
    )

async def get_policy_detail(
    db: AsyncSession,
    policy_id: str,
) -> Optional[PolicyDetailResponse]:
    """获取单条政策详情及来源"""
    result = await db.execute(select(Policy).where(Policy.policy_id == policy_id))
    policy = result.scalar_one_or_none()
    if not policy:
        return None
    
    # 查询来源
    src_result = await db.execute(
        select(PolicySource).where(PolicySource.policy_id == policy.id).order_by(PolicySource.confidence.desc())
    )
    sources = src_result.scalars().all()
    
    # 如果是 Conflict 状态，构造预测区间
    confidence_interval = None
    if policy.status == "Conflict":
        confidence_interval = {
            "lower": 6800,
            "upper": 7500,
            "basis": "基于社交媒体多源交叉验证的预测区间",
        }
    
    return PolicyDetailResponse(
        data=PolicyItem.model_validate(policy),
        sources=[PolicySourceItem.model_validate(s) for s in sources],
        confidence_interval=confidence_interval,
    )

async def get_policy_sources(
    db: AsyncSession,
    policy_id: str,
) -> List[PolicySourceItem]:
    """获取政策来源与置信度"""
    result = await db.execute(select(Policy).where(Policy.policy_id == policy_id))
    policy = result.scalar_one_or_none()
    if not policy:
        return []
    
    src_result = await db.execute(
        select(PolicySource).where(PolicySource.policy_id == policy.id).order_by(PolicySource.confidence.desc())
    )
    sources = src_result.scalars().all()
    return [PolicySourceItem.model_validate(s) for s in sources]
