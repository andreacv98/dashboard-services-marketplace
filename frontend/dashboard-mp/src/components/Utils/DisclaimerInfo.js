import { Button, Modal } from "react-bootstrap";
import { BsInfoCircleFill } from "react-icons/bs";

function DisclaimerInfo(props) {
    const disclaimerText = props.disclaimerText;
    const [show, setShow] = useState(false);

    return (
        <>
            <Button variant="info" onClick={() => setShow(true)}><BsInfoCircleFill size={20}/></Button>
            <Modal show={show} onHide={() => setShow(false)}>
                <Modal.Header closeButton>
                    <Modal.Title>Disclaimer</Modal.Title>
                </Modal.Header>
                <Modal.Body>{disclaimerText}</Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={() => setShow(false)}>Close</Button>
                </Modal.Footer>
            </Modal>
        </>
    )
}

export default DisclaimerInfo;