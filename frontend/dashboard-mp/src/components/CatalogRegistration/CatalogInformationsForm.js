import { Row, Col, Button, Form, Container } from 'react-bootstrap';
import { addServiceProvider } from '../../configs/marketplaceConfig';
import { useAuth } from "react-oidc-context";

function CatalogInformationsForm(props) {
    const auth = useAuth();
    const setStep = props.setStep;
    const name = props.name;
    const setName = props.setName;
    const description = props.description;
    const setDescription = props.setDescription;
    const url = props.url;
    const setUrl = props.setUrl;
    const setError = props.setError;
    const setIsLoading = props.setIsLoading;
    const setCredentials = props.setCredentials;

    const sendRegistrationRequest = async () => {
        // Send HTTP request to backend
        var response = await addServiceProvider(name, description, url, auth.user?.access_token)
        if (response.status === 200) {
            var result = await response.json()
            console.log("Registration successful! : " + result)
            setCredentials(result)      
        } else {
            var result = await response.json()
            return "Error registering catalog: " + result.error;
        }

        return "";
    }

    const handleRegistration = (event) => {
        event.preventDefault();
        if (name === "" || description === "" || url === "") {
            setError("Please fill out all fields!");
        } else {
            setError("");
            setIsLoading(true);
            checkURL(url).then((error) => {
                if (error === "") {
                    console.log("Sending registration request...")
                    sendRegistrationRequest().then((error) => {
                        console.log("Registration request sent!")
                        if (error !== "") {
                            console.log("Error registering service provider! : " + error)
                            setError(error);
                        } else {
                            console.log("Registration successful!")
                            setStep(2);
                        }
                        setIsLoading(false);  
                    });
                } else {
                    console.log("Error checking URL! : " + error)
                    setError(error);
                    setIsLoading(false);
                }
                console.log("Done checking URL!")                
            });
        }
    }

    const checkURL = async (url) => {
        try {
            new URL(url);
        } catch (_) {
            return "URL is not valid!";
        }
        return "";  
    }

    return (
        <Container>
            <Row>
                <Col>
                    <Container className="p-3 text-center">
                        <h1>Catalog Registration</h1>
                    </Container>
                </Col>
            </Row>
            <Row>
                <Col>
                    <Container className="p-3">
                        <h2>1/3 - Catalog informations</h2>
                    </Container>
                </Col>
            </Row>
            <Row>
                <Col>
                <Container className="p-3">
                    <Form>
                        <Row>
                            <Col>
                                <Form.Group className="mb-3" controlId="formName">
                                    <Form.Label>Name</Form.Label>
                                    <Form.Control type="text" placeholder="Enter name" value={name} onChange={(e) => setName(e.target.value)} />
                                    <Form.Text>The name of your catalog. It will be recognized by all the users inside the marketplace by this identification.</Form.Text>
                                </Form.Group>
                            </Col>
                            <Col>
                                <Form.Group className="mb-3" controlId="formUrl">
                                    <Form.Label>URL</Form.Label>
                                    <Form.Control type="text" placeholder="Enter URL" value={url} onChange={(e) => setUrl(e.target.value)} />
                                    <Form.Text>The URL of your catalog. It will be used to reach your catalog and its services. "HTTPS" URL is recommended.</Form.Text>
                                </Form.Group>
                            </Col>
                        </Row>
                        <Row>
                            <Col>
                                <Form.Group className="mb-3" controlId="formDescription">
                                    <Form.Label>Description</Form.Label>
                                    <Form.Control as="textarea" placeholder="Enter description" value={description} onChange={(e) => setDescription(e.target.value)} />
                                    <Form.Text>The description of your catalog. Few words to describe the catalog and its content to all users.</Form.Text>
                                </Form.Group>
                            </Col>
                        </Row>
                        <Button variant="outline-primary" type="button" onClick={() => setStep(0)} className='me-3'>Back</Button>                     
                        <Button variant="primary" type="submit" onClick={handleRegistration} className='me-3'>Next</Button>
                    </Form>
                </Container>
                    
                </Col>
            </Row>
            
        </Container>  
    )
}

export default CatalogInformationsForm;