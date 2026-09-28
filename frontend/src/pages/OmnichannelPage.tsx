import React, { useState } from 'react';
import {
  MessageSquare, Phone, Mail, Share2, ArrowRight,
  ShieldCheck, CheckCircle2, User, Clock, Zap
} from 'lucide-react';
import { Badge } from '../components/Badge';

export const OmnichannelPage: React.FC = () => {
  const [activeChannel, setActiveChannel] = useState<'CHAT' | 'VOICE' | 'EMAIL' | 'SOCIAL'>('CHAT');

  const channelHandoffs = [
    {
      step: 1,
      channel: 'CHAT',
      time: '09:42 AM',
      agent: 'Autonomous Billing Bot',
      summary: 'Customer initiated webchat regarding duplicate charge on order #49281. AI masked payment card **** 4444 and verified intent.',
      context_preserved: true
    },
    {
      step: 2,
      channel: 'VOICE',
      time: '10:04 AM',
      agent: 'Jessica Taylor (Human Agent)',
      summary: 'Customer dialed in for verbal confirmation. Voice biometric verified caller (97% match). Agent saw previous chat transcript with zero information repeat.',
      context_preserved: true
    },
    {
      step: 3,
      channel: 'EMAIL',
      time: '10:15 AM',
      agent: 'AI Notification Worker',
      summary: 'Automated receipt and refund confirmation letter dispatched. Linked to Case #CASE-4091 with full audit trail.',
      context_preserved: true
    }
  ];

  return (
    <div className="space-y-6 pb-12">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900 border border-slate-800 p-5 rounded-2xl">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 uppercase">
              Zero Context Loss
            </span>
            <span className="text-xs text-slate-400 font-mono">Unified Customer Experience</span>
          </div>
          <h2 className="text-xl font-bold text-white tracking-tight">Omnichannel Inbox & Seamless Channel Handoff</h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Demonstrating uninterrupted context preservation as a customer transitions across Chat, Voice, Email, and Social media.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="px-3 py-1 rounded-xl bg-emerald-950/60 text-emerald-400 border border-emerald-800 text-xs font-mono font-semibold flex items-center gap-1.5">
            <CheckCircle2 className="w-3.5 h-3.5" />
            Context Preserved
          </span>
        </div>
      </div>

      {/* Channel Switcher */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { id: 'CHAT', label: 'Web & App Chat', icon: MessageSquare, count: 24, active: true },
          { id: 'VOICE', label: 'Inbound / Outbound Voice', icon: Phone, count: 18, active: false },
          { id: 'EMAIL', label: 'Email Tickets', icon: Mail, count: 32, active: false },
          { id: 'SOCIAL', label: 'Social & Messaging', icon: Share2, count: 12, active: false }
        ].map((ch) => {
          const Icon = ch.icon;
          const isSelected = activeChannel === ch.id;
          return (
            <div
              key={ch.id}
              onClick={() => setActiveChannel(ch.id as any)}
              className={`p-4 rounded-2xl border cursor-pointer transition-all ${
                isSelected
                  ? 'bg-indigo-950/30 border-indigo-600 shadow-md shadow-indigo-600/20'
                  : 'bg-slate-900 border-slate-800 hover:border-slate-700'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <div className={`p-2 rounded-xl ${isSelected ? 'bg-indigo-600 text-white' : 'bg-slate-950 text-slate-400'}`}>
                  <Icon className="w-4 h-4" />
                </div>
                <span className="text-xs font-mono font-bold text-white">{ch.count} Active</span>
              </div>
              <h3 className="text-sm font-semibold text-white">{ch.label}</h3>
              <p className="text-[11px] text-slate-400 mt-0.5">Continuous sync active</p>
            </div>
          );
        })}
      </div>

      {/* Cross-Channel Handoff Demonstration */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-sm space-y-6">
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <div>
            <h3 className="text-sm font-bold text-white">Channel Handoff Demonstration: Elena Rostova (#CUST-1001)</h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Customer shifted from Webchat to Voice Call to Email without having to re-explain the issue.
            </p>
          </div>
          <Badge variant="success">Zero Repetition</Badge>
        </div>

        <div className="relative border-l-2 border-indigo-600/60 ml-4 pl-6 space-y-6">
          {channelHandoffs.map((h) => (
            <div key={h.step} className="relative group">
              <div className="absolute -left-[31px] top-1 w-4 h-4 rounded-full bg-indigo-500 border-2 border-slate-900 shadow" />
              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800/80 space-y-2 text-xs">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-white font-mono uppercase">{h.channel} Channel</span>
                    <span className="text-slate-500 font-mono">• {h.time}</span>
                  </div>
                  <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-emerald-950 text-emerald-300 border border-emerald-800">
                    Context Preserved
                  </span>
                </div>

                <p className="text-slate-300 leading-relaxed">{h.summary}</p>

                <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-400 font-mono">
                  <span>Handler: {h.agent}</span>
                  <span className="text-indigo-400">Step {h.step} of 3</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
