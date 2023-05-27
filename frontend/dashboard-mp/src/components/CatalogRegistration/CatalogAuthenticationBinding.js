import { useState, useEffect } from "react";
import { Container, Row, Col, Accordion, Form, Button } from "react-bootstrap";
import keycloak from "../../configs/keycloakConfig";
import { BsFillClipboardFill, BsInfoCircle, BsInfoCircleFill } from "react-icons/bs";

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

    return (
        <Container className="p-3">
            <Row>
                <Col>
                    <h2>2/3 - Authentication configuration</h2>
                </Col>
            </Row>
            <Row>
                <Col>
                    <Container className="p-3">
                        <p>1. Which type of catalog implementation did you register?</p>
                        <Form>
                            <Form.Group controlId="formCatalogType">
                                <Form.Check type="radio" label="Catalog example server" name="catalogExampleServer" id="formCatalogTypeExampleServer" checked={catalogType === "catalogExampleServer"} onChange={() => setCatalogType("catalogExampleServer")}/>
                                <Form.Check type="radio" label="Catalog custom implementation" name="catalogCustomImplementation" id="formCatalogTypeCustomImplementation" checked={catalogType === "catalogCustomImplementation"} onChange={() => setCatalogType("catalogCustomImplementation")}/>
                            </Form.Group>
                        </Form>
                    </Container>                    
                </Col>                
            </Row>
            <Row>
                <Col>
                    {catalogType === "catalogExampleServer" ? (
                        <Container className="p-3">
                            <p>2. Copy and paste the following command:</p>
                            <Form>
                                <Form.Group className="m-3 d-flex align-items-center" controlId="curlCommand" >
                                    <Form.Control as="textarea" placeholder="Curl command" value={defaultCommand} readOnly rows="5"/>
                                    <Button className="text-center m-2" onClick={ () => navigator.clipboard.writeText(defaultCommand)} ><BsFillClipboardFill /></Button>
                                </Form.Group>
                            </Form>                        
                        </Container>                        
                    ) : catalogType === "catalogCustomImplementation" ? (
                        <Container className="p-3">
                            <p>2. Manually configure your custom catalog server with these data</p>
                            <Form>
                                <Form.Group className="m-3 d-flex align-items-center" controlId="Url">
                                    <Form.Control type="text" placeholder="Authentication server URL" value={keycloak.authority} readOnly disabled/>
                                    <Button className="text-center m-2" onClick={ () => navigator.clipboard.writeText(keycloak.authority)} ><BsFillClipboardFill /></Button>
                                </Form.Group>
                            </Form>
                            <Accordion>
                                <Accordion.Item eventKey="0">
                                    <Accordion.Header>
                                        <p>More connection data</p>
                                    </Accordion.Header>
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
                        </Container>
                    ) : (
                        <>
                        </>
                    )
                    }
                </Col>
            </Row>
            <Row>
                <Col>
                {catalogType !== "" ? (
                    <>
                        <Button variant="outline-primary" type="button" onClick={() => setStep(1)} className='me-3'>Back</Button>                     
                        <Button variant="primary" type="submit" onClick={() => setStep(3)} className='me-3'>Next</Button>
                    </>                    
                ) : (
                    <>
                    </>
                )
                }                    
                </Col>
            </Row>                
        </Container>
    )

}

export default CatalogAuthenticationBinding;