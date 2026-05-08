package services

import (
	"fmt"
	"log"
	"math"
	"time"

	"nsi-actuarial-engine/models"
)

type calcParams struct {
	avgWageGrowthRate   float64
	personalAccountRate float64
	lifeExpectancy      int
}

func defaultParams(strategy string) calcParams {
	switch strategy {
	case "conservative":
		return calcParams{avgWageGrowthRate: 0.02, personalAccountRate: 0.04, lifeExpectancy: 82}
	case "aggressive":
		return calcParams{avgWageGrowthRate: 0.05, personalAccountRate: 0.08, lifeExpectancy: 86}
	default:
		return calcParams{avgWageGrowthRate: 0.03, personalAccountRate: 0.065, lifeExpectancy: 84}
	}
}

type employmentInsuranceRates struct {
	personalPensionRate  float64
	personalMedicalRate  float64
	unemploymentRate     float64
	housingFundRate      float64
	employerPensionRate  float64
	employerMedicalRate float64
	workInjuryRate       float64
	maternityRate        float64
	governmentSubsidy    float64
}

func getEmploymentRates(empType string, regionData models.RegionRateData) employmentInsuranceRates {
	r := employmentInsuranceRates{}
	switch empType {
	case "Corporate_Employee":
		r.personalPensionRate = regionData.PersonalPensionRate
		r.personalMedicalRate = regionData.PersonalMedicalRate
		r.unemploymentRate = regionData.UnemploymentRate
		r.housingFundRate = regionData.HousingFundRate
		r.employerPensionRate = regionData.EmployerPensionRate
		r.employerMedicalRate = regionData.EmployerMedicalRate
		r.workInjuryRate = regionData.WorkInjuryRate
		r.maternityRate = regionData.MaternityRate
		r.governmentSubsidy = 0
	case "Flexible_Employment":
		r.personalPensionRate = regionData.EmployerPensionRate + regionData.PersonalPensionRate
		r.personalMedicalRate = regionData.EmployerMedicalRate + regionData.PersonalMedicalRate
		r.unemploymentRate = 0
		r.housingFundRate = regionData.HousingFundRate
		r.employerPensionRate = 0
		r.employerMedicalRate = 0
		r.workInjuryRate = 0
		r.maternityRate = 0
		r.governmentSubsidy = 0.3
	case "Urban_Rural_Residents":
		r.personalPensionRate = 0
		r.personalMedicalRate = 0
		r.unemploymentRate = 0
		r.housingFundRate = 0
		r.employerPensionRate = 0
		r.employerMedicalRate = 0
		r.workInjuryRate = 0
		r.maternityRate = 0
		r.governmentSubsidy = 0
	default:
		r.personalPensionRate = regionData.PersonalPensionRate
		r.personalMedicalRate = regionData.PersonalMedicalRate
		r.unemploymentRate = regionData.UnemploymentRate
		r.housingFundRate = regionData.HousingFundRate
		r.employerPensionRate = regionData.EmployerPensionRate
		r.employerMedicalRate = regionData.EmployerMedicalRate
		r.workInjuryRate = regionData.WorkInjuryRate
		r.maternityRate = regionData.MaternityRate
	}
	return r
}

func getCoveredInsurances(empType string) (covered, excluded []string) {
	excluded = []string{}
	switch empType {
	case "Corporate_Employee":
		covered = []string{"养老保险", "医疗保险", "失业保险", "工伤保险", "生育保险", "住房公积金"}
		excluded = []string{}
	case "Flexible_Employment":
		covered = []string{"养老保险", "医疗保险", "住房公积金"}
		excluded = []string{"失业保险", "工伤保险", "生育保险"}
	case "Urban_Rural_Residents":
		covered = []string{"城乡居民养老保险", "城乡居民医疗保险"}
		excluded = []string{"失业保险", "工伤保险", "生育保险", "住房公积金"}
	default:
		covered = []string{"养老保险", "医疗保险"}
	}
	return covered, excluded
}

func buildRecommendation(empType string, regionData models.RegionRateData, monthlyPension float64, totalInvested float64, yearsToRetire int) string {
	switch empType {
	case "Flexible_Employment":
		subsidyNote := ""
		if regionData.TransitionalCoeff >= 1.2 {
			subsidyNote = "该城市政府提供约30%缴费补贴，实际个人支出可降低。建议优先选择高档位缴费基数，累计15年以上可获得更好的养老金水平。"
		} else {
			subsidyNote = "建议了解当地政府是否提供缴费补贴政策，部分城市灵活就业人员可享受30%-50%的养老保险补贴。"
		}
		return fmt.Sprintf("灵活就业人员需全额自缴养老和医疗险，无失业/工伤/生育保障。%s", subsidyNote)
	case "Urban_Rural_Residents":
		return "城乡居民社保为兜底保障，缴费低（年缴1000-5000元）但待遇也较低。建议在经济条件改善后，可转为灵活就业参保以获得更高养老金。"
	default:
		return ""
	}
}

