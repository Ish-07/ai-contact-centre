from typing import List, Dict, Any
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.db.database import get_db
from app.models.models import Agent, AgentPerformance
from app.schemas.schemas import AgentResponse, AgentPerformanceResponse

router = APIRouter(prefix="/agents", tags=["Agents"])

@router.get("", response_model=List[AgentResponse])
def list_agents(db: Session = Depends(get_db)) -> List[Agent]:
    return db.query(Agent).order_by(Agent.csat.desc()).all()

@router.get("/{id}/performance", response_model=AgentPerformanceResponse)
def get_agent_performance(id: int, db: Session = Depends(get_db)) -> AgentPerformanceResponse:
    agent = db.query(Agent).filter(Agent.id == id).first()
    if not agent:
        raise HTTPException(status_code=404, detail="Agent not found")

    # Coaching tip logic
    if agent.avg_handle_time > 5.0:
        tip = "Agent frequently spends longer than average handling billing-related conversations. Recommendation: Activate the autonomous billing resolution workflow to reduce AHT by 45%."
    elif agent.ai_acceptance_rate < 85.0:
        tip = "Agent frequently dismisses next-best-action prompts. Recommendation: Review RAG citation cards to build trust in suggested policy snippets."
    else:
        tip = "Agent maintains exceptional CSAT and leverages AI coaching effectively. Candidate for mentor badge."

    return AgentPerformanceResponse(
        agent_id=agent.id,
        name=agent.name,
        conversations_handled=agent.conversations_handled,
        avg_handle_time=agent.avg_handle_time,
        csat=agent.csat,
        resolution_rate=agent.resolution_rate,
        ai_acceptance_rate=agent.ai_acceptance_rate,
        sentiment_improvement=36.4,
        sales_conversion=28.2,
        coaching_tip=tip
    )
