from typing import Dict, Any, List
from datetime import datetime, timezone
from fastapi import APIRouter, Depends, HTTPException, Body
from sqlalchemy.orm import Session
from app.db.database import get_db
from app.models.models import Conversation, Message, AIRecommendation, AIDecision, AuditLog, Case
from app.services.ai.factory import get_ai_service
from app.services.guardrail_service import guardrail_engine
from app.services.websocket_manager import ws_manager

router = APIRouter(prefix="/conversations", tags=["AI Assistant"])

@router.post("/{id}/analyze", response_model=Dict[str, Any])
async def analyze_conversation_endpoint(id: int, db: Session = Depends(get_db)) -> Dict[str, Any]:
    c = db.query(Conversation).filter(Conversation.id == id).first()
    if not c:
        raise HTTPException(status_code=404, detail="Conversation not found")

    messages = db.query(Message).filter(Message.conversation_id == c.id).order_by(Message.created_at.asc()).all()
    msg_dicts = [{"speaker": m.speaker, "content": m.content, "sentiment": m.sentiment} for m in messages]

    ai = get_ai_service()
    analysis = await ai.analyze_conversation(msg_dicts)

    # Update conversation records
    c.sentiment = analysis.get("sentiment", c.sentiment)
    c.mood = analysis.get("mood", c.mood)
    c.intent = analysis.get("intent", c.intent)
    c.ai_confidence = float(analysis.get("sentiment_confidence", 0.9))
    c.recommended_action = analysis.get("recommended_action", c.recommended_action)
    db.commit()

    return analysis

@router.post("/{id}/coach", response_model=Dict[str, Any])
async def get_coaching_guidance(id: int, db: Session = Depends(get_db)) -> Dict[str, Any]:
    c = db.query(Conversation).filter(Conversation.id == id).first()
    if not c:
        raise HTTPException(status_code=404, detail="Conversation not found")

    last_customer_msg = db.query(Message).filter(
        Message.conversation_id == c.id,
        Message.speaker == "CUSTOMER"
    ).order_by(Message.created_at.desc()).first()

    current_text = last_customer_msg.content if last_customer_msg else c.subject

    ai = get_ai_service()
    guidance = await ai.generate_agent_coaching(current_text, {
        "channel": c.channel,
        "sentiment": c.sentiment,
        "intent": c.intent,
        "customer_tier": c.customer.tier if c.customer else "Standard"
    })

    return {
        "coaching_tip": guidance.coaching_tip,
        "empathy_statement": guidance.empathy_statement,
        "suggested_actions": guidance.suggested_actions,
        "confidence": guidance.confidence,
        "current_sentiment": c.sentiment,
        "customer_mood": c.mood,
        "intent": c.intent,
        "conversation_risk": "HIGH" if c.sentiment in ["Frustrated", "Angry"] else "LOW"
    }

@router.post("/{id}/recommendation", response_model=Dict[str, Any])
async def get_next_best_action(id: int, db: Session = Depends(get_db)) -> Dict[str, Any]:
    c = db.query(Conversation).filter(Conversation.id == id).first()
    if not c:
        raise HTTPException(status_code=404, detail="Conversation not found")

    last_msg = db.query(Message).filter(Message.conversation_id == c.id).order_by(Message.created_at.desc()).first()
    msg_text = last_msg.content if last_msg else ""

    ai = get_ai_service()
    nba = await ai.generate_next_best_action({
        "intent": c.intent,
        "sentiment": c.sentiment,
        "message": msg_text,
        "tier": c.customer.tier if c.customer else "Standard"
    })

    # Save recommendation
    rec = AIRecommendation(
        conversation_id=c.id,
        action=nba.action,
        reason=nba.reason,
        confidence=nba.confidence,
        expected_outcome=nba.expected_outcome,
        requires_approval=nba.requires_approval,
        status="PROPOSED"
    )
    db.add(rec)
    db.commit()
    db.refresh(rec)

    return {
        "id": rec.id,
        "action": rec.action,
        "reason": rec.reason,
        "confidence": rec.confidence,
        "expected_outcome": rec.expected_outcome,
        "requires_approval": rec.requires_approval,
        "status": rec.status
    }

