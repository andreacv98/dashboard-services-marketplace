import { useAuth } from "react-oidc-context";
import { Alert, Button, Card, Col, Row, Spinner } from "react-bootstrap";
import { Navigate } from "react-router-dom";
import { Container } from "react-bootstrap";

function Profile (props) {

    const auth = useAuth();
    const expirationDate = new Date(auth.user?.expires_at * 1000); // moltiplica per 1000 per convertire il timestamp Unix in millisecondi
    const formattedExpirationDate = expirationDate.toLocaleString();
    
    if (auth.isLoading) {
        return (
            <Spinner animation="border" role="status">
                <span className="visually-hidden">Loading...</span>
            </Spinner>
        )
    } else {
        // Check if user authenticated
        if (auth.isAuthenticated) {
            return (
                <>
                    <Container>
                        <Row>
                            <Col>
                                <h1 className="text-center m-3">Profile</h1>
                            </Col>
                        </Row>
                        <Row>
                            <Col>
                                <Card className="m-3">
                                    <Card.Header>
                                        <Card.Title>Personal information</Card.Title>
                                    </Card.Header>
                                    <Card.Body>
                                        <Card.Text>
                                            <p>Username: {auth.user?.profile.preferred_username}</p>
                                            <p>First name: {auth.user?.profile.given_name}</p>
                                            <p>Last name: {auth.user?.profile.family_name}</p>
                                            <p>Email: {auth.user?.profile.email}</p>
                                        </Card.Text>
                                    </Card.Body>
                                </Card>                                
                            </Col>
                        </Row>
                        <Row>
                            <Col>
                                <Alert variant="danger" show={auth.error !== undefined}>
                                    {auth.error?.message}
                                </Alert>
                            </Col>
                        </Row>
                    </Container>
                </>
            )
        } else {
            return (
                <>
                    <Navigate to="/" />
                </>
            )
        }
    }
}

export default Profile;