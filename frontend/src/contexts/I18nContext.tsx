import React, { createContext, useContext, useState, ReactNode } from 'react';

export type LangCode = 'en' | 'hi';

export interface Translations {
  dashboard: string;
  liveConversations: string;
  agentWorkspace: string;
  customer360: string;
  aiCoach: string;
  knowledgeBase: string;
  knowledgeQuery: string;
  agenticAi: string;
  autonomousResolution: string;
  omnichannel: string;
  analytics: string;
  securityPii: string;
  aiGovernance: string;
  settings: string;
  signOut: string;
  search: string;
  startSimulation: string;
  pauseSimulation: string;
  resetSimulation: string;
  totalConversations: string;
  resolutionRate: string;
  csatScore: string;
  aiResolution: string;
  loading: string;
  error: string;
  save: string;
  cancel: string;
  approve: string;
  reject: string;
  pending: string;
  active: string;
  resolved: string;
  escalated: string;
  autonomyEngine: string;
  guardrailsActive: string;
  policyReversal: string;
}

const translations: Record<LangCode, Translations> = {
  en: {
    dashboard: 'Dashboard',
    liveConversations: 'Live Conversations',
    agentWorkspace: 'Agent Workspace',
    customer360: 'Customer 360',
    aiCoach: 'AI Coach',
    knowledgeBase: 'Knowledge Base',
    knowledgeQuery: 'Knowledge Query / RAG',
    agenticAi: 'Agentic AI',
    autonomousResolution: 'Autonomous Resolution',
    omnichannel: 'Omnichannel',
    analytics: 'Analytics',
    securityPii: 'Security & PII',
    aiGovernance: 'AI Governance',
    settings: 'Settings',
    signOut: 'Sign Out',
    search: 'Search customers, tickets, knowledge...',
    startSimulation: 'Start Simulation',
    pauseSimulation: 'Pause',
    resetSimulation: 'Reset',
    totalConversations: 'Total Conversations',
    resolutionRate: 'Resolution Rate',
    csatScore: 'CSAT Score',
    aiResolution: 'AI Resolution',
    loading: 'Loading...',
    error: 'Error',
    save: 'Save',
    cancel: 'Cancel',
    approve: 'Approve',
    reject: 'Reject',
    pending: 'Pending',
    active: 'Active',
    resolved: 'Resolved',
    escalated: 'Escalated',
    autonomyEngine: 'Autonomy Engine',
    guardrailsActive: 'GUARDRAILS ACTIVE',
    policyReversal: 'Policy: < $50 Autonomous Reversal',
  },
  hi: {
    dashboard: 'डैशबोर्ड',
    liveConversations: 'लाइव वार्तालाप',
    agentWorkspace: 'एजेंट कार्यक्षेत्र',
    customer360: 'ग्राहक 360',
    aiCoach: 'AI कोच',
    knowledgeBase: 'ज्ञान आधार',
    knowledgeQuery: 'ज्ञान प्रश्न / RAG',
    agenticAi: 'एजेंटिक AI',
    autonomousResolution: 'स्वायत्त समाधान',
    omnichannel: 'ओमनीचैनल',
    analytics: 'विश्लेषण',
    securityPii: 'सुरक्षा और PII',
    aiGovernance: 'AI शासन',
    settings: 'सेटिंग्स',
    signOut: 'साइन आउट',
    search: 'ग्राहक, टिकट, ज्ञान खोजें...',
    startSimulation: 'सिमुलेशन शुरू करें',
    pauseSimulation: 'रोकें',
    resetSimulation: 'रीसेट करें',
    totalConversations: 'कुल वार्तालाप',
    resolutionRate: 'समाधान दर',
    csatScore: 'CSAT स्कोर',
    aiResolution: 'AI समाधान',
    loading: 'लोड हो रहा है...',
    error: 'त्रुटि',
    save: 'सहेजें',
    cancel: 'रद्द करें',
    approve: 'स्वीकृत करें',
    reject: 'अस्वीकार करें',
    pending: 'लंबित',
    active: 'सक्रिय',
    resolved: 'हल किया गया',
    escalated: 'एस्केलेट किया गया',
    autonomyEngine: 'स्वायत्तता इंजन',
    guardrailsActive: 'गार्डरेल्स सक्रिय',
    policyReversal: 'नीति: < $50 स्वायत्त रिवर्सल',
  },
};

interface I18nContextType {
  lang: LangCode;
  setLang: (lang: LangCode) => void;
  t: Translations;
}

const I18nContext = createContext<I18nContextType | null>(null);

export const I18nProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [lang, setLang] = useState<LangCode>('en');
  return (
    <I18nContext.Provider value={{ lang, setLang, t: translations[lang] }}>
      {children}
    </I18nContext.Provider>
  );
};

export const useI18n = () => {
  const ctx = useContext(I18nContext);
  if (!ctx) throw new Error('useI18n must be used within I18nProvider');
  return ctx;
};
