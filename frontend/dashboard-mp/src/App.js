import TopBar from "./components/TopBar";
import { BrowserRouter, Routes, Route, } from "react-router-dom";
import Home from "./components/HomePage";
import Profile from "./components/ProfilePage";
import ErrorBar from "./components/ErrorBar";
import ServiceProviderRegistration from "./components/ServiceProviderRegistration";
import LoadingOverlay from 'react-loading-overlay-ts';
import {  useState } from "react";
import CatalogPage from "./components/CatalogPage";

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
          </Routes>
        </BrowserRouter>
        <ErrorBar />
      </LoadingOverlay>
    </>
  );
}

export default App;