func applyDefaults(req *models.SandboxRequest) {
	regionData := models.GetRegionRateData(req.RegionCode)

	if req.Gender == "" {
		req.Gender = "male"
	}
	if req.CumulativeMonths == 0 && req.YearsPaid > 0 {
		req.CumulativeMonths = req.YearsPaid * 12
	}
	if req.AverageContributionIndex == 0 {
		req.AverageContributionIndex = 1.0
	}
	if req.ContributionBase == 0 {
		req.ContributionBase = req.BaseSalary
	}
	if req.LocalAvgSalary == 0 {
		req.LocalAvgSalary = regionData.LocalAvgSalary
	}
	if req.PersonalAccountRate == 0 {
		p := defaultParams(req.Strategy)
		req.PersonalAccountRate = p.personalAccountRate
	}
	if req.PersonalAccountBalance == 0 && req.CumulativeMonths > 0 {
		cb := float64(req.ContributionBase)
		monthlyPersonal := cb * regionData.PersonalPensionRate
		months := float64(req.CumulativeMonths)
		years := months / 12.0
		req.PersonalAccountBalance = monthlyPersonal * months * (1 + req.PersonalAccountRate*years/2.0)
	}

	cb := float64(req.ContributionBase)
	if cb < regionData.MinContributionBase {
		req.ContributionBase = int(regionData.MinContributionBase)
	}
	if cb > regionData.MaxContributionBase {
		req.ContributionBase = int(regionData.MaxContributionBase)
	}
}

