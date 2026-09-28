import React, { useEffect, useState } from 'react';
import {
  LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, AreaChart, Area,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from 'recharts';
import {
  Activity, Users, CheckCircle, Clock, TrendingUp, Sparkles,
  ShieldCheck, HelpCircle, AlertCircle, ArrowUpRight, Zap, RefreshCw
} from 'lucide-react';
import { api } from '../services/api';
import { KPICard } from '../components/KPICard';
import { Badge } from '../components/Badge';

export const DashboardPage: React.FC = () => {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const fetchDashboard = async () => {
    try {
      setLoading(true);
      const res = await api.getDashboard();
      setData(res);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboard();
  }, []);

  if (loading || !data) {
    return (
      <div className="flex items-center justify-center h-full text-slate-400 gap-2">
        <RefreshCw className="w-5 h-5 animate-spin text-indigo-400" />
        <span className="text-sm">Loading Executive Contact Center Dashboard...</span>
      </div>
    );
  }

const { kpi_cards, charts } = data;

  return (
    <div className="space-y-6 pb-12">
      {/* Top Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-gradient-to-r from-indigo-950/60 via-slate-900 to-slate-900 border border-indigo-900/40 p-5 rounded-2xl shadow-sm">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 uppercase tracking-wider">
              Executive AI Overview
            </span>
            <span className="text-xs text-slate-400 font-mono">Real-Time Operational Telemetry</span>
          </div>
          <h2 className="text-xl font-bold text-white tracking-tight">AI Contact Center Intelligence Platform</h2>
          <p className="text-xs text-slate-400 mt-1 max-w-2xl">
            Autonomous issue resolution, real-time agent coaching, and grounded RAG knowledge delivery across all customer channels.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="px-3 py-2 bg-slate-950/80 rounded-xl border border-slate-800 text-right">
            <span className="text-[10px] text-slate-500 uppercase tracking-wider block">Global AI Market Benchmark</span>
            <span className="text-xs font-mono font-bold text-amber-300">{data.market_projection}</span>
          </div>
          <button
            onClick={fetchDashboard}
            className="p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
            title="Refresh Metrics"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {kpi_cards.map((kpi: any, idx: number) => (
          <KPICard
            key={idx}
            title={kpi.title}
            value={kpi.value}
            change={kpi.change}
            changeType={kpi.change_type}
            referenceTag={kpi.reference_tag}
            icon={idx === 0 ? <Activity className="w-4 h-4" /> : idx === 1 ? <Zap className="w-4 h-4" /> : undefined}
          />
        ))}
      </div>

      {/* Section 1: Resolution & Satisfaction Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Resolution Rate (Line) */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-semibold text-white">AI Resolution Rate Trend</h3>
              <p className="text-xs text-slate-400">Autonomous resolution vs human handover</p>
            </div>
            <Badge variant="success">89% Target Exceeded</Badge>
          </div>
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={charts.resolution_rate}>
                <defs>
                  <linearGradient id="aiResGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.4}/>
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="time" stroke="#64748b" fontSize={11} />
                <YAxis stroke="#64748b" fontSize={11} domain={[70, 100]} />
                <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px' }} />
                <Area type="monotone" dataKey="ai_rate" stroke="#6366f1" strokeWidth={2} fillOpacity={1} fill="url(#aiResGrad)" name="AI Resolution %" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Customer Satisfaction (Bar) */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-semibold text-white">CSAT by Day</h3>
              <p className="text-xs text-slate-400">Average customer satisfaction rating (out of 10)</p>
            </div>
            <span className="text-xs font-mono font-semibold text-emerald-400">Avg 8.7 / 10</span>
          </div>
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={charts.customer_satisfaction}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="day" stroke="#64748b" fontSize={11} />
                <YAxis stroke="#64748b" fontSize={11} domain={[7, 10]} />
                <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px' }} />
                <Bar dataKey="csat" fill="#38bdf8" radius={[4, 4, 0, 0]} name="CSAT Score" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* AI vs Human Resolution Distribution (Donut) */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-semibold text-white">Resolution Workload Breakdown</h3>
              <p className="text-xs text-slate-400">Autonomous vs AI-assisted vs Escalated</p>
            </div>
          </div>
          <div className="h-56 flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={charts.ai_vs_human_resolution}
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {charts.ai_vs_human_resolution.map((entry: any, index: number) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px' }} />
                <Legend iconType="circle" wrapperStyle={{ fontSize: '11px', color: '#94a3b8' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Section 2: Operational Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Conversation Volume Trend */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-sm">
          <h3 className="text-sm font-semibold text-white mb-1">Omnichannel Hourly Traffic</h3>
          <p className="text-xs text-slate-400 mb-4">Conversations across Voice, Chat, Email, Social</p>
          <div className="h-52">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={charts.conversation_volume}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="hour" stroke="#64748b" fontSize={11} />
                <YAxis stroke="#64748b" fontSize={11} />
                <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px' }} />
                <Area type="monotone" dataKey="volume" stroke="#0ea5e9" fill="#0ea5e9" fillOpacity={0.2} name="Total Volume" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Sentiment Trend */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-sm">
          <h3 className="text-sm font-semibold text-white mb-1">Live Sentiment Shift</h3>
          <p className="text-xs text-slate-400 mb-4">Percentage positive sentiment over conversation duration</p>
          <div className="h-52">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={charts.sentiment_trend}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="minute" stroke="#64748b" fontSize={11} />
                <YAxis stroke="#64748b" fontSize={11} domain={[0, 100]} />
                <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px' }} />
                <Line type="monotone" dataKey="positive" stroke="#10b981" strokeWidth={2} name="% Positive" />
                <Line type="monotone" dataKey="negative" stroke="#f43f5e" strokeWidth={2} name="% Negative" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Average Handle Time Comparison */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-sm">
          <h3 className="text-sm font-semibold text-white mb-1">Handle Time Reduction (AHT)</h3>
          <p className="text-xs text-slate-400 mb-4">Minutes per session: Legacy vs AI Agent (4.2m benchmark)</p>
          <div className="h-52">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={charts.average_handle_time}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="channel" stroke="#64748b" fontSize={11} />
                <YAxis stroke="#64748b" fontSize={11} />
                <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px' }} />
                <Bar dataKey="legacy_aht" fill="#475569" radius={[4, 4, 0, 0]} name="Legacy AHT (min)" />
                <Bar dataKey="ai_aht" fill="#6366f1" radius={[4, 4, 0, 0]} name="AI Contact Center (min)" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Section 3: Value Creation & Knowledge Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Sales Conversion */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-sm">
          <h3 className="text-sm font-semibold text-white mb-1">Sales Conversion (+68%)</h3>
          <p className="text-xs text-slate-400 mb-3">Next-Best-Offer acceptance</p>
          <div className="h-44">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={charts.sales_conversion} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis type="number" stroke="#64748b" fontSize={10} />
                <YAxis dataKey="category" type="category" stroke="#64748b" fontSize={9} width={90} />
                <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155' }} />
                <Bar dataKey="with_ai" fill="#10b981" radius={[0, 4, 4, 0]} name="With AI %" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Agent Productivity */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-sm">
          <h3 className="text-sm font-semibold text-white mb-1">Agent Productivity Gain</h3>
          <p className="text-xs text-slate-400 mb-3">Tickets resolved per agent / mo</p>
          <div className="h-44">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={charts.agent_productivity}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="month" stroke="#64748b" fontSize={11} />
                <YAxis stroke="#64748b" fontSize={11} />
                <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155' }} />
                <Line type="monotone" dataKey="tickets_per_agent" stroke="#a855f7" strokeWidth={2} name="Tickets / Agent" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* AI Recommendation Acceptance */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-sm">
          <h3 className="text-sm font-semibold text-white mb-1">Coach Trust Score (92%)</h3>
          <p className="text-xs text-slate-400 mb-3">Suggestions accepted by agents</p>
          <div className="h-44">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={charts.ai_recommendation_acceptance}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="action_type" stroke="#64748b" fontSize={9} interval={0} angle={-15} textAnchor="end" height={40} />
                <YAxis stroke="#64748b" fontSize={10} domain={[80, 100]} />
                <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155' }} />
                <Bar dataKey="accepted" fill="#6366f1" radius={[4, 4, 0, 0]} name="Accepted %" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Knowledge Query Resolution */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-sm">
          <h3 className="text-sm font-semibold text-white mb-1">RAG Grounded QA Rate</h3>
          <p className="text-xs text-slate-400 mb-3">Queries resolved via docs</p>
          <div className="h-44">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={charts.knowledge_query_resolution}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="category" stroke="#64748b" fontSize={9} interval={0} angle={-15} textAnchor="end" height={40} />
                <YAxis stroke="#64748b" fontSize={10} />
                <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155' }} />
                <Bar dataKey="resolved" fill="#0284c7" radius={[4, 4, 0, 0]} name="Resolved" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};
