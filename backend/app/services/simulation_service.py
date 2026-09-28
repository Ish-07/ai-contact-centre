import asyncio
import logging
from typing import Dict, Any, Optional
from datetime import datetime, timezone
from app.services.websocket_manager import ws_manager
from app.services.ai.factory import get_ai_service

logger = logging.getLogger(__name__)

class SimulationService:
    """Orchestrates interactive live contact center simulations."""

    def __init__(self):
        self.is_running = False
        self.is_paused = False
        self.current_step = 0
        self.task: Optional[asyncio.Task] = None

    def get_status(self) -> Dict[str, Any]:
        return {
            "is_running": self.is_running,
            "is_paused": self.is_paused,
            "current_step": self.current_step,
            "total_steps": 8
        }

    async def start(self):
        if self.is_running:
            return
        self.is_running = True
        self.is_paused = False
        self.current_step = 0
        self.task = asyncio.create_task(self._run_simulation_loop())

    def pause(self):
        self.is_paused = True

    def resume(self):
        self.is_paused = False

    def reset(self):
        self.is_running = False
        self.is_paused = False
        self.current_step = 0
        if self.task and not self.task.done():
            self.task.cancel()

    async def _run_simulation_loop(self):
        ai = get_ai_service()

        scenario_events = [
            {
                "step": 1,
                "type": "NEW_MESSAGE",
                "speaker": "CUSTOMER",
                "channel": "CHAT",
                "content": "I have been charged twice for the same order (#49281) and nobody is helping me. My card is 4111-2222-3333-4444!",
                "customer_name": "Elena Rostova",
                "customer_id": "CUST-1001",
                "customer_tier": "Gold",
                "delay": 2.5
            },
            {
                "step": 2,
                "type": "AI_ANALYSIS",
                "sentiment": "Frustrated",
                "sentiment_score": -0.72,
                "mood": "Frustrated",
                "intent": "Duplicate Billing",
                "risk": "HIGH",
                "pii_detected": True,
                "pii_summary": "1 Credit Card detected and automatically masked (**** **** **** 4444).",
                "delay": 2.0
            },
            {
                "step": 3,
                "type": "KNOWLEDGE_RETRIEVAL",
                "retrieved_sources": [
                    {"title": "Billing FAQ v2.4", "page": 2, "score": 96.2, "snippet": "Duplicate transactions flagged within 24 hours are eligible for immediate automated reversal."},
                    {"title": "Refund Policy v3.1", "page": 1, "score": 91.5, "snippet": "Approved refunds are credited to the original payment method within 5-7 business days."}
                ],
                "grounded_answer": "According to Billing FAQ v2.4 (Page 2), duplicate charges are eligible for immediate reversal under the autonomous $50 threshold.",
                "delay": 2.5
            },
            {
                "step": 4,
                "type": "AI_COACHING",
                "coaching_tip": "Apologize sincerely, acknowledge the friction, and confirm that the duplicate debit has been located in the ledger.",
                "empathy_statement": "I truly apologize for the duplicate charge on order #49281, Elena! I can see the secondary charge right here in our ledger and I will reverse it immediately.",
                "next_best_action": "Verify duplicate charge in ledger and process automated refund",
                "confidence": 0.94,
                "requires_approval": False,
                "delay": 3.0
            },
            {
                "step": 5,
                "type": "NEW_MESSAGE",
                "speaker": "AGENT",
                "channel": "CHAT",
                "content": "I truly apologize for the duplicate charge on order #49281, Elena! I can see the duplicate transaction #TXN-9024 right here and am initiating an instant reversal for $42.50.",
                "delay": 2.5
            },
            {
                "step": 6,
                "type": "AUTONOMOUS_RESOLUTION",
                "action": "EXECUTE_REFUND",
                "amount": 42.50,
                "guardrail_status": "AUTO_APPROVED",
                "policy": "Refund <= $50.00 threshold",
                "result": "Dispatched reversal of $42.50 to Visa **** 4444. Gateway Auth Code: #REV-88192.",
                "delay": 3.0
            },
            {
                "step": 7,
                "type": "NEW_MESSAGE",
                "speaker": "CUSTOMER",
                "channel": "CHAT",
                "content": "Thank you so much! I just received the bank notification. That was surprisingly fast and helpful.",
                "sentiment": "Satisfied",
                "delay": 2.5
            },
            {
                "step": 8,
                "type": "CONVERSATION_SUMMARY",
                "summary": "Customer contacted regarding duplicate billing on order #49281 ($42.50). Autonomous AI resolved and reversed charge under guardrail policy. Customer sentiment shifted from Frustrated to Delighted.",
                "actions_taken": "Verified duplicate in ledger, processed automated refund, customer confirmed receipt.",
                "case_status": "RESOLVED",
                "csat_estimate": "10/10",
                "delay": 1.0
            }
        ]

        try:
            for event in scenario_events:
                while self.is_paused and self.is_running:
                    await asyncio.sleep(0.5)

                if not self.is_running:
                    break

                self.current_step = event["step"]
                payload = {
                    "event_source": "SIMULATION_ENGINE",
                    "timestamp": datetime.now(timezone.utc).isoformat(),
                    "step": self.current_step,
                    "total_steps": len(scenario_events),
                    "data": event
                }
                await ws_manager.broadcast(payload)
                await asyncio.sleep(event.get("delay", 2.0))

            # Conclude simulation
            if self.is_running:
                await ws_manager.broadcast({
                    "event_source": "SIMULATION_ENGINE",
                    "timestamp": datetime.now(timezone.utc).isoformat(),
                    "step": 8,
                    "status": "COMPLETED",
                    "message": "Simulation scenario completed successfully."
                })
        except asyncio.CancelledError:
            logger.info("Simulation task cancelled.")
        finally:
            self.is_running = False

simulation_service = SimulationService()
