import re
from typing import List, Dict, Any

class SemanticChunker:
    """Splits raw documents into contextual chunks with sliding window overlap."""

    def __init__(self, chunk_size: int = 400, chunk_overlap: int = 50):
        self.chunk_size = chunk_size
        self.chunk_overlap = chunk_overlap

    def chunk_text(self, text: str, page_number: int = 1) -> List[Dict[str, Any]]:
        # Clean text
        clean_text = re.sub(r'\s+', ' ', text).strip()
        words = clean_text.split()
        if not words:
            return []

        chunks = []
        start = 0
        chunk_idx = 0

        while start < len(words):
            end = min(start + self.chunk_size, len(words))
            chunk_content = " ".join(words[start:end])

            chunks.append({
                "chunk_index": chunk_idx,
                "page_number": page_number,
                "content": chunk_content,
                "token_count": len(words[start:end])
            })
            chunk_idx += 1

            if end == len(words):
                break
            start += (self.chunk_size - self.chunk_overlap)

        return chunks
