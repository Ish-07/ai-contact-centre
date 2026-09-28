# AI Contact Center — Intelligent Agent & Customer Experience Platform

A production-grade, enterprise AI contact center platform demonstrating **Agentic AI**, **real-time agent coaching**, **RAG knowledge retrieval**, **deterministic guardrails & human oversight**, **omnichannel zero-context-loss interaction**, **PII protection**, and **predictive analytics**.

---

## 1. Project Structure

```
ai-contact-center/
├── docker-compose.yml              # PostgreSQL + pgvector + FastAPI orchestration
├── README.md                       # Comprehensive operational & architecture guide
├── storage/
│   └── documents/                  # Ingested knowledge documents repository
│
├── backend/
│   ├── Dockerfile                  # Production container definition
│   ├── requirements.txt            # Python 3.12+ dependencies
│   ├── pytest.ini                  # Pytest runner settings with auto-asyncio
│   ├── contact_center.db           # Pre-seeded SQLite database (for instant zero-setup dev)
│   ├── app/
│   │   ├── main.py                 # FastAPI application root & CORS setup
│   │   ├── core/
│   │   │   ├── config.py           # Pydantic v2 application settings
│   │   │   └── security.py         # Passlib bcrypt & JWT token utilities
│   │   ├── db/
│   │   │   ├── database.py         # SQLAlchemy engine & session factory
│   │   │   └── session.py          # Database dependency injections
│   │   ├── models/
│   │   │   └── models.py           # SQLAlchemy 2.0 relational models
│   │   ├── schemas/
│   │   │   └── schemas.py          # Pydantic v2 API request/response schemas
│   │   ├── api/
│   │   │   └── routes/
│   │   │       ├── auth.py         # JWT authentication endpoints
│   │   │       ├── dashboard.py    # Executive KPIs & 10 telemetry charts
│   │   │       ├── customers.py    # Customer 360 & cross-channel timeline
│   │   │       ├── conversations.py# Diarized messages, PII masking & chat
│   │   │       ├── ai_assistant.py # Coaching, Next-Best-Action & Summaries
│   │   │       ├── knowledge.py    # Document upload, search & grounded QA
│   │   │       ├── agents.py       # Human agent leaderboard & AHT metrics
│   │   │       ├── governance.py   # AI decisions, approvals & audit logs
│   │   │       ├── security.py     # PII detection & voice biometrics simulation
│   │   │       ├── simulation.py   # Interactive demo controls & 14-step workflow
│   │   │       └── ws.py           # Live WebSocket stream (/ws/live)
│   │   └── services/
│   │       ├── ai/
│   │       │   ├── base.py         # AIService abstract interface
│   │       │   ├── mock_ai.py      # Context-aware domain Mock AI engine
│   │       │   ├── gemini_ai.py    # Google Gemini GenAI SDK provider
│   │       │   └── factory.py      # Dynamic provider factory
│   │       ├── rag/
│   │       │   ├── embeddings.py   # Dense vector embedding service (Mock & Gemini)
│   │       │   ├── chunking.py     # Semantic sliding-window chunker
│   │       │   └── retrieval.py    # Cosine vector retrieval & context builder
│   │       ├── ocr/
│   │       │   └── paddleocr_service.py # PaddleOCR & PDF/DOCX/TXT parser
│   │       ├── guardrail_service.py# Configurable autonomy threshold rules
│   │       ├── pii_service.py      # Deterministic regex entity masking
│   │       ├── voice_security_service.py # Simulated voice biometrics engine
│   │       ├── document_service.py # Ingestion & chunk indexing lifecycle
│   │       ├── websocket_manager.py# Active WebSocket connection manager
│   │       └── simulation_service.py # Interactive scenario runner
│   ├── scripts/
│   │   └── seed_data.py            # Database seeding script
│   └── tests/
│       ├── test_backend.py         # Unit tests (MockAI, Guardrails, PII, RAG)
│       └── test_api_endpoints.py   # Full integration tests
│
└── frontend/
    ├── package.json                # React 18, Vite, Tailwind CSS, Recharts, Lucide
    ├── vite.config.ts              # Vite server & proxy configuration
    ├── tailwind.config.js          # Enterprise indigo brand theme
    ├── src/
    │   ├── main.tsx                # React DOM entrypoint
    │   ├── App.tsx                 # React Router with all 14 routes
    │   ├── types/index.ts          # TypeScript data contracts
    │   ├── services/
    │   │   ├── api.ts              # REST API client
    │   │   └── websocket.ts        # Auto-reconnecting WebSocket client
    │   ├── layouts/
    │   │   └── MainLayout.tsx      # Sidebar + Header + Search modal layout
    │   ├── components/
    │   │   ├── Sidebar.tsx         # Enterprise sidebar with 14 links
    │   │   ├── Header.tsx          # Top bar with simulation controls & lang selector
    │   │   ├── KPICard.tsx         # KPI card with reference badges
    │   │   ├── Badge.tsx           # Semantic status badges
    │   │   ├── GlobalSearchModal.tsx # Cmd+K universal search modal
    │   │   ├── HumanApprovalModal.tsx # Supervisor authorization modal
    │   │   └── NotificationCenter.tsx # Live alert drawer
    │   └── pages/
    │       ├── DashboardPage.tsx   # Executive KPIs & 10 interactive charts
    │       ├── LiveContactCenterPage.tsx # Real-time conversation monitor
    │       ├── AgentWorkspacePage.tsx # Unified 3-column agent desktop
    │       ├── AiCoachPage.tsx     # Real-time sentiment & coaching radar
    │       ├── Customer360Page.tsx # Customer dossier & cross-channel timeline
    │       ├── KnowledgeBasePage.tsx # Document upload & chunk inspector
    │       ├── KnowledgeSearchPage.tsx # Semantic RAG grounded QA sandbox
    │       ├── AgenticAiPage.tsx   # Sub-agents & autonomy sliders
    │       ├── AutonomousResolutionPage.tsx # 14-step resolution visualizer
    │       ├── OmnichannelPage.tsx # Context preservation across channels
    │       ├── AnalyticsPage.tsx   # Leaderboard & predictive churn/escalation
    │       ├── SecurityPiiPage.tsx # PII sandbox & voice biometrics simulation
    │       ├── AiGovernancePage.tsx # AI decision ledger & audit logs
    │       └── SettingsPage.tsx    # Provider status & model settings
```

