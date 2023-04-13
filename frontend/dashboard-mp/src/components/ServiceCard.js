import { Card } from "react-bootstrap";
import { Button } from "react-bootstrap";

function ServiceCard (props) {

    const serviceTitle = props.serviceTitle;
    const serviceDescription = props.serviceDescription;
    const serviceTags = props.serviceTags;

    return (
        <>
            <Card style={{ width: '18rem' }}>
                <Card.Body>
                    <Card.Title>
                        {serviceTitle}
                    </Card.Title>
                    <Card.Text>
                        {serviceDescription}
                    </Card.Text>
                    <Card.Text>
                        Tags: {serviceTags}
                    </Card.Text>
                    <Button variant="primary">Buy</Button>
                </Card.Body>
            </Card>
        </>
    );
}

export default ServiceCard;