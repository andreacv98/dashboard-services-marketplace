import { Alert, Container, Modal, Button, Spinner } from "react-bootstrap";
import { CheckCircleFill, ExclamationTriangleFill, XCircleFill } from "react-bootstrap-icons";

function CheckConnectionModal(props) {

    const url = props.url;
    const showConnectionModal = props.showConnectionModal;
    const setShowConnectionModal = props.setShowConnectionModal;
    const reachable = props.reachable;
    const startReachabilityTest = props.startReachabilityTest;
    const setStartReachabilityTest = props.setStartReachabilityTest;
    const startCatalogReachabilityTest = props.startCatalogReachabilityTest;
    const setStartCatalogReachabilityTest = props.setStartCatalogReachabilityTest;
    const catalogReachable = props.catalogReachable;
    const setReachable = props.setReachable;
    const setCatalogReachable = props.setCatalogReachable;

    const error = props.error;
    const setError = props.setError;

    const setStep = props.setStep;

    const resetTests = props.resetTests;

    function reachabilityTestRender(reachableStatus) {
        switch (reachableStatus) {
            case true:
                return (
                    <p className="text-success">
                        <CheckCircleFill /> Successfully connected to your catalog
                    </p>
                )
            case false:
                return (
                    <>
                        <p className="text-warning">
                            <XCircleFill /> Unable to connect to your catalog
                        </p>
                        <Alert variant="warning">
                            <p>
                                We were unable to reach your catalog making an HTTP GET request to <code>{url}/readyz</code>.
                                <br />
                                Please ensure your catalog is reachable through the internet and that the <code>readyz</code> endpoint is available.
                                Then click the button below to try again.
                            </p>
                        </Alert>
                    </>
                    
                )
            default:
                return (
                    <p>
                        <Spinner animation="border" size="sm" /> Contacting your catalog...
                    </p>
                )
        }
    }

    function reachabilityCatalogTestRender(catalogReachableStatus) {
        switch (catalogReachableStatus) {
            case true:
                return (
                    <p className="text-success">
                        <CheckCircleFill /> Successfully retrieved your catalog services
                    </p>
                )
            case false:
                return (
                    <>
                        <p className="text-warning">
                            <XCircleFill /> Unable to connect to your catalog
                        </p>
                        <Alert variant="warning">
                            <p>
                                We were unable to reach your catalog protected API endpoint at <code>{url}/v2/catalog</code>.
                                <br />
                                Please ensure you followed the previous instructions for "Authentication configuration", so that
                                the catalog can accept token provided by the authentication server of the marketplace.
                            </p>
                        </Alert>
                    </>
                    
                )
            default:
                return (
                    <p>
                        <Spinner animation="border" size="sm" /> Contacting your catalog...
                    </p>
                )
        }
    }

    return (
        <Modal show={showConnectionModal} onHide={() => setShowConnectionModal(false)}>
            <Modal.Header closeButton>
                <Modal.Title>Checking connection to your catalog...</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <Container>
                    <p>Checking connection to your catalog at <code>{url}</code>...</p>
                    <ul>
                        <li>
                            { startReachabilityTest ? 
                                reachabilityTestRender(reachable) :
                                (
                                    <p>
                                        <Spinner animation="border" size="sm" /> Waiting to start the test...
                                    </p>
                                )                           
                            }
                        </li>
                        <li>
                            { !startReachabilityTest ?
                                (
                                    <p>
                                        <Spinner animation="border" size="sm" /> Waiting for previous tests...
                                    </p>
                                )
                                : reachable === true ?
                                    startCatalogReachabilityTest ?
                                    reachabilityCatalogTestRender(catalogReachable) :
                                    (
                                        <p>
                                            <Spinner animation="border" size="sm" /> Waiting to start the test...
                                        </p>
                                    )
                                : reachable === false ?
                                    (
                                        <p className="text-danger">
                                            <ExclamationTriangleFill /> Test aborted due to previous error
                                        </p>
                                    )
                                :
                                (
                                    <p>
                                        <Spinner animation="border" size="sm" /> Waiting for previous tests...
                                    </p>
                                )
                                        
                            }
                        </li>
                    </ul>
                    {
                        error !== "" ?
                            <hr />
                        :
                            <></>
                    }
                    <Alert variant="danger" show={error !== ""}>
                        <p>
                            An error occured during the reachability tests:
                            <br />
                            <code>
                                {error}
                            </code>                            
                        </p>
                    </Alert>
                </Container>             
            </Modal.Body>
            {
                startReachabilityTest ?
                    !reachable ?
                        (
                            <Modal.Footer>
                                <Button onClick={resetTests}>
                                    Test again
                                </Button>
                            </Modal.Footer>
                        )
                    :
                        startCatalogReachabilityTest ?
                            !catalogReachable ?
                                (
                                    <Modal.Footer>
                                        <Button onClick={() => setStep(2)}>
                                            Get authentication configuration
                                        </Button>
                                        <Button onClick={resetTests}>
                                            Test again
                                        </Button>
                                    </Modal.Footer>
                                )
                            :
                                (
                                    <>
                                        <Modal.Footer>
                                            <Button onClick={() => setShowConnectionModal(false)}>
                                                Close
                                            </Button>
                                        </Modal.Footer>
                                    </>
                                )
                        :
                            (
                                <>
                                </>
                            )
                :
                    (
                        <>
                        </>
                    )
            }
            
        </Modal>
    )

}

export default CheckConnectionModal;