import os
from pathlib import Path
from pydantic_settings import BaseSettings

BASE_DIR = Path(__file__).resolve().parent.parent.parent
STORAGE_PATH = BASE_DIR.parent / "storage" / "documents"
STORAGE_PATH.mkdir(parents=True, exist_ok=True)

class Settings(BaseSettings):
    PROJECT_NAME: str = "AI Contact Center — Intelligent Agent & Customer Experience Platform"
    API_V1_STR: str = "/api"
    SECRET_KEY: str = os.getenv("SECRET_KEY", "")
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24

    # Database: Supports SQLite for zero-setup local dev or PostgreSQL with pgvector
    DATABASE_URL: str = os.getenv("DATABASE_URL", f"sqlite:///{BASE_DIR / 'contact_center.db'}")

    # AI Provider: "mock" or "gemini"
    AI_PROVIDER: str = os.getenv("AI_PROVIDER", "mock")
    GEMINI_API_KEY: str = os.getenv("GEMINI_API_KEY", "")
    GEMINI_MODEL: str = os.getenv("GEMINI_MODEL", "gemini-2.5-flash")

    # Document & Vector Storage
    STORAGE_DIR: str = str(STORAGE_PATH)
    EMBEDDING_DIMENSION: int = 128

    # Guardrail Policies
    AUTONOMOUS_REFUND_LIMIT: float = 50.0
    AGENT_APPROVAL_REFUND_LIMIT: float = 500.0

    model_config = {"env_file": ".env", "extra": "allow"}

settings = Settings()
