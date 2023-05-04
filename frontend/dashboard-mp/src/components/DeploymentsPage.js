import React, { useState, useEffect } from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "react-oidc-context";
import { Alert, Container } from "react-bootstrap";
import { getDeployments, getSubscribedServices } from "../configs/marketplaceConfig";
import DeploymentsTable from "./DeploymentsTable";

function DeploymentsPage (props) {
    const auth = useAuth();
    const isLoading = props.isLoading;
    const setIsLoading = props.setIsLoading;
    const [error, setError] = useState("");
    const [deployments, setDeployments] = useState([]);
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
            if (auth.isAuthenticated) {
                // Get deployments from marketplace
                getDeployments(auth.user.access_token).then((response) => {
                    if (response.status === 200) {
                        response.json().then((data) => {
                            if (data.deployments === undefined) {
                                setDeployments([]);
                            } else {
                                setDeployments(data.deployments);
                            }
                            setIsLoading(false);                            
                        }).catch((error) => {
                            console.log("Error getting deployments from marketplace: "+error);
                            setError("Error getting deployments from marketplace");
                            setIsLoading(false);
                        })
                    } else {
                        console.log("Error getting deployments from marketplace");
                        setError("Error getting deployments from marketplace");
                        setIsLoading(false);
                    }
                })
                .catch((error) => {
                    console.log("Error getting deployments from marketplace: "+error);
                    setError("Error getting deployments from marketplace");
                    setIsLoading(false);
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
                    <DeploymentsTable deployments={deployments} isLoading={isLoading} setIsLoading={setIsLoading} error={error} setError={setError}/>
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

export default DeploymentsPage;