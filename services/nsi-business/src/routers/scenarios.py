from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, delete, func
from ..db import get_db
from ..models import SavedScenario
from ..schemas import ScenarioCreateRequest, ScenarioPatchRequest, ScenarioOut, ScenarioListResponse
from ..dependencies import get_current_identity_id

router = APIRouter()

@router.get("", response_model=ScenarioListResponse)
async def list_scenarios(
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    bookmarked_only: bool = False,
    tag: Optional[str] = None,
    db: AsyncSession = Depends(get_db),
    identity_id: str = Depends(get_current_identity_id),
):
    """列出用户保存的方案"""
    query = select(SavedScenario).where(SavedScenario.identity_id == identity_id)
    
    if bookmarked_only:
        query = query.where(SavedScenario.is_bookmarked == True)
    
    if tag:
        query = query.where(SavedScenario.tags.contains([tag]))
    
    query = query.order_by(SavedScenario.created_at.desc())
    
    total_result = await db.execute(select(func.count()).select_from(query.subquery()))
    total = total_result.scalar_one()
    
    offset = (page - 1) * page_size
    query = query.offset(offset).limit(page_size)
    
    result = await db.execute(query)
    items = result.scalars().all()
    
    return ScenarioListResponse(
        items=[ScenarioOut.model_validate(item) for item in items],
        total=total,
        page=page,
        page_size=page_size,
    )

@router.get("/{scenario_id}", response_model=ScenarioOut)
async def get_scenario(
    scenario_id: str,
    db: AsyncSession = Depends(get_db),
    identity_id: str = Depends(get_current_identity_id),
):
    """获取单个保存的方案详情"""
    result = await db.execute(
        select(SavedScenario).where(
            SavedScenario.scenario_id == scenario_id,
            SavedScenario.identity_id == identity_id,
        )
    )
    scenario = result.scalar_one_or_none()
    if not scenario:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Scenario not found")
    return ScenarioOut.model_validate(scenario)

@router.post("", response_model=ScenarioOut, status_code=status.HTTP_201_CREATED)
async def create_scenario(
    req: ScenarioCreateRequest,
    db: AsyncSession = Depends(get_db),
    identity_id: str = Depends(get_current_identity_id),
):
    """创建保存方案"""
    import uuid
    scenario = SavedScenario(
        scenario_id=f"scenario-{uuid.uuid4().hex[:12]}",
        identity_id=identity_id,
        name=req.name,
        description=req.description,
        input_params=req.input_params,
        results=req.results,
        tags=req.tags or [],
    )
    db.add(scenario)
    await db.commit()
    await db.refresh(scenario)
    return ScenarioOut.model_validate(scenario)

@router.patch("/{scenario_id}", response_model=ScenarioOut)
async def patch_scenario(
    scenario_id: str,
    req: ScenarioPatchRequest,
    db: AsyncSession = Depends(get_db),
    identity_id: str = Depends(get_current_identity_id),
):
    """更新保存的方案"""
    result = await db.execute(
        select(SavedScenario).where(
            SavedScenario.scenario_id == scenario_id,
            SavedScenario.identity_id == identity_id,
        )
    )
    scenario = result.scalar_one_or_none()
    if not scenario:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Scenario not found")
    
    update_data = req.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(scenario, field, value)
    
    await db.commit()
    await db.refresh(scenario)
    return ScenarioOut.model_validate(scenario)

@router.delete("/{scenario_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_scenario(
    scenario_id: str,
    db: AsyncSession = Depends(get_db),
    identity_id: str = Depends(get_current_identity_id),
):
    """删除保存的方案"""
    result = await db.execute(
        select(SavedScenario).where(
            SavedScenario.scenario_id == scenario_id,
            SavedScenario.identity_id == identity_id,
        )
    )
    scenario = result.scalar_one_or_none()
    if not scenario:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Scenario not found")
    
    await db.execute(
        delete(SavedScenario).where(SavedScenario.scenario_id == scenario_id)
    )
    await db.commit()
