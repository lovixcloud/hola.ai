import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { ShieldCheck, FileText } from 'lucide-react';
export const AdminPage = () => {
    const { apiCall } = useApp();
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    useEffect(() => {
        const loadAdmin = async () => {
            try {
                setLoading(true);
                const res = await apiCall('/api/v1/admin/overview');
                setData(res);
            }
            catch (err) {
                console.error('Error loading admin overview:', err);
            }
            finally {
                setLoading(false);
            }
        };
        loadAdmin();
    }, []);
    if (loading || !data) {
        return _jsx("div", { className: "p-8 text-center text-slate-400", children: "Loading platform admin data..." });
    }
    const { platformMetrics, recentAuditLogs } = data;
    return (_jsxs("div", { className: "p-8 max-w-7xl mx-auto space-y-8", children: [_jsxs("div", { children: [_jsxs("h1", { className: "text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2", children: [_jsx(ShieldCheck, { className: "w-7 h-7 text-indigo-600" }), _jsx("span", { children: "Platform Administration Console" })] }), _jsx("p", { className: "text-sm text-slate-500", children: "Global platform health, multi-tenant auditing, and security compliance overview." })] }), _jsxs("div", { className: "grid grid-cols-1 md:grid-cols-3 gap-6", children: [_jsxs("div", { className: "bg-white p-6 rounded-2xl border border-slate-200 shadow-sm", children: [_jsx("span", { className: "text-xs font-bold text-slate-400 uppercase", children: "System Status" }), _jsxs("div", { className: "text-2xl font-black text-emerald-600 flex items-center gap-2 mt-1", children: [_jsx("span", { className: "w-3 h-3 rounded-full bg-emerald-500 animate-pulse" }), _jsx("span", { children: "Healthy" })] })] }), _jsxs("div", { className: "bg-white p-6 rounded-2xl border border-slate-200 shadow-sm", children: [_jsx("span", { className: "text-xs font-bold text-slate-400 uppercase", children: "Total Organizations" }), _jsx("div", { className: "text-3xl font-black text-slate-900 mt-1", children: platformMetrics.totalOrganizations })] }), _jsxs("div", { className: "bg-white p-6 rounded-2xl border border-slate-200 shadow-sm", children: [_jsx("span", { className: "text-xs font-bold text-slate-400 uppercase", children: "Marketplace Templates" }), _jsx("div", { className: "text-3xl font-black text-slate-900 mt-1", children: platformMetrics.totalMarketplaceListings })] })] }), _jsxs("div", { className: "bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4", children: [_jsxs("h3", { className: "font-bold text-slate-800 text-base flex items-center gap-2", children: [_jsx(FileText, { className: "w-4 h-4 text-indigo-600" }), _jsx("span", { children: "Platform Security Audit Logs" })] }), _jsx("div", { className: "space-y-2", children: recentAuditLogs?.map((log) => (_jsxs("div", { className: "p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between text-xs", children: [_jsxs("div", { className: "space-y-0.5", children: [_jsx("span", { className: "font-bold text-slate-800", children: log.action }), _jsxs("span", { className: "text-slate-500 block", children: ["Resource: ", log.resourceType] })] }), _jsx("span", { className: "text-[10px] text-slate-400", children: new Date(log.createdAt).toLocaleString() })] }, log.id))) })] })] }));
};
