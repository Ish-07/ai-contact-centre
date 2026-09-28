import json
from datetime import datetime, timezone
from typing import List, Optional
from sqlalchemy import (
    Column, Integer, String, Text, Float, Boolean, DateTime, ForeignKey, Enum as SQLEnum
)
from sqlalchemy.orm import relationship
from app.db.database import Base

def utcnow():
    return datetime.now(timezone.utc)

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String(255), unique=True, index=True, nullable=False)
    hashed_password = Column(String(255), nullable=False)
    full_name = Column(String(255), nullable=False)
    role = Column(String(50), default="AGENT")  # ADMIN, SUPERVISOR, AGENT
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=utcnow)

    agent_profile = relationship("Agent", back_populates="user", uselist=False)

class Agent(Base):
    __tablename__ = "agents"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    name = Column(String(255), nullable=False)
    email = Column(String(255), unique=True, nullable=False)
    avatar = Column(String(255), nullable=True)
    status = Column(String(50), default="AVAILABLE")  # AVAILABLE, BUSY, OFFLINE
    skills = Column(String(255), default="Billing, Technical Support, General")
    conversations_handled = Column(Integer, default=0)
    avg_handle_time = Column(Float, default=4.2)  # minutes
    csat = Column(Float, default=8.7)  # out of 10
    resolution_rate = Column(Float, default=89.0)  # percentage
    ai_acceptance_rate = Column(Float, default=92.0)  # percentage
    created_at = Column(DateTime, default=utcnow)

    user = relationship("User", back_populates="agent_profile")
    conversations = relationship("Conversation", back_populates="agent")
    performances = relationship("AgentPerformance", back_populates="agent")

class Customer(Base):
    __tablename__ = "customers"

    id = Column(Integer, primary_key=True, index=True)
    customer_id = Column(String(50), unique=True, index=True, nullable=False)
    name = Column(String(255), nullable=False)
    email = Column(String(255), nullable=False)
    phone = Column(String(50), nullable=False)
    tier = Column(String(50), default="Standard")  # VIP, Gold, Silver, Standard
    account_value = Column(Float, default=1200.0)
    preferred_channel = Column(String(50), default="CHAT")  # VOICE, CHAT, EMAIL, SOCIAL
    language = Column(String(50), default="en")  # en, hi, es, fr, de
    sentiment_score = Column(Float, default=0.5)
    mood = Column(String(50), default="Neutral")
    last_interaction = Column(DateTime, default=utcnow)
    created_at = Column(DateTime, default=utcnow)

    conversations = relationship("Conversation", back_populates="customer")
    cases = relationship("Case", back_populates="customer")
    interactions = relationship("CustomerInteraction", back_populates="customer")

class Conversation(Base):
    __tablename__ = "conversations"

    id = Column(Integer, primary_key=True, index=True)
    customer_id = Column(Integer, ForeignKey("customers.id"), nullable=False)
    agent_id = Column(Integer, ForeignKey("agents.id"), nullable=True)
    channel = Column(String(50), default="CHAT")  # VOICE, CHAT, EMAIL, SOCIAL
    status = Column(String(50), default="ACTIVE")  # ACTIVE, RESOLVED, ESCALATED
    priority = Column(String(50), default="MEDIUM")  # LOW, MEDIUM, HIGH, URGENT
    subject = Column(String(255), default="Customer Support Inquiry")
    sentiment = Column(String(50), default="Neutral")
    mood = Column(String(50), default="Neutral")
    intent = Column(String(100), default="General Inquiry")
    ai_confidence = Column(Float, default=0.9)
    duration_seconds = Column(Integer, default=120)
    summary = Column(Text, nullable=True)
    recommended_action = Column(String(255), nullable=True)
    started_at = Column(DateTime, default=utcnow)
    ended_at = Column(DateTime, nullable=True)

    customer = relationship("Customer", back_populates="conversations")
    agent = relationship("Agent", back_populates="conversations")
    messages = relationship("Message", back_populates="conversation", cascade="all, delete-orphan")
    recommendations = relationship("AIRecommendation", back_populates="conversation", cascade="all, delete-orphan")
    decisions = relationship("AIDecision", back_populates="conversation", cascade="all, delete-orphan")
    audit_logs = relationship("AuditLog", back_populates="conversation")

