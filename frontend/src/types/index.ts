export interface User {
  id: number;
  email: string;
  full_name: string;
  role: 'ADMIN' | 'SUPERVISOR' | 'AGENT';
}

export interface Customer {
  id: number;
  customer_id: string;
  name: string;
  email: string;
  phone: string;
  tier: 'VIP' | 'Gold' | 'Silver' | 'Standard';
  account_value: number;
  preferred_channel: 'VOICE' | 'CHAT' | 'EMAIL' | 'SOCIAL';
  language: string;
  sentiment_score: number;
  mood: string;
  last_interaction?: string;
  created_at: string;
  open_cases_count?: number;
  total_conversations?: number;
  recent_interactions?: Array<{
    id: number;
    channel: string;
    summary: string;
    sentiment: string;
    created_at: string;
  }>;
  cases?: Array<{
    id: number;
    case_number: string;
    title: string;
    status: string;
    priority: string;
  }>;
  purchases?: Array<{
    order_id: string;
    item: string;
    amount: number;
    date: string;
    status: string;
  }>;
  ai_insights?: string[];
}

export interface Agent {
  id: number;
  name: string;
  email: string;
  status: 'AVAILABLE' | 'BUSY' | 'OFFLINE';
  skills: string;
  conversations_handled: number;
  avg_handle_time: number;
  csat: number;
  resolution_rate: number;
  ai_acceptance_rate: number;
}

export interface Message {
  id: number;
  conversation_id: number;
  speaker: 'CUSTOMER' | 'AGENT' | 'AI';
  content: string;
  masked_content?: string;
  sentiment: string;
  intent?: string;
  pii_detected?: boolean;
  created_at: string;
}

export interface Conversation {
  id: number;
  customer_id: number;
  customer_name?: string;
  customer_tier?: string;
  agent_id?: number;
  agent_name?: string;
  channel: 'VOICE' | 'CHAT' | 'EMAIL' | 'SOCIAL';
  status: 'ACTIVE' | 'RESOLVED' | 'ESCALATED';
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
  subject: string;
  sentiment: string;
  mood: string;
  intent: string;
  ai_confidence: number;
  duration_seconds: number;
  summary?: string;
  recommended_action?: string;
  started_at: string;
  customer?: Customer;
  messages?: Message[];
}

export interface DocumentItem {
  id: number;
  title: string;
  description?: string;
  category: string;
  file_type: string;
  version: string;
  page_count: number;
  chunk_count: number;
  processing_status: 'UPLOADED' | 'PROCESSING' | 'OCR_PROCESSING' | 'CHUNKING' | 'EMBEDDING' | 'INDEXED' | 'FAILED';
  uploaded_by: string;
  created_at: string;
  chunks?: Array<{
    id: number;
    content: string;
    page_number: number;
    chunk_index: number;
  }>;
}

export interface KnowledgeQueryResult {
  query: string;
  answer: string;
  confidence: number;
  grounded: boolean;
  sources: Array<{
    title: string;
    page: number;
    score: number;
    snippet: string;
  }>;
  insufficient_information: boolean;
  recommended_action?: string;
}

export interface AIDecision {
  id: number;
  conversation_id?: number;
  decision: string;
  action_type: string;
  reason: string;
  confidence: number;
  retrieved_knowledge?: string;
  risk_level: 'LOW' | 'MEDIUM' | 'HIGH';
  approval_status: 'AUTO_APPROVED' | 'PENDING_HUMAN' | 'APPROVED' | 'REJECTED' | 'MODIFIED';
  execution_result?: string;
  actor: string;
  created_at: string;
}

export interface AuditLog {
  id: number;
  conversation_id?: number;
  actor: string;
  ai_provider: string;
  model: string;
  action: string;
  reason?: string;
  confidence: number;
  approval: string;
  result: string;
  ip_address: string;
  created_at: string;
}

export interface KPICardData {
  title: string;
  value: string;
  change: string;
  change_type: 'positive' | 'negative' | 'neutral';
  reference_tag?: string;
}