func CalculateSandbox(req models.SandboxRequest) (models.CalcResult, error) {
	applyDefaults(&req)
	regionData := models.GetRegionRateData(req.RegionCode)

	params := defaultParams(req.Strategy)
	if req.InflationRate > 0 {
		params.avgWageGrowthRate = req.InflationRate
	}
	if req.ExpectedReturn > 0 {
		params.personalAccountRate = req.ExpectedReturn
	}
	if req.PersonalAccountRate > 0 {
		params.personalAccountRate = req.PersonalAccountRate
	}

	yearsToRetire := req.RetirementAge - req.Age
	if yearsToRetire <= 0 {
		return models.CalcResult{}, fmt.Errorf("retirement age must be greater than current age")
	}

	log.Printf("CalculateSandbox: region=%s(%s), gender=%s, age=%d, retire=%d, salary=%d, base=%d, idx=%.2f, cumMonths=%d, acctBal=%.0f",
		req.RegionCode, regionData.RegionName, req.Gender, req.Age, req.RetirementAge,
		req.BaseSalary, req.ContributionBase, req.AverageContributionIndex,
		req.CumulativeMonths, req.PersonalAccountBalance)

	localAvgAtRetirement := req.LocalAvgSalary * math.Pow(1+params.avgWageGrowthRate, float64(yearsToRetire))

	indexedMonthlySalary := req.AverageContributionIndex * localAvgAtRetirement

	totalMonths := req.CumulativeMonths + yearsToRetire*12
	totalContributionYears := float64(totalMonths) / 12.0

	basicPension := (localAvgAtRetirement + indexedMonthlySalary) / 2.0 * totalContributionYears * 0.01

	existingBalance := req.PersonalAccountBalance * math.Pow(1+params.personalAccountRate, float64(yearsToRetire))

	futureBalance := 0.0
	cb := float64(req.ContributionBase)
	for year := 1; year <= yearsToRetire; year++ {
		grownCB := cb * math.Pow(1+params.avgWageGrowthRate, float64(year-1))
		annualContribution := grownCB * 12.0 * empRates.personalPensionRate
		yearsOfInterest := float64(yearsToRetire - year)
		futureBalance += annualContribution * math.Pow(1+params.personalAccountRate, yearsOfInterest)
	}

	totalPersonalAccount := existingBalance + futureBalance

	paymentMonths := models.GetPaymentMonths(req.RetirementAge)
	personalPension := totalPersonalAccount / float64(paymentMonths)

	transitionalPension := 0.0
	if req.IsTransitional && req.PriorYears > 0 {
		transitionalPension = localAvgAtRetirement * req.AverageContributionIndex * req.PriorYears * regionData.TransitionalCoeff / 100.0
	}

	monthlyPension := basicPension + personalPension + transitionalPension

	empRates := getEmploymentRates(req.EmploymentType, regionData)
	totalPersonalRate := empRates.personalPensionRate + empRates.personalMedicalRate + empRates.unemploymentRate + empRates.housingFundRate
	totalEmployerRate := empRates.employerPensionRate + empRates.employerMedicalRate + empRates.workInjuryRate + empRates.maternityRate
	totalMonthlyDeduction := cb * totalPersonalRate
	monthlyTakeHome := float64(req.BaseSalary) - totalMonthlyDeduction

	totalInvested := 0.0
	for year := 0; year < yearsToRetire; year++ {
		grownCB := cb * math.Pow(1+params.avgWageGrowthRate, float64(year))
		totalInvested += grownCB * 12.0 * (totalPersonalRate + totalEmployerRate)
	}

	yearsReceive := params.lifeExpectancy - req.RetirementAge
	totalBenefit := monthlyPension * 12.0 * float64(yearsReceive)

	cashflows := make([]models.Cashflow, 0)
	cumInv := 0.0
	cumBen := 0.0
	breakEvenAge := -1
	currentYear := time.Now().Year()

	for age := req.Age; age <= params.lifeExpectancy; age++ {
		out := 0.0
		in := 0.0
		cf := models.Cashflow{
			Year: currentYear + (age - req.Age),
			Age:  age,
		}
		if age < req.RetirementAge {
			grownCB := cb * math.Pow(1+params.avgWageGrowthRate, float64(age-req.Age))
			personalAnnual := grownCB * 12.0 * totalPersonalRate
			employerAnnual := grownCB * 12.0 * totalEmployerRate
			annualOut := personalAnnual + employerAnnual
			out = annualOut
			cumInv += out
			cf.PensionOutflow = math.Round(grownCB * 12.0 * empRates.personalPensionRate)
			cf.MedicalOutflow = math.Round(grownCB * 12.0 * empRates.personalMedicalRate)
			cf.UnemploymentOutflow = math.Round(grownCB * 12.0 * empRates.unemploymentRate)
			cf.HousingOutflow = math.Round(grownCB * 12.0 * empRates.housingFundRate)
			cf.EmployerPensionOutflow = math.Round(grownCB * 12.0 * empRates.employerPensionRate)
			cf.EmployerMedicalOutflow = math.Round(grownCB * 12.0 * empRates.employerMedicalRate)
		} else {
			in = monthlyPension * 12.0
			cumBen += in
		}
		cf.Outflow = math.Round(out)
		cf.Inflow = math.Round(in)
		cf.CumulativeInvested = math.Round(cumInv)
		cf.CumulativeBenefit = math.Round(cumBen)
		cashflows = append(cashflows, cf)
		if breakEvenAge < 0 && cumBen >= cumInv && age >= req.RetirementAge {
			breakEvenAge = age
		}
	}
	if breakEvenAge < 0 {
		breakEvenAge = params.lifeExpectancy
	}

	irr := computeIRR(yearsToRetire, cb, totalPersonalRate, totalEmployerRate, params.avgWageGrowthRate, monthlyPension, yearsReceive)
	covered, excluded := getCoveredInsurances(req.EmploymentType)
	recommendation := buildRecommendation(req.EmploymentType, regionData, monthlyPension, totalInvested, yearsToRetire)
	policySource := fmt.Sprintf("数据来源：%s人力资源和社会保障局官网（2026年最新费率）", regionData.RegionName)

	return models.CalcResult{
		Strategy:               req.Strategy,
		RegionCode:             req.RegionCode,
		BaseSalary:             req.BaseSalary,
		RetirementAge:          req.RetirementAge,
		TotalInvested:          math.Round(totalInvested),
		TotalBenefit:           math.Round(totalBenefit),
		IRR:                    math.Round(irr*10000) / 10000,
		BreakEvenAge:           breakEvenAge,
		MonthlyPensionEstimate: math.Round(monthlyPension),
		Cashflows:              cashflows,
		UsedPolicies:           []string{req.RegionCode + "-2026-default"},
		BasicPension:           math.Round(basicPension*100) / 100,
		PersonalAccountPension: math.Round(personalPension*100) / 100,
		TransitionalPension:    math.Round(transitionalPension*100) / 100,
		PaymentMonths:          paymentMonths,
		ContributionIndex:      req.AverageContributionIndex,
		TotalMonthlyDeduction:  math.Round(totalMonthlyDeduction*100) / 100,
		MonthlyTakeHome:        math.Round(monthlyTakeHome*100) / 100,
		EmploymentType:         req.EmploymentType,
		CoveredInsurances:      covered,
		ExcludedInsurances:     excluded,
		GovernmentSubsidy:      empRates.governmentSubsidy,
		Recommendation:         recommendation,
		PolicySource:           policySource,
	}, nil
}

