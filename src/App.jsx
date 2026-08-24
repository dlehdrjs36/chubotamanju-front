import "./App.css";
import OAuth2Redirect from "./pages/OAuth2Redirect";
import NotFound from "./pages/Notfound";
import Home from "./pages/Home";
import RequestCreate from "./pages/RequestCreate";
import Profile from "./pages/Profile";
import Guide from "./pages/Guide";
import { Routes, Route } from "react-router-dom";
import GlobalLayout from "./layout/global-layout";

function App() {
  return (
    <>
      <Routes>
        <Route element={<GlobalLayout />}>
          <Route path="/" element={<Home />} />
          <Route path="/requests/new" element={<RequestCreate />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/guide" element={<Guide />} />
          <Route path="/oauth2/redirect" element={<OAuth2Redirect />} />
          <Route path="/a/:id" element={<NotFound />} />
        </Route>
      </Routes>
    </>
  );
}

export default App;
