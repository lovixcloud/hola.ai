import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { Bot, Plus, Sliders, ShieldCheck, ChevronRight } from 'lucide-react';
export const ChatbotsListPage = () => {
    const { activeOrg, apiCall } = useApp();
    const navigate = useNavigate();
    const [chatbots, setChatbots] = useState([]);
    const [loading, setLoading] = useState(true);
    const [wizardOpen, setWizardOpen] = useState(false);
    const [newBotName, setNewBotName] = useState('');
    const [newBotPurpose, setNewBotPurpose] = useState('customer_support');
    const [newBotResponseMode, setNewBotResponseMode] = useState('business_data_first');
    const [creating, setCreating] = useState(false);
    const loadChatbots = async () => {
        if (!activeOrg)
            return;
        try {
            setLoading(true);
            const data = await apiCall(`/api/v1/organizations/${activeOrg.id}/chatbots`);
            setChatbots(data.chatbots || []);
        }
        catch (err) {
            console.error('Error loading chatbots:', err);
        }
        finally {
            setLoading(false);
        }
    };
    useEffect(() => {
        loadChatbots();
    }, [activeOrg]);
    const handleCreateChatbot = async (e) => {
        e.preventDefault();
        if (!activeOrg || !newBotName)
            return;
        try {
            setCreating(true);
            const data = await apiCall(`/api/v1/organizations/${activeOrg.id}/chatbots`, {
                method: 'POST',
                body: JSON.stringify({
                    name: newBotName,
                    purpose: newBotPurpose,
                    responseMode: newBotResponseMode,
                }),
            });
            setWizardOpen(false);
            navigate(`/chatbots/${data.chatbot.id}/builder`);
        }
        catch (err) {
            alert(err.message || 'Creation failed');
        }
        finally {
            setCreating(false);
        }
    };
    return (_jsxs("div", { className: "p-8 max-w-7xl mx-auto space-y-8", children: [_jsxs("div", { className: "flex flex-col sm:flex-row sm:items-center justify-between gap-4", children: [_jsxs("div", { children: [_jsxs("h1", { className: "text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2", children: [_jsx(Bot, { className: "w-7 h-7 text-blue-600" }), _jsxs("span", { children: ["My Chatbots (", chatbots.length, ")"] })] }), _jsx("p", { className: "text-sm text-slate-500", children: "Manage your custom branded chatbots, response rules, and deployment embeds." })] }), _jsxs("button", { onClick: () => setWizardOpen(true), className: "px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm rounded-xl flex items-center gap-2 shadow-lg shadow-blue-500/20", children: [_jsx(Plus, { className: "w-4 h-4" }), _jsx("span", { children: "Create New Chatbot" })] })] }), loading ? (_jsx("div", { className: "py-12 text-center text-slate-400", children: "Loading chatbots..." })) : chatbots.length === 0 ? (_jsxs("div", { className: "py-16 bg-white rounded-2xl border border-slate-200 text-center space-y-3", children: [_jsx(Bot, { className: "w-12 h-12 mx-auto text-slate-300" }), _jsx("h3", { className: "font-bold text-slate-700 text-base", children: "No chatbots created yet" }), _jsx("button", { onClick: () => setWizardOpen(true), className: "px-4 py-2 bg-blue-600 text-white font-bold text-xs rounded-xl", children: "Launch Builder Wizard" })] })) : (_jsx("div", { className: "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6", children: chatbots.map((bot) => (_jsxs("div", { className: "bg-white rounded-2xl border border-slate-200 hover:border-slate-300 shadow-sm hover:shadow-md transition-all p-6 flex flex-col justify-between space-y-4", children: [_jsxs("div", { className: "space-y-3", children: [_jsxs("div", { className: "flex items-center justify-between", children: [_jsxs("div", { className: "flex items-center gap-2", children: [_jsx("div", { className: "w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold", children: _jsx(Bot, { className: "w-5 h-5" }) }), _jsxs("div", { children: [_jsx("h3", { className: "font-bold text-slate-900 text-base", children: bot.name }), _jsxs("span", { className: "text-[11px] text-slate-400", children: ["v", bot.version] })] })] }), _jsx("span", { className: `px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase ${bot.status === 'published' ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-600'}`, children: bot.status })] }), _jsx("p", { className: "text-xs text-slate-600 line-clamp-2", children: bot.description || 'Custom business chatbot assistant.' }), _jsx("div", { className: "flex flex-wrap gap-1.5 pt-1", children: _jsxs("span", { className: "px-2 py-0.5 bg-blue-50 text-blue-700 text-[10px] font-bold rounded-md flex items-center gap-1", children: [_jsx(ShieldCheck, { className: "w-3 h-3" }), _jsx("span", { children: bot.responseMode.replace(/_/g, ' ') })] }) })] }), _jsx("div", { className: "pt-4 border-t border-slate-100 flex items-center justify-between", children: _jsxs("button", { onClick: () => navigate(`/chatbots/${bot.id}/builder`), className: "w-full py-2 bg-slate-50 hover:bg-blue-50 text-slate-700 hover:text-blue-700 font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 transition-colors border border-slate-200", children: [_jsx(Sliders, { className: "w-3.5 h-3.5" }), _jsx("span", { children: "Open Visual Builder" }), _jsx(ChevronRight, { className: "w-3.5 h-3.5 ml-auto text-slate-400" })] }) })] }, bot.id))) })), wizardOpen && (_jsx("div", { className: "fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4", children: _jsxs("div", { className: "bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl", children: [_jsx("h3", { className: "font-bold text-lg text-slate-800 mb-2", children: "Create New Chatbot Wizard" }), _jsxs("form", { onSubmit: handleCreateChatbot, className: "space-y-4", children: [_jsxs("div", { children: [_jsx("label", { className: "block text-xs font-bold uppercase text-slate-500 mb-1", children: "Chatbot Name" }), _jsx("input", { type: "text", value: newBotName, onChange: (e) => setNewBotName(e.target.value), placeholder: "e.g., Acme Customer Support Bot", className: "w-full px-3 py-2 border border-slate-300 rounded-lg text-sm", required: true })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-xs font-bold uppercase text-slate-500 mb-1", children: "Primary Purpose" }), _jsxs("select", { value: newBotPurpose, onChange: (e) => setNewBotPurpose(e.target.value), className: "w-full px-3 py-2 border border-slate-300 rounded-lg text-sm bg-white", children: [_jsx("option", { value: "customer_support", children: "Customer Support & FAQs" }), _jsx("option", { value: "sales", children: "Sales & Product Recommendations" }), _jsx("option", { value: "booking", children: "Reservations & Booking" }), _jsx("option", { value: "internal", children: "Internal Team Knowledge" })] })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-xs font-bold uppercase text-slate-500 mb-1", children: "Default Response Mode" }), _jsxs("select", { value: newBotResponseMode, onChange: (e) => setNewBotResponseMode(e.target.value), className: "w-full px-3 py-2 border border-slate-300 rounded-lg text-sm bg-white font-semibold", children: [_jsx("option", { value: "business_data_first", children: "Business Data First (Default)" }), _jsx("option", { value: "business_data_only", children: "Business Data Only (Zero External AI Calls)" }), _jsx("option", { value: "explicit_global_ai", children: "Explicit Global AI Mode" })] })] }), _jsxs("div", { className: "flex justify-end gap-3 pt-4", children: [_jsx("button", { type: "button", onClick: () => setWizardOpen(false), className: "px-4 py-2 border border-slate-300 rounded-xl font-semibold text-xs text-slate-700", children: "Cancel" }), _jsx("button", { type: "submit", disabled: creating, className: "px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-md", children: creating ? 'Launching Builder...' : 'Continue to Visual Builder →' })] })] })] }) }))] }));
};
