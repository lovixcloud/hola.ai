import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { ShieldCheck, FileText } from 'lucide-react';

export const AdminPage: React.FC = () => {
  const { apiCall } = useApp();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadAdmin = async () => {
      try {
        setLoading(true);
        const res = await apiCall('/api/v1/admin/overview');
        setData(res);
      } catch (err) {
        console.error('Error loading admin overview:', err);
      } finally {
        setLoading(false);
      }
    };
    loadAdmin();
  }, []);

  if (loading || !data) {
    return <div className="p-8 text-center text-slate-400">Loading platform admin data...</div>;
  }

  const { platformMetrics, recentAuditLogs } = data;

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8">
      <div>
        <h1 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
          <ShieldCheck className="w-7 h-7 text-indigo-600" />
          <span>Platform Administration Console</span>
        </h1>
        <p className="text-sm text-slate-500">
          Global platform health, multi-tenant auditing, and security compliance overview.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <span className="text-xs font-bold text-slate-400 uppercase">System Status</span>
          <div className="text-2xl font-black text-emerald-600 flex items-center gap-2 mt-1">
            <span className="w-3 h-3 rounded-full bg-emerald-500 animate-pulse"></span>
            <span>Healthy</span>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <span className="text-xs font-bold text-slate-400 uppercase">Total Organizations</span>
          <div className="text-3xl font-black text-slate-900 mt-1">{platformMetrics.totalOrganizations}</div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <span className="text-xs font-bold text-slate-400 uppercase">Marketplace Templates</span>
          <div className="text-3xl font-black text-slate-900 mt-1">{platformMetrics.totalMarketplaceListings}</div>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
        <h3 className="font-bold text-slate-800 text-base flex items-center gap-2">
          <FileText className="w-4 h-4 text-indigo-600" />
          <span>Platform Security Audit Logs</span>
        </h3>

        <div className="space-y-2">
          {recentAuditLogs?.map((log: any) => (
            <div key={log.id} className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between text-xs">
              <div className="space-y-0.5">
                <span className="font-bold text-slate-800">{log.action}</span>
                <span className="text-slate-500 block">Resource: {log.resourceType}</span>
              </div>
              <span className="text-[10px] text-slate-400">{new Date(log.createdAt).toLocaleString()}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
