import React from 'react';
import { useApp } from '../context/AppContext';
import { Building2, ChevronDown, LogOut } from 'lucide-react';

export const Header: React.FC = () => {
  const { user, activeOrg, organizations, setActiveOrg, logout } = useApp();

  return (
    <header className="h-16 bg-white border-b border-slate-200 px-6 flex items-center justify-between">
      <div className="flex items-center gap-3">
        <div className="relative group">
          <button className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-slate-200 hover:border-slate-300 bg-slate-50 text-slate-800 text-sm font-semibold transition-all">
            <Building2 className="w-4 h-4 text-blue-600" />
            <span>{activeOrg ? activeOrg.name : 'Select Workspace'}</span>
            <span className="text-[10px] px-1.5 py-0.5 rounded bg-blue-100 text-blue-700 font-bold uppercase">
              {activeOrg?.planTier || 'free'}
            </span>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
          </button>

          <div className="absolute left-0 mt-1 w-56 bg-white border border-slate-200 rounded-xl shadow-lg opacity-0 group-hover:opacity-100 pointer-events-none group-hover:pointer-events-auto transition-all duration-150 z-50 p-1">
            <div className="px-3 py-2 text-[11px] font-bold uppercase tracking-wider text-slate-400 border-b border-slate-100">
              Your Workspaces
            </div>
            {organizations.map((org) => (
              <button
                key={org.id}
                onClick={() => setActiveOrg(org)}
                className={`w-full text-left px-3 py-2 text-sm rounded-lg flex items-center justify-between transition-colors ${
                  activeOrg?.id === org.id ? 'bg-blue-50 text-blue-700 font-medium' : 'text-slate-700 hover:bg-slate-50'
                }`}
              >
                <span>{org.name}</span>
                <span className="text-[10px] uppercase font-bold text-slate-400">{org.myRole || 'member'}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-slate-200 text-slate-700 flex items-center justify-center font-bold text-xs">
            {user?.displayName ? user.displayName.slice(0, 2).toUpperCase() : 'US'}
          </div>
          <div className="text-left hidden sm:block">
            <span className="block text-xs font-semibold text-slate-800">{user?.displayName}</span>
            <span className="block text-[10px] text-slate-500">{user?.email}</span>
          </div>
        </div>

        <button
          onClick={logout}
          className="p-2 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-slate-100 transition-colors"
          title="Sign out"
        >
          <LogOut className="w-4 h-4" />
        </button>
      </div>
    </header>
  );
};
