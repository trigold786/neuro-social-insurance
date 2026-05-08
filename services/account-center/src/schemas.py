from datetime import datetime
from typing import Optional, List
from pydantic import BaseModel, Field, ConfigDict, EmailStr
from uuid import UUID


class SendCodeRequest(BaseModel):
    target: str = Field(..., min_length=1)
    channel: str = Field("sms", pattern=r"^(sms|email)$")
    purpose: str = Field("register", pattern=r"^(register|change_password|delete_account|delete_data|forgot_password|bind_phone|bind_email)$")


class SendCodeResponse(BaseModel):
    task_id: str
    status: str
    message: str = "验证码已发送"


class SendSmsRequest(BaseModel):
    phone: str = Field(..., min_length=11, max_length=11, pattern=r'^1[3-9]\d{9}$')


class SendSmsResponse(BaseModel):
    task_id: str
    status: str
    message: str = "验证码已发送"


class LoginSmsRequest(BaseModel):
    phone: str = Field(..., min_length=11, max_length=11)
    code: str = Field(..., min_length=4, max_length=6)


class LoginPasswordRequest(BaseModel):
    target: str = Field(..., min_length=1)
    password: str = Field(..., min_length=1)
    channel: str = Field("sms", pattern=r"^(sms|email)$")


class RegisterRequest(BaseModel):
    target: str = Field(..., min_length=1)
    channel: str = Field("sms", pattern=r"^(sms|email)$")
    code: str = Field(..., min_length=4, max_length=6)
    password: Optional[str] = Field(None, min_length=8, max_length=128)


class ChangePasswordRequest(BaseModel):
    old_password: Optional[str] = None
    new_password: str = Field(..., min_length=8, max_length=128)
    code: str = Field(..., min_length=4, max_length=6)
    channel: str = Field("sms", pattern=r"^(sms|email)$")
    target: str = Field(..., min_length=1)


class ForgotPasswordRequest(BaseModel):
    target: str = Field(..., min_length=1)
    channel: str = Field("sms", pattern=r"^(sms|email)$")
    code: str = Field(..., min_length=4, max_length=6)
    new_password: str = Field(..., min_length=8, max_length=128)


class BindPhoneRequest(BaseModel):
    phone: str = Field(..., min_length=11, max_length=11, pattern=r'^1[3-9]\d{9}$')
    code: str = Field(..., min_length=4, max_length=6)


class BindEmailRequest(BaseModel):
    email: str = Field(..., min_length=3, max_length=256)
    code: str = Field(..., min_length=4, max_length=6)


class TokenResponse(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str = "bearer"
    expires_in: int = 900
    identity_type: str


class RefreshTokenRequest(BaseModel):
    refresh_token: str


class IdentityBase(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: UUID
    identity_type: str
    status: str
    auth_method: Optional[str] = None
    created_at: datetime


class IndividualProfileOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    phone: Optional[str] = None
    email: Optional[str] = None
    email_verified: bool = False
    real_name: Optional[str] = None


class EnterpriseProfileOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    org_name: str
    org_code: Optional[str] = None
    verified: bool = False


class UserMeOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    identity: IdentityBase
    profile: Optional[IndividualProfileOut] = None
    enterprises: List[EnterpriseProfileOut] = []


class UserMePatch(BaseModel):
    email: Optional[str] = None
    real_name: Optional[str] = None


class DeleteDataRequest(BaseModel):
    categories: List[str] = Field(..., min_length=1)
    channel: str = Field("sms", pattern=r"^(sms|email)$")
    target: str = Field(..., min_length=1)
    code: str = Field(..., min_length=4, max_length=6)


class DeleteAccountRequest(BaseModel):
    channel: str = Field("sms", pattern=r"^(sms|email)$")
    target: str = Field(..., min_length=1)
    code: str = Field(..., min_length=4, max_length=6)
    reason: Optional[str] = None


class OrgCreateRequest(BaseModel):
    org_name: str = Field(..., min_length=2, max_length=256)
    org_code: Optional[str] = None
    contact_phone: Optional[str] = None
    contact_email: Optional[str] = None


class OrgMemberOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    member_id: UUID
    user_identity_id: UUID
    role: str
    joined_at: datetime
    user_name: Optional[str] = None


class OrgInviteRequest(BaseModel):
    phone: str = Field(..., min_length=11, max_length=11)
    role: str = "member"


class OrgOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    identity_id: UUID
    org_name: str
    org_code: Optional[str] = None
    verified: bool = False
    member_count: int = 0
    created_at: datetime
