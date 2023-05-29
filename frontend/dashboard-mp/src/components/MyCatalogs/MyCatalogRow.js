import { useEffect } from "react";
import { useState } from "react";
import { deployService, getServices } from "../../configs/marketplaceConfig";
import {Button, Container, Form, Modal, Spinner} from 'react-bootstrap';
import { useAuth } from "react-oidc-context";
import { CheckCircleFill, XCircleFill } from "react-bootstrap-icons";
import { checkServiceBrokerReadiness } from "../../utils/utils";

function MyCatalogRow(props) {
    const auth = useAuth();
    const id = props.id;
    const createdAt = props.createdAt;
    const name = props.name;
    const description = props.description;
    const url = props.url;

    const [isReachable, setIsReachable] = useState(false);
    const [isConnecting, setIsConnecting] = useState(false);
    const [showDetails, setShowDetails] = useState(false);

    useEffect(() => {
        setIsConnecting(true);
        checkServiceBrokerReadiness(url).then((res) => {
            setIsReachable(res);
            setIsConnecting(false);
        }).catch((err) => {
            setIsReachable(false);
            setIsConnecting(false);
        })
    }, [])

    return (
        <>
            <Modal show={showDetails} onHide={() => setShowDetails(false)}>
                <Modal.Header closeButton>
                    <Modal.Title>Details of: {name}</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <>
                        <Form>
                            <Form.Group className="mb-3" controlId="Name">
                                <Form.Label>Name</Form.Label>
                                <Form.Control type="text" placeholder="Catalog name" value={name} readOnly disabled/>
                            </Form.Group>
                            <Form.Group className="mb-3" controlId="Url">
                                <Form.Label>URL</Form.Label>
                                <Form.Control type="text" placeholder="Catalog URL" value={url} readOnly disabled/>
                            </Form.Group>
                            <Form.Group className="mb-3" controlId="Description">
                                <Form.Label>Description</Form.Label>
                                <Form.Control as="textarea" placeholder="Catalog description" value={description} readOnly disabled/>
                            </Form.Group>
                            <Form.Group className="mb-3" controlId="CreatedAt">
                                <Form.Label>Created at</Form.Label>
                                <Form.Control type="text" placeholder="Catalog created at" value={new Date(props.createdAt).toLocaleString()} readOnly disabled/>
                            </Form.Group>
                        </Form>
                    </>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={() => setShowDetails(false)}>
                        Close
                    </Button>
                </Modal.Footer>
            </Modal>
            <tr>
                <td>{name}</td>
                <td>{url}</td>
                <td>{
                    isConnecting ?
                    (
                        <Container><Spinner /></Container>
                    )
                    :
                    isReachable ?
                        (
                            <Container className="text-success"><CheckCircleFill></CheckCircleFill></Container>
                        )
                        :
                        (
                            <Container className="text-danger"><XCircleFill></XCircleFill></Container>
                        )
                    }
                </td>
                <td><Button variant="primary" onClick={() => setShowDetails(true)}>Details</Button></td>
            </tr>
        </>
        
    )
}

export default MyCatalogRow;