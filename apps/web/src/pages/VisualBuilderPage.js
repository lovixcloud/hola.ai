import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { Palette, Sliders, Cpu, Layers, Save, Rocket, Code, ArrowLeft, Send, Check, ShieldCheck, Bot } from 'lucide-react';
export const VisualBuilderPage = () => {
    const { chatbotId } = useParams();
    const navigate = useNavigate();
    const { activeOrg, apiCall } = useApp();
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [activeTab, setActiveTab] = useState('appearance');
    const [bot, setBot] = useState(null);
    const [embedModalOpen, setEmbedModalOpen] = useState(false);
    const [testMessages, setTestMessages] = useState([]);
    const [inputTestText, setInputTestText] = useState('');
    const [testingQuery, setTestingQuery] = useState(false);
    const loadChatbot = async () => {
        if (!activeOrg || !chatbotId)
            return;
        try {
            setLoading(true);
            const data = await apiCall(`/api/v1/organizations/${activeOrg.id}/chatbots/${chatbotId}`);
            setBot(data.chatbot);
            setTestMessages([
                { sender: 'bot', text: data.chatbot.widgetConfig?.welcomeMessage || 'Hello! How can I help you today?' }
            ]);
        }
        catch (err) {
            console.error('Error loading bot:', err);
        }
        finally {
            setLoading(false);
        }
    };
    useEffect(() => {
        loadChatbot();
    }, [chatbotId, activeOrg]);
    const handleSave = async () => {
        if (!activeOrg || !bot)
            return;
        try {
            setSaving(true);
            const updated = await apiCall(`/api/v1/organizations/${activeOrg.id}/chatbots/${bot.id}`, {
                method: 'PUT',
                body: JSON.stringify({
                    name: bot.name,
                    responseMode: bot.responseMode,
                    widgetConfig: bot.widgetConfig,
                    behaviorConfig: bot.behaviorConfig,
                    modelConfig: bot.modelConfig,
                }),
            });
            setBot(updated.chatbot);
        }
        catch (err) {
            console.error('Save error:', err);
        }
        finally {
            setSaving(false);
        }
    };
    const handlePublish = async () => {
        if (!activeOrg || !bot)
            return;
        try {
            setSaving(true);
            const updated = await apiCall(`/api/v1/organizations/${activeOrg.id}/chatbots/${bot.id}/publish`, {
                method: 'POST',
            });
            setBot(updated.chatbot);
            setEmbedModalOpen(true);
        }
        catch (err) {
            console.error('Publish error:', err);
        }
        finally {
            setSaving(false);
        }
    };
    const handleSendTestMessage = async (msgText) => {
        const text = msgText || inputTestText;
        if (!text.trim() || !bot || !activeOrg)
            return;
        setTestMessages(prev => [...prev, { sender: 'visitor', text }]);
        setInputTestText('');
        setTestingQuery(true);
        try {
            const res = await apiCall(`/api/v1/organizations/${activeOrg.id}/chatbots/${bot.id}/test-query`, {
                method: 'POST',
                body: JSON.stringify({ query: text }),
            });
            setTestMessages(prev => [
                ...prev,
                {
                    sender: 'bot',
                    text: res.result.answer,
                    citations: res.result.citations,
                }
            ]);
        }
        catch (err) {
            setTestMessages(prev => [
                ...prev,
                { sender: 'bot', text: 'Error executing query test against chatbot knowledge base.' }
            ]);
        }
        finally {
            setTestingQuery(false);
        }
    };
    if (loading || !bot) {
        return _jsx("div", { className: "p-8 text-center text-slate-500", children: "Loading Visual Chatbot Builder..." });
    }
    return (_jsxs("div", { className: "flex flex-col h-[calc(100vh-4rem)] bg-slate-100", children: [_jsxs("div", { className: "h-14 bg-white border-b border-slate-200 px-6 flex items-center justify-between", children: [_jsxs("div", { className: "flex items-center gap-4", children: [_jsx("button", { onClick: () => navigate('/chatbots'), className: "p-1.5 hover:bg-slate-100 rounded-lg text-slate-500", children: _jsx(ArrowLeft, { className: "w-5 h-5" }) }), _jsxs("div", { children: [_jsx("input", { type: "text", value: bot.name, onChange: (e) => setBot({ ...bot, name: e.target.value }), className: "font-bold text-slate-800 text-lg bg-transparent border-b border-transparent hover:border-slate-300 focus:border-blue-600 focus:bg-white outline-none px-1 py-0.5" }), _jsxs("span", { className: "text-xs text-slate-400 ml-2", children: ["v", bot.version, " (", bot.status, ")"] })] })] }), _jsxs("div", { className: "flex items-center gap-3", children: [_jsxs("button", { onClick: handleSave, disabled: saving, className: "px-4 py-2 rounded-lg border border-slate-300 text-slate-700 hover:bg-slate-50 font-semibold text-sm flex items-center gap-2", children: [_jsx(Save, { className: "w-4 h-4" }), _jsx("span", { children: saving ? 'Saving...' : 'Save Draft' })] }), _jsxs("button", { onClick: handlePublish, disabled: saving, className: "px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm flex items-center gap-2 shadow-md shadow-blue-500/20", children: [_jsx(Rocket, { className: "w-4 h-4" }), _jsx("span", { children: "Publish Chatbot" })] }), _jsx("button", { onClick: () => setEmbedModalOpen(true), className: "p-2 border border-slate-300 rounded-lg text-slate-600 hover:bg-slate-50", title: "Embed Code", children: _jsx(Code, { className: "w-4 h-4" }) })] })] }), _jsxs("div", { className: "flex-1 grid grid-cols-12 overflow-hidden", children: [_jsxs("div", { className: "col-span-7 bg-white border-r border-slate-200 flex flex-col overflow-hidden", children: [_jsxs("div", { className: "flex border-b border-slate-200 bg-slate-50 px-4", children: [_jsxs("button", { onClick: () => setActiveTab('appearance'), className: `px-4 py-3 font-semibold text-sm border-b-2 flex items-center gap-2 ${activeTab === 'appearance' ? 'border-blue-600 text-blue-600' : 'border-transparent text-slate-500 hover:text-slate-800'}`, children: [_jsx(Palette, { className: "w-4 h-4" }), _jsx("span", { children: "Graphical Styling" })] }), _jsxs("button", { onClick: () => setActiveTab('behavior'), className: `px-4 py-3 font-semibold text-sm border-b-2 flex items-center gap-2 ${activeTab === 'behavior' ? 'border-blue-600 text-blue-600' : 'border-transparent text-slate-500 hover:text-slate-800'}`, children: [_jsx(Sliders, { className: "w-4 h-4" }), _jsx("span", { children: "Behavior & Instructions" })] }), _jsxs("button", { onClick: () => setActiveTab('mode'), className: `px-4 py-3 font-semibold text-sm border-b-2 flex items-center gap-2 ${activeTab === 'mode' ? 'border-blue-600 text-blue-600' : 'border-transparent text-slate-500 hover:text-slate-800'}`, children: [_jsx(Layers, { className: "w-4 h-4" }), _jsx("span", { children: "Response Modes" })] }), _jsxs("button", { onClick: () => setActiveTab('model'), className: `px-4 py-3 font-semibold text-sm border-b-2 flex items-center gap-2 ${activeTab === 'model' ? 'border-blue-600 text-blue-600' : 'border-transparent text-slate-500 hover:text-slate-800'}`, children: [_jsx(Cpu, { className: "w-4 h-4" }), _jsx("span", { children: "AI Provider Routing" })] })] }), _jsxs("div", { className: "flex-1 p-6 overflow-y-auto space-y-6", children: [activeTab === 'appearance' && (_jsxs("div", { className: "space-y-5", children: [_jsxs("div", { children: [_jsx("label", { className: "block text-xs font-bold uppercase text-slate-500 mb-1", children: "Widget Display Name" }), _jsx("input", { type: "text", value: bot.widgetConfig.displayName, onChange: (e) => setBot({ ...bot, widgetConfig: { ...bot.widgetConfig, displayName: e.target.value } }), className: "w-full px-3 py-2 border border-slate-300 rounded-lg text-sm outline-none focus:border-blue-600" })] }), _jsxs("div", { className: "grid grid-cols-2 gap-4", children: [_jsxs("div", { children: [_jsx("label", { className: "block text-xs font-bold uppercase text-slate-500 mb-1", children: "Primary Color" }), _jsxs("div", { className: "flex gap-2", children: [_jsx("input", { type: "color", value: bot.widgetConfig.primaryColor, onChange: (e) => setBot({ ...bot, widgetConfig: { ...bot.widgetConfig, primaryColor: e.target.value } }), className: "w-10 h-10 rounded border border-slate-300 cursor-pointer p-1" }), _jsx("input", { type: "text", value: bot.widgetConfig.primaryColor, onChange: (e) => setBot({ ...bot, widgetConfig: { ...bot.widgetConfig, primaryColor: e.target.value } }), className: "flex-1 px-3 py-2 border border-slate-300 rounded-lg text-sm font-mono" })] })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-xs font-bold uppercase text-slate-500 mb-1", children: "Widget Position" }), _jsxs("select", { value: bot.widgetConfig.position, onChange: (e) => setBot({ ...bot, widgetConfig: { ...bot.widgetConfig, position: e.target.value } }), className: "w-full px-3 py-2 border border-slate-300 rounded-lg text-sm bg-white", children: [_jsx("option", { value: "bottom_right", children: "Bottom Right" }), _jsx("option", { value: "bottom_left", children: "Bottom Left" })] })] })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-xs font-bold uppercase text-slate-500 mb-1", children: "Header Title Text" }), _jsx("input", { type: "text", value: bot.widgetConfig.headerTitle, onChange: (e) => setBot({ ...bot, widgetConfig: { ...bot.widgetConfig, headerTitle: e.target.value } }), className: "w-full px-3 py-2 border border-slate-300 rounded-lg text-sm" })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-xs font-bold uppercase text-slate-500 mb-1", children: "Welcome Greeting Message" }), _jsx("textarea", { rows: 3, value: bot.widgetConfig.welcomeMessage, onChange: (e) => setBot({ ...bot, widgetConfig: { ...bot.widgetConfig, welcomeMessage: e.target.value } }), className: "w-full px-3 py-2 border border-slate-300 rounded-lg text-sm" })] })] })), activeTab === 'behavior' && (_jsxs("div", { className: "space-y-5", children: [_jsxs("div", { children: [_jsx("label", { className: "block text-xs font-bold uppercase text-slate-500 mb-1", children: "System Instructions & Prompt Persona" }), _jsx("textarea", { rows: 4, value: bot.behaviorConfig.systemInstructions, onChange: (e) => setBot({ ...bot, behaviorConfig: { ...bot.behaviorConfig, systemInstructions: e.target.value } }), className: "w-full px-3 py-2 border border-slate-300 rounded-lg text-sm font-mono" })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-xs font-bold uppercase text-slate-500 mb-1", children: "Fallback Message" }), _jsx("textarea", { rows: 2, value: bot.behaviorConfig.fallbackMessage, onChange: (e) => setBot({ ...bot, behaviorConfig: { ...bot.behaviorConfig, fallbackMessage: e.target.value } }), className: "w-full px-3 py-2 border border-slate-300 rounded-lg text-sm" })] })] })), activeTab === 'mode' && (_jsxs("div", { className: "space-y-4", children: [_jsxs("div", { onClick: () => setBot({ ...bot, responseMode: 'business_data_first' }), className: `p-4 rounded-xl border-2 cursor-pointer transition-all ${bot.responseMode === 'business_data_first' ? 'border-blue-600 bg-blue-50/50' : 'border-slate-200 hover:border-slate-300'}`, children: [_jsxs("div", { className: "flex items-center justify-between font-bold text-slate-800 mb-1", children: [_jsxs("span", { className: "flex items-center gap-2", children: [_jsx(ShieldCheck, { className: "w-5 h-5 text-blue-600" }), _jsx("span", { children: "Business Data First (Default)" })] }), bot.responseMode === 'business_data_first' && _jsx(Check, { className: "w-5 h-5 text-blue-600" })] }), _jsx("p", { className: "text-xs text-slate-600", children: "Searches business JSON, files, and knowledge base first. Answers strictly based on business facts and provides citations." })] }), _jsxs("div", { onClick: () => setBot({ ...bot, responseMode: 'business_data_only' }), className: `p-4 rounded-xl border-2 cursor-pointer transition-all ${bot.responseMode === 'business_data_only' ? 'border-blue-600 bg-blue-50/50' : 'border-slate-200 hover:border-slate-300'}`, children: [_jsxs("div", { className: "flex items-center justify-between font-bold text-slate-800 mb-1", children: [_jsxs("span", { className: "flex items-center gap-2", children: [_jsx(Bot, { className: "w-5 h-5 text-indigo-600" }), _jsx("span", { children: "Business Data Only (Zero External AI Calls)" })] }), bot.responseMode === 'business_data_only' && _jsx(Check, { className: "w-5 h-5 text-blue-600" })] }), _jsx("p", { className: "text-xs text-slate-600", children: "Strict privacy mode. Never calls external AI model providers." })] })] })), activeTab === 'model' && (_jsx("div", { className: "space-y-5", children: _jsxs("div", { children: [_jsx("label", { className: "block text-xs font-bold uppercase text-slate-500 mb-1", children: "AI Provider Adapter" }), _jsxs("select", { value: bot.modelConfig.provider, onChange: (e) => setBot({ ...bot, modelConfig: { ...bot.modelConfig, provider: e.target.value } }), className: "w-full px-3 py-2 border border-slate-300 rounded-lg text-sm bg-white", children: [_jsx("option", { value: "mock", children: "Local / Mock Provider (No API Key needed)" }), _jsx("option", { value: "openai", children: "OpenAI (GPT-4o)" }), _jsx("option", { value: "anthropic", children: "Anthropic (Claude 3.5)" }), _jsx("option", { value: "google", children: "Google Gemini" })] })] }) }))] })] }), _jsxs("div", { className: "col-span-5 bg-slate-100 p-6 flex flex-col items-center justify-center relative", children: [_jsxs("div", { className: "text-xs font-bold uppercase tracking-wider text-slate-400 mb-3 flex items-center gap-1.5", children: [_jsx("span", { className: "w-2 h-2 rounded-full bg-emerald-500 animate-pulse" }), _jsx("span", { children: "Live Chatbot Preview & Testing" })] }), _jsxs("div", { className: "w-[360px] h-[520px] bg-white rounded-2xl shadow-xl border border-slate-200 flex flex-col overflow-hidden", style: { fontFamily: bot.widgetConfig.fontFamily }, children: [_jsxs("div", { className: "p-4 text-white flex items-center justify-between", style: { backgroundColor: bot.widgetConfig.primaryColor }, children: [_jsxs("div", { className: "flex items-center gap-2 font-bold text-sm", children: [_jsx("span", { className: "w-2.5 h-2.5 rounded-full bg-emerald-400" }), _jsx("span", { children: bot.widgetConfig.headerTitle })] }), _jsx("span", { className: "text-xs opacity-75", children: "Preview" })] }), _jsxs("div", { className: "flex-1 p-4 overflow-y-auto bg-slate-50 space-y-3", children: [testMessages.map((msg, idx) => (_jsx("div", { className: `flex ${msg.sender === 'visitor' ? 'justify-end' : 'justify-start'}`, children: _jsxs("div", { className: `max-w-[82%] px-3.5 py-2.5 rounded-2xl text-xs leading-relaxed ${msg.sender === 'visitor' ? 'bg-blue-600 text-white rounded-br-none' : 'bg-white text-slate-800 border border-slate-200 shadow-sm rounded-bl-none'}`, children: [_jsx("div", { children: msg.text }), msg.citations && msg.citations.length > 0 && (_jsxs("div", { className: "mt-1.5 pt-1 border-t border-slate-100 text-[10px] text-slate-500 italic", children: ["\uD83D\uDCCC Source: ", msg.citations[0].title] }))] }) }, idx))), testingQuery && (_jsx("div", { className: "text-xs text-slate-400 italic", children: "Chatbot is searching business knowledge..." }))] }), _jsxs("div", { className: "p-3 bg-white border-t border-slate-200 flex gap-2", children: [_jsx("input", { type: "text", value: inputTestText, onChange: (e) => setInputTestText(e.target.value), onKeyDown: (e) => e.key === 'Enter' && handleSendTestMessage(), placeholder: bot.widgetConfig.inputPlaceholder, className: "flex-1 px-3 py-1.5 border border-slate-200 rounded-xl text-xs outline-none focus:border-blue-600" }), _jsx("button", { onClick: () => handleSendTestMessage(), className: "px-3 py-1.5 rounded-xl text-white text-xs font-bold", style: { backgroundColor: bot.widgetConfig.primaryColor }, children: _jsx(Send, { className: "w-3.5 h-3.5" }) })] })] })] })] }), embedModalOpen && (_jsx("div", { className: "fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4", children: _jsxs("div", { className: "bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl", children: [_jsx("h3", { className: "font-bold text-lg text-slate-800 mb-2", children: "Publish & Embed Chatbot" }), _jsxs("p", { className: "text-xs text-slate-600 mb-4", children: ["Copy and paste this script tag into your HTML website before the closing ", _jsx("code", { className: "bg-slate-100 px-1 py-0.5 rounded", children: "</body>" }), " tag:"] }), _jsx("pre", { className: "p-4 bg-slate-900 text-slate-100 rounded-xl text-xs font-mono overflow-x-auto mb-6", children: `<script
  src="http://localhost:3000/widget.iife.js"
  data-embed-id="${bot.publicEmbedId}">
</script>` }), _jsx("div", { className: "flex justify-end gap-3", children: _jsx("button", { onClick: () => setEmbedModalOpen(false), className: "px-4 py-2 bg-slate-200 hover:bg-slate-300 rounded-xl font-semibold text-xs text-slate-800", children: "Close" }) })] }) }))] }));
};
