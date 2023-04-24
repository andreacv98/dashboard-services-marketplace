import { Form, Button, Alert, Container, Row, Col } from 'react-bootstrap';
import { getServices } from '../configs/marketplaceConfig';
import { useAuth } from 'react-oidc-context';
import { useEffect, useState } from 'react';

function BuyServiceForm(props) {
    const auth = useAuth();
    const isLoading = props.isLoading;
    const setIsLoading = props.setIsLoading;
    const idServiceProvider = props.idServiceProvider;
    const idService = props.idService;

    const [error, setError] = useState("");
    const [service, setService] = useState(null);

    const [planDescription, setPlanDescription] = useState("");

    useEffect(() => {
        // Get service from marketplace
        getServices(idServiceProvider).then((response) => {
            if (response.status === 200) {
                response.json().then((data) => {
                    let services = data.services;
                    let serviceFound = services.find(service => service.id === idService);
                    setService(serviceFound);
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
    }, [])

    const handlePlanSelection = (event) => {
        const selectedPlanId = event.target.value;
        if (selectedPlanId === "") {
            setPlanDescription("");
        } else {
            const selectedPlan = service.plans.find(plan => plan.id === selectedPlanId);
            setPlanDescription(selectedPlan.description);
        }        
    }

    if( service !== null) {
        return (
            <Container className="d-flex justify-content-center align-items-center mt-3">
                <div className="w-50">
                    <h1>Buy service</h1>
                <Form>
                    <Form.Group className="mb-3" controlId="formService">
                        <Form.Label>Service name</Form.Label>
                        <Form.Control type="text" placeholder="Service name" value={service?.name} readOnly />
                    </Form.Group>
                    <Form.Group className="mb-3" controlId="formServiceDescription">
                        <Form.Label>Service description</Form.Label>
                        <Form.Control type="text" placeholder="Service description" value={service?.description} readOnly />
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
                                <Form.Control as="textarea" placeholder="Plan description" value={planDescription} readOnly />
                            </Col>
                        </Row>
                    </Form.Group>
                    <Button variant="primary" type="submit">
                        Buy
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
            <Alert variant="danger" show={error !== ""} onClose={() => setError("")} dismissible>
                <Alert.Heading>Error</Alert.Heading>
                <p>{error}</p>
            </Alert>
        )
    }

    
}

export default BuyServiceForm;