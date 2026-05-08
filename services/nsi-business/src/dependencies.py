from typing import Optional, Dict, Any
import jwt
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from .config import settings

security = HTTPBearer(auto_error=False)

def verify_access_token(token: str) -> Optional[Dict[str, Any]]:
    """解码并校验 JWT Access Token"""
    try:
        payload = jwt.decode(token, settings.jwt_secret, algorithms=[settings.jwt_algorithm])
        if payload.get("token_type") != "access":
            return None
        return payload
    except jwt.ExpiredSignatureError:
        return None
    except jwt.InvalidTokenError:
        return None

async def get_current_identity_id(
    credentials: HTTPAuthorizationCredentials = Depends(security),
) -> str:
    """从 Authorization Header 提取并校验 JWT，返回 identity_id (UUID字符串)"""
    if not credentials:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Missing authorization header",
            headers={"WWW-Authenticate": "Bearer"},
        )

    payload = verify_access_token(credentials.credentials)
    if not payload:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired token",
            headers={"WWW-Authenticate": "Bearer"},
        )

    identity_id = payload.get("sub")
    if not identity_id:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid token payload",
            headers={"WWW-Authenticate": "Bearer"},
        )

    return identity_id

async def get_current_identity_id_optional(
    credentials: HTTPAuthorizationCredentials = Depends(security),
) -> Optional[str]:
    """可选认证，返回 identity_id 或 None"""
    if not credentials:
        return None
    try:
        payload = verify_access_token(credentials.credentials)
        if not payload:
            return None
        return payload.get("sub")
    except Exception:
        return None
