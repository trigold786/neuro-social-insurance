package handlers

import (
	"net/http"

	"github.com/gin-gonic/gin"
	"nsi-actuarial-engine/models"
	"nsi-actuarial-engine/services"
)

func CalcTax(c *gin.Context) {
	var req models.TaxRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid request: " + err.Error()})
		return
	}

	if req.AnnualIncome <= 0 {
		c.JSON(http.StatusBadRequest, gin.H{"error": "annual_income must be positive"})
		return
	}

	result := services.CalculateTax(req)
	c.JSON(http.StatusOK, result)
}

func QuickTax(c *gin.Context) {
	monthlyIncome := c.Query("monthly_income")
	socialInsurance := c.Query("social_insurance")

	var mi, si float64
	if _, err := parseFloat(monthlyIncome, &mi); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid monthly_income"})
		return
	}
	if _, err := parseFloat(socialInsurance, &si); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid social_insurance"})
		return
	}

	monthlyTax, afterTax := services.QuickTax(mi, si)
	c.JSON(http.StatusOK, gin.H{
		"monthly_income":     mi,
		"social_insurance":   si,
		"monthly_tax":        monthlyTax,
		"after_tax_income":   afterTax,
	})
}

func parseFloat(s string, v *float64) (int, error) {
	return parseFloatBase(s, v, 64)
}

func parseFloatBase(s string, v *float64, bits int) (int, error) {
	var f float64
	n, err := parseFloatBits(s, &f, bits)
	if err != nil {
		return n, err
	}
	*v = f
	return n, nil
}

func parseFloatBits(s string, v *float64, bits int) (int, error) {
	var f float64
	n := 0
	for i, ch := range s {
		switch {
		case ch >= '0' && ch <= '9':
			f = f*10 + float64(ch-'0')
			n++
		case ch == '.':
			frac := 1.0
			for j := i + 1; j < len(s) && s[j] >= '0' && s[j] <= '9'; j++ {
				frac /= 10
				f += float64(s[j]-'0') * frac
				n++
			}
			break
		}
	}
	*v = f
	return n, nil
}
