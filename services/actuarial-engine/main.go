package main

import (
	"context"
	"log"
	"net/http"
	"os"
	"os/signal"
	"syscall"
	"time"

	"github.com/gin-gonic/gin"
	"nsi-actuarial-engine/handlers"
)

func main() {
	r := gin.Default()

	allowedOrigin := os.Getenv("CORS_ALLOWED_ORIGIN")
	if allowedOrigin == "" {
		allowedOrigin = "http://localhost:3000"
	}

	r.Use(func(c *gin.Context) {
		c.Writer.Header().Set("Access-Control-Allow-Origin", allowedOrigin)
		c.Writer.Header().Set("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS")
		c.Writer.Header().Set("Access-Control-Allow-Headers", "Origin, Content-Type, Accept, Authorization")
		if c.Request.Method == "OPTIONS" {
			c.AbortWithStatus(204)
			return
		}
		c.Next()
	})

	r.GET("/health", func(c *gin.Context) {
		c.JSON(http.StatusOK, gin.H{"status": "ok", "service": "actuarial-engine"})
	})

	v1 := r.Group("/v1")
	{
		v1.POST("/calc/sandbox", handlers.CalcSandbox)
		v1.POST("/calc/deep-plan", handlers.CalcDeepPlan)
		v1.POST("/calc/reports", handlers.CreateReport)
		v1.GET("/calc/reports/:task_id", handlers.GetReportStatus)
		v1.POST("/calc/tax", handlers.CalcTax)
		v1.GET("/calc/tax/quick", handlers.QuickTax)
	}

	port := os.Getenv("PORT")
	if port == "" {
		port = "30313"
	}

	srv := &http.Server{
		Addr:    ":" + port,
		Handler: r,
	}

	go func() {
		log.Printf("actuarial-engine starting on :%s", port)
		if err := srv.ListenAndServe(); err != nil && err != http.ErrServerClosed {
			log.Fatalf("listen: %s\n", err)
		}
	}()

	quit := make(chan os.Signal, 1)
	signal.Notify(quit, syscall.SIGINT, syscall.SIGTERM)
	<-quit
	log.Println("shutting down server...")

	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()
	if err := srv.Shutdown(ctx); err != nil {
		log.Fatal("server forced to shutdown:", err)
	}
	log.Println("server exited")
}
