const delay = ms => new Promise(
    resolve => setTimeout(resolve, ms)
  );

export async function checkServiceBrokerReadiness(url) {
    // Send HTTP request to url + /readyz
    // If response is 200, return true
    // Else return false
    // Check if url is valid
    try {
        new URL(url);
    } catch (_) {
        return false;
    }
    await delay(1000)
    const response = await fetch(`${url}/readyz`, {
        method: 'GET',
        headers: {},
    });
    console.log("Response: "+ response.status)
    if (response.status === 200) {
        return true;
    }
    return false;
}