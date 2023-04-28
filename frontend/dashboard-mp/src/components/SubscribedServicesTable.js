import React, { useEffect, useState } from 'react';
import { Table, Button } from 'react-bootstrap';
import { getServices, subscribeService } from '../configs/marketplaceConfig';
import SubscribedServiceRow from './SubscribedServiceRow';

function SubscribedServicesTable(props) {
    const subscribedServices = props.subscribedServices;
    const isLoading = props.isLoading;
    const setIsLoading = props.setIsLoading;
    const error = props.error;
    const setError = props.setError;

    const [catalogs, setCatalogs] = useState(new Map())
    const updateCatalog = (k,v) => {
        setCatalogs(new Map(catalogs.set(k,v)))
    }

    useEffect(() => {
        // Retrive catalogs for each unique service provider of all subscribed service
        // Map each subscribedService to its serviceProvider
        let serviceProviderIds = subscribedServices.map((subscribedService) => (
            subscribedService.service_provider_id
        ))
        serviceProviderIds.forEach(id => {
            if (catalogs.get(id) === undefined) {
                // Get services from marketplace
                getServices(id).then((response) => {
                    if (response.status === 200) {
                        response.json().then((data) => {
                            let servicesRetriven = data.services;
                            // Get service name  
                            updateCatalog(id, servicesRetriven)
                        })
                        .catch((error) => {
                            console.log("Error getting service providers from marketplace");
                            setError("Error getting services from marketplace");
                        })
                    } else {
                        console.log("Error getting service providers from marketplace");
                        setError("Error getting services from marketplace");
                    }
                })
                .catch((error) => {
                    console.log("Error getting service providers from marketplace");
                    setError("Error getting services from marketplace");
                })
            }
        });
    }, [subscribedServices])

    return (
        <Table striped bordered hover>
            <thead>
                <tr>
                    <th>Service Name</th>
                    <th>Plan Name</th>
                    <th>Service Provider</th>
                    <th>Deploy</th>
                </tr>
            </thead>
            <tbody>
                {subscribedServices.map((subscribedService) => (
                    <SubscribedServiceRow
                        key={subscribedService.id}
                        idService={subscribedService.service_id}
                        idPlan={subscribedService.plan_id}
                        idServiceProvider={subscribedService.service_provider_id}
                        subscriptionId={subscribedService.id}
                        serviceProviderName={subscribedService.service_provider_name}
                        error={error}
                        setError={setError}
                        catalogs={catalogs}
                        isLoading={isLoading}
                        setIsLoading={setIsLoading}
                    />
                ))}
            </tbody>
        </Table>
    )

}

export default SubscribedServicesTable;