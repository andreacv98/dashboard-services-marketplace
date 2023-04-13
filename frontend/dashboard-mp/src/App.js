import TopBar from "./components/TopBar";
import { BrowserRouter, Routes, Route, } from "react-router-dom";
import Home from "./components/HomePage";
import Profile from "./components/ProfilePage";
import ErrorBar from "./components/ErrorBar";

function App() {
  return (
    <>
      <TopBar />
      <BrowserRouter>
        <Routes>
          <Route index element={<Home />} />
          <Route path="profile" element= {<Profile />} />
        </Routes>
      </BrowserRouter>
      <ErrorBar />
    </>
  );
}

export default App;
