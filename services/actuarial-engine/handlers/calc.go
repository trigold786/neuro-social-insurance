package handlers

import (
	"log"
	"net/http"

	"github.com/gin-gonic/gin"
	"nsi-actuarial-engine/models"
	"nsi-actuarial-engine/services"
)

func CalcSandbox(c *gin.Context) {
	var req models.SandboxRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid request parameters"})
		return
	}

	// 1. 尝试查表法兜底
	cacheKey := models.MatrixCacheKey{
		RegionCode:      req.RegionCode,
		ApplicableGroup: req.EmploymentType,
		Age:             req.Age,
		BaseSalary:      req.BaseSalary,
		RetirementAge:   req.RetirementAge,
		Strategy:        req.Strategy,
	}
	if cached, hit := services.CheckMatrixCache(cacheKey); hit {
		cached.IsFallback = true
		cached.FallbackReason = "预计算矩阵命中"
		c.JSON(http.StatusOK, cached)
		return
	}

	// 2. 实时精算
	result, err := services.CalculateSandbox(req)
	if err != nil {
		log.Printf("CalculateSandbox error: %v", err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "calculation failed"})
		return
	}

	c.JSON(http.StatusOK, result)
}

func CalcDeepPlan(c *gin.Context) {
	var req models.DeepPlanRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid request parameters"})
		return
	}

	results, recommendation, err := services.CalculateDeepPlan(req)
	if err != nil {
		log.Printf("CalculateDeepPlan error: %v", err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "calculation failed"})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"data":           results,
		"recommendation": recommendation,
	})
}

type CreateReportRequest struct {
	ProfileID string `json:"profile_id" binding:"required"`
}

func CreateReport(c *gin.Context) {
	var req CreateReportRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid request parameters"})
		return
	}
	c.JSON(http.StatusAccepted, gin.H{
		"task_id":           "report-" + req.ProfileID,
		"status":            "queued",
		"estimated_seconds": 15,
	})
}

func GetReportStatus(c *gin.Context) {
	taskID := c.Param("task_id")
	c.JSON(http.StatusOK, gin.H{
		"task_id":     taskID,
		"status":      "done",
		"result_url":  "",
		"completed_at": "2026-05-07T12:00:00Z",
	})
}
