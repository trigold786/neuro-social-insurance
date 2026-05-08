from datetime import datetime, timezone
from typing import Optional, List, Dict, Any
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, or_
from cryptography.fernet import Fernet
import hashlib
import base64
from ..models import ConfigItem
from ..config import settings

def _derive_fernet_key(secret: str) -> bytes:
    return base64.urlsafe_b64encode(hashlib.sha256(secret.encode()).digest())

_fernet = Fernet(_derive_fernet_key(settings.encryption_key))

def _encrypt(value: str) -> str:
    return _fernet.encrypt(value.encode()).decode()

def _decrypt(value: str) -> str:
    return _fernet.decrypt(value.encode()).decode()

def _deserialize(value: str, value_type: str) -> Any:
    if value_type == "bool":
        return value.lower() in ("true", "1", "yes", "on")
    elif value_type == "int":
        return int(value)
    elif value_type == "float":
        return float(value)
    elif value_type == "json":
        import json
        return json.loads(value)
    return value

async def get_config(db: AsyncSession, key: str, default: Any = None) -> Any:
    result = await db.execute(select(ConfigItem).where(ConfigItem.config_key == key))
    item = result.scalar_one_or_none()
    if not item:
        return default
    if item.sensitive:
        return "********"
    return _deserialize(item.config_value, item.value_type)

async def get_config_raw(db: AsyncSession, key: str, default: Any = None) -> Any:
    result = await db.execute(select(ConfigItem).where(ConfigItem.config_key == key))
    item = result.scalar_one_or_none()
    if not item:
        return default
    value = _decrypt(item.config_value) if item.sensitive else item.config_value
    return _deserialize(value, item.value_type)

async def get_configs_by_category(db: AsyncSession, category: str) -> List[Dict[str, Any]]:
    """按分类批量获取配置"""
    result = await db.execute(
        select(ConfigItem).where(ConfigItem.category == category).order_by(ConfigItem.config_key)
    )
    items = result.scalars().all()
    return [_to_dict(item) for item in items]

async def list_all_configs(
    db: AsyncSession,
    category: Optional[str] = None,
    editable_only: bool = False,
    search: Optional[str] = None,
) -> List[Dict[str, Any]]:
    """列出所有配置（支持筛选）"""
    query = select(ConfigItem)
    if category:
        query = query.where(ConfigItem.category == category)
    if editable_only:
        query = query.where(ConfigItem.editable == True)
    if search:
        query = query.where(
            or_(
                ConfigItem.config_key.ilike(f"%{search}%"),
                ConfigItem.description.ilike(f"%{search}%"),
            )
        )
    query = query.order_by(ConfigItem.category, ConfigItem.config_key)
    result = await db.execute(query)
    items = result.scalars().all()
    return [_to_dict(item) for item in items]

async def upsert_config(
    db: AsyncSession,
    key: str,
    value: str,
    value_type: str = "string",
    category: str = "system",
    description: Optional[str] = None,
    editable: bool = True,
    sensitive: bool = False,
    updated_by: Optional[str] = None,
) -> Dict[str, Any]:
    """创建或更新配置项"""
    result = await db.execute(select(ConfigItem).where(ConfigItem.config_key == key))
    item = result.scalar_one_or_none()
    
    store_value = _encrypt(value) if sensitive else value
    
    if item:
        item.config_value = store_value
        item.value_type = value_type
        item.category = category
        item.description = description or item.description
        item.editable = editable
        item.sensitive = sensitive
        item.version += 1
        item.updated_at = datetime.now(timezone.utc)
        item.updated_by = updated_by
    else:
        item = ConfigItem(
            config_key=key,
            config_value=store_value,
            value_type=value_type,
            category=category,
            description=description,
            editable=editable,
            sensitive=sensitive,
            updated_by=updated_by,
        )
        db.add(item)
    
    await db.flush()
    return _to_dict(item)

async def delete_config(db: AsyncSession, key: str) -> bool:
    """删除配置项"""
    result = await db.execute(select(ConfigItem).where(ConfigItem.config_key == key))
    item = result.scalar_one_or_none()
    if not item:
        return False
    await db.delete(item)
    await db.flush()
    return True

async def get_categories(db: AsyncSession) -> List[str]:
    """获取所有配置分类"""
    result = await db.execute(select(ConfigItem.category).distinct().order_by(ConfigItem.category))
    return [row[0] for row in result.all()]

