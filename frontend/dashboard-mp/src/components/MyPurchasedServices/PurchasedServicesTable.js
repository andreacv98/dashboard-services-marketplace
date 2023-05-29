import React, { useCallback, useEffect, useState } from 'react';
import { Table } from 'react-bootstrap';
import { getServices } from '../../configs/marketplaceConfig';
import PurchasedServiceRow from './PurchasedServiceRow';

function PurchasedServicesTable(props) {
    const purchasedServices = props.purchasedServices;
    const isLoading = props.isLoading;
    const setIsLoading = props.setIsLoading;
    const error = props.error;
    const setError = props.setError;

    const [catalogs, setCatalogs] = useState(new Map())
    const updateCatalog = useCallback((k,v) => {
        setCatalogs(new Map(catalogs.set(k,v)))
    }, [catalogs])

    useEffect(() => {
        // Retrive catalogs for each unique service provider of all subscribed service
        // Map each subscribedService to its serviceProvider
        let serviceProviderIds = purchasedServices.map((purchasedService) => (
            purchasedService.service_provider_id
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
    }, [purchasedServices, catalogs, setError, updateCatalog])

    return (
        <Table striped bordered hover>
            <thead>
                <tr>
                    <th>Service Name</th>
                    <th>Plan Name</th>
                    <th>Catalog</th>
                    <th>Purchase date</th>
                    <th>Deploy</th>
                </tr>
            </thead>
            <tbody>
                {purchasedServices.map((purchasedService) => (
                    <PurchasedServiceRow
                        key={purchasedService.id}
                        idService={purchasedService.service_id}
                        idPlan={purchasedService.plan_id}
                        idServiceProvider={purchasedService.service_provider_id}
                        purchasedId={purchasedService.id}
                        serviceProviderName={purchasedService.service_provider_name}
                        createdAt={purchasedService.created_at}
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

export default PurchasedServicesTable;