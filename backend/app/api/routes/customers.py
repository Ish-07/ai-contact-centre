from typing import List, Dict, Any
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from app.db.database import get_db
from app.models.models import Customer, Conversation, Case, CustomerInteraction
from app.services.ai.factory import get_ai_service

router = APIRouter(prefix="/customers", tags=["Customers"])

@router.get("", response_model=List[Dict[str, Any]])
def list_customers(
    limit: int = 50,
    tier: str = None,
    search: str = None,
    db: Session = Depends(get_db)
) -> List[Dict[str, Any]]:
    q = db.query(Customer)
    if tier:
        q = q.filter(Customer.tier == tier)
    if search:
        q = q.filter((Customer.name.ilike(f"%{search}%")) | (Customer.customer_id.ilike(f"%{search}%")) | (Customer.email.ilike(f"%{search}%")))

    customers = q.limit(limit).all()
    results = []
    for c in customers:
        results.append({
            "id": c.id,
            "customer_id": c.customer_id,
            "name": c.name,
            "email": c.email,
            "phone": c.phone,
            "tier": c.tier,
            "account_value": c.account_value,
            "preferred_channel": c.preferred_channel,
            "language": c.language,
            "sentiment_score": c.sentiment_score,
            "mood": c.mood,
            "last_interaction": c.last_interaction,
            "created_at": c.created_at
        })
    return results

@router.get("/{customer_id}", response_model=Dict[str, Any])
async def get_customer_detail(customer_id: str, db: Session = Depends(get_db)) -> Dict[str, Any]:
    # Look up by numeric id or customer_id string
    if customer_id.isdigit():
        c = db.query(Customer).filter((Customer.id == int(customer_id)) | (Customer.customer_id == customer_id)).first()
    else:
        c = db.query(Customer).filter(Customer.customer_id == customer_id).first()

    if not c:
        raise HTTPException(status_code=404, detail="Customer not found")

    cases = db.query(Case).filter(Case.customer_id == c.id).all()
    conversations = db.query(Conversation).filter(Conversation.customer_id == c.id).all()
    interactions = db.query(CustomerInteraction).filter(CustomerInteraction.customer_id == c.id).order_by(CustomerInteraction.created_at.desc()).all()

    # Dynamic AI insights
    ai_service = get_ai_service()
    insights = await ai_service.generate_customer_insight(
        {"name": c.name, "tier": c.tier, "account_value": c.account_value, "sentiment_score": c.sentiment_score},
        [{"channel": i.channel, "summary": i.summary} for i in interactions]
    )

    # Simulated Purchase History
    purchases = [
        {"order_id": "#ORD-88190", "item": "Pro Headset Wireless v2", "amount": 189.99, "date": "2026-08-14", "status": "Delivered"},
        {"order_id": "#ORD-87214", "item": "Noise Cancelling Earbuds", "amount": 129.50, "date": "2026-06-22", "status": "Delivered"},
        {"order_id": "#ORD-85100", "item": "Annual VIP Care Plan", "amount": 99.00, "date": "2026-03-01", "status": "Active"}
    ]

    return {
        "id": c.id,
        "customer_id": c.customer_id,
        "name": c.name,
        "email": c.email,
        "phone": c.phone,
        "tier": c.tier,
        "account_value": c.account_value,
        "preferred_channel": c.preferred_channel,
        "language": c.language,
        "sentiment_score": c.sentiment_score,
        "mood": c.mood,
        "last_interaction": c.last_interaction,
        "created_at": c.created_at,
        "open_cases_count": sum(1 for cs in cases if cs.status in ["OPEN", "PENDING_APPROVAL"]),
        "total_conversations": len(conversations),
        "recent_interactions": [
            {
                "id": i.id,
                "channel": i.channel,
                "summary": i.summary,
                "sentiment": i.sentiment,
                "created_at": i.created_at
            }
            for i in interactions
        ],
        "cases": [
            {
                "id": cs.id,
                "case_number": cs.case_number,
                "title": cs.title,
                "status": cs.status,
                "priority": cs.priority,
                "created_at": cs.created_at
            }
            for cs in cases
        ],
        "purchases": purchases,
        "ai_insights": insights
    }
