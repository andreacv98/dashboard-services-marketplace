import { Card } from "react-bootstrap";
import { Button } from "react-bootstrap";

function ServiceCard (props) {

    const id = props.id
    const serviceTitle = props.title;
    const serviceDescription = props.description;
    const serviceTags = props.tags;
    const serviceProviderID = props.serviceProviderID;

    const buyUrl = "/buyservice/"+serviceProviderID+"/"+id;

    return (
        <>
            <Card style={{ width: '18rem' }} className="m-3">
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
                    <Button variant="primary" href={buyUrl}>Buy</Button>
                </Card.Body>
            </Card>
        </>
    );
}

export default ServiceCard;