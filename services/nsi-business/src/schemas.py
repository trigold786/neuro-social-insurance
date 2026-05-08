from datetime import datetime
from typing import Optional, List, Dict, Any
from pydantic import BaseModel, Field, ConfigDict
from uuid import UUID

# ============================================================
# Profile Schemas
# ============================================================

class PaymentHistoryItem(BaseModel):
    region_code: str
    years: int = 0
    months: int = 0

class Assets(BaseModel):
    provident_fund: Optional[float] = None
    commercial_ins: Optional[float] = None
    investments: Optional[float] = None

class Preferences(BaseModel):
    risk_appetite: Optional[str] = None  # low / medium / high
    budget_monthly: Optional[float] = None
    expected_return: Optional[float] = None

class ProfileCreateRequest(BaseModel):
    current_region: str = Field(..., min_length=6, max_length=12)
    employment_type: str = Field(..., pattern=r'^(Flexible_Employment|Corporate_Employee)$')
    age: int = Field(..., ge=16, le=70)

class ProfilePatchRequest(BaseModel):
    assets: Optional[Assets] = None
    preferences: Optional[Preferences] = None
    payment_history: Optional[List[PaymentHistoryItem]] = None
    gender: Optional[str] = None

class ProfileOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    profile_id: str
    identity_id: str
    current_region: str
    employment_type: str
    age: int
    gender: Optional[str] = None
    payment_history: List[Dict[str, Any]] = []
    assets: Dict[str, Any] = {}
    preferences: Dict[str, Any] = {}
    completeness: float = 0.0
    last_calc_at: Optional[datetime] = None
    created_at: datetime

# ============================================================
# Calculation Schemas
# ============================================================

class SandboxCalcRequest(BaseModel):
    region_code: str
    age: int = Field(..., ge=16, le=70)
    employment_type: str
    base_salary: int = Field(..., ge=1000)
    retirement_age: int = Field(..., ge=50, le=75)
    strategy: str = Field(..., pattern=r'^(conservative|balanced|aggressive)$')
    years_paid: int = 0
    inflation_rate: Optional[float] = None
    expected_return: Optional[float] = None

class PlanScenarioItem(BaseModel):
    strategy: str = Field(..., pattern=r'^(conservative|balanced|aggressive)$')
    base_salary: int = Field(..., ge=1000)
    retirement_age: int = Field(..., ge=50, le=75)

class DeepPlanRequest(BaseModel):
    profile_id: str
    scenarios: Optional[List[PlanScenarioItem]] = None
    region_code: Optional[str] = None
    age: Optional[int] = Field(None, ge=16, le=70)
    gender: Optional[str] = None
    employment_type: Optional[str] = None
    cumulative_months: Optional[int] = Field(None, ge=0)
    personal_account_balance: Optional[float] = None
    average_contribution_index: Optional[float] = None
    is_transitional: Optional[bool] = False
    prior_years: Optional[float] = None

# ============================================================
# Tax Calculation Schemas
# ============================================================

class SpecialDeductions(BaseModel):
    children_education: float64 = 0
    continuing_education: float64 = 0
    serious_illness_medical: float64 = 0
    housing_rent: float64 = 0
    housing_loan_interest: float64 = 0
    elderly_care: float64 = 0
    childcare_under_3: float64 = 0

class TaxRequest(BaseModel):
    annual_income: float64 = Field(..., gt=0)
    region_code: Optional[str] = "310000"
    social_insurance: Optional[float64] = 0
    employment_type: Optional[str] = "Corporate_Employee"
    special_deductions: Optional[SpecialDeductions] = None

# ============================================================
# Report Schemas
# ============================================================

class ReportCreateRequest(BaseModel):
    profile_id: str
    report_type: str = Field(..., pattern=r'^(standard|macro_simulation)$')
    scenarios: Optional[List[str]] = None

class ReportStatusOut(BaseModel):
    task_id: str
    status: str
    result_url: Optional[str] = None
    completed_at: Optional[datetime] = None
    estimated_seconds: int = 15

# ============================================================
# Step Guidance
# ============================================================

class NextStep(BaseModel):
    field: str
    reason: str
    priority: int

class ProfileCreateResponse(BaseModel):
    profile_id: str
    next_steps: List[NextStep]
    completeness: float

# ============================================================
# Saved Scenario Schemas
# ============================================================

class ScenarioCreateRequest(BaseModel):
    name: str = Field(..., min_length=1, max_length=128)
    description: Optional[str] = None
    input_params: Dict[str, Any]
    results: List[Dict[str, Any]]
    tags: Optional[List[str]] = None

class ScenarioPatchRequest(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    is_bookmarked: Optional[bool] = None
    tags: Optional[List[str]] = None

class ScenarioOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    scenario_id: str
    name: str
    description: Optional[str] = None
    input_params: Dict[str, Any]
    results: List[Dict[str, Any]]
    tags: List[str] = []
    is_bookmarked: bool = False
    created_at: datetime
    updated_at: datetime

class ScenarioListResponse(BaseModel):
    items: List[ScenarioOut]
    total: int
    page: int
    page_size: int
