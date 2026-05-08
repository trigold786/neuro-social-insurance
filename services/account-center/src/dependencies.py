from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from .db import get_db as _get_db
from .utils.jwt import verify_access_token
from .models import Identity

security = HTTPBearer(auto_error=False)

async def get_db():
    async for session in _get_db():
        yield session

async def get_current_identity(
    credentials: HTTPAuthorizationCredentials = Depends(security),
    db: AsyncSession = Depends(get_db),
) -> Identity:
    """从 Authorization Header 提取并校验 JWT，返回 Identity 对象"""
    if not credentials:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Missing authorization header")
    
    payload = verify_access_token(credentials.credentials)
    if not payload:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid or expired token")
    
    identity_id = payload.get("sub")
    if not identity_id:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid token payload")
    
    result = await db.execute(select(Identity).where(Identity.id == identity_id))
    identity = result.scalar_one_or_none()
    if not identity or identity.status != "active":
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Identity not found or inactive")
    
    return identity

async def get_current_identity_optional(
    credentials: HTTPAuthorizationCredentials = Depends(security),
    db: AsyncSession = Depends(get_db),
) -> Identity | None:
    """可选认证，未登录返回 None"""
    if not credentials:
        return None
    try:
        payload = verify_access_token(credentials.credentials)
        if not payload:
            return None
        identity_id = payload.get("sub")
        result = await db.execute(select(Identity).where(Identity.id == identity_id))
        return result.scalar_one_or_none()
    except Exception:
        return None
