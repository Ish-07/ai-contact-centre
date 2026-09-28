from abc import ABC, abstractmethod
from typing import List, Dict, Any, Optional
from pydantic import BaseModel

class SentimentResult(BaseModel):
    sentiment: str  # Positive, Neutral, Frustrated, Angry, Confused, Satisfied
    score: float  # -1.0 to 1.0
    confidence: float
    reason: str

class IntentResult(BaseModel):
    intent: str
    confidence: float
    reason: str

class MoodAnalysis(BaseModel):
    mood: str
    score: float
    trend: str  # improving, deteriorating, stable
    escalation_risk: str  # LOW, MEDIUM, HIGH

class NextBestAction(BaseModel):
    action: str
    reason: str
    confidence: float
    expected_outcome: str
    requires_approval: bool

class CoachingGuidance(BaseModel):
    coaching_tip: str
    empathy_statement: str
    suggested_actions: List[str]
    confidence: float

class ConversationSummary(BaseModel):
    summary: str
    customer_issue: str
    actions_taken: str
    resolution: str
    follow_up_required: bool
    sentiment: str
    intent: str
    products_mentioned: List[str]
    revenue_opportunity: Optional[str] = None

class ResolutionPlan(BaseModel):
    plan_title: str
    steps: List[str]
    estimated_duration: str
    risk_level: str
    requires_approval: bool
    confidence: float

class KnowledgeAnswer(BaseModel):
    answer: str
    confidence: float
    sources: List[Dict[str, Any]]
    grounded: bool
    insufficient_information: bool
    recommended_action: Optional[str] = None

class AIService(ABC):
    """Abstract Base Class for AI Services (MockAIService, GeminiAIService)."""

    @abstractmethod
    async def analyze_conversation(self, messages: List[Dict[str, Any]]) -> Dict[str, Any]:
        """Analyzes full conversation stream for holistic sentiment, intent, and coaching."""
        pass

    @abstractmethod
    async def detect_sentiment(self, text: str) -> SentimentResult:
        """Detects customer sentiment with confidence and reasoning."""
        pass

    @abstractmethod
    async def detect_intent(self, text: str) -> IntentResult:
        """Identifies customer intent and underlying root cause."""
        pass

    @abstractmethod
    async def analyze_customer_mood(self, text: str, history: List[str]) -> MoodAnalysis:
        """Computes customer emotional state and trajectory."""
        pass

    @abstractmethod
    async def generate_summary(self, messages: List[Dict[str, Any]]) -> ConversationSummary:
        """Generates structured CRM-ready conversation summary."""
        pass

    @abstractmethod
    async def detect_pii(self, text: str) -> Dict[str, Any]:
        """Detects sensitive PII entities."""
        pass

    @abstractmethod
    async def generate_next_best_action(self, context: Dict[str, Any]) -> NextBestAction:
        """Computes optimized next-best-action based on context and customer profile."""
        pass

    @abstractmethod
    async def generate_agent_coaching(self, current_message: str, context: Dict[str, Any]) -> CoachingGuidance:
        """Provides real-time contextual suggestions and empathy guidance for the human agent."""
        pass

    @abstractmethod
    async def predict_escalation(self, history: List[Dict[str, Any]]) -> Dict[str, Any]:
        """Predicts likelihood of customer escalation to supervisor."""
        pass

    @abstractmethod
    async def predict_churn(self, customer_profile: Dict[str, Any]) -> Dict[str, Any]:
        """Evaluates churn risk probability based on interaction history."""
        pass

    @abstractmethod
    async def generate_customer_insight(self, customer_profile: Dict[str, Any], history: List[Dict[str, Any]]) -> List[str]:
        """Generates Customer 360 AI bullet insights."""
        pass

    @abstractmethod
    async def answer_knowledge_query(self, query: str, retrieved_chunks: List[Dict[str, Any]]) -> KnowledgeAnswer:
        """Synthesizes grounded RAG answer citing retrieved company documentation."""
        pass

    @abstractmethod
    async def generate_resolution_plan(self, issue: str, retrieved_policies: List[Dict[str, Any]], customer_context: Dict[str, Any]) -> ResolutionPlan:
        """Builds automated resolution steps for agentic execution."""
        pass
