import { useEffect, useState } from "react";
import { useAuth } from "react-oidc-context";
import { peerDeployment, checkPeering, instanceService, checkInstance, checkBinding, bindService, getServices } from "../../configs/marketplaceConfig";
import { CheckCircleFill, Cloud, House, Shuffle, XCircleFill } from "react-bootstrap-icons";
import ServiceSummary from "./ServiceSummary";
import DeploymentRequirements from "./DeploymentRequirements";
import PeeringInformation from "./PeeringInformation";
import ServiceInstanceInformation from "./ServiceInstanceInformation";
import ServiceBindingInformation from "./ServiceBindingInformation";
import DeploymentCompletion from "./DeploymentCompletion";

function DeploymentFlow(props) {

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
    const [serviceDescription, setServiceDescription] = useState("");
    const [planName, setPlanName] = useState("");
    const [planDescription, setPlanDescription] = useState("");
    const [bindable, setBindable] = useState(false);
    const [parameters, setParameters] = useState({});
    const [parametersBinding, setParametersBinding] = useState({});
    const [parametersBindingFiltered, setParametersBindingFiltered] = useState({});
    const [peeringPolicies, setPeeringPolicies] = useState([]);

    const [peered, setPeered] = useState(false);
    const [serviceInstanceCreated, setServiceInstanceCreated] = useState(false);
    const [serviceBindingCreated, setServiceBindingCreated] = useState(false);

    const [peerCommandResult, setPeerCommandResult] = useState("");
    const [clusterId, setClusterId] = useState("");
    const [clusterName, setClusterName] = useState("");
    const [clusterAuthUrl, setClusterAuthUrl] = useState("");
    const [clusterAuthToken, setClusterAuthToken] = useState("");
    const [prefixNamespace, setPrefixNamespace] = useState("");
    const [offloadingPolicy, setOffloadingPolicy] = useState("")

    const [peeringCheckPhase, setPeeringCheckPhase] = useState(false);
    const [instanceCheckPhase, setInstanceCheckPhase] = useState(false);
    const [bindingCheckPhase, setBindingCheckPhase] = useState(false);

    const [namespace, setNamespace] = useState("");

    const [serviceInstanceId, setServiceInstanceId] = useState("");
    const [serviceBindingId, setServiceBindingId] = useState("");

    const [instanceData, setInstanceData] = useState({});
    const [bindingData, setBindingData] = useState({});

    const [step, setStep] = useState(0);
    
    
    let sharedFields = {};

    function findSharedFields(serviceBindingSchema, instanceData) {
        let newSchema = JSON.parse(JSON.stringify(serviceBindingSchema));
        for (let fieldName in instanceData) {
            if (Object.prototype.hasOwnProperty.call(newSchema.properties, fieldName)) {
                delete newSchema.properties[fieldName];
                sharedFields[fieldName] = instanceData[fieldName];
            }
        }
        setParametersBindingFiltered(newSchema);
        // Insert each shared field into the bindingData object
        for (let fieldName in sharedFields) {
            bindingData[fieldName] = sharedFields[fieldName];
        }
    }
    
    useEffect(() => {
        console.log("instanceData", instanceData);
        console.log("parametersBinding", parametersBinding)
        findSharedFields(parametersBinding, instanceData);
    }, [instanceData]);
    

    useEffect(() => {
        if (props.idPeering !== undefined) {
            setPeeringStarted(true);
            setPeeringCheckPhase(true);
            setPeered(true);
            setStep(3);
        }
        if (props.idInstance !== undefined) {
            setInstanceStarted(true);
            setInstanceCheckPhase(true);
            setServiceInstanceCreated(true);
            setStep(4);
        }
        if (props.idBinding !== undefined) {
            setBindingStarted(true);
            setBindingCheckPhase(true);
            setServiceBindingCreated(true);
            setStep(5);
        }
    }, [])

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
                setServiceDescription(serviceFound.description)
                setPlanName(planFound.name)
                setPlanDescription(planFound.description)
                setPeeringPolicies(planFound.peering_policies)
                // TODO: check if you want a default hosting policy choice already selected
                //setOffloadingPolicy(planFound.peering_policies[0])
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
        let interval;
      
        const checkPeeringStatus = async () => {
          try {
            const response = await checkPeering(idDeployment, auth.user?.access_token);
            console.log("Instance status: " + response.status);
      
            switch (response.status) {
              case 200:
                const data = await response.json();
                const namespace = data.namespace;
                console.log("Namespace: " + namespace);
                setNamespace(namespace);
                setPeeringCheckPhase(false);
                setPeeringStatus(true);
                clearInterval(interval);
                break;
              case 202:
                console.log("Peering is in progress");
                break;
              default:
                console.log("Peering has failed");
                setError("Error while peering the deployment");
                setPeeringCheckPhase(false);
                setPeeringStarted(false);
                clearInterval(interval);
                break;
            }
          } catch (error) {
            setError(error.message);
            setPeeringCheckPhase(false);
            setPeeringStarted(false);
            clearInterval(interval);
          }

          interval = setTimeout(checkPeeringStatus, 50)
        };
      
        if (peeringCheckPhase) {
          interval = setTimeout(checkPeeringStatus, 50);
        }
      
        return () => {
          clearInterval(interval);
        };
      }, [peeringCheckPhase]);
      

    useEffect(() => {
        let interval;
      
        const checkInstanceStatus = async () => {
          try {
            const response = await checkInstance(idDeployment, auth.user?.access_token);
            console.log("Service instance creation status: " + response.status);
      
            switch (response.status) {
              case 200:
                const data = await response.json();
                const state = data.state;
      
                if (state !== undefined) {
                  switch (state) {
                    case "succeeded":
                      setInstanceCheckPhase(false);
                      setInstanceStatus(true);
                      clearInterval(interval);
                      break;
                    case "failed":
                      setError("Error while creating the service instance");
                      setInstanceCheckPhase(false);
                      setInstanceStatus(false);
                      clearInterval(interval);
                      break;
                    case "in progress":
                      console.log("Service instance creation is in progress");
                      break;
                    default:
                      setError("Unknown state");
                      setInstanceCheckPhase(false);
                      setInstanceStatus(false);
                      clearInterval(interval);
                      break;
                  }
                } else {
                  setInstanceCheckPhase(false);
                  setInstanceStatus(true);
                  clearInterval(interval);
                }
                break;
              default:
                console.log("Service instance creation has failed with code: " + response.status);
                setError("Error while creating service instance for the deployment");
                setInstanceCheckPhase(false);
                setInstanceStatus(true);
                clearInterval(interval);
                break;
            }
          } catch (error) {
            setError(error.message);
            setInstanceCheckPhase(false);
            setInstanceStatus(true);
            clearInterval(interval);
          }

            interval = setTimeout(checkInstanceStatus, 50)
        };
      
        if (instanceCheckPhase) {
          interval = setTimeout(checkInstanceStatus, 50);
        }
      
        return () => {
          clearInterval(interval);
        };
      }, [instanceCheckPhase]);
      

      useEffect(() => {
        let interval;
      
        const checkBindingStatus = async () => {
          try {
            const response = await checkBinding(idDeployment, auth.user?.access_token);
            console.log("Service binding creation status: " + response.status);
      
            switch (response.status) {
              case 200:
                const data = await response.json();
                const state = data.state;
      
                if (state !== undefined) {
                  switch (state) {
                    case "succeeded":
                      setBindingCheckPhase(false);
                      setBindingStatus(true);
                      clearInterval(interval);
                      break;
                    case "failed":
                      setError("Error while creating the service binding");
                      setBindingCheckPhase(false);
                      setBindingStatus(false);
                      clearInterval(interval);
                      break;
                    case "in progress":
                      console.log("Service binding creation is in progress");
                      break;
                    default:
                      setError("Unknown state");
                      setBindingCheckPhase(false);
                      setBindingStatus(false);
                      clearInterval(interval);
                      break;
                  }
                } else {
                  setBindingCheckPhase(false);
                  setBindingStatus(true);
                  clearInterval(interval);
                }
                break;
              default:
                console.log("Service binding creation has failed with code: " + response.status);
                setError("Error while creating service binding for the deployment");
                setBindingCheckPhase(false);
                setBindingStatus(true);
                clearInterval(interval);
                break;
            }
          } catch (error) {
            setError(error.message);
            setBindingCheckPhase(false);
            setBindingStatus(true);
            clearInterval(interval);
          }

            interval = setTimeout(checkBindingStatus, 50)
        };
      
        if (bindingCheckPhase) {
          interval = setTimeout(checkBindingStatus, 50);
        }
      
        return () => {
          clearInterval(interval);
        };
      }, [bindingCheckPhase]);
      

    



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
                <ServiceSummary
                    setStep={setStep}
                    serviceName={serviceName}
                    serviceDescription={serviceDescription}
                    planName={planName}
                    planDescription={planDescription}
                    bindable={bindable}
                />
            )
        case 1:
            return (
                <DeploymentRequirements
                    setStep={setStep}                
                />
            )
        case 2:
            return (
                <PeeringInformation 
                    setStep={setStep}
                    error={error}
                    setError={setError}
                    peered={peered}
                    setPeered={setPeered}
                    peerCommandResult={peerCommandResult}
                    setPeerCommandResult={setPeerCommandResult}
                    idDeployment={idDeployment}
                    idServiceProvider={idServiceProvider}
                    clusterId={clusterId}
                    setClusterId={setClusterId}
                    clusterName={clusterName}
                    setClusterName={setClusterName}
                    clusterAuthUrl={clusterAuthUrl}
                    setClusterAuthUrl={setClusterAuthUrl}
                    clusterAuthToken={clusterAuthToken}
                    setClusterAuthToken={setClusterAuthToken}
                    peeringPolicies={peeringPolicies}
                    offloadingPolicy={offloadingPolicy}
                    setOffloadingPolicy={setOffloadingPolicy}
                    prefixNamespace={prefixNamespace}
                    setPrefixNamespace={setPrefixNamespace}
                    setPeeringStarted={setPeeringStarted}
                    setPeeringCheckPhase={setPeeringCheckPhase}
                    peeringStarted={peeringStarted}
                    peeringStatus={peeringStatus}
                    peeringCheckPhase={peeringCheckPhase}
                />
            )
        case 3:
            return (
                <ServiceInstanceInformation
                    serviceInstanceCreated={serviceInstanceCreated}
                    setServiceInstanceCreated={setServiceInstanceCreated}
                    setStep={setStep}
                    setError={setError}
                    error={error}
                    serviceInstanceId={serviceInstanceId}
                    setServiceInstanceId={setServiceInstanceId}
                    instanceData={instanceData}
                    setInstanceData={setInstanceData}
                    instanceStatus={instanceStatus}
                    setInstanceStatus={setInstanceStatus}
                    instanceCheckPhase={instanceCheckPhase}
                    setInstanceCheckPhase={setInstanceCheckPhase}
                    instanceStarted={instanceStarted}
                    setInstanceStarted={setInstanceStarted}
                    namespace={namespace}
                    idDeployment={idDeployment}
                    parameters={parameters}
                />
            )
        case 4:
            return (
                <ServiceBindingInformation
                    setStep={setStep}
                    setError={setError}
                    error={error}
                    setServiceBindingCreated={setServiceBindingCreated}
                    serviceBindingCreated={serviceBindingCreated}
                    serviceBindingId={serviceBindingId}
                    serviceInstanceId={serviceInstanceId}
                    setServiceBindingId={setServiceBindingId}
                    bindingData={bindingData}
                    setBindingData={setBindingData}
                    bindingStatus={bindingStatus}
                    setBindingStatus={setBindingStatus}
                    bindingCheckPhase={bindingCheckPhase}
                    setBindingCheckPhase={setBindingCheckPhase}
                    bindingStarted={bindingStarted}
                    setBindingStarted={setBindingStarted}
                    namespace={namespace}
                    idDeployment={idDeployment}
                    parametersBinding={parametersBindingFiltered}
                    sharedFields={sharedFields}
                />
            )
        case 5:
            return (
                <DeploymentCompletion
                    setStep={setStep}
                    setError={setError}
                    error={error}
                    namespace={namespace}
                />
            )
        default:
            return (
                <>
                </>
            )
    }

}

export default DeploymentFlow;