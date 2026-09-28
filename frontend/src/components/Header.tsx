import React, { useState, useEffect } from 'react';
import {
  Search, Play, Pause, RotateCcw, Globe, LogOut
} from 'lucide-react';
import { api } from '../services/api';
import { useI18n } from '../contexts/I18nContext';

interface HeaderProps {
  onOpenSearch: () => void;
  selectedLang: string;
  onSelectLang: (lang: string) => void;
  user?: { id: number; email: string; full_name: string; role: string } | null;
  onLogout?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  onOpenSearch,
  selectedLang,
  onSelectLang,
  user,
  onLogout,
}) => {
  const { t } = useI18n();
  const [simStatus, setSimStatus] = useState<any>({ is_running: false, is_paused: false, current_step: 0 });
  const [loading, setLoading] = useState(false);

  const fetchStatus = async () => {
    try {
      const data = await api.getSimulationStatus();
      setSimStatus(data);
    } catch (e) {
      // ignore
    }
  };

  useEffect(() => {
    fetchStatus();
    const interval = setInterval(fetchStatus, 3000);
    return () => clearInterval(interval);
  }, []);

  const handleStart = async () => {
    setLoading(true);
    await api.startSimulation();
    await fetchStatus();
    setLoading(false);
  };

  const handlePause = async () => {
    await api.pauseSimulation();
    await fetchStatus();
  };

  const handleResume = async () => {
    await api.resumeSimulation();
    await fetchStatus();
  };

  const handleReset = async () => {
    await api.resetSimulation();
    await fetchStatus();
  };

  // English and Hindi
  const languages = [
    { code: 'en', label: 'English' },
    { code: 'hi', label: 'हिंदी (Hindi)' },
  ];

  const getInitials = (name?: string) => {
    if (!name) return 'CC';
    const parts = name.trim().split(' ');
    if (parts.length >= 2) return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    return name.slice(0, 2).toUpperCase();
  };

  return (
    <header className="h-14 bg-slate-900 border-b border-slate-800 px-6 flex items-center justify-between shrink-0">
      {/* Search Trigger */}
      <button
        onClick={onOpenSearch}
        className="flex items-center gap-3 px-3 py-1.5 rounded-lg bg-slate-950 border border-slate-800 text-slate-400 hover:text-slate-200 hover:border-slate-700 text-xs w-72 transition-colors"
      >
        <Search className="w-3.5 h-3.5 text-slate-400" />
        <span className="flex-1 text-left truncate">{t.search}</span>
        <kbd className="px-1.5 py-0.5 text-[10px] bg-slate-800 text-slate-300 rounded border border-slate-700 font-mono">
          ⌘K
        </kbd>
      </button>

      {/* Center Simulation Controller */}
      <div className="flex items-center gap-2 bg-slate-950/80 px-3 py-1 rounded-lg border border-slate-800">
        <span className="text-[11px] font-medium text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
          <span className={`w-2 h-2 rounded-full ${simStatus.is_running ? (simStatus.is_paused ? 'bg-amber-400' : 'bg-emerald-400 animate-pulse') : 'bg-slate-500'}`}></span>
          Demo Simulation:
        </span>

        {!simStatus.is_running ? (
          <button
            onClick={handleStart}
            disabled={loading}
            className="flex items-center gap-1 px-2.5 py-1 text-xs font-medium rounded bg-indigo-600 hover:bg-indigo-500 text-white transition-all shadow-sm shadow-indigo-600/30"
          >
            <Play className="w-3 h-3" />
            <span>{t.startSimulation}</span>
          </button>
        ) : simStatus.is_paused ? (
          <button
            onClick={handleResume}
            className="flex items-center gap-1 px-2.5 py-1 text-xs font-medium rounded bg-emerald-600 hover:bg-emerald-500 text-white transition-all"
          >
            <Play className="w-3 h-3" />
            <span>Resume</span>
          </button>
        ) : (
          <button
            onClick={handlePause}
            className="flex items-center gap-1 px-2.5 py-1 text-xs font-medium rounded bg-amber-600 hover:bg-amber-500 text-white transition-all"
          >
            <Pause className="w-3 h-3" />
            <span>{t.pauseSimulation}</span>
          </button>
        )}

        <button
          onClick={handleReset}
          title={t.resetSimulation}
          className="p-1 text-slate-400 hover:text-slate-200 hover:bg-slate-800 rounded transition-colors"
        >
          <RotateCcw className="w-3 h-3" />
        </button>

        {simStatus.is_running && (
          <span className="text-[11px] font-mono text-indigo-400 ml-1">
            Step {simStatus.current_step}/8
          </span>
        )}
      </div>

      {/* Right Controls */}
      <div className="flex items-center gap-3">
        {/* Language Selector */}
        <div className="flex items-center gap-1.5 text-xs text-slate-300 bg-slate-950 px-2.5 py-1 rounded-lg border border-slate-800">
          <Globe className="w-3.5 h-3.5 text-indigo-400" />
          <select
            value={selectedLang}
            onChange={(e) => onSelectLang(e.target.value)}
            className="bg-transparent border-0 text-xs text-slate-200 focus:outline-none cursor-pointer"
          >
            {languages.map((l) => (
              <option key={l.code} value={l.code} className="bg-slate-900 text-slate-200">
                {l.label}
              </option>
            ))}
          </select>
        </div>

        {/* User Profile */}
        <div className="flex items-center gap-2 pl-2 border-l border-slate-800">
          <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-indigo-500 to-sky-400 flex items-center justify-center text-white font-semibold text-xs shadow">
            {getInitials(user?.full_name)}
          </div>
          <div className="text-left hidden md:block">
            <p className="text-xs font-medium text-slate-200 leading-none">{user?.full_name || 'Jessica Taylor'}</p>
            <p className="text-[10px] text-emerald-400 font-mono mt-0.5">{user?.role || 'AGENT'} • ONLINE</p>
          </div>
          {onLogout && (
            <button
              onClick={onLogout}
              title={t.signOut}
              className="ml-1 p-1 text-slate-500 hover:text-rose-400 rounded transition-colors cursor-pointer"
            >
              <LogOut className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>
    </header>
  );
};
