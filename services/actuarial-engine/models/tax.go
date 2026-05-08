package models

// SpecialAdditionalDeduction 七项专项附加扣除
type SpecialAdditionalDeduction struct {
	ChildrenEducation       float64 `json:"children_education"`        // 子女教育 (每孩¥1000/月)
	ContinuingEducation     float64 `json:"continuing_education"`      // 继续教育 (学历¥400/月 或 职业资格¥3600/年)
	SeriousIllnessMedical  float64 `json:"serious_illness_medical"`   // 大病医疗 (上限¥80,000/年)
	HousingRent            float64 `json:"housing_rent"`               // 住房租金 (¥1500/1100/800/月 按城市级别)
	HousingLoanInterest    float64 `json:"housing_loan_interest"`      // 住房贷款利息 (¥1000/月)
	ElderlyCare            float64 `json:"elderly_care"`              // 赡养老人 (¥2000/月)
	ChildcareUnder3        float64 `json:"childcare_under_3"`          // 3岁以下婴幼儿照护 (每孩¥1000/月)
}

// TaxDeductionResult 税前扣除项结果
type TaxDeductionResult struct {
	SocialInsurance    float64 `json:"social_insurance"`     // 社保公积金扣除
	PollutionRemoval   float64 `json:"pollution_removal"`    // 排污费 (企业年金等)
	SpecialDeduction   float64 `json:"special_deduction"`    // 基本减除费用 ¥60,000/年
	AdditionalTotal    float64 `json:"additional_total"`     // 专项附加扣除合计
	TaxableIncome     float64 `json:"taxable_income"`       // 应纳税所得额
}

// MonthlyTaxResult 月度纳税结果
type MonthlyTaxResult struct {
	Month              int     `json:"month"`                // 月份 (1-12)
	CumulativeIncome  float64 `json:"cumulative_income"`    // 累计收入
	CumulativeDeduct  float64 `json:"cumulative_deduct"`   // 累计扣除
	CumulativeTaxable float64 `json:"cumulative_taxable"`   // 累计应纳税所得额
	CumulativeTax     float64 `json:"cumulative_tax"`       // 累计已扣税
	MonthlyTax         float64 `json:"monthly_tax"`          // 当月税额
	AfterTaxIncome    float64 `json:"after_tax_income"`     // 税后月收入
	EffectiveRate     float64 `json:"effective_rate"`       // 实际税率
}

// AnnualTaxResult 年度纳税结果
type AnnualTaxResult struct {
	AnnualIncome         float64            `json:"annual_income"`           // 年度总收入
	TotalDeductions     float64            `json:"total_deductions"`        // 扣除总计
	TaxableIncome       float64            `json:"taxable_income"`          // 应纳税所得额
	AnnualTax           float64            `json:"annual_tax"`              // 年度应纳税额
	AfterTaxIncome      float64            `json:"after_tax_income"`       // 税后年收入
	EffectiveRate       float64            `json:"effective_rate"`         // 实际有效税率
	MonthlyBreakdown    []MonthlyTaxResult `json:"monthly_breakdown"`       // 月度明细
	DeductionDetail    TaxDeductionResult  `json:"deduction_detail"`       // 扣除明细
}

// TaxRequest 税务计算请求
type TaxRequest struct {
	AnnualIncome    float64                    `json:"annual_income" binding:"required"`    // 年度税前总收入
	RegionCode      string                      `json:"region_code"`                         // 城市代码 (影响租房扣除)
	SocialInsurance float64                    `json:"social_insurance"`                    // 社保公积金年扣除总额
	EmploymentType  string                      `json:"employment_type"`                     // 就业类型
	SpecialDeductions SpecialAdditionalDeduction `json:"special_deductions"`                // 专项附加扣除
}

// TaxBracket 税率档次
type TaxBracket struct {
	Threshold float64 // 级距上限
	Rate      float64 // 税率
	QuickDeduct float64 // 速算扣除数
}
