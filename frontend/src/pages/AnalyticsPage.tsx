import React, { useState, useEffect } from 'react';
import {
  BarChart3, TrendingUp, Users, Award, AlertTriangle,
  Sparkles, CheckCircle2, ArrowUpRight, HelpCircle
} from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts';
import { api } from '../services/api';
import { Badge } from '../components/Badge';

export const AnalyticsPage: React.FC = () => {
  const [agents, setAgents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAgents = async () => {
      try {
        const data = await api.getAgents();
        setAgents(data);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    fetchAgents();
  }, []);

  const predictions = [
    {
      type: 'Escalation Risk',
      customer: 'Elena Rostova (CUST-1001)',
      risk_level: 'HIGH',
      probability: '78%',
      driver: 'Negative sentiment + repeated contact (3x in 14 days) regarding unresolved billing.',
      recommended_action: 'Immediate supervisor intervention & automated refund reversal.'
    },
    {
      type: 'Customer Churn Risk',
      customer: 'Stefan Meyer (CUST-1018)',
      risk_level: 'HIGH',
      probability: '68%',
      driver: 'Consecutive negative CSAT ratings on shipping delays + high account value.',
      recommended_action: 'Extend personalized 3-month VIP discount retention offer.'
    },
    {
      type: 'Sales Upgrade Opportunity',
      customer: 'Rajesh Patel (CUST-1002)',
      risk_level: 'LOW',
      probability: '84%',
      driver: 'Consistent 10/10 CSAT, high device usage frequency, warranty expiring in 15 days.',
      recommended_action: 'Present 2-year extended warranty package with 15% renewal discount.'
    }
  ];

  return (
    <div className="space-y-6 pb-12">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900 border border-slate-800 p-5 rounded-2xl">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 uppercase">
              Performance Intelligence
            </span>
            <span className="text-xs text-slate-400 font-mono">Agent Leaderboard & Predictive Modeling</span>
          </div>
          <h2 className="text-xl font-bold text-white tracking-tight">Agent Performance Analytics & Predictive Modeling</h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Holistic human-agent productivity tracking paired with predictive customer churn and escalation probability models.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Badge variant="purple">400% Productivity Gain (Documentation Reference)</Badge>
        </div>
      </div>

      {/* Predictive Analytics Cards */}
      <div>
        <h3 className="text-sm font-semibold text-white mb-3 flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-indigo-400" />
          Real-Time Predictive Analytics Radar
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {predictions.map((p, idx) => (
            <div key={idx} className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-sm space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-white">{p.type}</span>
                <Badge variant={p.risk_level === 'HIGH' ? 'danger' : 'success'}>
                  {p.probability} Probability
                </Badge>
              </div>

              <div>
                <span className="text-[10px] text-slate-500 uppercase font-semibold">Target Customer:</span>
                <p className="text-xs font-semibold text-slate-200 mt-0.5">{p.customer}</p>
              </div>

              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-[11px] text-slate-300 leading-relaxed">
                <span className="text-slate-500 font-semibold block mb-1">Key Driver:</span>
                {p.driver}
              </div>

              <div className="pt-2 border-t border-slate-800/80 text-[11px]">
                <span className="text-slate-500 font-semibold">Recommended AI Action:</span>
                <p className="text-indigo-400 font-medium mt-0.5">{p.recommended_action}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Agent Performance Leaderboard */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-sm space-y-4">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div>
            <h3 className="text-sm font-semibold text-white flex items-center gap-2">
              <Award className="w-4 h-4 text-amber-400" /> Human Agent Performance Leaderboard
            </h3>
            <p className="text-xs text-slate-400">Ranked by CSAT, AHT, Resolution Rate, and AI Recommendation Acceptance</p>
          </div>
          <span className="text-xs font-mono text-slate-400">10 Active Human Agents</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-950/70 border-b border-slate-800 text-slate-400 uppercase text-[10px] font-mono">
              <tr>
                <th className="py-3 px-4">Rank & Agent</th>
                <th className="py-3 px-4">Conversations Handled</th>
                <th className="py-3 px-4">Average Handle Time (AHT)</th>
                <th className="py-3 px-4">Resolution Rate</th>
                <th className="py-3 px-4">Customer Satisfaction (CSAT)</th>
                <th className="py-3 px-4">AI Coach Acceptance</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/80">
              {agents.map((agent, idx) => (
                <tr key={agent.id} className="hover:bg-slate-800/50 transition-colors">
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-3">
                      <span className={`w-5 h-5 rounded-full flex items-center justify-center font-bold text-[10px] ${
                        idx === 0 ? 'bg-amber-400 text-slate-950' : idx === 1 ? 'bg-slate-300 text-slate-950' : idx === 2 ? 'bg-amber-700 text-white' : 'bg-slate-800 text-slate-400'
                      }`}>
                        {idx + 1}
                      </span>
                      <div>
                        <p className="font-semibold text-white">{agent.name}</p>
                        <p className="text-[10px] text-slate-400">{agent.skills}</p>
                      </div>
                    </div>
                  </td>

                  <td className="py-3 px-4 font-mono text-white font-semibold">
                    {agent.conversations_handled}
                  </td>

                  <td className="py-3 px-4 font-mono text-slate-300">
                    {agent.avg_handle_time} min
                  </td>

                  <td className="py-3 px-4 font-mono text-emerald-400 font-bold">
                    {agent.resolution_rate}%
                  </td>

                  <td className="py-3 px-4 font-mono text-amber-300 font-bold">
                    {agent.csat} / 10
                  </td>

                  <td className="py-3 px-4 font-mono text-indigo-400 font-bold">
                    {agent.ai_acceptance_rate}%
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
