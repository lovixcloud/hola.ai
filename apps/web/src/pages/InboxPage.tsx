import React from 'react';
import { MessageSquare, UserCheck, User, Send } from 'lucide-react';

export const InboxPage: React.FC = () => {
  return (
    <div className="p-8 max-w-7xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
          <MessageSquare className="w-7 h-7 text-blue-600" />
          <span>Conversations Inbox & Live Handoff</span>
        </h1>
        <p className="text-sm text-slate-500">
          Monitor visitor chat sessions, review unanswered questions, and take over live support.
        </p>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden grid grid-cols-12 min-h-[500px]">
        <div className="col-span-4 border-r border-slate-200 p-4 space-y-3">
          <div className="text-xs font-bold uppercase tracking-wider text-slate-400 px-2">Recent Visitor Chats</div>
          <div className="p-3 bg-blue-50 border border-blue-200 rounded-xl cursor-pointer">
            <div className="flex items-center justify-between mb-1">
              <span className="font-bold text-slate-800 text-xs flex items-center gap-1">
                <User className="w-3.5 h-3.5 text-blue-600" />
                <span>Visitor #visitor_test_999</span>
              </span>
              <span className="text-[10px] font-bold uppercase bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full">Open</span>
            </div>
            <p className="text-xs text-slate-600 line-clamp-1">What is your return policy?</p>
          </div>
        </div>

        <div className="col-span-8 p-6 flex flex-col justify-between bg-slate-50">
          <div className="space-y-4">
            <div className="flex items-center justify-between bg-white p-3.5 rounded-xl border border-slate-200">
              <span className="font-bold text-sm text-slate-800">Chat with Visitor #visitor_test_999</span>
              <button className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-lg flex items-center gap-1.5">
                <UserCheck className="w-3.5 h-3.5" />
                <span>Take Over Live Chat</span>
              </button>
            </div>

            <div className="space-y-3">
              <div className="flex justify-start">
                <div className="max-w-[80%] bg-white p-3 rounded-2xl border border-slate-200 text-xs text-slate-800">
                  <span className="font-bold text-blue-600 block mb-0.5">Visitor:</span>
                  What is your return policy?
                </div>
              </div>

              <div className="flex justify-start">
                <div className="max-w-[80%] bg-blue-50 p-3 rounded-2xl border border-blue-200 text-xs text-slate-800">
                  <span className="font-bold text-indigo-600 block mb-0.5">Acme Support Bot (RAG Answer):</span>
                  Acme Store offers a 30-day money-back guarantee on all unopened and gently used items.
                  <div className="mt-1 text-[10px] text-slate-500">📌 Source: Acme Business Policies</div>
                </div>
              </div>
            </div>
          </div>

          <div className="flex gap-2 pt-4 bg-white p-3 rounded-xl border border-slate-200">
            <input
              type="text"
              placeholder="Type human support reply..."
              className="flex-1 px-3 py-1.5 text-xs outline-none"
            />
            <button className="px-4 py-1.5 bg-blue-600 text-white font-bold text-xs rounded-lg flex items-center gap-1">
              <Send className="w-3.5 h-3.5" />
              <span>Send Reply</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
