import React, { useState, useEffect, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  Send, Sparkles, BookOpen, ShieldAlert, CheckCircle, Clock,
  User, Bot, Headphones, AlertTriangle, ArrowRight, Check,
  ThumbsUp, ThumbsDown, Copy, RefreshCw, Zap, Eye, EyeOff,
  PhoneCall, ShieldCheck
} from 'lucide-react';
import { api } from '../services/api';
import { wsClient } from '../services/websocket';
import { Badge } from '../components/Badge';
import { HumanApprovalModal } from '../components/HumanApprovalModal';

export const AgentWorkspacePage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const convIdParam = searchParams.get('id');
  const [conversationId, setConversationId] = useState<number>(convIdParam ? parseInt(convIdParam) : 1);

  const [conversation, setConversation] = useState<any>(null);
  const [customer, setCustomer] = useState<any>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [activeRightTab, setActiveRightTab] = useState<'COACH' | 'KNOWLEDGE' | 'SUMMARY'>('COACH');

  // AI Assistant states
  const [coaching, setCoaching] = useState<any>(null);
  const [knowledgeQuery, setKnowledgeQuery] = useState('How long does a refund take?');
  const [knowledgeAnswer, setKnowledgeAnswer] = useState<any>(null);
  const [knowledgeLoading, setKnowledgeLoading] = useState(false);
  const [summaryData, setSummaryData] = useState<any>(null);

  // PII masking reveal toggle
  const [revealPii, setRevealPii] = useState(false);

  // Voice security simulation state
  const [voiceAuth, setVoiceAuth] = useState<any>(null);

  // Human approval modal
  const [approvalModalOpen, setApprovalModalOpen] = useState(false);
  const [selectedDecision, setSelectedDecision] = useState<any>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const fetchWorkspaceData = async (id: number) => {
    try {
      const conv = await api.getConversationDetail(id);
      setConversation(conv);
      setMessages(conv.messages || []);

      if (conv.customer) {
        const custDetail = await api.getCustomerDetail(conv.customer.id);
        setCustomer(custDetail);

        // Fetch simulated voice verification
        const vAuth = await api.simulateVoiceVerification(conv.customer.customer_id);
        setVoiceAuth(vAuth);
      }

      // Fetch AI Coaching
      const coachData = await api.getCoaching(id);
      setCoaching(coachData);
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    if (conversationId) {
      fetchWorkspaceData(conversationId);
    }
  }, [conversationId]);

  // WebSocket Live Subscription
  useEffect(() => {
    const unsub = wsClient.subscribe((event) => {
      if (event.event === 'NEW_MESSAGE' && event.conversation_id === conversationId) {
        setMessages((prev) => [...prev, event.message]);
        if (event.conversation_update) {
          setConversation((prev: any) => ({ ...prev, ...event.conversation_update }));
        }
      } else if (event.event_source === 'SIMULATION_ENGINE') {
        if (event.data?.type === 'NEW_MESSAGE') {
          setMessages((prev) => [
            ...prev,
            {
              id: Date.now(),
              speaker: event.data.speaker,
              content: event.data.content,
              masked_content: event.data.content.replace(/\d{4}-\d{4}-\d{4}-\d{4}/, '**** **** **** 4444'),
              sentiment: 'Frustrated',
              intent: 'Duplicate Billing',
              created_at: new Date().toISOString(),
            },
          ]);
        } else if (event.data?.type === 'AI_COACHING') {
          setCoaching({
            coaching_tip: event.data.coaching_tip,
            empathy_statement: event.data.empathy_statement,
            suggested_actions: [event.data.next_best_action],
            confidence: event.data.confidence,
            current_sentiment: 'Frustrated',
            customer_mood: 'Frustrated',
            intent: 'Duplicate Billing',
            conversation_risk: 'HIGH',
          });
        }
      }
    });
    return unsub;
  }, [conversationId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !conversationId) return;

    const text = newMessage;
    setNewMessage('');

    try {
      await api.sendMessage(conversationId, {
        speaker: 'AGENT',
        content: text,
      });
      // Refresh AI coaching dynamically
      const updatedCoach = await api.getCoaching(conversationId);
      setCoaching(updatedCoach);
    } catch (e) {
      console.error(e);
    }
  };

  const handleRunKnowledgeQuery = async (queryText?: string) => {
    const q = queryText || knowledgeQuery;
    setKnowledgeLoading(true);
    try {
      const res = await api.queryKnowledge(q, conversationId);
      setKnowledgeAnswer(res);
    } catch (e) {
      console.error(e);
    } finally {
      setKnowledgeLoading(false);
    }
  };

  const handleGenerateSummary = async () => {
    try {
      const s = await api.summarizeConversation(conversationId);
      setSummaryData(s);
      setActiveRightTab('SUMMARY');
    } catch (e) {
      console.error(e);
    }
  };

  const handleExecuteResolution = async (amount = 42.50) => {
    try {
      const res = await api.resolveConversation(conversationId, {
        action_type: 'REFUND',
        amount,
        issue: conversation?.subject || 'Duplicate billing charge',
      });

      if (res.requires_human_approval) {
        setSelectedDecision({
          id: res.decision_id,
          decision: `Refund of $${amount.toFixed(2)}`,
          action_type: 'REFUND',
          reason: res.policy_rule,
          confidence: 0.96,
          risk_level: res.risk_level,
          customer_name: customer?.name,
        });
        setApprovalModalOpen(true);
      } else {
        alert(`Autonomous Resolution Successful! ${res.execution_result}`);
        fetchWorkspaceData(conversationId);
      }
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="h-[calc(100vh-5.5rem)] grid grid-cols-12 gap-4 pb-2">
      {/* ================= COLUMN 1: CUSTOMER 360 (Width 3) ================= */}
      <div className="col-span-3 bg-slate-900 border border-slate-800 rounded-2xl flex flex-col overflow-hidden">
        <div className="p-4 border-b border-slate-800 bg-slate-950/50 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <User className="w-4 h-4 text-sky-400" />
            <h3 className="text-xs font-bold text-white uppercase tracking-wider">Customer 360</h3>
          </div>
          {customer && (
            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-indigo-950 text-indigo-300 border border-indigo-800">
              {customer.tier}
            </span>
          )}
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-4 text-xs">
          {customer ? (
            <>
              {/* Profile Card */}
              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800/90 space-y-2">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-sky-500 to-indigo-600 flex items-center justify-center font-bold text-white text-sm shadow">
                    {customer.name.charAt(0)}
                  </div>
                  <div>
                    <h4 className="font-semibold text-white text-sm leading-tight">{customer.name}</h4>
                    <p className="text-[11px] text-slate-400 font-mono">{customer.customer_id}</p>
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-800/80 grid grid-cols-2 gap-2 text-[11px]">
                  <div>
                    <span className="text-slate-500">Account Value:</span>
                    <p className="font-mono text-emerald-400 font-semibold">${customer.account_value.toFixed(2)}</p>
                  </div>
                  <div>
                    <span className="text-slate-500">Preferred Channel:</span>
                    <p className="font-medium text-slate-200">{customer.preferred_channel}</p>
                  </div>
                  <div>
                    <span className="text-slate-500">Language:</span>
                    <p className="font-medium text-slate-200 uppercase">{customer.language}</p>
                  </div>
                  <div>
                    <span className="text-slate-500">Open Tickets:</span>
                    <p className="font-mono text-amber-400 font-semibold">{customer.open_cases_count || 1}</p>
                  </div>
                </div>
              </div>

              {/* Voice Security Biometrics Simulation */}
              {voiceAuth && (
                <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-[11px] font-semibold text-slate-300 flex items-center gap-1">
                      <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" /> Voice Biometrics
                    </span>
                    <span className="text-[9px] font-mono text-amber-400 px-1 py-0.5 rounded bg-amber-950 border border-amber-800">
                      Simulation
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="text-slate-400">Status:</span>
                    <span className="font-mono text-emerald-400 font-bold">{voiceAuth.status}</span>
                  </div>
                  <div className="flex items-center justify-between text-[11px] mt-0.5">
                    <span className="text-slate-400">Match Confidence:</span>
                    <span className="font-mono text-white font-semibold">
                      {Math.round(voiceAuth.identity_confidence * 100)}% (Risk: {voiceAuth.risk_score})
                    </span>
                  </div>
                  <p className="text-[10px] text-slate-500 mt-1 italic leading-tight">{voiceAuth.message}</p>
                </div>
              )}

              {/* AI Insights */}
              <div>
                <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-indigo-400" /> Customer Insights
                </p>
                <div className="space-y-1.5">
                  {(customer.ai_insights || []).map((ins: string, idx: number) => (
                    <div key={idx} className="p-2 rounded-lg bg-indigo-950/30 border border-indigo-800/40 text-[11px] text-indigo-200 leading-snug">
                      • {ins}
                    </div>
                  ))}
                </div>
              </div>

              {/* Recent Omnichannel Timeline */}
              <div>
                <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-slate-400" /> Interaction Timeline
                </p>
                <div className="space-y-2 border-l-2 border-slate-800 ml-2 pl-3">
                  {(customer.recent_interactions || []).slice(0, 3).map((inter: any, idx: number) => (
                    <div key={idx} className="relative">
                      <div className="absolute -left-[17px] top-1 w-2 h-2 rounded-full bg-indigo-500" />
                      <span className="text-[10px] text-slate-500 font-mono">{inter.channel} • 2d ago</span>
                      <p className="text-[11px] text-slate-300 line-clamp-2 mt-0.5">{inter.summary}</p>
                    </div>
                  ))}
                </div>
              </div>
            </>
          ) : (
            <p className="text-slate-500 text-center py-8">Select a conversation to load customer profile</p>
          )}
        </div>
      </div>

      {/* ================= COLUMN 2: CONVERSATION STREAM (Width 5) ================= */}
      <div className="col-span-5 bg-slate-900 border border-slate-800 rounded-2xl flex flex-col overflow-hidden">
        {/* Stream Header */}
        <div className="p-3.5 border-b border-slate-800 bg-slate-950/50 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <Headphones className="w-4 h-4 text-indigo-400" />
            <div>
              <h3 className="text-xs font-bold text-white">Live Conversation Transcript</h3>
              <p className="text-[10px] text-slate-400 font-mono">
                Speaker Diarization Active • Channel: {conversation?.channel || 'CHAT'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setRevealPii(!revealPii)}
              className="flex items-center gap-1 px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 text-[10px] font-medium transition-colors"
              title="Toggle PII Masking"
            >
              {revealPii ? <EyeOff className="w-3 h-3 text-amber-400" /> : <Eye className="w-3 h-3 text-slate-400" />}
              <span>{revealPii ? 'Mask PII' : 'Reveal PII'}</span>
            </button>

            <button
              onClick={handleGenerateSummary}
              className="flex items-center gap-1 px-2 py-1 rounded bg-indigo-600 hover:bg-indigo-500 text-white text-[10px] font-medium transition-colors shadow-sm"
            >
              <Sparkles className="w-3 h-3" />
              <span>Summarize</span>
            </button>
          </div>
        </div>

        {/* PII Guard Banner */}
        <div className="px-4 py-1.5 bg-slate-950 border-b border-slate-800/80 flex items-center justify-between text-[10px]">
          <span className="text-slate-400 flex items-center gap-1.5">
            <ShieldAlert className="w-3 h-3 text-indigo-400" />
            Deterministic PII Masking Active (Credit Cards, Phone, Emails, Gov IDs Redacted)
          </span>
          <span className="text-emerald-400 font-mono">PROTECTED</span>
        </div>

        {/* Messages Scroll Area */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {messages.map((m) => {
            const isCustomer = m.speaker === 'CUSTOMER';
            const isAgent = m.speaker === 'AGENT';
            const isAi = m.speaker === 'AI';

            const displayContent = revealPii ? m.content : (m.masked_content || m.content);

            return (
              <div
                key={m.id}
                className={`flex flex-col ${isAgent ? 'items-end' : isAi ? 'items-center' : 'items-start'}`}
              >
                <div className="flex items-center gap-1.5 mb-1 px-1">
                  <span className={`text-[10px] font-semibold uppercase tracking-wider font-mono ${
                    isCustomer ? 'text-sky-400' : isAgent ? 'text-indigo-400' : 'text-emerald-400'
                  }`}>
                    {m.speaker}
                  </span>
                  {m.sentiment && (
                    <span className="text-[9px] text-slate-500 font-mono">• {m.sentiment}</span>
                  )}
                  {m.pii_detected && (
                    <span className="text-[9px] px-1 rounded bg-amber-950 text-amber-300 border border-amber-800">
                      PII Masked
                    </span>
                  )}
                </div>

                <div
                  className={`max-w-[85%] rounded-2xl p-3 text-xs leading-relaxed ${
                    isAgent
                      ? 'bg-indigo-600 text-white rounded-tr-none shadow-sm shadow-indigo-600/20'
                      : isAi
                      ? 'bg-emerald-950/50 border border-emerald-800/60 text-emerald-200 text-center text-[11px] rounded-xl'
                      : 'bg-slate-950 border border-slate-800 text-slate-200 rounded-tl-none'
                  }`}
                >
                  {displayContent}
                </div>
              </div>
            );
          })}
          <div ref={messagesEndRef} />
        </div>

        {/* Message Input & Action Bar */}
        <form onSubmit={handleSendMessage} className="p-3 border-t border-slate-800 bg-slate-950/70 flex gap-2">
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Type your response as human agent..."
            className="flex-1 bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
          />
          <button
            type="submit"
            className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-medium text-xs flex items-center gap-1.5 transition-colors shadow-sm"
          >
            <Send className="w-3.5 h-3.5" />
            <span>Send</span>
          </button>
        </form>
      </div>

      {/* ================= COLUMN 3: AI ASSISTANT & RAG KNOWLEDGE (Width 4) ================= */}
      <div className="col-span-4 bg-slate-900 border border-slate-800 rounded-2xl flex flex-col overflow-hidden">
        {/* Tabs Bar */}
        <div className="p-2 border-b border-slate-800 bg-slate-950/50 flex gap-1">
          <button
            onClick={() => setActiveRightTab('COACH')}
            className={`flex-1 py-1.5 rounded-lg text-xs font-medium flex items-center justify-center gap-1.5 transition-all ${
              activeRightTab === 'COACH'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>AI Coach</span>
          </button>

          <button
            onClick={() => setActiveRightTab('KNOWLEDGE')}
            className={`flex-1 py-1.5 rounded-lg text-xs font-medium flex items-center justify-center gap-1.5 transition-all ${
              activeRightTab === 'KNOWLEDGE'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
            }`}
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span>Knowledge QA</span>
          </button>

          <button
            onClick={() => setActiveRightTab('SUMMARY')}
            className={`flex-1 py-1.5 rounded-lg text-xs font-medium flex items-center justify-center gap-1.5 transition-all ${
              activeRightTab === 'SUMMARY'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
            }`}
          >
            <CheckCircle className="w-3.5 h-3.5" />
            <span>Resolution</span>
          </button>
        </div>

        {/* Tab Content */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 text-xs">
          {/* TAB 1: AI COACH */}
          {activeRightTab === 'COACH' && coaching && (
            <div className="space-y-4">
              {/* Sentiment & Risk Badge Banner */}
              <div className="grid grid-cols-2 gap-2 p-3 rounded-xl bg-slate-950 border border-slate-800">
                <div>
                  <span className="text-[10px] text-slate-500 uppercase">Customer Mood</span>
                  <p className="font-bold text-rose-400 text-sm mt-0.5">{coaching.customer_mood || 'Frustrated'}</p>
                </div>
                <div>
                  <span className="text-[10px] text-slate-500 uppercase">Escalation Risk</span>
                  <p className="font-bold text-amber-400 text-sm mt-0.5">{coaching.conversation_risk || 'HIGH'}</p>
                </div>
              </div>

              {/* Coaching Guidance Card */}
              <div className="p-3.5 rounded-xl bg-indigo-950/30 border border-indigo-800/50 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-semibold text-indigo-300 uppercase tracking-wider flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-indigo-400" /> Real-Time Coach Tip
                  </span>
                  <span className="text-[10px] font-mono text-indigo-400">
                    Conf: {Math.round((coaching.confidence || 0.93) * 100)}%
                  </span>
                </div>
                <p className="text-slate-200 text-xs leading-relaxed">{coaching.coaching_tip}</p>
              </div>

              {/* Recommended Empathy Script */}
              {coaching.empathy_statement && (
                <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-1.5">
                  <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
                    Recommended Empathy Statement
                  </span>
                  <p className="text-slate-300 italic text-[11px] leading-relaxed">
                    "{coaching.empathy_statement}"
                  </p>
                  <button
                    onClick={() => setNewMessage(coaching.empathy_statement)}
                    className="mt-2 text-[11px] text-indigo-400 hover:text-indigo-300 font-medium flex items-center gap-1"
                  >
                    <span>Insert into chat</span>
                    <ArrowRight className="w-3 h-3" />
                  </button>
                </div>
              )}

              {/* Suggested Next Actions */}
              <div>
                <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block mb-2">
                  Next-Best Actions
                </span>
                <div className="space-y-2">
                  {(coaching.suggested_actions || []).map((action: string, idx: number) => (
                    <div
                      key={idx}
                      className="p-2.5 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between gap-2"
                    >
                      <span className="text-[11px] text-slate-300">{action}</span>
                      <button
                        onClick={() => handleExecuteResolution(42.50)}
                        className="px-2.5 py-1 rounded bg-indigo-600 hover:bg-indigo-500 text-white text-[10px] font-semibold shrink-0 shadow-sm"
                      >
                        Execute
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: KNOWLEDGE ASSISTANT / RAG */}
          {activeRightTab === 'KNOWLEDGE' && (
            <div className="space-y-4">
              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block">
                  Ask Knowledge Base (RAG)
                </span>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={knowledgeQuery}
                    onChange={(e) => setKnowledgeQuery(e.target.value)}
                    placeholder="e.g. How long does a refund take?"
                    className="flex-1 bg-slate-900 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none"
                  />
                  <button
                    onClick={() => handleRunKnowledgeQuery()}
                    disabled={knowledgeLoading}
                    className="px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-medium text-xs shrink-0"
                  >
                    {knowledgeLoading ? 'Searching...' : 'Ask'}
                  </button>
                </div>
              </div>

              {/* Grounded QA Result */}
              {knowledgeAnswer && (
                <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold text-white flex items-center gap-1.5">
                      <BookOpen className="w-3.5 h-3.5 text-indigo-400" /> Grounded AI Answer
                    </span>
                    <span className="text-[10px] font-mono text-emerald-400">
                      Conf: {Math.round(knowledgeAnswer.confidence * 100)}%
                    </span>
                  </div>

                  <p className="text-slate-200 text-xs leading-relaxed p-2.5 rounded-lg bg-slate-900 border border-slate-800">
                    {knowledgeAnswer.answer}
                  </p>

                  {/* Sources List */}
                  <div>
                    <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block mb-1.5">
                      Retrieved Document Citations
                    </span>
                    <div className="space-y-1.5">
                      {(knowledgeAnswer.sources || []).map((src: any, idx: number) => (
                        <div key={idx} className="p-2 rounded-lg bg-slate-900/80 border border-slate-800 text-[11px]">
                          <div className="flex items-center justify-between text-indigo-300 font-medium">
                            <span>{src.title} (Page {src.page})</span>
                            <span className="font-mono text-[10px] text-emerald-400">{src.score}% Relevance</span>
                          </div>
                          <p className="text-slate-400 text-[10px] mt-1 line-clamp-2">{src.snippet}</p>
                        </div>
                      ))}
                    </div>
                  </div>

                  <button
                    onClick={() => setNewMessage(knowledgeAnswer.answer)}
                    className="w-full py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 font-medium text-xs flex items-center justify-center gap-1.5 transition-colors"
                  >
                    <span>Insert Answer into Message</span>
                    <ArrowRight className="w-3 h-3" />
                  </button>
                </div>
              )}
            </div>
          )}

          {/* TAB 3: RESOLUTION & SUMMARY */}
          {activeRightTab === 'SUMMARY' && (
            <div className="space-y-4">
              {/* Autonomous Action Trigger */}
              <div className="p-3.5 rounded-xl bg-gradient-to-r from-indigo-950/60 to-slate-950 border border-indigo-900/50 space-y-2">
                <span className="text-[11px] font-bold text-white flex items-center gap-1.5">
                  <Zap className="w-3.5 h-3.5 text-indigo-400" /> Agentic Resolution Engine
                </span>
                <p className="text-xs text-slate-300">
                  Trigger automated policy evaluation and guardrail-enforced refund/RMA reversal.
                </p>
                <div className="pt-2 flex gap-2">
                  <button
                    onClick={() => handleExecuteResolution(42.50)}
                    className="flex-1 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs shadow-sm transition-all"
                  >
                    Run Autonomous Resolution ($42.50)
                  </button>
                  <button
                    onClick={() => handleExecuteResolution(650.00)}
                    className="py-2 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium"
                    title="Test High Value Guardrail ($650)"
                  >
                    Test High Refund ($650)
                  </button>
                </div>
              </div>

              {/* Summary Card */}
              {summaryData ? (
                <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-2.5">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold text-white">CRM Conversation Summary</span>
                    <Badge variant="success">Auto-Generated</Badge>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-500 uppercase font-semibold">Issue:</span>
                    <p className="text-slate-300 text-[11px] mt-0.5">{summaryData.customer_issue}</p>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-500 uppercase font-semibold">Actions Taken:</span>
                    <p className="text-slate-300 text-[11px] mt-0.5">{summaryData.actions_taken}</p>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-500 uppercase font-semibold">Resolution:</span>
                    <p className="text-emerald-400 text-[11px] font-medium mt-0.5">{summaryData.resolution}</p>
                  </div>
                  {summaryData.revenue_opportunity && (
                    <div className="p-2 rounded-lg bg-emerald-950/40 border border-emerald-800/40 text-[10px] text-emerald-300">
                      Opportunity: {summaryData.revenue_opportunity}
                    </div>
                  )}
                </div>
              ) : (
                <button
                  onClick={handleGenerateSummary}
                  className="w-full py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium flex items-center justify-center gap-1.5 transition-colors"
                >
                  <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
                  <span>Generate CRM Summary</span>
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Human In The Loop Approval Modal */}
      <HumanApprovalModal
        isOpen={approvalModalOpen}
        onClose={() => setApprovalModalOpen(false)}
        decision={selectedDecision}
        onSuccess={() => fetchWorkspaceData(conversationId)}
      />
    </div>
  );
};
