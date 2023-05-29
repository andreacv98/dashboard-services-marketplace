import { useEffect, useState } from "react";
import { Accordion, Alert, Button, Card, Col, Container, Form, Row } from "react-bootstrap";
import { BsFillClipboardFill } from "react-icons/bs";
import { checkServiceBrokerReadiness } from "../../utils/utils";
import CatalogDisclaimer from "./CatalogDisclaimer";
import CatalogInformationsForm from "./CatalogInformationsForm";
import CatalogAuthenticationBinding from "./CatalogAuthenticationBinding";
import CatalogRecap from "./CatalogRecap";
import CatalogRegistrationErrorBar from "./CatalogRegistrationErrorBar";

function CatalogForms(props) {
    const setIsLoading = props.setIsLoading;
    const [name, setName] = useState("");
    const [description, setDescription] = useState("");
    const [url, setUrl] = useState("");
    const [error, setError] = useState("");
    const [ready, setReady] = useState(false);
    const [credentials, setCredentials] = useState({
        id: "",
        authority_url: "",
        realm: "",
        client_id: "",
        client_secret: ""
    });
    const [defaultCommand, setDefaultCommand] = useState("");
    const [testedCatalog, setTestedCatalog] = useState(false);
    const [step, setStep] = useState(0);
    const [registered, setRegistered] = useState(false);

    useEffect(() => {
        console.log("Is loading: " + props.isLoading)
    }, [props.isLoading])

    

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

    useEffect(() => {
        if (credentials.authority_url !== "" && credentials.realm !== "" && credentials.client_id !== "" && credentials.client_secret !== "") {
            setDefaultCommand('curl -X POST -H "Content-Type: application/json" -H "X-Broker-API-Version: 2.17" --data \'{"auth_url": "'+credentials.authority_url+'", "realm": "'+credentials.realm+'", "client_id": "'+credentials.client_id+'", "client_secret": "'+credentials.client_secret+'"}\' '+url+'/auth/credentials')
        } else {
            setDefaultCommand("")
        }
    }, [credentials])

    switch (step) {
        case 0:
            return (
                <CatalogDisclaimer setStep={setStep}/>
            )
        case 1:
            return (
                <>
                    <CatalogRegistrationErrorBar error={error} setError={setError} />

                    <CatalogInformationsForm
                    setStep={setStep}
                    setError={setError}
                    setIsLoading={setIsLoading}
                    name={name}
                    setName={setName}
                    description={description}
                    setDescription={setDescription}
                    url={url}
                    setUrl={setUrl}
                    setCredentials={setCredentials}
                    registered={registered}
                    setRegistered={setRegistered}
                    />
                </>
                
            )
        case 2:
            return (
                <>
                    <CatalogRegistrationErrorBar error={error} setError={setError} />

                    <CatalogAuthenticationBinding
                    setStep={setStep}
                    setError={setError}
                    credentials={credentials}
                    url={url}
                    />
                </>
                
            )
        case 3:
            return (
                <>
                    <CatalogRegistrationErrorBar error={error} setError={setError} />
                    
                    <CatalogRecap
                        setStep={setStep}
                        setError={setError}
                        url={url}
                        id={credentials.id}
                    /> 
                </>
                
            )
        default:
            return (
                <>
                </>
            )
    }

    if (credentials.authority_url === "" && credentials.realm === "" && credentials.client_id === "" && credentials.client_secret === "") {
        // Show form
        return (
            <>
                      
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

export default CatalogForms;