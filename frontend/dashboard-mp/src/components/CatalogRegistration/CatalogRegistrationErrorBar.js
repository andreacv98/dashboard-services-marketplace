import { useEffect } from "react";
import { Alert, Container } from "react-bootstrap";
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

function CatalogRegistrationErrorBar(props) {
    const error = props.error;
    const setError = props.setError;

    useEffect(() => {
        if (error !== "") {
            console.log("error: " + error);
            toast(error
                , {
                    onChange: () => {
                        setError("");
                    },
                    type: toast.TYPE.ERROR,
                    autoClose: 5000,
                    position: "top-center",
                    theme: "colored"
                }
            );
        }
    }, [error]);

    return (
            <ToastContainer />
        )
}

export default CatalogRegistrationErrorBar;