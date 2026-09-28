from datetime import datetime
from typing import List, Optional, Any, Dict
from pydantic import BaseModel, EmailStr, Field

# ----------------- Auth Schemas -----------------
class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: Dict[str, Any]

class TokenPayload(BaseModel):
    sub: Optional[str] = None
    exp: Optional[int] = None

class LoginRequest(BaseModel):
    email: str
    password: str

class UserResponse(BaseModel):
    id: int
    email: str
    full_name: str
    role: str
    is_active: bool
    created_at: datetime

    class Config:
        from_attributes = True

# ----------------- Customer Schemas -----------------
class CustomerResponse(BaseModel):
    id: int
    customer_id: str
    name: str
    email: str
    phone: str
    tier: str
    account_value: float
    preferred_channel: str
    language: str
    sentiment_score: float
    mood: str
    last_interaction: Optional[datetime] = None
    created_at: datetime

    class Config:
        from_attributes = True

class CustomerInteractionResponse(BaseModel):
    id: int
    channel: str
    summary: str
    sentiment: str
    created_at: datetime

    class Config:
        from_attributes = True

class CustomerDetail(CustomerResponse):
    open_cases_count: int = 0
    total_conversations: int = 0
    recent_interactions: List[CustomerInteractionResponse] = []
    ai_insights: List[str] = []

# ----------------- Agent Schemas -----------------
class AgentResponse(BaseModel):
    id: int
    name: str
    email: str
    avatar: Optional[str] = None
    status: str
    skills: str
    conversations_handled: int
    avg_handle_time: float
    csat: float
    resolution_rate: float
    ai_acceptance_rate: float

    class Config:
        from_attributes = True

class AgentPerformanceResponse(BaseModel):
    agent_id: int
    name: str
    conversations_handled: int
    avg_handle_time: float
    csat: float
    resolution_rate: float
    ai_acceptance_rate: float
    sentiment_improvement: float
    sales_conversion: float
    coaching_tip: str

# ----------------- Conversation & Message -----------------
class MessageCreate(BaseModel):
    speaker: str  # CUSTOMER, AGENT, AI
    content: str
    sentiment: Optional[str] = None
    intent: Optional[str] = None

class MessageResponse(BaseModel):
    id: int
    conversation_id: int
    speaker: str
    content: str
    masked_content: Optional[str] = None
    sentiment: str
    intent: Optional[str] = None
    pii_detected: bool
    created_at: datetime

    class Config:
        from_attributes = True

class ConversationResponse(BaseModel):
    id: int
    customer_id: int
    customer_name: Optional[str] = None
    customer_tier: Optional[str] = None
    agent_id: Optional[int] = None
    agent_name: Optional[str] = None
    channel: str
    status: str
    priority: str
    subject: str
    sentiment: str
    mood: str
    intent: str
    ai_confidence: float
    duration_seconds: int
    summary: Optional[str] = None
    recommended_action: Optional[str] = None
    started_at: datetime
    ended_at: Optional[datetime] = None

    class Config:
        from_attributes = True

class ConversationDetail(ConversationResponse):
    messages: List[MessageResponse] = []
    customer: Optional[CustomerResponse] = None

class ConversationCreate(BaseModel):
    customer_id: int
    channel: str = "CHAT"
    subject: str
    priority: str = "MEDIUM"

# ----------------- AI Coaching & Recommendation -----------------
class AIRecommendationResponse(BaseModel):
    id: int
    conversation_id: int
    action: str
    reason: str
    confidence: float
    expected_outcome: Optional[str] = None
    requires_approval: bool
    status: str
    created_at: datetime

    class Config:
        from_attributes = True

class AIDecisionResponse(BaseModel):
    id: int
    conversation_id: Optional[int] = None
    decision: str
    action_type: str
    reason: str
    confidence: float
    retrieved_knowledge: Optional[str] = None
    risk_level: str
    approval_status: str
    execution_result: Optional[str] = None
    actor: str
    created_at: datetime

    class Config:
        from_attributes = True

