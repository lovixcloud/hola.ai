import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { Code2, Key, Copy, Check } from 'lucide-react';

export const DeveloperPage: React.FC = () => {
  const { activeOrg, apiCall } = useApp();
  const [keys, setKeys] = useState<any[]>([]);
  const [keyName, setKeyName] = useState('');
  const [createdKeySecret, setCreatedKeySecret] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const loadDeveloperData = async () => {
    if (!activeOrg) return;
    try {
      const kRes = await apiCall(`/api/v1/organizations/${activeOrg.id}/developer/keys`);
      setKeys(kRes.apiKeys || []);
    } catch (err) {
      console.error('Error loading dev data:', err);
    }
  };

  useEffect(() => {
    loadDeveloperData();
  }, [activeOrg]);

  const handleCreateKey = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeOrg || !keyName) return;
    try {
      const res = await apiCall(`/api/v1/organizations/${activeOrg.id}/developer/keys`, {
        method: 'POST',
        body: JSON.stringify({ name: keyName }),
      });
      setCreatedKeySecret(res.rawSecretKey);
      setKeyName('');
      loadDeveloperData();
    } catch (err: any) {
      alert(err.message || 'Key creation failed');
    }
  };

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8">
      <div>
        <h1 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
          <Code2 className="w-7 h-7 text-blue-600" />
          <span>Developer API & Webhook Management</span>
        </h1>
        <p className="text-sm text-slate-500">
          Manage REST API access keys and register webhook event listeners.
        </p>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
        <h3 className="font-bold text-slate-800 text-base flex items-center gap-2">
          <Key className="w-4 h-4 text-blue-600" />
          <span>API Keys</span>
        </h3>

        <form onSubmit={handleCreateKey} className="flex gap-2">
          <input
            type="text"
            value={keyName}
            onChange={(e) => setKeyName(e.target.value)}
            placeholder="New Key Name (e.g., Backend Integration)"
            className="flex-1 px-3 py-2 border border-slate-300 rounded-xl text-xs outline-none focus:border-blue-600"
            required
          />
          <button type="submit" className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-md">
            Generate Key
          </button>
        </form>

        {createdKeySecret && (
          <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl space-y-2">
            <span className="text-xs font-bold text-emerald-800 block">
              🔑 Save your secret key now! (It will not be displayed again):
            </span>
            <div className="flex items-center justify-between bg-white p-2.5 rounded-lg border border-emerald-300 font-mono text-xs">
              <span className="text-emerald-900">{createdKeySecret}</span>
              <button
                onClick={() => {
                  navigator.clipboard.writeText(createdKeySecret);
                  setCopied(true);
                  setTimeout(() => setCopied(false), 2000);
                }}
                className="text-slate-600 hover:text-slate-900 flex items-center gap-1 font-sans text-[11px]"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? 'Copied!' : 'Copy'}</span>
              </button>
            </div>
          </div>
        )}

        <div className="space-y-2 pt-2">
          {keys.map((k) => (
            <div key={k.id} className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between text-xs">
              <div>
                <span className="font-bold text-slate-800 block">{k.name}</span>
                <span className="font-mono text-slate-400">{k.keyPrefix}...</span>
              </div>
              <span className="text-[10px] text-slate-400">Created {new Date(k.createdAt).toLocaleDateString()}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
