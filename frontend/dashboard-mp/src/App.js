import TopBar from "./components/TopBar";
import { BrowserRouter, Routes, Route, useParams, } from "react-router-dom";
import Home from "./components/HomePage";
import Profile from "./components/ProfilePage";
import ErrorBar from "./components/ErrorBar";
import SubscribePage from "./components/SubscribePage";
import ServiceProviderRegistration from "./components/ServiceProviderRegistration";
import LoadingOverlay from 'react-loading-overlay-ts';
import { useState } from "react";
import CatalogPage from "./components/CatalogPage";
import SubscribedServicesPage from "./components/SubscribedServicesPage";
import DeployPage from "./components/DeployPage";

function App() {

  // Loading state
  const [isLoading, setIsLoading] = useState(false);

  return (
    <>
      <LoadingOverlay
      active={isLoading}
      spinner
      text='Loading'
      // React bootstrap class to occupy all the screen
      className="vh-100"
      >              
        <TopBar />
        <BrowserRouter>
          <Routes>
            <Route index element={<Home isLoading={isLoading} setIsLoading={setIsLoading} />} />
            <Route path="profile" element= {<Profile isLoading={isLoading} setIsLoading={setIsLoading}/>} />
            <Route path="/service-providers/register" element={<ServiceProviderRegistration isLoading={isLoading} setIsLoading={setIsLoading}/>} />
            <Route path="/catalog" element={<CatalogPage isLoading={isLoading} setIsLoading={setIsLoading} />} />
            <Route path="/buyservice/:idServiceProvider/:idService" element={<SubscribePage isLoading={isLoading} setIsLoading={setIsLoading}/>} />
            <Route path="/subscriptions" element={<SubscribedServicesPage isLoading={isLoading} setIsLoading={setIsLoading}/>} />
            <Route path="/deployments/:idDeployment" element={<DeployPage isLoading={isLoading} setIsLoading={setIsLoading} />} />
          </Routes>
        </BrowserRouter>
        <ErrorBar />
      </LoadingOverlay>
    </>
  );
}

export default App;
