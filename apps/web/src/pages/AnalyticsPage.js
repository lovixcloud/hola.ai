import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { BarChart3, TrendingUp, Clock, DollarSign, MessageSquare } from 'lucide-react';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';
export const AnalyticsPage = () => {
    const { activeOrg, apiCall } = useApp();
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    useEffect(() => {
        if (!activeOrg)
            return;
        const loadAnalytics = async () => {
            try {
                setLoading(true);
                const res = await apiCall(`/api/v1/organizations/${activeOrg.id}/analytics/overview`);
                setData(res);
            }
            catch (err) {
                console.error('Error loading analytics:', err);
            }
            finally {
                setLoading(false);
            }
        };
        loadAnalytics();
    }, [activeOrg]);
    if (loading || !data) {
        return _jsx("div", { className: "p-8 text-center text-slate-400", children: "Loading analytics data..." });
    }
    const { summary, chartData } = data;
    return (_jsxs("div", { className: "p-8 max-w-7xl mx-auto space-y-8", children: [_jsxs("div", { children: [_jsxs("h1", { className: "text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2", children: [_jsx(BarChart3, { className: "w-7 h-7 text-blue-600" }), _jsx("span", { children: "Analytics & Performance Metrics" })] }), _jsx("p", { className: "text-sm text-slate-500", children: "Monitor conversation volume, answer accuracy, response latency, and model usage estimates." })] }), _jsxs("div", { className: "grid grid-cols-1 md:grid-cols-4 gap-6", children: [_jsxs("div", { className: "bg-white rounded-2xl border border-slate-200 p-6 shadow-sm", children: [_jsxs("div", { className: "flex justify-between text-slate-500 text-xs font-bold uppercase mb-2", children: [_jsx("span", { children: "Conversations" }), _jsx(MessageSquare, { className: "w-4 h-4 text-blue-600" })] }), _jsx("div", { className: "text-3xl font-black text-slate-900", children: summary.totalConversations })] }), _jsxs("div", { className: "bg-white rounded-2xl border border-slate-200 p-6 shadow-sm", children: [_jsxs("div", { className: "flex justify-between text-slate-500 text-xs font-bold uppercase mb-2", children: [_jsx("span", { children: "Data Resolution" }), _jsx(TrendingUp, { className: "w-4 h-4 text-emerald-600" })] }), _jsxs("div", { className: "text-3xl font-black text-slate-900", children: [summary.resolutionRatePercent, "%"] })] }), _jsxs("div", { className: "bg-white rounded-2xl border border-slate-200 p-6 shadow-sm", children: [_jsxs("div", { className: "flex justify-between text-slate-500 text-xs font-bold uppercase mb-2", children: [_jsx("span", { children: "Avg Latency" }), _jsx(Clock, { className: "w-4 h-4 text-indigo-600" })] }), _jsxs("div", { className: "text-3xl font-black text-slate-900", children: [summary.avgResponseLatencyMs, " ms"] })] }), _jsxs("div", { className: "bg-white rounded-2xl border border-slate-200 p-6 shadow-sm", children: [_jsxs("div", { className: "flex justify-between text-slate-500 text-xs font-bold uppercase mb-2", children: [_jsx("span", { children: "Estimated AI Cost" }), _jsx(DollarSign, { className: "w-4 h-4 text-purple-600" })] }), _jsxs("div", { className: "text-3xl font-black text-slate-900", children: ["$", summary.estimatedModelCostUsd] })] })] }), _jsxs("div", { className: "bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4", children: [_jsx("h3", { className: "font-bold text-slate-800 text-base", children: "Conversation & Message Trends" }), _jsx("div", { className: "h-72 w-full", children: _jsx(ResponsiveContainer, { width: "100%", height: "100%", children: _jsxs(AreaChart, { data: chartData, children: [_jsx(CartesianGrid, { strokeDasharray: "3 3", stroke: "#f1f5f9" }), _jsx(XAxis, { dataKey: "date", stroke: "#94a3b8", fontSize: 12 }), _jsx(YAxis, { stroke: "#94a3b8", fontSize: 12 }), _jsx(Tooltip, {}), _jsx(Area, { type: "monotone", dataKey: "messages", stroke: "#2563eb", fill: "#3b82f6", fillOpacity: 0.2 }), _jsx(Area, { type: "monotone", dataKey: "conversations", stroke: "#4f46e5", fill: "#6366f1", fillOpacity: 0.2 })] }) }) })] })] }));
};
