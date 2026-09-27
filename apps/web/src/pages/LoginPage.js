import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from 'react';
import { useApp } from '../context/AppContext';
import { ArrowRight } from 'lucide-react';
export const LoginPage = () => {
    const { login } = useApp();
    const [email, setEmail] = useState('alex@acme.com');
    const [password, setPassword] = useState('password123');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        const success = await login(email, password);
        if (!success) {
            setError('Invalid email or password');
        }
        setLoading(false);
    };
    return (_jsx("div", { className: "min-h-screen bg-slate-900 text-white flex items-center justify-center p-4", children: _jsxs("div", { className: "max-w-md w-full bg-slate-800/80 backdrop-blur-md rounded-3xl p-8 border border-slate-700/80 shadow-2xl space-y-6", children: [_jsxs("div", { className: "text-center space-y-2", children: [_jsx("div", { className: "w-12 h-12 rounded-2xl bg-blue-600 text-white flex items-center justify-center font-black text-2xl mx-auto shadow-lg shadow-blue-500/30", children: "h" }), _jsx("h2", { className: "text-2xl font-black tracking-tight", children: "Sign in to hola.ai" }), _jsx("p", { className: "text-xs text-slate-400", children: "Custom AI Chatbot Builder & Business Data Platform" })] }), error && (_jsx("div", { className: "p-3 bg-rose-500/20 border border-rose-500/40 rounded-xl text-rose-300 text-xs text-center font-semibold", children: error })), _jsxs("form", { onSubmit: handleSubmit, className: "space-y-4", children: [_jsxs("div", { children: [_jsx("label", { className: "block text-xs font-bold uppercase text-slate-400 mb-1", children: "Email Address" }), _jsx("input", { type: "email", value: email, onChange: (e) => setEmail(e.target.value), className: "w-full px-4 py-3 bg-slate-900/80 border border-slate-700 rounded-xl text-sm outline-none focus:border-blue-500 text-white", required: true })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-xs font-bold uppercase text-slate-400 mb-1", children: "Password" }), _jsx("input", { type: "password", value: password, onChange: (e) => setPassword(e.target.value), className: "w-full px-4 py-3 bg-slate-900/80 border border-slate-700 rounded-xl text-sm outline-none focus:border-blue-500 text-white", required: true })] }), _jsxs("button", { type: "submit", disabled: loading, className: "w-full py-3 bg-blue-600 hover:bg-blue-500 text-white font-bold text-sm rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-blue-600/30 transition-all", children: [_jsx("span", { children: loading ? 'Signing in...' : 'Sign In to Workspace' }), _jsx(ArrowRight, { className: "w-4 h-4" })] })] }), _jsxs("div", { className: "p-3 bg-slate-900/50 rounded-xl border border-slate-700/50 text-center text-xs text-slate-400 space-y-1", children: [_jsx("span", { className: "font-semibold text-blue-400 block", children: "Demo Credentials:" }), _jsxs("div", { children: ["Email: ", _jsx("code", { className: "text-slate-200", children: "alex@acme.com" })] }), _jsxs("div", { children: ["Password: ", _jsx("code", { className: "text-slate-200", children: "password123" })] })] })] }) }));
};
