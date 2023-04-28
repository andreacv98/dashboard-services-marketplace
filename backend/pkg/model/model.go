package model

// AddServiceProviderRequest is the request to add a new service provider
type AddServiceProviderRequest struct {
	// Service provider name
	Name string `json:"name,omitempty"`
	// Service provider description
	Description string `json:"description,omitempty"`
	// Service provider URL
	URL string `json:"url,omitempty"`
}

// AddServiceProviderResponse is the response to add a new service provider
type AddServiceProviderResponse struct {
	// Authority URL
	AuthorityURL string `json:"authority_url,omitempty"`
	// Realm name
	Realm string `json:"realm,omitempty"`
	// Client ID
	ClientID string `json:"client_id,omitempty"`
	// Client secret
	ClientSecret string `json:"client_secret,omitempty"`
}

// Service provider response is the response to retrieve a single service provider
type ServiceProviderResponse struct {
	// ID of the service provider
	Id string `json:"id,omitempty"`
	// Service provider name
	Name string `json:"name,omitempty"`
	// Service provider description
	Description string `json:"description,omitempty"`
	// Service provider URL
	URL string `json:"url,omitempty"`
}

// Service providers list response is the response to retrieve all service providers
type ServiceProvidersListResponse struct {
	// List of service providers
	ServiceProviders []ServiceProviderResponse `json:"service_providers,omitempty"`
}

// Subscription is the subscription to a service
type Subscription struct {
	// ID of the subscription
	Id string `json:"id,omitempty"`
	// Service provider ID
	ServiceProviderId string `json:"service_provider_id,omitempty"`
	// Service provider name
	ServiceProviderName string `json:"service_provider_name,omitempty"`
	// Service provider URL
	ServiceProviderURL string `json:"service_provider_url,omitempty"`
	// Service ID
	ServiceId string `json:"service_id,omitempty"`
	// Service name
	ServiceName string `json:"service_name,omitempty"`
	// Plan ID
	PlanId string `json:"plan_id,omitempty"`
	// Plan name
	PlanName string `json:"plan_name,omitempty"`
}

// SubscriptionListResponse is the response to retrieve all subscriptions
type SubscriptionListResponse struct {
	// List of subscriptions
	Subscriptions []Subscription `json:"subscriptions,omitempty"`
}

// DeployServiceRequest is the request with the details of where to deploy a service
type DeployServiceRequest struct {
	// ClusterID
	ClusterID string `json:"cluster_id,omitempty"`
	// Cluster name
	ClusterName string `json:"cluster_name,omitempty"`
	// Auth token
	AuthToken string `json:"auth_token,omitempty"`
	// Auth URL
	AuthURL string `json:"auth_url,omitempty"`
	// PrefixNamespace
	PrefixNamespace string `json:"prefix_namespace,omitempty"`
}

// DeploymentRequest is the request to deploy a service
type DeploymentRequest struct {
	// Service provider ID
	ServiceProviderId string `json:"service_provider_id,omitempty"`
	// Service ID
	ServiceId string `json:"service_id,omitempty"`
	// Plan ID
	PlanId string `json:"plan_id,omitempty"`
}

// DeploymentResponse is the response to deploy a service
type DeploymentResponse struct {
	// Deployment ID
	DeploymentId string `json:"deployment_id,omitempty"`
}

// Deployment is the deployment of a service
type Deployment struct {
	// ID of the deployment
	Id string `json:"id,omitempty"`
	// Service provider ID
	ServiceProviderId string `json:"service_provider_id,omitempty"`
	// Service ID
	ServiceId string `json:"service_id,omitempty"`
	// Plan ID
	PlanId string `json:"plan_id,omitempty"`
	// Peering ID
	PeeringId string `json:"peering_id,omitempty"`
	// Service instance ID
	ServiceInstanceId string `json:"service_instance_id,omitempty"`
	// Service binding ID
	ServiceBindingId string `json:"service_binding_id,omitempty"`
}

