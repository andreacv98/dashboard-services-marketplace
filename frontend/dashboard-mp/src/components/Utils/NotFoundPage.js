import { Row, Col, Container, Button } from "react-bootstrap";

function NotFoundPage(props) {
    return (
        <Container>
          <Row className="justify-content-center mt-5 text-center">
            <Col md={6}>
              <h1>404: Page not found</h1>
              <p>Sorry, but the page you're requiring does not exist</p>
              <Button href="/">Come back to homepage</Button>
            </Col>
          </Row>
        </Container>
      );
}

export default NotFoundPage;