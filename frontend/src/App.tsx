import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { I18nProvider } from './contexts/I18nContext';
import { MainLayout } from './layouts/MainLayout';
import { LoginPage } from './pages/LoginPage';
import { DashboardPage } from './pages/DashboardPage';
import { LiveContactCenterPage } from './pages/LiveContactCenterPage';
import { AgentWorkspacePage } from './pages/AgentWorkspacePage';
import { Customer360Page } from './pages/Customer360Page';
import { AiCoachPage } from './pages/AiCoachPage';
import { KnowledgeBasePage } from './pages/KnowledgeBasePage';
import { KnowledgeSearchPage } from './pages/KnowledgeSearchPage';
import { AgenticAiPage } from './pages/AgenticAiPage';
import { AutonomousResolutionPage } from './pages/AutonomousResolutionPage';
import { OmnichannelPage } from './pages/OmnichannelPage';
import { AnalyticsPage } from './pages/AnalyticsPage';
import { SecurityPiiPage } from './pages/SecurityPiiPage';
import { AiGovernancePage } from './pages/AiGovernancePage';
import { SettingsPage } from './pages/SettingsPage';

const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, isLoading } = useAuth();
  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 to-sky-500 flex items-center justify-center animate-pulse" />
          <p className="text-slate-400 text-sm">Loading platform...</p>
        </div>
      </div>
    );
  }
  if (!user) return <Navigate to="/login" replace />;
  return <>{children}</>;
};

const AppRoutes: React.FC = () => {
  const { user } = useAuth();
  return (
    <Routes>
      <Route
        path="/login"
        element={user ? <Navigate to="/" replace /> : <LoginPage />}
      />
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <MainLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<DashboardPage />} />
        <Route path="live" element={<LiveContactCenterPage />} />
        <Route path="workspace" element={<AgentWorkspacePage />} />
        <Route path="customers" element={<Customer360Page />} />
        <Route path="coach" element={<AiCoachPage />} />
        <Route path="knowledge" element={<KnowledgeBasePage />} />
        <Route path="knowledge-search" element={<KnowledgeSearchPage />} />
        <Route path="agentic-ai" element={<AgenticAiPage />} />
        <Route path="autonomous-resolution" element={<AutonomousResolutionPage />} />
        <Route path="omnichannel" element={<OmnichannelPage />} />
        <Route path="analytics" element={<AnalyticsPage />} />
        <Route path="security" element={<SecurityPiiPage />} />
        <Route path="governance" element={<AiGovernancePage />} />
        <Route path="settings" element={<SettingsPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  );
};

export const App: React.FC = () => {
  return (
    <BrowserRouter>
      <I18nProvider>
        <AuthProvider>
          <AppRoutes />
        </AuthProvider>
      </I18nProvider>
    </BrowserRouter>
  );
};

export default App;
