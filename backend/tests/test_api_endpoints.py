import pytest
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

def test_health_endpoint():
    res = client.get("/health")
    assert res.status_code == 200
    data = res.json()
    assert data["status"] == "healthy"
    assert "AI Contact Center" in data["service"]

def test_settings_endpoint():
    res = client.get("/api/settings")
    assert res.status_code == 200
    data = res.json()
    assert data["ai_provider"] in ["Mock AI", "Google Gemini"]
    assert len(data["supported_languages"]) == 5

def test_dashboard_endpoint():
    res = client.get("/api/dashboard")
    assert res.status_code == 200
    data = res.json()
    assert len(data["kpi_cards"]) >= 8
    assert "resolution_rate" in data["charts"]
    assert "sentiment_trend" in data["charts"]

def test_customers_and_360():
    res = client.get("/api/customers")
    assert res.status_code == 200
    custs = res.json()
    assert len(custs) >= 10

    # Test Customer 360 detail
    c_id = custs[0]["id"]
    detail_res = client.get(f"/api/customers/{c_id}")
    assert detail_res.status_code == 200
    detail = detail_res.json()
    assert "ai_insights" in detail
    assert "purchases" in detail

def test_conversations_and_diarization():
    res = client.get("/api/conversations")
    assert res.status_code == 200
    convs = res.json()
    assert len(convs) >= 10

    c_id = convs[0]["id"]
    detail_res = client.get(f"/api/conversations/{c_id}")
    assert detail_res.status_code == 200
    data = detail_res.json()
    assert "messages" in data
    assert len(data["messages"]) > 0
    assert data["messages"][0]["speaker"] in ["CUSTOMER", "AGENT", "AI"]

def test_knowledge_search_and_query():
    # Semantic search
    search_res = client.post("/api/knowledge/search", json={"query": "refund timeline business days", "top_k": 3})
    assert search_res.status_code == 200
    s_data = search_res.json()
    assert s_data["total_found"] > 0

    # Grounded Query
    query_res = client.post("/api/knowledge/query", json={"query": "How long does a refund take?"})
    assert query_res.status_code == 200
    q_data = query_res.json()
    assert q_data["grounded"] is True
    assert len(q_data["sources"]) > 0

def test_pii_detection_endpoint():
    res = client.post("/api/security/pii/detect", json={"text": "Card is 4111 2222 3333 4444 and email is test@domain.com"})
    assert res.status_code == 200
    data = res.json()
    assert data["entities_count"] == 2
    assert "**** **** **** 4444" in data["masked_text"]

def test_autonomous_resolution_workflow():
    res = client.post("/api/simulation/run-resolution-workflow?amount=42.50")
    assert res.status_code == 200
    data = res.json()
    assert len(data["steps"]) == 14
    assert data["requires_human_approval"] is False
    assert data["risk_level"] == "LOW"
