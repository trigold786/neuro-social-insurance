import uuid
from datetime import datetime, timezone
from sqlalchemy import Column, BigInteger, String, DateTime, Text, ForeignKey, Integer, ARRAY, Boolean, JSON
from sqlalchemy.dialects.postgresql import UUID
from .db import Base

class UserProfile(Base):
    __tablename__ = "user_profiles"
    id = Column(BigInteger, primary_key=True, autoincrement=True)
    identity_id = Column(UUID(as_uuid=True), nullable=False, index=True)
    current_region = Column(String(12), nullable=False)
    employment_type = Column(String(32), nullable=False)
    age = Column(Integer, nullable=True)
    gender = Column(String(8), nullable=True)
    payment_history = Column(JSON, default=list)
    assets = Column(JSON, default=dict)
    preferences = Column(JSON, default=dict)
    last_calc_cache = Column(JSON, nullable=True)
    last_calc_at = Column(DateTime(timezone=True), nullable=True)
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))
    updated_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))

class CalculationLog(Base):
    """Reserved for future use — stores calculation audit trail."""
    __tablename__ = "calculation_logs"
    id = Column(BigInteger, primary_key=True, autoincrement=True)
    identity_id = Column(UUID(as_uuid=True), nullable=False, index=True)
    profile_id = Column(BigInteger, ForeignKey("user_profiles.id", ondelete="SET NULL"), nullable=True)
    calc_type = Column(String(16), nullable=False)
    input_params = Column(JSON, nullable=False)
    output_result = Column(JSON, nullable=False)
    strategy = Column(String(16), nullable=True)
    used_policy_id = Column(ARRAY(String), default=list)
    is_fallback = Column(Boolean, default=False)
    response_ms = Column(Integer, nullable=True)
    client_type = Column(String(16), nullable=True)
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))

class ReportTask(Base):
    __tablename__ = "report_tasks"
    id = Column(BigInteger, primary_key=True, autoincrement=True)
    task_id = Column(UUID(as_uuid=True), unique=True, default=uuid.uuid4)
    identity_id = Column(UUID(as_uuid=True), nullable=False, index=True)
    profile_id = Column(BigInteger, ForeignKey("user_profiles.id", ondelete="CASCADE"), nullable=False)
    report_type = Column(String(32), nullable=False)
    status = Column(String(16), default="queued")
    params = Column(JSON, nullable=False)
    result_url = Column(String(512), nullable=True)
    notify_method = Column(String(16), default="websocket")
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))
    completed_at = Column(DateTime(timezone=True), nullable=True)

class SavedScenario(Base):
    __tablename__ = "saved_scenarios"
    id = Column(BigInteger, primary_key=True, autoincrement=True)
    scenario_id = Column(String(64), unique=True, nullable=False)
    identity_id = Column(UUID(as_uuid=True), nullable=False, index=True)
    profile_id = Column(BigInteger, ForeignKey("user_profiles.id", ondelete="CASCADE"), nullable=True)
    name = Column(String(128), nullable=False)
    description = Column(Text, nullable=True)
    input_params = Column(JSON, nullable=False)
    results = Column(JSON, nullable=False)
    tags = Column(ARRAY(String), default=list)
    is_bookmarked = Column(Boolean, default=False)
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))
    updated_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))
