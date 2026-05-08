package models

import (
	"fmt"
	"time"
)

type SandboxRequest struct {
	RegionCode     string  `json:"region_code" binding:"required"`
	Age            int     `json:"age" binding:"required,min=16,max=70"`
	EmploymentType string  `json:"employment_type" binding:"required,oneof=Flexible_Employment Corporate_Employee"`
	BaseSalary     int     `json:"base_salary" binding:"required,min=1000"`
	RetirementAge  int     `json:"retirement_age" binding:"required,min=50,max=75,gtfield=Age"`
	Strategy       string  `json:"strategy" binding:"required,oneof=conservative balanced aggressive"`
	YearsPaid      int     `json:"years_paid"`
	InflationRate  float64 `json:"inflation_rate"`
	ExpectedReturn float64 `json:"expected_return"`

	Gender                  string  `json:"gender"`
	BirthDate               string  `json:"birth_date"`
	CumulativeMonths        int     `json:"cumulative_months"`
	PersonalAccountBalance  float64 `json:"personal_account_balance"`
	AverageContributionIndex float64 `json:"average_contribution_index"`
	ContributionBase        int     `json:"contribution_base"`
	PriorYears              float64 `json:"prior_years"`
	LocalAvgSalary          float64 `json:"local_avg_salary"`
	PersonalAccountRate     float64 `json:"personal_account_rate"`
	IsTransitional          bool    `json:"is_transitional"`
}

type Cashflow struct {
	Year               int     `json:"year"`
	Age                int     `json:"age"`
	Outflow            float64 `json:"outflow"`
	Inflow             float64 `json:"inflow"`
	CumulativeInvested float64 `json:"cumulative_invested"`
	CumulativeBenefit  float64 `json:"cumulative_benefit"`
	PensionOutflow     float64 `json:"pension_outflow"`
	MedicalOutflow     float64 `json:"medical_outflow"`
	UnemploymentOutflow float64 `json:"unemployment_outflow"`
	HousingOutflow     float64 `json:"housing_outflow"`
	EmployerPensionOutflow float64 `json:"employer_pension_outflow"`
	EmployerMedicalOutflow float64 `json:"employer_medical_outflow"`
}

type CalcResult struct {
	Strategy               string     `json:"strategy"`
	RegionCode             string     `json:"region_code"`
	BaseSalary             int        `json:"base_salary"`
	RetirementAge          int        `json:"retirement_age"`
	TotalInvested          float64    `json:"total_invested"`
	TotalBenefit           float64    `json:"total_benefit"`
	IRR                    float64    `json:"irr"`
	BreakEvenAge           int        `json:"break_even_age"`
	MonthlyPensionEstimate float64    `json:"monthly_pension_estimate"`
	Cashflows              []Cashflow `json:"cashflows"`
	Warning                string     `json:"warning,omitempty"`
	UsedPolicies           []string   `json:"used_policies,omitempty"`
	IsFallback             bool       `json:"is_fallback,omitempty"`
	FallbackReason         string     `json:"fallback_reason,omitempty"`

	BasicPension           float64 `json:"basic_pension"`
	PersonalAccountPension float64 `json:"personal_account_pension"`
	TransitionalPension    float64 `json:"transitional_pension"`
	PaymentMonths          int     `json:"payment_months"`
	ContributionIndex      float64 `json:"contribution_index"`
	TotalMonthlyDeduction  float64 `json:"total_monthly_deduction"`
	MonthlyTakeHome       float64 `json:"monthly_take_home"`
}

// DeepPlanRequest 深度规划请求
type DeepPlanRequest struct {
	ProfileID  string          `json:"profile_id" binding:"required"`
	Scenarios  []PlanScenario  `json:"scenarios"`
	// User profile data for accurate calculation
	RegionCode               string  `json:"region_code"`
	Age                      int     `json:"age"`
	Gender                   string  `json:"gender"`
	EmploymentType           string  `json:"employment_type"`
	CumulativeMonths         int     `json:"cumulative_months"`
	PersonalAccountBalance   float64 `json:"personal_account_balance"`
	AverageContributionIndex float64 `json:"average_contribution_index"`
	IsTransitional           bool    `json:"is_transitional"`
	PriorYears               float64 `json:"prior_years"`
}

// PlanScenario 单个规划场景
type PlanScenario struct {
	Strategy      string `json:"strategy"`
	BaseSalary    int    `json:"base_salary"`
	RetirementAge int    `json:"retirement_age"`
}

// MatrixCacheKey 查表法缓存键
type MatrixCacheKey struct {
	RegionCode     string
	ApplicableGroup string
	Age            int
	BaseSalary     int
	RetirementAge  int
	Strategy       string
}

func (k MatrixCacheKey) String() string {
	return fmt.Sprintf("%s:%s:%d:%d:%d:%s", k.RegionCode, k.ApplicableGroup, k.Age, k.BaseSalary, k.RetirementAge, k.Strategy)
}

// ReportTask 异步报告任务
type ReportTask struct {
	TaskID      string    `json:"task_id"`
	Status      string    `json:"status"`
	ResultURL   string    `json:"result_url,omitempty"`
	CompletedAt time.Time `json:"completed_at,omitempty"`
}
