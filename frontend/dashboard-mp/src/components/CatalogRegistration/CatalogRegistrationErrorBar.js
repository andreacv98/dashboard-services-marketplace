import { Alert } from "react-bootstrap";

function CatalogRegistrationErrorBar(props) {
    const error = props.error;
    const setError = props.setError;

    if (error !== "") {
        return (
            <Alert variant="danger" onClose={() => setError("")} dismissible>
                <Alert.Heading>Oh snap! Something went wrong!</Alert.Heading>
                <p>{error}</p>
            </Alert>
        )
    }
}

export default CatalogRegistrationErrorBar;