async def seed_defaults(db: AsyncSession) -> None:
    """初始化默认配置"""
    defaults = [
        # SMS 配置
        ("sms.aliyun_enabled", "false", "bool", "sms", "阿里云短信是否启用", True, False),
        ("sms.aliyun_access_key_id", "", "string", "sms", "阿里云AccessKey ID", True, True),
        ("sms.aliyun_access_key_secret", "", "secret", "sms", "阿里云AccessKey Secret", True, True),
        ("sms.aliyun_sign_name", "社保定制速算器", "string", "sms", "短信签名", True, False),
        ("sms.aliyun_template_code", "SMS_12345678", "string", "sms", "短信模板Code", True, False),
        ("sms.mock_code", "123456", "string", "sms", "开发环境Mock验证码", True, False),
        # Email 配置
        ("email.smtp_enabled", "false", "bool", "email", "SMTP邮件是否启用", True, False),
        ("email.smtp_host", "smtp.163.com", "string", "email", "SMTP服务器地址", True, False),
        ("email.smtp_port", "465", "int", "email", "SMTP端口", True, False),
        ("email.smtp_username", "", "string", "email", "SMTP用户名", True, True),
        ("email.smtp_password", "", "secret", "email", "SMTP密码/授权码", True, True),
        ("email.smtp_from", "noreply@nsi.example.com", "string", "email", "发件人地址", True, False),
        # 广告配置
        ("ads.enabled", "false", "bool", "ads", "广告变现是否启用", True, False),
        ("ads.provider", "none", "string", "ads", "广告提供商: none/gdt/pangle/ksad", True, False),
        ("ads.gdt_app_id", "", "string", "ads", "腾讯广点通App ID", True, True),
        ("ads.gdt_banner_id", "", "string", "ads", "广点通Banner广告位ID", True, True),
        ("ads.gdt_interstitial_id", "", "string", "ads", "广点通插屏广告位ID", True, True),
        ("ads.gdt_reward_video_id", "", "string", "ads", "广点通激励视频广告位ID", True, True),
        ("ads.pangle_app_id", "", "string", "ads", "穿山甲App ID", True, True),
        ("ads.pangle_code_id", "", "string", "ads", "穿山甲广告位ID", True, True),
        ("ads.show_banner", "true", "bool", "ads", "是否展示Banner广告", True, False),
        ("ads.show_interstitial", "true", "bool", "ads", "是否展示插屏广告", True, False),
        ("ads.show_reward_video", "false", "bool", "ads", "是否展示激励视频", True, False),
        ("ads.max_per_session", "5", "int", "ads", "单会话最大广告展示次数", True, False),
        ("ads.cooldown_seconds", "30", "int", "ads", "广告展示冷却时间(秒)", True, False),
        # 系统配置
        ("system.registration_open", "true", "bool", "system", "是否开放注册", True, False),
        ("system.maintenance_mode", "false", "bool", "system", "系统维护模式", True, False),
        ("system.maintenance_message", "系统维护中，请稍后再试", "string", "system", "维护模式提示语", True, False),
        ("system.api_rate_limit", "100", "int", "system", "API每分钟限流次数", True, False),
        ("system.privacy_policy_url", "", "string", "system", "隐私政策链接", True, False),
        ("system.user_agreement_url", "", "string", "system", "用户协议链接", True, False),
    ]
    
    for key, value, value_type, category, desc, editable, sensitive in defaults:
        result = await db.execute(select(ConfigItem).where(ConfigItem.config_key == key))
        if not result.scalar_one_or_none():
            store_value = _encrypt(value) if sensitive else value
            item = ConfigItem(
                config_key=key,
                config_value=store_value,
                value_type=value_type,
                category=category,
                description=desc,
                editable=editable,
                sensitive=sensitive,
            )
            db.add(item)
    await db.flush()

def _to_dict(item: ConfigItem) -> Dict[str, Any]:
    if item.sensitive:
        value = "********"
    else:
        value = item.config_value
    return {
        "id": item.id,
        "config_key": item.config_key,
        "config_value": value,
        "value_type": item.value_type,
        "category": item.category,
        "description": item.description,
        "editable": item.editable,
        "sensitive": item.sensitive,
        "version": item.version,
        "updated_at": item.updated_at.isoformat() if item.updated_at else None,
        "updated_by": item.updated_by,
    }
