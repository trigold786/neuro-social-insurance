import uuid
from datetime import datetime, timezone
from sqlalchemy import Column, BigInteger, String, DateTime, Text, ForeignKey, Integer, ARRAY, Numeric, Boolean, JSON, Date
from sqlalchemy.dialects.postgresql import UUID
from .db import Base

class Policy(Base):
    __tablename__ = "policies"
    id = Column(BigInteger, primary_key=True, autoincrement=True)
    policy_id = Column(String(64), unique=True, nullable=False)
    region_code = Column(String(12), nullable=False)
    city_name = Column(String(64), nullable=False)
    policy_type = Column(String(32), nullable=False)
    applicable_group = Column(ARRAY(String), default=list)
    status = Column(String(16), default="Draft")
    effective_date = Column(Date, nullable=False)
    publish_date = Column(Date, nullable=True)
    items = Column(JSON, default=dict)
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))
    updated_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))
    valid_until = Column(Date, nullable=True)
    version = Column(Integer, default=1)
    replaced_by = Column(BigInteger, ForeignKey("policies.id", ondelete="SET NULL"), nullable=True)

class PolicySource(Base):
    __tablename__ = "policy_sources"
    id = Column(BigInteger, primary_key=True, autoincrement=True)
    policy_id = Column(BigInteger, ForeignKey("policies.id", ondelete="CASCADE"), nullable=False)
    source_type = Column(String(16), nullable=False)
    source_url = Column(Text, nullable=True)
    source_title = Column(String(512), nullable=True)
    confidence = Column(Numeric(3,2), default=0.00)
    raw_content = Column(Text, nullable=True)
    extracted_json = Column(JSON, nullable=True)
    extracted_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))
    verified_by = Column(ARRAY(UUID(as_uuid=True)), default=list)
    crowd_count = Column(Integer, default=0)
    is_primary = Column(Boolean, default=False)

class OcrTask(Base):
    __tablename__ = "ocr_tasks"
    id = Column(BigInteger, primary_key=True, autoincrement=True)
    task_id = Column(UUID(as_uuid=True), unique=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), nullable=False)
    region_code = Column(String(12), nullable=False)
    image_path = Column(String(512), nullable=False)
    image_deleted = Column(Boolean, default=False)
    ocr_result = Column(JSON, nullable=True)
    confidence = Column(Numeric(3,2), nullable=True)
    status = Column(String(16), default="pending")
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))
    processed_at = Column(DateTime(timezone=True), nullable=True)
    delete_after = Column(DateTime(timezone=True), nullable=False)
