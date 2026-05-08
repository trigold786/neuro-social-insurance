import uuid
from datetime import datetime, timezone
from sqlalchemy import Column, String, DateTime, Text, ForeignKey, UniqueConstraint, JSON, ARRAY, Integer, Boolean, BigInteger
from sqlalchemy.dialects.postgresql import UUID, BYTEA, INET
from .db import Base

class Identity(Base):
    __tablename__ = "identities"
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    identity_type = Column(String(16), nullable=False)
    status = Column(String(16), default="active")
    auth_method = Column(String(16), default="sms")
    password_hash = Column(Text, nullable=True)
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))
    updated_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))
    deleted_at = Column(DateTime(timezone=True), nullable=True)

class IndividualProfile(Base):
    __tablename__ = "individual_profiles"
    identity_id = Column(UUID(as_uuid=True), ForeignKey("identities.id", ondelete="CASCADE"), primary_key=True)
    phone_hash = Column(String(64), nullable=True, unique=True)
    phone_enc = Column(BYTEA, nullable=True)
    email_hash = Column(String(64), nullable=True, unique=True)
    email_enc = Column(BYTEA, nullable=True)
    email_verified = Column(Boolean, default=False)
    id_card_enc = Column(BYTEA, nullable=True)
    real_name_enc = Column(BYTEA, nullable=True)
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))

class EnterpriseProfile(Base):
    __tablename__ = "enterprise_profiles"
    identity_id = Column(UUID(as_uuid=True), ForeignKey("identities.id", ondelete="CASCADE"), primary_key=True)
    org_name = Column(String(256), nullable=False)
    org_code = Column(String(64), unique=True, nullable=True)
    tax_id = Column(String(64), nullable=True)
    license_image_url = Column(Text, nullable=True)
    legal_person_name_enc = Column(BYTEA, nullable=True)
    contact_phone_enc = Column(BYTEA, nullable=True)
    contact_email_enc = Column(BYTEA, nullable=True)
    verified_at = Column(DateTime(timezone=True), nullable=True)
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))

class OrgMember(Base):
    __tablename__ = "org_members"
    __table_args__ = (UniqueConstraint("org_identity_id", "user_identity_id", name="uq_org_user"),)
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    org_identity_id = Column(UUID(as_uuid=True), ForeignKey("identities.id", ondelete="CASCADE"), nullable=False)
    user_identity_id = Column(UUID(as_uuid=True), ForeignKey("identities.id", ondelete="CASCADE"), nullable=False)
    role = Column(String(32), default="member")
    permissions = Column(JSON, default=dict)
    joined_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))

class Role(Base):
    __tablename__ = "roles"
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    role_code = Column(String(32), unique=True, nullable=False)
    role_name = Column(String(64), nullable=False)
    permissions = Column(ARRAY(String), default=list)
    scope = Column(String(16), default="platform")
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))

# ============================================================
# V1.0.2 新增模型
# ============================================================

class VerificationCode(Base):
    __tablename__ = "verification_codes"
    id = Column(BigInteger, primary_key=True, autoincrement=True)
    target = Column(String(128), nullable=False)
    channel = Column(String(8), nullable=False)  # sms / email
    code_hash = Column(String(64), nullable=False)
    purpose = Column(String(32), nullable=False)  # register / change_password / delete_account / delete_data
    attempts = Column(Integer, default=0)
    max_attempts = Column(Integer, default=5)
    expires_at = Column(DateTime(timezone=True), nullable=False)
    used_at = Column(DateTime(timezone=True), nullable=True)
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))

class AccountDeletionRequest(Base):
    __tablename__ = "account_deletion_requests"
    id = Column(BigInteger, primary_key=True, autoincrement=True)
    identity_id = Column(UUID(as_uuid=True), ForeignKey("identities.id", ondelete="CASCADE"), nullable=False)
    status = Column(String(16), default="pending")  # pending / completed / cancelled
    requested_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))
    scheduled_deletion_at = Column(DateTime(timezone=True), nullable=False)
    completed_at = Column(DateTime(timezone=True), nullable=True)
    cancelled_at = Column(DateTime(timezone=True), nullable=True)
    verification_method = Column(String(8), nullable=True)  # sms / email
    reason = Column(Text, nullable=True)

class ComplianceLog(Base):
    __tablename__ = "compliance_logs"
    id = Column(BigInteger, primary_key=True, autoincrement=True)
    identity_id = Column(UUID(as_uuid=True), nullable=True)
    action = Column(String(32), nullable=False)  # data_delete / account_delete / data_export
    category = Column(String(32), nullable=True)  # payment_history / assets / preferences / ocr / all
    details = Column(JSON, nullable=True)
    ip_address = Column(INET, nullable=True)
    request_id = Column(UUID(as_uuid=True), nullable=True)
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))