// PeeringRequest is the request to create a peering.
type PeeringRequest struct {
	// ServiceProviderID is the ID of the service provider to ask the peer.
	ServiceProviderID string `json:"service_provider_id"`
	// ClusterID is the ID of the cluster to peer with.
	ClusterID string `json:"cluster_id"`
	// ClusterName is the name of the cluster to peer with.
	ClusterName string `json:"cluster_name"`
	// AuthURL is the Liqo peering auth URL.
	AuthURL string `json:"auth_url"`
	// Token is the Liqo peering token.
	Token string `json:"token"`
	// OffloadingPolicy is the Liqo offloading policy.
	OffloadingPolicy string `json:"offloading_policy"`
	// Prefix namespace optionally used to create a namespace prefix.
	PrefixNamespace string `json:"prefix_namespace"`
}

// RemotePeeringRequest is the request to forward the peering request
type RemotePeeringRequest struct {
	// ClusterID is the ID of the cluster to peer with.
	ClusterID string `json:"cluster_id"`
	// ClusterName is the name of the cluster to peer with.
	ClusterName string `json:"cluster_name"`
	// AuthURL is the Liqo peering auth URL.
	AuthURL string `json:"auth_url"`
	// Token is the Liqo peering token.
	Token string `json:"token"`
	// OffloadingPolicy is the Liqo offloading policy.
	OffloadingPolicy string `json:"offloading_policy"`
	// UserID is the ID of the user to create the peering for.
	UserID string `json:"user_id"`
	// Prefix namespace optionally used to create a namespace prefix.
	PrefixNamespace string `json:"prefix_namespace"`
}

// ServiceInstanceRequest is the request to create a service instance.
type ServiceInstanceRequest struct {
	// ServiceInstanceParameters are the parameters of the service instance as RawExtension.
	Parameters interface{} `json:"parameters"`
	// ServiceInstanceID
	ServiceInstanceID string `json:"service_instance_id"`
}

// RemoteServiceInstanceRequest is the request to forward to the service provider to create a service instance.
// Only effective used fileds are put, but other could be used, see specifications.
type RemoteServiceInstanceRequest struct {
	ServiceID        string                `json:"service_id"`
	PlanID           string                `json:"plan_id"`
	Context          interface{} 			`json:"context"`
	Parameters       interface{} 			`json:"parameters"`
	UserID			 string                `json:"user_id"`
}

// ServiceBindingRequest is the request to create a service binding.
type ServiceBindingRequest struct {
	// ServiceBindingParameters are the parameters of the service binding as RawExtension.
	Parameters interface{} `json:"parameters"`
	// ServiceBindingID
	ServiceBindingID string `json:"service_binding_id"`
}

// RemoteServiceBindingRequest is the request to forward to the service provider to create a service binding.
// Only effective used fileds are put, but other could be used, see specifications.
type RemoteServiceBindingRequest struct {
	ServiceID        string                `json:"service_id"`
	PlanID           string                `json:"plan_id"`
	Context          interface{} 			`json:"context"`
	Parameters       interface{} 			`json:"parameters"`
}

// DeploymentsListResponse is the response to retrieve all deployments
type RetrieveDeploymentsListResponse struct {
	// List of deployments
	Deployments []RetrieveDeploymentResponse `json:"deployments,omitempty"`
}

// DeploymentResponse is the response to retrieve a single deployment
type RetrieveDeploymentResponse struct {
	// ID of the deployment
	Id string `json:"id,omitempty"`
	// Service provider ID
	ServiceProviderId string `json:"service_provider_id,omitempty"`
	// Service ID
	ServiceId string `json:"service_id,omitempty"`
	// Plan ID
	PlanId string `json:"plan_id,omitempty"`
	// Peering ID
	PeeringId string `json:"peering_id,omitempty"`
	// Service instance ID
	ServiceInstanceId string `json:"service_instance_id,omitempty"`
	// Service instance operation
	ServiceInstanceOperation string `json:"service_instance_operation,omitempty"`
	// Service binding ID
	ServiceBindingId string `json:"service_binding_id,omitempty"`
	// Service binding operation
	ServiceBindingOperation string `json:"service_binding_operation,omitempty"`
}
