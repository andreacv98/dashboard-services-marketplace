import { Accordion, Form, InputGroup, Alert, Container, Button } from "react-bootstrap";
import { BsFillClipboardFill } from "react-icons/bs";

function DeploymentCompletion(props) {

    const setStep = props.setStep;
    const setError = props.setError;
    const namespace = props.namespace;

    const k8sCommand = "kubectl get pods -n " + namespace;

    return (
        <Container>
            <Alert variant="success" >
                <Alert.Heading>Deployment Complete!</Alert.Heading>
                    <p>Your service hase been successfully deployed.</p>
                    <Accordion>
                        <Accordion.Item eventKey="0">
                            <Accordion.Header>More info</Accordion.Header>
                            <Accordion.Body>
                                <p>
                                    You'll notice that now on your Kubernetes cluster a new namespace called <code>{namespace}</code> has been created.
                                    This is where your service is running. If you want to see the pods running your service, you can run the following command:
                                </p>
                                <Form>
                                    <Form.Group className="mb-3" controlId="k8sNamespaceCommand">
                                        <InputGroup>
                                            <Form.Control as="textarea" placeholder="Curl command" value={k8sCommand} readOnly rows="5"/>
                                            <Button className="text-center" onClick={ () => navigator.clipboard.writeText(k8sCommand)} ><BsFillClipboardFill /></Button>
                                        </InputGroup>
                                    </Form.Group>
                                </Form>
                            </Accordion.Body>
                        </Accordion.Item>
                    </Accordion>
            </Alert>
        </Container>
    )

}

export default DeploymentCompletion;