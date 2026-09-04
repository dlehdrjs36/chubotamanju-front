import "./App.css";
import NotFound from "./pages/Notfound";
import Home from "./pages/Home";
import MissionCreate from "./pages/MissionCreate";
import MissionProof from "./pages/MissionProof";
import MissionReportReview from "./pages/MissionReportReview";
import MyRegisteredMissions from "./pages/MyRegisteredMissions";
import Profile from "./pages/Profile";
import Guide from "./pages/Guide";
import PrivacyPolicy from "./pages/PrivacyPolicy";
import TermsOfService from "./pages/TermsOfService";
import { Routes, Route } from "react-router-dom";
import GlobalLayout from "./layout/global-layout";

function App() {
  return (
    <>
      <Routes>
        <Route element={<GlobalLayout />}>
          <Route path="/" element={<Home />} />
          <Route path="/missions/new" element={<MissionCreate />} />
          <Route path="/missions/me" element={<MyRegisteredMissions />} />
          <Route
            path="/missions/:missionId/reports"
            element={<MissionReportReview />}
          />
          <Route path="/missions/:missionId/proof" element={<MissionProof />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/guide" element={<Guide />} />
          <Route path="/privacy-policy" element={<PrivacyPolicy />} />
          <Route path="/terms-of-service" element={<TermsOfService />} />
          <Route path="/a/:id" element={<NotFound />} />
        </Route>
      </Routes>
    </>
  );
}

export default App;
