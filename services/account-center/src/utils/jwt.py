import uuid
from datetime import datetime, timedelta, timezone
from typing import Optional, Dict, Any
import jwt
from ..config import settings

def create_access_token(identity_id: str, identity_type: str, org_id: Optional[str] = None, roles: Optional[list] = None) -> str:
    """签发 Access Token (HS256, 开发环境简化)"""
    now = datetime.now(timezone.utc)
    payload = {
        "sub": str(identity_id),
        "type": identity_type,
        "org_id": str(org_id) if org_id else None,
        "roles": roles or [],
        "iat": now,
        "exp": now + timedelta(minutes=settings.access_token_expire_minutes),
        "scope": "c" if identity_type == "individual" else "b2b",
        "token_type": "access",
    }
    return jwt.encode(payload, settings.jwt_secret, algorithm=settings.jwt_algorithm)

def create_refresh_token(identity_id: str, identity_type: str = "individual", scope: Optional[str] = None) -> str:
    """签发 Refresh Token"""
    now = datetime.now(timezone.utc)
    payload = {
        "sub": str(identity_id),
        "type": identity_type,
        "scope": scope,
        "iat": now,
        "exp": now + timedelta(days=settings.refresh_token_expire_days),
        "token_type": "refresh",
    }
    return jwt.encode(payload, settings.jwt_secret, algorithm=settings.jwt_algorithm)

def decode_token(token: str) -> Dict[str, Any]:
    """解码并校验 JWT"""
    return jwt.decode(token, settings.jwt_secret, algorithms=[settings.jwt_algorithm])

def verify_access_token(token: str) -> Optional[Dict[str, Any]]:
    """验证 Access Token，返回 payload 或 None"""
    try:
        payload = decode_token(token)
        if payload.get("token_type") != "access":
            return None
        return payload
    except jwt.ExpiredSignatureError:
        return None
    except jwt.InvalidTokenError:
        return None

def verify_refresh_token(token: str) -> Optional[Dict[str, Any]]:
    """验证 Refresh Token，返回 payload 或 None"""
    try:
        payload = decode_token(token)
        if payload.get("token_type") != "refresh":
            return None
        return payload
    except jwt.ExpiredSignatureError:
        return None
    except jwt.InvalidTokenError:
        return None
