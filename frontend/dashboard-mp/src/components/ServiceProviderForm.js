import { useEffect, useState } from "react";
import { useAuth } from "react-oidc-context";
import { Alert, Button, Card, Col, Container, Form, Row } from "react-bootstrap";
import { BsFillClipboardFill } from "react-icons/bs";
import { addServiceProvider } from "../configs/marketplaceConfig";
import { checkServiceBrokerReadiness } from "../utils/utils";
import { Github } from 'react-bootstrap-icons';

function ServiceProviderForm(props) {
    const auth = useAuth();
    const setIsLoading = props.setIsLoading;
    const [name, setName] = useState("");
    const [description, setDescription] = useState("");
    const [url, setUrl] = useState("");
    const [error, setError] = useState("");
    const [ready, setReady] = useState(false);
    const [credentials, setCredentials] = useState({
        authority_url: "",
        realm: "",
        client_id: "",
        client_secret: ""
    });

    useEffect(() => {
        console.log("Is loading: " + props.isLoading)
    }, [props.isLoading])

    const handleSubmit = (event) => {
        event.preventDefault();
        if (name === "" || description === "" || url === "") {
            setError("Please fill out all fields!");
        } else {
            setError("");
            setIsLoading(true);
            checkURL(url).then((error) => {
                if (error === "") {
                    console.log("Sending registration request...")
                    sendRegistrationRequest().then((error) => {
                        console.log("Registration request sent!")
                        if (error !== "") {
                            console.log("Error registering service provider! : " + error)
                            setError(error);
                        }
                        setIsLoading(false);  
                    });
                } else {
                    console.log("Error checking URL! : " + error)
                    setError(error);
                    setIsLoading(false);
                }
                console.log("Done checking URL!")                
            });
        }
    }

    const handleTestSvcProvider = (event) => {
        event.preventDefault();
        setIsLoading(true);
        console.log("Testing service provider... : " + url)
        checkServiceBrokerReadiness(url).then((result) => {
            if (result) {
                setError("");
                setReady(true);
            } else {
                setError("Service broker is not ready!");
            }
        }).catch((error) => {
            setError("Service broker is not ready!");
        }).finally(() => {
            setIsLoading(false);
        });
        ;
    }

    const sendRegistrationRequest = async () => {
        // Send HTTP request to backend
        addServiceProvider(name, description, url, auth.user?.access_token).then((response) => {
            if (response.status === 200) {
                response.json().then((result) => {
                    console.log("Registration successful! : " + result)
                    setCredentials(result)
                });                
            } else {
                return "Error registering service provider!";
            }
        });

        return "";
    }

    const reset = () => {
        setName("");
        setDescription("");
        setUrl("");
        setError("");
        setCredentials({
            authority_url: "",
            realm: "",
            client_id: "",
            client_secret: ""
        });
    }

    const checkURL = async (url) => {
        // Send HTTP request to url + /readyz
        // If response is 200, return true
        // Else return false
        // Check if url is valid
        try {
            new URL(url);
        } catch (_) {
            return "URL is not valid!";
        }
        return "";  
    }

    if (credentials.authority_url === "" && credentials.realm === "" && credentials.client_id === "" && credentials.client_secret === "") {
        // Show form
        return (
            <>
            <Container>
                <Row className="d-flex">
                    <Col>
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
                                        <li>Rest API servier compliant to the <a href="https://raw.githubusercontent.com/andreacv98/service-broker-k8s/keycloak/documentation/openapi.yaml" target="blank">Open Service Broker API extended specification</a></li>
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
                                                    https://github.com/andreacv98/service-broker-k8s/blob/master/README.md" target="_blank">README</a> file of the project.
                                                    <br/>
                                                    Some examples can be found in the <a href="https://github.com/andreacv98/service-broker-k8s/tree/master/examples" target="_blank">example</a> folder of the project.
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
                    </Col>
                </Row>
                <hr />
                <Row>
                    <Col>
                        <h3>Catalog informations</h3>
                    </Col>
                </Row>
                <Row>
                    <Col>
                        <Form className="p-3">
                            <Form.Group className="mb-3" controlId="formName">
                                <Form.Label>Name</Form.Label>
                                <Form.Control type="text" placeholder="Enter name" value={name} onChange={(e) => setName(e.target.value)} />
                                <Form.Text>The name of your catalog. It will be recognized by all the users inside the marketplace by this identification.</Form.Text>
                            </Form.Group>
                            <Form.Group className="mb-3" controlId="formDescription">
                                <Form.Label>Description</Form.Label>
                                <Form.Control as="textarea" placeholder="Enter description" value={description} onChange={(e) => setDescription(e.target.value)} />
                                <Form.Text>The description of your catalog. Few words to describe the catalog and its content to all users.</Form.Text>
                            </Form.Group>
                            <Form.Group className="mb-3" controlId="formUrl">
                                <Form.Label>URL</Form.Label>
                                <Form.Control type="text" placeholder="Enter URL" value={url} onChange={(e) => setUrl(e.target.value)} />
                                <Form.Text>The URL of your catalog. It will be used to reach your catalog and its services. "HTTPS" URL is recommended.</Form.Text>
                            </Form.Group>
                            <Button variant="primary" type="submit" onClick={handleSubmit}>Register</Button>
                        </Form>
                    </Col>
                </Row>
                <Row>
                    <Col>
                        <Container className="p-3 text-center">
                            <Alert variant="danger" show={error !== ""}>
                                {error}
                            </Alert>
                        </Container>
                    </Col>
                </Row>
            </Container>            
            </>
        )
    } else {
        // Show credentials
        return (
            <>
            <Container className="p-3">
                <Alert variant="success">
                    <Alert.Heading>Service Provider successfully registered!</Alert.Heading>
                    <p>
                        Service broker information recap:
                        Name: {name} <br/>
                        Description: {description} <br/>
                        URL: {url} <br/>
                    </p>
                    <p>
                        Please save the following credentials for the service broker:
                    </p>
                    <hr />
                    <Form>
                        <Form.Group className="m-3" controlId="formClientId">
                            <Form.Label>Authority URL</Form.Label>
                            <Form.Control type="text" placeholder="Enter client ID" value={credentials.authority_url} readOnly />
                            <Button className="text-center mt-2" onClick={ () => navigator.clipboard.writeText(credentials.authority_url)} >Copy authority URL <BsFillClipboardFill /></Button>
                        </Form.Group>
                        <Form.Group className="m-3" controlId="formClientId">
                            <Form.Label>Realm</Form.Label>
                            <Form.Control type="text" placeholder="Enter client ID" value={credentials.realm} readOnly />
                            <Button className="text-center mt-2" onClick={ () => navigator.clipboard.writeText(credentials.realm)} >Copy realm <BsFillClipboardFill /></Button>
                        </Form.Group>
                        <Form.Group className="m-3" controlId="formClientId">
                            <Form.Label>Client ID</Form.Label>
                            <Form.Control type="text" placeholder="Enter client ID" value={credentials.client_id} readOnly />
                            <Button className="text-center mt-2" onClick={ () => navigator.clipboard.writeText(credentials.client_id)} >Copy client ID <BsFillClipboardFill /></Button>
                        </Form.Group>
                        <Form.Group className="m-3" controlId="formClientSecret">
                            <Form.Label>Client Secret</Form.Label>
                            <Form.Control type="text" placeholder="Enter client secret" value={credentials.client_secret} readOnly />
                            <Button className="text-center mt-2" onClick={ () => navigator.clipboard.writeText(credentials.client_secret)} >Copy client secret <BsFillClipboardFill /></Button>
                        </Form.Group>
                    </Form>
                    <Button className="m-3" href="/service-providers">
                        Back to service providers list
                    </Button>
                    <Button className="m-3" onClick={reset}>
                        Register another service provider
                    </Button>
                    <Button className="m-3" onClick={handleTestSvcProvider} variant={ready ? "success" : "danger"}>
                        Test service broker
                    </Button>
                </Alert>
            </Container>
            </>
        )
    }
    
}

export default ServiceProviderForm;