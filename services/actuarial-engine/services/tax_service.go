package services

import (
	"math"
	"nsi-actuarial-engine/models"
)

var taxBrackets = []models.TaxBracket{
	{Threshold: 36000, Rate: 0.03, QuickDeduct: 0},
	{Threshold: 144000, Rate: 0.10, QuickDeduct: 2520},
	{Threshold: 300000, Rate: 0.20, QuickDeduct: 16920},
	{Threshold: 420000, Rate: 0.25, QuickDeduct: 31920},
	{Threshold: 660000, Rate: 0.30, QuickDeduct: 52920},
	{Threshold: 960000, Rate: 0.35, QuickDeduct: 85920},
	{Threshold: math.MaxFloat64, Rate: 0.45, QuickDeduct: 181920},
}

func CalculateTax(req models.TaxRequest) models.AnnualTaxResult {
	monthlyIncome := req.AnnualIncome / 12.0
	socialInsuranceMonthly := req.SocialInsurance / 12.0
	basicDeductionMonthly := 5000.0

	additionalMonthly := calculateAdditionalDeduction(req)
	monthlyDeduct := socialInsuranceMonthly + basicDeductionMonthly + additionalMonthly

	monthlyBreakdown := make([]models.MonthlyTaxResult, 12)
	var cumulativeIncome, cumulativeDeduct, cumulativeTaxable, cumulativeTax float64

	for m := 1; m <= 12; m++ {
		cumulativeIncome += monthlyIncome
		cumulativeDeduct += monthlyDeduct
		cumulativeTaxable = math.Max(0, cumulativeIncome-cumulativeDeduct)

		cumulativeTax = calculateCumulativeTax(cumulativeTaxable)
		monthlyTax := cumulativeTax - (m > 1 ? calculateCumulativeTax(cumulativeIncome-cumulativeDeduct-((float64(m-1))*monthlyDeduct)) : 0)
		if monthlyTax < 0 {
			monthlyTax = 0
		}

		afterTaxIncome := monthlyIncome - monthlyTax - socialInsuranceMonthly
		effectiveRate := 0.0
		if monthlyIncome > 0 {
			effectiveRate = monthlyTax / monthlyIncome
		}

		monthlyBreakdown[m-1] = models.MonthlyTaxResult{
			Month:             m,
			CumulativeIncome:  math.Round(cumulativeIncome*100) / 100,
			CumulativeDeduct:  math.Round(cumulativeDeduct*100) / 100,
			CumulativeTaxable: math.Round(cumulativeTaxable*100) / 100,
			CumulativeTax:     math.Round(cumulativeTax*100) / 100,
			MonthlyTax:         math.Round(monthlyTax*100) / 100,
			AfterTaxIncome:    math.Round(afterTaxIncome*100) / 100,
			EffectiveRate:     math.Round(effectiveRate*10000) / 10000,
		}
	}

	totalDeductions := req.SocialInsurance + 60000 + additionalMonthly*12
	taxableIncome := math.Max(0, req.AnnualIncome-totalDeductions)
	annualTax := calculateCumulativeTax(taxableIncome)
	afterTaxIncome := req.AnnualIncome - annualTax - req.SocialInsurance
	effectiveRate := 0.0
	if req.AnnualIncome > 0 {
		effectiveRate = annualTax / req.AnnualIncome
	}

	return models.AnnualTaxResult{
		AnnualIncome:     math.Round(req.AnnualIncome*100) / 100,
		TotalDeductions: math.Round(totalDeductions*100) / 100,
		TaxableIncome:   math.Round(taxableIncome*100) / 100,
		AnnualTax:       math.Round(annualTax*100) / 100,
		AfterTaxIncome:  math.Round(afterTaxIncome*100) / 100,
		EffectiveRate:   math.Round(effectiveRate*10000) / 10000,
		MonthlyBreakdown: monthlyBreakdown,
		DeductionDetail: models.TaxDeductionResult{
			SocialInsurance:  math.Round(req.SocialInsurance*100) / 100,
			PollutionRemoval: 0,
			SpecialDeduction: 60000,
			AdditionalTotal:  math.Round(additionalMonthly*12*100) / 100,
			TaxableIncome:   math.Round(taxableIncome*100) / 100,
		},
	}
}

func calculateAdditionalDeduction(req models.TaxRequest) float64 {
	d := req.SpecialDeductions
	total := d.ChildrenEducation + d.ContinuingEducation + d.SeriousIllnessMedical/12 +
		d.HousingRent + d.HousingLoanInterest + d.ElderlyCare + d.ChildcareUnder3
	return total
}

func calculateCumulativeTax(taxable float64) float64 {
	if taxable <= 0 {
		return 0
	}
	for i := len(taxBrackets) - 1; i >= 0; i-- {
		bracket := taxBrackets[i]
		if taxable > bracket.Threshold {
			continue
		}
		if i == 0 {
			return taxable * bracket.Rate
		}
		prevThreshold := taxBrackets[i-1].Threshold
		return prevThreshold*taxBrackets[i-1].Rate - taxBrackets[i-1].QuickDeduct +
			(taxable-prevThreshold)*bracket.Rate
	}
	return 0
}

func QuickTax(monthlyIncome float64, socialInsuranceMonthly float64) (monthlyTax float64, afterTax float64) {
	basicDeduction := 5000.0
	taxable := monthlyIncome - socialInsuranceMonthly - basicDeduction
	if taxable <= 0 {
		return 0, monthlyIncome - socialInsuranceMonthly
	}

	var tax float64
	if taxable <= 3000 {
		tax = taxable * 0.03
	} else if taxable <= 12000 {
		tax = taxable*0.10 - 210
	} else if taxable <= 25000 {
		tax = taxable*0.20 - 1410
	} else if taxable <= 35000 {
		tax = taxable*0.25 - 2660
	} else if taxable <= 55000 {
		tax = taxable*0.30 - 4410
	} else if taxable <= 80000 {
		tax = taxable*0.35 - 7160
	} else {
		tax = taxable*0.45 - 15160
	}

	if tax < 0 {
		tax = 0
	}
	return tax, monthlyIncome - socialInsuranceMonthly - tax
}
