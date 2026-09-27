import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { Code2, Key, Copy, Check } from 'lucide-react';
export const DeveloperPage = () => {
    const { activeOrg, apiCall } = useApp();
    const [keys, setKeys] = useState([]);
    const [keyName, setKeyName] = useState('');
    const [createdKeySecret, setCreatedKeySecret] = useState(null);
    const [copied, setCopied] = useState(false);
    const loadDeveloperData = async () => {
        if (!activeOrg)
            return;
        try {
            const kRes = await apiCall(`/api/v1/organizations/${activeOrg.id}/developer/keys`);
            setKeys(kRes.apiKeys || []);
        }
        catch (err) {
            console.error('Error loading dev data:', err);
        }
    };
    useEffect(() => {
        loadDeveloperData();
    }, [activeOrg]);
    const handleCreateKey = async (e) => {
        e.preventDefault();
        if (!activeOrg || !keyName)
            return;
        try {
            const res = await apiCall(`/api/v1/organizations/${activeOrg.id}/developer/keys`, {
                method: 'POST',
                body: JSON.stringify({ name: keyName }),
            });
            setCreatedKeySecret(res.rawSecretKey);
            setKeyName('');
            loadDeveloperData();
        }
        catch (err) {
            alert(err.message || 'Key creation failed');
        }
    };
    return (_jsxs("div", { className: "p-8 max-w-7xl mx-auto space-y-8", children: [_jsxs("div", { children: [_jsxs("h1", { className: "text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2", children: [_jsx(Code2, { className: "w-7 h-7 text-blue-600" }), _jsx("span", { children: "Developer API & Webhook Management" })] }), _jsx("p", { className: "text-sm text-slate-500", children: "Manage REST API access keys and register webhook event listeners." })] }), _jsxs("div", { className: "bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4", children: [_jsxs("h3", { className: "font-bold text-slate-800 text-base flex items-center gap-2", children: [_jsx(Key, { className: "w-4 h-4 text-blue-600" }), _jsx("span", { children: "API Keys" })] }), _jsxs("form", { onSubmit: handleCreateKey, className: "flex gap-2", children: [_jsx("input", { type: "text", value: keyName, onChange: (e) => setKeyName(e.target.value), placeholder: "New Key Name (e.g., Backend Integration)", className: "flex-1 px-3 py-2 border border-slate-300 rounded-xl text-xs outline-none focus:border-blue-600", required: true }), _jsx("button", { type: "submit", className: "px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-md", children: "Generate Key" })] }), createdKeySecret && (_jsxs("div", { className: "p-4 bg-emerald-50 border border-emerald-200 rounded-xl space-y-2", children: [_jsx("span", { className: "text-xs font-bold text-emerald-800 block", children: "\uD83D\uDD11 Save your secret key now! (It will not be displayed again):" }), _jsxs("div", { className: "flex items-center justify-between bg-white p-2.5 rounded-lg border border-emerald-300 font-mono text-xs", children: [_jsx("span", { className: "text-emerald-900", children: createdKeySecret }), _jsxs("button", { onClick: () => {
                                            navigator.clipboard.writeText(createdKeySecret);
                                            setCopied(true);
                                            setTimeout(() => setCopied(false), 2000);
                                        }, className: "text-slate-600 hover:text-slate-900 flex items-center gap-1 font-sans text-[11px]", children: [copied ? _jsx(Check, { className: "w-3.5 h-3.5 text-emerald-600" }) : _jsx(Copy, { className: "w-3.5 h-3.5" }), _jsx("span", { children: copied ? 'Copied!' : 'Copy' })] })] })] })), _jsx("div", { className: "space-y-2 pt-2", children: keys.map((k) => (_jsxs("div", { className: "p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between text-xs", children: [_jsxs("div", { children: [_jsx("span", { className: "font-bold text-slate-800 block", children: k.name }), _jsxs("span", { className: "font-mono text-slate-400", children: [k.keyPrefix, "..."] })] }), _jsxs("span", { className: "text-[10px] text-slate-400", children: ["Created ", new Date(k.createdAt).toLocaleDateString()] })] }, k.id))) })] })] }));
};
