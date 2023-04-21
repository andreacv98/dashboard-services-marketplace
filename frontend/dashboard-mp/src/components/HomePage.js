import { Card, Container, Button, Row, Col } from "react-bootstrap";

function Home(props) {

    return (
        <>
        <Container>
            <Row>
                <Col>
                    <Container className="p-3 text-center">
                        <h1 className="mx-auto">Welcome</h1>
                    </Container>
                </Col>            
            </Row>  
            <Row>
                <Col>
                    <Container className="d-flex justify-content-center">
                        <Card style={{ width: '25rem' }} className="m-3">
                            <Card.Body>
                                <Card.Title className="text-center">
                                    BUY A SERVICE
                                </Card.Title>
                                <Card.Text>
                                    You are looking for the right service for your application inside your cluster? Just explore our catalog and find the right one for you!
                                </Card.Text>
                                <Button variant="primary" href="/catalog">Go to Catalog</Button>
                            </Card.Body>
                        </Card>
                        <Card style={{ width: '25rem' }} className="m-3">
                            <Card.Body>
                                <Card.Title className="text-center">
                                    OFFER A SERVICE
                                </Card.Title>
                                <Card.Text>
                                    You want to offer your service to the community? Just register your service provider server and let the community know about it!
                                </Card.Text>
                                <Button variant="primary" href="/service-providers/register">Go to Service Registration</Button>
                            </Card.Body>
                        </Card>
                    </Container>
                </Col>
            </Row>
        </Container>                  
        </>
    )
}

export default Home;