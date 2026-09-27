import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { Palette, Sliders, Cpu, Layers, Save, Rocket, Code, ArrowLeft, Send, Sparkles, Check, ShieldCheck, Bot } from 'lucide-react';

export const VisualBuilderPage: React.FC = () => {
  const { chatbotId } = useParams();
  const navigate = useNavigate();
  const { activeOrg, apiCall } = useApp();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState<'appearance' | 'behavior' | 'mode' | 'model'>('appearance');
  const [bot, setBot] = useState<any>(null);
  const [embedModalOpen, setEmbedModalOpen] = useState(false);

  const [testMessages, setTestMessages] = useState<Array<{ sender: string; text: string; citations?: any[] }>>([]);
  const [inputTestText, setInputTestText] = useState('');
  const [testingQuery, setTestingQuery] = useState(false);

  const loadChatbot = async () => {
    if (!activeOrg || !chatbotId) return;
    try {
      setLoading(true);
      const data = await apiCall(`/api/v1/organizations/${activeOrg.id}/chatbots/${chatbotId}`);
      setBot(data.chatbot);
      setTestMessages([
        { sender: 'bot', text: data.chatbot.widgetConfig?.welcomeMessage || 'Hello! How can I help you today?' }
      ]);
    } catch (err) {
      console.error('Error loading bot:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadChatbot();
  }, [chatbotId, activeOrg]);

  const handleSave = async () => {
    if (!activeOrg || !bot) return;
    try {
      setSaving(true);
      const updated = await apiCall(`/api/v1/organizations/${activeOrg.id}/chatbots/${bot.id}`, {
        method: 'PUT',
        body: JSON.stringify({
          name: bot.name,
          responseMode: bot.responseMode,
          widgetConfig: bot.widgetConfig,
          behaviorConfig: bot.behaviorConfig,
          modelConfig: bot.modelConfig,
        }),
      });
      setBot(updated.chatbot);
    } catch (err) {
      console.error('Save error:', err);
    } finally {
      setSaving(false);
    }
  };

  const handlePublish = async () => {
    if (!activeOrg || !bot) return;
    try {
      setSaving(true);
      const updated = await apiCall(`/api/v1/organizations/${activeOrg.id}/chatbots/${bot.id}/publish`, {
        method: 'POST',
      });
      setBot(updated.chatbot);
      setEmbedModalOpen(true);
    } catch (err) {
      console.error('Publish error:', err);
    } finally {
      setSaving(false);
    }
  };

  const handleSendTestMessage = async (msgText?: string) => {
    const text = msgText || inputTestText;
    if (!text.trim() || !bot || !activeOrg) return;

    setTestMessages(prev => [...prev, { sender: 'visitor', text }]);
    setInputTestText('');
    setTestingQuery(true);

    try {
      const res = await apiCall(`/api/v1/organizations/${activeOrg.id}/chatbots/${bot.id}/test-query`, {
        method: 'POST',
        body: JSON.stringify({ query: text }),
      });

      setTestMessages(prev => [
        ...prev,
        {
          sender: 'bot',
          text: res.result.answer,
          citations: res.result.citations,
        }
      ]);
    } catch (err) {
      setTestMessages(prev => [
        ...prev,
        { sender: 'bot', text: 'Error executing query test against chatbot knowledge base.' }
      ]);
    } finally {
      setTestingQuery(false);
    }
  };

  if (loading || !bot) {
    return <div className="p-8 text-center text-slate-500">Loading Visual Chatbot Builder...</div>;
  }

  return (
    <div className="flex flex-col h-[calc(100vh-4rem)] bg-slate-100">
      <div className="h-14 bg-white border-b border-slate-200 px-6 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button onClick={() => navigate('/chatbots')} className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-500">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <input
              type="text"
              value={bot.name}
              onChange={(e) => setBot({ ...bot, name: e.target.value })}
              className="font-bold text-slate-800 text-lg bg-transparent border-b border-transparent hover:border-slate-300 focus:border-blue-600 focus:bg-white outline-none px-1 py-0.5"
            />
            <span className="text-xs text-slate-400 ml-2">v{bot.version} ({bot.status})</span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleSave}
            disabled={saving}
            className="px-4 py-2 rounded-lg border border-slate-300 text-slate-700 hover:bg-slate-50 font-semibold text-sm flex items-center gap-2"
          >
            <Save className="w-4 h-4" />
            <span>{saving ? 'Saving...' : 'Save Draft'}</span>
          </button>

          <button
            onClick={handlePublish}
            disabled={saving}
            className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm flex items-center gap-2 shadow-md shadow-blue-500/20"
          >
            <Rocket className="w-4 h-4" />
            <span>Publish Chatbot</span>
          </button>

          <button
            onClick={() => setEmbedModalOpen(true)}
            className="p-2 border border-slate-300 rounded-lg text-slate-600 hover:bg-slate-50"
            title="Embed Code"
          >
            <Code className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="flex-1 grid grid-cols-12 overflow-hidden">
        <div className="col-span-7 bg-white border-r border-slate-200 flex flex-col overflow-hidden">
          <div className="flex border-b border-slate-200 bg-slate-50 px-4">
            <button
              onClick={() => setActiveTab('appearance')}
              className={`px-4 py-3 font-semibold text-sm border-b-2 flex items-center gap-2 ${
                activeTab === 'appearance' ? 'border-blue-600 text-blue-600' : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              <Palette className="w-4 h-4" />
              <span>Graphical Styling</span>
            </button>

            <button
              onClick={() => setActiveTab('behavior')}
              className={`px-4 py-3 font-semibold text-sm border-b-2 flex items-center gap-2 ${
                activeTab === 'behavior' ? 'border-blue-600 text-blue-600' : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              <Sliders className="w-4 h-4" />
              <span>Behavior & Instructions</span>
            </button>

            <button
              onClick={() => setActiveTab('mode')}
              className={`px-4 py-3 font-semibold text-sm border-b-2 flex items-center gap-2 ${
                activeTab === 'mode' ? 'border-blue-600 text-blue-600' : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              <Layers className="w-4 h-4" />
              <span>Response Modes</span>
            </button>

            <button
              onClick={() => setActiveTab('model')}
              className={`px-4 py-3 font-semibold text-sm border-b-2 flex items-center gap-2 ${
                activeTab === 'model' ? 'border-blue-600 text-blue-600' : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              <Cpu className="w-4 h-4" />
              <span>AI Provider Routing</span>
            </button>
          </div>

          <div className="flex-1 p-6 overflow-y-auto space-y-6">
            {activeTab === 'appearance' && (
              <div className="space-y-5">
                <div>
                  <label className="block text-xs font-bold uppercase text-slate-500 mb-1">Widget Display Name</label>
                  <input
                    type="text"
                    value={bot.widgetConfig.displayName}
                    onChange={(e) => setBot({ ...bot, widgetConfig: { ...bot.widgetConfig, displayName: e.target.value } })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm outline-none focus:border-blue-600"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold uppercase text-slate-500 mb-1">Primary Color</label>
                    <div className="flex gap-2">
                      <input
                        type="color"
                        value={bot.widgetConfig.primaryColor}
                        onChange={(e) => setBot({ ...bot, widgetConfig: { ...bot.widgetConfig, primaryColor: e.target.value } })}
                        className="w-10 h-10 rounded border border-slate-300 cursor-pointer p-1"
                      />
                      <input
                        type="text"
                        value={bot.widgetConfig.primaryColor}
                        onChange={(e) => setBot({ ...bot, widgetConfig: { ...bot.widgetConfig, primaryColor: e.target.value } })}
                        className="flex-1 px-3 py-2 border border-slate-300 rounded-lg text-sm font-mono"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase text-slate-500 mb-1">Widget Position</label>
                    <select
                      value={bot.widgetConfig.position}
                      onChange={(e) => setBot({ ...bot, widgetConfig: { ...bot.widgetConfig, position: e.target.value } })}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm bg-white"
                    >
                      <option value="bottom_right">Bottom Right</option>
                      <option value="bottom_left">Bottom Left</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase text-slate-500 mb-1">Header Title Text</label>
                  <input
                    type="text"
                    value={bot.widgetConfig.headerTitle}
                    onChange={(e) => setBot({ ...bot, widgetConfig: { ...bot.widgetConfig, headerTitle: e.target.value } })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase text-slate-500 mb-1">Welcome Greeting Message</label>
                  <textarea
                    rows={3}
                    value={bot.widgetConfig.welcomeMessage}
                    onChange={(e) => setBot({ ...bot, widgetConfig: { ...bot.widgetConfig, welcomeMessage: e.target.value } })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
                  />
                </div>
              </div>
            )}

            {activeTab === 'behavior' && (
              <div className="space-y-5">
                <div>
                  <label className="block text-xs font-bold uppercase text-slate-500 mb-1">System Instructions & Prompt Persona</label>
                  <textarea
                    rows={4}
                    value={bot.behaviorConfig.systemInstructions}
                    onChange={(e) => setBot({ ...bot, behaviorConfig: { ...bot.behaviorConfig, systemInstructions: e.target.value } })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase text-slate-500 mb-1">Fallback Message</label>
                  <textarea
                    rows={2}
                    value={bot.behaviorConfig.fallbackMessage}
                    onChange={(e) => setBot({ ...bot, behaviorConfig: { ...bot.behaviorConfig, fallbackMessage: e.target.value } })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
                  />
                </div>
              </div>
            )}

            {activeTab === 'mode' && (
              <div className="space-y-4">
                <div
                  onClick={() => setBot({ ...bot, responseMode: 'business_data_first' })}
                  className={`p-4 rounded-xl border-2 cursor-pointer transition-all ${
                    bot.responseMode === 'business_data_first' ? 'border-blue-600 bg-blue-50/50' : 'border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-center justify-between font-bold text-slate-800 mb-1">
                    <span className="flex items-center gap-2">
                      <ShieldCheck className="w-5 h-5 text-blue-600" />
                      <span>Business Data First (Default)</span>
                    </span>
                    {bot.responseMode === 'business_data_first' && <Check className="w-5 h-5 text-blue-600" />}
                  </div>
                  <p className="text-xs text-slate-600">
                    Searches business JSON, files, and knowledge base first. Answers strictly based on business facts and provides citations.
                  </p>
                </div>

                <div
                  onClick={() => setBot({ ...bot, responseMode: 'business_data_only' })}
                  className={`p-4 rounded-xl border-2 cursor-pointer transition-all ${
                    bot.responseMode === 'business_data_only' ? 'border-blue-600 bg-blue-50/50' : 'border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-center justify-between font-bold text-slate-800 mb-1">
                    <span className="flex items-center gap-2">
                      <Bot className="w-5 h-5 text-indigo-600" />
                      <span>Business Data Only (Zero External AI Calls)</span>
                    </span>
                    {bot.responseMode === 'business_data_only' && <Check className="w-5 h-5 text-blue-600" />}
                  </div>
                  <p className="text-xs text-slate-600">
                    Strict privacy mode. Never calls external AI model providers.
                  </p>
                </div>
              </div>
            )}

            {activeTab === 'model' && (
              <div className="space-y-5">
                <div>
                  <label className="block text-xs font-bold uppercase text-slate-500 mb-1">AI Provider Adapter</label>
                  <select
                    value={bot.modelConfig.provider}
                    onChange={(e) => setBot({ ...bot, modelConfig: { ...bot.modelConfig, provider: e.target.value } })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm bg-white"
                  >
                    <option value="mock">Local / Mock Provider (No API Key needed)</option>
                    <option value="openai">OpenAI (GPT-4o)</option>
                    <option value="anthropic">Anthropic (Claude 3.5)</option>
                    <option value="google">Google Gemini</option>
                  </select>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="col-span-5 bg-slate-100 p-6 flex flex-col items-center justify-center relative">
          <div className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3 flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            <span>Live Chatbot Preview & Testing</span>
          </div>

          <div
            className="w-[360px] h-[520px] bg-white rounded-2xl shadow-xl border border-slate-200 flex flex-col overflow-hidden"
            style={{ fontFamily: bot.widgetConfig.fontFamily }}
          >
            <div
              className="p-4 text-white flex items-center justify-between"
              style={{ backgroundColor: bot.widgetConfig.primaryColor }}
            >
              <div className="flex items-center gap-2 font-bold text-sm">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400"></span>
                <span>{bot.widgetConfig.headerTitle}</span>
              </div>
              <span className="text-xs opacity-75">Preview</span>
            </div>

            <div className="flex-1 p-4 overflow-y-auto bg-slate-50 space-y-3">
              {testMessages.map((msg, idx) => (
                <div
                  key={idx}
                  className={`flex ${msg.sender === 'visitor' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[82%] px-3.5 py-2.5 rounded-2xl text-xs leading-relaxed ${
                      msg.sender === 'visitor' ? 'bg-blue-600 text-white rounded-br-none' : 'bg-white text-slate-800 border border-slate-200 shadow-sm rounded-bl-none'
                    }`}
                  >
                    <div>{msg.text}</div>
                    {msg.citations && msg.citations.length > 0 && (
                      <div className="mt-1.5 pt-1 border-t border-slate-100 text-[10px] text-slate-500 italic">
                        📌 Source: {msg.citations[0].title}
                      </div>
                    )}
                  </div>
                </div>
              ))}
              {testingQuery && (
                <div className="text-xs text-slate-400 italic">Chatbot is searching business knowledge...</div>
              )}
            </div>

            <div className="p-3 bg-white border-t border-slate-200 flex gap-2">
              <input
                type="text"
                value={inputTestText}
                onChange={(e) => setInputTestText(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSendTestMessage()}
                placeholder={bot.widgetConfig.inputPlaceholder}
                className="flex-1 px-3 py-1.5 border border-slate-200 rounded-xl text-xs outline-none focus:border-blue-600"
              />
              <button
                onClick={() => handleSendTestMessage()}
                className="px-3 py-1.5 rounded-xl text-white text-xs font-bold"
                style={{ backgroundColor: bot.widgetConfig.primaryColor }}
              >
                <Send className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {embedModalOpen && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl">
            <h3 className="font-bold text-lg text-slate-800 mb-2">Publish & Embed Chatbot</h3>
            <p className="text-xs text-slate-600 mb-4">
              Copy and paste this script tag into your HTML website before the closing <code className="bg-slate-100 px-1 py-0.5 rounded">&lt;/body&gt;</code> tag:
            </p>

            <pre className="p-4 bg-slate-900 text-slate-100 rounded-xl text-xs font-mono overflow-x-auto mb-6">
              {`<script
  src="http://localhost:3000/widget.iife.js"
  data-embed-id="${bot.publicEmbedId}">
</script>`}
            </pre>

            <div className="flex justify-end gap-3">
              <button
                onClick={() => setEmbedModalOpen(false)}
                className="px-4 py-2 bg-slate-200 hover:bg-slate-300 rounded-xl font-semibold text-xs text-slate-800"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
