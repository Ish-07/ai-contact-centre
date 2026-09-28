import React, { useState } from 'react';
import {
  Zap, Play, CheckCircle2, Clock, ShieldAlert,
  AlertTriangle, RotateCcw, FileText, ArrowRight, ShieldCheck
} from 'lucide-react';
import { api } from '../services/api';
import { Badge } from '../components/Badge';
import { HumanApprovalModal } from '../components/HumanApprovalModal';

export const AutonomousResolutionPage: React.FC = () => {
  const [resolutionData, setResolutionData] = useState<any>(null);
  const [testAmount, setTestAmount] = useState<number>(42.50);
  const [executing, setExecuting] = useState(false);
  const [activeStepIndex, setActiveStepIndex] = useState<number>(-1);

  // Approval modal state
  const [approvalModalOpen, setApprovalModalOpen] = useState(false);
  const [selectedDecision, setSelectedDecision] = useState<any>(null);

  const handleRunWorkflow = async (amountToTest = testAmount) => {
    setExecuting(true);
    setActiveStepIndex(0);
    setResolutionData(null);

    try {
      const data = await api.runAutonomousResolution(amountToTest);
      setResolutionData(data);

      // Animate steps sequentially for visual feedback
      for (let i = 0; i < data.steps.length; i++) {
        setActiveStepIndex(i);
        await new Promise((r) => setTimeout(r, 120));
      }

      if (data.requires_human_approval) {
        setSelectedDecision({
          id: 999,
          decision: `Process refund of $${amountToTest.toFixed(2)}`,
          action_type: 'REFUND',
          reason: `High value refund ($${amountToTest.toFixed(2)}) mandates supervisor verification.`,
          confidence: data.confidence,
          risk_level: data.risk_level,
          customer_name: 'Elena Rostova (CUST-1001)',
          retrieved_knowledge: 'Refund Policy v3.1: Transactions exceeding $500.00 require supervisor sign-off.'
        });
        setApprovalModalOpen(true);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setExecuting(false);
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900 border border-slate-800 p-5 rounded-2xl">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 uppercase">
              14-Step Resolution Engine
            </span>
            <span className="text-xs text-slate-400 font-mono">Agentic AI + Knowledge Grounding</span>
          </div>
          <h2 className="text-xl font-bold text-white tracking-tight">Autonomous Issue Resolution Visualizer</h2>
          <p className="text-xs text-slate-400 mt-0.5">
            End-to-end execution path: from customer query recognition, policy retrieval, duplicate ledger detection to deterministic guardrail authorization.
          </p>
        </div>

        {/* Quick Trigger Controls */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              setTestAmount(42.50);
              handleRunWorkflow(42.50);
            }}
            disabled={executing}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs shadow-sm shadow-indigo-600/30 transition-all shrink-0"
          >
            <Play className="w-3.5 h-3.5" />
            <span>Run Autonomous ($42.50)</span>
          </button>

          <button
            onClick={() => {
              setTestAmount(650.00);
              handleRunWorkflow(650.00);
            }}
            disabled={executing}
            className="flex items-center gap-2 px-3 py-2 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-semibold text-xs shadow-sm transition-all shrink-0"
          >
            <ShieldAlert className="w-3.5 h-3.5" />
            <span>Test High Guardrail ($650)</span>
          </button>
        </div>
      </div>

      {/* Workflow Summary Header */}
      {resolutionData && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs font-mono">
          <div>
            <span className="text-slate-500 uppercase text-[10px] block">Case Number</span>
            <span className="text-indigo-400 font-bold text-sm">{resolutionData.case_number}</span>
          </div>
          <div>
            <span className="text-slate-500 uppercase text-[10px] block">Detected Intent</span>
            <span className="text-white font-bold text-sm">{resolutionData.intent}</span>
          </div>
          <div>
            <span className="text-slate-500 uppercase text-[10px] block">Autonomy Status</span>
            <Badge variant={resolutionData.requires_human_approval ? 'warning' : 'success'}>
              {resolutionData.requires_human_approval ? 'SUPERVISOR APPROVAL' : 'AUTONOMOUS RESOLVED'}
            </Badge>
          </div>
          <div>
            <span className="text-slate-500 uppercase text-[10px] block">AI Confidence</span>
            <span className="text-emerald-400 font-bold text-sm">
              {Math.round(resolutionData.confidence * 100)}%
            </span>
          </div>
        </div>
      )}

      {/* Visual Step-by-Step 14 Steps Pipeline */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-sm">
        <h3 className="text-sm font-semibold text-white mb-6 flex items-center gap-2">
          <Zap className="w-4 h-4 text-indigo-400" />
          Autonomous Resolution Execution Timeline (14 Stages)
        </h3>

        {!resolutionData && !executing ? (
          <div className="text-center py-16 text-slate-500 text-xs">
            Click "Run Autonomous ($42.50)" or "Test High Guardrail ($650)" to observe the live step-by-step workflow execution.
          </div>
        ) : (
          <div className="space-y-4">
            {(resolutionData?.steps || []).map((step: any, idx: number) => {
              const isVisible = idx <= activeStepIndex;
              const isCurrent = idx === activeStepIndex;
              const isBlocked = step.status === 'BLOCKED';

              return (
                <div
                  key={step.step_number}
                  className={`p-3.5 rounded-xl border transition-all text-xs flex items-center justify-between gap-4 ${
                    !isVisible
                      ? 'opacity-20 bg-slate-950 border-slate-800'
                      : isBlocked
                      ? 'bg-amber-950/20 border-amber-800/60'
                      : 'bg-slate-950/80 border-slate-800/90'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-7 h-7 rounded-lg flex items-center justify-center font-mono font-bold text-xs ${
                        isBlocked
                          ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                          : isVisible
                          ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                          : 'bg-slate-800 text-slate-500'
                      }`}
                    >
                      {step.step_number}
                    </div>

                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-white">{step.name}</span>
                        <span className="text-[10px] font-mono text-slate-500">{step.timestamp}</span>
                      </div>
                      <p className="text-[11px] text-slate-300 mt-0.5">{step.result}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 shrink-0">
                    <span className="text-[10px] font-mono text-indigo-400">
                      Conf: {Math.round(step.confidence * 100)}%
                    </span>
                    <Badge variant={isBlocked ? 'warning' : 'success'}>
                      {step.status}
                    </Badge>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Human Approval Modal */}
      <HumanApprovalModal
        isOpen={approvalModalOpen}
        onClose={() => setApprovalModalOpen(false)}
        decision={selectedDecision}
        onSuccess={() => alert('Supervisor authorization recorded in AI Governance audit ledger.')}
      />
    </div>
  );
};
