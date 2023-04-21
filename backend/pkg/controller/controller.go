package controller

import (
	"andreacv98/service-broker-marketplace/pkg/model"
	"andreacv98/service-broker-marketplace/pkg/utils"
	"context"
	"encoding/json"
	"io/ioutil"
	"net/http"
	"strings"

	"github.com/Nerzal/gocloak/v13"
	"github.com/gin-gonic/gin"
)

func GetServiceProviders(c *gin.Context) {
	// Query to get all service providers from database
	query := "SELECT id, name, description, url FROM service_providers"
	// Execute query
	rows, err := utils.DbConfig.Db.Query(query)
	if err != nil {
		utils.Logger.Error("Error while executing query", err)
		c.JSON(500, gin.H{"error": err.Error()})
		return
	}
	defer rows.Close()
	
	// Create service providers list
	serviceProviders := []model.ServiceProviderResponse{}
	// Iterate over rows
	for rows.Next() {
		// Create service provider
		serviceProvider := model.ServiceProviderResponse{}
		// Scan row
		err = rows.Scan(&serviceProvider.Id ,&serviceProvider.Name, &serviceProvider.Description, &serviceProvider.URL)
		if err != nil {
			utils.Logger.Error("Error while scanning row", err)
			c.JSON(500, gin.H{"error": err.Error()})
			return
		}
		// Add service provider to list
		serviceProviders = append(serviceProviders, serviceProvider)
	}
	// Create response
	response := model.ServiceProvidersListResponse{
		ServiceProviders: serviceProviders,
	}
	// Return response
	c.JSON(200, response)
}

func AddServiceProvider(c *gin.Context) {
	// Parse request body
	var serviceProvider = model.AddServiceProviderRequest{}
	decoder := json.NewDecoder(c.Request.Body)
	err := decoder.Decode(&serviceProvider)
	if err != nil {
		utils.Logger.Error("Error while parsing request body", err)
		c.JSON(500, gin.H{"error": err.Error()})
		return
	}
	// Get userid from bearer tokenString
	// Get tokenString from authorization header
	tokenString := strings.Split(c.GetHeader("Authorization"), "Bearer ")[1]
	// Get userid from token
	ctx := context.Background()
	client := *(utils.ClientKeycloakConfig.Client)
	_, claims, err := client.DecodeAccessToken(ctx, tokenString, utils.ClientKeycloakConfig.Realm)
	if err != nil {
		utils.Logger.Error("Error while decoding access token", err)
		c.JSON(500, gin.H{"error": err.Error()})
		return
	}
	userID := (*claims)["sub"].(string)

	// Register service broker as client on Keycloak
	// Login marketplace client to Keycloak
	mpJwt, err := client.LoginClient(
		ctx,
		utils.ClientKeycloakConfig.ClientID,
		utils.ClientKeycloakConfig.ClientSecret,
		utils.ClientKeycloakConfig.Realm,
	)
	if err != nil {
		utils.Logger.Error("Error while logging in marketplace client", err)
		c.JSON(500, gin.H{"error": err.Error()})
		return
	}
	clientId := serviceProvider.Name
	enabled := true
	authorization := true
	standardFlow := true
	directAccess := true
	serviceAccounts := true
	// Create service broker client
	svcClient := gocloak.Client{
		ClientID: &clientId,
		Enabled:  &enabled,
		AuthorizationServicesEnabled: &authorization,
		StandardFlowEnabled: &standardFlow,
		DirectAccessGrantsEnabled: &directAccess,
		ServiceAccountsEnabled: &serviceAccounts,
	}

	idOfClient, err := client.CreateClient(
		ctx,
		mpJwt.AccessToken,
		utils.ClientKeycloakConfig.Realm,
		svcClient,
	)
	if err != nil {
		utils.Logger.Error("Error while creating service broker client", err)
		c.JSON(500, gin.H{"error": err.Error()})
		return
	}
	utils.Logger.Info("Service broker client", idOfClient)
	// Get service broker client secret
	svcClientCredentials, err := client.GetClientSecret(
		ctx,
		mpJwt.AccessToken,
		utils.ClientKeycloakConfig.Realm,
		idOfClient,
	)
	if err != nil {
		utils.Logger.Error("Error while getting service broker client secret", err)
		c.JSON(500, gin.H{"error": err.Error()})
		return
	}
	utils.Logger.Info("Service broker client secret", *(svcClientCredentials.Value))

	// Query to add service provider to database
	query := "INSERT INTO service_providers (name, description, url, userid, idofclient, clientid, clientsecret) VALUES ($1, $2, $3, $4, $5, $6, $7)"
	// Execute query
	_, err = utils.DbConfig.Db.Exec(query, serviceProvider.Name, serviceProvider.Description, serviceProvider.URL, userID, idOfClient, clientId, *(svcClientCredentials.Value))
	if err != nil {
		utils.Logger.Error("Error while executing query", err)
		c.JSON(500, gin.H{"error": err.Error()})
		return
	}
	// Return response
	c.JSON(200, model.AddServiceProviderResponse{
		AuthorityURL: utils.ClientKeycloakConfig.KeycloakURL,
		Realm: utils.ClientKeycloakConfig.Realm,
		ClientID: clientId,
		ClientSecret: *(svcClientCredentials.Value),
	})
}

