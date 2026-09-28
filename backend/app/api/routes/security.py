from typing import Dict, Any, List
from fastapi import APIRouter, Depends, Body
from sqlalchemy.orm import Session
from app.db.database import get_db
from app.models.models import PIIDetection
from app.schemas.schemas import PIIDetectRequest, PIIDetectResponse, VoiceAuthSimRequest, VoiceAuthSimResponse
from app.services.pii_service import pii_service
from app.services.voice_security_service import voice_security_service

router = APIRouter(prefix="/security", tags=["Security & PII"])

@router.post("/pii/detect", response_model=PIIDetectResponse)
def detect_and_mask_pii(payload: PIIDetectRequest) -> PIIDetectResponse:
    res = pii_service.scan_and_mask(payload.text)
    return PIIDetectResponse(
        original_text=res["original_text"],
        masked_text=res["masked_text"],
        entities_count=res["entities_count"],
        detections=res["detections"]
    )

@router.get("/pii/logs", response_model=List[Dict[str, Any]])
def list_pii_detections(limit: int = 50, db: Session = Depends(get_db)) -> List[Dict[str, Any]]:
    logs = db.query(PIIDetection).order_by(PIIDetection.created_at.desc()).limit(limit).all()
    return [
        {
            "id": l.id,
            "message_id": l.message_id,
            "entity_type": l.entity_type,
            "raw_preview_masked": l.raw_preview_masked,
            "action_taken": l.action_taken,
            "created_at": l.created_at
        }
        for l in logs
    ]

@router.post("/voice/simulate-verify", response_model=VoiceAuthSimResponse)
def simulate_voice_biometric_verification(payload: VoiceAuthSimRequest) -> VoiceAuthSimResponse:
    res = voice_security_service.verify_caller_voice(
        customer_id=payload.customer_id,
        sample_name=payload.audio_sample_name or "customer_voice_sample.wav"
    )
    return VoiceAuthSimResponse(**res)
