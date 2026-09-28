const API_BASE = '/api';

async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const token = localStorage.getItem('token');
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    const errorBody = await response.json().catch(() => ({ detail: 'Network request failed' }));
    throw new Error(errorBody.detail || `Request failed with status ${response.status}`);
  }

  return response.json();
}

export const api = {
  // Auth
  login: (email: string, password: string) =>
    request<{ access_token: string; user: any }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    }),
  getMe: () => request<any>('/auth/me'),

  // Dashboard
  getDashboard: () => request<any>('/dashboard'),

  // Customers
  getCustomers: (params?: { tier?: string; search?: string }) => {
    const q = new URLSearchParams();
    if (params?.tier && params.tier !== 'ALL') q.set('tier', params.tier);
    if (params?.search) q.set('search', params.search);
    return request<any[]>(`/customers?${q.toString()}`);
  },
  getCustomerDetail: (id: string | number) => request<any>(`/customers/${id}`),

  // Conversations
  getConversations: (params?: { channel?: string; sentiment?: string; priority?: string; status?: string }) => {
    const q = new URLSearchParams();
    if (params?.channel && params.channel !== 'ALL') q.set('channel', params.channel);
    if (params?.sentiment && params.sentiment !== 'ALL') q.set('sentiment', params.sentiment);
    if (params?.priority && params.priority !== 'ALL') q.set('priority', params.priority);
    if (params?.status && params.status !== 'ALL') q.set('status', params.status);
    return request<any[]>(`/conversations?${q.toString()}`);
  },
  getConversationDetail: (id: number) => request<any>(`/conversations/${id}`),
  sendMessage: (id: number, message: { speaker: string; content: string }) =>
    request<any>(`/conversations/${id}/message`, {
      method: 'POST',
      body: JSON.stringify(message),
    }),
  createConversation: (data: { customer_id: number; channel: string; subject: string; priority: string }) =>
    request<any>('/conversations', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  // AI Assistant
  analyzeConversation: (id: number) =>
    request<any>(`/conversations/${id}/analyze`, { method: 'POST' }),
  getCoaching: (id: number) =>
    request<any>(`/conversations/${id}/coach`, { method: 'POST' }),
  getRecommendation: (id: number) =>
    request<any>(`/conversations/${id}/recommendation`, { method: 'POST' }),
  summarizeConversation: (id: number) =>
    request<any>(`/conversations/${id}/summarize`, { method: 'POST' }),
  resolveConversation: (id: number, payload: { action_type: string; amount: number; issue?: string }) =>
    request<any>(`/conversations/${id}/resolve`, {
      method: 'POST',
      body: JSON.stringify(payload),
    }),

  // Knowledge & RAG
  getDocuments: (category?: string) => {
    const q = category ? `?category=${category}` : '';
    return request<any[]>(`/documents${q}`);
  },
  getDocumentDetail: (id: number) => request<any>(`/documents/${id}`),
  deleteDocument: (id: number) =>
    request<any>(`/documents/${id}`, { method: 'DELETE' }),
  uploadDocument: async (formData: FormData) => {
    const token = localStorage.getItem('token');
    const headers: Record<string, string> = {};
    if (token) headers['Authorization'] = `Bearer ${token}`;

    const res = await fetch(`${API_BASE}/documents/upload`, {
      method: 'POST',
      headers,
      body: formData,
    });
    if (!res.ok) throw new Error('Document upload failed');
    return res.json();
  },
  searchKnowledge: (query: string, category?: string, top_k = 4) =>
    request<any>('/knowledge/search', {
      method: 'POST',
      body: JSON.stringify({ query, category, top_k }),
    }),
  queryKnowledge: (query: string, conversation_id?: number) =>
    request<any>('/knowledge/query', {
      method: 'POST',
      body: JSON.stringify({ query, conversation_id }),
    }),

  // Agents
  getAgents: () => request<any[]>('/agents'),
  getAgentPerformance: (id: number) => request<any>(`/agents/${id}/performance`),

  // Governance
  getDecisions: (status?: string) => {
    const q = status && status !== 'ALL' ? `?status=${status}` : '';
    return request<any[]>(`/governance/decisions${q}`);
  },
  getAuditLogs: () => request<any[]>('/governance/audit-logs'),
  getPolicies: () => request<any>('/governance/policies'),
  handleApprovalAction: (decisionId: number, data: { action: string; actor: string; notes?: string }) =>
    request<any>(`/governance/decisions/${decisionId}/action`, {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  // Security & Voice Simulation
  detectPii: (text: string) =>
    request<any>('/security/pii/detect', {
      method: 'POST',
      body: JSON.stringify({ text }),
    }),
  getPiiLogs: () => request<any[]>('/security/pii/logs'),
  simulateVoiceVerification: (customerId: string) =>
    request<any>('/security/voice/simulate-verify', {
      method: 'POST',
      body: JSON.stringify({ customer_id: customerId }),
    }),

  // Simulation Controls
  getSimulationStatus: () => request<any>('/simulation/status'),
  startSimulation: () => request<any>('/simulation/start', { method: 'POST' }),
  pauseSimulation: () => request<any>('/simulation/pause', { method: 'POST' }),
  resumeSimulation: () => request<any>('/simulation/resume', { method: 'POST' }),
  resetSimulation: () => request<any>('/simulation/reset', { method: 'POST' }),
  runAutonomousResolution: (amount = 42.50) =>
    request<any>(`/simulation/run-resolution-workflow?amount=${amount}`, { method: 'POST' }),

  // Settings
  getSettings: () => request<any>('/settings'),
};
