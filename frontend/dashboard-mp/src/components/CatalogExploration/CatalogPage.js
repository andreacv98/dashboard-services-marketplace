import { useState, useEffect } from "react";
import ServiceCard from "./ServiceCard";
import { getServiceProviders } from "../../configs/marketplaceConfig";
import { getServices } from "../../configs/marketplaceConfig";
import { Container, Row, Col } from "react-bootstrap";

function CatalogPage(props) {
    const [serviceProvidersServices, setServiceProvidersServices] = useState([]);

    useEffect(() => {
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
    }, [])

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
}

export default CatalogPage;