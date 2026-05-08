import hmac
from typing import Optional, List
from pydantic import BaseModel, Field
from fastapi import APIRouter, Depends, HTTPException, status, Header
from sqlalchemy.ext.asyncio import AsyncSession
from ..db import get_db
from ..services import config_service
from ..config import settings

router = APIRouter()

class ConfigUpsertRequest(BaseModel):
    config_value: str = Field(default="", description="配置值")
    value_type: str = Field(default="string", description="值类型: string, number, json, bool")
    category: str = Field(default="system", description="配置分类")
    description: Optional[str] = Field(default=None, description="配置说明")
    editable: bool = Field(default=True, description="是否可编辑")
    sensitive: bool = Field(default=False, description="是否敏感（脱敏展示）")

def _verify_admin_token(x_admin_token: Optional[str] = Header(None)):
    """管理后台调用校验"""
    if not hmac.compare_digest(x_admin_token or "", settings.admin_token):
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Invalid admin token")
    return True

@router.get("/categories")
async def list_categories(db: AsyncSession = Depends(get_db)):
    """获取所有配置分类"""
    return {"data": await config_service.get_categories(db)}

@router.get("")
async def list_configs(
    category: Optional[str] = None,
    editable_only: bool = False,
    search: Optional[str] = None,
    db: AsyncSession = Depends(get_db),
    _: bool = Depends(_verify_admin_token),
):
    """列出所有配置项（管理后台用）"""
    return {"data": await config_service.list_all_configs(db, category, editable_only, search)}

@router.get("/{key}")
async def get_config(
    key: str,
    db: AsyncSession = Depends(get_db),
):
    """获取单个配置值（服务间调用，无需admin token）"""
    value = await config_service.get_config(db, key)
    if value is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Config not found")
    return {"config_key": key, "config_value": value}

@router.get("/category/{category}")
async def get_by_category(
    category: str,
    db: AsyncSession = Depends(get_db),
):
    """按分类批量获取配置（服务间调用）"""
    return {"data": await config_service.get_configs_by_category(db, category)}

@router.put("/{key}")
async def update_config(
    key: str,
    body: ConfigUpsertRequest,
    db: AsyncSession = Depends(get_db),
    _: bool = Depends(_verify_admin_token),
    x_updated_by: Optional[str] = Header(None),
):
    """更新或创建配置项"""
    result = await config_service.upsert_config(
        db,
        key=key,
        value=body.config_value,
        value_type=body.value_type,
        category=body.category,
        description=body.description,
        editable=body.editable,
        sensitive=body.sensitive,
        updated_by=x_updated_by or "admin",
    )
    await db.commit()
    return result

@router.delete("/{key}")
async def delete_config(
    key: str,
    db: AsyncSession = Depends(get_db),
    _: bool = Depends(_verify_admin_token),
):
    """删除配置项"""
    success = await config_service.delete_config(db, key)
    await db.commit()
    if not success:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Config not found")
    return {"deleted": True}
