import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  Bot,
  Database,
  MessageSquare,
  Store,
  BarChart3,
  Code2,
  CreditCard,
  ShieldCheck,
} from 'lucide-react';
import { useApp } from '../context/AppContext';

export const Sidebar: React.FC = () => {
  const { user } = useApp();

  const navItems = [
    { label: 'Overview', path: '/', icon: LayoutDashboard },
    { label: 'My Chatbots', path: '/chatbots', icon: Bot },
    { label: 'Knowledge Base', path: '/knowledge', icon: Database },
    { label: 'Conversations Inbox', path: '/inbox', icon: MessageSquare },
    { label: 'Marketplace', path: '/marketplace', icon: Store },
    { label: 'Analytics', path: '/analytics', icon: BarChart3 },
    { label: 'Developer API', path: '/developer', icon: Code2 },
    { label: 'Billing & Usage', path: '/billing', icon: CreditCard },
  ];

  if (user?.isPlatformAdmin) {
    navItems.push({ label: 'Platform Admin', path: '/admin', icon: ShieldCheck });
  }

  return (
    <aside className="w-64 bg-slate-900 text-slate-300 min-h-screen flex flex-col border-r border-slate-800">
      <div className="p-5 border-b border-slate-800 flex items-center gap-3">
        <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-500 flex items-center justify-center text-white font-black text-lg shadow-lg shadow-blue-500/20">
          h
        </div>
        <div>
          <span className="font-bold text-lg text-white tracking-tight">hola.ai</span>
          <span className="block text-[10px] uppercase font-bold text-blue-400 tracking-wider">Data-First AI</span>
        </div>
      </div>

      <nav className="flex-1 p-3 space-y-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-sm font-medium transition-all ${
                  isActive
                    ? 'bg-blue-600 text-white font-semibold shadow-md shadow-blue-600/30'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                }`
              }
            >
              <Icon className="w-4 h-4" />
              <span>{item.label}</span>
            </NavLink>
          );
        })}
      </nav>

      <div className="p-4 border-t border-slate-800 text-xs text-slate-500 flex justify-between items-center">
        <span>v1.0.0 Production</span>
        <span className="inline-block w-2 h-2 rounded-full bg-emerald-500"></span>
      </div>
    </aside>
  );
};
