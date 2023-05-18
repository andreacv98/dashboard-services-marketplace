package controller

import (
	"andreacv98/service-broker-marketplace/pkg/model"
	"andreacv98/service-broker-marketplace/pkg/utils"
	"bytes"
	"context"
	"database/sql"
	"encoding/json"
	"io/ioutil"
	"net/http"
	"strconv"
	"strings"
	"time"

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
		err = rows.Scan(&serviceProvider.Id, &serviceProvider.Name, &serviceProvider.Description, &serviceProvider.URL)
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
	// Wait for 1 second
	time.Sleep(1 * time.Second)
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
		ClientID:                     &clientId,
		Enabled:                      &enabled,
		AuthorizationServicesEnabled: &authorization,
		StandardFlowEnabled:          &standardFlow,
		DirectAccessGrantsEnabled:    &directAccess,
		ServiceAccountsEnabled:       &serviceAccounts,
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

	// Get service account of client
	svcAccount, err := client.GetClientServiceAccount(
		ctx,
		mpJwt.AccessToken,
		utils.ClientKeycloakConfig.Realm,
		idOfClient,
	)
	if err != nil {
		utils.Logger.Error("Error while getting service broker client service account", err)
		c.JSON(500, gin.H{"error": err.Error()})
		return
	}
	utils.Logger.Info("Service broker client service account", svcAccount)

	// Update service account role
	// Get service broker realm role
	role, err := client.GetRealmRole(
		ctx,
		mpJwt.AccessToken,
		utils.ClientKeycloakConfig.Realm,
		"service-broker",
	)
	if err != nil {
		utils.Logger.Error("Error while getting service broker realm role", err)
		c.JSON(500, gin.H{"error": err.Error()})
		return
	}

	// Create single role list
	roleList := []gocloak.Role{}
	roleList = append(roleList, *role)

	client.AddRealmRoleToUser(
		ctx,
		mpJwt.AccessToken,
		utils.ClientKeycloakConfig.Realm,
		*svcAccount.ID,
		roleList,
	)

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
		Realm:        utils.ClientKeycloakConfig.Realm,
		ClientID:     clientId,
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
	// Wait for 1 second
	time.Sleep(1 * time.Second)
	req, err := http.NewRequest("GET", url+"/v2/catalog", nil)
	if err != nil {
		utils.Logger.Error("Error while creating request", err)
		c.JSON(500, gin.H{"error": err.Error()})
		return
	}
	// Add bearer token to request header
	req.Header.Add("Authorization", "Bearer "+mpJwt.AccessToken)
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

func SubscribeService(c *gin.Context) {
	// Get service provider id from path
	serviceProviderID := c.Param("idSvcPrv")
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

	// Get userid from bearer tokenString
	// Get tokenString from authorization header
	tokenString := strings.Split(c.GetHeader("Authorization"), "Bearer ")[1]
	// Get userid from token
	ctx := context.Background()
	client := *(utils.ClientKeycloakConfig.Client)
	// Wait for 1 second
	time.Sleep(1 * time.Second)
	_, claims, err := client.DecodeAccessToken(ctx, tokenString, utils.ClientKeycloakConfig.Realm)
	if err != nil {
		utils.Logger.Error("Error while decoding access token", err)
		c.JSON(500, gin.H{"error": err.Error()})
		return
	}
	userID := (*claims)["sub"].(string)

	// Get service id from path
	serviceID := c.Param("idSvc")
	// Get plan id from path
	planID := c.Param("idPlan")

	// Check if service plan has been subscribed already
	query = "SELECT id FROM service_subscriptions WHERE userid = $1 AND serviceproviderid = $2 AND serviceid = $3 AND planid = $4"
	// Execute query
	row = utils.DbConfig.Db.QueryRow(query, userID, serviceProviderID, serviceID, planID)
	// Scan row
	var id int
	err = row.Scan(&id)
	if err != nil {
		if err != sql.ErrNoRows {
			utils.Logger.Error("Error while scanning row", err)
			c.JSON(500, gin.H{"error": err.Error()})
			return
		}
	} else {
		// Subscription already exists
		c.JSON(409, gin.H{"message": "Subscription already exists"})
	}

	// Insert subscription into database and get the ID
	query = "INSERT INTO service_subscriptions (userid, serviceproviderid, serviceid, planid) VALUES ($1, $2, $3, $4) RETURNING ID"
	// Execute query and get the ID
	var subscriptionID int
	err = utils.DbConfig.Db.QueryRow(query, userID, serviceProviderID, serviceID, planID).Scan(&subscriptionID)
	if err != nil {
		utils.Logger.Error("Error while executing query", err)
		c.JSON(500, gin.H{"error": err.Error()})
		return
	}

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

	// HTTP request URL to buy service plan from service provider
	// Set JSON data
	var jsonData = []byte(`{
		"service_id": "` + serviceID + `",
		"plan_id": "` + planID + `",
		"user_id": "` + userID + `"
	}`)
	// Wait for 1 second
	time.Sleep(1 * time.Second)
	req, err := http.NewRequest("POST", url+"/service_subscription", bytes.NewBuffer(jsonData))
	if err != nil {
		utils.Logger.Error("Error while creating request", err)
		c.JSON(500, gin.H{"error": err.Error()})
		return
	}
	// Add content type header
	req.Header.Set("Content-Type", "application/json")
	// Add bearer token to request header
	req.Header.Add("Authorization", "Bearer "+mpJwt.AccessToken)
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

	// Check response status code
	if resp.StatusCode != 200 {
		// Revert subscription insertion based in the ID
		query = "DELETE FROM service_subscriptions WHERE id = $1"
		_, err = utils.DbConfig.Db.Exec(query, subscriptionID)
		if err != nil {
			utils.Logger.Error("Error while executing query", err)
			c.JSON(500, gin.H{"error": err.Error()})
			return
		}
	} else {
		// Get remote subscription ID called "subscription_id" from the JSON body response
		var rspJSON map[string]interface{}
		err = json.NewDecoder(resp.Body).Decode(&rspJSON)
		if err != nil {
			utils.Logger.Error("Error while decoding JSON body", err)
			c.JSON(500, gin.H{"error": err.Error()})
			return
		}
		var remoteSubscriptionID = rspJSON["subscription_id"].(string)
		// Update subscription with remote subscription ID
		query = "UPDATE service_subscriptions SET remotesubscriptionid = $1 WHERE id = $2"
		_, err = utils.DbConfig.Db.Exec(query, remoteSubscriptionID, subscriptionID)
		if err != nil {
			utils.Logger.Error("Error while executing query", err)
			c.JSON(500, gin.H{"error": err.Error()})
			return
		}
	}

	// Read response body
	body, err := ioutil.ReadAll(resp.Body)
	if err != nil {
		utils.Logger.Error("Error while reading response body", err)
		c.JSON(500, gin.H{"error": err.Error()})
		return
	}

	// Response OK
	c.JSON(200, gin.H{"message": "Service plan subscribed successfully", "body": string(body)})
}

func GetSubscriptions(c *gin.Context) {
	// Get userid from bearer tokenString
	// Get tokenString from authorization header
	tokenString := strings.Split(c.GetHeader("Authorization"), "Bearer ")[1]
	// Get userid from token
	ctx := context.Background()
	client := *(utils.ClientKeycloakConfig.Client)
	// Wait for 1 second
	time.Sleep(1 * time.Second)
	_, claims, err := client.DecodeAccessToken(ctx, tokenString, utils.ClientKeycloakConfig.Realm)
	if err != nil {
		utils.Logger.Error("Error while decoding access token", err)
		c.JSON(500, gin.H{"error": err.Error()})
		return
	}
	userID := (*claims)["sub"].(string)

	// Retrieve subscriptions from db
	query := "SELECT service_subscriptions.id, service_subscriptions.serviceproviderid, service_providers.name, service_providers.url, service_subscriptions.serviceid, service_subscriptions.planid FROM service_subscriptions, service_providers WHERE service_subscriptions.userid = $1 AND service_providers.id = service_subscriptions.serviceproviderid"
	// Execute query
	rows, err := utils.DbConfig.Db.Query(query, userID)
	if err != nil {
		utils.Logger.Error("Error while executing query", err)
		c.JSON(500, gin.H{"error": err.Error()})
		return
	}
	defer rows.Close()

	// Scan rows
	var subscriptions []model.Subscription
	for rows.Next() {
		var subscription model.Subscription
		err := rows.Scan(&subscription.Id, &subscription.ServiceProviderId, &subscription.ServiceProviderName, &subscription.ServiceProviderURL, &subscription.ServiceId, &subscription.PlanId)
		if err != nil {
			utils.Logger.Error("Error while scanning row", err)
			c.JSON(500, gin.H{"error": err.Error()})
			return
		}
		subscriptions = append(subscriptions, subscription)
	}

	// Return subscriptions
	response := model.SubscriptionListResponse{
		Subscriptions: subscriptions,
	}

	utils.Logger.Info("Reponse: ", response)
	c.JSON(200, response)

}

func AddDeploymentHandler(c *gin.Context) {
	// Get userid from bearer tokenString
	// Get tokenString from authorization header
	tokenString := strings.Split(c.GetHeader("Authorization"), "Bearer ")[1]
	// Get userid from token
	ctx := context.Background()
	client := *(utils.ClientKeycloakConfig.Client)
	// Wait for 1 second
	time.Sleep(1 * time.Second)
	_, claims, err := client.DecodeAccessToken(ctx, tokenString, utils.ClientKeycloakConfig.Realm)
	if err != nil {
		utils.Logger.Error("Error while decoding access token", err)
		c.JSON(500, gin.H{"error": err.Error()})
		return
	}
	userID := (*claims)["sub"].(string)

	// Parse request body
	var deploymentRequest = model.DeploymentRequest{}
	decoder := json.NewDecoder(c.Request.Body)
	err = decoder.Decode(&deploymentRequest)
	if err != nil {
		utils.Logger.Error("Error while parsing request body", err)
		c.JSON(500, gin.H{"error": err.Error()})
		return
	}

	// Check if service provider is valid
	query := "SELECT id FROM service_providers WHERE id = $1"
	// Execute query
	var serviceProviderID int
	err = utils.DbConfig.Db.QueryRow(query, deploymentRequest.ServiceProviderId).Scan(&serviceProviderID)
	if err != nil {
		utils.Logger.Error("Error while executing query", err)
		c.JSON(500, gin.H{"error": err.Error()})
		return
	}
	if serviceProviderID == 0 {
		utils.Logger.Error("Service provider not found")
		c.JSON(404, gin.H{"error": "Service provider not found"})
		return
	}

	// Check if service and plan have been subscribed
	query = "SELECT id FROM service_subscriptions WHERE userid = $1 AND serviceid = $2 AND planid = $3 AND serviceproviderid = $4"
	// Execute query
	var subscriptionID int
	err = utils.DbConfig.Db.QueryRow(query, userID, deploymentRequest.ServiceId, deploymentRequest.PlanId, deploymentRequest.ServiceProviderId).Scan(&subscriptionID)
	if err != nil {
		utils.Logger.Error("Error while executing query", err)
		c.JSON(500, gin.H{"error": err.Error()})
		return
	}
	if subscriptionID == 0 {
		utils.Logger.Error("Service and plan have not been subscribed")
		c.JSON(404, gin.H{"error": "Service and plan have not been subscribed"})
		return
	}

	// Insert deployment into db
	query = "INSERT INTO deployments (user_id, service_id, plan_id, service_provider_id) VALUES ($1, $2, $3, $4) RETURNING id"
	// Execute query
	var deploymentID int
	err = utils.DbConfig.Db.QueryRow(query, userID, deploymentRequest.ServiceId, deploymentRequest.PlanId, deploymentRequest.ServiceProviderId).Scan(&deploymentID)
	if err != nil {
		utils.Logger.Error("Error while executing query", err)
		c.JSON(500, gin.H{"error": err.Error()})
		return
	}

	var deploymentResponse = model.DeploymentResponse{
		DeploymentId: strconv.Itoa(deploymentID),
	}
	c.JSON(200, deploymentResponse)
}

func GetDeploymentsHandler(c *gin.Context) {
	// Get userid from bearer tokenString
	// Get tokenString from authorization header
	tokenString := strings.Split(c.GetHeader("Authorization"), "Bearer ")[1]
	// Get userid from token
	ctx := context.Background()
	client := *(utils.ClientKeycloakConfig.Client)
	// Wait for 1 second
	time.Sleep(1 * time.Second)
	_, claims, err := client.DecodeAccessToken(ctx, tokenString, utils.ClientKeycloakConfig.Realm)
	if err != nil {
		utils.Logger.Error("Error while decoding access token", err)
		c.JSON(500, gin.H{"error": err.Error()})
		return
	}
	userID := (*claims)["sub"].(string)

	// Get deployments from db of the user
	query := "SELECT id, service_id, plan_id, service_provider_id, peering_id, service_instance_request_id, service_binding_request_id FROM deployments WHERE user_id = $1"
	// Execute query
	// Execute and scan rows
	rows, err := utils.DbConfig.Db.Query(query, userID)
	if err != nil {
		utils.Logger.Error("Error while executing query", err)
		c.JSON(500, gin.H{"error": err.Error()})
		return
	}
	defer rows.Close()

	var deployments []model.RetrieveDeploymentResponse
	for rows.Next() {
		var deploymentId int
		var serviceId string
		var planId string
		var serviceProviderId int
		var peeringId sql.NullInt32
		var serviceInstanceRequestId sql.NullInt32
		var serviceBindingRequestId sql.NullInt32
		err = rows.Scan(&deploymentId, &serviceId, &planId, &serviceProviderId, &peeringId, &serviceInstanceRequestId, &serviceBindingRequestId)
		if err != nil {
			utils.Logger.Error("Error while scanning rows", err)
			c.JSON(500, gin.H{"error": err.Error()})
			return
		}

		// Create deployment
		var deployment = model.RetrieveDeploymentResponse{
			Id: strconv.Itoa(deploymentId),
			ServiceId: serviceId,
			PlanId: planId,
			ServiceProviderId: strconv.Itoa(serviceProviderId),
		}
		
		// Check if peering id is valid
		if peeringId.Valid {
			deployment.PeeringId = strconv.Itoa(int(peeringId.Int32))
		}

		// Check validity of nullable fields to be joined to other tables
		if serviceInstanceRequestId.Valid && serviceBindingRequestId.Valid {
			// Join with service_instances and service_bindings and get service instance, service binding ids and their operations
			query = "SELECT service_instance_requests.service_instance_id, service_instance_requests.operation_id, service_binding_requests.service_binding_id, service_binding_requests.operation_id FROM deployments, service_instance_requests, service_binding_requests WHERE deployments.id = $1 AND deployments.service_instance_request_id = service_instance_requests.id AND deployments.service_binding_request_id = service_binding_requests.id"
			// Execute query single row
			var serviceInstanceId string
			var serviceInstanceOperationId sql.NullString
			var serviceBindingId string
			var serviceBindingOperationId sql.NullString
			err = utils.DbConfig.Db.QueryRow(query, deploymentId).Scan(&serviceInstanceId, &serviceInstanceOperationId, &serviceBindingId, &serviceBindingOperationId)
			if err != nil {
				utils.Logger.Error("Error while executing query", err)
				c.JSON(500, gin.H{"error": err.Error()})
				return
			}
			deployment.ServiceInstanceId = serviceInstanceId
			if serviceInstanceOperationId.Valid {
				deployment.ServiceInstanceOperation = serviceInstanceOperationId.String
			}
			deployment.ServiceBindingId = serviceBindingId
			if serviceBindingOperationId.Valid {
				deployment.ServiceBindingOperation = serviceBindingOperationId.String
			}
		} else if serviceInstanceRequestId.Valid {
			// Join with service_instances and get service instance id and its operation
			query = "SELECT service_instance_requests.service_instance_id, service_instance_requests.operation_id FROM deployments, service_instance_requests WHERE deployments.id = $1 AND deployments.service_instance_request_id = service_instance_requests.id"
			// Execute query single row
			var serviceInstanceId string
			var serviceInstanceOperationId sql.NullString
			err = utils.DbConfig.Db.QueryRow(query, deploymentId).Scan(&serviceInstanceId, &serviceInstanceOperationId)
			if err != nil {
				utils.Logger.Error("Error while executing query", err)
				c.JSON(500, gin.H{"error": err.Error()})
				return
			}
			deployment.ServiceInstanceId = serviceInstanceId
			if serviceInstanceOperationId.Valid {
				deployment.ServiceInstanceOperation = serviceInstanceOperationId.String
			}
		}

		// Append deployment to deployments
		deployments = append(deployments, deployment)
	}

	// Create response
	var response = model.RetrieveDeploymentsListResponse{
		Deployments: deployments,
	}

	// Return response
	c.JSON(200, response)
}

func GetDeploymentHandler(c *gin.Context) {
	// Get userid from bearer tokenString
	// Get tokenString from authorization header
	tokenString := strings.Split(c.GetHeader("Authorization"), "Bearer ")[1]
	// Get userid from token
	ctx := context.Background()
	client := *(utils.ClientKeycloakConfig.Client)
	// Wait for 1 second
	time.Sleep(1 * time.Second)
	_, claims, err := client.DecodeAccessToken(ctx, tokenString, utils.ClientKeycloakConfig.Realm)
	if err != nil {
		utils.Logger.Error("Error while decoding access token", err)
		c.JSON(500, gin.H{"error": err.Error()})
		return
	}
	userID := (*claims)["sub"].(string)
	// Get deployment id from parameters
	deploymentID := c.Param("deploymentid")

	// Check if deployment owns to the user
	// Create query
	query := "SELECT id FROM deployments WHERE id = $1 AND user_id = $2"
	// Execute query
	var id int
	err = utils.DbConfig.Db.QueryRow(query, deploymentID, userID).Scan(&id)
	if err != nil {
		utils.Logger.Error("Error while executing query", err)
		c.JSON(500, gin.H{"error": err.Error()})
		return
	}
	if id == 0 {
		utils.Logger.Error("Deployment does not belong to user")
		c.JSON(403, gin.H{"error": "Deployment does not belong to user"})
		return
	}

	// Get deployment
	// Create query
	query = "SELECT id, service_id, plan_id, service_provider_id, peering_id, service_instance_request_id, service_binding_request_id FROM deployments WHERE id = $1"


	var deploymentId int
	var serviceId string
	var planId string
	var serviceProviderId int
	var peeringId sql.NullInt32
	var serviceInstanceRequestId sql.NullInt32
	var serviceBindingRequestId sql.NullInt32
	// Execute single row query
	err = utils.DbConfig.Db.QueryRow(query, deploymentID).Scan(&deploymentId, &serviceId, &planId, &serviceProviderId, &peeringId, &serviceInstanceRequestId, &serviceBindingRequestId)
	if err != nil {
		utils.Logger.Error("Error while scanning rows", err)
		c.JSON(500, gin.H{"error": err.Error()})
		return
	}

	// Create deployment
	var deployment = model.RetrieveDeploymentResponse{
		Id: strconv.Itoa(deploymentId),
		ServiceId: serviceId,
		PlanId: planId,
		ServiceProviderId: strconv.Itoa(serviceProviderId),
	}
	
	// Check if peering id is valid
	if peeringId.Valid {
		deployment.PeeringId = strconv.Itoa(int(peeringId.Int32))
	}

	// Check validity of nullable fields to be joined to other tables
	if serviceInstanceRequestId.Valid && serviceBindingRequestId.Valid {
		// Join with service_instances and service_bindings and get service instance, service binding ids and their operations
		query = "SELECT service_instance_requests.service_instance_id, service_instance_requests.operation_id, service_binding_requests.service_binding_id, service_binding_requests.operation_id FROM deployments, service_instance_requests, service_binding_requests WHERE deployments.id = $1 AND deployments.service_instance_request_id = service_instance_requests.id AND deployments.service_binding_request_id = service_binding_requests.id"
		// Execute query single row
		var serviceInstanceId string
		var serviceInstanceOperationId sql.NullString
		var serviceBindingId string
		var serviceBindingOperationId sql.NullString
		err = utils.DbConfig.Db.QueryRow(query, deploymentId).Scan(&serviceInstanceId, &serviceInstanceOperationId, &serviceBindingId, &serviceBindingOperationId)
		if err != nil {
			utils.Logger.Error("Error while executing query", err)
			c.JSON(500, gin.H{"error": err.Error()})
			return
		}
		deployment.ServiceInstanceId = serviceInstanceId
		if serviceInstanceOperationId.Valid {
			deployment.ServiceInstanceOperation = serviceInstanceOperationId.String
		}
		deployment.ServiceBindingId = serviceBindingId
		if serviceBindingOperationId.Valid {
			deployment.ServiceBindingOperation = serviceBindingOperationId.String
		}
	} else if serviceInstanceRequestId.Valid {
		// Join with service_instances and get service instance id and its operation
		query = "SELECT service_instance_requests.service_instance_id, service_instance_requests.operation_id FROM deployments, service_instance_requests WHERE deployments.id = $1 AND deployments.service_instance_request_id = service_instance_requests.id"
		// Execute query single row
		var serviceInstanceId string
		var serviceInstanceOperationId sql.NullString
		err = utils.DbConfig.Db.QueryRow(query, deploymentId).Scan(&serviceInstanceId, &serviceInstanceOperationId)
		if err != nil {
			utils.Logger.Error("Error while executing query", err)
			c.JSON(500, gin.H{"error": err.Error()})
			return
		}
		deployment.ServiceInstanceId = serviceInstanceId
		if serviceInstanceOperationId.Valid {
			deployment.ServiceInstanceOperation = serviceInstanceOperationId.String
		}
	}
	
	// Return deployment
	c.JSON(200, deployment)
}

func AddPeerHandler(c *gin.Context) {
	// Get userid from bearer tokenString
	// Get tokenString from authorization header
	tokenString := strings.Split(c.GetHeader("Authorization"), "Bearer ")[1]
	// Get userid from token
	ctx := context.Background()
	client := *(utils.ClientKeycloakConfig.Client)
	// Wait for 1 second
	time.Sleep(1 * time.Second)
	_, claims, err := client.DecodeAccessToken(ctx, tokenString, utils.ClientKeycloakConfig.Realm)
	if err != nil {
		utils.Logger.Error("Error while decoding access token", err)
		c.JSON(500, gin.H{"error": err.Error()})
		return
	}
	userID := (*claims)["sub"].(string)

	// Parse request body
	peeringRequest := model.PeeringRequest{}
	decoder := json.NewDecoder(c.Request.Body)
	err = decoder.Decode(&peeringRequest)
	if err != nil {
		utils.Logger.Error("Error while parsing request body", err)
		c.JSON(500, gin.H{"error": err.Error()})
		return
	}

	// Get deployment id from parameters
	deploymentID := c.Param("deploymentid")

	// Forward request to peer
	// Get service provider url from db
	query := "SELECT url FROM service_providers WHERE id = $1"
	// Execute query
	var url string
	err = utils.DbConfig.Db.QueryRow(query, peeringRequest.ServiceProviderID).Scan(&url)
	if err != nil {
		utils.Logger.Error("Error while executing query", err)
		c.JSON(500, gin.H{"error": err.Error()})
		return
	}

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

	// Create request
	// Create remotepeeringrequest
	remotePeeringRequest := model.RemotePeeringRequest{
		ClusterID:        peeringRequest.ClusterID,
		ClusterName:      peeringRequest.ClusterName,
		AuthURL:          peeringRequest.AuthURL,
		Token:            peeringRequest.Token,
		OffloadingPolicy: peeringRequest.OffloadingPolicy,
		UserID:           userID,
		PrefixNamespace:  peeringRequest.PrefixNamespace,
	}
	// Create request
	requestBody, err := json.Marshal(remotePeeringRequest)
	if err != nil {
		utils.Logger.Error("Error while marshalling request body", err)
		c.JSON(500, gin.H{"error": err.Error()})
		return
	}
	// Wait for 1 second
	time.Sleep(1 * time.Second)
	// Create request
	req, err := http.NewRequest("POST", url+"/peering", bytes.NewBuffer(requestBody))
	if err != nil {
		utils.Logger.Error("Error while creating request", err)
		c.JSON(500, gin.H{"error": err.Error()})
		return
	}
	// Set headers
	req.Header.Set("Content-Type", "application/json")
	req.Header.Set("X-Broker-API-Version", "2.17")
	req.Header.Set("Authorization", "Bearer "+mpJwt.AccessToken)
	// Send request
	clientHttp := &http.Client{}
	resp, err := clientHttp.Do(req)
	if err != nil {
		utils.Logger.Error("Error while sending request", err)
		c.JSON(500, gin.H{"error": err.Error()})
		return
	}
	defer resp.Body.Close()

	if (resp.StatusCode == 202 || resp.StatusCode == 200) {
		// Register peering into db
		// Get peeringid from response body
		// Read response body
		var peeringResponse map[string]interface{}
		err = json.NewDecoder(resp.Body).Decode(&peeringResponse)
		if err != nil {
			utils.Logger.Error("Error while decoding JSON body", err)
			c.JSON(500, gin.H{"error": err.Error()})
			return
		}
		var peeringId = peeringResponse["peering_id"].(string)

		// Bind peering with the deployment
		query = "UPDATE deployments SET peering_id = $1 WHERE id = $2"
		// Execute query
		_, err = utils.DbConfig.Db.Exec(query, peeringId, deploymentID)
		if err != nil {
			utils.Logger.Error("Error while executing query", err)
			c.JSON(500, gin.H{"error": err.Error()})
			return
		}
		utils.Logger.Info("Peering successfully added")

		// Forward peeringResponse
		c.JSON(resp.StatusCode, peeringResponse)
	} else {

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
}

func GetPeerHandle(c *gin.Context) {
	// Get userid from bearer tokenString
	// Get tokenString from authorization header
	tokenString := strings.Split(c.GetHeader("Authorization"), "Bearer ")[1]
	// Get userid from token
	ctx := context.Background()
	client := *(utils.ClientKeycloakConfig.Client)
	// Wait for 1 second
	time.Sleep(1 * time.Second)
	_, claims, err := client.DecodeAccessToken(ctx, tokenString, utils.ClientKeycloakConfig.Realm)
	if err != nil {
		utils.Logger.Error("Error while decoding access token", err)
		c.JSON(500, gin.H{"error": err.Error()})
		return
	}
	userID := (*claims)["sub"].(string)

	// Get deployment id from parameters
	deploymentID := c.Param("deploymentid")

	// Get user id, peering id and service provider url from database
	query := "SELECT user_id, peering_id, url FROM deployments JOIN service_providers ON deployments.service_provider_id = service_providers.id WHERE deployments.id = $1"
	// Execute query
	var deploymentUserID string
	var url string
	var peeringID sql.NullString
	err = utils.DbConfig.Db.QueryRow(query, deploymentID).Scan(&deploymentUserID, &peeringID, &url)
	if err != nil {
		utils.Logger.Error("Error while executing query", err)
		c.JSON(500, gin.H{"error": err.Error()})
		return
	}
	if deploymentUserID != userID {
		utils.Logger.Error("Deployment does not belong to the user")
		c.JSON(403, gin.H{"error": "Deployment does not belong to the user"})
		return
	}
	if peeringID.Valid {
		// Get peering status and return it
		// Create request
		req, err := http.NewRequest("GET", url+"/peering/"+peeringID.String, nil)
		if err != nil {
			utils.Logger.Error("Error while creating request", err)
			c.JSON(500, gin.H{"error": err.Error()})
			return
		}
		// Set headers
		req.Header.Set("Content-Type", "application/json")
		req.Header.Set("X-Broker-API-Version", "2.17")
		req.Header.Set("Authorization", "Bearer "+tokenString)
		// Send request
		clientHttp := &http.Client{}
		resp, err := clientHttp.Do(req)
		if err != nil {
			utils.Logger.Error("Error while sending request", err)
			c.JSON(500, gin.H{"error": err.Error()})
			return
		}
		defer resp.Body.Close()

		// Forward response
		// Read response body
		body, err := ioutil.ReadAll(resp.Body)
		if err != nil {
			utils.Logger.Error("Error while reading response body", err)
			c.JSON(500, gin.H{"error": err.Error()})
			return
		}
		// Set response data
		c.Data(resp.StatusCode, resp.Header.Get("Content-Type"), body)
	} else {
		utils.Logger.Error("Deployment does not have peering")
		c.JSON(404, gin.H{"error": "Deployment does not have peering"})
		return
	}
}

func AddServiceInstanceHandler(c *gin.Context) {
	// Get userid from bearer tokenString
	// Get tokenString from authorization header
	tokenString := strings.Split(c.GetHeader("Authorization"), "Bearer ")[1]
	// Get userid from token
	ctx := context.Background()
	client := *(utils.ClientKeycloakConfig.Client)
	// Wait for 1 second
	time.Sleep(1 * time.Second)
	_, claims, err := client.DecodeAccessToken(ctx, tokenString, utils.ClientKeycloakConfig.Realm)
	if err != nil {
		utils.Logger.Error("Error while decoding access token", err)
		c.JSON(500, gin.H{"error": err.Error()})
		return
	}
	userID := (*claims)["sub"].(string)

	// Parse request body
	var serviceInstanceRequest = model.ServiceInstanceRequest{}
	decoder := json.NewDecoder(c.Request.Body)
	err = decoder.Decode(&serviceInstanceRequest)
	if err != nil {
		utils.Logger.Error("Error while parsing request body", err)
		c.JSON(500, gin.H{"error": err.Error()})
		return
	}

	// Get serviceinstanceid from body
	serviceInstanceID := serviceInstanceRequest.ServiceInstanceID
	// Check if serviceinstance is not null
	if serviceInstanceID == "" {
		utils.Logger.Error("Service instance id is empty")
		c.JSON(400, gin.H{"error": "Service instance id is empty"})
		return
	}

	// Get deploymentid from path
	deploymentID := c.Param("deploymentid")
	// Check if deployment already has service instance
	query := "SELECT service_instance_request_id FROM deployments WHERE id = $1"
	// Execute query
	var serviceInstanceIDDb sql.NullString
	err = utils.DbConfig.Db.QueryRow(query, deploymentID).Scan(&serviceInstanceIDDb)
	if err != nil {
		utils.Logger.Error("Error while executing query", err)
		c.JSON(500, gin.H{"error": err.Error()})
		return
	}
	if serviceInstanceIDDb.Valid {
		utils.Logger.Error("Deployment already has service instance")
		c.JSON(400, gin.H{"error": "Deployment already has service instance"})
		return
	}
	// Check if deployment is owned by user
	query = "SELECT deployments.user_id, deployments.service_id, deployments.plan_id, deployments.service_provider_id, deployments.peering_id, service_providers.url FROM deployments, service_providers WHERE deployments.id = $1 AND deployments.service_provider_id = service_providers.id"
	// Execute query
	var deploymentUserID string
	var serviceID string
	var planID string
	var serviceProviderID string
	var peeringID sql.NullString
	var url string
	err = utils.DbConfig.Db.QueryRow(query, deploymentID).Scan(&deploymentUserID, &serviceID, &planID, &serviceProviderID, &peeringID, &url)
	if err != nil {
		utils.Logger.Error("Error while executing query", err)
		c.JSON(500, gin.H{"error": err.Error()})
		return
	}
	if deploymentUserID != userID {
		utils.Logger.Error("Deployment is not owned by user")
		c.JSON(403, gin.H{"error": "Deployment is not owned by user"})
		return
	}
	// Check if peering has been created
	if !peeringID.Valid {
		utils.Logger.Error("Peering has not been created")
		c.JSON(400, gin.H{"error": "Peering has not been created"})
		return
	}
	// Get peering status fetching API
	// Create request
	req, err := http.NewRequest("GET", url+"/peering/"+peeringID.String, nil)
	if err != nil {
		utils.Logger.Error("Error while creating request", err)
		c.JSON(500, gin.H{"error": err.Error()})
		return
	}

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

	// Set headers
	req.Header.Set("Content-Type", "application/json")
	req.Header.Set("X-Broker-API-Version", "2.17")
	req.Header.Set("Authorization", "Bearer "+mpJwt.AccessToken)

	// Send request
	clientHttp := &http.Client{}
	resp, err := clientHttp.Do(req)
	if err != nil {
		utils.Logger.Error("Error while sending request", err)
		c.JSON(500, gin.H{"error": err.Error()})
		return
	}
	defer resp.Body.Close()

	if(resp.StatusCode == http.StatusProcessing) {
		utils.Logger.Error("Peering is not ready")
		c.JSON(400, gin.H{"error": "Peering is not ready"})
		return
	}

	if (resp.StatusCode == http.StatusInternalServerError) {
		utils.Logger.Error("Error in the peering creation process from service provider")
		c.JSON(500, gin.H{"error": "Error in the peering creation process from service provider"})
		return
	}

	if (resp.StatusCode == http.StatusOK) {
		// Peering is working get namespace from response body
		// Read response body
		var remoteResponsePeering = map[string]interface{}{}
		decoder := json.NewDecoder(resp.Body)
		err = decoder.Decode(&remoteResponsePeering)
		if err != nil {
			utils.Logger.Error("Error while reading response body", err)
			c.JSON(500, gin.H{"error": err.Error()})
			return
		}
		// Get namespace
		remoteNamespace := remoteResponsePeering["namespace"].(string)

		// Create service instance request
		// Create body
		remoteServiceInstanceRequest := model.RemoteServiceInstanceRequest{
			ServiceID: serviceID,
			PlanID: planID,
			Context: map[string]interface{}{
				"namespace": remoteNamespace,
			},
			Parameters: serviceInstanceRequest.Parameters,
			UserID: userID,
		}
		
		// Wait for 1 second
		time.Sleep(1 * time.Second)
		// Create request
		req, err := http.NewRequest("PUT", url+"/v2/service_instances/"+serviceInstanceID+"?accepts_incomplete=true", nil)
		if err != nil {
			utils.Logger.Error("Error while creating request", err)
			c.JSON(500, gin.H{"error": err.Error()})
			return
		}

		// Set headers
		req.Header.Set("Content-Type", "application/json")
		req.Header.Set("X-Broker-API-Version", "2.17")
		req.Header.Set("Authorization", "Bearer "+mpJwt.AccessToken)

		// Set body
		body, err := json.Marshal(remoteServiceInstanceRequest)
		if err != nil {
			utils.Logger.Error("Error while marshalling body", err)
			c.JSON(500, gin.H{"error": err.Error()})
			return
		}
		req.Body = ioutil.NopCloser(bytes.NewReader(body))

		// Send request
		clientHttp := &http.Client{}
		resp, err := clientHttp.Do(req)
		if err != nil {
			utils.Logger.Error("Error while sending request", err)
			c.JSON(500, gin.H{"error": err.Error()})
			return
		}
		defer resp.Body.Close()

		if (resp.StatusCode == http.StatusOK || resp.StatusCode == http.StatusCreated) {
			// Create service instance into db and link it to the deployment
			query := "INSERT INTO service_instance_requests (service_instance_id) VALUES ($1) RETURNING id"
			var serviceInstanceRequestID int
			err = utils.DbConfig.Db.QueryRow(query, serviceInstanceID).Scan(&serviceInstanceRequestID)
			if err != nil {
				utils.Logger.Error("Error while inserting service instance request into db", err)
				c.JSON(500, gin.H{"error": err.Error()})
				return
			}

			// Update deployment to add service instance request id
			query = "UPDATE deployments SET service_instance_request_id = $1 WHERE id = $2"
			_, err = utils.DbConfig.Db.Exec(query, serviceInstanceRequestID, deploymentID)
			if err != nil {
				utils.Logger.Error("Error while updating deployment", err)
				c.JSON(500, gin.H{"error": err.Error()})
				return
			}
		} else if(resp.StatusCode == http.StatusAccepted) {
			// Get operation from response body
			// Read response body
			var remoteResponseServiceInstance = map[string]interface{}{}
			decoder := json.NewDecoder(resp.Body)
			err = decoder.Decode(&remoteResponseServiceInstance)
			if err != nil {
				utils.Logger.Error("Error while reading response body", err)
				c.JSON(500, gin.H{"error": err.Error()})
				return
			}
			// Get operation
			operation := remoteResponseServiceInstance["operation"].(string)

			// Create service instance into db and link it to the deployment
			query := "INSERT INTO service_instance_requests (service_instance_id, operation_id) VALUES ($1, $2) RETURNING id"
			var serviceInstanceRequestID int
			err = utils.DbConfig.Db.QueryRow(query, serviceInstanceID, operation).Scan(&serviceInstanceRequestID)
			if err != nil {
				utils.Logger.Error("Error while inserting service instance request into db", err)
				c.JSON(500, gin.H{"error": err.Error()})
				return
			}

			// Update deployment to add service instance request id
			query = "UPDATE deployments SET service_instance_request_id = $1 WHERE id = $2"
			_, err = utils.DbConfig.Db.Exec(query, serviceInstanceRequestID, deploymentID)
			if err != nil {
				utils.Logger.Error("Error while updating deployment", err)
				c.JSON(500, gin.H{"error": err.Error()})
				return
			}

			// Send response
			c.JSON(202, gin.H{"operation": operation})
		}
		// Read response body
		body, err = ioutil.ReadAll(resp.Body)
		if err != nil {
			utils.Logger.Error("Error while reading response body", err)
			c.JSON(500, gin.H{"error": err.Error()})
			return
		}

		// Set response data
		// Forward response
		c.Data(resp.StatusCode, resp.Header.Get("Content-Type"), body)	

	} else {
		utils.Logger.Error("Error getting peering status")
		c.JSON(500, gin.H{"error": "Error getting peering status, status: "+resp.Status})
		return
	}
}

func GetServiceInstancesHandler(c *gin.Context) {
	// Get userid from bearer tokenString
	// Get tokenString from authorization header
	tokenString := strings.Split(c.GetHeader("Authorization"), "Bearer ")[1]
	// Get userid from token
	ctx := context.Background()
	client := *(utils.ClientKeycloakConfig.Client)
	// Wait for 1 second
	time.Sleep(1 * time.Second)
	_, claims, err := client.DecodeAccessToken(ctx, tokenString, utils.ClientKeycloakConfig.Realm)
	if err != nil {
		utils.Logger.Error("Error while decoding access token", err)
		c.JSON(500, gin.H{"error": err.Error()})
		return
	}
	userID := (*claims)["sub"].(string)

	// Get deployment id from parameters
	deploymentID := c.Param("deploymentid")

	// Get user id, service provider url, service id, plan id, service instance id (from service instance request table) and operation id from database
	query := "SELECT deployments.user_id, service_providers.url, deployments.service_id, deployments.plan_id, deployments.service_instance_request_id, service_instance_requests.service_instance_id, service_instance_requests.operation_id FROM deployments INNER JOIN service_providers ON deployments.service_provider_id = service_providers.id INNER JOIN service_instance_requests ON deployments.service_instance_request_id = service_instance_requests.id WHERE deployments.id = $1"
	// Execute query
	var deploymentUserID string
	var url string
	var serviceId string
	var planId string
	var serviceInstanceRequestId sql.NullInt32
	var serviceInstanceID string
	var operationID sql.NullString
	err = utils.DbConfig.Db.QueryRow(query, deploymentID).Scan(&deploymentUserID, &url, &serviceId, &planId, &serviceInstanceRequestId, &serviceInstanceID, &operationID)
	if err != nil {
		utils.Logger.Error("Error while executing query", err)
		c.JSON(500, gin.H{"error": err.Error()})
		return
	}
	if deploymentUserID != userID {
		utils.Logger.Error("Deployment does not belong to the user")
		c.JSON(403, gin.H{"error": "Deployment does not belong to the user"})
		return
	}

	if operationID.Valid {
		// Operation in progress
		// Get last operation
		// Make request with query params
		// Wait for 1 second
		time.Sleep(1 * time.Second)
		req, err := http.NewRequest("GET", url+"/v2/service_instances/"+serviceInstanceID+"/last_operation?operation="+operationID.String, nil)
		if err != nil {
			utils.Logger.Error("Error while creating request", err)
			c.JSON(500, gin.H{"error": err.Error()})
			return
		}
		// Set headers
		req.Header.Set("Content-Type", "application/json")
		req.Header.Set("X-Broker-API-Version", "2.17")
		req.Header.Set("Authorization", "Bearer "+tokenString)
		// Make request
		clientHttp := &http.Client{}
		resp, err := clientHttp.Do(req)
		if err != nil {
			utils.Logger.Error("Error while making request", err)
			c.JSON(500, gin.H{"error": err.Error()})
			return
		}
		// Parse response body
		var remoteResponseServiceInstanceOperation map[string]interface{}
		err = json.NewDecoder(resp.Body).Decode(&remoteResponseServiceInstanceOperation)
		if err != nil {
			utils.Logger.Error("Error while decoding response body", err)
			c.JSON(500, gin.H{"error": err.Error()})
			return
		}
		// Check state to udnerstand if delete operation id or not
		state := remoteResponseServiceInstanceOperation["state"].(string)
		if (state == "succeeded") {
			// Operation succeeded return service instance
			// Delete operation id from database
			query = "UPDATE service_instance_requests SET operation_id = NULL WHERE id = $1"
			_, err = utils.DbConfig.Db.Exec(query, serviceInstanceRequestId)
			if err != nil {
				utils.Logger.Error("Error while updating service instance request", err)
				c.JSON(500, gin.H{"error": err.Error()})
				return
			}
		}
		// Forward parse response body
		c.JSON(resp.StatusCode, remoteResponseServiceInstanceOperation)		

	} else {
		// Service instance concluded return service instance
		// Make request with query params
		// Wait for 1 second
		time.Sleep(1 * time.Second)
		req, err := http.NewRequest("GET", url+"/v2/service_instances/"+serviceInstanceID+"?service_id="+serviceId+"&plan_id="+planId, nil)
		if err != nil {
			utils.Logger.Error("Error while creating request", err)
			c.JSON(500, gin.H{"error": err.Error()})
			return
		}
		// Set headers
		req.Header.Set("Content-Type", "application/json")
		req.Header.Set("X-Broker-API-Version", "2.17")
		req.Header.Set("Authorization", "Bearer "+tokenString)
		// Make request
		clientHttp := &http.Client{}
		resp, err := clientHttp.Do(req)
		if err != nil {
			utils.Logger.Error("Error while making request", err)
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
		// Forward response
		c.Data(resp.StatusCode, resp.Header.Get("Content-Type"), body)
	}
}

func AddServiceBindingsHandler(c *gin.Context) {
// Get userid from bearer tokenString
	// Get tokenString from authorization header
	tokenString := strings.Split(c.GetHeader("Authorization"), "Bearer ")[1]
	// Get userid from token
	ctx := context.Background()
	client := *(utils.ClientKeycloakConfig.Client)
	// Wait for 1 second
	time.Sleep(1 * time.Second)
	_, claims, err := client.DecodeAccessToken(ctx, tokenString, utils.ClientKeycloakConfig.Realm)
	if err != nil {
		utils.Logger.Error("Error while decoding access token", err)
		c.JSON(500, gin.H{"error": err.Error()})
		return
	}
	userID := (*claims)["sub"].(string)

	// Parse request body
	var serviceBindingRequest = model.ServiceBindingRequest{}
	decoder := json.NewDecoder(c.Request.Body)
	err = decoder.Decode(&serviceBindingRequest)
	if err != nil {
		utils.Logger.Error("Error while parsing request body", err)
		c.JSON(500, gin.H{"error": err.Error()})
		return
	}

	// Get serviceinstanceid from body
	serviceBindingID := serviceBindingRequest.ServiceBindingID
	// Check if serviceinstance is not null
	if serviceBindingID == "" {
		utils.Logger.Error("Service binding id is empty")
		c.JSON(400, gin.H{"error": "Service instance id is empty"})
		return
	}

	// Get deploymentid from path
	deploymentID := c.Param("deploymentid")
	// Check if deployment already has service instance
	query := "SELECT service_binding_request_id FROM deployments WHERE id = $1"
	// Execute query
	var serviceBindingIDDb sql.NullString
	err = utils.DbConfig.Db.QueryRow(query, deploymentID).Scan(&serviceBindingIDDb)
	if err != nil {
		utils.Logger.Error("Error while executing query", err)
		c.JSON(500, gin.H{"error": err.Error()})
		return
	}
	if serviceBindingIDDb.Valid {
		utils.Logger.Error("Deployment already has service binding")
		c.JSON(400, gin.H{"error": "Deployment already has service binding"})
		return
	}
	// Check if deployment is owned by user
	query = "SELECT deployments.user_id, deployments.service_id, deployments.plan_id, deployments.service_provider_id, deployments.peering_id, service_providers.url FROM deployments, service_providers WHERE deployments.id = $1 AND deployments.service_provider_id = service_providers.id"
	// Execute query
	var deploymentUserID string
	var serviceID string
	var planID string
	var serviceProviderID string
	var peeringID sql.NullString
	var url string
	err = utils.DbConfig.Db.QueryRow(query, deploymentID).Scan(&deploymentUserID, &serviceID, &planID, &serviceProviderID, &peeringID, &url)
	if err != nil {
		utils.Logger.Error("Error while executing query", err)
		c.JSON(500, gin.H{"error": err.Error()})
		return
	}
	if deploymentUserID != userID {
		utils.Logger.Error("Deployment is not owned by user")
		c.JSON(403, gin.H{"error": "Deployment is not owned by user"})
		return
	}
	// Check if peering has been created
	if !peeringID.Valid {
		utils.Logger.Error("Peering has not been created")
		c.JSON(400, gin.H{"error": "Peering has not been created"})
		return
	}
	// Get peering status fetching API
	// Create request
	req, err := http.NewRequest("GET", url+"/peering/"+peeringID.String, nil)
	if err != nil {
		utils.Logger.Error("Error while creating request", err)
		c.JSON(500, gin.H{"error": err.Error()})
		return
	}

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

	// Set headers
	req.Header.Set("Content-Type", "application/json")
	req.Header.Set("X-Broker-API-Version", "2.17")
	req.Header.Set("Authorization", "Bearer "+mpJwt.AccessToken)

	// Send request
	clientHttp := &http.Client{}
	// Wait 500ms
	time.Sleep(500 * time.Millisecond)
	resp, err := clientHttp.Do(req)
	if err != nil {
		utils.Logger.Error("Error while sending request", err)
		c.JSON(500, gin.H{"error": err.Error()})
		return
	}
	defer resp.Body.Close()

	if(resp.StatusCode == http.StatusProcessing) {
		utils.Logger.Error("Peering is not ready")
		c.JSON(400, gin.H{"error": "Peering is not ready"})
		return
	}

	if (resp.StatusCode == http.StatusInternalServerError) {
		utils.Logger.Error("Error in the peering creation process from service provider")
		c.JSON(500, gin.H{"error": "Error in the peering creation process from service provider"})
		return
	}

	if (resp.StatusCode == http.StatusOK) {
		// Peering is working get namespace from response body
		// Read response body
		var remoteResponsePeering = map[string]interface{}{}
		decoder := json.NewDecoder(resp.Body)
		err = decoder.Decode(&remoteResponsePeering)
		if err != nil {
			utils.Logger.Error("Error while reading response body", err)
			c.JSON(500, gin.H{"error": err.Error()})
			return
		}
		// Get namespace
		remoteNamespace := remoteResponsePeering["namespace"].(string)

		// Create service binding request
		// Create body
		remoteServiceBindingRequest := model.RemoteServiceBindingRequest{
			ServiceID: serviceID,
			PlanID: planID,
			Context: map[string]interface{}{
				"namespace": remoteNamespace,
			},
			Parameters: serviceBindingRequest.Parameters,
		}

		// Retrieve from db service instance id JOINING deployments and service_instances
		query = "SELECT service_instance_requests.service_instance_id FROM deployments, service_instance_requests WHERE deployments.id = $1 AND deployments.service_instance_request_id = service_instance_requests.id"
		// Execute query
		var serviceInstanceID sql.NullString
		err = utils.DbConfig.Db.QueryRow(query, deploymentID).Scan(&serviceInstanceID)
		if err != nil {
			utils.Logger.Error("Error while executing query", err)
			c.JSON(500, gin.H{"error": err.Error()})
			return
		}
		if !serviceInstanceID.Valid {
			utils.Logger.Error("No service instance found for deployment")
			c.JSON(400, gin.H{"error": "No service instance found for deployment"})
			return
		}
		
		// Wait for 1 second
		time.Sleep(1 * time.Second)
		// Create request
		req, err := http.NewRequest("PUT", url+"/v2/service_instances/"+serviceInstanceID.String+"/service_bindings/"+serviceBindingID+"?accepts_incomplete=true", nil)
		if err != nil {
			utils.Logger.Error("Error while creating request", err)
			c.JSON(500, gin.H{"error": err.Error()})
			return
		}

		// Set headers
		req.Header.Set("Content-Type", "application/json")
		req.Header.Set("X-Broker-API-Version", "2.17")
		req.Header.Set("Authorization", "Bearer "+tokenString)

		// Set body
		body, err := json.Marshal(remoteServiceBindingRequest)
		if err != nil {
			utils.Logger.Error("Error while marshalling body", err)
			c.JSON(500, gin.H{"error": err.Error()})
			return
		}
		req.Body = ioutil.NopCloser(bytes.NewReader(body))

		// Send request
		clientHttp := &http.Client{}
		resp, err := clientHttp.Do(req)
		if err != nil {
			utils.Logger.Error("Error while sending request", err)
			c.JSON(500, gin.H{"error": err.Error()})
			return
		}
		defer resp.Body.Close()

		if(resp.StatusCode == http.StatusOK || resp.StatusCode == http.StatusCreated) {
			// Create service instance into db and link it to the deployment
			// No operation id
			query := "INSERT INTO service_binding_requests (service_binding_id) VALUES ($1) RETURNING id"
			var serviceBindingRequestID int
			err = utils.DbConfig.Db.QueryRow(query, serviceBindingID).Scan(&serviceBindingRequestID)
			if err != nil {
				utils.Logger.Error("Error while inserting service instance request into db", err)
				c.JSON(500, gin.H{"error": err.Error()})
				return
			}

			// Update deployment to add service binding request id
			query = "UPDATE deployments SET service_binding_request_id = $1 WHERE id = $2"
			_, err = utils.DbConfig.Db.Exec(query, serviceBindingRequestID, deploymentID)
			if err != nil {
				utils.Logger.Error("Error while updating deployment", err)
				c.JSON(500, gin.H{"error": err.Error()})
				return
			}
		} else if (resp.StatusCode == http.StatusAccepted) {
			// Create service binding request into db and link it to the deployment with the operation id from the response

			// Get operation from response body
			// Read response body
			var remoteResponseServiceInstance = map[string]interface{}{}
			decoder := json.NewDecoder(resp.Body)
			err = decoder.Decode(&remoteResponseServiceInstance)
			if err != nil {
				utils.Logger.Error("Error while reading response body", err)
				c.JSON(500, gin.H{"error": err.Error()})
				return
			}
			// Get operation
			operation := remoteResponseServiceInstance["operation"].(string)

			// Create service instance into db and link it to the deployment
			// No operation id
			query := "INSERT INTO service_binding_requests (service_binding_id, operation_id) VALUES ($1, $2) RETURNING id"
			var serviceBindingRequestID int
			err = utils.DbConfig.Db.QueryRow(query, serviceBindingID, operation).Scan(&serviceBindingRequestID)
			if err != nil {
				utils.Logger.Error("Error while inserting service instance request into db", err)
				c.JSON(500, gin.H{"error": err.Error()})
				return
			}

			// Update deployment to add service binding request id
			query = "UPDATE deployments SET service_binding_request_id = $1 WHERE id = $2"
			_, err = utils.DbConfig.Db.Exec(query, serviceBindingRequestID, deploymentID)
			if err != nil {
				utils.Logger.Error("Error while updating deployment", err)
				c.JSON(500, gin.H{"error": err.Error()})
				return
			}
		}
		// Read response body
		body, err = ioutil.ReadAll(resp.Body)
		if err != nil {
			utils.Logger.Error("Error while reading response body", err)
			c.JSON(500, gin.H{"error": err.Error()})
			return
		}

		// Set response data
		// Forward response
		c.Data(resp.StatusCode, resp.Header.Get("Content-Type"), body)

	} else {
		utils.Logger.Error("Error getting peering status")
		c.JSON(500, gin.H{"error": "Error getting peering status, status: "+resp.Status})
		return
	}
}

func GetServiceBindingsHandler(c *gin.Context) {
	// Useless because service binding seems to be synchronous operation
	// Get userid from bearer tokenString
	// Get tokenString from authorization header
	tokenString := strings.Split(c.GetHeader("Authorization"), "Bearer ")[1]
	// Get userid from token
	ctx := context.Background()
	client := *(utils.ClientKeycloakConfig.Client)
	// Wait for 1 second
	time.Sleep(1 * time.Second)
	_, claims, err := client.DecodeAccessToken(ctx, tokenString, utils.ClientKeycloakConfig.Realm)
	if err != nil {
		utils.Logger.Error("Error while decoding access token", err)
		c.JSON(500, gin.H{"error": err.Error()})
		return
	}
	userID := (*claims)["sub"].(string)

	// Get deployment id from parameters
	deploymentID := c.Param("deploymentid")

	// query to get user id, service provider url, service id, plan id, service instance id (from service instance requests table), service binding id (from service binding requests table) and operation id from database
	query := "SELECT deployments.user_id, service_providers.url, deployments.service_id, deployments.plan_id, deployments.service_binding_request_id, service_binding_requests.service_binding_id, service_binding_requests.operation_id, service_instance_requests.service_instance_id FROM deployments INNER JOIN service_providers ON deployments.service_provider_id = service_providers.id INNER JOIN service_binding_requests ON deployments.service_binding_request_id = service_binding_requests.id INNER JOIN service_instance_requests ON deployments.service_instance_request_id = service_instance_requests.id WHERE deployments.id = $1"

	// Execute query
	var deploymentUserID string
	var url string
	var serviceId string
	var planId string
	var serviceBindingRequestId sql.NullInt32
	var serviceBindingID string
	var operationID sql.NullString
	var serviceInstanceID string
	err = utils.DbConfig.Db.QueryRow(query, deploymentID).Scan(&deploymentUserID, &url, &serviceId, &planId, &serviceBindingRequestId, &serviceBindingID, &operationID, &serviceInstanceID)
	if err != nil {
		utils.Logger.Error("Error while executing query", err)
		c.JSON(500, gin.H{"error": err.Error()})
		return
	}
	if deploymentUserID != userID {
		utils.Logger.Error("Deployment does not belong to the user")
		c.JSON(403, gin.H{"error": "Deployment does not belong to the user"})
		return
	}

	if operationID.Valid {
		// Operation in progress
		// Get last operation
		// Make request with query params
		// Wait for 1 second
		time.Sleep(1 * time.Second)
		req, err := http.NewRequest("GET", url+"/v2/service_instances/"+serviceInstanceID+"/service_bindings/"+serviceBindingID+"/last_operation?operation="+operationID.String, nil)
		if err != nil {
			utils.Logger.Error("Error while creating request", err)
			c.JSON(500, gin.H{"error": err.Error()})
			return
		}
		// Set headers
		req.Header.Set("Content-Type", "application/json")
		req.Header.Set("X-Broker-API-Version", "2.17")
		req.Header.Set("Authorization", "Bearer "+tokenString)
		// Make request
		clientHttp := &http.Client{}
		resp, err := clientHttp.Do(req)
		if err != nil {
			utils.Logger.Error("Error while making request", err)
			c.JSON(500, gin.H{"error": err.Error()})
			return
		}
		// Parse response body
		var remoteResponseServiceInstanceOperation map[string]interface{}
		err = json.NewDecoder(resp.Body).Decode(&remoteResponseServiceInstanceOperation)
		if err != nil {
			utils.Logger.Error("Error while decoding response body", err)
			c.JSON(500, gin.H{"error": err.Error()})
			return
		}
		// Check state to udnerstand if delete operation id or not
		state := remoteResponseServiceInstanceOperation["state"].(string)
		if (state == "succeeded") {
			// Operation succeeded return service instance
			// Delete operation id from database
			query = "UPDATE service_instance_requests SET operation_id = NULL WHERE id = $1"
			_, err = utils.DbConfig.Db.Exec(query, serviceBindingRequestId)
			if err != nil {
				utils.Logger.Error("Error while updating service instance request", err)
				c.JSON(500, gin.H{"error": err.Error()})
				return
			}
		}
		// Forward parse response body
		c.JSON(resp.StatusCode, remoteResponseServiceInstanceOperation)		

	} else {
		// Service instance concluded return service instance
		// Make request with query params
		// Wait for 1 second
		time.Sleep(1 * time.Second)
		req, err := http.NewRequest("GET", url+"/v2/service_instances/"+serviceInstanceID+"/service_bindings/"+serviceBindingID+"?service_id="+serviceId+"&plan_id="+planId, nil)
		if err != nil {
			utils.Logger.Error("Error while creating request", err)
			c.JSON(500, gin.H{"error": err.Error()})
			return
		}
		// Set headers
		req.Header.Set("Content-Type", "application/json")
		req.Header.Set("X-Broker-API-Version", "2.17")
		req.Header.Set("Authorization", "Bearer "+tokenString)
		// Make request
		clientHttp := &http.Client{}
		resp, err := clientHttp.Do(req)
		if err != nil {
			utils.Logger.Error("Error while making request", err)
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
		// Forward response
		c.Data(resp.StatusCode, resp.Header.Get("Content-Type"), body)
	}
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
