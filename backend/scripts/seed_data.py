import os
import sys
import json
from datetime import datetime, timezone, timedelta
from pathlib import Path

# Add parent directory to sys.path
sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

from app.db.database import engine, SessionLocal, Base
from app.core.security import get_password_hash
from app.models.models import (
    User, Agent, Customer, Conversation, Message, Case,
    AIRecommendation, AIDecision, AgentPerformance, AuditLog,
    CustomerInteraction, PIIDetection, Document, DocumentChunk
)
from app.services.rag.embeddings import MockEmbeddingService
from app.services.rag.chunking import SemanticChunker

def seed_database():
    print("Dropping and recreating database tables...")
    Base.metadata.drop_all(bind=engine)
    Base.metadata.create_all(bind=engine)

    db = SessionLocal()
    embedder = MockEmbeddingService()
    chunker = SemanticChunker(chunk_size=200, chunk_overlap=30)
    now = datetime.now(timezone.utc)

    print("Seeding Users & Agents...")
    users_data = [
        {"email": "admin@contactcenter.ai", "name": "Sarah Connor (Admin)", "role": "ADMIN", "password": "admin123"},
        {"email": "supervisor@contactcenter.ai", "name": "Marcus Vance (Supervisor)", "role": "SUPERVISOR", "password": "supervisor123"},
        {"email": "agent@contactcenter.ai", "name": "Jessica Taylor (Agent)", "role": "AGENT", "password": "agent123"},
    ]
    created_users = []
    for u in users_data:
        user_obj = User(
            email=u["email"],
            hashed_password=get_password_hash(u["password"]),
            full_name=u["name"],
            role=u["role"],
            is_active=True
        )
        db.add(user_obj)
        db.flush()
        created_users.append(user_obj)

    agents_data = [
        {"name": "Jessica Taylor", "email": "agent@contactcenter.ai", "user_id": created_users[2].id, "skills": "Billing, Escalations, Retention", "handled": 340, "aht": 3.8, "csat": 9.4, "res_rate": 93.5, "ai_rate": 94.0},
        {"name": "David Miller", "email": "david.m@contactcenter.ai", "skills": "Hardware Troubleshooting, Audio Setup", "handled": 280, "aht": 4.1, "csat": 9.1, "res_rate": 91.0, "ai_rate": 92.5},
        {"name": "Amina Al-Mansoor", "email": "amina.a@contactcenter.ai", "skills": "VIP Care, Cross-Sell, Warranty", "handled": 410, "aht": 3.5, "csat": 9.6, "res_rate": 95.0, "ai_rate": 96.0},
        {"name": "Carlos Rodriguez", "email": "carlos.r@contactcenter.ai", "skills": "Spanish Support, Billing Reversals", "handled": 290, "aht": 4.4, "csat": 8.9, "res_rate": 88.5, "ai_rate": 90.0},
        {"name": "Priya Sharma", "email": "priya.s@contactcenter.ai", "skills": "Hindi/English Technical Specialist", "handled": 365, "aht": 3.9, "csat": 9.3, "res_rate": 92.0, "ai_rate": 93.0},
        {"name": "Liam O'Connor", "email": "liam.o@contactcenter.ai", "skills": "Logistics, Shipping Inquiries", "handled": 220, "aht": 4.6, "csat": 8.7, "res_rate": 86.0, "ai_rate": 88.0},
        {"name": "Chloe Dubois", "email": "chloe.d@contactcenter.ai", "skills": "French Support, Order Modifications", "handled": 310, "aht": 4.0, "csat": 9.2, "res_rate": 90.5, "ai_rate": 91.5},
        {"name": "Hans Becker", "email": "hans.b@contactcenter.ai", "skills": "German Support, Warranty RMA", "handled": 275, "aht": 4.3, "csat": 9.0, "res_rate": 89.0, "ai_rate": 89.5},
        {"name": "Emily Watson", "email": "emily.w@contactcenter.ai", "skills": "General Inquiries, Account Security", "handled": 330, "aht": 4.2, "csat": 8.8, "res_rate": 88.0, "ai_rate": 91.0},
        {"name": "Alex Chen", "email": "alex.c@contactcenter.ai", "skills": "Tier 2 Technical Diagnostics", "handled": 260, "aht": 4.9, "csat": 8.6, "res_rate": 87.0, "ai_rate": 86.5},
    ]
    created_agents = []
    for a in agents_data:
        agent_obj = Agent(
            user_id=a.get("user_id"),
            name=a["name"],
            email=a["email"],
            skills=a["skills"],
            conversations_handled=a["handled"],
            avg_handle_time=a["aht"],
            csat=a["csat"],
            resolution_rate=a["res_rate"],
            ai_acceptance_rate=a["ai_rate"]
        )
        db.add(agent_obj)
        db.flush()
        created_agents.append(agent_obj)

    print("Seeding 20 Customers...")
    customers_raw = [
        ("CUST-1001", "Elena Rostova", "elena.r@example.com", "+1-555-0101", "Gold", 2400.0, "CHAT", "en", 0.35, "Frustrated"),
        ("CUST-1002", "Rajesh Patel", "rajesh.p@example.com", "+91-98765-43210", "VIP", 4500.0, "VOICE", "hi", 0.85, "Satisfied"),
        ("CUST-1003", "Maria Hernandez", "maria.h@example.com", "+34-600-112233", "Silver", 1200.0, "CHAT", "es", 0.50, "Neutral"),
        ("CUST-1004", "Jean Dupont", "jean.d@example.com", "+33-6-12345678", "Standard", 650.0, "EMAIL", "fr", 0.40, "Confused"),
        ("CUST-1005", "Klaus Schmidt", "klaus.s@example.com", "+49-151-2345678", "VIP", 3800.0, "VOICE", "de", 0.75, "Satisfied"),
        ("CUST-1006", "Sophia Miller", "sophia.m@example.com", "+1-555-0106", "Gold", 2100.0, "CHAT", "en", 0.60, "Neutral"),
        ("CUST-1007", "Aarav Sharma", "aarav.s@example.com", "+91-98111-22334", "Standard", 420.0, "SOCIAL", "hi", 0.20, "Angry"),
        ("CUST-1008", "Isabella Rossi", "isabella.r@example.com", "+39-340-9876543", "Silver", 1550.0, "CHAT", "en", 0.80, "Satisfied"),
        ("CUST-1009", "Lucas Martin", "lucas.m@example.com", "+33-6-98765432", "Gold", 2800.0, "VOICE", "fr", 0.45, "Frustrated"),
        ("CUST-1010", "Liam Johnson", "liam.j@example.com", "+1-555-0110", "VIP", 5200.0, "CHAT", "en", 0.90, "Satisfied"),
        ("CUST-1011", "Camila Alvarez", "camila.a@example.com", "+52-55-12345678", "Standard", 580.0, "SOCIAL", "es", 0.65, "Neutral"),
        ("CUST-1012", "Felix Weber", "felix.w@example.com", "+49-170-1122334", "Silver", 1350.0, "EMAIL", "de", 0.30, "Frustrated"),
        ("CUST-1013", "Ananya Deshmukh", "ananya.d@example.com", "+91-99887-76655", "Gold", 2600.0, "VOICE", "hi", 0.82, "Satisfied"),
        ("CUST-1014", "Noah Williams", "noah.w@example.com", "+1-555-0114", "Standard", 720.0, "CHAT", "en", 0.50, "Neutral"),
        ("CUST-1015", "Emma Brown", "emma.b@example.com", "+1-555-0115", "VIP", 4100.0, "CHAT", "en", 0.88, "Satisfied"),
        ("CUST-1016", "Mateo Gomez", "mateo.g@example.com", "+34-611-223344", "Silver", 1100.0, "VOICE", "es", 0.40, "Confused"),
        ("CUST-1017", "Claire Leroy", "claire.l@example.com", "+33-6-55443322", "Standard", 490.0, "CHAT", "fr", 0.70, "Satisfied"),
        ("CUST-1018", "Stefan Meyer", "stefan.m@example.com", "+49-160-9988776", "Gold", 2300.0, "EMAIL", "de", 0.25, "Angry"),
        ("CUST-1019", "Diya Sengupta", "diya.s@example.com", "+91-97766-55443", "Silver", 1600.0, "CHAT", "en", 0.60, "Neutral"),
        ("CUST-1020", "Oliver Davis", "oliver.d@example.com", "+1-555-0120", "VIP", 6000.0, "VOICE", "en", 0.95, "Satisfied")
    ]
    created_customers = []
    for c in customers_raw:
        cust_obj = Customer(
            customer_id=c[0],
            name=c[1],
            email=c[2],
            phone=c[3],
            tier=c[4],
            account_value=c[5],
            preferred_channel=c[6],
            language=c[7],
            sentiment_score=c[8],
            mood=c[9],
            last_interaction=now - timedelta(hours=int(c[0].replace("CUST-", "")) % 24)
        )
        db.add(cust_obj)
        db.flush()
        created_customers.append(cust_obj)

    print("Seeding Pre-Seeded Knowledge Documents...")
    company_docs = [
        {
            "title": "Warranty Policy v3.2",
            "category": "Policy",
            "description": "Comprehensive warranty terms, hardware defect guidelines, and RMA replacement procedure.",
            "pages": [
                "Smart Audio Pro and Wireless Headsets carry a 1-year limited manufacturer warranty from date of original purchase. Warranty covers manufacturing defects, hardware failure, speaker driver defects, and battery charging malfunctions.",
                "Damaged products caused by water immersion, accidental drops, or unauthorized modifications are not covered under standard warranty. However, customers with VIP Care Plans are entitled to a one-time 50% replacement discount.",
                "To initiate a warranty replacement, the customer must provide the device serial number and proof of purchase. Replacement units are dispatched with 2-day priority express shipping once verified."
            ]
        },
        {
            "title": "Refund Policy v3.1",
            "category": "Policy",
            "description": "Rules governing customer refund eligibility, processing timelines, and banking credits.",
            "pages": [
                "Customers are entitled to a full refund within 30 days of receipt if the product is in its original packaging. Approved refunds are processed to the original payment method within 5 to 7 business days.",
                "For duplicate transactions or verified billing errors, refunds up to $50.00 are eligible for instantaneous autonomous reversal by the AI Contact Center engine without manual supervisor sign-off.",
                "Refund amounts between $50.00 and $500.00 require human agent confirmation. Any refund exceeding $500.00 or complete account payout mandates supervisor review."
            ]
        },
        {
            "title": "Billing FAQ v2.4",
            "category": "Billing",
            "description": "Frequently asked billing questions, duplicate charges, payment gateway sync, and invoices.",
            "pages": [
                "Duplicate charges typically occur when a payment gateway handshake times out during checkout. In 99% of cases, the secondary authorization is automatically voided within 24 hours.",
                "If both transactions settle on your bank statement, provide the authorization code or last 4 digits of the payment card. Our billing agent will instantly issue a ledger adjustment and refund receipt.",
                "Subscription billing occurs on the 1st of each calendar month. Upgrades and downgrades are prorated based on remaining days in the active billing cycle."
            ]
        },
        {
            "title": "Product Troubleshooting Guide v4.0",
            "category": "Troubleshooting",
            "description": "Step-by-step diagnostic checklist for power, Bluetooth pairing, and audio issues.",
            "pages": [
                "If the device won't turn on: 1. Connect to official USB-C charging cable for at least 15 minutes. 2. Verify LED charging indicator turns amber. 3. Press and hold power button for 10 seconds to execute a hard hardware reset.",
                "Bluetooth connection failure: 1. Turn off device. 2. Remove device from phone Bluetooth paired devices list. 3. Hold pairing button for 5 seconds until blue LED flashes rapidly. 4. Reconnect via companion app.",
                "Firmware updates: Ensure battery has at least 50% charge before initiating over-the-air firmware updates via the mobile application."
            ]
        },
        {
            "title": "Shipping & Delivery Policy v1.8",
            "category": "Shipping",
            "description": "Standard, express, and international shipping timelines and tracking protocols.",
            "pages": [
                "Standard domestic shipping delivers within 3 to 5 business days. Express overnight shipping orders placed before 2:00 PM EST ship the same business day.",
                "Tracking numbers are generated automatically upon package carrier pickup (FedEx, UPS, DHL). Deliveries delayed beyond 7 business days are eligible for immediate replacement package dispatch."
            ]
        },
        {
            "title": "Order Cancellation Policy v2.0",
            "category": "Policy",
            "description": "Rules for canceling unfulfilled orders and subscription terminations.",
            "pages": [
                "Orders may be cancelled free of charge within 2 hours of placement before warehouse dispatch. Once an order enters the 'Packing' status, customers must initiate a standard 30-day return upon receipt.",
                "Subscription cancellations become effective at the conclusion of the current monthly billing period. No further recurring charges will be incurred."
            ]
        },
        {
            "title": "Premium VIP Support SLA v1.5",
            "category": "Support",
            "description": "SLA guarantees, expedited queues, and dedicated account manager terms for VIP tier.",
            "pages": [
                "VIP and Gold tier members receive priority routing with guaranteed first response times under 60 seconds across voice, chat, and email channels.",
                "VIP customers receive complimentary expedited shipping on all replacement parts and direct access to Tier 2 technical specialists without intermediate transfers."
            ]
        },
        {
            "title": "Product Manual - Smart Audio Pro v2",
            "category": "Manual",
            "description": "Hardware specifications, touch controls, battery life, and maintenance.",
            "pages": [
                "Smart Audio Pro features active hybrid noise cancellation (up to -38dB), 40mm titanium diaphragm drivers, and 45-hour continuous battery playback.",
                "Touch controls: Single tap on right earcup toggles Play/Pause. Double tap skips track forward. Long press (2 seconds) activates voice assistant or Ambient Sound mode."
            ]
        }
    ]

    for doc_item in company_docs:
        doc = Document(
            title=doc_item["title"],
            category=doc_item["category"],
            description=doc_item["description"],
            file_type="TXT",
            version="v3.2",
            page_count=len(doc_item["pages"]),
            processing_status="INDEXED",
            uploaded_by="Admin"
        )
        db.add(doc)
        db.flush()

        chunk_idx = 0
        for p_idx, page_text in enumerate(doc_item["pages"], 1):
            chunks = chunker.chunk_text(page_text, page_number=p_idx)
            for c in chunks:
                emb = embedder.generate_embedding(c["content"])
                chunk_obj = DocumentChunk(
                    document_id=doc.id,
                    content=c["content"],
                    page_number=p_idx,
                    chunk_index=chunk_idx,
                    embedding_json=json.dumps(emb),
                    metadata_json=json.dumps({"token_count": c.get("token_count", 0)})
                )
                db.add(chunk_obj)
                chunk_idx += 1

        doc.chunk_count = chunk_idx

    print("Seeding 50 Conversations across Channels with Diarized Messages...")
    channels = ["CHAT", "VOICE", "EMAIL", "SOCIAL"]
    intents = [
        "Duplicate Billing", "Refund Request", "Warranty Replacement",
        "Technical Troubleshooting", "Shipping Status", "Order Cancellation"
    ]

    for i in range(1, 51):
        cust = created_customers[(i - 1) % len(created_customers)]
        agent = created_agents[(i - 1) % len(created_agents)] if i % 4 != 0 else None
        channel = channels[i % len(channels)]
        intent = intents[i % len(intents)]

        sentiment = "Neutral"
        mood = "Calm"
        priority = "MEDIUM"
        if intent in ["Duplicate Billing", "Refund Request"]:
            sentiment = "Frustrated" if i % 2 == 0 else "Angry"
            mood = "Frustrated"
            priority = "HIGH" if sentiment == "Angry" else "MEDIUM"
        elif intent == "Warranty Replacement":
            sentiment = "Confused"
            mood = "Confused"
            priority = "MEDIUM"
        else:
            sentiment = "Satisfied" if i % 3 == 0 else "Neutral"
            mood = "Satisfied" if sentiment == "Satisfied" else "Calm"
            priority = "LOW"

        status = "ACTIVE" if i <= 14 else "RESOLVED"
        duration = 120 + (i * 15)

        conv = Conversation(
            customer_id=cust.id,
            agent_id=agent.id if agent else None,
            channel=channel,
            status=status,
            priority=priority,
            subject=f"{intent} - Order #{49000 + i}",
            sentiment=sentiment,
            mood=mood,
            intent=intent,
            ai_confidence=round(0.88 + ((i % 10) * 0.01), 2),
            duration_seconds=duration,
            started_at=now - timedelta(minutes=duration + (i * 10)),
            recommended_action=f"Verify {intent.lower()} policy and provide solution."
        )
        db.add(conv)
        db.flush()

        # Seed Diarized Messages
        if intent == "Duplicate Billing":
            m1 = Message(
                conversation_id=conv.id,
                speaker="CUSTOMER",
                content=f"Hello, I was charged twice for order #{49000 + i} on my card 4111 2222 3333 4444. Please help!",
                masked_content=f"Hello, I was charged twice for order #{49000 + i} on my card **** **** **** 4444. Please help!",
                sentiment="Frustrated",
                intent="Duplicate Billing",
                pii_detected=True,
                created_at=conv.started_at + timedelta(seconds=10)
            )
            m2 = Message(
                conversation_id=conv.id,
                speaker="AI",
                content="Identified duplicate billing intent with 95% confidence. Grounded in Billing FAQ v2.4 (Page 2).",
                sentiment="Neutral",
                created_at=conv.started_at + timedelta(seconds=15)
            )
            m3 = Message(
                conversation_id=conv.id,
                speaker="AGENT",
                content=f"Hello {cust.name}, I apologize for the duplicate charge! I have verified transaction #TXN-{9000 + i} and initiated an automatic refund.",
                sentiment="Satisfied",
                created_at=conv.started_at + timedelta(seconds=45)
            )
            db.add_all([m1, m2, m3])
        elif intent == "Warranty Replacement":
            m1 = Message(
                conversation_id=conv.id,
                speaker="CUSTOMER",
                content="My headphones stopped turning on after two months. Can I get a warranty replacement?",
                sentiment="Confused",
                intent="Warranty Replacement",
                pii_detected=False,
                created_at=conv.started_at + timedelta(seconds=10)
            )
            m2 = Message(
                conversation_id=conv.id,
                speaker="AGENT",
                content="Yes! Under Warranty Policy v3.2, you are within the 1-year coverage. Let me generate a prepaid return label.",
                sentiment="Satisfied",
                created_at=conv.started_at + timedelta(seconds=40)
            )
            db.add_all([m1, m2])
        else:
            m1 = Message(
                conversation_id=conv.id,
                speaker="CUSTOMER",
                content=f"Inquiry regarding {intent.lower()} for account {cust.email}.",
                masked_content=f"Inquiry regarding {intent.lower()} for account {cust.email[:2]}***@{cust.email.split('@')[1]}.",
                sentiment=sentiment,
                intent=intent,
                pii_detected=True,
                created_at=conv.started_at + timedelta(seconds=10)
            )
            m2 = Message(
                conversation_id=conv.id,
                speaker="AGENT",
                content="Thank you for contacting support! I'd be happy to assist you with this right away.",
                sentiment="Neutral",
                created_at=conv.started_at + timedelta(seconds=35)
            )
            db.add_all([m1, m2])

        # Seed Cases
        if i <= 15:
            case_obj = Case(
                case_number=f"CASE-{4000 + i}",
                customer_id=cust.id,
                conversation_id=conv.id,
                title=f"{intent} Case for {cust.name}",
                description=f"Automated case created from {channel} channel interaction.",
                status="OPEN" if i <= 5 else ("PENDING_APPROVAL" if i <= 9 else "RESOLVED"),
                priority=priority,
                resolution_notes="Resolved via AI Contact Center standard operating procedure." if i > 9 else None
            )
            db.add(case_obj)

        # Seed AI Decisions & Recommendations
        if i <= 20:
            rec = AIRecommendation(
                conversation_id=conv.id,
                action=f"Apply {intent} standard resolution flow",
                reason=f"Customer expressed {sentiment} sentiment regarding {intent}.",
                confidence=round(0.85 + (i * 0.005), 2),
                expected_outcome="Reduce repeat contacts and restore CSAT.",
                requires_approval=i % 3 == 0,
                status="ACCEPTED" if i % 2 == 0 else "PROPOSED"
            )
            db.add(rec)

            approval_stat = "APPROVED" if i % 4 == 0 else ("PENDING_HUMAN" if i % 3 == 0 else "AUTO_APPROVED")
            decision = AIDecision(
                conversation_id=conv.id,
                decision=f"Execute {intent} automated action",
                action_type="REFUND" if "Billing" in intent else "RMA_REPLACEMENT",
                reason=f"Policy verified against grounded knowledge base with 94% relevance.",
                confidence=0.94,
                retrieved_knowledge="Warranty Policy v3.2 & Billing FAQ v2.4",
                risk_level="HIGH" if approval_stat == "PENDING_HUMAN" else "LOW",
                approval_status=approval_stat,
                execution_result=f"Dispatched automated settlement to gateway. Auth #{8000 + i}.",
                actor="Autonomous Agent"
            )
            db.add(decision)

            audit = AuditLog(
                conversation_id=conv.id,
                actor="Autonomous Agent",
                ai_provider="MockAI / Gemini-Ready",
                model="MockAI-v1.0",
                action=f"Process {intent}",
                reason="Autonomous resolution threshold satisfied.",
                confidence=0.94,
                approval=approval_stat,
                result="SUCCESS" if approval_stat != "PENDING_HUMAN" else "PENDING_APPROVAL",
                ip_address="127.0.0.1"
            )
            db.add(audit)

        # Seed Customer Interaction
        inter = CustomerInteraction(
            customer_id=cust.id,
            conversation_id=conv.id,
            channel=channel,
            summary=f"Contacted regarding {intent}. Handled via {channel} with {sentiment} sentiment.",
            sentiment=sentiment,
            created_at=conv.started_at
        )
        db.add(inter)

    db.commit()
    db.close()
    print("Database seeding completed successfully with 20 customers, 10 agents, 50 conversations, and pre-seeded knowledge documents!")

if __name__ == "__main__":
    seed_database()
