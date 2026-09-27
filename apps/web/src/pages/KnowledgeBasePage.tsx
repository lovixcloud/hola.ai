import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { Database, Plus, FileJson, FileText, Search, CheckCircle2, RotateCw, Sparkles } from 'lucide-react';

export const KnowledgeBasePage: React.FC = () => {
  const { activeOrg, apiCall } = useApp();
  const [sources, setSources] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);

  const [sourceName, setSourceName] = useState('');
  const [sourceType, setSourceType] = useState<'json' | 'txt' | 'csv' | 'faq'>('json');
  const [rawContent, setRawContent] = useState('');
  const [ingesting, setIngesting] = useState(false);

  const [testQuery, setTestQuery] = useState('');
  const [testResult, setTestResult] = useState<any>(null);
  const [testing, setTesting] = useState(false);

  const loadKnowledgeSources = async () => {
    if (!activeOrg) return;
    try {
      setLoading(true);
      const data = await apiCall(`/api/v1/organizations/${activeOrg.id}/knowledge/sources`);
      setSources(data.sources || []);
    } catch (err) {
      console.error('Error loading sources:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadKnowledgeSources();
  }, [activeOrg]);

  const handleIngest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeOrg || !sourceName || !rawContent) return;
    try {
      setIngesting(true);
      await apiCall(`/api/v1/organizations/${activeOrg.id}/knowledge/sources`, {
        method: 'POST',
        body: JSON.stringify({
          name: sourceName,
          type: sourceType,
          rawContent,
        }),
      });
      setModalOpen(false);
      setSourceName('');
      setRawContent('');
      loadKnowledgeSources();
    } catch (err: any) {
      alert(err.message || 'Ingestion Failed');
    } finally {
      setIngesting(false);
    }
  };

  const handleRunTestQuery = async () => {
    if (!activeOrg || !testQuery.trim()) return;
    try {
      setTesting(true);
      const botData = await apiCall(`/api/v1/organizations/${activeOrg.id}/chatbots`);
      if (!botData.chatbots || botData.chatbots.length === 0) {
        alert('Please create a chatbot first to test RAG retrieval.');
        return;
      }
      const botId = botData.chatbots[0].id;
      const res = await apiCall(`/api/v1/organizations/${activeOrg.id}/chatbots/${botId}/test-query`, {
        method: 'POST',
        body: JSON.stringify({ query: testQuery }),
      });
      setTestResult(res.result);
    } catch (err: any) {
      console.error('Test query error:', err);
    } finally {
      setTesting(false);
    }
  };

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            <Database className="w-7 h-7 text-blue-600" />
            <span>Business Knowledge Base</span>
          </h1>
          <p className="text-sm text-slate-500">
            Upload structured JSON datasets, FAQs, CSVs, and documents to power your chatbot answers.
          </p>
        </div>

        <button
          onClick={() => setModalOpen(true)}
          className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm rounded-xl flex items-center gap-2 shadow-lg shadow-blue-500/20"
        >
          <Plus className="w-4 h-4" />
          <span>Add Knowledge Source</span>
        </button>
      </div>

      <div className="grid grid-cols-12 gap-8">
        <div className="col-span-8 bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-4">
          <h2 className="font-bold text-slate-800 text-base border-b border-slate-100 pb-3 flex items-center justify-between">
            <span>Configured Sources ({sources.length})</span>
            <button onClick={loadKnowledgeSources} className="text-xs text-blue-600 hover:underline flex items-center gap-1">
              <RotateCw className="w-3.5 h-3.5" /> Reload
            </button>
          </h2>

          {loading ? (
            <div className="py-12 text-center text-slate-400">Loading sources...</div>
          ) : sources.length === 0 ? (
            <div className="py-12 text-center text-slate-400 space-y-2">
              <FileJson className="w-10 h-10 mx-auto text-slate-300" />
              <p className="font-semibold text-slate-600">No knowledge sources uploaded yet.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {sources.map((src) => (
                <div key={src.id} className="p-4 rounded-xl border border-slate-200 hover:border-slate-300 bg-slate-50/50 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center font-bold">
                      {src.type === 'json' ? <FileJson className="w-5 h-5" /> : <FileText className="w-5 h-5" />}
                    </div>
                    <div>
                      <span className="font-bold text-sm text-slate-800 block">{src.name}</span>
                      <span className="text-xs text-slate-500">
                        Type: <span className="uppercase font-semibold">{src.type}</span> • {src.recordCount} indexed records
                      </span>
                    </div>
                  </div>

                  <span className="px-2.5 py-1 rounded-full text-xs font-bold uppercase bg-emerald-100 text-emerald-700 flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3" /> Ready
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="col-span-4 bg-slate-900 text-slate-100 rounded-2xl shadow-xl p-6 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 font-bold text-sm text-blue-400 mb-2">
              <Sparkles className="w-4 h-4" />
              <span>RAG Knowledge Test Console</span>
            </div>

            <div className="space-y-3">
              <input
                type="text"
                value={testQuery}
                onChange={(e) => setTestQuery(e.target.value)}
                placeholder="Type query (e.g., return policy)..."
                className="w-full px-3.5 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white outline-none focus:border-blue-500"
              />
              <button
                onClick={handleRunTestQuery}
                disabled={testing}
                className="w-full py-2 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-2"
              >
                <Search className="w-3.5 h-3.5" />
                <span>{testing ? 'Searching Knowledge...' : 'Test Knowledge Search'}</span>
              </button>
            </div>
          </div>

          {testResult && (
            <div className="mt-4 p-3.5 bg-slate-800/80 rounded-xl border border-slate-700/80 text-xs space-y-2">
              <div className="font-bold text-emerald-400">Answer Output:</div>
              <p className="text-slate-200 leading-relaxed max-h-36 overflow-y-auto">{testResult.answer}</p>
            </div>
          )}
        </div>
      </div>

      {modalOpen && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl">
            <h3 className="font-bold text-lg text-slate-800 mb-4">Add Knowledge Source</h3>

            <form onSubmit={handleIngest} className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase text-slate-500 mb-1">Source Name</label>
                <input
                  type="text"
                  value={sourceName}
                  onChange={(e) => setSourceName(e.target.value)}
                  placeholder="e.g., Product Inventory 2024"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-slate-500 mb-1">Data Type</label>
                <select
                  value={sourceType}
                  onChange={(e) => setSourceType(e.target.value as any)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm bg-white"
                >
                  <option value="json">JSON Array / Object</option>
                  <option value="csv">CSV Spreadsheet</option>
                  <option value="txt">Plain Text / FAQ Document</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-slate-500 mb-1">Content</label>
                <textarea
                  rows={6}
                  value={rawContent}
                  onChange={(e) => setRawContent(e.target.value)}
                  placeholder={sourceType === 'json' ? '[\n  { "sku": "101", "name": "Item A", "price": "$10" }\n]' : 'Paste text here...'}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs font-mono"
                  required
                />
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2 border border-slate-300 rounded-xl font-semibold text-xs text-slate-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={ingesting}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-md"
                >
                  {ingesting ? 'Indexing...' : 'Save & Index'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
