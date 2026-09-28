import os
import shutil
from pathlib import Path
from typing import List, Dict, Any, Optional
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form
from sqlalchemy.orm import Session
from app.db.database import get_db
from app.models.models import Document, DocumentChunk
from app.schemas.schemas import DocumentResponse, DocumentChunkResponse, KnowledgeSearchRequest, KnowledgeSearchResult, KnowledgeQueryRequest, KnowledgeQueryResponse
from app.services.document_service import DocumentService
from app.services.rag.retrieval import RetrievalService
from app.services.ai.factory import get_ai_service
from app.core.config import settings

router = APIRouter(tags=["Knowledge Base & RAG"])

@router.get("/documents", response_model=List[DocumentResponse])
def list_documents(category: Optional[str] = None, db: Session = Depends(get_db)) -> List[Document]:
    q = db.query(Document)
    if category:
        q = q.filter(Document.category.ilike(f"%{category}%"))
    return q.order_by(Document.created_at.desc()).all()

@router.get("/documents/{id}", response_model=Dict[str, Any])
def get_document(id: int, db: Session = Depends(get_db)) -> Dict[str, Any]:
    doc = db.query(Document).filter(Document.id == id).first()
    if not doc:
        raise HTTPException(status_code=404, detail="Document not found")

    chunks = db.query(DocumentChunk).filter(DocumentChunk.document_id == doc.id).order_by(DocumentChunk.chunk_index.asc()).all()

    return {
        "id": doc.id,
        "title": doc.title,
        "description": doc.description,
        "category": doc.category,
        "file_type": doc.file_type,
        "version": doc.version,
        "page_count": doc.page_count,
        "chunk_count": doc.chunk_count,
        "processing_status": doc.processing_status,
        "uploaded_by": doc.uploaded_by,
        "created_at": doc.created_at,
        "chunks": [
            {
                "id": ch.id,
                "document_id": ch.document_id,
                "document_title": doc.title,
                "content": ch.content,
                "page_number": ch.page_number,
                "chunk_index": ch.chunk_index
            }
            for ch in chunks
        ]
    }

@router.post("/documents/upload", response_model=DocumentResponse)
async def upload_document(
    file: UploadFile = File(...),
    title: str = Form(...),
    category: str = Form("Policy"),
    description: Optional[str] = Form(""),
    version: str = Form("v1.0"),
    db: Session = Depends(get_db)
) -> Document:
    # Save file to storage
    file_ext = Path(file.filename).suffix.upper().replace(".", "")
    safe_filename = f"{title.replace(' ', '_').lower()}_{file.filename}"
    save_path = Path(settings.STORAGE_DIR) / safe_filename

    with open(save_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    # Create Document record
    doc = Document(
        title=title,
        description=description,
        category=category,
        file_type=file_ext,
        version=version,
        file_path=str(save_path),
        processing_status="UPLOADED",
        uploaded_by="Admin"
    )
    db.add(doc)
    db.commit()
    db.refresh(doc)

    # Trigger indexing pipeline
    doc_service = DocumentService(db)
    indexed_doc = doc_service.process_and_index_document(doc.id)
    return indexed_doc

@router.delete("/documents/{id}", response_model=Dict[str, Any])
def delete_document(id: int, db: Session = Depends(get_db)) -> Dict[str, Any]:
    doc = db.query(Document).filter(Document.id == id).first()
    if not doc:
        raise HTTPException(status_code=404, detail="Document not found")

    if doc.file_path and os.path.exists(doc.file_path):
        try:
            os.remove(doc.file_path)
        except Exception:
            pass

    db.delete(doc)
    db.commit()
    return {"message": "Document deleted successfully", "id": id}

@router.post("/knowledge/search", response_model=KnowledgeSearchResult)
def search_knowledge(payload: KnowledgeSearchRequest, db: Session = Depends(get_db)) -> KnowledgeSearchResult:
    retriever = RetrievalService(db)
    results = retriever.search(
        query=payload.query,
        category=payload.category,
        top_k=payload.top_k,
        min_score=payload.min_score
    )

    chunk_responses = [
        DocumentChunkResponse(
            id=r["chunk_id"],
            document_id=r["document_id"],
            document_title=r["document_title"],
            content=r["content"],
            page_number=r["page_number"],
            chunk_index=r["chunk_index"],
            similarity_score=r["similarity_score"]
        )
        for r in results
    ]

    return KnowledgeSearchResult(
        query=payload.query,
        results=chunk_responses,
        total_found=len(chunk_responses)
    )

@router.post("/knowledge/query", response_model=KnowledgeQueryResponse)
async def query_knowledge(payload: KnowledgeQueryRequest, db: Session = Depends(get_db)) -> KnowledgeQueryResponse:
    retriever = RetrievalService(db)
    top_chunks = retriever.search(
        query=payload.query,
        category=payload.category,
        top_k=4,
        min_score=0.25
    )

    ai = get_ai_service()
    answer_obj = await ai.answer_knowledge_query(payload.query, top_chunks)

    return KnowledgeQueryResponse(
        query=payload.query,
        answer=answer_obj.answer,
        confidence=answer_obj.confidence,
        grounded=answer_obj.grounded,
        sources=answer_obj.sources,
        insufficient_information=answer_obj.insufficient_information,
        recommended_action=answer_obj.recommended_action
    )
