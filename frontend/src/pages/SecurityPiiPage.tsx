import React, { useState } from 'react';
import {
  ShieldCheck, Lock, Eye, EyeOff, Play, CheckCircle2,
  AlertTriangle, Phone, CreditCard, Mail, UserCheck
} from 'lucide-react';
import { api } from '../services/api';
import { Badge } from '../components/Badge';

export const SecurityPiiPage: React.FC = () => {
  const [testText, setTestText] = useState(
    "Hello agent, my email is elena.rostova@example.com, my phone number is +1-555-0101, and my card is 4111 2222 3333 4444. My SSN is 123-45-6789."
  );
  const [piiResult, setPiiResult] = useState<any>(null);
  const [scanning, setScanning] = useState(false);
  const [revealPii, setRevealPii] = useState(false);

  // Voice security simulation state
  const [voiceCustomerId, setVoiceCustomerId] = useState('CUST-1001');
  const [voiceAuthResult, setVoiceAuthResult] = useState<any>(null);
  const [simulatingVoice, setSimulatingVoice] = useState(false);

  const handleScanPii = async () => {
    setScanning(true);
    try {
      const res = await api.detectPii(testText);
      setPiiResult(res);
    } catch (e) {
      console.error(e);
    } finally {
      setScanning(false);
    }
  };

  const handleSimulateVoice = async () => {
    setSimulatingVoice(true);
    try {
      const res = await api.simulateVoiceVerification(voiceCustomerId);
      setVoiceAuthResult(res);
    } catch (e) {
      console.error(e);
    } finally {
      setSimulatingVoice(false);
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900 border border-slate-800 p-5 rounded-2xl">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 uppercase">
              Data Privacy & Security
            </span>
            <span className="text-xs text-slate-400 font-mono">Deterministic Redaction & Biometric Simulation</span>
          </div>
          <h2 className="text-xl font-bold text-white tracking-tight">PII Scrubbing Sandbox & Voice Authentication</h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Automatic deterministic detection and masking of sensitive customer data across transcripts and simulated voice identity verification.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Badge variant="success">PII Masking Active</Badge>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* PII Detection Sandbox */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-sm space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <h3 className="text-sm font-semibold text-white flex items-center gap-2">
              <Lock className="w-4 h-4 text-indigo-400" /> PII Detection & Redaction Sandbox
            </h3>
            <button
              onClick={() => setRevealPii(!revealPii)}
              className="flex items-center gap-1 text-xs text-slate-400 hover:text-white"
            >
              {revealPii ? <EyeOff className="w-3.5 h-3.5 text-amber-400" /> : <Eye className="w-3.5 h-3.5" />}
              <span>{revealPii ? 'Mask PII' : 'Reveal with Permission'}</span>
            </button>
          </div>

          <div className="space-y-2">
            <label className="text-xs text-slate-400 block font-medium">Input Raw Customer Message</label>
            <textarea
              rows={3}
              value={testText}
              onChange={(e) => setTestText(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-indigo-500 leading-relaxed"
            />
            <div className="flex justify-end">
              <button
                onClick={handleScanPii}
                disabled={scanning}
                className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs transition-colors shadow-sm"
              >
                {scanning ? 'Scanning...' : 'Scan & Mask PII'}
              </button>
            </div>
          </div>

          {/* Masked Output */}
          {piiResult && (
            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3 text-xs">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-white">Protected Redacted Text</span>
                <span className="font-mono text-[10px] text-indigo-400">
                  {piiResult.entities_count} PII Entities Masked
                </span>
              </div>

              <p className="text-slate-200 leading-relaxed font-sans bg-slate-900/60 p-3 rounded-lg border border-slate-800/80">
                {revealPii ? piiResult.original_text : piiResult.masked_text}
              </p>

              {/* Detected Entities List */}
              <div className="space-y-1.5 pt-2">
                <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider block">
                  Scrubbed Entity Breakdown
                </span>
                {piiResult.detections.map((det: any, idx: number) => (
                  <div key={idx} className="p-2 rounded-lg bg-slate-900 border border-slate-800 flex items-center justify-between text-[11px]">
                    <span className="font-mono text-indigo-400 font-bold">{det.entity_type}</span>
                    <span className="font-mono text-emerald-400">{det.masked_preview}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Voice Security Simulation */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-sm space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <h3 className="text-sm font-semibold text-white flex items-center gap-2">
              <Phone className="w-4 h-4 text-emerald-400" /> Voice Security & Biometrics (Simulation)
            </h3>
            <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-amber-950 text-amber-300 border border-amber-800">
              Simulation Only
            </span>
          </div>

          <p className="text-xs text-slate-400 leading-relaxed">
            Simulates telephony speaker diarization and voiceprint acoustic feature verification for high-risk inbound calls.
          </p>

          <div className="space-y-3">
            <div>
              <label className="text-xs text-slate-400 block mb-1 font-medium">Select Customer ID for Voice Verification</label>
              <div className="flex gap-2">
                <select
                  value={voiceCustomerId}
                  onChange={(e) => setVoiceCustomerId(e.target.value)}
                  className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none"
                >
                  <option value="CUST-1001">Elena Rostova (CUST-1001 - Known Voiceprint)</option>
                  <option value="CUST-1002">Rajesh Patel (CUST-1002 - Known Voiceprint)</option>
                  <option value="CUST-9999">Unknown / Spoofed Caller (CUST-9999 - High Risk)</option>
                </select>

                <button
                  onClick={handleSimulateVoice}
                  disabled={simulatingVoice}
                  className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs transition-colors shadow-sm shrink-0"
                >
                  {simulatingVoice ? 'Analyzing Audio...' : 'Simulate Voice Auth'}
                </button>
              </div>
            </div>

            {voiceAuthResult && (
              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3 text-xs">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-white">Voice Biometric Verification Result</span>
                  <Badge variant={voiceAuthResult.status === 'VERIFIED' ? 'success' : 'danger'}>
                    {voiceAuthResult.status}
                  </Badge>
                </div>

                <div className="grid grid-cols-2 gap-3 font-mono text-[11px]">
                  <div className="p-3 rounded-lg bg-slate-900 border border-slate-800">
                    <span className="text-slate-500 block">Identity Confidence</span>
                    <span className="text-emerald-400 font-bold text-sm mt-0.5 block">
                      {Math.round(voiceAuthResult.identity_confidence * 100)}%
                    </span>
                  </div>
                  <div className="p-3 rounded-lg bg-slate-900 border border-slate-800">
                    <span className="text-slate-500 block">Biometric Risk Score</span>
                    <span className="text-amber-400 font-bold text-sm mt-0.5 block">
                      {voiceAuthResult.risk_score}
                    </span>
                  </div>
                </div>

                <p className="text-slate-300 text-xs italic bg-slate-900/60 p-2.5 rounded-lg border border-slate-800/80">
                  {voiceAuthResult.message}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
