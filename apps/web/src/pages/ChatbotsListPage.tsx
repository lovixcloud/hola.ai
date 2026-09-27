import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { Bot, Plus, Sliders, ShieldCheck, ChevronRight } from 'lucide-react';

export const ChatbotsListPage: React.FC = () => {
  const { activeOrg, apiCall } = useApp();
  const navigate = useNavigate();
  const [chatbots, setChatbots] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [wizardOpen, setWizardOpen] = useState(false);

  const [newBotName, setNewBotName] = useState('');
  const [newBotPurpose, setNewBotPurpose] = useState('customer_support');
  const [newBotResponseMode, setNewBotResponseMode] = useState('business_data_first');
  const [creating, setCreating] = useState(false);

  const loadChatbots = async () => {
    if (!activeOrg) return;
    try {
      setLoading(true);
      const data = await apiCall(`/api/v1/organizations/${activeOrg.id}/chatbots`);
      setChatbots(data.chatbots || []);
    } catch (err) {
      console.error('Error loading chatbots:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadChatbots();
  }, [activeOrg]);

  const handleCreateChatbot = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeOrg || !newBotName) return;
    try {
      setCreating(true);
      const data = await apiCall(`/api/v1/organizations/${activeOrg.id}/chatbots`, {
        method: 'POST',
        body: JSON.stringify({
          name: newBotName,
          purpose: newBotPurpose,
          responseMode: newBotResponseMode,
        }),
      });
      setWizardOpen(false);
      navigate(`/chatbots/${data.chatbot.id}/builder`);
    } catch (err: any) {
      alert(err.message || 'Creation failed');
    } finally {
      setCreating(false);
    }
  };

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            <Bot className="w-7 h-7 text-blue-600" />
            <span>My Chatbots ({chatbots.length})</span>
          </h1>
          <p className="text-sm text-slate-500">
            Manage your custom branded chatbots, response rules, and deployment embeds.
          </p>
        </div>

        <button
          onClick={() => setWizardOpen(true)}
          className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm rounded-xl flex items-center gap-2 shadow-lg shadow-blue-500/20"
        >
          <Plus className="w-4 h-4" />
          <span>Create New Chatbot</span>
        </button>
      </div>

      {loading ? (
        <div className="py-12 text-center text-slate-400">Loading chatbots...</div>
      ) : chatbots.length === 0 ? (
        <div className="py-16 bg-white rounded-2xl border border-slate-200 text-center space-y-3">
          <Bot className="w-12 h-12 mx-auto text-slate-300" />
          <h3 className="font-bold text-slate-700 text-base">No chatbots created yet</h3>
          <button
            onClick={() => setWizardOpen(true)}
            className="px-4 py-2 bg-blue-600 text-white font-bold text-xs rounded-xl"
          >
            Launch Builder Wizard
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {chatbots.map((bot) => (
            <div
              key={bot.id}
              className="bg-white rounded-2xl border border-slate-200 hover:border-slate-300 shadow-sm hover:shadow-md transition-all p-6 flex flex-col justify-between space-y-4"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
                      <Bot className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="font-bold text-slate-900 text-base">{bot.name}</h3>
                      <span className="text-[11px] text-slate-400">v{bot.version}</span>
                    </div>
                  </div>

                  <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                    bot.status === 'published' ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-600'
                  }`}>
                    {bot.status}
                  </span>
                </div>

                <p className="text-xs text-slate-600 line-clamp-2">{bot.description || 'Custom business chatbot assistant.'}</p>

                <div className="flex flex-wrap gap-1.5 pt-1">
                  <span className="px-2 py-0.5 bg-blue-50 text-blue-700 text-[10px] font-bold rounded-md flex items-center gap-1">
                    <ShieldCheck className="w-3 h-3" />
                    <span>{bot.responseMode.replace(/_/g, ' ')}</span>
                  </span>
                </div>
              </div>

              <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                <button
                  onClick={() => navigate(`/chatbots/${bot.id}/builder`)}
                  className="w-full py-2 bg-slate-50 hover:bg-blue-50 text-slate-700 hover:text-blue-700 font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 transition-colors border border-slate-200"
                >
                  <Sliders className="w-3.5 h-3.5" />
                  <span>Open Visual Builder</span>
                  <ChevronRight className="w-3.5 h-3.5 ml-auto text-slate-400" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {wizardOpen && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl">
            <h3 className="font-bold text-lg text-slate-800 mb-2">Create New Chatbot Wizard</h3>

            <form onSubmit={handleCreateChatbot} className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase text-slate-500 mb-1">Chatbot Name</label>
                <input
                  type="text"
                  value={newBotName}
                  onChange={(e) => setNewBotName(e.target.value)}
                  placeholder="e.g., Acme Customer Support Bot"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-slate-500 mb-1">Primary Purpose</label>
                <select
                  value={newBotPurpose}
                  onChange={(e) => setNewBotPurpose(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm bg-white"
                >
                  <option value="customer_support">Customer Support & FAQs</option>
                  <option value="sales">Sales & Product Recommendations</option>
                  <option value="booking">Reservations & Booking</option>
                  <option value="internal">Internal Team Knowledge</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-slate-500 mb-1">Default Response Mode</label>
                <select
                  value={newBotResponseMode}
                  onChange={(e) => setNewBotResponseMode(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm bg-white font-semibold"
                >
                  <option value="business_data_first">Business Data First (Default)</option>
                  <option value="business_data_only">Business Data Only (Zero External AI Calls)</option>
                  <option value="explicit_global_ai">Explicit Global AI Mode</option>
                </select>
              </div>

              <div className="flex justify-end gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setWizardOpen(false)}
                  className="px-4 py-2 border border-slate-300 rounded-xl font-semibold text-xs text-slate-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={creating}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-md"
                >
                  {creating ? 'Launching Builder...' : 'Continue to Visual Builder →'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
