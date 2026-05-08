from datetime import datetime, timezone
from sqlalchemy import Column, String, DateTime, Text, Boolean, Integer, JSON, BigInteger
from .db import Base

class ConfigItem(Base):
    __tablename__ = "config_items"
    id = Column(BigInteger, primary_key=True, autoincrement=True)
    config_key = Column(String(128), nullable=False, unique=True, index=True)
    config_value = Column(Text, nullable=False)
    value_type = Column(String(16), default="string")  # string / int / float / bool / json / secret
    category = Column(String(32), nullable=False, index=True)  # sms / email / ads / system / payment
    description = Column(Text, nullable=True)
    editable = Column(Boolean, default=True)
    sensitive = Column(Boolean, default=False)  # 敏感值加密存储
    version = Column(Integer, default=1)
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))
    updated_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))
    updated_by = Column(String(64), nullable=True)
