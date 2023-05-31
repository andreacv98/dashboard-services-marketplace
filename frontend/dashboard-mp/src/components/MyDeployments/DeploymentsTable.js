import React, { useEffect, useState, useCallback } from 'react';
import { Table } from 'react-bootstrap';
import { getServices, getServiceProviders } from '../../configs/marketplaceConfig';
import DeploymentRow from './DeploymentRow';

function DeploymentsTable(props) {
    const deployments = props.deployments;
    const isLoading = props.isLoading;
    const setIsLoading = props.setIsLoading;
    const error = props.error;
    const setError = props.setError;

    const [catalogs, setCatalogs] = useState(new Map())
    const updateCatalog = useCallback((k,v) => {
        setCatalogs(new Map(catalogs.set(k,v)))
    }, [catalogs])

    const [serviceProviders, setServiceProviders] = useState([])

    useEffect(() => {
        // Retrieve all service providers
        getServiceProviders().then((response) => {
            if (response.status === 200) {
                response.json().then((data) => {
                    let serviceProvidersRetriven = data.service_providers;
                    setServiceProviders(serviceProvidersRetriven)
                })
                .catch((error) => {
                    console.log("Error getting service providers from marketplace");
                    setError("Error getting service providers from marketplace. " + error);
                })
            } else {
                console.log("Error getting service providers from marketplace");
                setError("Error getting service providers from marketplace");
            }
        })
        .catch((error) => {
            console.log("Error getting service providers from marketplace");
            setError("Error getting service providers from marketplace. " + error);
        })
    }, [setError])

    useEffect(() => {
        // Retrive catalogs for each unique service provider of all subscribed service
        // Map each subscribedService to its serviceProvider
        let serviceProviderIds = deployments.map((deployment) => (
            deployment.service_provider_id
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
                            setError("Error getting services from marketplace. " + error);
                        })
                    } else {
                        console.log("Error getting service providers from marketplace");
                        setError("Error getting services from marketplace");
                    }
                })
                .catch((error) => {
                    console.log("Error getting service providers from marketplace");
                    setError("Error getting services from marketplace. " + error);
                })
            }
        });
    }, [deployments, catalogs, setError, updateCatalog])

    return (
        <Table striped bordered hover>
            <thead>
                <tr>
                    <th>Service Name</th>
                    <th>Plan Name</th>
                    <th>Catalog</th>
                    <th>Peering</th>
                    <th>Service created</th>
                    <th>Service binded</th>
                    <th>Operation date</th>
                    <th>Actions</th>
                </tr>
            </thead>
            <tbody>
                {deployments.map((deployment) => (
                    <DeploymentRow
                        key={deployment.id}
                        idService={deployment.service_id}
                        idPlan={deployment.plan_id}
                        idServiceProvider={deployment.service_provider_id}
                        serviceProviders={serviceProviders}
                        deploymentId={deployment.id}
                        peeringId={deployment.peering_id}
                        serviceInstanceId={deployment.service_instance_id}
                        serviceInstanceOperation={deployment.service_instance_operation}
                        serviceBindingId={deployment.service_binding_id}
                        serviceBindingOperation={deployment.service_binding_operation}
                        createdAt={deployment.created_at}
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

export default DeploymentsTable;