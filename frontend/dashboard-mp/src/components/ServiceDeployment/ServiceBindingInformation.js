import { Container, Row, Col, Button, Card, Modal, Spinner } from "react-bootstrap";
import { Form as JSONForm } from '@rjsf/bootstrap-4';
import { useAuth } from "react-oidc-context";
import { bindService } from "../../configs/marketplaceConfig";
import validator from '@rjsf/validator-ajv8';
import DisclaimerInfo from "../Utils/DisclaimerInfo";
import { useEffect, useState } from "react";
import { XCircleFill, CheckCircleFill } from "react-bootstrap-icons";

function ServiceBindingInformation(props) {

    const auth = useAuth();

    const [showModal, setShowModal] = useState(false);

    const serviceBindingCreated = props.serviceBindingCreated;
    const setServiceBindingCreated = props.setServiceBindingCreated;

    const setStep = props.setStep;
    const setError = props.setError;
    const error = props.error;

    const serviceBindingId = props.serviceBindingId;
    const setServiceBindingId = props.setServiceBindingId;

    const bindingData = props.bindingData;
    const setBindingData = props.setBindingData;

    const bindingStatus = props.bindingStatus;
    const setBindingStatus = props.setBindingStatus;

    const bindingStarted = props.bindingStarted;
    const setBindingStarted = props.setBindingStarted;

    const bindingCheckPhase = props.bindingCheckPhase;
    const setBindingCheckPhase = props.setBindingCheckPhase;

    const namespace = props.namespace;

    const idDeployment = props.idDeployment;

    const parametersBinding = props.parametersBinding;

    const instanceData = props.instanceData;

    const serviceInstanceId = props.serviceInstanceId;

    const generalDisclaimerTitle = "Binding phase"
    const generalDisclaimerText = (
        <Container className="p-2">
            <p>
            You will create the bind beetwen the service instance and your application.
            <br />
            In this phase is even possible to set some parameters that will be used by the service instance to complete its deployment.
            </p>
        </Container>
    )

    const bindingParametersDisclaimerTitle = "Binding parameters"
    const bindingParametersDisclaimerText = (
        <Container className="p-2">
            <p>
                Some parameters may be required in order to create the binding.
            </p>
        </Container>
    )

    const uiSchemaBinding = {
        'ui:submitButtonOptions': {
            submitText: 'Create service binding',
            props: {
                disabled: (bindingStatus || bindingStarted)
            },
          },
    }

    const handleServiceBinding = (e) => {
        //e.preventDefault();
        if (namespace === "") {
            setError("No namespace is available")
            return
        } else {
            setError("")
            // Check if service binding id is set
            if (serviceBindingId === "" && validator.isValid) {
                setError("Please provides a service binding id")
                return
            } else {
                setBindingStarted(true)
                setBindingStarted(true)
                setShowModal(true)
                // Send service instance request to marketplace
                bindService(
                    auth.user?.access_token,
                    idDeployment,
                    bindingData,
                    serviceBindingId
                ).then((response) => {
                    if (response.status === 202) {
                        // Service binding has been started
                        setBindingCheckPhase(true)
                    } else if (response.status === 201) {
                        // Service Binding has been started
                        setBindingStatus(true)
                    } else {
                        setError("Error while creating the service binding")
                        setBindingStarted(false)
                    }
                }).catch((error) => {
                    setError(error.message)
                    setBindingStarted(false)
                })
            }
        }
    }

    useEffect(() => {
        setServiceBindingId(serviceInstanceId + "-binding")
    }, [serviceInstanceId])

    return (
        <Container>
            <Row>
                <Col>
                    <h4>
                        4/5 - Service creation
                        <DisclaimerInfo
                            disclaimerTitle={generalDisclaimerTitle}
                            disclaimerText={generalDisclaimerText}
                        />
                    </h4>
                </Col>
            </Row>
            <Row>
                <Col>                  
                </Col>                
            </Row>
            <Row>
                <Col>
                    <Card className="m-3 p-3">
                        <p>
                            <b>1. Complete the parameters required by the catalog</b>
                            <DisclaimerInfo
                                disclaimerTitle={bindingParametersDisclaimerTitle}
                                disclaimerText={bindingParametersDisclaimerText}
                            />
                        </p>
                        <JSONForm
                            schema={parametersBinding}
                            validator={validator}
                            formData={bindingData}
                            onChange={(e) => setBindingData(e.formData)}
                            onSubmit={handleServiceBinding}
                            onError={(error) => setError(error.message)}
                            uiSchema={uiSchemaBinding}
                            className="ms-3 me-3 mb-3"
                            disabled={serviceBindingCreated}
                        />
                    </Card>
                </Col>
            </Row>
            <Row>
                <Col>
                    <Button variant="outline-primary" type="button" onClick={() => setStep(3)} className='me-3'>Back</Button>
                    <Button variant="primary" onClick={() => setStep(5)} className="m-3" disabled={!bindingStatus}>Next</Button>
                </Col>
            </Row>
            <Modal show={showModal} onHide={() => setShowModal(false)}>
                <Modal.Header closeButton>
                    <Modal.Title>We're establishing binding the service for you</Modal.Title>
                </Modal.Header>
                <Modal.Body className="d-flex align-items-center">
                    {bindingStarted ? 
                        bindingStatus ? (
                            <Container className="d-flex align-items-center flex-column p-3">
                                <CheckCircleFill color="green" size={100} className="mb-3" />
                                <p className="text-center">Binding created</p>
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
                    {bindingStarted ? 
                        bindingStatus ? (
                            <>
                            <Button variant="primary" onClick={() => setShowModal(false)}>Close</Button>
                            <Button variant="primary" onClick={() => setStep(5)} className="m-3" disabled={!bindingStatus}>{"Next"}</Button>
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

export default ServiceBindingInformation;