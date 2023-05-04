import { Form, Button, Alert, Container, Row, Col } from 'react-bootstrap';
import { getServices } from '../configs/marketplaceConfig';
import { useAuth } from 'react-oidc-context';
import { useEffect, useState } from 'react';
import { subscribeService } from '../configs/marketplaceConfig';

function SubscribeServiceForm(props) {
    const auth = useAuth();
    const isLoading = props.isLoading;
    const setIsLoading = props.setIsLoading;
    const idServiceProvider = props.idServiceProvider;
    const idService = props.idService;

    const [error, setError] = useState("");
    const [service, setService] = useState(null);

    const [planId, setPlanId] = useState("");
    const [planDescription, setPlanDescription] = useState("");

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

    const handlePlanSelection = (event) => {
        const selectedPlanId = event.target.value;
        if (selectedPlanId === "") {
            setPlanDescription("");
        } else {
            setPlanId(selectedPlanId);
            const selectedPlan = service.plans.find(plan => plan.id === selectedPlanId);
            setPlanDescription(selectedPlan.description);
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
                        <Form.Control type="text" placeholder="Service description" value={service?.description} readOnly disabled/>
                    </Form.Group>
                    <Form.Group className="mb-3" controlId="formServicePlans">
                        <Row>
                            <Col md={6}>
                                <Form.Label>Service plans</Form.Label>
                                <Form.Select aria-label="Service plans" onChange={handlePlanSelection}>
                                <option value="">Select a plan</option>
                                {service?.plans.map((plan, index) => {
                                    return (
                                    <option key={plan.id} value={plan.id}>{plan.name}</option>
                                    )
                                })}
                                </Form.Select>
                            </Col>
                            <Col md={6}>
                                <Form.Label>Plan description</Form.Label>
                                <Form.Control as="textarea" placeholder="Plan description" value={planDescription} readOnly disabled/>
                            </Col>
                        </Row>
                    </Form.Group>
                    <Button variant="primary" type="submit" onClick={handleSubscription}>
                        Subscribe
                    </Button>
                </Form>         
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
                    <Alert.Heading>Successfully subscribed to the service</Alert.Heading>
                    <p>Service: {service?.name}</p>
                    <p>Plan: {service?.plans.find(plan => plan.id === planId)?.name}</p>
                    <Button href="/subscriptions">Subscriptions list</Button>
                </Alert>
            </Container>
            
        )
    }

    
}

export default SubscribeServiceForm;