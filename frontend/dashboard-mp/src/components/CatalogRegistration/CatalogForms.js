import { useEffect, useState } from "react";
import CatalogDisclaimer from "./CatalogDisclaimer";
import CatalogInformationsForm from "./CatalogInformationsForm";
import CatalogAuthenticationBinding from "./CatalogAuthenticationBinding";
import CatalogRecap from "./CatalogRecap";
import CatalogRegistrationErrorBar from "./CatalogRegistrationErrorBar";

function CatalogForms(props) {
    const setIsLoading = props.setIsLoading;
    const [name, setName] = useState("");
    const [description, setDescription] = useState("");
    const [url, setUrl] = useState("");
    const [error, setError] = useState("");
    const [credentials, setCredentials] = useState({
        id: "",
        authority_url: "",
        realm: "",
        client_id: "",
        client_secret: ""
    });
    const [step, setStep] = useState(0);
    const [registered, setRegistered] = useState(false);

    useEffect(() => {
        console.log("Is loading: " + props.isLoading)
    }, [props.isLoading])

    switch (step) {
        case 0:
            return (
                <CatalogDisclaimer setStep={setStep}/>
            )
        case 1:
            return (
                <>
                    <CatalogRegistrationErrorBar error={error} setError={setError} />
                    
                    <CatalogInformationsForm
                    setStep={setStep}
                    setError={setError}
                    setIsLoading={setIsLoading}
                    name={name}
                    setName={setName}
                    description={description}
                    setDescription={setDescription}
                    url={url}
                    setUrl={setUrl}
                    setCredentials={setCredentials}
                    registered={registered}
                    setRegistered={setRegistered}
                    />
                </>
                
            )
        case 2:
            return (
                <>
                    <CatalogRegistrationErrorBar error={error} setError={setError} />

                    <CatalogAuthenticationBinding
                    setStep={setStep}
                    setError={setError}
                    credentials={credentials}
                    url={url}
                    />
                </>
                
            )
        case 3:
            return (
                <>
                    <CatalogRegistrationErrorBar error={error} setError={setError} />
                    
                    <CatalogRecap
                        setStep={setStep}
                        setError={setError}
                        name={name}
                        description={description}
                        url={url}
                        id={credentials.id}
                    /> 
                </>
                
            )
        default:
            return (
                <>
                </>
            )
    }
    
}

export default CatalogForms;