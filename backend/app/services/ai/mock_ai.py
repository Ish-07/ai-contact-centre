import re
from typing import List, Dict, Any, Optional
from app.services.ai.base import (
    AIService, SentimentResult, IntentResult, MoodAnalysis,
    NextBestAction, CoachingGuidance, ConversationSummary,
    ResolutionPlan, KnowledgeAnswer
)

class MockAIService(AIService):
    """Realistic deterministic and heuristic AI service for offline & demo operation."""

    async def analyze_conversation(self, messages: List[Dict[str, Any]]) -> Dict[str, Any]:
        if not messages:
            return {
                "sentiment": "Neutral",
                "score": 0.0,
                "intent": "General Inquiry",
                "risk": "LOW",
                "recommended_action": "Greet customer and ask how you can help."
            }

        last_message = messages[-1].get("content", "")
        sentiment_res = await self.detect_sentiment(last_message)
        intent_res = await self.detect_intent(last_message)
        mood_res = await self.analyze_customer_mood(last_message, [m.get("content", "") for m in messages[:-1]])

        return {
            "sentiment": sentiment_res.sentiment,
            "sentiment_score": sentiment_res.score,
            "sentiment_confidence": sentiment_res.confidence,
            "intent": intent_res.intent,
            "intent_confidence": intent_res.confidence,
            "mood": mood_res.mood,
            "mood_trend": mood_res.trend,
            "escalation_risk": mood_res.escalation_risk,
            "recommended_action": (await self.generate_next_best_action({
                "sentiment": sentiment_res.sentiment,
                "intent": intent_res.intent,
                "message": last_message
            })).action
        }

    async def detect_sentiment(self, text: str) -> SentimentResult:
        lower = text.lower()
        # Angry / Frustrated keywords across English, Spanish, French, German, Hindi
        angry_patterns = [
            "furious", "terrible", "worst", "unacceptable", "scam", "lawyer", "ridiculous",
            "horrible", "robbery", "enojado", "inacceptable", "furieux", "wütend", "गुस्सा", "धोखा"
        ]
        frustrated_patterns = [
            "charged twice", "double charged", "nobody is helping", "waiting for hours",
            "still waiting", "broken", "useless", "frustrated", "again and again", "not working",
            "doble cobro", "encore un problème", "funktioniert nicht", "दो बार पैसे", "मदद नहीं"
        ]
        confused_patterns = [
            "how do i", "not sure", "confused", "don't understand", "why did", "explain",
            "no entiendo", "comprends pas", "verstehe nicht", "समझ नहीं"
        ]
        positive_patterns = [
            "thank you", "great", "excellent", "awesome", "fixed", "appreciate", "helpful",
            "gracias", "merci", "danke", "धन्यवाद", "बहुत अच्छा"
        ]

        if any(p in lower for p in angry_patterns):
            return SentimentResult(
                sentiment="Angry",
                score=-0.85,
                confidence=0.94,
                reason="High intensity negative language detected indicating extreme dissatisfaction."
            )
        elif any(p in lower for p in frustrated_patterns):
            return SentimentResult(
                sentiment="Frustrated",
                score=-0.65,
                confidence=0.91,
                reason="Customer expressed repeated friction, unresolved issues, or unexpected charges."
            )
        elif any(p in lower for p in confused_patterns):
            return SentimentResult(
                sentiment="Confused",
                score=-0.15,
                confidence=0.88,
                reason="Customer requested clarification on complex steps or policy terms."
            )
        elif any(p in lower for p in positive_patterns):
            return SentimentResult(
                sentiment="Satisfied",
                score=0.85,
                confidence=0.95,
                reason="Customer expressed explicit gratitude and satisfaction with service."
            )

        return SentimentResult(
            sentiment="Neutral",
            score=0.05,
            confidence=0.86,
            reason="Objective informational communication without strong emotional markers."
        )

    async def detect_intent(self, text: str) -> IntentResult:
        lower = text.lower()

        if any(w in lower for w in ["charged twice", "double charged", "duplicate", "two times", "doble", "dos veces", "deux fois", "doppelt", "दो बार"]):
            return IntentResult(intent="Duplicate Billing", confidence=0.95, reason="User reports being billed multiple times for single order.")
        elif any(w in lower for w in ["refund", "money back", "reembolso", "remboursement", "rückerstattung", "रिफंड", "पैसे वापस"]):
            return IntentResult(intent="Refund Request", confidence=0.93, reason="Customer is requesting monetary reimbursement.")
        elif any(w in lower for w in ["replace", "replacement", "warranty", "garantía", "garantie", "वारंटी", "बदल"]):
            return IntentResult(intent="Warranty Replacement", confidence=0.90, reason="Inquiry regarding replacement or warranty coverage claim.")
        elif any(w in lower for w in ["cancel", "cancellation", "cancelar", "annuler", "stornieren", "रद्द"]):
            return IntentResult(intent="Order Cancellation", confidence=0.89, reason="Customer seeking to cancel an existing order or subscription.")
        elif any(w in lower for w in ["troubleshoot", "turn on", "won't start", "not working", "error", "panne", "खराब"]):
            return IntentResult(intent="Technical Troubleshooting", confidence=0.92, reason="Hardware or software malfunction assistance.")
        elif any(w in lower for w in ["shipping", "tracking", "delivery", "where is", "envío", "livraison", "versand", "डिलीवरी"]):
            return IntentResult(intent="Shipping & Delivery Status", confidence=0.88, reason="Tracking or delayed delivery inquiry.")
        elif any(w in lower for w in ["premium", "upgrade", "vip", "priority"]):
            return IntentResult(intent="Premium Support Tier", confidence=0.87, reason="Customer inquiring about SLA or VIP tier benefits.")

        return IntentResult(intent="General Support Inquiry", confidence=0.82, reason="General informational query regarding company services.")

    async def analyze_customer_mood(self, text: str, history: List[str]) -> MoodAnalysis:
        sentiment = await self.detect_sentiment(text)
        prev_sentiments = []
        for h in history[-3:]:
            s = await self.detect_sentiment(h)
            prev_sentiments.append(s.sentiment)

        # Trend analysis
        deteriorating = any(s in ["Frustrated", "Angry"] for s in prev_sentiments) and sentiment.sentiment in ["Frustrated", "Angry"]
        improving = any(s in ["Frustrated", "Angry"] for s in prev_sentiments) and sentiment.sentiment in ["Neutral", "Satisfied"]

        if sentiment.sentiment == "Angry":
            return MoodAnalysis(mood="Angry", score=-0.9, trend="deteriorating" if deteriorating else "stable", escalation_risk="HIGH")
        elif sentiment.sentiment == "Frustrated":
            risk = "HIGH" if deteriorating else "MEDIUM"
            return MoodAnalysis(mood="Frustrated", score=-0.6, trend="deteriorating" if deteriorating else "stable", escalation_risk=risk)
        elif sentiment.sentiment == "Confused":
            return MoodAnalysis(mood="Confused", score=-0.2, trend="stable", escalation_risk="LOW")
        elif sentiment.sentiment == "Satisfied":
            return MoodAnalysis(mood="Delighted", score=0.8, trend="improving", escalation_risk="LOW")

        return MoodAnalysis(mood="Calm", score=0.0, trend="stable", escalation_risk="LOW")

    async def generate_summary(self, messages: List[Dict[str, Any]]) -> ConversationSummary:
        if not messages:
            return ConversationSummary(
                summary="No messages exchanged in this conversation.",
                customer_issue="N/A",
                actions_taken="Session initiated.",
                resolution="Pending interaction.",
                follow_up_required=False,
                sentiment="Neutral",
                intent="General Inquiry",
                products_mentioned=[],
                revenue_opportunity=None
            )

        all_text = " ".join([m.get("content", "") for m in messages])
        last_intent = (await self.detect_intent(all_text)).intent
        last_sentiment = (await self.detect_sentiment(all_text)).sentiment

        if "duplicate" in all_text.lower() or "twice" in all_text.lower():
            return ConversationSummary(
                summary="Customer contacted regarding a duplicate charge on order #49281. AI verified transaction logs and initiated autonomous refund under policy limit.",
                customer_issue="Customer was charged twice ($42.50 duplicate debit).",
                actions_taken="Verified billing records, identified duplicate transaction ID #TXN-9024, processed automated refund reversal.",
                resolution="Refund of $42.50 successfully approved and dispatched. Case closed.",
                follow_up_required=False,
                sentiment="Satisfied",
                intent="Duplicate Billing",
                products_mentioned=["Pro Headset Wireless v2", "Annual Plan"],
                revenue_opportunity="High retention candidate. Eligible for 10% annual loyalty renewal coupon."
            )

        return ConversationSummary(
            summary=f"Customer engaged support regarding {last_intent}. Assisted with policy guidelines and verified customer profile details.",
            customer_issue=f"Inquiry related to {last_intent}.",
            actions_taken="Reviewed documentation, guided customer through resolution options, updated customer record.",
            resolution="Issue addressed in accordance with standard support procedures.",
            follow_up_required=last_sentiment in ["Frustrated", "Angry"],
            sentiment=last_sentiment,
            intent=last_intent,
            products_mentioned=["Standard Device"],
            revenue_opportunity="Potential upgrade to Premium Support tier."
        )

    async def detect_pii(self, text: str) -> Dict[str, Any]:
        email_pattern = r'[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}'
        phone_pattern = r'\b(?:\+?\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}\b'
        card_pattern = r'\b(?:\d{4}[-\s]?){3}\d{4}\b'
        ssn_pattern = r'\b\d{3}-\d{2}-\d{4}\b'

        detections = []
        masked = text

        for m in re.finditer(card_pattern, text):
            raw = m.group(0)
            clean = raw.replace("-", "").replace(" ", "")
            mask = f"**** **** **** {clean[-4:]}"
            detections.append({"entity_type": "CREDIT_CARD", "raw": raw, "masked": mask, "start": m.start(), "end": m.end()})
            masked = masked.replace(raw, mask)

        for m in re.finditer(email_pattern, text):
            raw = m.group(0)
            parts = raw.split("@")
            mask = f"{parts[0][:2]}***@{parts[1]}"
            detections.append({"entity_type": "EMAIL", "raw": raw, "masked": mask, "start": m.start(), "end": m.end()})
            masked = masked.replace(raw, mask)

        for m in re.finditer(phone_pattern, text):
            raw = m.group(0)
            mask = f"***-***-{raw[-4:]}"
            detections.append({"entity_type": "PHONE", "raw": raw, "masked": mask, "start": m.start(), "end": m.end()})
            masked = masked.replace(raw, mask)

        for m in re.finditer(ssn_pattern, text):
            raw = m.group(0)
            mask = f"***-**-{raw[-4:]}"
            detections.append({"entity_type": "GOV_ID", "raw": raw, "masked": mask, "start": m.start(), "end": m.end()})
            masked = masked.replace(raw, mask)

        return {
            "original_text": text,
            "masked_text": masked,
            "entities_count": len(detections),
            "detections": detections
        }

    async def generate_next_best_action(self, context: Dict[str, Any]) -> NextBestAction:
        intent = context.get("intent", "General Inquiry")
        sentiment = context.get("sentiment", "Neutral")
        msg = context.get("message", "").lower()

        if "duplicate" in intent.lower() or "billing" in intent.lower() or "charged twice" in msg:
            return NextBestAction(
                action="Verify duplicate charge in ledger and process automated refund",
                reason="Customer experienced duplicate billing friction. Fast autonomous resolution restores trust and prevents chargebacks.",
                confidence=0.94,
                expected_outcome="Instant resolution, 95% CSAT recovery, zero chargeback penalty.",
                requires_approval=False  # If < $50
            )
        elif "warranty" in intent.lower() or "replacement" in intent.lower():
            return NextBestAction(
                action="Offer warranty replacement unit with expedited shipping",
                reason="Customer unit is within the 1-year manufacturer warranty period and has reported hardware failure.",
                confidence=0.89,
                expected_outcome="Prevents negative review and retains customer lifetime value.",
                requires_approval=True  # Replacement hardware requires confirmation
            )
        elif sentiment in ["Frustrated", "Angry"]:
            return NextBestAction(
                action="De-escalate immediately with empathetic apology and offer direct resolution",
                reason="Elevated customer sentiment risk detected; prompt validation lowers escalation by 68%.",
                confidence=0.92,
                expected_outcome="Reduces supervisor escalation risk from HIGH to LOW.",
                requires_approval=False
            )
        elif "cancel" in intent.lower():
            return NextBestAction(
                action="Present 3-month discounted retention package before cancellation",
                reason="High-value account considering churn; retention discount reduces cancellation probability by 42%.",
                confidence=0.87,
                expected_outcome="Account preserved, retention revenue protected.",
                requires_approval=True
            )

        return NextBestAction(
            action="Provide step-by-step troubleshooting guide from knowledge base",
            reason="Standard procedural inquiry with verified resolution article in company knowledge base.",
            confidence=0.86,
            expected_outcome="First contact resolution achieved within SLA.",
            requires_approval=False
        )

    async def generate_agent_coaching(self, current_message: str, context: Dict[str, Any]) -> CoachingGuidance:
        sentiment = (await self.detect_sentiment(current_message)).sentiment

        if sentiment in ["Angry", "Frustrated"]:
            return CoachingGuidance(
                coaching_tip="Acknowledge the customer's frustration immediately. Do not debate transaction records before apologizing for the stress caused.",
                empathy_statement="I truly apologize for the unexpected charge and the frustration this has caused. Let me look into this right away and make it right for you.",
                suggested_actions=[
                    "Apologize sincerely and validate the feeling",
                    "Verify transaction ID in the ledger",
                    "Execute immediate refund under $50 rule",
                    "Offer $10 loyalty credit for the inconvenience"
                ],
                confidence=0.93
            )
        elif sentiment == "Confused":
            return CoachingGuidance(
                coaching_tip="Break down the next steps into simple numbered points. Avoid internal technical jargon.",
                empathy_statement="I understand this process can be confusing! Let's walk through it together step by step.",
                suggested_actions=[
                    "Provide clear 3-step walk-through",
                    "Send link to troubleshooting FAQ",
                    "Verify step 1 before proceeding to step 2"
                ],
                confidence=0.89
            )

        return CoachingGuidance(
            coaching_tip="Maintain active listening and confirm resolution satisfaction before closing.",
            empathy_statement="I'm delighted to assist you with this today! Let me get that sorted for you immediately.",
            suggested_actions=[
                "Confirm customer satisfaction",
                "Share relevant documentation link",
                "Inquire if any additional assistance is needed"
            ],
            confidence=0.91
        )

    async def predict_escalation(self, history: List[Dict[str, Any]]) -> Dict[str, Any]:
        count = len(history)
        recent_sentiments = [m.get("sentiment", "Neutral") for m in history[-5:]]
        neg_count = recent_sentiments.count("Frustrated") + recent_sentiments.count("Angry")

        risk = "LOW"
        prob = 0.12
        if neg_count >= 2:
            risk = "HIGH"
            prob = 0.78
        elif neg_count == 1 or count > 8:
            risk = "MEDIUM"
            prob = 0.45

        return {
            "escalation_risk": risk,
            "escalation_probability": prob,
            "key_drivers": [
                "Consecutive negative sentiment markers",
                "Repeated contacts regarding unresolved billing",
                "Customer wait time exceeding 3 minutes"
            ] if risk == "HIGH" else ["Standard inquiry pacing"],
            "recommended_action": "Supervisor intervention recommended" if risk == "HIGH" else "Continue agent handling"
        }

    async def predict_churn(self, customer_profile: Dict[str, Any]) -> Dict[str, Any]:
        tier = customer_profile.get("tier", "Standard")
        sentiment = customer_profile.get("sentiment_score", 0.5)

        churn_risk = "LOW"
        churn_prob = 0.15
        if sentiment < 0.2:
            churn_risk = "HIGH"
            churn_prob = 0.68
        elif sentiment < 0.5:
            churn_risk = "MEDIUM"
            churn_prob = 0.38

        return {
            "churn_risk": churn_risk,
            "churn_probability": churn_prob,
            "retention_recommendation": "Extend personalized loyalty renewal offer with 15% discount." if churn_risk != "LOW" else "Maintain standard engagement cadence.",
            "customer_lifetime_value_at_risk": customer_profile.get("account_value", 1200.0)
        }

    async def generate_customer_insight(self, customer_profile: Dict[str, Any], history: List[Dict[str, Any]]) -> List[str]:
        tier = customer_profile.get("tier", "Gold")
        name = customer_profile.get("name", "Customer")
        insights = [
            f"{name} is a high-value {tier} member with $1,850.00 annual spend.",
            "Customer has contacted support 3 times in the last 14 days regarding billing synchronization.",
            "Historical resolution rate across previous tickets is 100% with average CSAT of 9.2/10.",
            "Prefers asynchronous chat and email over telephone calls."
        ]
        return insights

    async def answer_knowledge_query(self, query: str, retrieved_chunks: List[Dict[str, Any]]) -> KnowledgeAnswer:
        if not retrieved_chunks:
            return KnowledgeAnswer(
                answer="Insufficient knowledge-base information to provide a reliable answer.",
                confidence=0.20,
                sources=[],
                grounded=False,
                insufficient_information=True,
                recommended_action="Escalate to a human agent."
            )

        # Build grounded response based on top chunks
        top_chunk = retrieved_chunks[0]
        score = top_chunk.get("similarity_score", 0.85)

        if score < 0.30:
            return KnowledgeAnswer(
                answer="Insufficient knowledge-base information to provide a reliable answer.",
                confidence=score,
                sources=[],
                grounded=False,
                insufficient_information=True,
                recommended_action="Escalate to a human agent."
            )

        title = top_chunk.get("document_title", "Company Policy")
        content = top_chunk.get("content", "")
        page = top_chunk.get("page_number", 1)

        # Clean snippet for answer
        snippet = content.strip().split(".")[0] + "."

        answer = f"According to {title} (Page {page}), {snippet} Please ensure customer verification is completed before proceeding with formal claim processing."

        sources = []
        for c in retrieved_chunks[:3]:
            sources.append({
                "title": c.get("document_title", "Document"),
                "page": c.get("page_number", 1),
                "score": round(c.get("similarity_score", 0.88) * 100, 1),
                "snippet": c.get("content", "")[:200] + "..."
            })

        return KnowledgeAnswer(
            answer=answer,
            confidence=round(score, 2),
            sources=sources,
            grounded=True,
            insufficient_information=False,
            recommended_action="Insert response into conversation or verify eligibility."
        )

    async def generate_resolution_plan(self, issue: str, retrieved_policies: List[Dict[str, Any]], customer_context: Dict[str, Any]) -> ResolutionPlan:
        lower = issue.lower()
        amount = customer_context.get("amount", 42.50)

        requires_approval = amount > 50.0
        risk_level = "HIGH" if amount > 500.0 else ("MEDIUM" if amount > 50.0 else "LOW")

        steps = [
            "1. Detect and validate billing intent (#DUPLICATE_BILLING)",
            "2. Verify customer identity and account authentication token",
            "3. Retrieve official Billing FAQ & Refund Policy from knowledge base",
            "4. Query ledger for duplicate transaction hashes (#TXN-9024 vs #TXN-9025)",
            "5. Calculate exact discrepancy amount ($42.50)",
            "6. Evaluate autonomy eligibility against guardrail policy",
            "7. Dispatch automated reversal to payment gateway (Stripe/PayPal)",
            "8. Dispatch customer confirmation notification with receipt",
            "9. Update CRM case status to RESOLVED with full audit trace"
        ]

        return ResolutionPlan(
            plan_title="Autonomous Duplicate Billing Resolution Workflow",
            steps=steps,
            estimated_duration="1.8 seconds",
            risk_level=risk_level,
            requires_approval=requires_approval,
            confidence=0.96
        )
