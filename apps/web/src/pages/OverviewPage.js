import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { Bot, MessageSquare, TrendingUp, ShieldCheck, Sparkles } from 'lucide-react';
export const OverviewPage = () => {
    const { activeOrg, apiCall } = useApp();
    const navigate = useNavigate();
    const [metrics, setMetrics] = useState(null);
    useEffect(() => {
        if (!activeOrg)
            return;
        const loadOverview = async () => {
            try {
                const data = await apiCall(`/api/v1/organizations/${activeOrg.id}/analytics/overview`);
                setMetrics(data.summary);
            }
            catch (err) {
                console.error('Error loading overview:', err);
            }
        };
        loadOverview();
    }, [activeOrg]);
    return (_jsxs("div", { className: "p-8 max-w-7xl mx-auto space-y-8", children: [_jsxs("div", { className: "bg-gradient-to-r from-blue-700 via-indigo-700 to-purple-800 rounded-3xl p-8 text-white shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-6", children: [_jsxs("div", { className: "space-y-2 max-w-xl", children: [_jsxs("div", { className: "inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-xs font-bold text-blue-200 backdrop-blur-sm", children: [_jsx(Sparkles, { className: "w-3.5 h-3.5" }), " Data-First Chatbot Platform"] }), _jsxs("h1", { className: "text-3xl font-black tracking-tight", children: ["Welcome to ", activeOrg?.name || 'hola.ai'] }), _jsx("p", { className: "text-sm text-blue-100 leading-relaxed", children: "Your chatbots answer customer questions strictly using your uploaded JSON records and business documents before considering external AI models." })] }), _jsxs("div", { className: "flex gap-3", children: [_jsx("button", { onClick: () => navigate('/chatbots'), className: "px-5 py-3 bg-white text-blue-700 font-bold text-sm rounded-xl hover:bg-blue-50 shadow-lg transition-all", children: "Manage Chatbots" }), _jsx("button", { onClick: () => navigate('/knowledge'), className: "px-5 py-3 bg-blue-600/80 hover:bg-blue-600 text-white font-bold text-sm rounded-xl backdrop-blur-sm transition-all", children: "Upload Business Data" })] })] }), _jsxs("div", { className: "grid grid-cols-1 md:grid-cols-4 gap-6", children: [_jsxs("div", { className: "bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-2", children: [_jsxs("div", { className: "flex items-center justify-between text-slate-500", children: [_jsx("span", { className: "text-xs font-bold uppercase tracking-wider", children: "Total Chatbots" }), _jsx(Bot, { className: "w-5 h-5 text-blue-600" })] }), _jsx("div", { className: "text-3xl font-black text-slate-900", children: metrics?.totalChatbots || 0 }), _jsx("span", { className: "text-xs text-emerald-600 font-semibold", children: "Active in workspace" })] }), _jsxs("div", { className: "bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-2", children: [_jsxs("div", { className: "flex items-center justify-between text-slate-500", children: [_jsx("span", { className: "text-xs font-bold uppercase tracking-wider", children: "Conversations" }), _jsx(MessageSquare, { className: "w-5 h-5 text-indigo-600" })] }), _jsx("div", { className: "text-3xl font-black text-slate-900", children: metrics?.totalConversations || 0 }), _jsx("span", { className: "text-xs text-slate-500", children: "This billing period" })] }), _jsxs("div", { className: "bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-2", children: [_jsxs("div", { className: "flex items-center justify-between text-slate-500", children: [_jsx("span", { className: "text-xs font-bold uppercase tracking-wider", children: "Answer Accuracy" }), _jsx(TrendingUp, { className: "w-5 h-5 text-emerald-600" })] }), _jsxs("div", { className: "text-3xl font-black text-slate-900", children: [metrics?.resolutionRatePercent || 100, "%"] }), _jsx("span", { className: "text-xs text-emerald-600 font-semibold", children: "Data-matched responses" })] }), _jsxs("div", { className: "bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-2", children: [_jsxs("div", { className: "flex items-center justify-between text-slate-500", children: [_jsx("span", { className: "text-xs font-bold uppercase tracking-wider", children: "Unanswered Queries" }), _jsx(ShieldCheck, { className: "w-5 h-5 text-amber-600" })] }), _jsx("div", { className: "text-3xl font-black text-slate-900", children: metrics?.unansweredCount || 0 }), _jsx("span", { className: "text-xs text-slate-500", children: "Review in inbox" })] })] })] }));
};