---

## 2. Quick Setup & Run Instructions

### A. Backend Setup (Python 3.11+)

```bash
cd backend
python -m venv venv

# Windows:
.\venv\Scripts\activate
# Linux/macOS:
# source venv/bin/activate

pip install -r requirements.txt

# Run database seed (creates 20 customers, 10 agents, 50 conversations, pre-seeds 8 company policies):
python scripts/seed_data.py

# Start FastAPI server on port 8000:
uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload
```

### B. Frontend Setup (Node.js 18+)

```bash
cd frontend
npm install

# Start Vite dev server on port 5173:
npm run dev
```

Visit **`http://localhost:5173`** in your browser.

---

## 3. Docker Compose (PostgreSQL + pgvector)

To run the production database with native `pgvector`:

```bash
docker compose up -d
```

This starts:
1. `contact_center_postgres` (pgvector enabled on port 5432).
2. `contact_center_backend` (FastAPI connected to PostgreSQL).

The application automatically supports dual-dialect operations: PostgreSQL + `pgvector` for production/Docker, or SQLite with in-memory cosine vectors for instant local developer agility.

---

## 4. Demo Credentials

| Role | Email | Password |
|---|---|---|
| **Admin** | `admin@contactcenter.ai` | `password123` |
| **Supervisor** | `supervisor@contactcenter.ai` | `password123` |
| **Agent** | `agent@contactcenter.ai` | `password123` |

---

## 5. AI Architecture & Switching to Gemini

The platform uses a strict **AI Provider Abstraction** (`AIService` in `backend/app/services/ai/base.py`):
```
Frontend  ───>  FastAPI  ───>  AIService Interface
                                  ├── MockAIService (Default, offline, deterministic)
                                  └── GeminiAIService (Google GenAI SDK)
```

