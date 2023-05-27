import { useState, useEffect } from "react";
import { Container, Row, Col, Accordion, Form, Button, Collapse, InputGroup, Card } from "react-bootstrap";
import keycloak from "../../configs/keycloakConfig";
import { BsFillClipboardFill } from "react-icons/bs";
import DisclaimerInfo from "../Utils/DisclaimerInfo";
import { Icon1Square } from "react-bootstrap-icons";

function CatalogAuthenticationBinding(props) {

    const [catalogType, setCatalogType] = useState("");
    const [defaultCommand, setDefaultCommand] = useState("");
    const credentials = props.credentials;
    const setStep = props.setStep;
    const url = props.url;

    useEffect(() => {
        if (credentials.authority_url !== "" && credentials.realm !== "" && credentials.client_id !== "" && credentials.client_secret !== "") {
            setDefaultCommand('curl -X POST -H "Content-Type: application/json" -H "X-Broker-API-Version: 2.17" --data \'{"auth_url": "'+credentials.authority_url+'", "realm": "'+credentials.realm+'", "client_id": "'+credentials.client_id+'", "client_secret": "'+credentials.client_secret+'"}\' '+url+'/auth/credentials')
        } else {
            setDefaultCommand("")
        }
    }, [credentials, url])

    const authenticationBindingDiscaimer = (
        <p>
            In this step you need to configure the server you just registered to be able to receieve the protected requests from the marketplace.
            <br/>
            In fact, the marketplace will authenticate it self on a trusted OpenID Connect server and with the token it gets, it will use it along with the
            protected endpoints of your server, according to the <a href="https://github.com/andreacv98/service-broker-k8s/blob/keycloak/documentation/openapi.yaml" target="blank">APIs schema</a>
        </p>
    )

    const catalogTypeDisclaimer = (
        <p>
            In order to provide you the best experience, we need to know which type of catalog implementation you registered.
            <br />
            <ul>
                <li>
                    <b>Catalog example server:</b> if you registered a catalog implementation based on our proposal we suggested you at the beginning of the registration process.
                    We are referring to <a href="https://github.com/andreacv98/service-broker-k8s" target="_blank" rel="noreferrer">this repository</a>.
                </li>
                <li>
                    <b>Catalog custom implementation</b> if you registered a catalog implementation based on your own implementation, but still compliant with the
                    <a href="https://github.com/andreacv98/service-broker-k8s/blob/keycloak/documentation/spec.md" target="_blank" rel="noreferrer">specification</a>.
                </li>
            </ul>
        </p>
    )

    const catalogExampleServerDisclaimer = (
        <p>
            Just ensure to be able to reach the catalog example server directly from your terminal. Then copy and paste the command suggested.
            <br />
            The command will make a POST request to the server at <i>/auth/credentials</i>, providing the credentials you just got from the registration process.
            Once the server receives the credentials, it will be able to validate tokens generated from the OpenID Connect server of the marketplace.
        </p>
    )

    const catalogCustomImplementationDisclaimer = (
        <p>
            Since you registered a custom implementation, you need to configure it <b>manually</b>. The data provided are general data for OpenID Connect protocol,
            you need to use them according to the eventual library you're using for the authentication inside your custom catalog server implementation.
            <br />
            It MUST be able to validate tokens generated from the OpenID Connect server specified as <i>Authority server URL</i>.
            <br />
            In case you need also a service account to call the APIs of the OpenID Connect server, you can use the credentials generated for your server
            in the <i>More connection data</i> section.
        </p>
    )

    return (
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
                        2/3 - Authentication configuration
                        <DisclaimerInfo
                            disclaimerTitle="Authentication configuration"
                            disclaimerText={authenticationBindingDiscaimer}
                        />
                    </h2>
                </Col>
            </Row>
            <Row>
                <Col>
                    <Card className="m-3 p-3">
                        <p>
                            <b>1. Which type of catalog implementation did you register?</b>
                            <DisclaimerInfo
                                disclaimerTitle="Catalog implementation"
                                disclaimerText={catalogTypeDisclaimer}
                            />
                        </p>
                        <Form>
                            <Form.Group className="m-3" controlId="formCatalogType">
                                <Form.Check type="radio" label="Catalog example server" name="catalogExampleServer" id="formCatalogTypeExampleServer" checked={catalogType === "catalogExampleServer"} onChange={() => setCatalogType("catalogExampleServer")}/>
                                <Form.Check type="radio" label="Catalog custom implementation" name="catalogCustomImplementation" id="formCatalogTypeCustomImplementation" checked={catalogType === "catalogCustomImplementation"} onChange={() => setCatalogType("catalogCustomImplementation")}/>
                            </Form.Group>
                        </Form>
                    </Card>                    
                </Col>                
            </Row>
            <Row>
                <Col>
                    <Collapse in={catalogType === "catalogExampleServer"}>
                        <Card className="m-3 p-3">
                            <p>
                                <b>2. Copy and paste the following command:</b>
                                <DisclaimerInfo
                                    disclaimerTitle="Catalog example server"
                                    disclaimerText={catalogExampleServerDisclaimer}
                                />
                            </p>
                            <Form>
                                <Form.Group className="m-3 d-flex align-items-center" controlId="curlCommand" >
                                <InputGroup>
                                    <Form.Control as="textarea" placeholder="Curl command" value={defaultCommand} readOnly rows="5"/>
                                    <Button className="text-center" onClick={ () => navigator.clipboard.writeText(defaultCommand)} ><BsFillClipboardFill /></Button>
                                </InputGroup>
                                </Form.Group>
                            </Form>
                        </Card>
                    </Collapse>
                    <Collapse in={catalogType === "catalogCustomImplementation"}>
                        <Card className="m-3 p-3">
                            <p>
                                <b>2. Manually configure your custom catalog server with these data</b>
                                <DisclaimerInfo
                                    disclaimerTitle="Catalog custom implementation"
                                    disclaimerText={catalogCustomImplementationDisclaimer}
                                />
                            </p>
                            <Form>
                                <Form.Group className="m-3 d-flex align-items-center" controlId="Url">
                                    <Form.Label className="m-2">Authentication server URL</Form.Label>
                                    <InputGroup>
                                        <Form.Control type="text" placeholder="Authentication server URL" value={keycloak.authority} readOnly disabled/>
                                        <Button className="text-center" onClick={ () => navigator.clipboard.writeText(keycloak.authority)} ><BsFillClipboardFill /></Button>
                                    </InputGroup>                                    
                                </Form.Group>
                            </Form>
                            <Accordion className="m-3">
                                <Accordion.Item eventKey="0">
                                    <Accordion.Header>
                                        <p>More connection data</p>
                                    </Accordion.Header>
                                    <Accordion.Body>
                                    <Form>
                                            <Row>
                                                <Col>
                                                    <Form.Group className="m-3 d-flex align-items-center flex-column" controlId="formAuthorityURL">
                                                        <Form.Label className="m-2">Authority URL</Form.Label>
                                                        <InputGroup>
                                                            <Form.Control type="text" placeholder="Authority URL" value={credentials.authority_url} readOnly />
                                                            <Button className="text-center" onClick={ () => navigator.clipboard.writeText(credentials.authority_url)} ><BsFillClipboardFill /></Button>
                                                        </InputGroup>                                                        
                                                    </Form.Group>
                                                </Col>
                                                <Col>
                                                    <Form.Group className="m-3 d-flex align-items-center flex-column" controlId="formRealm">
                                                        <Form.Label className="m-2">Realm</Form.Label>
                                                        <InputGroup>
                                                            <Form.Control type="text" placeholder="Realm" value={credentials.realm} readOnly />
                                                            <Button className="text-center" onClick={ () => navigator.clipboard.writeText(credentials.realm)} ><BsFillClipboardFill /></Button>
                                                        </InputGroup>                                                        
                                                    </Form.Group>
                                                </Col>
                                            </Row>
                                            <Row>
                                                <Col>
                                                    <Form.Group className="m-3 d-flex align-items-center flex-column" controlId="formClientId">
                                                        <Form.Label className="m-2">Client ID</Form.Label>
                                                        <InputGroup>
                                                            <Form.Control type="text" placeholder="Client ID" value={credentials.client_id} readOnly />
                                                            <Button className="text-center" onClick={ () => navigator.clipboard.writeText(credentials.client_id)} ><BsFillClipboardFill /></Button>                                                       
                                                        </InputGroup>
                                                    </Form.Group>
                                                </Col>
                                                <Col>
                                                    <Form.Group className="m-3 d-flex align-items-center flex-column" controlId="formClientSecret">
                                                        <Form.Label className="m-2">Client Secret</Form.Label>
                                                        <InputGroup>
                                                            <Form.Control type="text" placeholder="Client secret" value={credentials.client_secret} readOnly />
                                                            <Button className="text-center" onClick={ () => navigator.clipboard.writeText(credentials.client_secret)} ><BsFillClipboardFill /></Button>
                                                        </InputGroup>
                                                    </Form.Group>
                                                </Col>
                                            </Row>                                     
                                        </Form>
                                    </Accordion.Body>
                                </Accordion.Item>
                            </Accordion>
                        </Card>
                    </Collapse>   
                </Col>
            </Row>
            <Row>
                <Col>
                {catalogType !== "" ? (
                    <>
                        <hr />
                        <Button variant="outline-primary" type="button" onClick={() => setStep(1)} className='me-3'>Back</Button>                     
                        <Button variant="primary" type="submit" onClick={() => setStep(3)} className='me-3'>Next</Button>
                    </>                    
                ) : (
                    <>
                        <hr />
                        <Button variant="outline-primary" type="button" onClick={() => setStep(1)} className='me-3'>Back</Button>
                    </>
                )
                }                    
                </Col>
            </Row>    
        </Container>
    )

}

export default CatalogAuthenticationBinding;