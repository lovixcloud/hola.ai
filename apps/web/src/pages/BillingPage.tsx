import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { CreditCard, Zap } from 'lucide-react';

export const BillingPage: React.FC = () => {
  const { activeOrg, apiCall } = useApp();
  const [billingData, setBillingData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [upgradingTier, setUpgradingTier] = useState<string | null>(null);

  const loadBilling = async () => {
    if (!activeOrg) return;
    try {
      setLoading(true);
      const data = await apiCall(`/api/v1/organizations/${activeOrg.id}/billing`);
      setBillingData(data);
    } catch (err) {
      console.error('Error loading billing:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadBilling();
  }, [activeOrg]);

  const handlePayPalUpgrade = async (planTier: string) => {
    if (!activeOrg) return;
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
    } catch (err: any) {
      alert(err.message || 'Payment upgrade failed');
    } finally {
      setUpgradingTier(null);
    }
  };

  if (loading || !billingData) {
    return <div className="p-8 text-center text-slate-400">Loading subscription details...</div>;
  }

  const { subscription, usage } = billingData;

  const plans = [
    { tier: 'starter', name: 'Starter', price: '$19', desc: 'For growing teams & single products' },
    { tier: 'professional', name: 'Professional', price: '$49', desc: 'Full custom branding & AI model routing' },
    { tier: 'business', name: 'Business', price: '$149', desc: 'High limits & multi-workspace support' },
  ];

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8">
      <div>
        <h1 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
          <CreditCard className="w-7 h-7 text-blue-600" />
          <span>Billing, Plans & Usage Metering</span>
        </h1>
        <p className="text-sm text-slate-500">
          Manage your organization plan tier, PayPal billing, and feature entitlements.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-2">
          <div className="flex justify-between text-xs font-bold text-slate-500 uppercase">
            <span>Chatbots Usage</span>
            <span>{usage.chatbotsCount} / {usage.chatbotsLimit}</span>
          </div>
          <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
            <div
              className="bg-blue-600 h-full rounded-full"
              style={{ width: `${Math.min(100, (usage.chatbotsCount / usage.chatbotsLimit) * 100)}%` }}
            ></div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-2">
          <div className="flex justify-between text-xs font-bold text-slate-500 uppercase">
            <span>Monthly Conversations</span>
            <span>{usage.conversationsThisMonth} / {usage.conversationsLimit}</span>
          </div>
          <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
            <div
              className="bg-indigo-600 h-full rounded-full"
              style={{ width: `${Math.min(100, (usage.conversationsThisMonth / usage.conversationsLimit) * 100)}%` }}
            ></div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-2">
          <div className="flex justify-between text-xs font-bold text-slate-500 uppercase">
            <span>Team Seats</span>
            <span>{usage.teamMembersCount} / {usage.teamMembersLimit}</span>
          </div>
          <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
            <div
              className="bg-emerald-600 h-full rounded-full"
              style={{ width: `${Math.min(100, (usage.teamMembersCount / usage.teamMembersLimit) * 100)}%` }}
            ></div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {plans.map((p) => {
          const isCurrent = subscription?.planTier === p.tier;
          return (
            <div
              key={p.tier}
              className={`bg-white rounded-2xl border p-6 flex flex-col justify-between space-y-4 shadow-sm ${
                isCurrent ? 'border-blue-600 ring-2 ring-blue-600/20' : 'border-slate-200'
              }`}
            >
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="font-bold text-slate-900 text-lg">{p.name}</span>
                  {isCurrent && (
                    <span className="bg-blue-100 text-blue-700 text-[10px] font-bold uppercase px-2.5 py-0.5 rounded-full">
                      Current Plan
                    </span>
                  )}
                </div>
                <div className="text-3xl font-black text-slate-900">{p.price}<span className="text-xs font-normal text-slate-400">/mo</span></div>
                <p className="text-xs text-slate-500">{p.desc}</p>
              </div>

              <button
                onClick={() => handlePayPalUpgrade(p.tier)}
                disabled={isCurrent || upgradingTier === p.tier}
                className={`w-full py-2.5 rounded-xl font-bold text-xs flex items-center justify-center gap-2 ${
                  isCurrent
                    ? 'bg-slate-100 text-slate-400 cursor-default'
                    : 'bg-blue-600 hover:bg-blue-700 text-white shadow-md'
                }`}
              >
                <Zap className="w-3.5 h-3.5" />
                <span>{upgradingTier === p.tier ? 'Processing PayPal...' : isCurrent ? 'Active Plan' : `Upgrade via PayPal`}</span>
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
};
