import { Col, Row, Container, Button, Card, Form, Alert, Accordion } from "react-bootstrap";
import CheckConnectionModal from "./CheckConnectionModal";
import { useEffect, useState } from "react";
import { checkServiceBrokerReadiness } from "../../utils/utils";
import { getServices } from "../../configs/marketplaceConfig";

function CatalogRecap(props) {

    const setStep = props.setStep;
    const [error, setError] = useState("");
    const name = props.name;
    const description = props.description;
    const url = props.url;
    const id = props.id;

    const [showConnectionModal, setShowConnectionModal] = useState(false);

    const [reachable, setReachable] = useState();
    const [startReachabilityTest, setStartReachabilityTest] = useState(false);

    const [catalogReachable, setCatalogReachable] = useState();
    const [startCatalogReachabilityTest, setStartCatalogReachabilityTest] = useState(false);

    const [startTestsSuite, setStartTestsSuite] = useState(true);

    const successCard = (
        <Card>
            <Card.Body>
                <Card.Text>
                    <Alert variant="success">
                        <Alert.Heading>All test passed, your catalog has been successfully registered!</Alert.Heading>
                        Your catalog has been successfully registered, now your services are exposed into the marketplace.
                    </Alert>
                        <Accordion>
                            <Accordion.Item eventKey="0">
                                <Accordion.Header>Catalog information provided summary</Accordion.Header>
                                <Accordion.Body>
                                    <Form>
                                        <Row>
                                            <Col>
                                                <Form.Group className="mb-3" controlId="Name">
                                                    <Form.Label>Name</Form.Label>
                                                    <Form.Control type="text" placeholder="Catalog name" value={name} readOnly disabled/>
                                                </Form.Group>
                                            </Col>
                                            <Col>
                                                <Form.Group className="mb-3" controlId="Url">
                                                    <Form.Label>URL</Form.Label>
                                                    <Form.Control type="text" placeholder="Catalog URL" value={url} readOnly disabled/>
                                                </Form.Group>
                                            </Col>
                                        </Row>
                                        <Row>
                                            <Col>
                                                <Form.Group className="mb-3" controlId="Description">
                                                    <Form.Label>Description</Form.Label>
                                                    <Form.Control as="textarea" placeholder="Catalog description" value={description} readOnly disabled/>
                                                </Form.Group>
                                            </Col>
                                        </Row>                      
                                    </Form>
                                </Accordion.Body>
                            </Accordion.Item>
                        </Accordion>
                </Card.Text>
            </Card.Body>
            <Card.Footer>
                <Button  className="m-2" variant="outline-primary" onClick={() => setStep(2)}>
                    Back
                </Button>
                <Button  className="m-2" variant="primary" href="/profile/catalogs">
                    Go to your catalogs
                </Button>
            </Card.Footer>
        </Card>
    );

    const warningCard = (
        <Card>
            <Card.Body>
                <Card.Text>
                    <Alert variant="warning">
                        <Alert.Heading>Some tests failed, your catalog may not be reachable</Alert.Heading>
                        Some test may have failed, please check the information you provided and try again.
                    </Alert>
                    <Accordion>
                        <Accordion.Item eventKey="0">
                            <Accordion.Header>Catalog information provided summary</Accordion.Header>
                            <Accordion.Body>
                                <Form>
                                    <Row>
                                        <Col>
                                            <Form.Group className="mb-3" controlId="Name">
                                                <Form.Label>Name</Form.Label>
                                                <Form.Control type="text" placeholder="Catalog name" value={name} readOnly disabled/>
                                            </Form.Group>
                                        </Col>
                                        <Col>
                                            <Form.Group className="mb-3" controlId="Url">
                                                <Form.Label>URL</Form.Label>
                                                <Form.Control type="text" placeholder="Catalog URL" value={url} readOnly disabled/>
                                            </Form.Group>
                                        </Col>
                                    </Row>
                                    <Row>
                                        <Col>
                                            <Form.Group className="mb-3" controlId="Description">
                                                <Form.Label>Description</Form.Label>
                                                <Form.Control as="textarea" placeholder="Catalog description" value={description} readOnly disabled/>
                                            </Form.Group>
                                        </Col>
                                    </Row>                      
                                </Form>
                            </Accordion.Body>
                        </Accordion.Item>
                    </Accordion>
                </Card.Text>
            </Card.Body>
            <Card.Footer>
                <Button className="m-2" variant="outline-primary" onClick={() => setStep(2)}>
                    Back
                </Button>
                <Button className="m-2" variant="outline-primary" onClick={() => setShowConnectionModal(true)}>
                    Show tests
                </Button>
                <Button className="m-2" variant="primary" onClick={() => resetTests()}>
                    Test again
                </Button>
            </Card.Footer>
        </Card>
    );

    const waitingCard = (
        <Card>
            <Card.Body>
                <Card.Title>
                    Almost there...
                </Card.Title>
                <Card.Text>
                    Please wait while we perform the tests to check if your catalog is reachable.
                </Card.Text>
            </Card.Body>
            <Card.Footer>
                <Button variant="primary" onClick={() => setShowConnectionModal(true)}>
                    Show tests
                </Button>
            </Card.Footer>
        </Card>
    );

    function getReachabilityCard() {
        if (startReachabilityTest) {
            switch (reachable) {
                case true:
                    if (startCatalogReachabilityTest) {
                        switch (catalogReachable) {
                            case true:
                                return successCard;
                            case false:
                                return warningCard;
                            default:
                                return waitingCard;
                        }
                    } else {
                        return waitingCard
                    }
                case false:
                    return warningCard;
                default:
                    return waitingCard;
            }
        } else {
            return waitingCard;
        }
    }

    function resetTests() {
        setStartReachabilityTest(false);
        setStartCatalogReachabilityTest(false);
        setReachable();
        setCatalogReachable();
        setError("");
        setStartTestsSuite(true);
    }

    useEffect(() => {
        if(startTestsSuite) {
            setStartTestsSuite(false);
            setShowConnectionModal(true);
            setStartReachabilityTest(true);
            checkServiceBrokerReadiness(url).then((result) => {                
                if (result) {
                    setError("");
                    setReachable(true);
                    setStartCatalogReachabilityTest(true);
                    getServices(id).then((result) => {
                        if (result.status === 200) {
                            setCatalogReachable(true);
                        } else {
                            setCatalogReachable(false);
                        }
                    }).catch((error) => {
                        setCatalogReachable(false);
                        setError("Catalog is not retrievable!")
                    });
                } else {
                    setReachable(false);
                    setError("Service broker is not ready!");
                }
            }).catch((error) => {
                setReachable(false);
                setError("Service connection return an error. "+error);
            });
        }
    }, [startTestsSuite, id, url])

    return (
        <>
            <CheckConnectionModal
                url={url}
                showConnectionModal={showConnectionModal}
                setShowConnectionModal={setShowConnectionModal}
                reachable={reachable}
                startReachabilityTest={startReachabilityTest}
                setStartReachabilityTest={setStartReachabilityTest}
                startCatalogReachabilityTest={startCatalogReachabilityTest}
                setStartCatalogReachabilityTest={setStartCatalogReachabilityTest}
                catalogReachable={catalogReachable}
                setReachable={setReachable}
                setCatalogReachable={setCatalogReachable}
                error={error}
                setError={setError}
                resetTests={resetTests}
                setStep = {setStep}
            />
            <Container>
                <Row>
                    <Col>
                        <Container className="p-3 text-center">
                            <h1 className="text-center">Catalog Registration</h1>
                        </Container>
                    </Col>
                </Row>
                <Row>
                    <Col>
                        <h2>
                            3/3 - Completed
                        </h2>
                    </Col>
                </Row>
                <Row>
                    <Col>
                        <Container className="p-3 text-center">
                            {getReachabilityCard()}
                        </Container>
                    </Col>
                </Row>
            </Container>
        </>
    )   
    

}

export default CatalogRecap;