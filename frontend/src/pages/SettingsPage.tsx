import React, { useState, useEffect } from 'react';
import {
  Settings, Bot, Globe, Shield, Database,
  Cpu, CheckCircle2, Lock, Terminal, Sparkles
} from 'lucide-react';
import { api } from '../services/api';
import { Badge } from '../components/Badge';

export const SettingsPage: React.FC = () => {
  const [settingsData, setSettingsData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const data = await api.getSettings();
        setSettingsData(data);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    fetchSettings();
  }, []);

  if (loading || !settingsData) {
    return <p className="text-xs text-slate-500 text-center py-12">Loading system settings...</p>;
  }

  return (
    <div className="space-y-6 pb-12 max-w-5xl">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900 border border-slate-800 p-5 rounded-2xl">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 uppercase">
              Configuration
            </span>
            <span className="text-xs text-slate-400 font-mono">AI Provider & Multi-Language</span>
          </div>
          <h2 className="text-xl font-bold text-white tracking-tight">System Settings & AI Model Provider</h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Switch between deterministic Mock AI for offline demonstrations and Google Gemini for live production inference.
          </p>
        </div>

        <Badge variant={settingsData.status === 'Connected' ? 'success' : 'purple'}>
          {settingsData.status}
        </Badge>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs">
        {/* Active AI Provider Status */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <h3 className="text-sm font-semibold text-white flex items-center gap-2">
              <Bot className="w-4 h-4 text-indigo-400" /> Active AI Provider
            </h3>
            <span className="text-[10px] font-mono text-emerald-400 font-bold">
              {settingsData.status}
            </span>
          </div>

          <div className="space-y-3 font-mono">
            <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between">
              <span className="text-slate-400">Provider:</span>
              <span className="text-white font-bold">{settingsData.ai_provider}</span>
            </div>
            <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between">
              <span className="text-slate-400">Model Engine:</span>
              <span className="text-indigo-400 font-bold">{settingsData.model}</span>
            </div>
            <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between">
              <span className="text-slate-400">API Key Exposure:</span>
              <span className="text-emerald-400 flex items-center gap-1 font-bold">
                <Lock className="w-3 h-3" /> Hidden from Frontend
              </span>
            </div>
          </div>

          {/* Gemini Switch Instructions */}
          <div className="p-3.5 rounded-xl bg-indigo-950/30 border border-indigo-800/40 space-y-1.5 font-sans">
            <span className="text-[11px] font-bold text-indigo-300 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5" /> Switching to Google Gemini
            </span>
            <p className="text-[11px] text-slate-300 leading-relaxed">
              In your <code className="text-indigo-400 bg-slate-950 px-1 py-0.5 rounded font-mono">.env</code> or environment variables, set:
            </p>
            <pre className="p-2 rounded bg-slate-950 text-[10px] font-mono text-emerald-400 overflow-x-auto">
              AI_PROVIDER=gemini&#10;GEMINI_API_KEY=your_gemini_key&#10;GEMINI_MODEL=gemini-2.5-flash
            </pre>
            <p className="text-[10px] text-slate-400">
              The entire React frontend, RAG retriever, and guardrail engine will automatically switch with zero code changes.
            </p>
          </div>
        </div>

        {/* Database, OCR & Localization Settings */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <h3 className="text-sm font-semibold text-white flex items-center gap-2">
              <Database className="w-4 h-4 text-emerald-400" /> Infrastructure & Language
            </h3>
            <span className="text-[10px] font-mono text-slate-400">Architecture</span>
          </div>

          <div className="space-y-3 font-mono">
            <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
              <span className="text-slate-400 block text-[10px]">Database Engine:</span>
              <span className="text-slate-200 font-bold text-xs mt-0.5 block">{settingsData.database}</span>
            </div>
            <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
              <span className="text-slate-400 block text-[10px]">OCR Document Extraction:</span>
              <span className="text-slate-200 font-bold text-xs mt-0.5 block">{settingsData.ocr_service}</span>
            </div>
          </div>

          {/* Languages List */}
          <div>
            <span className="text-[11px] font-bold text-slate-300 block mb-2 flex items-center gap-1.5 font-sans">
              <Globe className="w-3.5 h-3.5 text-indigo-400" /> Supported Localized Dialects
            </span>
            <div className="grid grid-cols-2 gap-2 font-mono">
              {(settingsData.supported_languages || []).map((lang: any) => (
                <div key={lang.code} className="p-2 rounded-lg bg-slate-950 border border-slate-800 flex items-center justify-between">
                  <span className="text-slate-300 font-sans">{lang.name}</span>
                  <span className="text-[10px] text-indigo-400 uppercase font-bold">{lang.code}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