class Message(Base):
    __tablename__ = "messages"

    id = Column(Integer, primary_key=True, index=True)
    conversation_id = Column(Integer, ForeignKey("conversations.id"), nullable=False)
    speaker = Column(String(50), nullable=False)  # CUSTOMER, AGENT, AI
    content = Column(Text, nullable=False)
    masked_content = Column(Text, nullable=True)
    sentiment = Column(String(50), default="Neutral")
    intent = Column(String(100), nullable=True)
    pii_detected = Column(Boolean, default=False)
    created_at = Column(DateTime, default=utcnow)

    conversation = relationship("Conversation", back_populates="messages")
    pii_detections = relationship("PIIDetection", back_populates="message")

class Case(Base):
    __tablename__ = "cases"

    id = Column(Integer, primary_key=True, index=True)
    case_number = Column(String(50), unique=True, index=True, nullable=False)
    customer_id = Column(Integer, ForeignKey("customers.id"), nullable=False)
    conversation_id = Column(Integer, ForeignKey("conversations.id"), nullable=True)
    title = Column(String(255), nullable=False)
    description = Column(Text, nullable=True)
    status = Column(String(50), default="OPEN")  # OPEN, PENDING_APPROVAL, RESOLVED, CLOSED
    priority = Column(String(50), default="MEDIUM")
    resolution_notes = Column(Text, nullable=True)
    created_at = Column(DateTime, default=utcnow)
    updated_at = Column(DateTime, default=utcnow, onupdate=utcnow)

    customer = relationship("Customer", back_populates="cases")

class AIRecommendation(Base):
    __tablename__ = "ai_recommendations"

    id = Column(Integer, primary_key=True, index=True)
    conversation_id = Column(Integer, ForeignKey("conversations.id"), nullable=False)
    action = Column(String(255), nullable=False)
    reason = Column(Text, nullable=False)
    confidence = Column(Float, default=0.88)
    expected_outcome = Column(String(255), nullable=True)
    requires_approval = Column(Boolean, default=False)
    status = Column(String(50), default="PROPOSED")  # PROPOSED, ACCEPTED, DISMISSED, EXECUTED
    created_at = Column(DateTime, default=utcnow)

    conversation = relationship("Conversation", back_populates="recommendations")

class AIDecision(Base):
    __tablename__ = "ai_decisions"

    id = Column(Integer, primary_key=True, index=True)
    conversation_id = Column(Integer, ForeignKey("conversations.id"), nullable=True)
    case_id = Column(Integer, ForeignKey("cases.id"), nullable=True)
    decision = Column(String(255), nullable=False)
    action_type = Column(String(100), default="RESOLVE")
    reason = Column(Text, nullable=False)
    confidence = Column(Float, default=0.92)
    retrieved_knowledge = Column(Text, nullable=True)
    risk_level = Column(String(50), default="LOW")  # LOW, MEDIUM, HIGH
    approval_status = Column(String(50), default="AUTO_APPROVED")  # AUTO_APPROVED, PENDING_HUMAN, APPROVED, REJECTED
    execution_result = Column(Text, nullable=True)
    actor = Column(String(100), default="Autonomous Billing Agent")
    created_at = Column(DateTime, default=utcnow)

    conversation = relationship("Conversation", back_populates="decisions")

class AgentPerformance(Base):
    __tablename__ = "agent_performances"

    id = Column(Integer, primary_key=True, index=True)
    agent_id = Column(Integer, ForeignKey("agents.id"), nullable=False)
    date = Column(String(50), nullable=False)
    conversations_handled = Column(Integer, default=0)
    avg_handle_time = Column(Float, default=4.2)
    resolution_rate = Column(Float, default=89.0)
    csat = Column(Float, default=8.7)
    sentiment_improvement = Column(Float, default=34.5)
    ai_acceptance_rate = Column(Float, default=92.0)
    escalation_rate = Column(Float, default=4.8)
    sales_conversion = Column(Float, default=22.4)

    agent = relationship("Agent", back_populates="performances")

