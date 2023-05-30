import { InputGroup, Button, Form, Accordion, Container } from "react-bootstrap";
import { BsFillClipboardFill } from "react-icons/bs";
import DisclaimerInfo from "../Utils/DisclaimerInfo";
import { useState } from "react";

function DeploymentRequirements(props) {

    const setStep = props.setStep;
    const synatorCommand = "kubectl apply -f https://raw.githubusercontent.com/TheYkk/synator/master/deploy.yml"
    const disclaimerTitle = "Requirements"
    const disclaimerText = (
        <Container className="p-2">
            <p>There are three main requirements you need:</p>
            <ul>
                <li>
                    <b>Kubernetes cluster:</b> you need a working Kubernetes cluster, remotely reachable.
                    <br />
                    You can find more info about how to create a Kubernetes cluster in the official documentation <a href="https://kubernetes.io/docs/setup/" target="_blank">here</a>.
                </li>
                <li>
                    <b>Liqo installed:</b> you need to have <a href="https://liqo.io" target="_blank">Liqo</a> installed.
                    <br />
                    This will allow the catalog to get in communication with your cluster once you'll provide it the peering informations.
                </li>
                <li>
                    <b>Synator installed:</b> you need to have <a href="https://github.com/TheYkk/synator/blob/master/deploy.yml" target="_blank">Synator</a> operator installed.
                    <br />
                    This operator is needed in order to copy automatically the credentials created by the catalog into the namespace of your application.
                </li>
            </ul>
        </Container>
    )

    const [checkK8s, setCheckK8s] = useState(false);
    const [checkLiqo, setCheckLiqo] = useState(false);
    const [checkSynator, setCheckSynator] = useState(false);

    return (
        <>
        <h4>1/5 - Requirements <DisclaimerInfo disclaimerTitle={disclaimerTitle} disclaimerText={disclaimerText}/></h4>
        <p>Ensure to have the requirements and check them:</p>
        <Form>
            <Form.Group controlId="k8sRemoteAccess" className="m-3">
                <Form.Check type="checkbox" label="Own a Kubernetes cluster and ensure it is remotely accessible" checked={checkK8s} onChange={(e) => setCheckK8s(e.currentTarget.checked)}/>
            </Form.Group>
            <Form.Group controlId="liqoOnCluster" className="m-3">
                <Form.Check type="checkbox" label="Install Liqo in the Kubernetes cluster" checked={checkLiqo} onChange={(e) => setCheckLiqo(e.currentTarget.checked)}/>
                <Accordion className="m-3">
                    <Accordion.Item eventKey="0">
                        <Accordion.Header><b>Liqo installation instructions</b></Accordion.Header>
                        <Accordion.Body>
                            You can find Liqo installation instructions in the official documentation <a href="https://docs.liqo.io/en/v0.7.0/installation/install.html" target="_blank">here</a>
                        </Accordion.Body>
                    </Accordion.Item>
                </Accordion>
            </Form.Group>
            <Form.Group controlId="synatorOnCluster" className="m-3">
                <Form.Check type="checkbox" label="Install Synator operator" checked={checkSynator} onChange={(e) => setCheckSynator(e.currentTarget.checked)}/>
                <Accordion className="m-3">
                    <Accordion.Item eventKey="0">
                        <Accordion.Header><b>Synator installation instructions</b></Accordion.Header>
                        <Accordion.Body>
                            You can install Synator operator by running the following command:
                            <InputGroup className="p-3">
                                <Form.Control type="text" placeholder="Synator command" value={synatorCommand} readOnly />
                                <Button className="text-center" onClick={ () => navigator.clipboard.writeText(synatorCommand)} ><BsFillClipboardFill /></Button>
                            </InputGroup>                       
                        </Accordion.Body>
                    </Accordion.Item>
                </Accordion>
                
            </Form.Group>
        </Form>
        <Button variant="outline-primary" onClick={() => setStep(0)} className="m-3">Back</Button>
        <Button variant="primary" onClick={() => setStep(2)} className="m-3" disabled={!checkK8s || !checkLiqo || !checkSynator}>Next</Button>
        </>
    )

}

export default DeploymentRequirements;