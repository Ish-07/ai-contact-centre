import React, { useState } from 'react';
import { ShieldAlert, Check, X, Edit3, AlertTriangle, BookOpen } from 'lucide-react';
import { api } from '../services/api';

interface HumanApprovalModalProps {
  isOpen: boolean;
  onClose: () => void;
  decision: any;
  onSuccess: () => void;
}

export const HumanApprovalModal: React.FC<HumanApprovalModalProps> = ({
  isOpen,
  onClose,
  decision,
  onSuccess,
}) => {
  const [notes, setNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);

  if (!isOpen || !decision) return null;

  const handleAction = async (action: 'APPROVE' | 'REJECT' | 'MODIFY') => {
    setSubmitting(true);
    try {
      await api.handleApprovalAction(decision.id, {
        action,
        actor: 'Marcus Vance (Supervisor)',
        notes,
      });
      onSuccess();
      onClose();
    } catch (e) {
      console.error('Failed to submit approval action', e);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="p-5 border-b border-slate-800 bg-amber-950/20 flex items-center gap-3">
          <div className="p-2 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/30">
            <ShieldAlert className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-semibold text-white">Human Approval Required</h3>
            <p className="text-xs text-amber-300/80">Guardrail threshold exceeded • Supervisor authorization needed</p>
          </div>
        </div>

        {/* Details Grid */}
        <div className="p-5 space-y-4 text-xs">
          <div className="grid grid-cols-2 gap-3 p-3 rounded-xl bg-slate-950/60 border border-slate-800">
            <div>
              <span className="text-slate-400">Requested Action</span>
              <p className="text-white font-medium mt-0.5">{decision.decision || decision.action_type}</p>
            </div>
            <div>
              <span className="text-slate-400">Risk Level</span>
              <p className="text-rose-400 font-mono font-bold mt-0.5">{decision.risk_level || 'HIGH'}</p>
            </div>
            <div>
              <span className="text-slate-400">AI Confidence</span>
              <p className="text-indigo-400 font-mono font-bold mt-0.5">
                {Math.round((decision.confidence || 0.95) * 100)}%
              </p>
            </div>
            <div>
              <span className="text-slate-400">Target Customer</span>
              <p className="text-white font-medium mt-0.5">{decision.customer_name || 'Elena Rostova (Gold)'}</p>
            </div>
          </div>

          <div>
            <span className="text-slate-400 font-medium">AI Reasoning</span>
            <p className="text-slate-200 mt-1 p-2.5 rounded-lg bg-slate-950 border border-slate-800/80 leading-relaxed">
              {decision.reason}
            </p>
          </div>

          <div>
            <span className="text-slate-400 font-medium flex items-center gap-1.5 mb-1">
              <BookOpen className="w-3.5 h-3.5 text-indigo-400" />
              Governing Policy Excerpt
            </span>
            <p className="text-slate-300 p-2.5 rounded-lg bg-slate-950 border border-slate-800/80 font-mono text-[11px] leading-relaxed">
              {decision.retrieved_knowledge || 'Refund Policy v3.1: Transactions exceeding $500.00 require dual-key supervisor sign-off.'}
            </p>
          </div>

          <div>
            <label className="text-slate-400 font-medium block mb-1">Supervisor Decision Notes / Justification</label>
            <textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g., Authorized verified duplicate charge settlement."
              className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-white focus:outline-none focus:border-indigo-500 text-xs"
            />
          </div>
        </div>

        {/* Action Buttons */}
        <div className="p-4 border-t border-slate-800 bg-slate-950/40 flex items-center justify-end gap-2">
          <button
            onClick={() => handleAction('REJECT')}
            disabled={submitting}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-rose-950/60 hover:bg-rose-900 border border-rose-800 text-rose-300 text-xs font-medium transition-colors"
          >
            <X className="w-3.5 h-3.5" />
            <span>Reject</span>
          </button>

          <button
            onClick={() => handleAction('MODIFY')}
            disabled={submitting}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium transition-colors"
          >
            <Edit3 className="w-3.5 h-3.5" />
            <span>Request Modification</span>
          </button>

          <button
            onClick={() => handleAction('APPROVE')}
            disabled={submitting}
            className="flex items-center gap-1.5 px-4 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold shadow-sm shadow-emerald-600/30 transition-colors"
          >
            <Check className="w-3.5 h-3.5" />
            <span>Authorize & Execute</span>
          </button>
        </div>
      </div>
    </div>
  );
};
