import os
import logging
import uuid
import datetime
from typing import Any, Callable, Dict, List, Optional
from qdrant_client import QdrantClient
from qdrant_client.http import models

logger = logging.getLogger("dirtynest-knowledge")

COLLECTION_NAME = "knowledge_vault"
VECTOR_DIM = 384  # BAAI/bge-small-en-v1.5 dimension — shared embedder
CHUNK_SIZE = 900
CHUNK_OVERLAP = 150
MAX_DOC_CHARS = 60000


class KnowledgeVaultEngine:
    """Document vault: chunked markdown/text ingest + vector search over Qdrant.

    Reuses the shared fastembed embedder (bge-small-en-v1.5, 384-dim) so only
    one model instance lives in the sidecar process.
    """

    def __init__(self, qdrant_url: Optional[str] = None, embed_fn: Optional[Callable[[str], List[float]]] = None):
        self.qdrant_url = qdrant_url or os.environ.get("QDRANT_URL", "http://localhost:6333")
        self.embed_fn = embed_fn
        self.client: Optional[QdrantClient] = None
        self.is_ready = False
        self._init_engine()

    def _init_engine(self):
        try:
            self.client = QdrantClient(url=self.qdrant_url, timeout=10)
            self._ensure_collection()
            self.is_ready = True
        except Exception as exc:  # degraded mode: endpoints report failure
            logger.warning("Knowledge vault engine degraded (%s): %s", self.qdrant_url, exc)
            self.client = None
            self.is_ready = False

    def _ensure_collection(self):
        if not self.client:
            return
        if not self.client.collection_exists(COLLECTION_NAME):
            self.client.create_collection(
                collection_name=COLLECTION_NAME,
                vectors_config=models.VectorParams(
                    size=VECTOR_DIM,
                    distance=models.Distance.COSINE,
                ),
            )

    # -- chunking -----------------------------------------------------------

    @staticmethod
    def chunk_text(text: str, size: int = CHUNK_SIZE, overlap: int = CHUNK_OVERLAP) -> List[str]:
        """Fixed-size word-boundary chunking with overlap."""
        text = (text or "").strip()
        if not text:
            return []
        if len(text) <= size:
            return [text]
        chunks: List[str] = []
        start = 0
        while start < len(text):
            end = min(start + size, len(text))
            if end < len(text):
                ws = text.rfind(" ", start, end)
                if ws > start + int(size * 0.5):
                    end = ws
            chunk = text[start:end].strip()
            if chunk:
                chunks.append(chunk)
            if end >= len(text):
                break
            start = max(end - overlap, start + 1)
        return chunks

    def _embed(self, text: str) -> List[float]:
        if not self.embed_fn:
            raise RuntimeError("Embedder not wired")
        return self.embed_fn(text)

    def ingest_document(
        self,
        title: str,
        content: str,
        doc_id: Optional[str] = None,
        source: Optional[str] = None,
        category: str = "doc",
        tags: Optional[List[str]] = None,
    ) -> Dict[str, Any]:
        if not self.is_ready or not self.client:
            raise RuntimeError("Knowledge vault engine not ready")

        content = (content or "").strip()[:MAX_DOC_CHARS]
        if not title or not content:
            raise ValueError("title and content are required")

        doc_id = doc_id or str(uuid.uuid4())
        # idempotent re-ingest: replace all previous chunks of this doc
        self.client.delete(
            collection_name=COLLECTION_NAME,
            points_selector=models.FilterSelector(
                filter=models.Filter(
                    must=[models.FieldCondition(key="doc_id", match=models.MatchValue(value=doc_id))]
                )
            ),
        )

        chunks = self.chunk_text(content)
        chunk_total = len(chunks)
        created_at = datetime.datetime.now(datetime.timezone.utc).isoformat()
        points = []
        for idx, chunk in enumerate(chunks):
            vector = self._embed(f"{title}\n{chunk}")
            points.append(
                models.PointStruct(
                    id=str(uuid.uuid4()),
                    vector=vector,
                    payload={
                        "doc_id": doc_id,
                        "doc_title": (title or "").strip()[:255],
                        "title": title,
                        "source": source,
                        "category": category,
                        "tags": tags or [],
                        "chunk_index": idx,
                        "chunk_total": chunk_total,
                        "content": chunk,
                        "chars": len(chunk),
                        "created_at": created_at,
                    },
                )
            )
        self.client.upsert(collection_name=COLLECTION_NAME, points=points)
        return {
            "id": doc_id,
            "title": title,
            "chunks": chunk_total,
            "category": category,
            "status": "UPSERTED",
        }

    def search(self, query: str, limit: int = 5, score_threshold: float = 0.65) -> List[Dict[str, Any]]:
        if not self.is_ready or not self.client:
            logger.warning("Knowledge vault not ready, returning empty search results")
            return []

        query_vector = self._embed(query)
        try:
            search_res = self.client.query_points(
                collection_name=COLLECTION_NAME,
                query=query_vector,
                limit=limit,
                score_threshold=score_threshold,
            ).points
        except Exception:
            search_res = self.client.search(
                collection_name=COLLECTION_NAME,
                query_vector=query_vector,
                limit=limit,
                score_threshold=score_threshold,
            )

        results = []
        for hit in search_res:
            payload = hit.payload or {}
            results.append(
                {
                    "id": str(hit.id),
                    "score": float(hit.score) if hasattr(hit, "score") else 0.0,
                    "payload": {
                        "doc_id": payload.get("doc_id"),
                        "title": payload.get("doc_title") or payload.get("title"),
                        "source": payload.get("source"),
                        "category": payload.get("category"),
                        "chunk_index": payload.get("chunk_index"),
                        "chunk_total": payload.get("chunk_total"),
                        "content": payload.get("content"),
                    },
                }
            )
        return results

    def list_documents(self, limit: int = 50) -> List[Dict[str, Any]]:
        if not self.is_ready or not self.client:
            return []
        points, _ = self.client.scroll(
            collection_name=COLLECTION_NAME,
            with_payload=True,
            limit=1000,
        )
        docs: Dict[str, Dict[str, Any]] = {}
        for pt in points:
            payload = pt.payload or {}
            doc_id = payload.get("doc_id")
            if not doc_id or doc_id in docs:
                continue
            docs[doc_id] = {
                "doc_id": doc_id,
                "title": payload.get("doc_title") or payload.get("title"),
                "source": payload.get("source"),
                "category": payload.get("category"),
                "chunks": payload.get("chunk_total"),
                "created_at": payload.get("created_at"),
                "snippet": (payload.get("content") or "")[:160],
            }
            if len(docs) >= limit:
                break
        return list(docs.values())

    def delete_document(self, doc_id: str) -> bool:
        if not self.is_ready or not self.client:
            return False
        self.client.delete(
            collection_name=COLLECTION_NAME,
            points_selector=models.FilterSelector(
                filter=models.Filter(
                    must=[models.FieldCondition(key="doc_id", match=models.MatchValue(value=doc_id))]
                )
            ),
        )
        return True


# Global Singleton Instance — embedder wired to the shared memory engine in main.py
knowledge_engine = KnowledgeVaultEngine()