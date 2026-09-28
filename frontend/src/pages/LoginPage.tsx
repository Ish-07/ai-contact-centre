import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Brain, Shield, Users, ChevronRight, Loader2, Eye, EyeOff, Zap, Bot, ArrowRight } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

const DEMO_ACCOUNTS = [
  {
    role: 'ADMIN',
    email: 'admin@contactcenter.ai',
    password: 'Admin@SecureCC2026!',
    name: 'Sarah Connor',
    title: 'Administrator',
    description: 'Full platform access, AI governance & settings',
    color: 'from-purple-500 to-indigo-600',
    badge: 'bg-purple-500/20 text-purple-300 border-purple-500/30',
    icon: Shield,
  },
  {
    role: 'SUPERVISOR',
    email: 'supervisor@contactcenter.ai',
    password: 'Supervisor@SecureCC2026!',
    name: 'Marcus Vance',
    title: 'Supervisor',
    description: 'Team oversight, approval queue & escalations',
    color: 'from-sky-500 to-blue-600',
    badge: 'bg-sky-500/20 text-sky-300 border-sky-500/30',
    icon: Users,
  },
  {
    role: 'AGENT',
    email: 'agent@contactcenter.ai',
    password: 'Agent@SecureCC2026!',
    name: 'Jessica Taylor',
    title: 'Senior Agent',
    description: 'Customer conversations & AI coaching workspace',
    color: 'from-emerald-500 to-teal-600',
    badge: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
    icon: Brain,
  },
];

export const LoginPage: React.FC = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('admin@contactcenter.ai');
  const [password, setPassword] = useState('Admin@SecureCC2026!');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [activeRole, setActiveRole] = useState<string | null>(null);
  const [error, setError] = useState('');

  const handleLogin = async (eMail: string, pWord: string, roleName?: string) => {
    setError('');
    setLoading(true);
    if (roleName) setActiveRole(roleName);
    try {
      await login(eMail, pWord);
      navigate('/');
    } catch (err: any) {
      setError(err.message || 'Invalid email or password');
    } finally {
      setLoading(false);
      setActiveRole(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await handleLogin(email, password);
  };

  return (
    <div className="min-h-screen bg-slate-950 flex">
      {/* Left Panel - Branding */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-slate-900 via-indigo-950/40 to-slate-900 flex-col justify-between p-12 border-r border-slate-800">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 to-sky-500 flex items-center justify-center shadow-lg shadow-indigo-500/30">
            <Bot className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-white font-bold text-lg tracking-tight">AI Contact Center</h1>
            <p className="text-slate-400 text-xs">Intelligent CX Platform</p>
          </div>
        </div>

        <div className="space-y-8">
          <div>
            <h2 className="text-3xl font-bold text-white leading-tight">
              Transform Customer<br />
              <span className="bg-gradient-to-r from-indigo-400 to-sky-400 bg-clip-text text-transparent">
                Experiences with AI
              </span>
            </h2>
            <p className="mt-4 text-slate-400 text-sm leading-relaxed">
              Agentic AI, real-time coaching, omnichannel intelligence,
              and predictive analytics — all in one unified enterprise platform.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3">
            {[
              { label: 'AI Resolution Rate', value: '87%', icon: '🤖' },
              { label: 'CSAT Score', value: '4.8/5', icon: '⭐' },
              { label: 'Avg Handle Time', value: '-34%', icon: '⚡' },
              { label: 'First Call Resolution', value: '91%', icon: '✅' },
            ].map((stat) => (
              <div key={stat.label} className="p-3 rounded-xl bg-slate-800/60 border border-slate-700/50">
                <div className="text-lg">{stat.icon}</div>
                <div className="text-white font-bold text-lg mt-1">{stat.value}</div>
                <div className="text-slate-400 text-xs">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Zap className="w-4 h-4 text-indigo-400" />
          <span className="text-slate-400 text-xs">Powered by Google Gemini AI & RAG</span>
        </div>
      </div>

      {/* Right Panel - Login Form & Quick Access */}
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-md space-y-6">
          {/* Mobile Logo */}
          <div className="lg:hidden flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 to-sky-500 flex items-center justify-center">
              <Bot className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-white font-bold text-xl">AI Contact Center</h1>
          </div>

          <div>
            <h2 className="text-2xl font-bold text-white">Sign in</h2>
            <p className="text-slate-400 text-sm mt-1">Select a role below for instant 1-click access</p>
          </div>

          {/* 1-Click Instant Demo Login Cards */}
          <div className="space-y-2.5">
            <div className="flex items-center justify-between">
              <p className="text-xs text-slate-400 font-semibold uppercase tracking-wider">
                Instant 1-Click Access
              </p>
              <span className="text-[11px] text-emerald-400 font-mono">No typing required</span>
            </div>

            {DEMO_ACCOUNTS.map((account) => {
              const Icon = account.icon;
              const isCardLoading = loading && activeRole === account.role;
              return (
                <button
                  key={account.role}
                  type="button"
                  disabled={loading}
                  onClick={() => handleLogin(account.email, account.password, account.role)}
                  className="w-full flex items-center gap-3.5 p-3.5 rounded-xl bg-slate-900 border border-slate-800 hover:border-indigo-500/70 hover:bg-slate-800/80 transition-all group text-left relative overflow-hidden cursor-pointer"
                >
                  <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${account.color} flex items-center justify-center shrink-0 shadow-md`}>
                    {isCardLoading ? (
                      <Loader2 className="w-5 h-5 text-white animate-spin" />
                    ) : (
                      <Icon className="w-5 h-5 text-white" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-white text-sm font-semibold group-hover:text-indigo-300 transition-colors">
                        {account.name}
                      </span>
                      <span className={`text-[10px] px-1.5 py-0.5 rounded border font-medium ${account.badge}`}>
                        {account.role}
                      </span>
                    </div>
                    <p className="text-slate-400 text-xs truncate mt-0.5">{account.description}</p>
                  </div>
                  <div className="shrink-0 flex items-center gap-1 text-xs text-indigo-400 group-hover:text-indigo-300 font-medium">
                    <span>Enter</span>
                    <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                  </div>
                </button>
              );
            })}
          </div>

          <div className="relative my-4">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-800" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-slate-950 px-2 text-slate-500 font-mono">or manual credentials</span>
            </div>
          </div>

          {/* Manual Form */}
          <form onSubmit={handleSubmit} className="space-y-4" autoComplete="off">
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1.5">Email address</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoComplete="off"
                placeholder="you@contactcenter.ai"
                className="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white placeholder-slate-600 text-sm focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/30 transition-all"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1.5">Password</label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  autoComplete="off"
                  placeholder="••••••••"
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white placeholder-slate-600 text-sm focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/30 transition-all pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {error && (
              <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-sm">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:bg-indigo-600/50 text-white font-medium text-sm transition-all flex items-center justify-center gap-2 shadow-lg shadow-indigo-600/20 cursor-pointer"
            >
              {loading && !activeRole ? (
                <><Loader2 className="w-4 h-4 animate-spin" /> Signing in...</>
              ) : (
                'Sign in'
              )}
            </button>
          </form>

          <div className="pt-2 border-t border-slate-800/80 flex items-center justify-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
            <p className="text-xs text-slate-500">Demo Environment Active</p>
          </div>
        </div>
      </div>
    </div>
  );
};
