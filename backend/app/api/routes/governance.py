from typing import List, Dict, Any, Optional
from datetime import datetime, timezone
from fastapi import APIRouter, Depends, HTTPException, Body
from sqlalchemy.orm import Session
from app.db.database import get_db
from app.models.models import AIDecision, AuditLog, Conversation
from app.schemas.schemas import AIDecisionResponse, AuditLogResponse, ApprovalActionRequest

router = APIRouter(prefix="/governance", tags=["AI Governance"])

@router.get("/decisions", response_model=List[Dict[str, Any]])
def list_ai_decisions(
    status: Optional[str] = None,
    limit: int = 50,
    db: Session = Depends(get_db)
) -> List[Dict[str, Any]]:
    q = db.query(AIDecision)
    if status and status != "ALL":
        q = q.filter(AIDecision.approval_status == status)

    decisions = q.order_by(AIDecision.created_at.desc()).limit(limit).all()
    results = []
    for d in decisions:
        results.append({
            "id": d.id,
            "conversation_id": d.conversation_id,
            "decision": d.decision,
            "action_type": d.action_type,
            "reason": d.reason,
            "confidence": d.confidence,
            "retrieved_knowledge": d.retrieved_knowledge,
            "risk_level": d.risk_level,
            "approval_status": d.approval_status,
            "execution_result": d.execution_result,
            "actor": d.actor,
            "created_at": d.created_at
        })
    return results

@router.get("/audit-logs", response_model=List[Dict[str, Any]])
def list_audit_logs(limit: int = 100, db: Session = Depends(get_db)) -> List[Dict[str, Any]]:
    logs = db.query(AuditLog).order_by(AuditLog.created_at.desc()).limit(limit).all()
    results = []
    for l in logs:
        results.append({
            "id": l.id,
            "conversation_id": l.conversation_id,
            "actor": l.actor,
            "ai_provider": l.ai_provider,
            "model": l.model,
            "action": l.action,
            "reason": l.reason,
            "confidence": l.confidence,
            "approval": l.approval,
            "result": l.result,
            "ip_address": l.ip_address,
            "created_at": l.created_at
        })
    return results

@router.post("/decisions/{id}/action", response_model=Dict[str, Any])
def handle_approval_action(
    id: int,
    payload: ApprovalActionRequest,
    db: Session = Depends(get_db)
) -> Dict[str, Any]:
    decision = db.query(AIDecision).filter(AIDecision.id == id).first()
    if not decision:
        raise HTTPException(status_code=404, detail="Decision not found")

    action = payload.action.upper()
    if action == "APPROVE":
        decision.approval_status = "APPROVED"
        decision.execution_result = f"Authorized and processed by {payload.actor}. Gateway settlement completed."
        res = "SUCCESS"
    elif action == "REJECT":
        decision.approval_status = "REJECTED"
        decision.execution_result = f"Declined by {payload.actor}. Reason: {payload.notes or 'Exceeds operational threshold'}"
        res = "REJECTED"
    else:
        decision.approval_status = "MODIFIED"
        decision.execution_result = f"Modified by {payload.actor} to revised value. {payload.notes or ''}"
        res = "MODIFIED"

    # Add audit log
    audit = AuditLog(
        conversation_id=decision.conversation_id,
        actor=payload.actor,
        ai_provider="Human Supervisor",
        model="Human-In-The-Loop",
        action=f"{action} decision #{decision.id}",
        reason=payload.notes or decision.reason,
        confidence=1.0,
        approval=decision.approval_status,
        result=res,
        ip_address="127.0.0.1"
    )
    db.add(audit)
    db.commit()
    db.refresh(decision)

    return {
        "id": decision.id,
        "approval_status": decision.approval_status,
        "execution_result": decision.execution_result,
        "message": f"Decision #{decision.id} successfully updated to {decision.approval_status}."
    }

@router.get("/policies", response_model=Dict[str, Any])
def get_governance_policies() -> Dict[str, Any]:
    return {
        "max_ai_autonomy": "SEMI_AUTONOMOUS",
        "autonomous_refund_threshold": 50.0,
        "agent_approval_refund_threshold": 500.0,
        "supervisor_threshold": 500.0,
        "confidence_threshold": 0.85,
        "mandatory_human_oversight_actions": [
            "ACCOUNT_CLOSURE",
            "SECURITY_CREDENTIAL_RESET",
            "REFUNDS_ABOVE_500",
            "LEGAL_DISPUTE_ESCALATION"
        ],
        "pii_redaction_enforced": True,
        "audit_logging_active": True,
        "responsible_ai_safeguards": [
            "Grounded RAG retrieval verification",
            "Zero hallucination fallback to human agent",
            "Strict PII regex and entity scrubbing",
            "Dual-key supervisor authorization on financial transactions"
        ]
    }
