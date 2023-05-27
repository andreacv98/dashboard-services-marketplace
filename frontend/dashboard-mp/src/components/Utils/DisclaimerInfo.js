import { Button, Modal } from "react-bootstrap";
import {  InfoLg, InfoSquare } from "react-bootstrap-icons";
import { useState } from "react";

function DisclaimerInfo(props) {
    const disclaimerTitle = props.disclaimerTitle;
    const disclaimerText = props.disclaimerText;
    const [show, setShow] = useState(false);

    return (
        <>
            <Button variant="outline-info" onClick={() => setShow(true)} className="d-inline-flex align-items-center m-2"><InfoLg /></Button>
            <Modal variant="info" show={show} onHide={() => setShow(false)}>
                <Modal.Header closeButton>
                    <Modal.Title className="d-inline-flex align-items-center"><InfoSquare className="me-2"/>{disclaimerTitle}</Modal.Title>
                </Modal.Header>
                <Modal.Body>{disclaimerText}</Modal.Body>
            </Modal>
        </>
    )
}

export default DisclaimerInfo;