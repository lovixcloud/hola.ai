import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
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
const MainLayout = ({ children }) => {
    return (_jsxs("div", { className: "flex min-h-screen bg-slate-50", children: [_jsx(Sidebar, {}), _jsxs("div", { className: "flex-1 flex flex-col min-w-0", children: [_jsx(Header, {}), _jsx("main", { className: "flex-1 overflow-y-auto", children: children })] })] }));
};
const ProtectedRoutes = () => {
    const { token } = useApp();
    if (!token) {
        return _jsx(LoginPage, {});
    }
    return (_jsx(MainLayout, { children: _jsxs(Routes, { children: [_jsx(Route, { path: "/", element: _jsx(OverviewPage, {}) }), _jsx(Route, { path: "/chatbots", element: _jsx(ChatbotsListPage, {}) }), _jsx(Route, { path: "/chatbots/:chatbotId/builder", element: _jsx(VisualBuilderPage, {}) }), _jsx(Route, { path: "/knowledge", element: _jsx(KnowledgeBasePage, {}) }), _jsx(Route, { path: "/inbox", element: _jsx(InboxPage, {}) }), _jsx(Route, { path: "/marketplace", element: _jsx(MarketplacePage, {}) }), _jsx(Route, { path: "/analytics", element: _jsx(AnalyticsPage, {}) }), _jsx(Route, { path: "/billing", element: _jsx(BillingPage, {}) }), _jsx(Route, { path: "/developer", element: _jsx(DeveloperPage, {}) }), _jsx(Route, { path: "/admin", element: _jsx(AdminPage, {}) }), _jsx(Route, { path: "*", element: _jsx(Navigate, { to: "/", replace: true }) })] }) }));
};
export default function App() {
    return (_jsx(AppProvider, { children: _jsx(BrowserRouter, { children: _jsx(ProtectedRoutes, {}) }) }));
}