func GetServices(c *gin.Context) {
	// Get service provider id from path
	serviceProviderID := c.Param("id")
	// Query service provider URL from db
	query := "SELECT url FROM service_providers WHERE id = $1"
	// Execute query
	row := utils.DbConfig.Db.QueryRow(query, serviceProviderID)
	// Scan row
	var url string
	err := row.Scan(&url)
	if err != nil {
		utils.Logger.Error("Error while scanning row", err)
		c.JSON(500, gin.H{"error": err.Error()})
		return
	}
	// Login marketplace client to Keycloak
	ctx := context.Background()
	client := *(utils.ClientKeycloakConfig.Client)
	mpJwt, err := client.LoginClient(
		ctx,
		utils.ClientKeycloakConfig.ClientID,
		utils.ClientKeycloakConfig.ClientSecret,
		utils.ClientKeycloakConfig.Realm,
	)
	if err != nil {
		utils.Logger.Error("Error while logging in marketplace client", err)
		c.JSON(500, gin.H{"error": err.Error()})
		return
	}
	// HTTP request to service provider url + "/v2/catalog" to fetch the catalog
	
	req, err := http.NewRequest("GET", url + "/v2/catalog", nil)
	if err != nil {
		utils.Logger.Error("Error while creating request", err)
		c.JSON(500, gin.H{"error": err.Error()})
		return
	}
	// Add bearer token to request header	
	req.Header.Add("Authorization", "Bearer " + mpJwt.AccessToken)
	// Add custom header "X-Broker-API-Version": "2.17"
	req.Header.Add("X-Broker-API-Version", "2.17")
	// Send request
	resp, err := http.DefaultClient.Do(req)
	if err != nil {
		utils.Logger.Error("Error while sending request", err)
		c.JSON(500, gin.H{"error": err.Error()})
		return
	}

	defer resp.Body.Close()

	// Read response body
	body, err := ioutil.ReadAll(resp.Body)
	if err != nil {
		utils.Logger.Error("Error while reading response body", err)
		c.JSON(500, gin.H{"error": err.Error()})
		return
	}

	// Set response data
	c.Data(resp.StatusCode, resp.Header.Get("Content-Type"), body)
}

func CORSMiddleware() gin.HandlerFunc {
    return func(c *gin.Context) {
        c.Writer.Header().Set("Access-Control-Allow-Origin", "*")
        c.Writer.Header().Set("Access-Control-Allow-Credentials", "true")
        c.Writer.Header().Set("Access-Control-Allow-Headers", "Content-Type, Content-Length, Accept-Encoding, X-CSRF-Token, Authorization, accept, origin, Cache-Control, X-Requested-With")
        c.Writer.Header().Set("Access-Control-Allow-Methods", "POST, OPTIONS, GET, PUT")

        if c.Request.Method == "OPTIONS" {
            c.AbortWithStatus(204)
            return
        }

        c.Next()
    }
}