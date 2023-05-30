import TopBar from "./components/TopBar";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Home from "./components/HomePage";
import Profile from "./components/ProfilePage";
import ErrorBar from "./components/ErrorBar";
import CatalogRegistrationPage from "./components/CatalogRegistration/CatalogRegistrationPage";
import LoadingOverlay from 'react-loading-overlay-ts';
import { useState } from "react";
import CatalogPage from "./components/CatalogExploration/CatalogPage";
import PurchasedServicesPage from "./components/MyPurchasedServices/PurchasedServicesPage";
import DeploymentPage from "./components/ServiceDeployment/DeploymentPage";
import DeploymentsPage from "./components/MyDeployments/DeploymentsPage";
import NotFoundPage from "./components/Utils/NotFoundPage";
import ServiceExplorationPage from "./components/CatalogExploration/ServiceExploration/ServiceExplorationPage";
import MyCatalogPage from "./components/MyCatalogs/MyCatalogsPage";

function App() {

  // Loading state
  const [isLoading, setIsLoading] = useState(false);
  const [loadingText, setLoadingText] = useState("Loading");

  return (
    <>
      <LoadingOverlay
      active={isLoading}
      spinner
      text={loadingText}
      // React bootstrap class to occupy all the screen
      className="vh-100"
      >              
        <TopBar />
        <BrowserRouter>
          <Routes>
            <Route index element={<Home isLoading={isLoading} setIsLoading={setIsLoading} />} />
            <Route path="/profile" element= {<Profile isLoading={isLoading} setIsLoading={setIsLoading}/>} />
            <Route path="/profile/catalogs" element={<MyCatalogPage isLoading={isLoading} setIsLoading={setIsLoading}/>} />
            <Route path="/catalogs/register" element={<CatalogRegistrationPage isLoading={isLoading} setIsLoading={setIsLoading}/>} />
            <Route path="/catalogs" element={<CatalogPage isLoading={isLoading} setIsLoading={setIsLoading} />} />
            <Route path="/catalogs/:idServiceProvider/:idService" element={<ServiceExplorationPage isLoading={isLoading} setIsLoading={setIsLoading}/>} />
            <Route path="/purchases" element={<PurchasedServicesPage isLoading={isLoading} setIsLoading={setIsLoading}/>} />
            <Route path="/deployments/:idDeployment" element={<DeploymentPage isLoading={isLoading} setIsLoading={setIsLoading} />} />
            <Route path="/deployments/" element={<DeploymentsPage isLoading={isLoading} setIsLoading={setIsLoading} />} />
            <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </BrowserRouter>
        <ErrorBar />
      </LoadingOverlay>
    </>
  );
}

export default App;
