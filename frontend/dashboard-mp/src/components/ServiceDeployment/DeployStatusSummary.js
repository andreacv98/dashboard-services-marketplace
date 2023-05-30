import React from 'react';
import { Container, Row, Col, Spinner } from 'react-bootstrap';

function DeployStatusSummary(props) {
    const peeringStatus = props.peeringStatus;
    const instanceStatus = props.instanceStatus;
    const bindingStatus = props.bindingStatus;
    const peeringStarted = props.peeringStarted;
    const instanceStarted = props.instanceStarted;
    const bindingStarted = props.bindingStarted;

    return (
        <Container className="m-3">
            <Row>
                <Col>
                    <h6>Deployment status:</h6>
                </Col>
            </Row>
            <Row>
                <Col>
                    {peeringStarted ? 
                        peeringStatus ? (
                            <div className="d-flex align-items-center">
                                <span className="m-2 text-success">&#10004;</span>
                                <span>Peering established</span>
                            </div>
                        ) : (
                            <div className="d-flex align-items-center">
                                <Spinner animation="border" variant="primary" size="sm" />
                                <span className="m-2">Establishing peering</span>
                            </div>
                        )
                        : (
                            <div className="d-flex align-items-center">
                                <Spinner animation="grow" variant="primary" size="sm" />
                                <span className="m-2">Waiting to start peering</span>
                            </div>
                        )  
                    }                          
                </Col>
            </Row>
            <Row>
                <Col>
                    {instanceStarted ?
                        instanceStatus ? (
                            <div className="d-flex align-items-center">
                                <span className="m-2 text-success">&#10004;</span>
                                <span>Service created</span>
                            </div>
                        ) : (
                            <div className="d-flex align-items-center">
                                <Spinner animation="border" variant="primary" size="sm" />
                                <span className="m-2">Service creating</span>
                            </div>
                        )
                        : (
                            <div className="d-flex align-items-center">
                                <Spinner animation="grow" variant="primary" size="sm" />
                                <span className="m-2">Waiting to create service</span>
                            </div>
                        )}
                </Col>
            </Row>
            <Row>
                <Col>
                    {bindingStarted ? 
                        bindingStatus ? (
                            <div className="d-flex align-items-center">
                                <span className="m-2 text-success">&#10004;</span>
                                <span>Binding created</span>
                            </div>
                        ) : (
                            <div className="d-flex align-items-center">
                                <Spinner animation="border" variant="primary" size="sm" />
                                <span className="m-2">Creating binding</span>
                            </div>
                        )
                        : (
                            <div className="d-flex align-items-center">
                                <Spinner animation="grow" variant="primary" size="sm" />
                                <span className="m-2">Waiting to bind</span>
                            </div>
                        )
                    }                            
                </Col>
            </Row>
        </Container>
    )
}

export default DeployStatusSummary;