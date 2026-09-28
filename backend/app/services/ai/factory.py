import logging
from app.core.config import settings
from app.services.ai.base import AIService
from app.services.ai.mock_ai import MockAIService
from app.services.ai.gemini_ai import GeminiAIService

logger = logging.getLogger(__name__)

_ai_service_instance: AIService = None

def get_ai_service() -> AIService:
    """Factory returns active AI provider (MockAIService or GeminiAIService) based on config."""
    global _ai_service_instance

    if _ai_service_instance is None:
        provider = settings.AI_PROVIDER.lower()
        if provider == "gemini" and settings.GEMINI_API_KEY:
            logger.info(f"Initializing AI Service with provider: GEMINI ({settings.GEMINI_MODEL})")
            _ai_service_instance = GeminiAIService()
        else:
            if provider == "gemini" and not settings.GEMINI_API_KEY:
                logger.warning("AI_PROVIDER is 'gemini' but GEMINI_API_KEY is unset. Using MockAIService.")
            else:
                logger.info("Initializing AI Service with provider: MOCK AI")
            _ai_service_instance = MockAIService()

    return _ai_service_instance
