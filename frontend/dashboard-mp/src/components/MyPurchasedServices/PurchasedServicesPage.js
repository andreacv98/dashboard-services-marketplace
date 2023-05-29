import React, { useState, useEffect } from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "react-oidc-context";
import { Alert, Container, Row, Col } from "react-bootstrap";
import { getSubscribedServices } from "../../configs/marketplaceConfig";
import PurchasedServicesTable from "./PurchasedServicesTable";

function PurchasedServicesPage (props) {
    const auth = useAuth();
    const isLoading = props.isLoading;
    const setIsLoading = props.setIsLoading;
    const [error, setError] = useState("");
    const [purchasedServices, setPurchasedServices] = useState([]);
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
                // Get purchasedservices from marketplace
                getSubscribedServices(auth.user?.access_token).then((response) => {
                    if (response.status === 200) {
                        response.json().then((data) => {
                            if (data.subscriptions === undefined) {
                                setPurchasedServices([]);
                            } else {
                                setPurchasedServices(data.subscriptions);
                            }
                            setIsLoading(false);                            
                        }).catch((error) => {
                            console.log("Error getting purchasedservices from marketplace: "+error);
                            setError("Error getting purchasedservices from marketplace");
                            setIsLoading(false);
                        })
                    } else {
                        console.log("Error getting purchasedservices from marketplace");
                        setError("Error getting purchasedservices from marketplace");
                        setIsLoading(false);
                    }
                })
                .catch((error) => {
                    console.log("Error getting purchasedservices from marketplace: "+error);
                    setError("Error getting purchasedservices from marketplace");
                    setIsLoading(false);
                })
            }
        }
    }, [auth.isLoading, setIsLoading, auth.isAuthenticated, auth.user?.access_token])

    if (!auth.isLoading && shouldRedirect) {
        return <Navigate to="/" />;
    }

    if (!auth.isLoading) {
        // Check if user authenticated
        if (auth.isAuthenticated) {
            return (
                <Container>
                    <Row className="text-center m-3">
                        <Col>
                            <h1>My Purchases</h1>
                        </Col>
                    </Row>
                    <Row className="m-2">
                        <Col>
                            <PurchasedServicesTable purchasedServices={purchasedServices} isLoading={isLoading} setIsLoading={setIsLoading} error={error} setError={setError}/>
                        </Col>
                    </Row>
                    <Row>
                        <Alert variant="danger" show={error !== ""}>
                            {error}
                        </Alert>
                    </Row>
                </Container>  
            )
        } else {
            auth.signinRedirect()
        }
    }
    
}

export default PurchasedServicesPage;