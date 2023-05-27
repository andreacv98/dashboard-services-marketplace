import { Container, Row, Col, Card, Button, Collapse } from "react-bootstrap";
import { Github } from "react-bootstrap-icons";

function CatalogDisclaimer(props) {
    const setStep = props.setStep;

    return (
        <>
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
                        <Container fluid className="p-3 ">                        
                            <h2>What's a catalog?</h2>
                            <p>
                                In order to offer your services into the marketplace you can register your catalog in our system.
                                The catalog is a REST API server which will expose all your services according to the Open Service Broker API EXTENDED specification.
                                To get a seamless communication and functioning with our system, please assure that your catalog meets the requirements.
                            </p>
                        </Container>
                    </Col>
                </Row>
                <Row>
                    <Col>
                        <Container fluid className="p-3">
                            <h3>Requirements</h3>
                            <ul>
                                <li>Rest API servier compliant to the <a href="https://github.com/andreacv98/service-broker-k8s/blob/keycloak/documentation/spec.md" target="blank">Open Service Broker API extended specification</a> (<a href="https://github.com/andreacv98/service-broker-k8s/blob/keycloak/documentation/openapi.yaml" target="blank">OpenAPI Schema</a>)</li>
                                <ul>
                                    <li>API security supporting <a href="https://openid.net/specs/openid-connect-core-1_0.html" target="blank">OpenID Connect specification</a></li>
                                    <li><a href="https://liqo.io/" target="blank">Liqo</a> support and integration</li>
                                </ul>
                                <li>Reachable from Internet network</li>
                            </ul>
                        </Container>
                    </Col>
                    <Col>
                        <Container fluid className="p-3">
                            <Card>
                                <Card.Header>
                                    <Card.Title>Catalog example server</Card.Title>
                                </Card.Header>
                                <Card.Body>
                                    <Card.Text>
                                        <p>
                                            We can provide you a ready-to-use catalog which meets all the requirements. Just follow the instructions in the <a href="
                                            https://github.com/andreacv98/service-broker-k8s/blob/keycloak/README.md" target="_blank">README</a> file of the project.
                                            <br/>
                                            Some examples can be found in the <a href="https://github.com/andreacv98/service-broker-k8s/tree/keycloak/examples" target="_blank">example</a> folder of the project.
                                        </p>
                                    </Card.Text>
                                </Card.Body>
                                <Card.Footer>
                                    <Button variant="outline-dark" href="https://github.com/andreacv98/service-broker-k8s" target="_blank" rel="noopener noreferrer">
                                        <Github size={20} style={{ marginRight: '0.5rem' }} />
                                        Github repository
                                    </Button>
                                </Card.Footer>
                            </Card>                                    
                        </Container>
                    </Col>
                </Row>
                <Row>
                    <Col>
                        <Button variant="outline-primary" onClick={() => setStep(1)} >
                            Next
                        </Button>                            
                    </Col>
                </Row>
            </Container>
        </>
    )

}

export default CatalogDisclaimer;