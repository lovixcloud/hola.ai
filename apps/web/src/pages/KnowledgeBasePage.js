import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { Database, Plus, FileJson, FileText, Search, CheckCircle2, RotateCw, Sparkles } from 'lucide-react';
export const KnowledgeBasePage = () => {
    const { activeOrg, apiCall } = useApp();
    const [sources, setSources] = useState([]);
    const [loading, setLoading] = useState(true);
    const [modalOpen, setModalOpen] = useState(false);
    const [sourceName, setSourceName] = useState('');
    const [sourceType, setSourceType] = useState('json');
    const [rawContent, setRawContent] = useState('');
    const [ingesting, setIngesting] = useState(false);
    const [testQuery, setTestQuery] = useState('');
    const [testResult, setTestResult] = useState(null);
    const [testing, setTesting] = useState(false);
    const loadKnowledgeSources = async () => {
        if (!activeOrg)
            return;
        try {
            setLoading(true);
            const data = await apiCall(`/api/v1/organizations/${activeOrg.id}/knowledge/sources`);
            setSources(data.sources || []);
        }
        catch (err) {
            console.error('Error loading sources:', err);
        }
        finally {
            setLoading(false);
        }
    };
    useEffect(() => {
        loadKnowledgeSources();
    }, [activeOrg]);
    const handleIngest = async (e) => {
        e.preventDefault();
        if (!activeOrg || !sourceName || !rawContent)
            return;
        try {
            setIngesting(true);
            await apiCall(`/api/v1/organizations/${activeOrg.id}/knowledge/sources`, {
                method: 'POST',
                body: JSON.stringify({
                    name: sourceName,
                    type: sourceType,
                    rawContent,
                }),
            });
            setModalOpen(false);
            setSourceName('');
            setRawContent('');
            loadKnowledgeSources();
        }
        catch (err) {
            alert(err.message || 'Ingestion Failed');
        }
        finally {
            setIngesting(false);
        }
    };
    const handleRunTestQuery = async () => {
        if (!activeOrg || !testQuery.trim())
            return;
        try {
            setTesting(true);
            const botData = await apiCall(`/api/v1/organizations/${activeOrg.id}/chatbots`);
            if (!botData.chatbots || botData.chatbots.length === 0) {
                alert('Please create a chatbot first to test RAG retrieval.');
                return;
            }
            const botId = botData.chatbots[0].id;
            const res = await apiCall(`/api/v1/organizations/${activeOrg.id}/chatbots/${botId}/test-query`, {
                method: 'POST',
                body: JSON.stringify({ query: testQuery }),
            });
            setTestResult(res.result);
        }
        catch (err) {
            console.error('Test query error:', err);
        }
        finally {
            setTesting(false);
        }
    };
    return (_jsxs("div", { className: "p-8 max-w-7xl mx-auto space-y-8", children: [_jsxs("div", { className: "flex flex-col sm:flex-row sm:items-center justify-between gap-4", children: [_jsxs("div", { children: [_jsxs("h1", { className: "text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2", children: [_jsx(Database, { className: "w-7 h-7 text-blue-600" }), _jsx("span", { children: "Business Knowledge Base" })] }), _jsx("p", { className: "text-sm text-slate-500", children: "Upload structured JSON datasets, FAQs, CSVs, and documents to power your chatbot answers." })] }), _jsxs("button", { onClick: () => setModalOpen(true), className: "px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm rounded-xl flex items-center gap-2 shadow-lg shadow-blue-500/20", children: [_jsx(Plus, { className: "w-4 h-4" }), _jsx("span", { children: "Add Knowledge Source" })] })] }), _jsxs("div", { className: "grid grid-cols-12 gap-8", children: [_jsxs("div", { className: "col-span-8 bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-4", children: [_jsxs("h2", { className: "font-bold text-slate-800 text-base border-b border-slate-100 pb-3 flex items-center justify-between", children: [_jsxs("span", { children: ["Configured Sources (", sources.length, ")"] }), _jsxs("button", { onClick: loadKnowledgeSources, className: "text-xs text-blue-600 hover:underline flex items-center gap-1", children: [_jsx(RotateCw, { className: "w-3.5 h-3.5" }), " Reload"] })] }), loading ? (_jsx("div", { className: "py-12 text-center text-slate-400", children: "Loading sources..." })) : sources.length === 0 ? (_jsxs("div", { className: "py-12 text-center text-slate-400 space-y-2", children: [_jsx(FileJson, { className: "w-10 h-10 mx-auto text-slate-300" }), _jsx("p", { className: "font-semibold text-slate-600", children: "No knowledge sources uploaded yet." })] })) : (_jsx("div", { className: "space-y-3", children: sources.map((src) => (_jsxs("div", { className: "p-4 rounded-xl border border-slate-200 hover:border-slate-300 bg-slate-50/50 flex items-center justify-between", children: [_jsxs("div", { className: "flex items-center gap-3", children: [_jsx("div", { className: "w-10 h-10 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center font-bold", children: src.type === 'json' ? _jsx(FileJson, { className: "w-5 h-5" }) : _jsx(FileText, { className: "w-5 h-5" }) }), _jsxs("div", { children: [_jsx("span", { className: "font-bold text-sm text-slate-800 block", children: src.name }), _jsxs("span", { className: "text-xs text-slate-500", children: ["Type: ", _jsx("span", { className: "uppercase font-semibold", children: src.type }), " \u2022 ", src.recordCount, " indexed records"] })] })] }), _jsxs("span", { className: "px-2.5 py-1 rounded-full text-xs font-bold uppercase bg-emerald-100 text-emerald-700 flex items-center gap-1", children: [_jsx(CheckCircle2, { className: "w-3 h-3" }), " Ready"] })] }, src.id))) }))] }), _jsxs("div", { className: "col-span-4 bg-slate-900 text-slate-100 rounded-2xl shadow-xl p-6 flex flex-col justify-between", children: [_jsxs("div", { children: [_jsxs("div", { className: "flex items-center gap-2 font-bold text-sm text-blue-400 mb-2", children: [_jsx(Sparkles, { className: "w-4 h-4" }), _jsx("span", { children: "RAG Knowledge Test Console" })] }), _jsxs("div", { className: "space-y-3", children: [_jsx("input", { type: "text", value: testQuery, onChange: (e) => setTestQuery(e.target.value), placeholder: "Type query (e.g., return policy)...", className: "w-full px-3.5 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white outline-none focus:border-blue-500" }), _jsxs("button", { onClick: handleRunTestQuery, disabled: testing, className: "w-full py-2 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-2", children: [_jsx(Search, { className: "w-3.5 h-3.5" }), _jsx("span", { children: testing ? 'Searching Knowledge...' : 'Test Knowledge Search' })] })] })] }), testResult && (_jsxs("div", { className: "mt-4 p-3.5 bg-slate-800/80 rounded-xl border border-slate-700/80 text-xs space-y-2", children: [_jsx("div", { className: "font-bold text-emerald-400", children: "Answer Output:" }), _jsx("p", { className: "text-slate-200 leading-relaxed max-h-36 overflow-y-auto", children: testResult.answer })] }))] })] }), modalOpen && (_jsx("div", { className: "fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4", children: _jsxs("div", { className: "bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl", children: [_jsx("h3", { className: "font-bold text-lg text-slate-800 mb-4", children: "Add Knowledge Source" }), _jsxs("form", { onSubmit: handleIngest, className: "space-y-4", children: [_jsxs("div", { children: [_jsx("label", { className: "block text-xs font-bold uppercase text-slate-500 mb-1", children: "Source Name" }), _jsx("input", { type: "text", value: sourceName, onChange: (e) => setSourceName(e.target.value), placeholder: "e.g., Product Inventory 2024", className: "w-full px-3 py-2 border border-slate-300 rounded-lg text-sm", required: true })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-xs font-bold uppercase text-slate-500 mb-1", children: "Data Type" }), _jsxs("select", { value: sourceType, onChange: (e) => setSourceType(e.target.value), className: "w-full px-3 py-2 border border-slate-300 rounded-lg text-sm bg-white", children: [_jsx("option", { value: "json", children: "JSON Array / Object" }), _jsx("option", { value: "csv", children: "CSV Spreadsheet" }), _jsx("option", { value: "txt", children: "Plain Text / FAQ Document" })] })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-xs font-bold uppercase text-slate-500 mb-1", children: "Content" }), _jsx("textarea", { rows: 6, value: rawContent, onChange: (e) => setRawContent(e.target.value), placeholder: sourceType === 'json' ? '[\n  { "sku": "101", "name": "Item A", "price": "$10" }\n]' : 'Paste text here...', className: "w-full px-3 py-2 border border-slate-300 rounded-lg text-xs font-mono", required: true })] }), _jsxs("div", { className: "flex justify-end gap-3 pt-2", children: [_jsx("button", { type: "button", onClick: () => setModalOpen(false), className: "px-4 py-2 border border-slate-300 rounded-xl font-semibold text-xs text-slate-700", children: "Cancel" }), _jsx("button", { type: "submit", disabled: ingesting, className: "px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-md", children: ingesting ? 'Indexing...' : 'Save & Index' })] })] })] }) }))] }));
};
