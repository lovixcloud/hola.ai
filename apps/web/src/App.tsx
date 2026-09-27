import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AppProvider, useApp } from './context/AppContext';
import { Sidebar } from './components/Sidebar';
import { Header } from './components/Header';

import { OverviewPage } from './pages/OverviewPage';
import { ChatbotsListPage } from './pages/ChatbotsListPage';
import { VisualBuilderPage } from './pages/VisualBuilderPage';
import { KnowledgeBasePage } from './pages/KnowledgeBasePage';
import { InboxPage } from './pages/InboxPage';
import { MarketplacePage } from './pages/MarketplacePage';
import { AnalyticsPage } from './pages/AnalyticsPage';
import { BillingPage } from './pages/BillingPage';
import { DeveloperPage } from './pages/DeveloperPage';
import { AdminPage } from './pages/AdminPage';
import { LoginPage } from './pages/LoginPage';

const MainLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <div className="flex min-h-screen bg-slate-50">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <Header />
        <main className="flex-1 overflow-y-auto">{children}</main>
      </div>
    </div>
  );
};

const ProtectedRoutes: React.FC = () => {
  const { token } = useApp();

  if (!token) {
    return <LoginPage />;
  }

  return (
    <MainLayout>
      <Routes>
        <Route path="/" element={<OverviewPage />} />
        <Route path="/chatbots" element={<ChatbotsListPage />} />
        <Route path="/chatbots/:chatbotId/builder" element={<VisualBuilderPage />} />
        <Route path="/knowledge" element={<KnowledgeBasePage />} />
        <Route path="/inbox" element={<InboxPage />} />
        <Route path="/marketplace" element={<MarketplacePage />} />
        <Route path="/analytics" element={<AnalyticsPage />} />
        <Route path="/billing" element={<BillingPage />} />
        <Route path="/developer" element={<DeveloperPage />} />
        <Route path="/admin" element={<AdminPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </MainLayout>
  );
};

export default function App() {
  return (
    <AppProvider>
      <BrowserRouter>
        <ProtectedRoutes />
      </BrowserRouter>
    </AppProvider>
  );
}
