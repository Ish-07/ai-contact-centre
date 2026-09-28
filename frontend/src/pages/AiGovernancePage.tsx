import React, { useState, useEffect } from 'react';
import {
  Scale, ShieldAlert, CheckCircle2, AlertTriangle, FileText,
  Clock, Eye, Sliders, Check, X, Edit3, RefreshCw
} from 'lucide-react';
import { api } from '../services/api';
import { Badge } from '../components/Badge';
import { HumanApprovalModal } from '../components/HumanApprovalModal';

export const AiGovernancePage: React.FC = () => {
  const [decisions, setDecisions] = useState<any[]>([]);
  const [auditLogs, setAuditLogs] = useState<any[]>([]);
  const [policies, setPolicies] = useState<any>(null);
  const [activeTab, setActiveTab] = useState<'DECISIONS' | 'AUDIT' | 'POLICIES'>('DECISIONS');

  // Approval modal
  const [selectedDecision, setSelectedDecision] = useState<any>(null);
  const [approvalModalOpen, setApprovalModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  const fetchGovernanceData = async () => {
    try {
      setLoading(true);
      const [dList, aLogs, pols] = await Promise.all([
        api.getDecisions(),
        api.getAuditLogs(),
        api.getPolicies(),
      ]);
      setDecisions(dList);
      setAuditLogs(aLogs);
      setPolicies(pols);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGovernanceData();
  }, []);

  return (
    <div className="space-y-6 pb-12">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900 border border-slate-800 p-5 rounded-2xl">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 uppercase">
              Responsible AI
            </span>
            <span className="text-xs text-slate-400 font-mono">Immutable Audit Logs & Human Oversight</span>
          </div>
          <h2 className="text-xl font-bold text-white tracking-tight">AI Governance, Guardrails & Decision Auditing</h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Real-time compliance ledger recording AI model inference parameters, policy grounding citations, and human supervisor sign-offs.
          </p>
        </div>

        <button
          onClick={fetchGovernanceData}
          className="p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
          title="Refresh Audit Logs"
        >
          <RefreshCw className="w-4 h-4" />
        </button>
      </div>

      {/* Navigation Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-800 pb-2 text-xs">
        <button
          onClick={() => setActiveTab('DECISIONS')}
          className={`px-4 py-2 rounded-xl font-semibold transition-all ${
            activeTab === 'DECISIONS'
              ? 'bg-indigo-600 text-white shadow-sm'
              : 'text-slate-400 hover:text-white hover:bg-slate-800'
          }`}
        >
          AI Decisions & Approvals ({decisions.length})
        </button>
        <button
          onClick={() => setActiveTab('AUDIT')}
          className={`px-4 py-2 rounded-xl font-semibold transition-all ${
            activeTab === 'AUDIT'
              ? 'bg-indigo-600 text-white shadow-sm'
              : 'text-slate-400 hover:text-white hover:bg-slate-800'
          }`}
        >
          Immutable Audit Log ({auditLogs.length})
        </button>
        <button
          onClick={() => setActiveTab('POLICIES')}
          className={`px-4 py-2 rounded-xl font-semibold transition-all ${
            activeTab === 'POLICIES'
              ? 'bg-indigo-600 text-white shadow-sm'
              : 'text-slate-400 hover:text-white hover:bg-slate-800'
          }`}
        >
          Guardrail Threshold Policies
        </button>
      </div>

      {/* TAB 1: DECISIONS & HUMAN APPROVALS */}
      {activeTab === 'DECISIONS' && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-950/70 border-b border-slate-800 text-slate-400 uppercase text-[10px] tracking-wider font-mono">
                <tr>
                  <th className="py-3 px-4">Decision & Action</th>
                  <th className="py-3 px-4">AI Reason & Grounding</th>
                  <th className="py-3 px-4">Confidence & Risk</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Execution Result</th>
                  <th className="py-3 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/80">
                {decisions.map((d) => (
                  <tr key={d.id} className="hover:bg-slate-800/50 transition-colors">
                    <td className="py-3 px-4">
                      <p className="font-semibold text-white">{d.decision}</p>
                      <span className="text-[10px] text-indigo-400 font-mono">Actor: {d.actor}</span>
                    </td>

                    <td className="py-3 px-4 max-w-xs">
                      <p className="text-slate-300 text-[11px] leading-snug line-clamp-2">{d.reason}</p>
                      <p className="text-[10px] text-slate-500 font-mono mt-1 truncate">
                        Grounded: {d.retrieved_knowledge || 'Policy v3.1'}
                      </p>
                    </td>

                    <td className="py-3 px-4 font-mono">
                      <span className="text-emerald-400 font-bold block">
                        {Math.round(d.confidence * 100)}% Conf
                      </span>
                      <span className={`text-[10px] font-bold ${d.risk_level === 'HIGH' ? 'text-rose-400' : 'text-slate-400'}`}>
                        Risk: {d.risk_level}
                      </span>
                    </td>

                    <td className="py-3 px-4">
                      <Badge variant={
                        d.approval_status === 'AUTO_APPROVED' ? 'success' :
                        d.approval_status === 'APPROVED' ? 'success' :
                        d.approval_status === 'PENDING_HUMAN' ? 'warning' : 'danger'
                      }>
                        {d.approval_status.replace('_', ' ')}
                      </Badge>
                    </td>

                    <td className="py-3 px-4 max-w-xs">
                      <p className="text-slate-400 text-[11px] truncate font-mono">
                        {d.execution_result || 'Pending execution.'}
                      </p>
                    </td>

                    <td className="py-3 px-4 text-right">
                      {d.approval_status === 'PENDING_HUMAN' ? (
                        <button
                          onClick={() => {
                            setSelectedDecision(d);
                            setApprovalModalOpen(true);
                          }}
                          className="px-3 py-1 rounded-lg bg-amber-600 hover:bg-amber-500 text-white font-semibold text-xs shadow-sm"
                        >
                          Review & Sign Off
                        </button>
                      ) : (
                        <span className="text-[11px] text-slate-500 font-mono">Completed</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 2: IMMUTABLE AUDIT LOG */}
      {activeTab === 'AUDIT' && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-950/70 border-b border-slate-800 text-slate-400 uppercase text-[10px] tracking-wider font-mono">
                <tr>
                  <th className="py-3 px-4">Timestamp</th>
                  <th className="py-3 px-4">Actor & Provider</th>
                  <th className="py-3 px-4">Action Taken</th>
                  <th className="py-3 px-4">Reason / Rule</th>
                  <th className="py-3 px-4">Result</th>
                  <th className="py-3 px-4">IP / Hash</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/80">
                {auditLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-800/50 transition-colors font-mono text-[11px]">
                    <td className="py-3 px-4 text-slate-400">
                      {new Date(log.created_at).toLocaleTimeString()}
                    </td>
                    <td className="py-3 px-4">
                      <span className="text-white font-semibold block">{log.actor}</span>
                      <span className="text-indigo-400 text-[10px]">{log.ai_provider}</span>
                    </td>
                    <td className="py-3 px-4 text-slate-200">
                      {log.action}
                    </td>
                    <td className="py-3 px-4 text-slate-400 max-w-xs truncate font-sans">
                      {log.reason || 'Automated policy rule'}
                    </td>
                    <td className="py-3 px-4">
                      <Badge variant={log.result === 'SUCCESS' ? 'success' : 'warning'}>
                        {log.result}
                      </Badge>
                    </td>
                    <td className="py-3 px-4 text-slate-500 text-[10px]">
                      {log.ip_address}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 3: POLICIES */}
      {activeTab === 'POLICIES' && policies && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-sm space-y-4 text-xs">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Sliders className="w-4 h-4 text-indigo-400" /> Active Autonomy Thresholds
            </h3>

            <div className="space-y-3 font-mono">
              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between">
                <span className="text-slate-400">Autonomous Refund Limit:</span>
                <span className="text-emerald-400 font-bold">${policies.autonomous_refund_threshold.toFixed(2)}</span>
              </div>
              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between">
                <span className="text-slate-400">Agent Approval Ceiling:</span>
                <span className="text-amber-400 font-bold">${policies.agent_approval_refund_threshold.toFixed(2)}</span>
              </div>
              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between">
                <span className="text-slate-400">Supervisor Mandatory Threshold:</span>
                <span className="text-rose-400 font-bold">&gt; ${policies.supervisor_threshold.toFixed(2)}</span>
              </div>
              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between">
                <span className="text-slate-400">Minimum AI Confidence:</span>
                <span className="text-indigo-400 font-bold">{Math.round(policies.confidence_threshold * 100)}%</span>
              </div>
            </div>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-sm space-y-4 text-xs">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 text-amber-400" /> Mandatory Human-in-the-Loop Safeguards
            </h3>
            <div className="space-y-2">
              {(policies.mandatory_human_oversight_actions || []).map((act: string, idx: number) => (
                <div key={idx} className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between">
                  <span className="font-mono text-white">{act}</span>
                  <Badge variant="danger">Human Mandatory</Badge>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Human Approval Modal */}
      <HumanApprovalModal
        isOpen={approvalModalOpen}
        onClose={() => setApprovalModalOpen(false)}
        decision={selectedDecision}
        onSuccess={() => fetchGovernanceData()}
      />
    </div>
  );
};
