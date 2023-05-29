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
	router.GET("/service-providers/mine", ginkeycloak.Auth(ginkeycloak.AuthCheck(), *utils.GinKeycloakConfig), controller.GetUserServiceProvider)
	router.POST("/service-providers", ginkeycloak.Auth(ginkeycloak.AuthCheck(), *utils.GinKeycloakConfig), controller.AddServiceProvider)
	router.GET("/service-providers/:id/services", controller.GetServices)
	router.POST("/service-providers/:idSvcPrv/services/:idSvc/plans/:idPlan/subscribe", ginkeycloak.Auth(ginkeycloak.AuthCheck(), *utils.GinKeycloakConfig), controller.SubscribeService)
	router.GET("/subscriptions", ginkeycloak.Auth(ginkeycloak.AuthCheck(), *utils.GinKeycloakConfig), controller.GetSubscriptions)
	router.POST("/deployments", ginkeycloak.Auth(ginkeycloak.AuthCheck(), *utils.GinKeycloakConfig), controller.AddDeploymentHandler)
	router.GET("/deployments", ginkeycloak.Auth(ginkeycloak.AuthCheck(), *utils.GinKeycloakConfig), controller.GetDeploymentsHandler)
	router.GET("/deployments/:deploymentid", ginkeycloak.Auth(ginkeycloak.AuthCheck(), *utils.GinKeycloakConfig), controller.GetDeploymentHandler)
	router.POST("/deployments/:deploymentid/peering", ginkeycloak.Auth(ginkeycloak.AuthCheck(), *utils.GinKeycloakConfig), controller.AddPeerHandler)
	router.GET("/deployments/:deploymentid/peering", ginkeycloak.Auth(ginkeycloak.AuthCheck(), *utils.GinKeycloakConfig), controller.GetPeerHandle)
	router.POST("/deployments/:deploymentid/service-instances", ginkeycloak.Auth(ginkeycloak.AuthCheck(), *utils.GinKeycloakConfig), controller.AddServiceInstanceHandler)
	router.GET("/deployments/:deploymentid/service-instances", ginkeycloak.Auth(ginkeycloak.AuthCheck(), *utils.GinKeycloakConfig), controller.GetServiceInstancesHandler)
	router.POST("/deployments/:deploymentid/service-bindings", ginkeycloak.Auth(ginkeycloak.AuthCheck(), *utils.GinKeycloakConfig), controller.AddServiceBindingsHandler)
	router.GET("/deployments/:deploymentid/service-bindings", ginkeycloak.Auth(ginkeycloak.AuthCheck(), *utils.GinKeycloakConfig), controller.GetServiceBindingsHandler)

	router.Run("localhost:3001")
}
