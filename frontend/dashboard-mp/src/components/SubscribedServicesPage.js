import React, { useState, useEffect } from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "react-oidc-context";
import { Alert, Container } from "react-bootstrap";
import { getSubscribedServices } from "../configs/marketplaceConfig";
import SubscribedServicesTable from "./SubscribedServicesTable";

function SubscribedServicesPage (props) {
    const auth = useAuth();
    const isLoading = props.isLoading;
    const setIsLoading = props.setIsLoading;
    const [error, setError] = useState("");
    const [subscribedServices, setSubscribedServices] = useState([]);
    const [shouldRedirect, setShouldRedirect] = useState(false);

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
            if (auth.isAuthenticated) {
                // Get subscribed services from marketplace
                getSubscribedServices(auth.user.access_token).then((response) => {
                    if (response.status === 200) {
                        response.json().then((data) => {
                            if (data.subscriptions === undefined) {
                                setSubscribedServices([]);
                            } else {
                                setSubscribedServices(data.subscriptions);
                            }                            
                        })
                    } else {
                        console.log("Error getting subscribed services from marketplace");
                        setError("Error getting subscribed services from marketplace");
                    }
                })
                .catch((error) => {
                    console.log("Error getting subscribed services from marketplace");
                    setError("Error getting subscribed services from marketplace");
                })
            }
        }
    }, [auth.isLoading, setIsLoading])

    if (!auth.isLoading && shouldRedirect) {
        return <Navigate to="/" />;
    }

    if (!auth.isLoading) {
        // Check if user authenticated
        if (auth.isAuthenticated) {
            return (
                <Container>
                    <SubscribedServicesTable subscribedServices={subscribedServices} isLoading={isLoading} setIsLoading={setIsLoading} error={error} setError={setError}/>
                    <Alert variant="danger" show={error !== ""}>
                        {error}
                    </Alert>
                </Container>
            )
        } else {
            auth.signinRedirect()
        }
    }
    
}

export default SubscribedServicesPage;