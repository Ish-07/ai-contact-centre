import pytest
from app.services.ai.mock_ai import MockAIService
from app.services.guardrail_service import GuardrailEngine
from app.services.pii_service import PIIService
from app.services.rag.embeddings import MockEmbeddingService
from app.services.rag.chunking import SemanticChunker

@pytest.mark.asyncio
async def test_mock_ai_sentiment_and_intent():
    ai = MockAIService()

    # Frustrated duplicate billing
    text = "I have been charged twice and nobody is helping me!"
    sentiment = await ai.detect_sentiment(text)
    intent = await ai.detect_intent(text)

    assert sentiment.sentiment in ["Frustrated", "Angry"]
    assert intent.intent == "Duplicate Billing"
    assert sentiment.confidence > 0.85

    # Positive feedback
    positive_text = "Thank you so much, that fixed my issue!"
    pos_sentiment = await ai.detect_sentiment(positive_text)
    assert pos_sentiment.sentiment == "Satisfied"
    assert pos_sentiment.score > 0.5

@pytest.mark.asyncio
async def test_mock_ai_multilingual():
    ai = MockAIService()

    # Spanish
    es_intent = await ai.detect_intent("me cobraron dos veces por el mismo pedido")
    assert es_intent.intent == "Duplicate Billing"

    # French
    fr_intent = await ai.detect_intent("je veux un remboursement rapide")
    assert fr_intent.intent == "Refund Request"

    # German
    de_intent = await ai.detect_intent("Garantie und Ersatzteil für mein Headset")
    assert de_intent.intent == "Warranty Replacement"

    # Hindi
    hi_intent = await ai.detect_intent("दो बार पैसे कट गए हैं कृपया वापस करें")
    assert hi_intent.intent == "Duplicate Billing"

def test_guardrail_engine():
    engine = GuardrailEngine(autonomous_refund_limit=50.0, agent_approval_refund_limit=500.0)

    # Low refund <= $50: Autonomous
    eval_low = engine.evaluate_action("REFUND", {"amount": 42.50})
    assert eval_low["allowed_autonomous"] is True
    assert eval_low["requires_human_approval"] is False
    assert eval_low["approval_level"] == "NONE"

    # Medium refund $50 - $500: Agent approval
    eval_med = engine.evaluate_action("REFUND", {"amount": 150.00})
    assert eval_med["allowed_autonomous"] is False
    assert eval_med["requires_human_approval"] is True
    assert eval_med["approval_level"] == "AGENT"

    # High refund > $500: Supervisor approval
    eval_high = engine.evaluate_action("REFUND", {"amount": 750.00})
    assert eval_high["allowed_autonomous"] is False
    assert eval_high["requires_human_approval"] is True
    assert eval_high["approval_level"] == "SUPERVISOR"

    # Account closure: Always supervisor approval
    eval_closure = engine.evaluate_action("ACCOUNT_CLOSURE", {})
    assert eval_closure["requires_human_approval"] is True
    assert eval_closure["approval_level"] == "SUPERVISOR"

def test_pii_detection_and_masking():
    pii = PIIService()
    text = "My card number is 4111 2222 3333 4444 and my email is customer@domain.com, phone 555-234-5678."
    res = pii.scan_and_mask(text)

    assert res["entities_count"] == 3
    assert "**** **** **** 4444" in res["masked_text"]
    assert "cu***@domain.com" in res["masked_text"]
    assert "***-***-5678" in res["masked_text"]
    assert "4111 2222 3333 4444" not in res["masked_text"]

def test_embeddings_and_chunking():
    chunker = SemanticChunker(chunk_size=100, chunk_overlap=20)
    text = "This is a sample document text explaining the warranty policy. " * 15
    chunks = chunker.chunk_text(text, page_number=1)
    assert len(chunks) > 1

    embedder = MockEmbeddingService(dimension=128)
    vec1 = embedder.generate_embedding("warranty policy replacement")
    vec2 = embedder.generate_embedding("replacement guarantee defect")
    assert len(vec1) == 128
    assert len(vec2) == 128

@pytest.mark.asyncio
async def test_grounded_knowledge_fallback():
    ai = MockAIService()
    # Empty chunks -> insufficient information fallback
    ans = await ai.answer_knowledge_query("What is the secret policy?", [])
    assert ans.insufficient_information is True
    assert "Insufficient knowledge-base information" in ans.answer
    assert ans.recommended_action == "Escalate to a human agent."
