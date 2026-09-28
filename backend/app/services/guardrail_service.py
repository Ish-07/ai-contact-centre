import logging
from typing import Dict, Any, Tuple
from app.core.config import settings

logger = logging.getLogger(__name__)

class GuardrailEngine:
    """Enterprise safety and policy enforcement engine.
    Ensures LLM never directly executes sensitive operations without deterministic checks."""

    def __init__(
        self,
        autonomous_refund_limit: float = settings.AUTONOMOUS_REFUND_LIMIT,
        agent_approval_refund_limit: float = settings.AGENT_APPROVAL_REFUND_LIMIT
    ):
        self.auto_refund_limit = autonomous_refund_limit
        self.agent_refund_limit = agent_approval_refund_limit

    def evaluate_action(
        self,
        action_type: str,
        payload: Dict[str, Any],
        actor_role: str = "AI_AGENT"
    ) -> Dict[str, Any]:
        """Evaluates whether an action can execute autonomously or requires human approval.
        Returns:
            allowed_autonomous (bool),
            requires_human_approval (bool),
            approval_level ("NONE", "AGENT", "SUPERVISOR"),
            risk_level ("LOW", "MEDIUM", "HIGH"),
            reason (str)
        """
        action = action_type.upper()

        # 1. Financial Reversals / Refunds
        if action in ["REFUND", "REVERSAL", "CHARGEBACK_CREDIT"]:
            amount = float(payload.get("amount", 0.0))

            if amount <= self.auto_refund_limit:
                return {
                    "allowed_autonomous": True,
                    "requires_human_approval": False,
                    "approval_level": "NONE",
                    "risk_level": "LOW",
                    "policy_rule": f"Refund amount ${amount:.2f} <= ${self.auto_refund_limit:.2f} threshold",
                    "reason": "Permitted for autonomous AI execution under low-risk policy."
                }
            elif amount <= self.agent_refund_limit:
                return {
                    "allowed_autonomous": False,
                    "requires_human_approval": True,
                    "approval_level": "AGENT",
                    "risk_level": "MEDIUM",
                    "policy_rule": f"Refund amount ${amount:.2f} between ${self.auto_refund_limit:.2f} and ${self.agent_refund_limit:.2f}",
                    "reason": "Requires human Agent review and approval before fund disbursement."
                }
            else:
                return {
                    "allowed_autonomous": False,
                    "requires_human_approval": True,
                    "approval_level": "SUPERVISOR",
                    "risk_level": "HIGH",
                    "policy_rule": f"Refund amount ${amount:.2f} > ${self.agent_refund_limit:.2f} maximum agent threshold",
                    "reason": "Requires high-tier Supervisor authorization due to financial risk."
                }

        # 2. Account Cancellation / Closure
        elif action in ["ACCOUNT_CLOSURE", "TERMINATE_SUBSCRIPTION"]:
            return {
                "allowed_autonomous": False,
                "requires_human_approval": True,
                "approval_level": "SUPERVISOR",
                "risk_level": "HIGH",
                "policy_rule": "Account closure always mandates human oversight",
                "reason": "Irreversible account termination requires supervisor sign-off to preserve customer retention."
            }

        # 3. Hardware Replacement
        elif action in ["HARDWARE_REPLACEMENT", "RMA_SHIPPING"]:
            warranty_verified = payload.get("warranty_verified", False)
            if warranty_verified:
                return {
                    "allowed_autonomous": True,
                    "requires_human_approval": False,
                    "approval_level": "NONE",
                    "risk_level": "LOW",
                    "policy_rule": "Verified warranty RMA automation rule",
                    "reason": "Automated replacement authorized under active warranty terms."
                }
            else:
                return {
                    "allowed_autonomous": False,
                    "requires_human_approval": True,
                    "approval_level": "AGENT",
                    "risk_level": "MEDIUM",
                    "policy_rule": "Unverified warranty requires manual inspection",
                    "reason": "Proof of purchase required from customer before approving hardware replacement."
                }

        # 4. Standard Information / Coaching / Ticketing
        return {
            "allowed_autonomous": True,
            "requires_human_approval": False,
            "approval_level": "NONE",
            "risk_level": "LOW",
            "policy_rule": "Informational / Standard support flow",
            "reason": "Standard non-destructive action permitted."
        }

guardrail_engine = GuardrailEngine()
