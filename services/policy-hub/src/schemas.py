from datetime import date, datetime
from typing import Optional, List, Dict, Any
from pydantic import BaseModel, Field, ConfigDict

class PolicyItem(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    policy_id: str
    region_code: str
    city_name: str
    policy_type: str
    applicable_group: List[str] = []
    status: str
    effective_date: date
    items: Dict[str, Any]
    created_at: datetime
    updated_at: datetime

class PolicySourceItem(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    source_type: str
    source_url: Optional[str] = None
    source_title: Optional[str] = None
    confidence: float
    crowd_count: int = 0
    is_primary: bool = False

class PolicyListResponse(BaseModel):
    data: List[PolicyItem]
    meta: Dict[str, Any] = {}

class PolicyDetailResponse(BaseModel):
    data: PolicyItem
    sources: List[PolicySourceItem] = []
    confidence_interval: Optional[Dict[str, Any]] = None

class OcrUploadResponse(BaseModel):
    task_id: str
    status: str
    delete_after: datetime
    message: str = "账单已上传，正在识别"

class FallbackResponse(BaseModel):
    warning: str
    data: List[PolicyItem]
    fallback_reason: str = "核心引擎超时，已切换至本地缓存"
