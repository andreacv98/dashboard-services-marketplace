import { Button, Form } from "react-bootstrap";
import { CheckCircleFill, XCircleFill } from "react-bootstrap-icons";

function ServiceSummary(props) {

    const setStep = props.setStep;
    const serviceName = props.serviceName;
    const planName = props.planName;
    const bindable = props.bindable;

    return (
        <>
        <h4>Service informations</h4>
        <p>Here's a summary of the information about the service you're going to deploy</p>
            <Form>
                <Form.Group controlId="formServiceName" className="m-3">
                    <Form.Label>Service Name</Form.Label>
                    <Form.Control type="text" placeholder="Service name" value={serviceName} disabled readOnly/>
                    <Form.Text className="text-muted">
                        The service you selected
                    </Form.Text>
                </Form.Group>
                <Form.Group controlId="formPlanName" className="m-3">
                    <Form.Label>Plan Name</Form.Label>
                    <Form.Control type="text" placeholder="Plan name" value={planName} disabled readOnly/>
                    <Form.Text className="text-muted">
                        The plan you selected
                    </Form.Text>
                </Form.Group>
                <Form.Group controlId="formServiceName" className="m-3">
                    <Form.Label>Bindable service</Form.Label>
                    <p className={bindable ? "text-success" : "text-danger"}>{bindable ? <CheckCircleFill /> : <XCircleFill />} {bindable ? "The service will be automatically binded to the applications" : "No automatic binding to the applications"}</p>
                    <Form.Text className="text-muted">
                        Capability of the service to be automatically binded to the applications on your cluster
                    </Form.Text>
                </Form.Group>
            </Form>
        <Button variant="primary" onClick={() => setStep(1)}>Next</Button>
        </>
    )

}

export default ServiceSummary;