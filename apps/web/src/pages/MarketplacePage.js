import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { Store, Search, Star, Download } from 'lucide-react';
export const MarketplacePage = () => {
    const { activeOrg, apiCall } = useApp();
    const [templates, setTemplates] = useState([]);
    const [selectedCategory, setSelectedCategory] = useState('all');
    const [searchQuery, setSearchQuery] = useState('');
    const [loading, setLoading] = useState(true);
    const [installingId, setInstallingId] = useState(null);
    const loadTemplates = async () => {
        try {
            setLoading(true);
            const queryParams = new URLSearchParams();
            if (selectedCategory !== 'all')
                queryParams.set('category', selectedCategory);
            if (searchQuery)
                queryParams.set('query', searchQuery);
            const data = await apiCall(`/api/v1/marketplace/templates?${queryParams.toString()}`);
            setTemplates(data.templates || []);
        }
        catch (err) {
            console.error('Error loading templates:', err);
        }
        finally {
            setLoading(false);
        }
    };
    useEffect(() => {
        loadTemplates();
    }, [selectedCategory, searchQuery]);
    const handleInstall = async (templateId) => {
        if (!activeOrg)
            return;
        try {
            setInstallingId(templateId);
            const res = await apiCall(`/api/v1/organizations/${activeOrg.id}/marketplace/install`, {
                method: 'POST',
                body: JSON.stringify({ templateId }),
            });
            alert(`Success! Template installed as "${res.installedChatbot.name}" into your workspace.`);
        }
        catch (err) {
            alert(err.message || 'Installation failed');
        }
        finally {
            setInstallingId(null);
        }
    };
    return (_jsxs("div", { className: "p-8 max-w-7xl mx-auto space-y-8", children: [_jsxs("div", { children: [_jsxs("h1", { className: "text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2", children: [_jsx(Store, { className: "w-7 h-7 text-blue-600" }), _jsx("span", { children: "Chatbot Marketplace" })] }), _jsx("p", { className: "text-sm text-slate-500", children: "Discover, preview, and 1-click install pre-built, verified business chatbot templates." })] }), _jsxs("div", { className: "flex flex-col sm:flex-row gap-4 justify-between bg-white p-4 rounded-2xl border border-slate-200 shadow-sm", children: [_jsx("div", { className: "flex gap-2 overflow-x-auto", children: ['all', 'e_commerce', 'hospitality', 'saas_support', 'education', 'general_business'].map((cat) => (_jsx("button", { onClick: () => setSelectedCategory(cat), className: `px-3.5 py-2 rounded-xl text-xs font-bold capitalize transition-all ${selectedCategory === cat ? 'bg-blue-600 text-white shadow-md' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`, children: cat.replace(/_/g, ' ') }, cat))) }), _jsxs("div", { className: "relative w-full sm:w-64", children: [_jsx(Search, { className: "w-4 h-4 absolute left-3 top-3 text-slate-400" }), _jsx("input", { type: "text", value: searchQuery, onChange: (e) => setSearchQuery(e.target.value), placeholder: "Search templates...", className: "w-full pl-9 pr-3 py-2 border border-slate-200 rounded-xl text-xs outline-none focus:border-blue-600" })] })] }), loading ? (_jsx("div", { className: "py-12 text-center text-slate-400", children: "Loading templates..." })) : (_jsx("div", { className: "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6", children: templates.map((tpl) => (_jsxs("div", { className: "bg-white rounded-2xl border border-slate-200 hover:border-slate-300 shadow-sm p-6 flex flex-col justify-between space-y-4", children: [_jsxs("div", { className: "space-y-3", children: [_jsxs("div", { className: "flex items-center justify-between", children: [_jsx("span", { className: "text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700", children: tpl.category.replace(/_/g, ' ') }), _jsxs("div", { className: "flex items-center gap-1 text-amber-500 font-bold text-xs", children: [_jsx(Star, { className: "w-3.5 h-3.5 fill-amber-500" }), _jsx("span", { children: tpl.rating })] })] }), _jsx("h3", { className: "font-bold text-slate-900 text-base", children: tpl.name }), _jsx("p", { className: "text-xs text-slate-600 line-clamp-2", children: tpl.description }), _jsxs("div", { className: "text-[11px] text-slate-400", children: ["By ", _jsx("b", { children: tpl.publisherName }), " \u2022 ", tpl.installCount, " installs"] })] }), _jsxs("div", { className: "pt-4 border-t border-slate-100 flex items-center justify-between", children: [_jsx("span", { className: "font-black text-slate-900 text-sm", children: tpl.price === 0 ? 'FREE' : `$${tpl.price}` }), _jsxs("button", { onClick: () => handleInstall(tpl.id), disabled: installingId === tpl.id, className: "px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl flex items-center gap-1.5 shadow-md shadow-blue-500/20", children: [_jsx(Download, { className: "w-3.5 h-3.5" }), _jsx("span", { children: installingId === tpl.id ? 'Installing...' : '1-Click Install' })] })] })] }, tpl.id))) }))] }));
};
