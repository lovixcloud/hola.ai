import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { BarChart3, TrendingUp, Clock, DollarSign, MessageSquare } from 'lucide-react';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';

export const AnalyticsPage: React.FC = () => {
  const { activeOrg, apiCall } = useApp();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!activeOrg) return;
    const loadAnalytics = async () => {
      try {
        setLoading(true);
        const res = await apiCall(`/api/v1/organizations/${activeOrg.id}/analytics/overview`);
        setData(res);
      } catch (err) {
        console.error('Error loading analytics:', err);
      } finally {
        setLoading(false);
      }
    };
    loadAnalytics();
  }, [activeOrg]);

  if (loading || !data) {
    return <div className="p-8 text-center text-slate-400">Loading analytics data...</div>;
  }

  const { summary, chartData } = data;

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8">
      <div>
        <h1 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
          <BarChart3 className="w-7 h-7 text-blue-600" />
          <span>Analytics & Performance Metrics</span>
        </h1>
        <p className="text-sm text-slate-500">
          Monitor conversation volume, answer accuracy, response latency, and model usage estimates.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
          <div className="flex justify-between text-slate-500 text-xs font-bold uppercase mb-2">
            <span>Conversations</span>
            <MessageSquare className="w-4 h-4 text-blue-600" />
          </div>
          <div className="text-3xl font-black text-slate-900">{summary.totalConversations}</div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
          <div className="flex justify-between text-slate-500 text-xs font-bold uppercase mb-2">
            <span>Data Resolution</span>
            <TrendingUp className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-3xl font-black text-slate-900">{summary.resolutionRatePercent}%</div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
          <div className="flex justify-between text-slate-500 text-xs font-bold uppercase mb-2">
            <span>Avg Latency</span>
            <Clock className="w-4 h-4 text-indigo-600" />
          </div>
          <div className="text-3xl font-black text-slate-900">{summary.avgResponseLatencyMs} ms</div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
          <div className="flex justify-between text-slate-500 text-xs font-bold uppercase mb-2">
            <span>Estimated AI Cost</span>
            <DollarSign className="w-4 h-4 text-purple-600" />
          </div>
          <div className="text-3xl font-black text-slate-900">${summary.estimatedModelCostUsd}</div>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
        <h3 className="font-bold text-slate-800 text-base">Conversation & Message Trends</h3>
        <div className="h-72 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="date" stroke="#94a3b8" fontSize={12} />
              <YAxis stroke="#94a3b8" fontSize={12} />
              <Tooltip />
              <Area type="monotone" dataKey="messages" stroke="#2563eb" fill="#3b82f6" fillOpacity={0.2} />
              <Area type="monotone" dataKey="conversations" stroke="#4f46e5" fill="#6366f1" fillOpacity={0.2} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};
