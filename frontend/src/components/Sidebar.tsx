import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard, Radio, Headphones, Users, Sparkles,
  BookOpen, Search, Bot, Zap, MessageSquareQuote,
  BarChart3, ShieldCheck, Scale, Settings, LogOut, UserCircle
} from 'lucide-react';
import { useI18n } from '../contexts/I18nContext';

interface SidebarProps {
  user: { id: number; email: string; full_name: string; role: string } | null;
  onLogout: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ user, onLogout }) => {
  const { t } = useI18n();

  const navItems = [
    { path: '/', label: t.dashboard, icon: LayoutDashboard },
    { path: '/live', label: t.liveConversations, icon: Radio, badge: 'Live' },
    { path: '/workspace', label: t.agentWorkspace, icon: Headphones },
    { path: '/customers', label: t.customer360, icon: Users },
    { path: '/coach', label: t.aiCoach, icon: Sparkles },
    { path: '/knowledge', label: t.knowledgeBase, icon: BookOpen },
    { path: '/knowledge-search', label: t.knowledgeQuery, icon: Search },
    { path: '/agentic-ai', label: t.agenticAi, icon: Bot },
    { path: '/autonomous-resolution', label: t.autonomousResolution, icon: Zap },
    { path: '/omnichannel', label: t.omnichannel, icon: MessageSquareQuote },
    { path: '/analytics', label: t.analytics, icon: BarChart3 },
    { path: '/security', label: t.securityPii, icon: ShieldCheck },
    { path: '/governance', label: t.aiGovernance, icon: Scale },
    { path: '/settings', label: t.settings, icon: Settings },
  ];

  const roleBadgeColor = {
    ADMIN: 'bg-purple-500/20 text-purple-300 border-purple-500/30',
    SUPERVISOR: 'bg-sky-500/20 text-sky-300 border-sky-500/30',
    AGENT: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
  }[user?.role || 'AGENT'] || 'bg-slate-500/20 text-slate-300 border-slate-500/30';

  return (
    <aside className="w-64 bg-slate-900 border-r border-slate-800 flex flex-col h-screen shrink-0">
      {/* Brand Header */}
      <div className="p-4 border-b border-slate-800 flex items-center gap-3">
        <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-600 to-sky-500 flex items-center justify-center shadow-lg shadow-indigo-500/20 text-white font-bold text-lg">
          AI
        </div>
        <div>
          <h1 className="font-semibold text-sm text-white tracking-tight leading-tight">AI Contact Center</h1>
          <p className="text-[11px] text-slate-400">Intelligent CX Platform</p>
        </div>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 overflow-y-auto p-3 space-y-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.path === '/'}
              className={({ isActive }) =>
                `flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium transition-all ${
                  isActive
                    ? 'bg-indigo-600 text-white shadow-sm shadow-indigo-600/30'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                }`
              }
            >
              <div className="flex items-center gap-2.5">
                <Icon className="w-4 h-4" />
                <span>{item.label}</span>
              </div>
              {item.badge && (
                <span className="px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider rounded bg-rose-500 text-white animate-pulse">
                  {item.badge}
                </span>
              )}
            </NavLink>
          );
        })}
      </nav>

      {/* Bottom Autonomy Status */}
      <div className="p-3 border-t border-slate-800 bg-slate-950/40">
        <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800 text-xs">
          <div className="flex items-center justify-between text-slate-400 mb-1">
            <span className="text-[11px] font-medium">{t.autonomyEngine}</span>
            <span className="text-emerald-400 flex items-center gap-1 font-mono text-[10px]">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping"></span>
              {t.guardrailsActive}
            </span>
          </div>
          <p className="text-[11px] text-slate-400">{t.policyReversal}</p>
        </div>
      </div>

      {/* User Profile + Logout Footer */}
      <div className="p-3 border-t border-slate-800 bg-slate-950/60">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center shrink-0">
            <UserCircle className="w-5 h-5 text-indigo-400" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-medium text-white truncate">{user?.full_name || 'Contact Center Agent'}</p>
            <span className={`text-[10px] px-1.5 py-0.5 rounded border font-medium inline-block ${roleBadgeColor}`}>
              {user?.role || 'AGENT'}
            </span>
          </div>
          <button
            onClick={onLogout}
            title={t.signOut}
            className="p-1.5 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 transition-all cursor-pointer"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </aside>
  );
};
