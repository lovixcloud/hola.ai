import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { CreditCard, Zap } from 'lucide-react';
export const BillingPage = () => {
    const { activeOrg, apiCall } = useApp();
    const [billingData, setBillingData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [upgradingTier, setUpgradingTier] = useState(null);
    const loadBilling = async () => {
        if (!activeOrg)
            return;
        try {
            setLoading(true);
            const data = await apiCall(`/api/v1/organizations/${activeOrg.id}/billing`);
            setBillingData(data);
        }
        catch (err) {
            console.error('Error loading billing:', err);
        }
        finally {
            setLoading(false);
        }
    };
    useEffect(() => {
        loadBilling();
    }, [activeOrg]);
    const handlePayPalUpgrade = async (planTier) => {
        if (!activeOrg)
            return;
        try {
            setUpgradingTier(planTier);
            const orderRes = await apiCall(`/api/v1/organizations/${activeOrg.id}/billing/paypal/create-order`, {
                method: 'POST',
                body: JSON.stringify({ planTier }),
            });
            await apiCall(`/api/v1/organizations/${activeOrg.id}/billing/paypal/capture-order`, {
                method: 'POST',
                body: JSON.stringify({ orderId: orderRes.orderId, planTier }),
            });
            alert(`Subscription upgraded to ${planTier.toUpperCase()} successfully!`);
            loadBilling();
        }
        catch (err) {
            alert(err.message || 'Payment upgrade failed');
        }
        finally {
            setUpgradingTier(null);
        }
    };
    if (loading || !billingData) {
        return _jsx("div", { className: "p-8 text-center text-slate-400", children: "Loading subscription details..." });
    }
    const { subscription, usage } = billingData;
    const plans = [
        { tier: 'starter', name: 'Starter', price: '$19', desc: 'For growing teams & single products' },
        { tier: 'professional', name: 'Professional', price: '$49', desc: 'Full custom branding & AI model routing' },
        { tier: 'business', name: 'Business', price: '$149', desc: 'High limits & multi-workspace support' },
    ];
    return (_jsxs("div", { className: "p-8 max-w-7xl mx-auto space-y-8", children: [_jsxs("div", { children: [_jsxs("h1", { className: "text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2", children: [_jsx(CreditCard, { className: "w-7 h-7 text-blue-600" }), _jsx("span", { children: "Billing, Plans & Usage Metering" })] }), _jsx("p", { className: "text-sm text-slate-500", children: "Manage your organization plan tier, PayPal billing, and feature entitlements." })] }), _jsxs("div", { className: "grid grid-cols-1 md:grid-cols-3 gap-6", children: [_jsxs("div", { className: "bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-2", children: [_jsxs("div", { className: "flex justify-between text-xs font-bold text-slate-500 uppercase", children: [_jsx("span", { children: "Chatbots Usage" }), _jsxs("span", { children: [usage.chatbotsCount, " / ", usage.chatbotsLimit] })] }), _jsx("div", { className: "w-full bg-slate-100 rounded-full h-2 overflow-hidden", children: _jsx("div", { className: "bg-blue-600 h-full rounded-full", style: { width: `${Math.min(100, (usage.chatbotsCount / usage.chatbotsLimit) * 100)}%` } }) })] }), _jsxs("div", { className: "bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-2", children: [_jsxs("div", { className: "flex justify-between text-xs font-bold text-slate-500 uppercase", children: [_jsx("span", { children: "Monthly Conversations" }), _jsxs("span", { children: [usage.conversationsThisMonth, " / ", usage.conversationsLimit] })] }), _jsx("div", { className: "w-full bg-slate-100 rounded-full h-2 overflow-hidden", children: _jsx("div", { className: "bg-indigo-600 h-full rounded-full", style: { width: `${Math.min(100, (usage.conversationsThisMonth / usage.conversationsLimit) * 100)}%` } }) })] }), _jsxs("div", { className: "bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-2", children: [_jsxs("div", { className: "flex justify-between text-xs font-bold text-slate-500 uppercase", children: [_jsx("span", { children: "Team Seats" }), _jsxs("span", { children: [usage.teamMembersCount, " / ", usage.teamMembersLimit] })] }), _jsx("div", { className: "w-full bg-slate-100 rounded-full h-2 overflow-hidden", children: _jsx("div", { className: "bg-emerald-600 h-full rounded-full", style: { width: `${Math.min(100, (usage.teamMembersCount / usage.teamMembersLimit) * 100)}%` } }) })] })] }), _jsx("div", { className: "grid grid-cols-1 md:grid-cols-3 gap-6", children: plans.map((p) => {
                    const isCurrent = subscription?.planTier === p.tier;
                    return (_jsxs("div", { className: `bg-white rounded-2xl border p-6 flex flex-col justify-between space-y-4 shadow-sm ${isCurrent ? 'border-blue-600 ring-2 ring-blue-600/20' : 'border-slate-200'}`, children: [_jsxs("div", { className: "space-y-3", children: [_jsxs("div", { className: "flex justify-between items-center", children: [_jsx("span", { className: "font-bold text-slate-900 text-lg", children: p.name }), isCurrent && (_jsx("span", { className: "bg-blue-100 text-blue-700 text-[10px] font-bold uppercase px-2.5 py-0.5 rounded-full", children: "Current Plan" }))] }), _jsxs("div", { className: "text-3xl font-black text-slate-900", children: [p.price, _jsx("span", { className: "text-xs font-normal text-slate-400", children: "/mo" })] }), _jsx("p", { className: "text-xs text-slate-500", children: p.desc })] }), _jsxs("button", { onClick: () => handlePayPalUpgrade(p.tier), disabled: isCurrent || upgradingTier === p.tier, className: `w-full py-2.5 rounded-xl font-bold text-xs flex items-center justify-center gap-2 ${isCurrent
                                    ? 'bg-slate-100 text-slate-400 cursor-default'
                                    : 'bg-blue-600 hover:bg-blue-700 text-white shadow-md'}`, children: [_jsx(Zap, { className: "w-3.5 h-3.5" }), _jsx("span", { children: upgradingTier === p.tier ? 'Processing PayPal...' : isCurrent ? 'Active Plan' : `Upgrade via PayPal` })] })] }, p.tier));
                }) })] }));
};
