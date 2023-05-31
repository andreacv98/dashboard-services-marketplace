import { useEffect } from "react";
import { useState } from "react";
import { checkPeering } from "../../configs/marketplaceConfig";
import { useAuth } from "react-oidc-context";
import { Button, Container, Modal } from "react-bootstrap";
import { CheckCircleFill, XCircleFill } from "react-bootstrap-icons";

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
    const createdAt = props.createdAt;

    const [namespace, setNamespace] = useState("Loading...")
    const [showDetails, setShowDetails] = useState(false)

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
        <>
        <tr>
            <td>{serviceName}</td>
            <td>{planName}</td>
            <td>{serviceProviderName}</td>
            <td>
                { 
                    peeringId !== undefined ? (
                        <Container className="text-success"><CheckCircleFill /></Container>
                    ) : (
                        <Container className="text-danger"><XCircleFill /></Container>
                    )
                }
            </td>
            <td>
                { 
                    serviceInstanceId !== undefined ? (
                        serviceInstanceOperation !== undefined ? (
                            <p className=".text-info">Service instance in progress</p>
                        ) : (
                            <Container className="text-success"><CheckCircleFill /></Container>
                        )
                    ) : (
                        <Container className="text-danger"><XCircleFill /></Container>
                    )
                }
            </td>
            <td>
                { 
                    serviceBindingId !== undefined ? (
                        serviceBindingOperation !== undefined ? (
                            <p className=".text-info">Service binding in progress</p>
                        ) : (
                            <Container className="text-success"><CheckCircleFill /></Container>
                        )
                    ) : (
                        <Container className="text-danger"><XCircleFill /></Container>
                    )
                }
            </td>
            <td>{new Date(createdAt).toLocaleString()}</td>
            <td>
                <Button onClick={() => setShowDetails(true)}>
                    Details
                </Button>
            </td>
        </tr>
        <Modal show={showDetails} onHide={() => setShowDetails(false)}>
            <Modal.Header closeButton>
                <Modal.Title>Deployment details</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <p><b>Service name:</b> {serviceName}</p>
                <p><b>Plan name:</b> {planName}</p>
                <p><b>Offered by:</b> {serviceProviderName}</p>
                {
                    peeringId !== undefined ? (
                        <p><b>Deployed into namespace:</b> {namespace}</p>
                    ) : (
                        <p><b>No peering established yet</b></p>
                    )
                }
                {
                    serviceInstanceId !== undefined ? (
                        <p><b>Service deployment named:</b> {serviceInstanceId}</p>
                    ) : (
                        <p><b>Service not instantiated yet</b></p>
                    )
                }
            </Modal.Body>
        </Modal>
        </>
        
    )
}

export default DeploymentRow;