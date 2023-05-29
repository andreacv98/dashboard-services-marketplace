import { useEffect } from "react";
import { useState } from "react";
import { checkPeering } from "../../configs/marketplaceConfig";
import { useAuth } from "react-oidc-context";

function DeploymentRow(props) {
    const auth = useAuth();
    const idService = props.idService;
    const idServiceProvider = props.idServiceProvider;
    const idPlan = props.idPlan;
    const deploymentId = props.deploymentId;
    const peeringId = props.peeringId;
    const serviceInstanceId = props.serviceInstanceId;
    const serviceInstanceOperation = props.serviceInstanceOperation;
    const serviceBindingId = props.serviceBindingId;
    const serviceBindingOperation = props.serviceBindingOperation;
    const [serviceProviderName, setServiceProviderName] = useState("Loading...");
    const setError = props.setError;
    const catalogs = props.catalogs
    const serviceProviders = props.serviceProviders;

    const [namespace, setNamespace] = useState("Loading...")

    const [serviceName, setServiceName] = useState("");
    const [planName, setPlanName] = useState("");

    useEffect(() => {
        let serviceProvider = serviceProviders.find(serviceProvider => serviceProvider.id === idServiceProvider);
        setServiceProviderName(serviceProvider.name)
    }, [idServiceProvider, serviceProviders])

    useEffect(() => {
        let services = catalogs.get(idServiceProvider)
        if (services === undefined) {
            // Get service from marketplace
            setServiceName("Loading...")
            setPlanName("Loading...")
        } else {
            // Get service name
            let serviceFound = services.find(service => service.id === idService);
            let planFound = serviceFound.plans.find(plan => plan.id === idPlan);

            setServiceName(serviceFound.name)
            setPlanName(planFound.name)
        }
        
    }, [idService, idServiceProvider, catalogs, idPlan])

    useEffect(() => {
        if (peeringId !== undefined) {
            // Get namespace from peering
            checkPeering(
                deploymentId,
                auth.user?.access_token,
            ).then((response) => {
                if (response.status === 200) {
                    response.json().then((data) => {
                        setNamespace(data.namespace)
                    })
                } else {
                    setError("Error getting namespace: "+response.message);
                }
            })
        }
    }, [peeringId, deploymentId, auth.user?.access_token, setError])

    return (
        <tr>
            <td>{serviceName}</td>
            <td>{planName}</td>
            <td>{serviceProviderName}</td>
            <td>
                { 
                    peeringId !== undefined ? (
                        <p className=".text-success">Peered in namespace: {namespace}</p>
                    ) : (
                        <p className=".text-warning">Not peered yet</p>
                    )
                }
            </td>
            <td>
                { 
                    serviceInstanceId !== undefined ? (
                        serviceInstanceOperation !== undefined ? (
                            <p className=".text-info">Service instance in progress</p>
                        ) : (
                            <p className=".text-success">Service instance created with id: {serviceInstanceId}</p>
                        )
                    ) : (
                        <p className=".text-warning">No service instance</p>
                    )
                }
            </td>
            <td>
                { 
                    serviceBindingId !== undefined ? (
                        serviceBindingOperation !== undefined ? (
                            <p className=".text-info">Service binding in progress</p>
                        ) : (
                            <p className=".text-success">Service binding created with id: {serviceInstanceId}</p>
                        )
                    ) : (
                        <p className=".text-warning">No service binding</p>
                    )
                }
            </td>
        </tr>
    )
}

export default DeploymentRow;