class AuditLogResponse(BaseModel):
    id: int
    conversation_id: Optional[int] = None
    actor: str
    ai_provider: str
    model: str
    action: str
    reason: Optional[str] = None
    confidence: float
    approval: str
    result: str
    ip_address: str
    created_at: datetime

    class Config:
        from_attributes = True

# ----------------- RAG & Knowledge Base -----------------
class DocumentResponse(BaseModel):
    id: int
    title: str
    description: Optional[str] = None
    category: str
    file_type: str
    version: str
    page_count: int
    chunk_count: int
    processing_status: str
    uploaded_by: str
    created_at: datetime

    class Config:
        from_attributes = True

class DocumentChunkResponse(BaseModel):
    id: int
    document_id: int
    document_title: Optional[str] = None
    content: str
    page_number: int
    chunk_index: int
    similarity_score: Optional[float] = None

    class Config:
        from_attributes = True

class KnowledgeSearchRequest(BaseModel):
    query: str
    category: Optional[str] = None
    top_k: int = 4
    min_score: float = 0.5

class KnowledgeSearchResult(BaseModel):
    query: str
    results: List[DocumentChunkResponse]
    total_found: int

class KnowledgeQueryRequest(BaseModel):
    query: str
    conversation_id: Optional[int] = None
    category: Optional[str] = None

class KnowledgeQueryResponse(BaseModel):
    query: str
    answer: str
    confidence: float
    grounded: bool
    sources: List[Dict[str, Any]]
    insufficient_information: bool
    recommended_action: Optional[str] = None

# ----------------- Guardrails & Autonomous Resolution -----------------
class ResolutionWorkflowStep(BaseModel):
    step_number: int
    name: str
    status: str  # COMPLETED, IN_PROGRESS, PENDING, BLOCKED
    timestamp: str
    confidence: float
    approval_requirement: str  # NONE, AGENT_REQUIRED, SUPERVISOR_REQUIRED
    result: str
    details: Optional[Dict[str, Any]] = None

class AutonomousResolutionResponse(BaseModel):
    case_number: str
    intent: str
    customer_id: str
    issue: str
    eligibility: bool
    action_plan: str
    requires_human_approval: bool
    approval_level: str  # NONE, AGENT, SUPERVISOR
    risk_level: str
    confidence: float
    steps: List[ResolutionWorkflowStep]
    execution_result: Optional[str] = None

class ApprovalActionRequest(BaseModel):
    decision_id: Optional[int] = None
    action: str  # APPROVE, REJECT, MODIFY
    actor: str = "Supervisor"
    notes: Optional[str] = None
    modified_amount: Optional[float] = None

# ----------------- PII & Voice Security -----------------
class PIIDetectRequest(BaseModel):
    text: str

class PIIDetectionItem(BaseModel):
    entity_type: str
    raw_preview: str
    masked_preview: str
    start: int
    end: int

class PIIDetectResponse(BaseModel):
    original_text: str
    masked_text: str
    entities_count: int
    detections: List[PIIDetectionItem]

class VoiceAuthSimRequest(BaseModel):
    customer_id: str
    audio_sample_name: Optional[str] = "customer_voice_sample_01.wav"

class VoiceAuthSimResponse(BaseModel):
    is_simulation: bool = True
    simulation_label: str = "Simulated Voice Biometrics Engine"
    status: str  # VERIFIED, VERIFICATION_REQUIRED, HIGH_RISK
    identity_confidence: float
    voice_print_match: float
    risk_score: str
    speaker_diarization_ready: bool
    message: str

# ----------------- Dashboard & Analytics -----------------
class KPICard(BaseModel):
    title: str
    value: str
    change: str
    change_type: str  # positive, negative, neutral
    reference_tag: Optional[str] = "Documentation Reference"

class DashboardData(BaseModel):
    kpis: List[KPICard]
    resolution_rate_chart: List[Dict[str, Any]]
    sentiment_trend_chart: List[Dict[str, Any]]
    channel_volume_chart: List[Dict[str, Any]]
    ai_vs_human_chart: List[Dict[str, Any]]
    active_conversations_count: int
    urgent_cases_count: int
    pending_approvals_count: int
    autonomous_resolution_rate: float
