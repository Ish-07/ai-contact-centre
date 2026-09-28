import React, { useState } from 'react';
import {
  Bot, ShieldCheck, Zap, Activity, CheckCircle2,
  Sliders, Settings2, RefreshCw, AlertTriangle
} from 'lucide-react';
import { Badge } from '../components/Badge';

export const AgenticAiPage: React.FC = () => {
  const [agents, setAgents] = useState([
    {
      id: 1,
      name: 'Autonomous Billing Agent',
      purpose: 'Detects duplicate debits, validates payment gateway hashes, issues instantaneous ledger adjustments.',
      autonomy: 'FULLY_AUTONOMOUS',
      threshold: '$50.00 Limit',
      tasks_completed: 1420,
      success_rate: 98.6,
      human_intervention_rate: 1.4,
      status: 'ACTIVE'
    },
    {
      id: 2,
      name: 'Refund & Financial Agent',
      purpose: 'Applies refund policy rules ($50–$500 requiring agent approval, >$500 supervisor authorization).',
      autonomy: 'SEMI_AUTONOMOUS',
      threshold: 'Agent Gatekeeper',
      tasks_completed: 890,
      success_rate: 96.2,
      human_intervention_rate: 18.5,
      status: 'ACTIVE'
    },
    {
      id: 3,
      name: 'Technical Diagnostic Agent',
      purpose: 'Triages hardware power faults, Bluetooth pairing glitches, and guides customers through resets.',
      autonomy: 'FULLY_AUTONOMOUS',
      threshold: 'Interactive Guides',
      tasks_completed: 2150,
      success_rate: 92.4,
      human_intervention_rate: 7.6,
      status: 'ACTIVE'
    },
    {
      id: 4,
      name: 'Retention & Sales Agent',
      purpose: 'Predicts customer churn and generates personalized next-best-offer coupons and VIP care plans.',
      autonomy: 'SEMI_AUTONOMOUS',
      threshold: 'NBO Policy Rules',
      tasks_completed: 640,
      success_rate: 89.1,
      human_intervention_rate: 22.0,
      status: 'ACTIVE'
    },
    {
      id: 5,
      name: 'Supervisor Escalation Agent',
      purpose: 'Identifies high-risk sentiment trajectories and assembles instant briefing dossiers for human supervisors.',
      autonomy: 'SUPERVISED',
      threshold: 'Human Mandatory',
      tasks_completed: 410,
      success_rate: 99.1,
      human_intervention_rate: 100.0,
      status: 'ACTIVE'
    }
  ]);

  const handleAutonomyChange = (id: number, newAutonomy: string) => {
    setAgents((prev) =>
      prev.map((a) => (a.id === id ? { ...a, autonomy: newAutonomy } : a))
    );
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900 border border-slate-800 p-5 rounded-2xl">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 uppercase">
              Autonomous Systems
            </span>
            <span className="text-xs text-slate-400 font-mono">Multi-Agent Roster & Autonomy Levels</span>
          </div>
          <h2 className="text-xl font-bold text-white tracking-tight">Agentic AI Fleet & Autonomy Configuration</h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Specialized autonomous sub-agents executing domain tasks with configurable guardrails and supervisory intervention gates.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Badge variant="purple">5 Specialized Sub-Agents Operational</Badge>
        </div>
      </div>

      {/* Agents Roster Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {agents.map((agent) => (
          <div
            key={agent.id}
            className="bg-slate-900 border border-slate-800 rounded-2xl p-5 flex flex-col justify-between shadow-sm space-y-4 hover:border-slate-700 transition-all"
          >
            <div>
              <div className="flex items-start justify-between gap-2 mb-3">
                <div className="p-2.5 rounded-xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                  <Bot className="w-5 h-5" />
                </div>
                <Badge variant={agent.autonomy === 'FULLY_AUTONOMOUS' ? 'success' : agent.autonomy === 'SEMI_AUTONOMOUS' ? 'warning' : 'purple'}>
                  {agent.autonomy.replace('_', ' ')}
                </Badge>
              </div>

              <h3 className="text-base font-bold text-white">{agent.name}</h3>
              <p className="text-xs text-slate-400 mt-1 leading-relaxed">{agent.purpose}</p>

              {/* Autonomy Selector */}
              <div className="mt-4 pt-3 border-t border-slate-800/80">
                <label className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block mb-1.5 flex items-center gap-1">
                  <Sliders className="w-3 h-3 text-indigo-400" /> Autonomy Mode
                </label>
                <select
                  value={agent.autonomy}
                  onChange={(e) => handleAutonomyChange(agent.id, e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-xs text-white focus:outline-none focus:border-indigo-500 font-mono"
                >
                  <option value="SUPERVISED">SUPERVISED (Human signs off every action)</option>
                  <option value="SEMI_AUTONOMOUS">SEMI-AUTONOMOUS (Guardrail gated approvals)</option>
                  <option value="FULLY_AUTONOMOUS">FULLY AUTONOMOUS (Automatic under threshold)</option>
                </select>
              </div>

              {/* Performance Metrics */}
              <div className="mt-4 grid grid-cols-3 gap-2 p-3 rounded-xl bg-slate-950 border border-slate-800/80 text-center font-mono">
                <div>
                  <span className="text-[9px] text-slate-500 block uppercase">Tasks Done</span>
                  <span className="text-xs font-bold text-white mt-0.5 block">{agent.tasks_completed}</span>
                </div>
                <div>
                  <span className="text-[9px] text-slate-500 block uppercase">Success</span>
                  <span className="text-xs font-bold text-emerald-400 mt-0.5 block">{agent.success_rate}%</span>
                </div>
                <div>
                  <span className="text-[9px] text-slate-500 block uppercase">Human Gate</span>
                  <span className="text-xs font-bold text-indigo-300 mt-0.5 block">{agent.human_intervention_rate}%</span>
                </div>
              </div>
            </div>

            <div className="pt-2 flex items-center justify-between text-[11px] text-slate-400">
              <span>Policy Threshold:</span>
              <span className="font-mono text-indigo-400 font-semibold">{agent.threshold}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
