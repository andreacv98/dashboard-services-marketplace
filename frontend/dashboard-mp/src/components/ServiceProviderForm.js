import { useEffect, useState } from "react";
import { useAuth } from "react-oidc-context";
import { Accordion, Alert, Button, Card, Col, Container, Form, Row } from "react-bootstrap";
import { BsFillClipboardFill } from "react-icons/bs";
import { addServiceProvider } from "../configs/marketplaceConfig";
import { checkServiceBrokerReadiness } from "../utils/utils";
import { Front, Github } from 'react-bootstrap-icons';

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
    const [defaultCommand, setDefaultCommand] = useState("");
    const [testedCatalog, setTestedCatalog] = useState(false);
    const [step, setStep] = useState(0);

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
        setTestedCatalog(true);
        console.log("Testing catalog... : " + url)
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
        var response = await addServiceProvider(name, description, url, auth.user?.access_token)
        if (response.status === 200) {
            var result = await response.json()
            console.log("Registration successful! : " + result)
            setCredentials(result)      
        } else {
            var result = await response.json()
            return "Error registering service provider: " + result.error;
        }

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

    useEffect(() => {
        if (credentials.authority_url !== "" && credentials.realm !== "" && credentials.client_id !== "" && credentials.client_secret !== "") {
            setDefaultCommand('curl -X POST -H "Content-Type: application/json" -H "X-Broker-API-Version: 2.17" --data \'{"auth_url": "'+credentials.authority_url+'", "realm": "'+credentials.realm+'", "client_id": "'+credentials.client_id+'", "client_secret": "'+credentials.client_secret+'"}\' '+url+'/auth/credentials')
        } else {
            setDefaultCommand("")
        }
    }, [credentials])

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
                    </Col>
                </Row>
                <hr />
                <Row>
                    <Col>
                        <h3>1/3 - Catalog informations</h3>
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
                            <Button variant="primary" type="submit" onClick={handleSubmit}>Next</Button>
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
        if (step === 0) {
            return (
                <Container className="p-3">
                    <Row>
                        <Col>
                            <h2>2/3 - Authentication configuration</h2>
                        </Col>
                    </Row>
                    <Row>
                        <Col>
                            <p>
                                The marketplace will contact your protected catalog APIs with an access token issued by this OpenID Connect authentication server.
                            </p>
                            <p>
                                You need to setup the security configuration of your catalog in order to accept requests from the marketplace. This step depends on your catalog implementation.
                            </p>
                        </Col>
                    </Row>
                    <Row>
                        <Col>
                            <Alert variant="warning">
                                <Alert.Heading>IMPORTANT STEP</Alert.Heading>
                                <p>
                                    The authentication configuration is really important in order to make your catalog work with the marketplace. Please follow the instructions below.
                                </p>
                            </Alert>
                        </Col>
                    </Row>
                    <Row>
                        <Col>
                            <Card>
                                <Card.Header>
                                    <Card.Title>Did you register our Catalog example server?</Card.Title>
                                </Card.Header>
                                <Card.Body>
                                    <Card.Text>
                                        <p>If you've just registered a catalog based on our catalog example server, then you can setup the security configuration by executing the following command: </p>
                                        <br />
                                        <Form>
                                            <Form.Group className="m-3 d-flex align-items-center" controlId="curlCommand" >
                                                <Form.Control as="textarea" placeholder="Curl command" value={defaultCommand} readOnly rows="5"/>
                                                <Button className="text-center m-2" onClick={ () => navigator.clipboard.writeText(defaultCommand)} ><BsFillClipboardFill /></Button>
                                            </Form.Group>
                                        </Form>
                                        <br />
                                        <p>After executing this command you can proceed.</p>
                                    </Card.Text>
                                </Card.Body>
                            </Card>
                        </Col>
                        <Col>
                            <Card>
                                <Card.Header>
                                    <Card.Title>Did you register a custom catalog server?</Card.Title>
                                </Card.Header>
                                <Card.Body>
                                    <Card.Text>
                                        <p>If you've registered a custom catalog server, then you need to setup the security configuration by yourself.</p>
                                        <br />
                                        <p>The catalog APIs will be contacted along with an authorization token provided by this OpenID Connect server:</p>
                                        <Form>
                                            <Form.Group className="m-3 d-flex align-items-center" controlId="Url">
                                                <Form.Control type="text" placeholder="Authentication server URL" value={credentials.authority_url+"/"+credentials.realm} readOnly disabled/>
                                                <Button className="text-center m-2" onClick={ () => navigator.clipboard.writeText(credentials.authority_url+"/"+credentials.realm)} ><BsFillClipboardFill /></Button>
                                            </Form.Group>
                                        </Form>
                                        <hr/>
                                        <p>If you need a service account for your catalog server to call protected APIs on the authentication server, then you can find the credentials below: </p>
                                        <Accordion>
                                            <Accordion.Item eventKey="0">
                                                <Accordion.Header><b>Service account credentials</b></Accordion.Header>
                                                <Accordion.Body>
                                                    <Form>
                                                        <Row>
                                                            <Col>
                                                                <Form.Group className="m-3 d-flex align-items-center" controlId="formAuthorityURL">
                                                                    <Form.Label>Authority URL</Form.Label>
                                                                    <Form.Control type="text" placeholder="Authority URL" value={credentials.authority_url} readOnly />
                                                                    <Button className="text-center m-2" onClick={ () => navigator.clipboard.writeText(credentials.authority_url)} ><BsFillClipboardFill /></Button>
                                                                </Form.Group>
                                                            </Col>
                                                            <Col>
                                                                <Form.Group className="m-3 d-flex align-items-center" controlId="formRealm">
                                                                    <Form.Label>Realm</Form.Label>
                                                                    <Form.Control type="text" placeholder="Realm" value={credentials.realm} readOnly />
                                                                    <Button className="text-center m-2" onClick={ () => navigator.clipboard.writeText(credentials.realm)} ><BsFillClipboardFill /></Button>
                                                                </Form.Group>
                                                            </Col>
                                                        </Row>
                                                        <Row>
                                                            <Col>
                                                                <Form.Group className="m-3 d-flex align-items-center" controlId="formClientId">
                                                                    <Form.Label>Client ID</Form.Label>
                                                                    <Form.Control type="text" placeholder="Client ID" value={credentials.client_id} readOnly />
                                                                    <Button className="text-center m-2" onClick={ () => navigator.clipboard.writeText(credentials.client_id)} ><BsFillClipboardFill /></Button>
                                                                </Form.Group>
                                                            </Col>
                                                            <Col>
                                                                <Form.Group className="m-3 d-flex align-items-center" controlId="formClientSecret">
                                                                    <Form.Label>Client Secret</Form.Label>
                                                                    <Form.Control type="text" placeholder="Client secret" value={credentials.client_secret} readOnly />
                                                                    <Button className="text-center m-2" onClick={ () => navigator.clipboard.writeText(credentials.client_secret)} ><BsFillClipboardFill /></Button>
                                                                </Form.Group>
                                                            </Col>
                                                        </Row>                                     
                                                    </Form>
                                                </Accordion.Body>
                                            </Accordion.Item>
                                        </Accordion>
                                        <hr/>
                                        <p>After setting up the security configuration you can proceed.</p>
                                    </Card.Text>
                                </Card.Body>
                            </Card>
                        </Col>
                    </Row>
                    <Row>
                        <Col>
                            <Container className="p-3 text-center">
                                <Button className="m-3" onClick={() => setStep(1)} variant="primary" >
                                    Configuration completed
                                </Button>
                            </Container>
                        </Col>
                    </Row>
                </Container>
            )
        } else {
            return (
                <>
                <Container className="p-3">
                    <Row>
                        <Col>
                            <Alert variant={testedCatalog ? ready ? "success" : "danger" : "info"}>
                                <Alert.Heading>Catalog successfully registered!</Alert.Heading>
                                <p>
                                    Your catalog has been successfully registered in the marketplace!
                                    <br/>
                                    This is the recap of your catalog informations:
                                </p>
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
                                <hr />
                                <div className="d-flex justify-content-end">
                                    <Button onClick={handleTestSvcProvider} variant="outline-primary">
                                    Test catalog reachability
                                    </Button>
                                </div>
                            </Alert>
                        </Col>
                    </Row>           
                        <Button className="m-3" variant="outline-primary" onClick={reset}>
                            Register another catalog
                        </Button>
                        <Button className="m-3" href="/catalog">
                            Explore catalogs
                        </Button>
                </Container>
                </>
            )
        }
    }
    
}

export default ServiceProviderForm;