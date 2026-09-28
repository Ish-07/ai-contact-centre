import os
import json
import logging
from typing import List, Dict, Any, Optional
from app.core.config import settings
from app.services.ai.base import (
    AIService, SentimentResult, IntentResult, MoodAnalysis,
    NextBestAction, CoachingGuidance, ConversationSummary,
    ResolutionPlan, KnowledgeAnswer
)
from app.services.ai.mock_ai import MockAIService

logger = logging.getLogger(__name__)

class GeminiAIService(AIService):
    """Google Gemini AI Service implementation for production LLM operations.
    Follows exact same AIService contract as MockAIService."""

    def __init__(self, api_key: Optional[str] = None, model: Optional[str] = None):
        self.api_key = api_key or settings.GEMINI_API_KEY
        self.model_name = model or settings.GEMINI_MODEL
        self._fallback = MockAIService()
        self.client = None

        if self.api_key:
            try:
                from google import genai
                self.client = genai.Client(api_key=self.api_key)
                logger.info(f"Initialized Gemini Client with model {self.model_name}")
            except Exception as e:
                logger.warning(f"Could not initialize Google GenAI SDK: {e}. Will fallback safely to MockAI.")

    async def analyze_conversation(self, messages: List[Dict[str, Any]]) -> Dict[str, Any]:
        if not self.client:
            return await self._fallback.analyze_conversation(messages)

        try:
            prompt = f"""You are an expert Contact Center AI analyst.
Analyze the following conversation and output strict JSON with keys:
sentiment (string: Positive, Neutral, Frustrated, Angry, Confused, Satisfied),
sentiment_score (float: -1.0 to 1.0),
sentiment_confidence (float: 0.0 to 1.0),
intent (string),
intent_confidence (float),
mood (string),
mood_trend (string: improving, deteriorating, stable),
escalation_risk (string: LOW, MEDIUM, HIGH),
recommended_action (string).

Messages:
{json.dumps(messages, indent=2)}"""

            response = self.client.models.generate_content(
                model=self.model_name,
                contents=prompt,
            )
            text = response.text.strip()
            # Clean markdown JSON fences if present
            if text.startswith("```json"):
                text = text[7:-3].strip()
            elif text.startswith("```"):
                text = text[3:-3].strip()
            return json.loads(text)
        except Exception as e:
            logger.error(f"Gemini analyze_conversation failed: {e}. Falling back to MockAI.")
            return await self._fallback.analyze_conversation(messages)

    async def detect_sentiment(self, text: str) -> SentimentResult:
        if not self.client:
            return await self._fallback.detect_sentiment(text)
        try:
            prompt = f"Analyze the sentiment of this text: '{text}'. Return JSON with: sentiment, score (-1.0 to 1.0), confidence (0.0 to 1.0), reason."
            res = self.client.models.generate_content(model=self.model_name, contents=prompt)
            data = json.loads(res.text.strip().replace("```json", "").replace("```", ""))
            return SentimentResult(**data)
        except Exception:
            return await self._fallback.detect_sentiment(text)

    async def detect_intent(self, text: str) -> IntentResult:
        if not self.client:
            return await self._fallback.detect_intent(text)
        try:
            prompt = f"Determine the primary contact center intent for: '{text}'. Return JSON with: intent, confidence, reason."
            res = self.client.models.generate_content(model=self.model_name, contents=prompt)
            data = json.loads(res.text.strip().replace("```json", "").replace("```", ""))
            return IntentResult(**data)
        except Exception:
            return await self._fallback.detect_intent(text)

    async def analyze_customer_mood(self, text: str, history: List[str]) -> MoodAnalysis:
        if not self.client:
            return await self._fallback.analyze_customer_mood(text, history)
        try:
            prompt = f"Analyze customer mood and emotional trajectory based on: '{text}' and previous messages: {history}. Return JSON: mood, score, trend, escalation_risk."
            res = self.client.models.generate_content(model=self.model_name, contents=prompt)
            data = json.loads(res.text.strip().replace("```json", "").replace("```", ""))
            return MoodAnalysis(**data)
        except Exception:
            return await self._fallback.analyze_customer_mood(text, history)

    async def generate_summary(self, messages: List[Dict[str, Any]]) -> ConversationSummary:
        if not self.client:
            return await self._fallback.generate_summary(messages)
        try:
            prompt = f"Summarize this contact center conversation for CRM records in JSON format with fields: summary, customer_issue, actions_taken, resolution, follow_up_required (bool), sentiment, intent, products_mentioned (list), revenue_opportunity (optional string).\n\nMessages:\n{json.dumps(messages)}"
            res = self.client.models.generate_content(model=self.model_name, contents=prompt)
            data = json.loads(res.text.strip().replace("```json", "").replace("```", ""))
            return ConversationSummary(**data)
        except Exception:
            return await self._fallback.generate_summary(messages)

    async def detect_pii(self, text: str) -> Dict[str, Any]:
        # Always run deterministic regex detection for high safety, supplemented by AI
        return await self._fallback.detect_pii(text)

    async def generate_next_best_action(self, context: Dict[str, Any]) -> NextBestAction:
        if not self.client:
            return await self._fallback.generate_next_best_action(context)
        try:
            prompt = f"Based on this customer contact center state: {json.dumps(context)}, determine the next best action. Return JSON: action, reason, confidence, expected_outcome, requires_approval (bool)."
            res = self.client.models.generate_content(model=self.model_name, contents=prompt)
            data = json.loads(res.text.strip().replace("```json", "").replace("```", ""))
            return NextBestAction(**data)
        except Exception:
            return await self._fallback.generate_next_best_action(context)

    async def generate_agent_coaching(self, current_message: str, context: Dict[str, Any]) -> CoachingGuidance:
        if not self.client:
            return await self._fallback.generate_agent_coaching(current_message, context)
        try:
            prompt = f"Provide real-time agent coaching for this message: '{current_message}' with context: {json.dumps(context)}. Return JSON: coaching_tip, empathy_statement, suggested_actions (list), confidence."
            res = self.client.models.generate_content(model=self.model_name, contents=prompt)
            data = json.loads(res.text.strip().replace("```json", "").replace("```", ""))
            return CoachingGuidance(**data)
        except Exception:
            return await self._fallback.generate_agent_coaching(current_message, context)

    async def predict_escalation(self, history: List[Dict[str, Any]]) -> Dict[str, Any]:
        return await self._fallback.predict_escalation(history)

    async def predict_churn(self, customer_profile: Dict[str, Any]) -> Dict[str, Any]:
        return await self._fallback.predict_churn(customer_profile)

    async def generate_customer_insight(self, customer_profile: Dict[str, Any], history: List[Dict[str, Any]]) -> List[str]:
        return await self._fallback.generate_customer_insight(customer_profile, history)

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

        if not self.client:
            return await self._fallback.answer_knowledge_query(query, retrieved_chunks)

        try:
            prompt = f"""You are a helpful Contact Center AI Knowledge Assistant.
Answer the customer's question strictly grounded in the provided document excerpts.
If the excerpts do not contain enough information to answer reliably, output:
"Insufficient knowledge-base information to provide a reliable answer."
Do NOT invent or fabricate policies.

Excerpts:
{json.dumps(retrieved_chunks, indent=2)}

Question:
{query}

Format output as JSON:
answer (string),
confidence (float 0.0 to 1.0),
grounded (bool),
insufficient_information (bool),
recommended_action (string)."""

            res = self.client.models.generate_content(model=self.model_name, contents=prompt)
            text = res.text.strip().replace("```json", "").replace("```", "")
            data = json.loads(text)
            data["sources"] = [{
                "title": c.get("document_title", "Document"),
                "page": c.get("page_number", 1),
                "score": round(c.get("similarity_score", 0.9) * 100, 1),
                "snippet": c.get("content", "")[:200]
            } for c in retrieved_chunks[:3]]
            return KnowledgeAnswer(**data)
        except Exception:
            return await self._fallback.answer_knowledge_query(query, retrieved_chunks)

    async def generate_resolution_plan(self, issue: str, retrieved_policies: List[Dict[str, Any]], customer_context: Dict[str, Any]) -> ResolutionPlan:
        return await self._fallback.generate_resolution_plan(issue, retrieved_policies, customer_context)