@router.post("/{id}/summarize", response_model=Dict[str, Any])
async def summarize_conversation_endpoint(id: int, db: Session = Depends(get_db)) -> Dict[str, Any]:
    c = db.query(Conversation).filter(Conversation.id == id).first()
    if not c:
        raise HTTPException(status_code=404, detail="Conversation not found")

    messages = db.query(Message).filter(Message.conversation_id == c.id).order_by(Message.created_at.asc()).all()
    msg_dicts = [{"speaker": m.speaker, "content": m.content, "sentiment": m.sentiment} for m in messages]

    ai = get_ai_service()
    summary = await ai.generate_summary(msg_dicts)

    c.summary = summary.summary
    db.commit()

    return {
        "summary": summary.summary,
        "customer_issue": summary.customer_issue,
        "actions_taken": summary.actions_taken,
        "resolution": summary.resolution,
        "follow_up_required": summary.follow_up_required,
        "sentiment": summary.sentiment,
        "intent": summary.intent,
        "products_mentioned": summary.products_mentioned,
        "revenue_opportunity": summary.revenue_opportunity
    }

@router.post("/{id}/resolve", response_model=Dict[str, Any])
async def execute_resolution_flow(
    id: int,
    payload: Dict[str, Any] = Body(...),
    db: Session = Depends(get_db)
) -> Dict[str, Any]:
    c = db.query(Conversation).filter(Conversation.id == id).first()
    if not c:
        raise HTTPException(status_code=404, detail="Conversation not found")

    action_type = payload.get("action_type", "REFUND")
    amount = float(payload.get("amount", 42.50))
    issue = payload.get("issue", "Duplicate charge on order #49281")

    # Step 1: Guardrail Policy Check
    guardrail_eval = guardrail_engine.evaluate_action(
        action_type=action_type,
        payload={"amount": amount, "issue": issue}
    )

    approval_status = "AUTO_APPROVED" if guardrail_eval["allowed_autonomous"] else "PENDING_HUMAN"
    exec_result = f"Reversed ${amount:.2f} to original payment card (Auth Code: #REV-90142)." if guardrail_eval["allowed_autonomous"] else "Awaiting required human authorization before payment gateway dispatch."

    # Step 2: Store AIDecision
    decision = AIDecision(
        conversation_id=c.id,
        decision=f"Process {action_type} for ${amount:.2f}",
        action_type=action_type,
        reason=guardrail_eval["reason"],
        confidence=0.96,
        retrieved_knowledge="Billing FAQ v2.4 (Page 2) & Refund Policy v3.1 (Page 1)",
        risk_level=guardrail_eval["risk_level"],
        approval_status=approval_status,
        execution_result=exec_result,
        actor="Autonomous Billing Agent"
    )
    db.add(decision)

    # Step 3: Record in Audit Log
    audit = AuditLog(
        conversation_id=c.id,
        actor="Autonomous Billing Agent",
        ai_provider="MockAI / Gemini-Ready",
        model="MockAI-v1.0",
        action=f"Execute {action_type} (${amount:.2f})",
        reason=guardrail_eval["reason"],
        confidence=0.96,
        approval=approval_status,
        result="SUCCESS" if guardrail_eval["allowed_autonomous"] else "PENDING_APPROVAL",
        ip_address="127.0.0.1"
    )
    db.add(audit)

    # If auto approved, update conversation and case
    if guardrail_eval["allowed_autonomous"]:
        c.status = "RESOLVED"
        c.summary = f"Autonomous AI resolved {issue} with ${amount:.2f} credit reversal."
        case_obj = db.query(Case).filter(Case.conversation_id == c.id).first()
        if case_obj:
            case_obj.status = "RESOLVED"
            case_obj.resolution_notes = exec_result

    db.commit()
    db.refresh(decision)

    # Notify WebSockets
    await ws_manager.broadcast({
        "event": "RESOLUTION_EVENT",
        "conversation_id": c.id,
        "decision_id": decision.id,
        "approval_status": approval_status,
        "risk_level": guardrail_eval["risk_level"],
        "result": exec_result
    })

    return {
        "decision_id": decision.id,
        "action_type": action_type,
        "amount": amount,
        "allowed_autonomous": guardrail_eval["allowed_autonomous"],
        "requires_human_approval": guardrail_eval["requires_human_approval"],
        "approval_level": guardrail_eval["approval_level"],
        "risk_level": guardrail_eval["risk_level"],
        "policy_rule": guardrail_eval["policy_rule"],
        "approval_status": approval_status,
        "execution_result": exec_result
    }