func computeIRR(yearsToRetire int, baseCB float64, personalRate float64, employerRate float64, wageGrowth float64, monthlyPension float64, yearsReceive int) float64 {
	totalYears := yearsToRetire + yearsReceive
	cashflows := make([]float64, totalYears)

	for y := 0; y < yearsToRetire; y++ {
		grownCB := baseCB * math.Pow(1+wageGrowth, float64(y))
		cashflows[y] = -grownCB * 12.0 * (personalRate + employerRate)
	}
	for y := yearsToRetire; y < totalYears; y++ {
		cashflows[y] = monthlyPension * 12.0
	}

	irr := 0.05
	for iter := 0; iter < 200; iter++ {
		npv := 0.0
		dnpv := 0.0
		for y := 0; y < len(cashflows); y++ {
			discFactor := math.Pow(1+irr, float64(y))
			npv += cashflows[y] / discFactor
			if y > 0 {
				dnpv -= float64(y) * cashflows[y] / (discFactor * (1 + irr))
			}
		}
		if math.Abs(dnpv) < 1e-12 {
			break
		}
		newIRR := irr - npv/dnpv
		if math.Abs(newIRR-irr) < 1e-9 {
			return newIRR
		}
		if newIRR < -0.99 {
			newIRR = -0.99
		}
		if newIRR > 10.0 {
			newIRR = 10.0
		}
		irr = newIRR
	}
	return irr
}

func CalculateDeepPlan(req models.DeepPlanRequest) ([]models.CalcResult, string, error) {
	results := make([]models.CalcResult, 0)

	// Use provided user profile data, with sensible defaults
	regionCode := req.RegionCode
	if regionCode == "" {
		regionCode = "310000"
	}
	age := req.Age
	if age <= 0 {
		age = 32
	}
	employmentType := req.EmploymentType
	if employmentType == "" {
		employmentType = "Flexible_Employment"
	}
	gender := req.Gender
	if gender == "" {
		gender = "male"
	}
	cumulativeMonths := req.CumulativeMonths
	personalAccountBalance := req.PersonalAccountBalance
	contributionIndex := req.AverageContributionIndex
	if contributionIndex <= 0 {
		contributionIndex = 1.0
	}
	isTransitional := req.IsTransitional
	priorYears := req.PriorYears

	scenarios := req.Scenarios
	if len(scenarios) == 0 {
		// Default 3-strategy comparison with user-provided or default salary
		defaultSalary := 8000
		if len(req.Scenarios) > 0 {
			defaultSalary = req.Scenarios[0].BaseSalary
		}
		scenarios = []models.PlanScenario{
			{Strategy: "conservative", BaseSalary: int(float64(defaultSalary) * 0.7), RetirementAge: 60},
			{Strategy: "balanced", BaseSalary: defaultSalary, RetirementAge: 62},
			{Strategy: "aggressive", BaseSalary: int(float64(defaultSalary) * 1.3), RetirementAge: 65},
		}
	}

	for _, sc := range scenarios {
		sandboxReq := models.SandboxRequest{
			RegionCode:               regionCode,
			Age:                      age,
			Gender:                   gender,
			EmploymentType:           employmentType,
			BaseSalary:               sc.BaseSalary,
			RetirementAge:            sc.RetirementAge,
			Strategy:                 sc.Strategy,
			CumulativeMonths:         cumulativeMonths,
			PersonalAccountBalance:   personalAccountBalance,
			AverageContributionIndex: contributionIndex,
			IsTransitional:           isTransitional,
			PriorYears:               priorYears,
		}
		result, err := CalculateSandbox(sandboxReq)
		if err != nil {
			continue
		}
		results = append(results, result)
	}

	recommendation := ""
	if len(results) > 0 {
		bestScore := -1.0
		for _, r := range results {
			// Score combines IRR, monthly pension, and break-even age
			score := r.IRR*100 + r.MonthlyPensionEstimate/1000
			if r.BreakEvenAge > 0 {
				score += float64(100-r.BreakEvenAge) * 0.1
			}
			if score > bestScore {
				bestScore = score
				recommendation = r.Strategy
			}
		}
	}
	if recommendation == "" {
		recommendation = "balanced"
	}

	return results, recommendation, nil
}

func CheckMatrixCache(key models.MatrixCacheKey) (*models.CalcResult, bool) {
	return nil, false
}
