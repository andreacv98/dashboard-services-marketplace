package main

import (
	"github.com/gin-gonic/gin"
	"andreacv98/service-broker-marketplace/pkg/controller"
)

func main() {
	router := gin.Default()
	router.GET("/service-providers", controller.GetServiceProviders)
}