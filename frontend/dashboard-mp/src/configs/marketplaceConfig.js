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

export default marketplace;