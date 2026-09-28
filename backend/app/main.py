import os
import logging
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import settings
from app.db.database import engine, Base
from app.api.routes import (
    auth, dashboard, customers, conversations,
    ai_assistant, knowledge, agents, governance,
    security, simulation, ws
)

logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(levelname)s] %(name)s: %(message)s")
logger = logging.getLogger("contact_center")

@asynccontextmanager
async def lifespan(app: FastAPI):
    logger.info("Initializing database tables...")
    Base.metadata.create_all(bind=engine)
    logger.info("AI Contact Center Backend started successfully.")
    yield
    logger.info("AI Contact Center Backend shutting down.")

app = FastAPI(
    title=settings.PROJECT_NAME,
    description="Enterprise AI Contact Center with Real-Time Agent Coaching, RAG, Omnichannel Interaction, and Autonomous Guardrails.",
    version="1.0.0",
    lifespan=lifespan
)

# CORS configuration for frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount API Routers
app.include_router(auth.router, prefix=settings.API_V1_STR)
app.include_router(dashboard.router, prefix=settings.API_V1_STR)
app.include_router(customers.router, prefix=settings.API_V1_STR)
app.include_router(conversations.router, prefix=settings.API_V1_STR)
app.include_router(ai_assistant.router, prefix=settings.API_V1_STR)
app.include_router(knowledge.router, prefix=settings.API_V1_STR)
app.include_router(agents.router, prefix=settings.API_V1_STR)
app.include_router(governance.router, prefix=settings.API_V1_STR)
app.include_router(security.router, prefix=settings.API_V1_STR)
app.include_router(simulation.router, prefix=settings.API_V1_STR)
app.include_router(ws.router)

@app.get("/health", tags=["Health"])
def health_check():
    return {
        "status": "healthy",
        "service": settings.PROJECT_NAME,
        "ai_provider": settings.AI_PROVIDER,
        "version": "1.0.0"
    }

@app.get(f"{settings.API_V1_STR}/settings", tags=["Settings"])
def get_system_settings():
    provider_status = "Connected" if settings.AI_PROVIDER == "gemini" and settings.GEMINI_API_KEY else "Active"
    provider_name = "Google Gemini" if settings.AI_PROVIDER == "gemini" else "Mock AI"
    model_name = settings.GEMINI_MODEL if settings.AI_PROVIDER == "gemini" else "MockAI-DomainEngine"

    return {
        "ai_provider": provider_name,
        "ai_provider_key": settings.AI_PROVIDER,
        "model": model_name,
        "status": provider_status,
        "autonomous_refund_limit": settings.AUTONOMOUS_REFUND_LIMIT,
        "agent_approval_refund_limit": settings.AGENT_APPROVAL_REFUND_LIMIT,
        "database": "PostgreSQL + pgvector ready (Local Dual-Dialect Engine)",
        "ocr_service": "PaddleOCR Document Pipeline",
        "supported_languages": [
            {"code": "en", "name": "English"},
            {"code": "hi", "name": "Hindi (हिंदी)"},
            {"code": "es", "name": "Spanish (Español)"},
            {"code": "fr", "name": "French (Français)"},
            {"code": "de", "name": "German (Deutsch)"}
        ]
    }
