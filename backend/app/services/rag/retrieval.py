import math
from typing import List, Dict, Any, Optional
from sqlalchemy.orm import Session
from app.models.models import Document, DocumentChunk
from app.services.rag.embeddings import get_embedding_service

def cosine_similarity(v1: List[float], v2: List[float]) -> float:
    if not v1 or not v2 or len(v1) != len(v2):
        return 0.0
    dot = sum(a * b for a, b in zip(v1, v2))
    norm_a = math.sqrt(sum(a * a for a in v1))
    norm_b = math.sqrt(sum(b * b for b in v2))
    if norm_a == 0.0 or norm_b == 0.0:
        return 0.0
    return max(0.0, min(1.0, dot / (norm_a * norm_b)))

class RetrievalService:
    """Semantic vector search and context assembly engine."""

    def __init__(self, db: Session):
        self.db = db
        self.embedder = get_embedding_service()

    def search(
        self,
        query: str,
        category: Optional[str] = None,
        top_k: int = 4,
        min_score: float = 0.30
    ) -> List[Dict[str, Any]]:
        query_vec = self.embedder.generate_embedding(query)

        # Query all chunks joined with their document
        q = self.db.query(DocumentChunk, Document.title, Document.category).join(Document, DocumentChunk.document_id == Document.id)
        if category:
            q = q.filter(Document.category.ilike(f"%{category}%"))

        results = []
        for chunk, doc_title, doc_cat in q.all():
            chunk_vec = chunk.embedding
            if not chunk_vec:
                continue

            score = cosine_similarity(query_vec, chunk_vec)

            # Boost if exact keyword match occurs in text
            lower_query = query.lower()
            lower_content = chunk.content.lower()
            matching_terms = sum(1 for w in lower_query.split() if len(w) > 3 and w in lower_content)
            adjusted_score = min(1.0, score + (matching_terms * 0.06))

            if adjusted_score >= min_score:
                results.append({
                    "chunk_id": chunk.id,
                    "document_id": chunk.document_id,
                    "document_title": doc_title,
                    "category": doc_cat,
                    "page_number": chunk.page_number,
                    "chunk_index": chunk.chunk_index,
                    "content": chunk.content,
                    "similarity_score": round(adjusted_score, 4)
                })

        # Sort by similarity score descending
        results.sort(key=lambda x: x["similarity_score"], reverse=True)
        return results[:top_k]

    def build_context(self, retrieved_chunks: List[Dict[str, Any]]) -> str:
        if not retrieved_chunks:
            return ""

        context_lines = []
        for idx, chunk in enumerate(retrieved_chunks, 1):
            context_lines.append(
                f"--- SOURCE {idx}: {chunk['document_title']} (Page {chunk['page_number']}) ---\n"
                f"{chunk['content']}\n"
            )
        return "\n".join(context_lines)
