import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext";
import { ToastProvider } from "./context/ToastContext";
import ProtectedRoute from "./components/auth/ProtectedRoute";
import RoleGuard from "./components/auth/RoleGuard";

import Navbar from "./components/layout/Navbar";
import Sidebar from "./components/layout/Sidebar";
import Login from "./components/layout/Login";

import Dashboard from "./components/dashboard/Dashboard";
import StartupDashboard from "./components/dashboard/StartupDashboard";
import ChallengeList from "./components/challenges/ChallengeList";
import CreateChallenge from "./components/challenges/CreateChallenge";
import AICopilot from "./components/challenges/AICopilot";
import ChallengeDetail from "./components/challenges/ChallengeDetail";
import DiscoverStartups from "./components/startups/DiscoverStartups";
import StartupProfile from "./components/startups/StartupProfile";
import ApplicationManagement from "./components/applications/ApplicationManagement";
import EvaluationCenter from "./components/evaluation/EvaluationCenter";
import PilotManagement from "./components/pilots/PilotManagement";
import PilotArena from "./components/pilots/PilotArena";
import EvidenceVault from "./components/evidence/EvidenceVault";
import ValidationCenter from "./components/validation/ValidationCenter";
import ScaleReadiness from "./components/scale/ScaleReadiness";
import ProcurementReadiness from "./components/procurement/ProcurementReadiness";
import InnovationPassport from "./components/dashboard/InnovationPassport";
import AnalyticsView from "./components/analytics/AnalyticsView";
import SettingsView from "./components/settings/SettingsView";

function DashboardRouter() {
  const { user } = useAuth();
  if (user?.role === 'Startup') {
    return <StartupDashboard />;
  }
  return <Dashboard />;
}

function MainLayout() {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />
      <div className="flex flex-1 items-start">
        <Sidebar />
        <main className="flex-1 p-6 lg:p-8 w-full max-w-full overflow-hidden">
          <div className="max-w-[88rem] mx-auto w-full">
            <Routes>
              {/* Dynamic Root Dashboard based on role */}
              <Route path="/" element={<DashboardRouter />} />
              <Route path="/government-dashboard" element={
                <RoleGuard allowedRoles={['Government Officer', 'Admin', 'Expert', 'Validator', 'Procurement Officer']}>
                  <Dashboard />
                </RoleGuard>
              } />
              <Route path="/startup-dashboard" element={
                <RoleGuard allowedRoles={['Startup', 'Admin']}>
                  <StartupDashboard />
                </RoleGuard>
              } />

              {/* Challenges */}
              <Route path="/challenges" element={<ChallengeList />} />
              <Route path="/challenges/new" element={
                <RoleGuard allowedRoles={['Government Officer', 'Admin']}>
                  <CreateChallenge />
                </RoleGuard>
              } />
              <Route path="/challenges/new/ai" element={
                <RoleGuard allowedRoles={['Government Officer', 'Admin']}>
                  <AICopilot />
                </RoleGuard>
              } />
              <Route path="/challenges/:id" element={<ChallengeDetail />} />

              {/* Discovery & Ecosystem */}
              <Route path="/discover" element={<DiscoverStartups />} />
              <Route path="/startups" element={<DiscoverStartups />} />
              <Route path="/startups/profiles" element={<StartupProfile />} />

              {/* Applications */}
              <Route path="/applications" element={<ApplicationManagement />} />

              {/* Evaluations */}
              <Route path="/evaluation" element={
                <RoleGuard allowedRoles={['Expert', 'Government Officer', 'Admin']}>
                  <EvaluationCenter />
                </RoleGuard>
              } />
              <Route path="/evaluations" element={
                <RoleGuard allowedRoles={['Expert', 'Government Officer', 'Admin']}>
                  <EvaluationCenter />
                </RoleGuard>
              } />

              {/* Pilots & Telemetry Arena */}
              <Route path="/pilots" element={<PilotManagement />} />
              <Route path="/pilots/arena" element={<PilotArena />} />

              {/* Evidence Vault */}
              <Route path="/evidence" element={<EvidenceVault />} />
              <Route path="/pilots/evidence" element={<EvidenceVault />} />

              {/* Independent Validation */}
              <Route path="/validation" element={<ValidationCenter />} />

              {/* Innovation Proof Passports */}
              <Route path="/passport" element={<InnovationPassport />} />
              <Route path="/passports" element={<InnovationPassport />} />
              <Route path="/passports/:id" element={<InnovationPassport />} />

              {/* Scale & Procurement */}
              <Route path="/scale" element={
                <RoleGuard allowedRoles={['Government Officer', 'Procurement Officer', 'Admin']}>
                  <ScaleReadiness />
                </RoleGuard>
              } />
              <Route path="/scale-readiness" element={
                <RoleGuard allowedRoles={['Government Officer', 'Procurement Officer', 'Admin']}>
                  <ScaleReadiness />
                </RoleGuard>
              } />
              <Route path="/procurement" element={
                <RoleGuard allowedRoles={['Procurement Officer', 'Government Officer', 'Admin']}>
                  <ProcurementReadiness />
                </RoleGuard>
              } />
              <Route path="/procurement-readiness" element={
                <RoleGuard allowedRoles={['Procurement Officer', 'Government Officer', 'Admin']}>
                  <ProcurementReadiness />
                </RoleGuard>
              } />

              {/* Platform Analytics & Settings */}
              <Route path="/analytics" element={<AnalyticsView />} />
              <Route path="/settings" element={<SettingsView />} />

              {/* Fallback */}
              <Route path="*" element={<DashboardRouter />} />
            </Routes>
          </div>
        </main>
      </div>
    </div>
  );
}

function App() {
  return (
    <AuthProvider>
      <ToastProvider>
        <Router>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/*" element={
              <ProtectedRoute>
                <MainLayout />
              </ProtectedRoute>
            } />
          </Routes>
        </Router>
      </ToastProvider>
    </AuthProvider>
  );
}

export default App;
