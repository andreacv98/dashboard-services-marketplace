import { useAuth } from "react-oidc-context";
import { Spinner } from "react-bootstrap";
import { Navigate } from "react-router-dom";

function Profile (props) {

    const auth = useAuth();
    const expirationDate = new Date(auth.user?.expires_at * 1000); // moltiplica per 1000 per convertire il timestamp Unix in millisecondi
    const formattedExpirationDate = expirationDate.toLocaleString();
    
    if (auth.isLoading) {
        return (
            <Spinner animation="border" role="status">
                <span className="visually-hidden">Loading...</span>
            </Spinner>
        )
    } else {
        // Check if user authenticated
        if (auth.isAuthenticated) {
            return (
                <>
                    <h1>Hello user {auth.user?.profile.name} </h1>
                    <p>Your access token will expire at: {formattedExpirationDate}</p>
                    <p>Automatic silent renew: {auth.activeNavigator} </p>
                    <p className="error">Any error: {auth.error?.message} </p>
                </>
            )
        } else {
            return (
                <>
                    <Navigate to="/" />
                </>
            )
        }
    }
}

export default Profile;