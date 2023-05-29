import React, { useState, useEffect } from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "react-oidc-context";
import { Alert, Col, Container, Row } from "react-bootstrap";
import {  getMyServiceProviders } from "../../configs/marketplaceConfig";
import MyCatalogsTable from "./MyCatalogsTable";

function MyCatalogsPage (props) {
    const auth = useAuth();
    const isLoading = props.isLoading;
    const setIsLoading = props.setIsLoading;
    const [error, setError] = useState("");
    const [myCatalogs, setMyCatalogs] = useState([]);
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
                // Get subscribed services from marketplace
                getMyServiceProviders(auth.user.access_token).then((response) => {
                    if (response.status === 200) {
                        response.json().then((data) => {
                            if (data.service_providers === undefined) {
                                setMyCatalogs([]);
                            } else {
                                setMyCatalogs(data.service_providers);
                            }
                            setIsLoading(false);                            
                        }).catch((error) => {
                            console.log("Error getting registered catalogs from marketplace: "+error);
                            setError("Error getting registered catalogs from marketplace");
                            setIsLoading(false);
                        })
                    } else {
                        console.log("Error getting registered catalogs from marketplace");
                        setError("Error getting registered catalogs from marketplace");
                        setIsLoading(false);
                    }
                })
                .catch((error) => {
                    console.log("Error getting registered catalogs from marketplace: "+error);
                    setError("Error getting registered catalogs from marketplace");
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
                    <Row className="text-center m-3">
                        <Col>
                            <h1>My Catalogs</h1>
                        </Col>
                    </Row>
                    <Row className="m-2">
                        <Col>
                            <MyCatalogsTable myCatalogs={myCatalogs} isLoading={isLoading} setIsLoading={setIsLoading} error={error} setError={setError}/>
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

export default MyCatalogsPage;