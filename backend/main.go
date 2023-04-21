package main

import (
	"andreacv98/service-broker-marketplace/pkg/controller"
	"andreacv98/service-broker-marketplace/pkg/utils"
	"log"

	"github.com/gin-gonic/gin"
	"github.com/tbaehler/gin-keycloak/pkg/ginkeycloak"

	"go.uber.org/zap"
)

func main() {
	// Setup zap logger
	logger, err := zap.NewProduction()
	if err != nil {
		log.Fatal(err)
	}
	defer logger.Sync()
	utils.Logger = logger.Sugar()

	utils.Logger.Info("Starting service broker marketplace")

	utils.SetupDBConfig()
	utils.SetupKeycloak()

	router := gin.Default()

	router.Use(controller.CORSMiddleware())

	router.GET("/service-providers", controller.GetServiceProviders)
	router.POST("/service-providers", ginkeycloak.Auth(ginkeycloak.AuthCheck(), *utils.GinKeycloakConfig), controller.AddServiceProvider)
	router.GET("/service-providers/:id/services", controller.GetServices)

	router.Group("service-provider")

	router.Run("localhost:3001")
}