class AuditLog(Base):
    __tablename__ = "audit_logs"

    id = Column(Integer, primary_key=True, index=True)
    conversation_id = Column(Integer, ForeignKey("conversations.id"), nullable=True)
    actor = Column(String(100), default="System")
    ai_provider = Column(String(50), default="MockAI")
    model = Column(String(100), default="MockAI-v1.0")
    action = Column(String(255), nullable=False)
    reason = Column(Text, nullable=True)
    confidence = Column(Float, default=1.0)
    approval = Column(String(50), default="NOT_REQUIRED")  # NOT_REQUIRED, APPROVED, REJECTED, AUTO
    result = Column(String(100), default="SUCCESS")
    ip_address = Column(String(50), default="127.0.0.1")
    created_at = Column(DateTime, default=utcnow)

    conversation = relationship("Conversation", back_populates="audit_logs")

class CustomerInteraction(Base):
    __tablename__ = "customer_interactions"

    id = Column(Integer, primary_key=True, index=True)
    customer_id = Column(Integer, ForeignKey("customers.id"), nullable=False)
    conversation_id = Column(Integer, ForeignKey("conversations.id"), nullable=True)
    channel = Column(String(50), default="CHAT")
    summary = Column(Text, nullable=False)
    sentiment = Column(String(50), default="Neutral")
    created_at = Column(DateTime, default=utcnow)

    customer = relationship("Customer", back_populates="interactions")

class PIIDetection(Base):
    __tablename__ = "pii_detections"

    id = Column(Integer, primary_key=True, index=True)
    message_id = Column(Integer, ForeignKey("messages.id"), nullable=False)
    entity_type = Column(String(100), nullable=False)  # EMAIL, PHONE, CREDIT_CARD, GOV_ID, ACCOUNT
    raw_preview_masked = Column(String(255), nullable=False)
    action_taken = Column(String(50), default="MASKED")
    created_at = Column(DateTime, default=utcnow)

    message = relationship("Message", back_populates="pii_detections")

class Document(Base):
    __tablename__ = "documents"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(255), nullable=False)
    description = Column(Text, nullable=True)
    category = Column(String(100), default="Policy")  # Policy, Manual, Troubleshooting, FAQ, Pricing
    file_type = Column(String(50), default="TXT")  # PDF, TXT, DOCX, IMAGE
    version = Column(String(50), default="v1.0")
    file_path = Column(String(500), nullable=True)
    page_count = Column(Integer, default=1)
    chunk_count = Column(Integer, default=0)
    processing_status = Column(String(50), default="UPLOADED")  # UPLOADED, PROCESSING, OCR_PROCESSING, CHUNKING, EMBEDDING, INDEXED, FAILED
    uploaded_by = Column(String(100), default="Admin")
    created_at = Column(DateTime, default=utcnow)
    updated_at = Column(DateTime, default=utcnow, onupdate=utcnow)

    chunks = relationship("DocumentChunk", back_populates="document", cascade="all, delete-orphan")

class DocumentChunk(Base):
    __tablename__ = "document_chunks"

    id = Column(Integer, primary_key=True, index=True)
    document_id = Column(Integer, ForeignKey("documents.id"), nullable=False)
    content = Column(Text, nullable=False)
    page_number = Column(Integer, default=1)
    chunk_index = Column(Integer, default=0)
    embedding_json = Column(Text, nullable=True)  # JSON-serialized list of floats
    metadata_json = Column(Text, nullable=True)
    created_at = Column(DateTime, default=utcnow)

    document = relationship("Document", back_populates="chunks")

    @property
    def embedding(self) -> List[float]:
        if self.embedding_json:
            return json.loads(self.embedding_json)
        return []

    @embedding.setter
    def embedding(self, value: List[float]):
        self.embedding_json = json.dumps(value)
