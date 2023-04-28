import { useEffect, useState } from "react";
import { Container, Form as BootstrapForm, Button, Alert } from "react-bootstrap";
import { bindService, getServices } from "../configs/marketplaceConfig";
import Form from '@rjsf/bootstrap-4';
import validator from '@rjsf/validator-ajv8';
import { useAuth } from "react-oidc-context";
import { peerDeployment, checkPeering, instanceService, checkInstance } from "../configs/marketplaceConfig";

function DeployForm(props) {

    const auth = useAuth();

    const idDeployment = props.idDeployment;
    const idServiceProvider = props.idServiceProvider;
    const idService = props.idService;
    const idPlan = props.idPlan;
    const isLoading = props.isLoading;
    const setIsLoading = props.setIsLoading;
    const error = props.error;
    const setError = props.setError;

    const peeringStatus = props.peeringStatus;
    const setPeeringStatus = props.setPeeringStatus;
    const instanceStatus = props.instanceStatus;
    const setInstanceStatus = props.setInstanceStatus;
    const bindingStatus = props.bindingStatus;
    const setBindingStatus = props.setBindingStatus;
    const peeringStarted = props.peeringStarted;
    const setPeeringStarted = props.setPeeringStarted;
    const instanceStarted = props.instanceStarted;
    const setInstanceStarted = props.setInstanceStarted;
    const bindingStarted = props.bindingStarted;
    const setBindingStarted = props.setBindingStarted;

    const [serviceName, setServiceName] = useState("");
    const [planName, setPlanName] = useState("");
    const [bindable, setBindable] = useState(false);
    const [parameters, setParameters] = useState({});
    const [parametersBinding, setParametersBinding] = useState({});

    const [peerCommand, setPeerCommand] = useState("");
    const [clusterid, setClusterId] = useState("");
    const [clustername, setClusterName] = useState("");
    const [clusterauthurl, setClusterAuthUrl] = useState("");
    const [clusterauthtoken, setClusterAuthToken] = useState("");
    const [prefixNamespace, setPrefixNamespace] = useState("");

    const [peeringCheckPhase, setPeeringCheckPhase] = useState(false);
    const [instanceCheckPhase, setInstanceCheckPhase] = useState(false);
    const [bindingCheckPhase, setBindingCheckPhase] = useState(false);

    const [namespace, setNamespace] = useState("");

    const [serviceInstanceId, setServiceInstanceId] = useState("");
    const [serviceBindingId, setServiceBindingId] = useState("");

    const [instanceData, setInstanceData] = useState({});
    const [bindingData, setBindingData] = useState({});

    const [step, setStep] = useState(0);
    
    const uiSchemaInstance = {
        'ui:submitButtonOptions': {
            submitText: 'Submit',
          },
    }

    useEffect(() => {
        if (props.idPeering !== undefined) {
            setPeeringStarted(true);
            setPeeringCheckPhase(true);
            setStep(2);
        }
        if (props.idInstance !== undefined) {
            setInstanceStarted(true);
            setInstanceCheckPhase(true);
            setStep(3);
        }
        if (props.idBinding !== undefined) {
            setBindingStarted(true);
            setBindingCheckPhase(true);
            setStep(4);
        }
    }, [])

    useEffect(() => {
        // Split text by space
        let parts = peerCommand.split(" ");
        // Get clusterid
        let clusterid = parts[parts.indexOf("--cluster-id")+1];
        // Get clusterauthurl
        let clusterauthurl = parts[parts.indexOf("--auth-url")+1];
        // Get clusterauthtoken
        let clusterauthtoken = parts[parts.indexOf("--auth-token")+1];
        // Get clustername
        let clustername = parts[parts.indexOf("out-of-band")+1];

        // Set state
        setClusterId(clusterid);
        setClusterAuthUrl(clusterauthurl);
        setClusterAuthToken(clusterauthtoken);
        setClusterName(clustername);
    }, [peerCommand])

    useEffect(() => {
        if(!isLoading) {
            if (!bindable) {
                setBindingStatus(true);
            } else {
                setBindingStatus(false);
            }
        }        
    }, [bindable])

    useEffect(() => {
        // Retrieve catalog from marketplace
        setIsLoading(true)
        getServices(idServiceProvider).then((response) => {
            // Get service name
            response.json().then((data) => {
                let services = data.services;
                let serviceFound = services.find(service => service.id === idService);
                let planFound = serviceFound.plans.find(plan => plan.id === idPlan);

                setServiceName(serviceFound.name)
                setPlanName(planFound.name)
                if(planFound.schemas.service_instance.create.parameters !== undefined) {
                    setParameters(planFound.schemas.service_instance.create.parameters)
                }
                if(planFound.schemas.service_binding.create.parameters !== undefined) {
                    setParametersBinding(planFound.schemas.service_binding.create.parameters)
                }
                if (serviceFound.bindable !== undefined) {
                    setBindable(serviceFound.bindable)
                } else {
                    setBindable(false)
                }
                setIsLoading(false)
            })            
        }).catch((error) => {
            setError(error.message)
            setIsLoading(false)
        })
    }, [idServiceProvider])

    useEffect(() => {
        if (peeringCheckPhase) {
            let interval = setInterval(() => {
                // Check peering status
                checkPeering(
                    idDeployment,
                    auth.user?.access_token
                ).then((response) => {
                    console.log("Peering status: " + response.status)
                    switch (response.status) {                                            
                        case 200:
                            // Peering is done
                            // Get namespace from response body json
                            response.json().then((data) => {
                                let namespace = data.namespace;
                                console.log("Namespace: " + namespace)
                                setNamespace(namespace)
                                setPeeringCheckPhase(false)
                                setPeeringStatus(true)
                                clearInterval(interval)
                            })
                            break;
                        case 102:
                            // Peering is in progress
                            console.log("Peering is in progress")
                            break;
                        default:
                            // Peering has failed
                            console.log("Peering has failed")
                            setError("Error while peering the deployment")
                            setPeeringCheckPhase(false)
                            setPeeringStarted(false)
                            clearInterval(interval)
                            break;
                    }

                }).catch((error) => {
                    setError(error.message)
                    setPeeringCheckPhase(false)
                    setPeeringStarted(false)
                    clearInterval(interval)
                })
            }, 5000);
        }
    }, [peeringCheckPhase])

    useEffect(() => {
        if (instanceCheckPhase) {
            let interval = setInterval(() => {
                // Check peering status
                checkInstance(
                    idDeployment,
                    auth.user?.access_token
                ).then((response) => {
                    console.log("Peering status: " + response.status)
                    switch (response.status) {                                            
                        case 200:
                            // Peering is done
                            setInstanceCheckPhase(false)
                            setInstanceStatus(true)
                            clearInterval(interval)
                            break;
                        case 102:
                            // Peering is in progress
                            console.log("Peering is in progress")
                            break;
                        default:
                            // Peering has failed
                            console.log("Peering has failed")
                            setError("Error while peering the deployment")
                            setInstanceCheckPhase(false)
                            setInstanceStatus(true)
                            clearInterval(interval)
                            break;
                    }

                }).catch((error) => {
                    setError(error.message)
                    setInstanceCheckPhase(false)
                    setInstanceStatus(true)
                    clearInterval(interval)
                })
            }, 5000);
        }
    }, [instanceCheckPhase])

    const handlePeering = (e) => {
        e.preventDefault();
        if (clusterid === "" || clustername === "" || clusterauthurl === "" || clusterauthtoken === "") {
            setError("Please fill all the fields")
            return
        } else {
            setError("")
            setPeeringStarted(true)

            // Send peering request to marketplace
            peerDeployment(
                auth.user?.access_token,
                idDeployment,
                idServiceProvider,
                clusterid,
                clustername,
                clusterauthurl,
                clusterauthtoken,
                prefixNamespace
            ).then((response) => {
                if (response.status === 202) {
                    // Peering has been started
                    setPeeringCheckPhase(true)
                } else {
                    setError("Error while peering the deployment")
                    setPeeringStarted(false)
                }
            }

            )

            //setStep(2)
        }
    }

    const handleServiceInstance = (e) => {
        //e.preventDefault();
        if (namespace === "") {
            setError("No namespace is available")
            return
        } else {
            setError("")
            // Check if service instance id is set
            if (serviceInstanceId === "" && validator.isValid) {
                setError("Please provides a service instance id")
                return
            } else {
                setInstanceStarted(true)
                // Send service instance request to marketplace
                instanceService(
                    auth.user?.access_token,
                    idDeployment,
                    instanceData,
                    serviceInstanceId
                ).then((response) => {
                    if (response.status === 202) {
                        // Service instance has been started
                        setInstanceCheckPhase(true)
                    } else {
                        setError("Error while creating the service instance")
                        setInstanceStarted(false)
                    }
                }).catch((error) => {
                    setError(error.message)
                    setInstanceStarted(false)
                })
            }
        }
    }

    const handleServiceBinding = (e) => {
        //e.preventDefault();
        if (namespace === "") {
            setError("No namespace is available")
            return
        } else {
            setError("")
            // Check if service instance id is set
            if (serviceBindingId === "" && validator.isValid) {
                setError("Please provides a service binding id")
                return
            } else {
                setBindingStarted(true)
                // Send service instance request to marketplace
                bindService(
                    auth.user?.access_token,
                    idDeployment,
                    bindingData,
                    serviceBindingId
                ).then((response) => {
                    if (response.status === 201) {
                        // Service instance has been started
                        setBindingStatus(true)
                    } else {
                        setError("Error while creating the service instance")
                        setInstanceStarted(false)
                    }
                }).catch((error) => {
                    setError(error.message)
                    setInstanceStarted(false)
                })
            }
        }
    }

    const transformErrors = errors => {
        return errors.map(error => {
            switch (error.name) {
                case "required":
                    error.message = "This field is required";
                    break;
                case "minLength":
                    error.message = "This field must be at least " + error.params.limit + " characters";
                    break;
                case "maxLength":
                    error.message = "This field must be at most " + error.params.limit + " characters";
                    break;
                case "pattern":
                    error.message = "This field must match the pattern " + error.params.pattern;
                    break;
                case "format":
                    error.message = "This field must be a valid " + error.params.format;
                    break;
                default:
                    error.message = "Unknown error";
                    break;
            }
          return error;
        });
      };

    switch (step) {
        case 0:
            return (
                <>
                <h4>Service informations</h4>
                <p>Here's a summary of the information about the service you're going to deploy</p>
                    <BootstrapForm>
                        <BootstrapForm.Group controlId="formServiceName" className="m-3">
                            <BootstrapForm.Label>Service Name</BootstrapForm.Label>
                            <BootstrapForm.Control type="text" placeholder="Service name" value={serviceName} disabled readOnly/>
                            <BootstrapForm.Text className="text-muted">
                                The service you selected
                            </BootstrapForm.Text>
                        </BootstrapForm.Group>
                        <BootstrapForm.Group controlId="formPlanName" className="m-3">
                            <BootstrapForm.Label>Plan Name</BootstrapForm.Label>
                            <BootstrapForm.Control type="text" placeholder="Plan name" value={planName} disabled readOnly/>
                            <BootstrapForm.Text className="text-muted">
                                The plan you selected
                            </BootstrapForm.Text>
                        </BootstrapForm.Group>
                        <BootstrapForm.Group controlId="formServiceName" className="m-3">
                            <BootstrapForm.Label>Bindable service</BootstrapForm.Label>
                            <BootstrapForm.Check type="checkbox" label={bindable ? "The service will automatically be binded to the application" : ""} checked={bindable} disabled readOnly/>
                        </BootstrapForm.Group>
                    </BootstrapForm>
                    <Button variant="primary" onClick={() => setStep(1)}>Next</Button>
                </>
            )
        case 1:
            return (
            <>
                <h4>Liqo peering informations</h4>
                <p>In order to get the service selected into your cluster, you need to have <a href="https://docs.liqo.io/en/v0.8.1/installation/install.html" target="_blank" >Liqo</a> installed into it.</p>
                <br/>
                <p>Once Liqo is installed you need to get peer command informations by:</p>
                <pre>
                    liqoctl generate peer-command --only-command 
                </pre>
                <br/>
                <p>Then paste the result into the following box and edit single informations if any of it is wrong: </p>
                <BootstrapForm>
                    <BootstrapForm.Group controlId="formPeerCommand" className="m-3">
                        <BootstrapForm.Label>Peer command</BootstrapForm.Label>
                        <BootstrapForm.Control as="textarea" rows={3} placeholder="Peer command" value={peerCommand} onChange={(e) => setPeerCommand(e.target.value)}/>
                    </BootstrapForm.Group>
                </BootstrapForm>
                <hr/>
                <BootstrapForm>
                    <BootstrapForm.Group controlId="formClusterId" className="m-3">
                        <BootstrapForm.Label>Cluster ID*</BootstrapForm.Label>
                        <BootstrapForm.Control type="text" placeholder="Cluster ID" value={clusterid} onChange={(e) => setClusterId(e.target.value)}/>
                    </BootstrapForm.Group>
                    <BootstrapForm.Group controlId="formClusterName" className="m-3">
                        <BootstrapForm.Label>Cluster Name*</BootstrapForm.Label>
                        <BootstrapForm.Control type="text" placeholder="Cluster Name" value={clustername} onChange={(e) => setClusterName(e.target.value)}/>
                    </BootstrapForm.Group>
                    <BootstrapForm.Group controlId="formClusterAuthUrl" className="m-3">
                        <BootstrapForm.Label>Cluster Auth URL*</BootstrapForm.Label>
                        <BootstrapForm.Control type="text" placeholder="Cluster Auth URL" value={clusterauthurl} onChange={(e) => setClusterAuthUrl(e.target.value)}/>
                    </BootstrapForm.Group>
                    <BootstrapForm.Group controlId="formClusterAuthToken" className="m-3">
                        <BootstrapForm.Label>Cluster Auth Token*</BootstrapForm.Label>
                        <BootstrapForm.Control type="text" placeholder="Cluster Auth Token" value={clusterauthtoken} onChange={(e) => setClusterAuthToken(e.target.value)}/>
                    </BootstrapForm.Group>
                    <BootstrapForm.Group controlId="formPrefixNamespace" className="m-3">
                        <BootstrapForm.Label>Namespace Prefix</BootstrapForm.Label>
                        <BootstrapForm.Control type="text" placeholder="Prefix Namespace" value={prefixNamespace}  onChange={(e) => setPrefixNamespace(e.target.value)}/>
                        <BootstrapForm.Text className="text-muted">
                            If you want a specific namespace you can at least specify a prefix, the real namespace name will be retriven after succesfull peering
                        </BootstrapForm.Text>
                    </BootstrapForm.Group>
                </BootstrapForm>
                <Button variant="primary" onClick={handlePeering} className="m-3" disabled={peeringStatus || peeringStarted}>Peer</Button>
                <Button variant="primary" onClick={() => setStep(2)} className="m-3" disabled={!peeringStatus}>Next</Button>
            </>
            )
        case 2:
            console.log("Parameters schema: "+JSON.stringify(parameters))
            return (
                <>
                    <BootstrapForm>
                        <BootstrapForm.Group controlId="formServiceInstanceId" className="m-3">
                            <BootstrapForm.Label>Service Instance ID</BootstrapForm.Label>
                            <BootstrapForm.Control type="text" placeholder="Service Instance ID" value={serviceInstanceId} onChange={(e) => setServiceInstanceId(e.target.value)}/>
                        </BootstrapForm.Group>
                    </BootstrapForm>
                    <hr />
                    <h8>Parameters:</h8>
                    <Form
                        schema={parameters}
                        validator={validator}
                        formData={instanceData}
                        onChange={(e) => setInstanceData(e.formData)}
                        onSubmit={handleServiceInstance}
                        onError={(error) => setError(error.message)}
                        uiSchema={uiSchemaInstance}
                        className="m-3"
                        >
                        
                    </Form>
                    <Button variant="primary" onClick={() => setStep(3)} className="m-3" disabled={!instanceStatus}>Next</Button>
                </>
                    
            )
        case 3:
            return (
                <>
                <BootstrapForm>
                        <BootstrapForm.Group controlId="formServiceInstanceId" className="m-3">
                            <BootstrapForm.Label>Service Binding ID</BootstrapForm.Label>
                            <BootstrapForm.Control type="text" placeholder="Service Instance ID" value={serviceBindingId} onChange={(e) => setServiceBindingId(e.target.value)}/>
                        </BootstrapForm.Group>
                    </BootstrapForm>
                    <hr />
                    <h8>Parameters:</h8>
                <Form
                    schema={parametersBinding}
                    validator={validator}
                    formData={bindingData}
                    onChange={(e) => setBindingData(e.formData)}
                    onSubmit={handleServiceBinding}
                    onError={(error) => setError(error.message)}
                    transformErrors={transformErrors}
                    >                        
                    </Form>
                    <Button variant="primary" onClick={() => setStep(4)} className="m-3" disabled={!bindingStatus}>Next</Button>
                </>
                    
            )
        case 4:
            return (
                <>
                    <Alert variant="success">
                        <Alert.Heading>Service deployed!</Alert.Heading>
                        <p>
                            The service has been deployed into your cluster, you can now use it. You can find it into the namespace: <b>{namespace}</b>
                        </p>
                    </Alert>
                </>
            )
        default:
            return (
                <Container>
                </Container>
            )
    }

}

export default DeployForm;