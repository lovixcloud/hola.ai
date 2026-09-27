import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { Bot, MessageSquare, TrendingUp, ShieldCheck, Sparkles } from 'lucide-react';

export const OverviewPage: React.FC = () => {
  const { activeOrg, apiCall } = useApp();
  const navigate = useNavigate();
  const [metrics, setMetrics] = useState<any>(null);

  useEffect(() => {
    if (!activeOrg) return;
    const loadOverview = async () => {
      try {
        const data = await apiCall(`/api/v1/organizations/${activeOrg.id}/analytics/overview`);
        setMetrics(data.summary);
      } catch (err) {
        console.error('Error loading overview:', err);
      }
    };
    loadOverview();
  }, [activeOrg]);

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8">
      <div className="bg-gradient-to-r from-blue-700 via-indigo-700 to-purple-800 rounded-3xl p-8 text-white shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="space-y-2 max-w-xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-xs font-bold text-blue-200 backdrop-blur-sm">
            <Sparkles className="w-3.5 h-3.5" /> Data-First Chatbot Platform
          </div>
          <h1 className="text-3xl font-black tracking-tight">Welcome to {activeOrg?.name || 'hola.ai'}</h1>
          <p className="text-sm text-blue-100 leading-relaxed">
            Your chatbots answer customer questions strictly using your uploaded JSON records and business documents before considering external AI models.
          </p>
        </div>

        <div className="flex gap-3">
          <button
            onClick={() => navigate('/chatbots')}
            className="px-5 py-3 bg-white text-blue-700 font-bold text-sm rounded-xl hover:bg-blue-50 shadow-lg transition-all"
          >
            Manage Chatbots
          </button>
          <button
            onClick={() => navigate('/knowledge')}
            className="px-5 py-3 bg-blue-600/80 hover:bg-blue-600 text-white font-bold text-sm rounded-xl backdrop-blur-sm transition-all"
          >
            Upload Business Data
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-2">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-bold uppercase tracking-wider">Total Chatbots</span>
            <Bot className="w-5 h-5 text-blue-600" />
          </div>
          <div className="text-3xl font-black text-slate-900">{metrics?.totalChatbots || 0}</div>
          <span className="text-xs text-emerald-600 font-semibold">Active in workspace</span>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-2">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-bold uppercase tracking-wider">Conversations</span>
            <MessageSquare className="w-5 h-5 text-indigo-600" />
          </div>
          <div className="text-3xl font-black text-slate-900">{metrics?.totalConversations || 0}</div>
          <span className="text-xs text-slate-500">This billing period</span>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-2">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-bold uppercase tracking-wider">Answer Accuracy</span>
            <TrendingUp className="w-5 h-5 text-emerald-600" />
          </div>
          <div className="text-3xl font-black text-slate-900">{metrics?.resolutionRatePercent || 100}%</div>
          <span className="text-xs text-emerald-600 font-semibold">Data-matched responses</span>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-2">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-bold uppercase tracking-wider">Unanswered Queries</span>
            <ShieldCheck className="w-5 h-5 text-amber-600" />
          </div>
          <div className="text-3xl font-black text-slate-900">{metrics?.unansweredCount || 0}</div>
          <span className="text-xs text-slate-500">Review in inbox</span>
        </div>
      </div>
    </div>
  );
};
