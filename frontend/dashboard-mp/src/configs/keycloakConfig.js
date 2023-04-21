const keycloak = {
 authority: "https://auth.cvfnet.org/realms/service-broker",
 realm: "service-broker",
 client_id: "dashboard",
 redirect_uri: window.location.origin + window.location.pathname,
 scope: "openid profile email",
 //automaticSilentRenew: false,
 onSigninCallback: () => {
    window.history.replaceState({}, document.title, window.location.pathname);
  }
};

export default keycloak;