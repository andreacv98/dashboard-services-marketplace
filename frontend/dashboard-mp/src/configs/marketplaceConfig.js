const marketplace = {
    URL: 'http://localhost:3001'
}

export async function addServiceProvider (name, description, url, userToken) {
    let serviceProvider = {
        name: name,
        description: description,
        url: url
    }
    const response = await fetch(`${marketplace.URL}/service-providers`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + userToken
        },
        body: JSON.stringify(serviceProvider)
    });
    return response;
}

export async function getServiceProviders () {
    const response = await fetch(`${marketplace.URL}/service-providers`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json'
        }
    });
    return response;
}

export async function getServices (id) {
    const response = await fetch(`${marketplace.URL}/service-providers/${id}/services`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json'
        }
    });
    return response;
}

export async function subscribeService(serviceProviderId, serviceId, planId, userToken) {
    const response = await fetch(`${marketplace.URL}/service-providers/${serviceProviderId}/services/${serviceId}/plans/${planId}/subscribe`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + userToken
        }
    });
    return response;
}

export async function getSubscribedServices (userToken) {
    const response = await fetch(`${marketplace.URL}/subscriptions`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + userToken
        }
    });
    return response;
}

export async function getDeployment (userToken, id) {
    const response = await fetch(`${marketplace.URL}/deployments/${id}`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + userToken
        }
    });
    return response;
}

export async function getDeployments (userToken) {
    const response = await fetch(`${marketplace.URL}/deployments`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + userToken
        }
    });
    return response;
}

export async function deployService (userToken, serviceProviderId, serviceId, planId) {
    const response = await fetch(`${marketplace.URL}/deployments`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + userToken
        },
        body: JSON.stringify({
            service_provider_id: serviceProviderId,
            service_id: serviceId,
            plan_id: planId
        })
    });
    return response;
}

export async function peerDeployment (userToken, deploymentId, serviceProviderId, ClusterId, ClusterName, AuthUrl, Token, OffloadingPolicy, PrefixNamespace) {
    const response = await fetch(`${marketplace.URL}/deployments/${deploymentId}/peering`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + userToken
        },
        body: JSON.stringify({
            service_provider_id: serviceProviderId,
            cluster_id: ClusterId,
            cluster_name: ClusterName,
            auth_url: AuthUrl,
            token: Token,
            offloading_policy: OffloadingPolicy,
            prefix_namespace: PrefixNamespace
        })
    });
    return response;
}

export async function instanceService (userToken, deploymentId, parameters, serviceInstanceId) {
    const response = await fetch(`${marketplace.URL}/deployments/${deploymentId}/service-instances`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + userToken
        },
        body: JSON.stringify({
            parameters: parameters,
            service_instance_id: serviceInstanceId
        })
    });
    return response;
}

export async function bindService (userToken, deploymentId, parameters, serviceBindingId) {
    const response = await fetch(`${marketplace.URL}/deployments/${deploymentId}/service-bindings`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + userToken
        },
        body: JSON.stringify({
            parameters: parameters,
            service_binding_id: serviceBindingId
        })
    });
    return response;
}

export async function checkPeering(deploymentId, userToken) {
    const response = await fetch(`${marketplace.URL}/deployments/${deploymentId}/peering`, {
        method: 'GET',
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${userToken}`,
        },
    });
    return response
}

export async function checkInstance(deploymentId, userToken) {
    const response = await fetch(`${marketplace.URL}/deployments/${deploymentId}/service-instances`, {
        method: 'GET',
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${userToken}`,
        },
    });
    return response
}

export async function checkBinding(deploymentId, userToken) {
    const response = await fetch(`${marketplace.URL}/deployments/${deploymentId}/service-bindings`, {
        method: 'GET',
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${userToken}`,
        },
    });
    return response
}

export default marketplace;