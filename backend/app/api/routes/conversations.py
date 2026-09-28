from typing import List, Dict, Any, Optional
from datetime import datetime, timezone
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from app.db.database import get_db
from app.models.models import Conversation, Message, Customer, Agent, PIIDetection
from app.schemas.schemas import ConversationResponse, ConversationDetail, MessageCreate, MessageResponse, ConversationCreate
from app.services.pii_service import pii_service
from app.services.ai.factory import get_ai_service
from app.services.websocket_manager import ws_manager

router = APIRouter(prefix="/conversations", tags=["Conversations"])

@router.get("", response_model=List[Dict[str, Any]])
def list_conversations(
    channel: Optional[str] = None,
    sentiment: Optional[str] = None,
    priority: Optional[str] = None,
    status: Optional[str] = None,
    limit: int = 50,
    db: Session = Depends(get_db)
) -> List[Dict[str, Any]]:
    q = db.query(Conversation).join(Customer, Conversation.customer_id == Customer.id)

    if channel and channel != "ALL":
        q = q.filter(Conversation.channel == channel)
    if sentiment and sentiment != "ALL":
        q = q.filter(Conversation.sentiment == sentiment)
    if priority and priority != "ALL":
        q = q.filter(Conversation.priority == priority)
    if status and status != "ALL":
        q = q.filter(Conversation.status == status)

    convs = q.order_by(Conversation.started_at.desc()).limit(limit).all()

    results = []
    for c in convs:
        agent_name = c.agent.name if c.agent else "Autonomous AI"
        results.append({
            "id": c.id,
            "customer_id": c.customer_id,
            "customer_name": c.customer.name,
            "customer_tier": c.customer.tier,
            "agent_id": c.agent_id,
            "agent_name": agent_name,
            "channel": c.channel,
            "status": c.status,
            "priority": c.priority,
            "subject": c.subject,
            "sentiment": c.sentiment,
            "mood": c.mood,
            "intent": c.intent,
            "ai_confidence": c.ai_confidence,
            "duration_seconds": c.duration_seconds,
            "summary": c.summary,
            "recommended_action": c.recommended_action,
            "started_at": c.started_at,
            "ended_at": c.ended_at
        })
    return results

@router.get("/{id}", response_model=Dict[str, Any])
def get_conversation_detail(id: int, db: Session = Depends(get_db)) -> Dict[str, Any]:
    c = db.query(Conversation).filter(Conversation.id == id).first()
    if not c:
        raise HTTPException(status_code=404, detail="Conversation not found")

    messages = db.query(Message).filter(Message.conversation_id == c.id).order_by(Message.created_at.asc()).all()

    return {
        "id": c.id,
        "customer_id": c.customer_id,
        "customer_name": c.customer.name,
        "customer_tier": c.customer.tier,
        "agent_id": c.agent_id,
        "agent_name": c.agent.name if c.agent else "Autonomous AI",
        "channel": c.channel,
        "status": c.status,
        "priority": c.priority,
        "subject": c.subject,
        "sentiment": c.sentiment,
        "mood": c.mood,
        "intent": c.intent,
        "ai_confidence": c.ai_confidence,
        "duration_seconds": c.duration_seconds,
        "summary": c.summary,
        "recommended_action": c.recommended_action,
        "started_at": c.started_at,
        "customer": {
            "id": c.customer.id,
            "customer_id": c.customer.customer_id,
            "name": c.customer.name,
            "email": c.customer.email,
            "phone": c.customer.phone,
            "tier": c.customer.tier,
            "account_value": c.customer.account_value,
            "preferred_channel": c.customer.preferred_channel,
            "sentiment_score": c.customer.sentiment_score,
            "mood": c.customer.mood
        },
        "messages": [
            {
                "id": m.id,
                "conversation_id": m.conversation_id,
                "speaker": m.speaker,
                "content": m.content,
                "masked_content": m.masked_content or m.content,
                "sentiment": m.sentiment,
                "intent": m.intent,
                "pii_detected": m.pii_detected,
                "created_at": m.created_at
            }
            for m in messages
        ]
    }

@router.post("/{id}/message", response_model=Dict[str, Any])
async def post_message(id: int, payload: MessageCreate, db: Session = Depends(get_db)) -> Dict[str, Any]:
    c = db.query(Conversation).filter(Conversation.id == id).first()
    if not c:
        raise HTTPException(status_code=404, detail="Conversation not found")

    # Step 1: PII Detection & Masking
    pii_result = pii_service.scan_and_mask(payload.content)
    has_pii = pii_result["entities_count"] > 0
    masked_text = pii_result["masked_text"]

    # Step 2: AI Sentiment & Intent Analysis
    ai = get_ai_service()
    sentiment_res = await ai.detect_sentiment(payload.content)
    intent_res = await ai.detect_intent(payload.content)

    # Step 3: Store Message
    msg = Message(
        conversation_id=c.id,
        speaker=payload.speaker.upper(),
        content=payload.content,
        masked_content=masked_text,
        sentiment=sentiment_res.sentiment,
        intent=intent_res.intent,
        pii_detected=has_pii,
        created_at=datetime.now(timezone.utc)
    )
    db.add(msg)
    db.flush()

    # If PII was detected, record in PIIDetection audit table
    if has_pii:
        for det in pii_result["detections"]:
            p_log = PIIDetection(
                message_id=msg.id,
                entity_type=det["entity_type"],
                raw_preview_masked=det["masked_preview"],
                action_taken="MASKED"
            )
            db.add(p_log)

    # Step 4: Update Conversation attributes
    c.sentiment = sentiment_res.sentiment
    c.intent = intent_res.intent
    c.ai_confidence = round(sentiment_res.confidence, 2)
    db.commit()
    db.refresh(msg)

    # Step 5: Broadcast to WebSockets
    await ws_manager.broadcast({
        "event": "NEW_MESSAGE",
        "conversation_id": c.id,
        "message": {
            "id": msg.id,
            "speaker": msg.speaker,
            "content": msg.content,
            "masked_content": msg.masked_content,
            "sentiment": msg.sentiment,
            "intent": msg.intent,
            "pii_detected": msg.pii_detected,
            "created_at": msg.created_at.isoformat()
        },
        "conversation_update": {
            "sentiment": c.sentiment,
            "intent": c.intent,
            "ai_confidence": c.ai_confidence
        }
    })

    return {
        "message_id": msg.id,
        "speaker": msg.speaker,
        "masked_content": msg.masked_content,
        "sentiment": msg.sentiment,
        "intent": msg.intent,
        "pii_detected": msg.pii_detected
    }

@router.post("", response_model=Dict[str, Any])
def create_conversation(payload: ConversationCreate, db: Session = Depends(get_db)) -> Dict[str, Any]:
    c = Conversation(
        customer_id=payload.customer_id,
        channel=payload.channel,
        subject=payload.subject,
        priority=payload.priority,
        status="ACTIVE",
        started_at=datetime.now(timezone.utc)
    )
    db.add(c)
    db.commit()
    db.refresh(c)
    return {"id": c.id, "status": "ACTIVE"}
