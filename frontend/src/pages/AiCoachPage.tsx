import React, { useState } from 'react';
import {
  Sparkles, CheckCircle2, X, AlertTriangle, MessageSquare,
  TrendingUp, Shield, Zap, BookOpen, ThumbsUp, ArrowRight
} from 'lucide-react';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts';
import { Badge } from '../components/Badge';

export const AiCoachPage: React.FC = () => {
  const [recommendations, setRecommendations] = useState([
    {
      id: 1,
      type: 'Apologize & Validate',
      category: 'De-escalation',
      confidence: 0.94,
      script: "I sincerely apologize for the duplicate debit on order #49281. Let me verify the ledger records and issue a credit reversal immediately.",
      reason: "Customer triggered negative sentiment marker ('charged twice'). Empathetic acknowledgment recovers CSAT by 48%.",
      impact: "Reduces churn probability from 68% to 15%.",
      accepted: false,
      dismissed: false
    },
    {
      id: 2,
      type: 'Offer Refund Reversal',
      category: 'Autonomous Action',
      confidence: 0.96,
      script: "Process automated refund of $42.50 to Visa **** 4444 under the low-risk < $50 threshold rule.",
      reason: "Verified duplicate ledger hash #TXN-9024 matches payment transaction #TXN-9025.",
      impact: "Instant first-call resolution with zero chargeback penalty.",
      accepted: false,
      dismissed: false
    },
    {
      id: 3,
      type: 'Offer Premium Support Upgrade',
      category: 'Retention',
      confidence: 0.88,
      script: "Customer has exceeded 3 support contacts this quarter. Offer 3 months complimentary VIP Priority Care.",
      reason: "High-value Gold tier customer at risk of churn.",
      impact: "+22% customer lifetime value expansion.",
      accepted: false,
      dismissed: false
    },
    {
      id: 4,
      type: 'Search Knowledge Base',
      category: 'Grounded QA',
      confidence: 0.92,
      script: "Query Warranty Policy v3.2 (Page 8) regarding replacement guidelines for hardware failure.",
      reason: "Customer mentioned device hardware failure within the 1-year limited warranty.",
      impact: "Provides authoritative grounded answer.",
      accepted: false,
      dismissed: false
    }
  ]);

  const liveSentimentData = [
    { time: '10:00:00', sentiment: 20, mood: 'Frustrated' },
    { time: '10:00:30', sentiment: 15, mood: 'Angry' },
    { time: '10:01:00', sentiment: 45, mood: 'Neutral' },
    { time: '10:01:30', sentiment: 75, mood: 'Calm' },
    { time: '10:02:00', sentiment: 92, mood: 'Delighted' },
  ];

  const handleAccept = (id: number) => {
    setRecommendations((prev) =>
      prev.map((r) => (r.id === id ? { ...r, accepted: true } : r))
    );
  };

  const handleDismiss = (id: number) => {
    setRecommendations((prev) =>
      prev.map((r) => (r.id === id ? { ...r, dismissed: true } : r))
    );
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Top Banner */}
      <div className="flex items-center justify-between bg-slate-900 border border-slate-800 p-5 rounded-2xl">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 uppercase">
              Agent Intelligence
            </span>
            <span className="text-xs text-slate-400 font-mono">Live Coaching & Real-Time Nudges</span>
          </div>
          <h2 className="text-xl font-bold text-white tracking-tight">Real-Time AI Coach & Next-Best Action Engine</h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Continuously evaluates conversational turn-taking, sentiment trajectories, and recommends optimal responses with verified policy grounding.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-right">
            <span className="text-[10px] text-slate-500 uppercase block">Coach Trust Score</span>
            <span className="text-sm font-bold font-mono text-emerald-400">92.3% Acceptance</span>
          </div>
        </div>
      </div>

      {/* Live Sentiment & Mood Shift Monitor */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-semibold text-white">Live Sentiment Journey Timeline</h3>
              <p className="text-xs text-slate-400">Time-series tracking of emotional shift from Frustrated to Delighted</p>
            </div>
            <Badge variant="success">Recovery Rate: +72 pts</Badge>
          </div>
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={liveSentimentData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="time" stroke="#64748b" fontSize={11} />
                <YAxis stroke="#64748b" fontSize={11} domain={[0, 100]} />
                <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px' }} />
                <Line type="monotone" dataKey="sentiment" stroke="#10b981" strokeWidth={3} dot={{ r: 5, fill: '#10b981' }} name="Sentiment Score" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Mood State Card */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-sm flex flex-col justify-between">
          <div>
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-2">
              Current Interaction Mood Model
            </span>
            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-400">Detected Mood:</span>
                <span className="text-sm font-bold font-mono text-emerald-400">Delighted (+0.85)</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-400">Trajectory:</span>
                <span className="text-xs font-semibold text-indigo-300">Rapidly Improving</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-400">Escalation Probability:</span>
                <span className="text-xs font-mono text-emerald-400">12% (LOW)</span>
              </div>
            </div>
          </div>

          <div className="p-3 rounded-xl bg-indigo-950/30 border border-indigo-800/40 text-xs text-indigo-200 mt-4 leading-relaxed">
            AI Coach note: Customer appreciated immediate acknowledgment. Maintain upbeat closing tone.
          </div>
        </div>
      </div>

      {/* Recommended Next-Best Actions Grid */}
      <div>
        <h3 className="text-sm font-semibold text-white mb-3 flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-indigo-400" />
          Active Agent Recommendations
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {recommendations.map((rec) => (
            <div
              key={rec.id}
              className={`p-5 rounded-xl border transition-all flex flex-col justify-between ${
                rec.accepted
                  ? 'bg-emerald-950/20 border-emerald-800/60'
                  : rec.dismissed
                  ? 'bg-slate-900/40 border-slate-800 opacity-60'
                  : 'bg-slate-900 border-slate-800 hover:border-indigo-700/60'
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-white">{rec.type}</span>
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-800 text-slate-300 font-mono">
                      {rec.category}
                    </span>
                  </div>
                  <span className="text-xs font-mono font-bold text-indigo-400">
                    {Math.round(rec.confidence * 100)}% Confidence
                  </span>
                </div>

                <p className="text-xs text-slate-200 bg-slate-950 p-3 rounded-lg border border-slate-800/80 leading-relaxed italic">
                  "{rec.script}"
                </p>

                <div className="mt-3 space-y-1 text-[11px]">
                  <p className="text-slate-400">
                    <span className="text-slate-500 font-medium">Reasoning: </span>
                    {rec.reason}
                  </p>
                  <p className="text-emerald-400 font-medium">
                    <span className="text-slate-500">Expected Impact: </span>
                    {rec.impact}
                  </p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-end gap-2 text-xs">
                {rec.accepted ? (
                  <span className="text-emerald-400 font-semibold flex items-center gap-1">
                    <CheckCircle2 className="w-4 h-4" /> Accepted by Agent
                  </span>
                ) : rec.dismissed ? (
                  <span className="text-slate-500">Dismissed</span>
                ) : (
                  <>
                    <button
                      onClick={() => handleDismiss(rec.id)}
                      className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 font-medium transition-colors"
                    >
                      Dismiss
                    </button>
                    <button
                      onClick={() => handleAccept(rec.id)}
                      className="px-4 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-semibold flex items-center gap-1.5 shadow-sm shadow-indigo-600/30 transition-all"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Accept Suggestion</span>
                    </button>
                  </>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
