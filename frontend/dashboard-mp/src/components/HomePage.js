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
                                    EXPLORE CATALOGS
                                </Card.Title>
                                <Card.Text>
                                    You are looking for the right service for your application inside your cluster? Just explore our catalog and find the right one for you!
                                </Card.Text>
                                <Button variant="primary" href="/catalog">Explore Catalogs</Button>
                            </Card.Body>
                        </Card>
                        <Card style={{ width: '25rem' }} className="m-3">
                            <Card.Body>
                                <Card.Title className="text-center">
                                    REGISTER YOUR CATALOG
                                </Card.Title>
                                <Card.Text>
                                    You want to offer your services to the community? Just register your catalog server and let the community know about them!
                                </Card.Text>
                                <Button variant="primary" href="/service-providers/register">Register Catalog</Button>
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