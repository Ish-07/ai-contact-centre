from typing import Dict, Any
from fastapi import APIRouter
from app.services.simulation_service import simulation_service
from app.schemas.schemas import AutonomousResolutionResponse, ResolutionWorkflowStep
from app.services.guardrail_service import guardrail_engine

router = APIRouter(prefix="/simulation", tags=["Simulation & Autonomy"])

@router.get("/status", response_model=Dict[str, Any])
def get_simulation_status() -> Dict[str, Any]:
    return simulation_service.get_status()

@router.post("/start", response_model=Dict[str, Any])
async def start_simulation() -> Dict[str, Any]:
    await simulation_service.start()
    return {"message": "Simulation started", "status": simulation_service.get_status()}

@router.post("/pause", response_model=Dict[str, Any])
def pause_simulation() -> Dict[str, Any]:
    simulation_service.pause()
    return {"message": "Simulation paused", "status": simulation_service.get_status()}

@router.post("/resume", response_model=Dict[str, Any])
def resume_simulation() -> Dict[str, Any]:
    simulation_service.resume()
    return {"message": "Simulation resumed", "status": simulation_service.get_status()}

@router.post("/reset", response_model=Dict[str, Any])
def reset_simulation() -> Dict[str, Any]:
    simulation_service.reset()
    return {"message": "Simulation reset", "status": simulation_service.get_status()}

@router.post("/run-resolution-workflow", response_model=AutonomousResolutionResponse)
def run_autonomous_resolution_workflow(amount: float = 42.50) -> AutonomousResolutionResponse:
    """Executes the full 14-step Agentic AI resolution workflow.
    Validates autonomy guardrails and returns step-by-step progress."""
    eval_res = guardrail_engine.evaluate_action("REFUND", {"amount": amount})

    steps = [
        ResolutionWorkflowStep(
            step_number=1,
            name="Intent Detection",
            status="COMPLETED",
            timestamp="10:04:01",
            confidence=0.96,
            approval_requirement="NONE",
            result="Detected #DUPLICATE_BILLING on order #49281"
        ),
        ResolutionWorkflowStep(
            step_number=2,
            name="Customer Identity Verification",
            status="COMPLETED",
            timestamp="10:04:02",
            confidence=0.98,
            approval_requirement="NONE",
            result="Voiceprint & Session Token verified (Elena Rostova, CUST-1001)"
        ),
        ResolutionWorkflowStep(
            step_number=3,
            name="Policy Knowledge Retrieval",
            status="COMPLETED",
            timestamp="10:04:03",
            confidence=0.94,
            approval_requirement="NONE",
            result="Retrieved Billing FAQ v2.4 (Page 2) & Refund Policy v3.1"
        ),
        ResolutionWorkflowStep(
            step_number=4,
            name="Ledger Transaction Audit",
            status="COMPLETED",
            timestamp="10:04:04",
            confidence=0.99,
            approval_requirement="NONE",
            result="Identified duplicate transaction #TXN-9024 ($42.50) matching #TXN-9025"
        ),
        ResolutionWorkflowStep(
            step_number=5,
            name="Eligibility Determination",
            status="COMPLETED",
            timestamp="10:04:05",
            confidence=0.97,
            approval_requirement="NONE",
            result="Customer eligible for immediate credit reversal under duplicate charge rule"
        ),
        ResolutionWorkflowStep(
            step_number=6,
            name="Resolution Plan Generation",
            status="COMPLETED",
            timestamp="10:04:06",
            confidence=0.95,
            approval_requirement="NONE",
            result="Generated automated refund reversal plan for $42.50"
        ),
        ResolutionWorkflowStep(
            step_number=7,
            name="Guardrail Engine Evaluation",
            status="COMPLETED",
            timestamp="10:04:07",
            confidence=1.0,
            approval_requirement=eval_res["approval_level"],
            result=eval_res["policy_rule"]
        ),
        ResolutionWorkflowStep(
            step_number=8,
            name="Payment Gateway Execution",
            status="COMPLETED" if eval_res["allowed_autonomous"] else "BLOCKED",
            timestamp="10:04:08",
            confidence=0.99,
            approval_requirement=eval_res["approval_level"],
            result="Dispatched reversal to Visa **** 4444 (Gateway Auth #REV-88192)" if eval_res["allowed_autonomous"] else "Paused. Awaiting human supervisor approval modal."
        ),
        ResolutionWorkflowStep(
            step_number=9,
            name="Customer Notification",
            status="COMPLETED" if eval_res["allowed_autonomous"] else "PENDING",
            timestamp="10:04:09",
            confidence=1.0,
            approval_requirement="NONE",
            result="Sent SMS & Email confirmation with transaction receipt" if eval_res["allowed_autonomous"] else "Pending execution"
        ),
        ResolutionWorkflowStep(
            step_number=10,
            name="Case Status & CRM Update",
            status="COMPLETED" if eval_res["allowed_autonomous"] else "PENDING",
            timestamp="10:04:10",
            confidence=1.0,
            approval_requirement="NONE",
            result="Case #CASE-4091 updated to RESOLVED" if eval_res["allowed_autonomous"] else "Case marked PENDING_APPROVAL"
        ),
        ResolutionWorkflowStep(
            step_number=11,
            name="Conversation Summarization",
            status="COMPLETED",
            timestamp="10:04:11",
            confidence=0.93,
            approval_requirement="NONE",
            result="Structured AI summary recorded to CRM timeline"
        ),
        ResolutionWorkflowStep(
            step_number=12,
            name="Immutable Audit Logging",
            status="COMPLETED",
            timestamp="10:04:12",
            confidence=1.0,
            approval_requirement="NONE",
            result="Audit hash #AUD-99218 registered in AI Governance ledger"
        ),
        ResolutionWorkflowStep(
            step_number=13,
            name="Sentiment Re-evaluation",
            status="COMPLETED",
            timestamp="10:04:13",
            confidence=0.95,
            approval_requirement="NONE",
            result="Customer sentiment recovered from Frustrated to Delighted"
        ),
        ResolutionWorkflowStep(
            step_number=14,
            name="Analytics Telemetry Sync",
            status="COMPLETED",
            timestamp="10:04:14",
            confidence=1.0,
            approval_requirement="NONE",
            result="Contact Center KPI metrics updated (+1 autonomous resolution)"
        )
    ]

    return AutonomousResolutionResponse(
        case_number="#CASE-4091",
        intent="Duplicate Billing",
        customer_id="CUST-1001",
        issue=f"Duplicate debit of ${amount:.2f} on order #49281",
        eligibility=True,
        action_plan=f"Autonomous Refund Reversal (${amount:.2f})",
        requires_human_approval=eval_res["requires_human_approval"],
        approval_level=eval_res["approval_level"],
        risk_level=eval_res["risk_level"],
        confidence=0.96,
        steps=steps,
        execution_result=f"Reversed ${amount:.2f} to original payment card (Auth Code: #REV-90142)." if eval_res["allowed_autonomous"] else "Action paused: Requires human approval."
    )
