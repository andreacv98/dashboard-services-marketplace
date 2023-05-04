import { useState, useEffect } from "react";
import { useAuth } from "react-oidc-context";
import { Navigate } from "react-router-dom";
import ServiceCard from "./ServiceCard";
import { getServiceProviders } from "../configs/marketplaceConfig";
import { getServices } from "../configs/marketplaceConfig";
import { Container, Row, Col } from "react-bootstrap";

function CatalogPage(props) {
    const auth = useAuth();
    const [shouldRedirect, setShouldRedirect] = useState(false);
    const isLoading = props.isLoading;
    const setIsLoading = props.setIsLoading;
    const [serviceProvidersServices, setServiceProvidersServices] = useState([]);

    useEffect(() => {
        // Get service providers from marketplace
        //if(auth.isAuthenticated) {
            getServiceProviders().then((response) => {
                if (response.status === 200) {
                    let svcs = [];
                    response.json().then((data) => {
                        if (data.service_providers === undefined) {
                            data.service_providers = [];
                        }
                        let svcProviders = data.service_providers;
                        const promises = svcProviders.map(async (serviceProvider) => {
                            response = await getServices(serviceProvider.id);
                            if (response.status === 200) {
                                data = await response.json()
                                let serviceProviderServices = {
                                    "idServiceProvider": serviceProvider.id,
                                    "services": []
                                }
                                serviceProviderServices.services = data.services;
                                svcs = [...svcs, serviceProviderServices];
                            } else {
                                console.log("Error getting service providers from marketplace");
                            }
                        })
                        Promise.all(promises).then(() => {
                            setServiceProvidersServices(svcs);
                        })
                    })
                } else {
                    console.log("Error getting service providers from marketplace");
                }
            }
            )
        //}        
    }, [])

    /*useEffect (() => {
        if (auth.activeNavigator === "signoutSilent") {
            setShouldRedirect(true);
        }
    }, [auth.activeNavigator])*/

    /*useEffect(() => {
        if (auth.isLoading) {
            setIsLoading(true);
        } else {
            setIsLoading(false);
        }
    }, [auth.isLoading, setIsLoading])*/

    /*if (!auth.isLoading && shouldRedirect) {
        return <Navigate to="/" />;
    }*/

   // if (!auth.isLoading) {
        // Check if user authenticated
        //if (auth.isAuthenticated) {
            return (
                <>
                <Container className="m-2">
                    <Row className="text-center">
                        <Col>
                            <h1>Catalog</h1>
                        </Col>                        
                    </Row>
                    <Row>
                        <Col>
                            {
                                serviceProvidersServices.map((serviceProviderServices) => (
                                    serviceProviderServices.services.map((service) => (
                                        <ServiceCard service={service} key={service.id} id={service.id} title={service.name} description={service.description} tags={service.tags} serviceProviderID={serviceProviderServices.idServiceProvider}/>
                                    ))
                                ))
                            }
                        </Col>
                    </Row>                    
                </Container>
                </>                
            )
    //    } else {
    //        auth.signinRedirect()
    //    }
    //}
}

export default CatalogPage;