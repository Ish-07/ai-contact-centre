import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  Users, User, Phone, Mail, Clock, ShoppingBag, ShieldCheck,
  Sparkles, MessageSquare, ArrowRight, CheckCircle2, AlertCircle
} from 'lucide-react';
import { api } from '../services/api';
import { Badge } from '../components/Badge';

export const Customer360Page: React.FC = () => {
  const [searchParams] = useSearchParams();
  const initialId = searchParams.get('id') || 'CUST-1001';

  const [customers, setCustomers] = useState<any[]>([]);
  const [selectedCustomerId, setSelectedCustomerId] = useState<string>(initialId);
  const [customerDetail, setCustomerDetail] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCustomers = async () => {
      try {
        const list = await api.getCustomers();
        setCustomers(list);
      } catch (e) {
        console.error(e);
      }
    };
    fetchCustomers();
  }, []);

  useEffect(() => {
    const fetchDetail = async () => {
      if (!selectedCustomerId) return;
      try {
        setLoading(true);
        const detail = await api.getCustomerDetail(selectedCustomerId);
        setCustomerDetail(detail);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    fetchDetail();
  }, [selectedCustomerId]);

  return (
    <div className="space-y-6 pb-12">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900 border border-slate-800 p-5 rounded-2xl">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-sky-500/20 text-sky-300 border border-sky-500/30 uppercase">
              Customer Intelligence
            </span>
            <span className="text-xs text-slate-400 font-mono">Unified Omnichannel Profile</span>
          </div>
          <h2 className="text-xl font-bold text-white tracking-tight">Customer 360 Experience & Timeline</h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Zero-context-loss history aggregating voice calls, chat transcripts, email threads, order logs, and AI-predicted churn risks.
          </p>
        </div>

        {/* Customer Quick Selector */}
        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-400 font-medium">Select Customer:</span>
          <select
            value={selectedCustomerId}
            onChange={(e) => setSelectedCustomerId(e.target.value)}
            className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-1.5 text-xs text-slate-200 focus:outline-none"
          >
            {customers.map((c) => (
              <option key={c.id} value={c.customer_id}>
                {c.name} ({c.customer_id} - {c.tier})
              </option>
            ))}
          </select>
        </div>
      </div>

      {loading || !customerDetail ? (
        <p className="text-xs text-slate-500 text-center py-12">Loading customer intelligence dossier...</p>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Column 1: Core Dossier */}
          <div className="space-y-5">
            {/* Profile Overview */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-sm space-y-4">
              <div className="flex items-center gap-3.5">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-sky-500 to-indigo-600 flex items-center justify-center font-bold text-white text-xl shadow-lg">
                  {customerDetail.name.charAt(0)}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-lg font-bold text-white">{customerDetail.name}</h3>
                    <Badge variant={customerDetail.tier === 'VIP' ? 'purple' : customerDetail.tier === 'Gold' ? 'warning' : 'default'}>
                      {customerDetail.tier}
                    </Badge>
                  </div>
                  <p className="text-xs text-slate-400 font-mono mt-0.5">{customerDetail.customer_id}</p>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-800/80 space-y-2 text-xs">
                <div className="flex items-center justify-between">
                  <span className="text-slate-400 flex items-center gap-1.5">
                    <Mail className="w-3.5 h-3.5 text-slate-500" /> Email:
                  </span>
                  <span className="text-slate-200 font-mono">{customerDetail.email}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-400 flex items-center gap-1.5">
                    <Phone className="w-3.5 h-3.5 text-slate-500" /> Phone:
                  </span>
                  <span className="text-slate-200 font-mono">{customerDetail.phone}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">Account Lifetime Value:</span>
                  <span className="text-emerald-400 font-mono font-bold">${customerDetail.account_value.toFixed(2)}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">Preferred Channel:</span>
                  <span className="text-slate-200 font-medium">{customerDetail.preferred_channel}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">Language:</span>
                  <span className="text-slate-200 uppercase font-mono">{customerDetail.language}</span>
                </div>
              </div>
            </div>

            {/* AI Insights Dossier */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-sm space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-indigo-400" /> AI Behavioral Insights
                </span>
                <span className="text-[10px] text-indigo-400 font-mono">Agentic Analysis</span>
              </div>
              <div className="space-y-2">
                {(customerDetail.ai_insights || []).map((ins: string, idx: number) => (
                  <div key={idx} className="p-3 rounded-xl bg-indigo-950/30 border border-indigo-800/40 text-xs text-indigo-200 leading-relaxed">
                    • {ins}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Column 2: Omnichannel Interaction Timeline */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-sm flex flex-col">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-semibold text-white flex items-center gap-1.5">
                <Clock className="w-4 h-4 text-slate-400" /> Unified Interaction Timeline
              </h3>
              <span className="text-[10px] font-mono text-emerald-400">Zero Context Loss</span>
            </div>

            <div className="space-y-4 border-l-2 border-slate-800 ml-3 pl-4 flex-1">
              {(customerDetail.recent_interactions || []).map((inter: any, idx: number) => (
                <div key={idx} className="relative group">
                  <div className="absolute -left-[23px] top-1.5 w-3 h-3 rounded-full bg-indigo-500 border-2 border-slate-900 shadow" />
                  <div className="p-3 rounded-xl bg-slate-950 border border-slate-800/80 text-xs space-y-1">
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="font-semibold text-white">{inter.channel} Contact</span>
                      <span className="text-[10px] text-slate-500 font-mono">
                        {new Date(inter.created_at).toLocaleDateString()}
                      </span>
                    </div>
                    <p className="text-slate-300 leading-relaxed">{inter.summary}</p>
                    <div className="pt-1 flex items-center justify-between text-[10px]">
                      <span className="text-slate-500">Recorded Sentiment:</span>
                      <span className="font-medium text-indigo-400">{inter.sentiment}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Column 3: Cases & Purchase History */}
          <div className="space-y-5">
            {/* Open & Historical Cases */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-sm space-y-3">
              <h3 className="text-sm font-semibold text-white flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-emerald-400" /> CRM Support Cases
              </h3>
              <div className="space-y-2">
                {(customerDetail.cases || []).map((cs: any) => (
                  <div key={cs.id} className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-xs space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-indigo-400 font-bold">{cs.case_number}</span>
                      <Badge variant={cs.status === 'RESOLVED' ? 'success' : 'warning'}>
                        {cs.status}
                      </Badge>
                    </div>
                    <p className="text-white font-medium">{cs.title}</p>
                    <span className="text-[10px] text-slate-500">Priority: {cs.priority}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Purchase History */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-sm space-y-3">
              <h3 className="text-sm font-semibold text-white flex items-center gap-1.5">
                <ShoppingBag className="w-4 h-4 text-amber-400" /> Purchase Ledger
              </h3>
              <div className="space-y-2">
                {(customerDetail.purchases || []).map((p: any, idx: number) => (
                  <div key={idx} className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-xs flex items-center justify-between">
                    <div>
                      <p className="font-medium text-white">{p.item}</p>
                      <p className="text-[10px] text-slate-500 font-mono">{p.order_id} • {p.date}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-mono font-bold text-emerald-400">${p.amount.toFixed(2)}</p>
                      <span className="text-[10px] text-slate-400">{p.status}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
