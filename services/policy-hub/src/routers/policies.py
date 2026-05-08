from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from ..db import get_db
from typing import Union
from ..schemas import PolicyListResponse, PolicyDetailResponse, PolicySourceItem, FallbackResponse
from ..services import policy_service

router = APIRouter()

@router.get("", response_model=Union[PolicyListResponse, FallbackResponse])
async def list_policies(
    region_code: str,
    policy_type: Optional[str] = None,
    status: Optional[str] = "Verified",
    effective_date: Optional[str] = None,
    fields: Optional[str] = None,
    db: AsyncSession = Depends(get_db),
):
    """检索政策列表，支持字段裁剪与状态筛选"""
    try:
        result = await policy_service.list_policies(db, region_code, policy_type, status, effective_date)
        return result
    except Exception as e:
        import logging
        logging.getLogger(__name__).exception("Internal error")
        return FallbackResponse(
            warning="政策过渡期，当前返回预测区间",
            data=[],
            fallback_reason="Internal server error",
        )

@router.get("/{policy_id}", response_model=PolicyDetailResponse)
async def get_policy(
    policy_id: str,
    fields: Optional[str] = None,
    db: AsyncSession = Depends(get_db),
):
    """获取单条政策详情"""
    result = await policy_service.get_policy_detail(db, policy_id)
    if not result:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Policy not found")
    return result

@router.get("/{policy_id}/sources", response_model=list[PolicySourceItem])
async def get_policy_sources(
    policy_id: str,
    db: AsyncSession = Depends(get_db),
):
    """获取政策来源与置信度"""
    return await policy_service.get_policy_sources(db, policy_id)
