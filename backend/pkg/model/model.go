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