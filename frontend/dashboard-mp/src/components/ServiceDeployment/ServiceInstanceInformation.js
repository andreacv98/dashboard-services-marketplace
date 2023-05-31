import { Container, Row, Col, Form, Collapse, Button, Card, Modal, Spinner } from "react-bootstrap";
import { Form as JSONForm } from '@rjsf/bootstrap-4';
import { useAuth } from "react-oidc-context";
import { instanceService } from "../../configs/marketplaceConfig";
import validator from '@rjsf/validator-ajv8';
import DisclaimerInfo from "../Utils/DisclaimerInfo";
import { useState } from "react";
import { XCircleFill, CheckCircleFill } from "react-bootstrap-icons";

function ServiceInstanceInformation(props) {

    const auth = useAuth();

    const [showModal, setShowModal] = useState(false);

    const serviceInstanceCreated = props.serviceInstanceCreated;
    const setServiceInstanceCreated = props.setServiceInstanceCreated;

    const setStep = props.setStep;
    const setError = props.setError;
    const error = props.error;

    const serviceInstanceId = props.serviceInstanceId;
    const setServiceInstanceId = props.setServiceInstanceId;

    const instanceData = props.instanceData;
    const setInstanceData = props.setInstanceData;

    const instanceStatus = props.instanceStatus;
    const setInstanceStatus = props.setInstanceStatus;

    const instanceStarted = props.instanceStarted;
    const setInstanceStarted = props.setInstanceStarted;

    const instanceCheckPhase = props.instanceCheckPhase;
    const setInstanceCheckPhase = props.setInstanceCheckPhase;

    const namespace = props.namespace;

    const idDeployment = props.idDeployment;

    const parameters = props.parameters;

    const generalDisclaimerTitle = "Service creation"
    const generalDisclaimerText = (
        <Container className="p-2">
            <p>
            You will create the main components of the service you are implementing.
            This may take some time and may require some information to create the service instance. Please check below.
            <br/>
            <b>Please note:</b> the service may not be immediately operational if it also needs binding information. 
            </p>
        </Container>
    )

    const serviceNameDisclaimerTitle = "Service deployment name"
    const serviceNameDisclaimerText = (
        <Container className="p-2">
            <p>
                The service deplopyment name is the name if the effective instance of service you're going to create.
                It's needed by the catalog to uniquely identify the service instance and so your deployment.
            </p>
        </Container>
    )

    const serviceParametersDisclaimerTitle = "Service parameters"
    const serviceParametersDisclaimerText = (
        <Container className="p-2">
            <p>
                Each service may require some parameters to be set in order to be correctly deployed.
                These parameters are defined by the service catalog and some may be mandatory.
            </p>
        </Container>
    )

    const uiSchemaInstance = {
        'ui:submitButtonOptions': {
            submitText: 'Create service',
            props: {
                disabled: (instanceStatus || instanceStarted)
            },
          },
    }

    const handleServiceInstance = (e) => {
        //e.preventDefault();
        if (namespace === "") {
            setError("No namespace is available")
            return
        } else {
            setError("")
            // Check if service instance id is set
            if (serviceInstanceId === "" && validator.isValid) {
                setError("Please provides a service instance id")
                return
            } else {
                setError("")
                setInstanceStarted(true)
                setShowModal(true)
                // Send service instance request to marketplace
                instanceService(
                    auth.user?.access_token,
                    idDeployment,
                    instanceData,
                    serviceInstanceId
                ).then((response) => {
                    if (response.status === 202) {
                        // Service instance has been started
                        setInstanceCheckPhase(true)
                        setServiceInstanceCreated(true)
                    } else if (response.status === 201) {
                        // Service instance has been already created
                        setInstanceStarted(false)
                        setInstanceStatus(true)
                    } else {
                        setError("Error while creating the service instance")
                        setInstanceStarted(false)
                    }
                }).catch((error) => {
                    setError(error.message)
                    setInstanceStarted(false)
                })
            }
        }
    }

    return (
        <Container>
            <Row>
                <Col>
                    <h4>
                        3/5 - Service creation
                        <DisclaimerInfo
                            disclaimerTitle={generalDisclaimerTitle}
                            disclaimerText={generalDisclaimerText}
                        />
                    </h4>
                </Col>
            </Row>
            <Row>
                <Col>
                    <Card className="m-3 p-3">
                        <p>
                            <b>1. Insert a name for the service deployment you're creating</b>
                            <DisclaimerInfo
                                disclaimerTitle={serviceNameDisclaimerTitle}
                                disclaimerText={serviceNameDisclaimerText}
                            />
                        </p>
                        <Form>
                            <fieldset disabled={serviceInstanceCreated}>
                                <Form.Group controlId="formServiceInstanceId" className="ms-3 me-3 mb-3">
                                    <Form.Label>Service deployment name</Form.Label>
                                    <Form.Control
                                    type="text"
                                    placeholder="Insert here the name of the service deployment"
                                    value={serviceInstanceId}
                                    onChange={(e) => {
                                        const inputValue = e.target.value.toLowerCase();
                                        setServiceInstanceId(inputValue);
                                    }}
                                    onBlur={() => {
                                        const regex = /^[a-z0-9]([-a-z0-9]*[a-z0-9])?(\.[a-z0-9]([-a-z0-9]*[a-z0-9])?)*$/;
                                        const filteredValue = serviceInstanceId.replace(/[^a-z0-9.-]/g, "");
                                        const match = filteredValue.match(regex);
                                        if (match) {
                                          setServiceInstanceId(match[0]);
                                        } else {
                                          setServiceInstanceId("");
                                        }
                                    }}
                                    />
                                </Form.Group>
                            </fieldset>                            
                        </Form>
                    </Card>                    
                </Col>                
            </Row>
            <Row>
                <Col>
                    <Collapse in={serviceInstanceId !== ""}>
                        <Card className="m-3 p-3">
                            <p>
                                <b>2. Complete the parameters required by the catalog</b>
                                <DisclaimerInfo
                                    disclaimerTitle={serviceParametersDisclaimerTitle}
                                    disclaimerText={serviceParametersDisclaimerText}
                                />
                            </p>
                            <JSONForm
                                schema={parameters}
                                validator={validator}
                                formData={instanceData}
                                onChange={(e) => setInstanceData(e.formData)}
                                onSubmit={handleServiceInstance}
                                onError={(error) => setError(error.message)}
                                uiSchema={uiSchemaInstance}
                                className="ms-3 me-3 mb-3"
                                disabled={serviceInstanceCreated}
                            />
                        </Card>                        
                    </Collapse>
                </Col>
            </Row>
            <Row>
                <Col>
                    <Button variant="outline-primary" type="button" onClick={() => setStep(2)} className='me-3'>Back</Button>
                    <Button variant="primary" onClick={() => setStep(4)} className="m-3" disabled={!instanceStatus}>Next</Button>
                </Col>
            </Row>
            <Modal show={showModal} onHide={() => setShowModal(false)}>
                <Modal.Header closeButton>
                    <Modal.Title>We're creating the service for you</Modal.Title>
                </Modal.Header>
                <Modal.Body className="d-flex align-items-center">
                    {instanceStarted ? 
                        instanceStatus ? (
                            <Container className="d-flex align-items-center flex-column p-3">
                                <CheckCircleFill color="green" size={100} className="mb-3" />
                                <p className="text-center">Service created</p>
                            </Container>
                        ) : (
                            <Container className="d-flex align-items-center flex-column p-3">
                                <Spinner animation="border" size="lg" className="mb-3" />
                                <p className="text-center">Please wait</p>
                            </Container>
                        ) 
                    : (
                        error !== "" ?
                        (
                            <Container className="d-flex align-items-center flex-column p-3">
                                <XCircleFill color="red" size={100} className="mb-3" />
                                <p className="text-center">Something went wrong</p>
                            </Container>
                        ) : (
                            <>
                            </>
                        )
                    )
                    }
                </Modal.Body>
                <Modal.Footer>
                    {instanceStarted ? 
                        instanceStatus ? (
                            <>
                            <Button variant="primary" onClick={() => setShowModal(false)}>Close</Button>
                            <Button variant="primary" onClick={() => setStep(4)} className="m-3" disabled={!instanceStatus}>{"Next"}</Button>
                            </>
                        ) : (
                            <Button variant="primary" onClick={() => setShowModal(false)}>Close</Button>
                        ) 
                    : (
                        <Button variant="primary" onClick={() => setShowModal(false)}>Close</Button>
                    )
                    }
                </Modal.Footer>
            </Modal>
        </Container>
    )

}

export default ServiceInstanceInformation;