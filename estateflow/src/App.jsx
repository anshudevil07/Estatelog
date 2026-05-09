import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { ThemeProvider } from "./context/ThemeContext";
import { AuthProvider } from "./context/AuthContext";
import { ToastProvider } from "./context/ToastContext";
import { NotificationProvider } from "./context/NotificationContext";
import { LanguageProvider } from "./context/LanguageContext";
import ProtectedRoute, { RoleRoute } from "./routes/ProtectedRoute";

// Layouts
import AdminLayout from "./layouts/AdminLayout";
import ManagerLayout from "./layouts/ManagerLayout";
import AgentLayout from "./layouts/AgentLayout";

// Auth pages
import LoginPage from "./pages/LoginPage";
import ForgotPasswordPage from "./pages/ForgotPasswordPage";
import NotFoundPage from "./pages/NotFoundPage";

// Admin pages
import AdminDashboard from "./pages/admin/AdminDashboard";
import AddTeamMember from "./pages/admin/AddTeamMember";
import PropertiesPage from "./pages/PropertiesPage";
import LeadsPage from "./pages/LeadsPage";
import AgentsPage from "./pages/AgentsPage";
import AnalyticsPage from "./pages/AnalyticsPage";
import SettingsPage from "./pages/SettingsPage";
import PipelinePage from "./pages/PipelinePage";
import RemindersPage from "./pages/RemindersPage";
import ClientsPage from "./pages/ClientsPage";
import VisitsPage from "./pages/VisitsPage";
import AgentReportPage from "./pages/AgentReportPage";
import PropertyReportPage from "./pages/PropertyReportPage";
import CommissionPage from "./pages/CommissionPage";
import ActivityLogPage from "./pages/ActivityLogPage";
import ExportImportPage from "./pages/ExportImportPage";

// Manager pages (reuse same components — role controls what they see)
import ManagerDashboard from "./pages/manager/ManagerDashboard";

// Agent pages
import AgentDashboard from "./pages/agent/AgentDashboard";

export default function App() {
  return (
    <BrowserRouter>
      <ThemeProvider>
        <LanguageProvider>
        <AuthProvider>
          <ToastProvider>
            <NotificationProvider>
            <Routes>
              {/* ── Public routes ── */}
              <Route path="/login" element={<LoginPage />} />
              <Route path="/forgot-password" element={<ForgotPasswordPage />} />
              {/* /signup redirects to login — admin creates accounts internally */}
              <Route path="/signup" element={<Navigate to="/login" replace />} />

              {/* ── Root redirect ── */}
              <Route path="/" element={<Navigate to="/login" replace />} />

              {/* ════════════════════════════════════════
                  ADMIN ROUTES — full access
              ════════════════════════════════════════ */}
              <Route
                path="/admin"
                element={
                  <RoleRoute allowedRoles={["admin"]}>
                    <AdminLayout />
                  </RoleRoute>
                }
              >
                <Route index element={<Navigate to="/admin/dashboard" replace />} />
                <Route path="dashboard" element={<AdminDashboard />} />
                <Route path="properties" element={<PropertiesPage />} />
                <Route path="leads" element={<LeadsPage />} />
                <Route path="agents" element={<AgentsPage />} />
                <Route path="agents/add" element={<AddTeamMember />} />
                <Route path="analytics" element={<AnalyticsPage />} />
                <Route path="pipeline" element={<PipelinePage />} />
                <Route path="reminders" element={<RemindersPage />} />
                <Route path="clients" element={<ClientsPage />} />
                <Route path="visits" element={<VisitsPage />} />
                <Route path="agent-report" element={<AgentReportPage />} />
                <Route path="property-report" element={<PropertyReportPage />} />
                <Route path="commissions" element={<CommissionPage />} />
                <Route path="activity-log" element={<ActivityLogPage />} />
                <Route path="export-import" element={<ExportImportPage />} />
                <Route path="settings" element={<SettingsPage />} />
              </Route>

              {/* ════════════════════════════════════════
                  MANAGER ROUTES — manage leads & properties
              ════════════════════════════════════════ */}
              <Route
                path="/manager"
                element={
                  <RoleRoute allowedRoles={["manager"]}>
                    <ManagerLayout />
                  </RoleRoute>
                }
              >
                <Route index element={<Navigate to="/manager/dashboard" replace />} />
                <Route path="dashboard" element={<ManagerDashboard />} />
                <Route path="properties" element={<PropertiesPage />} />
                <Route path="leads" element={<LeadsPage />} />
                <Route path="agents" element={<AgentsPage />} />
                <Route path="analytics" element={<AnalyticsPage />} />
                <Route path="pipeline" element={<PipelinePage />} />
                <Route path="reminders" element={<RemindersPage />} />
                <Route path="clients" element={<ClientsPage />} />
                <Route path="visits" element={<VisitsPage />} />
                <Route path="agent-report" element={<AgentReportPage />} />
                <Route path="property-report" element={<PropertyReportPage />} />
                <Route path="commissions" element={<CommissionPage />} />
                <Route path="activity-log" element={<ActivityLogPage />} />
                <Route path="export-import" element={<ExportImportPage />} />
                <Route path="settings" element={<SettingsPage />} />
              </Route>

              {/* ════════════════════════════════════════
                  AGENT ROUTES — own leads only
              ════════════════════════════════════════ */}
              <Route
                path="/agent"
                element={
                  <RoleRoute allowedRoles={["agent"]}>
                    <AgentLayout />
                  </RoleRoute>
                }
              >
                <Route index element={<Navigate to="/agent/dashboard" replace />} />
                <Route path="dashboard" element={<AgentDashboard />} />
                <Route path="leads" element={<LeadsPage />} />
                <Route path="properties" element={<PropertiesPage />} />
                <Route path="pipeline" element={<PipelinePage />} />
                <Route path="reminders" element={<RemindersPage />} />
                <Route path="clients" element={<ClientsPage />} />
                <Route path="visits" element={<VisitsPage />} />
                <Route path="export-import" element={<ExportImportPage />} />
                <Route path="settings" element={<SettingsPage />} />
              </Route>

              {/* ── 404 ── */}
              <Route path="*" element={<NotFoundPage />} />
            </Routes>
            </NotificationProvider>
          </ToastProvider>
        </AuthProvider>
        </LanguageProvider>
      </ThemeProvider>
    </BrowserRouter>
  );
}
