import React, { useState, useEffect } from "react";
import { Navigate, useParams } from "react-router-dom";
import { useAuth } from "react-oidc-context";
import { Alert, Col, Row } from "react-bootstrap";
import { Container } from "react-bootstrap";
import DeployForm from "./DeployForm";
import DeployStatusSummary from "./DeployStatusSummary";
import { getDeployment } from "../configs/marketplaceConfig";

function DeployPage(props) {
    const auth = useAuth();
    const isLoading = props.isLoading;
    const setIsLoading = props.setIsLoading;
    const [error, setError] = useState("");
    const [subscribedServices, setSubscribedServices] = useState([]);
    const [shouldRedirect, setShouldRedirect] = useState(false);

    const [idServiceProvider, setIdServiceProvider] = useState("");
    const [idService, setIdService] = useState("");
    const [idPlan, setIdPlan] = useState("");
    const [idPeering, setIdPeering] = useState("");
    const [idInstance, setIdInstance] = useState("");
    const [idBinding, setIdBinding] = useState("");
    const [instanceOperation, setInstanceOperation] = useState("");
    const [bindingOperation, setBindingOperation] = useState("");

    // idDeployment from URL
    const { idDeployment } = useParams();

    const [peeringStatus, setPeeringStatus] = useState(false);
    const [peeringStarted, setPeeringStarted] = useState(false);
    const [instanceStatus, setInstanceStatus] = useState(false);
    const [instanceStarted, setInstanceStarted] = useState(false);
    const [bindingStatus, setBindingStatus] = useState(false);
    const [bindingStarted, setBindingStarted] = useState(false);

    useEffect(() => {
        if(auth.isAuthenticated) {
            setIsLoading(true);
            if (idDeployment !== undefined) {
                getDeployment(auth.user?.access_token, idDeployment).then((response) => {
                    if (response.status === 200) {
                        response.json().then((deployment) => {
                            //console.log("DEPLOYMENT: "+JSON.stringify(deployment));
                            setIdServiceProvider(deployment.service_provider_id);
                            setIdService(deployment.service_id);
                            setIdPlan(deployment.plan_id);
                            setIdPeering(deployment.peering_id);
                            setIdInstance(deployment.service_instance_id);
                            setIdBinding(deployment.service_binding_id);
                            setInstanceOperation(deployment.service_instance_operation);
                            setBindingOperation(deployment.service_binding_operation);
                            setIsLoading(false);
                        })                    
                    } else {
                        setError("Error getting deployment");
                        setIsLoading(false);
                    }
                }).catch((error) => {
                    setError("Error getting deployment");
                    setIsLoading(false);
                })
            } else {
                // Navigate to home
                setIsLoading(false);
                setShouldRedirect(true);
            }
        }
    }, [auth.isAuthenticated])                       


    useEffect (() => {
        if (auth.activeNavigator === "signoutSilent") {
            setShouldRedirect(true);
        }
    }, [auth.activeNavigator])

    if (!auth.isLoading && shouldRedirect) {
        return <Navigate to="/" />;
    }

    if (!auth.isLoading) {
        // Check if user authenticated
        if (auth.isAuthenticated) {
            return (
                <Container>
                    <Row className="text-center m-2">
                        <Col>
                            <h1>Deploy service</h1>
                        </Col>                        
                    </Row>
                    <Row>
                        <Col>
                            <Alert variant="danger" show={error !== ""}>
                                {error}
                            </Alert>
                        </Col>
                    </Row>
                    <Row>
                        
                        {
                            idServiceProvider !== "" && idService !== "" && idPlan !== "" ? 
                            (
                                <>
                                <Col>
                                    <DeployForm
                                    idDeployment={idDeployment}
                                    idServiceProvider={idServiceProvider}
                                    idService={idService}
                                    idPlan={idPlan}
                                    idPeering={idPeering}
                                    idInstance={idInstance}
                                    idBinding={idBinding}
                                    instanceOperation={instanceOperation}
                                    bindingOperation={bindingOperation}
                                    isLoading={isLoading}
                                    setIsLoading={setIsLoading}
                                    error={error}
                                    setError={setError}
                                    peeringStatus={peeringStatus}
                                    setPeeringStatus={setPeeringStatus}
                                    instanceStatus={instanceStatus}
                                    setInstanceStatus={setInstanceStatus}
                                    bindingStatus={bindingStatus}
                                    setBindingStatus={setBindingStatus}
                                    peeringStarted={peeringStarted}
                                    setPeeringStarted={setPeeringStarted}
                                    instanceStarted={instanceStarted}
                                    setInstanceStarted={setInstanceStarted}
                                    bindingStarted={bindingStarted}
                                    setBindingStarted={setBindingStarted}
                                    />
                                </Col>
                                <Col md="auto">
                                    <DeployStatusSummary
                                    peeringStatus={peeringStatus}
                                    instanceStatus={instanceStatus}
                                    bindingStatus={bindingStatus}
                                    peeringStarted={peeringStarted}
                                    instanceStarted={instanceStarted}
                                    bindingStarted={bindingStarted}
                                    />
                                </Col>
                                </>
                                
                            ) :
                            (
                                <Col>
                                </Col>
                            )
                        }
                        
                    </Row>
                    
                </Container>
            )
        } else {
            auth.signinRedirect()
        }
    }

    
}

export default DeployPage;