To switch from Mock AI to Google Gemini:
1. Open or create `.env` in `backend/`:
   ```env
   AI_PROVIDER=gemini
   GEMINI_API_KEY=your_actual_gemini_api_key_here
   GEMINI_MODEL=gemini-2.5-flash
   ```
2. Restart the backend server.
3. The application will immediately utilize Gemini for intent recognition, sentiment extraction, agent coaching, conversation summarization, and grounded RAG answer generation. Zero frontend or database modifications are required.

---

## 6. Guardrail Safety Architecture

The LLM **never directly executes sensitive transactions**.
```
Customer Issue  ───>  LLM / AI Model
                            │ (Produces Action Proposal)
                            ▼
                     Guardrail Engine (backend/app/services/guardrail_service.py)
                            │
               ┌────────────┴────────────┐
       Allowed Autonomous?       Requires Approval?
               │                         │
               ▼                         ▼
      Execute Action Directly       Human Approval Modal
      (Refund < $50)                - Agent Approval ($50 - $500)
                                    - Supervisor Approval (> $500)
                                    - Account Closure (Mandatory)
```

---

## 7. Automated Tests Verification

Run the full automated pytest suite in `backend/`:
```bash
cd backend
.\venv\Scripts\pytest -v
```

All 14 tests pass:
- Mock AI sentiment, intent & multi-lingual detection (English, Hindi, Spanish, French, German).
- Guardrail threshold rule enforcement (<$50 auto, $50–$500 agent, >$500 supervisor).
- Deterministic PII regex detection and masking.
- Semantic sliding-window chunking & vector cosine similarity.
- Grounded RAG zero-hallucination fallback to human agent.
- FastAPI REST endpoints (Health, Settings, Dashboard, Customers, Conversations, Knowledge Query, Autonomous Workflow).

---

## 8. Feature-to-Requirement Mapping

| Requirement | Implementation Component |
|---|---|
| **AI-Assisted Customer Conversations** | `AgentWorkspacePage.tsx`, `conversations.py` |
| **Real-Time Agent Coaching** | `AiCoachPage.tsx`, `coaching_service.py`, WebSockets |
| **Knowledge-Base Question Answering** | `KnowledgeSearchPage.tsx`, `retrieval.py` |
| **Document Retrieval / RAG** | `DocumentService`, `SemanticChunker`, `MockEmbeddingService`, pgvector |
| **Autonomous Issue Resolution** | `AutonomousResolutionPage.tsx` (14-step workflow) |
| **Customer Sentiment & Mood Prediction** | `mock_ai.py`, `gemini_ai.py`, Live Sentiment Chart |
| **Speaker Diarization** | Diarized tags (`CUSTOMER`, `AGENT`, `AI`) with distinct styling |
| **Conversation Summarization** | Automatic CRM summary generator with action logs |
| **PII Detection and Masking** | `pii_service.py` (Credit cards, phone, emails, SSN) |
| **Next-Best-Action Engine** | Context-driven recommendation cards with confidence scores |
| **Omnichannel Zero Context Loss** | `OmnichannelPage.tsx` (Chat -> Voice -> Email handoff) |
| **Customer 360** | `Customer360Page.tsx` (Timeline, purchase ledger, AI insights) |
| **Agent Performance Analytics** | `AnalyticsPage.tsx` (Leaderboard with CSAT, AHT, acceptance) |
| **Configurable AI Autonomy** | `AgenticAiPage.tsx` (Sliders: Supervised, Semi, Fully Autonomous) |
| **Responsible AI & Human Oversight** | `HumanApprovalModal.tsx`, `AiGovernancePage.tsx` |
| **Simulated Voice Security** | `voice_security_service.py`, `SecurityPiiPage.tsx` |
| **Predictive Analytics** | Churn risk, escalation likelihood, sales upgrade radar |
| **Unified Agent Workspace** | 3-column desktop layout (Customer 360, Transcript, AI Coach) |
| **Multi-Language Support** | Header selector: English, Hindi, Spanish, French, German |
