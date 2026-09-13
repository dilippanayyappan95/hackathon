import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Navbar from "./components/layout/Navbar";
import Sidebar from "./components/layout/Sidebar";
import Login from "./components/layout/Login";
import Dashboard from "./components/dashboard/Dashboard";
import ChallengeList from "./components/challenges/ChallengeList";
import CreateChallenge from "./components/challenges/CreateChallenge";
import AICopilot from "./components/challenges/AICopilot";
import ChallengeDetail from "./components/challenges/ChallengeDetail";
import DiscoverStartups from "./components/startups/DiscoverStartups";
import StartupProfile from "./components/startups/StartupProfile";
import EvaluationCenter from "./components/evaluation/EvaluationCenter";
import PilotManagement from "./components/pilots/PilotManagement";
import PilotArena from "./components/pilots/PilotArena";
import EvidenceVault from "./components/evidence/EvidenceVault";
import ValidationCenter from "./components/validation/ValidationCenter";
import ScaleReadiness from "./components/scale/ScaleReadiness";
import ProcurementReadiness from "./components/procurement/ProcurementReadiness";
import InnovationPassport from "./components/dashboard/InnovationPassport";

// Placeholder module component avoiding dead links
const PlaceholderPage = ({ title }: { title: string }) => (
  <div className="flex flex-col items-center justify-center min-h-[60vh] text-center animate-in fade-in zoom-in-95 duration-300">
    <div className="w-16 h-16 bg-surface-container rounded-full flex items-center justify-center mb-4">
      <span className="text-2xl">🚧</span>
    </div>
    <h1 className="text-2xl font-display font-bold text-on-surface mb-2">{title}</h1>
    <p className="text-on-surface-variant">This module is under strict UI construction. Check back soon.</p>
  </div>
);

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="*" element={
          <div className="min-h-screen flex flex-col bg-background">
            <Navbar />
            <div className="flex flex-1 items-start">
              <Sidebar />
              <main className="flex-1 p-6 lg:p-8 w-full max-w-full overflow-hidden">
                <div className="max-w-[88rem] mx-auto w-full">
                  <Routes>
                    <Route path="/" element={<Dashboard />} />
                    <Route path="/challenges" element={<ChallengeList />} />
                    <Route path="/challenges/new" element={<CreateChallenge />} />
                    <Route path="/challenges/new/ai" element={<AICopilot />} />
                    <Route path="/challenges/:id" element={<ChallengeDetail />} />
                    <Route path="/discover" element={<DiscoverStartups />} />
                    <Route path="/startups/profiles" element={<StartupProfile />} />
                    <Route path="/pilots" element={<PilotManagement />} />
                    <Route path="/pilots/arena" element={<PilotArena />} />
                    <Route path="/pilots/evidence" element={<EvidenceVault />} />
                    <Route path="/evaluation" element={<EvaluationCenter />} />
                    <Route path="/validation" element={<ValidationCenter />} />
                    <Route path="/passport" element={<InnovationPassport />} />
                    <Route path="/scale" element={<ScaleReadiness />} />
                    <Route path="/procurement" element={<ProcurementReadiness />} />
                    <Route path="/analytics" element={<PlaceholderPage title="Platform Status & Analytics" />} />
                    <Route path="*" element={<PlaceholderPage title="404 Protocol Mismatch" />} />
                  </Routes>
                </div>
              </main>
            </div>
          </div>
        } />
      </Routes>
    </Router>
  );
}

export default App;
