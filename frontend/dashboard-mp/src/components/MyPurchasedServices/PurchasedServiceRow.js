import { useEffect } from "react";
import { useState } from "react";
import { deployService } from "../../configs/marketplaceConfig";
import {Button} from 'react-bootstrap';
import { useAuth } from "react-oidc-context";

function PurchasedServiceRow(props) {
    const auth = useAuth();
    const idService = props.idService;
    const idServiceProvider = props.idServiceProvider;
    const idPlan = props.idPlan;
    const serviceProviderName = props.serviceProviderName;
    const createdAt = props.createdAt;
    const setError = props.setError;
    const catalogs = props.catalogs
    const setIsLoading = props.setIsLoading;

    const [serviceName, setServiceName] = useState("");
    const [planName, setPlanName] = useState("");

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

    const handleDeployment = () => {
        setIsLoading(true);
        // Deploy service through marketplace
        deployService(auth.user?.access_token, idServiceProvider, idService, idPlan).then((response) => {
            if (response.status === 200) {
                response.json().then((data) => {
                    let deploymentId = data.deployment_id;
                    // Navigate to deployment page
                    window.location.href = "/deployments/" + deploymentId;
                })
            } else {
                setError("Error deploying service: "+response.message);
                setIsLoading(false);
            }
        })
    }

    return (
        <tr>
            <td>{serviceName}</td>
            <td>{planName}</td>
            <td>{serviceProviderName}</td>
            <td>{new Date(createdAt).toLocaleString()}</td>
            <td><Button variant="primary" onClick={handleDeployment}>Deploy</Button></td>
        </tr>
    )
}

export default PurchasedServiceRow;