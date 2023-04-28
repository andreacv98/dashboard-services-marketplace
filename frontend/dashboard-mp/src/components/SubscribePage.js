import { useState, useEffect } from 'react';
import { useParams, Navigate } from 'react-router-dom';
import { useAuth } from 'react-oidc-context';
import SubscribeServiceForm from './SubscribeServiceForm';

function SubscribePage(props) {
    const { idServiceProvider, idService } = useParams();
    const auth = useAuth();
    const [shouldRedirect, setShouldRedirect] = useState(false);
    const isLoading = props.isLoading;
    const setIsLoading = props.setIsLoading;

    useEffect (() => {
        if (auth.activeNavigator === "signoutSilent") {
            setShouldRedirect(true);
        }
    }, [auth.activeNavigator])

    useEffect(() => {
        if (auth.isLoading) {
            setIsLoading(true);
        } else {
            setIsLoading(false);
        }
    }, [auth.isLoading, setIsLoading])

    if (!auth.isLoading && shouldRedirect) {
        return <Navigate to="/" />;
    }

    if (!auth.isLoading) {
        // Check if user authenticated
        if (auth.isAuthenticated) {
            return (
                <>
                    <SubscribeServiceForm idServiceProvider={idServiceProvider} idService={idService} isLoading={isLoading} setIsLoading={setIsLoading}/>
                </>
            )
        } else {
            auth.signinRedirect()
        }
    }
}

export default SubscribePage;