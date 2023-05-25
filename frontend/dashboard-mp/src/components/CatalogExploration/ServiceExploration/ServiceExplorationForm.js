import { Form, Button, Alert, Container, Row, Col, Tooltip, OverlayTrigger } from 'react-bootstrap';
import { useAuth } from 'react-oidc-context';
import { useEffect, useState } from 'react';
import { subscribeService, getServices } from '../../../configs/marketplaceConfig';
import { CheckCircleFill, Cloud, House, InfoCircleFill, Shuffle, XCircleFill } from 'react-bootstrap-icons';

function ServiceExplorationForm(props) {
    const auth = useAuth();
    const setIsLoading = props.setIsLoading;
    const idServiceProvider = props.idServiceProvider;
    const idService = props.idService;

    const [error, setError] = useState("");
    const [service, setService] = useState(null);

    const [planId, setPlanId] = useState("");
    const [planDescription, setPlanDescription] = useState("");
    const [peeringPolicies, setPeeringPolicies] = useState([]);

    const [created, setCreated] = useState(false);

    useEffect(() => {
        // Get service from marketplace
        setIsLoading(true);
        getServices(idServiceProvider).then((response) => {
            if (response.status === 200) {
                response.json().then((data) => {
                    let services = data.services;
                    let serviceFound = services.find(service => service.id === idService);
                    setService(serviceFound);
                    console.log(serviceFound);
                    setIsLoading(false);
                }).catch((error) => {
                    console.log("Error getting service from marketplace: "+error);
                    setError("Error getting service from marketplace");
                    setIsLoading(false);
                })
            } else {
                console.log("Error getting service from marketplace: "+error);
                setError("Error getting service from marketplace");
                setIsLoading(false);
            }
        })
        .catch((error) => {
            console.log("Error getting service from marketplace: "+error);
            setError("Error getting service from marketplace");
            setIsLoading(false);
        })
    }, [])

    useEffect(() => {
        if (service !== null) {
            handlePlanSelection({target: {value: service.plans[0].id}});
        }
    }, [service])

    const handlePlanSelection = (event) => {
        const selectedPlanId = event.target.value;
        if (selectedPlanId === "") {
            setPlanDescription("");
        } else {
            setPlanId(selectedPlanId);
            const selectedPlan = service.plans.find(plan => plan.id === selectedPlanId);
            setPlanDescription(selectedPlan.description);
            setPeeringPolicies(selectedPlan.peering_policies);
        }        
    }

    const handleSubscription = (event) => {
        event.preventDefault();
        if (planId === "") {
            setError("Please select a plan");
            return;
        }
        setIsLoading(true);
        console.log("Subscribing service: ", idService, " with plan: ", planId);
        subscribeService(idServiceProvider, idService, planId, auth.user.access_token).then((response) => {
            if (response.status === 200) {
                response.json().then((data) => {
                    console.log(data);
                    console.log("Service subscribed");
                    setCreated(true);
                    setIsLoading(false);
                })
            } else {
                console.log("Error subscribing service");
                setError("Error subscribing service");
                setIsLoading(false);
            }
        })
    }

    const renderTooltip = (text) => (
        <Tooltip id="tooltip">{text}</Tooltip>
      );

    if( service !== null && !created) {
        return (
            <Container className="d-flex justify-content-center align-items-center mt-3">
                <div className="w-50">
                    <h1>Buy service</h1>
                <Form>
                    <Form.Group className="mb-3" controlId="formService">
                        <Form.Label>Service name</Form.Label>
                        <Form.Control type="text" placeholder="Service name" value={service?.name} readOnly disabled/>
                    </Form.Group>
                    <Form.Group className="mb-3" controlId="formServiceDescription">
                        <Form.Label>Service description</Form.Label>
                        <Form.Control as="textarea" placeholder="Service description" value={service?.description} readOnly disabled rows={5}/>
                    </Form.Group>
                    <Form.Group className="mb-3" controlId="formServicePlans">
                        <Form.Label>Service plans</Form.Label>
                        <Form.Select aria-label="Service plans" onChange={handlePlanSelection}>
                        {service?.plans.map((plan, index) => {
                            return (
                            <option key={plan.id} value={plan.id}>{plan.name}</option>
                            )
                        })}
                        </Form.Select>
                    </Form.Group>
                    <Form.Group className="mb-3" controlId="formServicePlansDescriptions">
                        <Form.Label>Plan description</Form.Label>
                        <Form.Control as="textarea" placeholder="Plan description" value={planDescription} readOnly disabled rows={5}/>
                    </Form.Group>
                </Form>
                        <p>Hosting policies available</p>
                    <Container>
                    <Row>
                            <Col>
                                <p
                                    className= {peeringPolicies.includes("Remote") ? "text-success" : "text-danger"}
                                >
                                    <Cloud size={32} /> &ensp; Remotely hostable {peeringPolicies.includes("Remote") ? <CheckCircleFill size={20} /> : <XCircleFill size={20} />} <OverlayTrigger
                                    placement='right'
                                    overlay={renderTooltip("Remotely hosted by service provider cluster")}
                                >
                                    <span className='text-info'><InfoCircleFill size={20}/></span>
                                </OverlayTrigger></p>
                            </Col>                                
                        </Row>
                        <Row>
                            <Col>
                                <p
                                    className= {peeringPolicies.includes("Local") ? "text-success" : "text-danger"}
                                >
                                    <House size={32} /> &ensp; Locally hostable {peeringPolicies.includes("Local") ? <CheckCircleFill size={20} /> : <XCircleFill size={20} />} <OverlayTrigger
                                    placement='right'
                                    overlay={renderTooltip("Locally hosted by your cluster")}
                                >
                                    <span className='text-info'><InfoCircleFill size={20}/></span>
                                </OverlayTrigger></p>
                            </Col>
                        </Row>
                        <Row>
                            <Col>
                                <p
                                    className= {peeringPolicies.includes("LocalAndRemote") ? "text-success" : "text-danger"}
                                >
                                    <Shuffle size={32} /> &ensp; Hybridly hostable {peeringPolicies.includes("LocalAndRemote") ? <CheckCircleFill size={20} /> : <XCircleFill size={20} />} <OverlayTrigger
                                    placement='right'
                                    overlay={renderTooltip("Hybridly hosted by your cluster and service provider cluster")}
                                >
                                    <span className='text-info'><InfoCircleFill size={20}/></span>
                                </OverlayTrigger></p>
                            </Col>
                        </Row>
                    </Container>
                        
                    <Container>
                        <Row>
                            <Col>
                                <Button classname="mr-3" variant="primary" href="/catalog">
                                    Go Back
                                </Button>
                            </Col>
                            <Col>
                                <Button classname="mr-3" variant="primary" type="submit" onClick={handleSubscription}>
                                    Buy
                                </Button>
                            </Col>
                        </Row>
                    </Container>
                    
                    
                       
                <Alert variant="danger" show={error !== ""} onClose={() => setError("")} dismissible>
                    <Alert.Heading>Error</Alert.Heading>
                    <p>{error}</p>
                </Alert>
                </div>
            </Container>            
        )
    } else {
        return (
            <Container className="d-flex justify-content-center align-items-center mt-3">
                <Alert variant="danger" show={error !== ""} onClose={() => setError("")} dismissible>
                    <Alert.Heading>Error</Alert.Heading>
                    <p>{error}</p>
                </Alert>
                <Alert variant="success" show={created}>
                    <Alert.Heading>Successfully purchased the service</Alert.Heading>
                    <p>Service: {service?.name}</p>
                    <p>Plan: {service?.plans.find(plan => plan.id === planId)?.name}</p>
                    <Button href="/subscriptions">Purchases list</Button>
                </Alert>
            </Container>
            
        )
    }

    
}

export default ServiceExplorationForm;