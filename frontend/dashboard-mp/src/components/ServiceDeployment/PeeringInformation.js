import { Container, Row, Col, Form, InputGroup, Button, Card, Collapse, Accordion, Spinner, Modal } from "react-bootstrap";
import { BsFillClipboardFill } from "react-icons/bs";
import { useState, useEffect } from "react";
import { CheckCircleFill, Cloud, House, Shuffle, XCircle, XCircleFill } from "react-bootstrap-icons";
import { useAuth } from "react-oidc-context";
import DisclaimerInfo from "../Utils/DisclaimerInfo";
import { peerDeployment } from "../../configs/marketplaceConfig"

function PeeringInformation(props) {

    const auth = useAuth();

    const setStep = props.setStep;
    const error = props.error;
    const setError = props.setError;

    const peered = props.peered;
    const setPeered = props.setPeered;

    const peerCommandResult = props.peerCommandResult;
    const setPeerCommandResult = props.setPeerCommandResult;

    const idDeployment = props.idDeployment;
    const idServiceProvider = props.idServiceProvider;

    const clusterId = props.clusterId;
    const setClusterId = props.setClusterId;
    const clusterAuthUrl = props.clusterAuthUrl;
    const setClusterAuthUrl = props.setClusterAuthUrl;
    const clusterAuthToken = props.clusterAuthToken;
    const setClusterAuthToken = props.setClusterAuthToken;
    const clusterName = props.clusterName;
    const setClusterName = props.setClusterName;
    const peeringPolicies = props.peeringPolicies;
    const offloadingPolicy = props.offloadingPolicy;
    const setOffloadingPolicy = props.setOffloadingPolicy;
    const prefixNamespace = props.prefixNamespace;
    const setPrefixNamespace = props.setPrefixNamespace;

    const setPeeringStarted = props.setPeeringStarted;
    const setPeeringCheckPhase = props.setPeeringCheckPhase;

    const peeringStarted = props.peeringStarted;
    const peeringStatus = props.peeringStatus;
    const peeringCheckPhase = props.peeringCheckPhase;

    const peerCommand = "liqoctl generate peer-command --only-command"

    const [showModal, setShowModal] = useState(false);

    const generalDisclaimerTitle = "Cluster peering"
    const generalDisclaimerText = (
        <Container>
            <p>
                In this step you will basically establish the communication between your cluster and the catalog's cluster.
                <br/>
                With this communication the catalog will be able to deploy the service on your cluster, or at least provide a secure way of
                communication to the service.
                <br/>
                At the end of this operation you will notice a new namespace on your cluster, which will be used to deploy the service, or to
                establish a secure communication with the service.
            </p>
        </Container>
    )

    const copyPeerCommandDiscalimerTitle = "Copy peer command"
    const copyPeerCommandDiscalimerText = (
        <Container>
            <p>
                This command will generate a peer command from the liqoctl tool. Of course, we are assuming
                that you have already installed the liqoctl tool on your machine since you installed Liqo.
                <br/>
                The command will be parsed by the dashboard to extract the needed data to establish the peering.
            </p>
        </Container>
    )

    const chooseHostingPolicyDiscalimerTitle = "Choose hosting policy"
    const chooseHostingPolicyDiscalimerText = (
        <Container>
            <p>
                You have to choose the hosting policy for the service, taking one from the pool of policies offered by the specific service plan you are deploying.
                <br/>
                <b>Keep in mind:</b> the choice of the hosting policy will affect the <u>amount of resources</u> of where the service will be deployed. BUT anyway,
                the service will be reachable from your cluster.
            </p>
        </Container>
    )

    const chooseNamespacePrefixDiscalimerTitle = "Choose namespace prefix"
    const chooseNamespacePrefixDiscalimerText = (
        <Container>
            <p>
                Since the peering phase will create a new namespace on your cluster, you can choose a prefix to assign to it.
                <b>Please note:</b> the EFFECTIVE name will be generated at the end of the process and will be composed by
                the prefix AND a random string.
            </p>
        </Container>
    )

    const translatePolicy = (policy) => {
        switch (policy) {
            case "Local":
                return (
                    <span>
                        <Cloud/> Hosted by the service provider's cluster
                    </span>                    
                )
            case "Remote":
                return (
                    <span>
                    <House/> Hosted by the user's cluster
                    </span>
                )
            case "LocalAndRemote":
                return (
                    <span>
                    <Shuffle/> Hosted by both the service provider's cluster and the user's cluster
                    </span>
                )
            default:
                return "Unknown policy"
                }
    }

    useEffect(() => {
        // Split text by space
        let parts = peerCommandResult.split(" ");
        // Get clusterid
        let clusterid = parts[parts.indexOf("--cluster-id")+1];
        // Get clusterauthurl
        let clusterauthurl = parts[parts.indexOf("--auth-url")+1];
        // Get clusterauthtoken
        let clusterauthtoken = parts[parts.indexOf("--auth-token")+1];
        // Get clustername
        let clustername = parts[parts.indexOf("out-of-band")+1];

        // Set state
        setClusterId(clusterid);
        setClusterAuthUrl(clusterauthurl);
        setClusterAuthToken(clusterauthtoken);
        setClusterName(clustername);
    }, [peerCommandResult])

    const handlePeering = (e) => {
        e.preventDefault();
        if (clusterId === "" || clusterName === "" || clusterAuthUrl === "" || clusterAuthToken === "") {
            setError("Please fill all the fields")
            return
        } else {
            setError("")
            setPeeringStarted(true)
            setShowModal(true)

            // Send peering request to marketplace
            peerDeployment(
                auth.user?.access_token,
                idDeployment,
                idServiceProvider,
                clusterId,
                clusterName,
                clusterAuthUrl,
                clusterAuthToken,
                offloadingPolicy,
                prefixNamespace
            ).then((response) => {
                if (response.status === 202 || response.status === 200) {
                    // Peering has been started
                    setPeeringCheckPhase(true)
                    setPeered(true)
                } else {
                    setError("Error while peering the deployment")
                    console.log("Error while peering the deployment: "+ response.status)
                    setPeeringStarted(false)
                }
            }
            ).catch((error) => {
                setError(error.message)
                setPeeringStarted(false)
            }
            )
        }
    }

    return (
        <Container>
            <Row>
                <Col>
                    <h4>
                        2/5 - Cluster peering
                        <DisclaimerInfo
                            disclaimerTitle={generalDisclaimerTitle}
                            disclaimerText={generalDisclaimerText}
                        />
                    </h4>
                </Col>
            </Row>
            <Row>
                <Col>
                    <Card className="m-3 p-3">
                        <p>
                            <b>1. Copy the following command into your terminal and paste the result in the box</b>
                            <DisclaimerInfo
                                disclaimerTitle={copyPeerCommandDiscalimerTitle}
                                disclaimerText={copyPeerCommandDiscalimerText}
                            />
                        </p>
                        <Form>
                            <fieldset disabled={peered}>
                                <Form.Group controlId="formPeerCommand" className="ms-3 me-3 mb-3">
                                    <Form.Label>Command to copy:</Form.Label>
                                    <InputGroup>
                                        <Form.Control type="text" placeholder="Peer command" value={peerCommand} readOnly disabled />
                                        <Button className="text-center" onClick={ () => navigator.clipboard.writeText(peerCommand)} ><BsFillClipboardFill /></Button>
                                    </InputGroup>
                                </Form.Group>
                                <Form.Group controlId="formPeerCommandResult" className="m-3">
                                    <Form.Label>Result of the command:</Form.Label>
                                    <Form.Control as="textarea" rows={5} placeholder="Paste result here" value={peerCommandResult} onChange={(e) => setPeerCommandResult(e.target.value)}/>
                                </Form.Group>
                            </fieldset>                            
                        </Form>
                    </Card>                    
                </Col>                
            </Row>
            <Row>
                <Col>
                    <Collapse in={peerCommandResult !== ""}>
                        <Card className="m-3 p-3">
                            <p>
                                <b>2. Choose where your service will be hosted:</b>
                                <DisclaimerInfo
                                    disclaimerTitle={chooseHostingPolicyDiscalimerTitle}
                                    disclaimerText={chooseHostingPolicyDiscalimerText}
                                />
                            </p>
                            <Form>
                                <fieldset disabled={peered}>
                                    <Form.Group controlId="peeringPolicy" className="ms-3 me-3 mb-3">
                                        <Form.Label>Hosting policies available:</Form.Label>
                                        {peeringPolicies.map((policy) => (
                                            <Form.Check
                                            type="radio"
                                            key={policy}
                                            label={translatePolicy(policy)}
                                            checked={offloadingPolicy === policy}
                                            onChange={() => setOffloadingPolicy(policy)}
                                            />
                                        ))}
                                    </Form.Group>
                                </fieldset>
                            </Form>
                        </Card>
                    </Collapse>  
                </Col>
            </Row>
            <Row>
                <Col>
                    <Collapse in={offloadingPolicy !== "" && peerCommandResult !== ""}>
                        <Card className="m-3 p-3">
                            <p>
                                <b>3. Choose if you want a custom prefix for the namespace that will be created:</b>
                                <DisclaimerInfo
                                    disclaimerTitle={chooseNamespacePrefixDiscalimerTitle}
                                    disclaimerText={chooseNamespacePrefixDiscalimerText}
                                />
                            </p>
                            <Form>
                                <fieldset disabled={peered}>
                                    <Form.Group controlId="formPrefixNamespace" className="ms-3 me-3 mb-3">
                                        <Form.Label>Namespace prefix you want (OPTIONAL)</Form.Label>
                                        <Form.Control type="text" placeholder="Prefix Namespace" value={prefixNamespace} onChange={(e) => setPrefixNamespace(e.target.value)}/>
                                        <Form.Text className="text-muted">
                                            If you want a specific namespace you can at least specify a prefix, the real namespace name will be retriven after succesfull peering
                                        </Form.Text>
                                    </Form.Group>
                                </fieldset>                                
                            </Form>                            
                        </Card>
                    </Collapse>
                </Col>
            </Row>
            <Row>
                <Col>
                    <Collapse in={offloadingPolicy !== "" && peerCommandResult !== ""}>
                        <Card className="m-3 p-3">
                            <p>
                                <b>4. Check the summary of informations and then you can start the peering:</b>
                                <DisclaimerInfo
                                    disclaimerTitle={chooseNamespacePrefixDiscalimerTitle}
                                    disclaimerText={chooseNamespacePrefixDiscalimerText}
                                />
                            </p>
                            <Accordion className="p-2">
                                <Accordion.Item eventKey="0">
                                    <Accordion.Header>Summary of peering informations</Accordion.Header>
                                    <Accordion.Body>
                                        <Row>
                                            <Col>
                                                <Form>
                                                    <Form.Group controlId="formClusterId" className="m-3">
                                                        <Form.Label>Cluster ID</Form.Label>
                                                        <Form.Control type="text" placeholder="Cluster ID" value={clusterId} readOnly disabled/>
                                                    </Form.Group>
                                                    <Form.Group controlId="formClusterName" className="m-3">
                                                        <Form.Label>Cluster Name</Form.Label>
                                                        <Form.Control type="text" placeholder="Cluster Name" value={clusterName} readOnly disabled/>
                                                    </Form.Group>
                                                    <Form.Group controlId="formClusterAuthUrl" className="m-3">
                                                        <Form.Label>Cluster Auth URL</Form.Label>
                                                        <Form.Control type="text" placeholder="Cluster Auth URL" value={clusterAuthUrl} readOnly disabled/>
                                                    </Form.Group>
                                                    <Form.Group controlId="formClusterAuthToken" className="m-3">
                                                        <Form.Label>Cluster Auth Token</Form.Label>
                                                        <Form.Control as="textarea" rows={3} placeholder="Cluster Auth Token" value={clusterAuthToken} readOnly disabled/>
                                                    </Form.Group>
                                                    <Form.Group controlId="formPrefixNamespace" className="m-3">
                                                        <Form.Label>Namespace Prefix</Form.Label>
                                                        <Form.Control type="text" placeholder="Prefix Namespace" value={prefixNamespace} readOnly disabled/>
                                                    </Form.Group>
                                                    <Form.Group controlId="formHostingPolicy" className="m-3">
                                                        <Form.Label>Hosting policy chosen:</Form.Label>
                                                        <Form.Text><p>{translatePolicy(offloadingPolicy)}</p></Form.Text>
                                                    </Form.Group>
                                                </Form>
                                            </Col>
                                        </Row>
                                    </Accordion.Body>
                                </Accordion.Item>
                            </Accordion>
                            <Button variant="primary" onClick={handlePeering} className="m-3" disabled={peeringStatus || peeringStarted}>Peer</Button>
                        </Card>
                    </Collapse>
                </Col>
            </Row>
            <Row>
                <Col className="p-2">
                    <Button variant="outline-primary" type="button" onClick={() => setStep(1)} className='me-3'>Back</Button>
                    <Button variant="primary" onClick={() => setStep(3)} className="m-3" disabled={!peeringStatus}>{"Next"}</Button>                 
                </Col>
            </Row>
            <Modal show={showModal} onHide={() => setShowModal(false)}>
                <Modal.Header closeButton>
                    <Modal.Title>We're establishing the peering for you</Modal.Title>
                </Modal.Header>
                <Modal.Body className="d-flex align-items-center">
                    {peeringStarted ? 
                        peeringStatus ? (
                            <Container className="d-flex align-items-center flex-column p-3">
                                <CheckCircleFill color="green" size={100} className="mb-3" />
                                <p className="text-center">Peering established</p>
                            </Container>
                        ) : (
                            <Container className="d-flex align-items-center flex-column p-3">
                                <Spinner animation="border" size="lg" className="mb-3" />
                                <p className="text-center">Please wait</p>
                            </Container>
                        ) 
                    : (
                        error !== "" ?
                        (
                            <Container className="d-flex align-items-center flex-column p-3">
                                <XCircleFill color="red" size={100} className="mb-3" />
                                <p className="text-center">Something went wrong</p>
                            </Container>
                        ) : (
                            <>
                            </>
                        )
                    )
                    }
                </Modal.Body>
                <Modal.Footer>
                    {peeringStarted ? 
                        peeringStatus ? (
                            <>
                            <Button variant="primary" onClick={() => setShowModal(false)}>Close</Button>
                            <Button variant="primary" onClick={() => setStep(3)} className="m-3" disabled={!peeringStatus}>{"Next"}</Button>
                            </>
                        ) : (
                            <Button variant="primary" onClick={() => setShowModal(false)}>Close</Button>
                        ) 
                    : (
                        <Button variant="primary" onClick={() => setShowModal(false)}>Close</Button>
                    )
                    }
                </Modal.Footer>
            </Modal>
        </Container>
    )

}

export default PeeringInformation;