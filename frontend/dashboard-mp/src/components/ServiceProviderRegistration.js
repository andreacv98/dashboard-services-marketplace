import { useAuth } from "react-oidc-context";
import ServiceProviderForm from "./ServiceProviderForm";
import { Navigate } from "react-router-dom";
import { useEffect, useState } from "react";

function ServiceProviderRegistration(props) {
    const auth = useAuth();
    const [shouldRedirect, setShouldRedirect] = useState(false);
    const isLoading = props.isLoading;
    const setIsLoading = props.setIsLoading;

    useEffect (() => {
        if (auth.activeNavigator === "signoutSilent") {
            setShouldRedirect(true);
        }
    }, [auth.activeNavigator])

    useEffect(() => {
        if (auth.isLoading) {
            setIsLoading(true);
        } else {
            setIsLoading(false);
        }
    }, [auth.isLoading, setIsLoading])

    if (!auth.isLoading && shouldRedirect) {
        return <Navigate to="/" />;
    }

    if (!auth.isLoading) {
        // Check if user authenticated
        if (auth.isAuthenticated) {
            return (
                <>
                    <ServiceProviderForm isLoading={isLoading} setIsLoading={setIsLoading}/>
                </>
            )
        } else {
            auth.signinRedirect()
        }
    }
}

export default ServiceProviderRegistration;