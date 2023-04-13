import { Container, Alert } from "react-bootstrap";
import { useAuth } from "react-oidc-context";

function ErrorBar(props) {
    const auth = useAuth();
    
    return (
        <>
        { auth.error ? (
                <Container>
                    <Alert key="danger" variant="danger">
                        {auth.error.message}
                    </Alert>
                </Container>
            ) : (
                <></>    
            )        
        }            
        </>
    )
}

export default ErrorBar;