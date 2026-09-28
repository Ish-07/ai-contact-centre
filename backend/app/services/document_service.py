import os
import json
import logging
from pathlib import Path
from typing import Dict, Any, Optional
from sqlalchemy.orm import Session
from app.models.models import Document, DocumentChunk
from app.services.ocr.paddleocr_service import PaddleOCRService
from app.services.rag.chunking import SemanticChunker
from app.services.rag.embeddings import get_embedding_service
from app.core.config import settings

logger = logging.getLogger(__name__)

class DocumentService:
    def __init__(self, db: Session):
        self.db = db
        self.ocr_service = PaddleOCRService()
        self.chunker = SemanticChunker(chunk_size=350, chunk_overlap=40)
        self.embedder = get_embedding_service()

    def process_and_index_document(self, document_id: int) -> Document:
        doc = self.db.query(Document).filter(Document.id == document_id).first()
        if not doc:
            raise ValueError(f"Document with ID {document_id} not found.")

        try:
            # Step 1: Processing Status
            doc.processing_status = "PROCESSING"
            self.db.commit()

            file_path = doc.file_path
            if not file_path or not os.path.exists(file_path):
                raise FileNotFoundError(f"Document file does not exist at {file_path}")

            # Step 2: OCR / Parsing
            doc.processing_status = "OCR_PROCESSING"
            self.db.commit()

            parsed = self.ocr_service.extract_text_from_file(file_path)
            doc.page_count = parsed.get("page_count", 1)

            # Step 3: Chunking
            doc.processing_status = "CHUNKING"
            self.db.commit()

            # Delete old chunks if any
            self.db.query(DocumentChunk).filter(DocumentChunk.document_id == doc.id).delete()

            chunks_to_create = []
            chunk_texts = []

            for page in parsed.get("pages", []):
                p_num = page.get("page_number", 1)
                text = page.get("text", "")
                sub_chunks = self.chunker.chunk_text(text, page_number=p_num)

                for sc in sub_chunks:
                    chunks_to_create.append(sc)
                    chunk_texts.append(sc["content"])

            # Step 4: Embedding
            doc.processing_status = "EMBEDDING"
            self.db.commit()

            embeddings = self.embedder.generate_embeddings(chunk_texts)

            # Step 5: Save Chunks with Embeddings
            for idx, c_data in enumerate(chunks_to_create):
                emb = embeddings[idx] if idx < len(embeddings) else []
                chunk_obj = DocumentChunk(
                    document_id=doc.id,
                    content=c_data["content"],
                    page_number=c_data["page_number"],
                    chunk_index=c_data["chunk_index"],
                    embedding_json=json.dumps(emb),
                    metadata_json=json.dumps({"token_count": c_data.get("token_count", 0)})
                )
                self.db.add(chunk_obj)

            doc.chunk_count = len(chunks_to_create)
            doc.processing_status = "INDEXED"
            self.db.commit()
            self.db.refresh(doc)
            logger.info(f"Document {doc.title} (ID {doc.id}) indexed with {doc.chunk_count} chunks.")
            return doc

        except Exception as e:
            logger.error(f"Failed to process document {document_id}: {e}")
            doc.processing_status = "FAILED"
            self.db.commit()
            raise e
