import os
import logging
import re
import uuid
from pathlib import Path
from typing import List, Dict, Any, Optional

from fastembed import TextEmbedding
from qdrant_client import QdrantClient
from qdrant_client.http import models

logger = logging.getLogger("dirtynest-knowledge")

COLLECTION_NAME = "knowledge_vault"
VECTOR_DIM = 384  # BAAI/bge-small-en-v1.5 dimension
CHUNK_SIZE = 800  # words per chunk
CHUNK_OVERLAP = 80  # 10% overlap


class KnowledgeService:
    """Knowledge Vault: chunk + embed documents into Qdrant, semantic search,
    and Obsidian vault indexing (frontmatter -> tags, wiki-links -> edges)."""

    def __init__(self, qdrant_url: Optional[str] = None):
        self.qdrant_url = qdrant_url or os.environ.get("QDRANT_URL", "http://localhost:6333")
        self.client: Optional[QdrantClient] = None
        self.embedding_model: Optional[TextEmbedding] = None
        self.is_ready = False
        self._init_engine()

    def _init_engine(self):
        try:
            logger.info(f"Connecting to Qdrant at {self.qdrant_url}...")
            self.client = QdrantClient(url=self.qdrant_url, timeout=10)
            existing = [c.name for c in self.client.get_collections().collections]
            if COLLECTION_NAME not in existing:
                logger.info(f"Creating Qdrant collection '{COLLECTION_NAME}' (dim={VECTOR_DIM}, Cosine)...")
                self.client.create_collection(
                    collection_name=COLLECTION_NAME,
                    vectors_config=models.VectorParams(
                        size=VECTOR_DIM,
                        distance=models.Distance.COSINE
                    )
                )
            logger.info("Loading FastEmbed model 'BAAI/bge-small-en-v1.5'...")
            self.embedding_model = TextEmbedding(model_name="BAAI/bge-small-en-v1.5")
            self.is_ready = True
            logger.info("Knowledge Vault engine initialized successfully.")
        except Exception as e:
            logger.error(f"Failed to initialize KnowledgeService: {e}")
            self.is_ready = False

    def embed_text(self, text: str) -> List[float]:
        if not self.embedding_model:
            raise RuntimeError("Embedding model not loaded")
        return list(self.embedding_model.embed([text]))[0].tolist()

    def chunk_text(self, text: str, chunk_size: int = CHUNK_SIZE, overlap: int = CHUNK_OVERLAP) -> List[str]:
        """Split text into overlapping word chunks. Returns [text] if short."""
        words = text.split()
        if len(words) <= chunk_size:
            return [text]
        chunks: List[str] = []
        i = 0
        step = max(chunk_size - overlap, 1)
        while i < len(words):
            chunks.append(" ".join(words[i:i + chunk_size]))
            i += step
        return chunks

    def ingest_document(self, doc_id: Any, title: str, content: str,
                        category: str = "general", tags: Optional[List[str]] = None) -> List[str]:
        """Chunk + embed + upsert a document into Qdrant. Returns point ids."""
        if not self.is_ready or not self.client:
            raise RuntimeError("Knowledge engine not ready")
        tags = tags or []
        chunks = self.chunk_text(content)
        points = []
        for idx, chunk in enumerate(chunks):
            vector = self.embed_text(f"{title}\n{chunk}")
            point_id = str(uuid.uuid5(uuid.NAMESPACE_DNS, f"{doc_id}-{idx}"))
            points.append(models.PointStruct(
                id=point_id,
                vector=vector,
                payload={
                    "doc_id": str(doc_id),
                    "chunk_index": idx,
                    "title": title,
                    "text": chunk,
                    "category": category,
                    "tags": tags,
                }
            ))
        self.client.upsert(collection_name=COLLECTION_NAME, points=points)
        return [p.id for p in points]

    def search(self, query: str, limit: int = 5, score_threshold: float = 0.5) -> List[Dict[str, Any]]:
        if not self.is_ready or not self.client:
            logger.warning("Knowledge engine not ready, returning empty search results")
            return []
        query_vector = self.embed_text(query)
        try:
            hits = self.client.query_points(
                collection_name=COLLECTION_NAME,
                query=query_vector,
                limit=limit,
                score_threshold=score_threshold
            ).points
        except Exception:
            hits = self.client.search(
                collection_name=COLLECTION_NAME,
                query_vector=query_vector,
                limit=limit,
                score_threshold=score_threshold
            )
        results = []
        for hit in hits:
            payload = hit.payload or {}
            results.append({
                "doc_id": payload.get("doc_id", str(hit.id)),
                "chunk_index": payload.get("chunk_index", 0),
                "title": payload.get("title", "Untitled"),
                "text": payload.get("text", ""),
                "category": payload.get("category", "general"),
                "tags": payload.get("tags", []),
                "score": round(float(hit.score), 4),
            })
        return results

    def delete_document(self, doc_id: Any) -> bool:
        if not self.is_ready or not self.client:
            return False
        self.client.delete(
            collection_name=COLLECTION_NAME,
            points_selector=models.FilterSelector(
                filter=models.Filter(must=[
                    models.FieldCondition(key="doc_id", match=models.MatchValue(value=str(doc_id)))
                ])
            )
        )
        return True

    def count_points(self) -> int:
        if not self.is_ready or not self.client:
            return 0
        return self.client.count(collection_name=COLLECTION_NAME).count

    # ------------------------------------------------------------------
    # Obsidian vault indexing
    # ------------------------------------------------------------------

    def index_obsidian_vault(self, vault_path: str) -> Dict[str, Any]:
        """Walk a vault dir, parse .md files (frontmatter + wiki-links), and
        return docs (ready for ingest) plus graph edges (source_title -> target_title)."""
        root = Path(vault_path)
        if not root.exists() or not root.is_dir():
            raise FileNotFoundError(f"Vault path not found: {vault_path}")
        docs: List[Dict[str, Any]] = []
        edges: List[Dict[str, str]] = []
        for md in sorted(root.rglob("*.md")):
            try:
                text = md.read_text(encoding="utf-8", errors="replace")
            except Exception:
                continue
            frontmatter, body = self._parse_frontmatter(text)
            title = frontmatter.get("title") or md.stem
            tags = frontmatter.get("tags", [])
            if isinstance(tags, str):
                tags = [t.strip() for t in tags.split(",") if t.strip()]
            category = frontmatter.get("category", "Obsidian Wiki")
            wiki_links = self._extract_wiki_links(body)
            rel_path = str(md.relative_to(root)).replace("\\", "/")
            docs.append({
                "title": title,
                "content": body,
                "category": category,
                "tags": tags,
                "obsidian_path": rel_path,
                "wiki_links": wiki_links,
            })
            for target in wiki_links:
                edges.append({"source": title, "target": target})
        return {"docs": docs, "edges": edges}

    def _parse_frontmatter(self, text: str) -> tuple[Dict[str, Any], str]:
        """Return (frontmatter dict, body text). Handles YAML-ish frontmatter."""
        fm: Dict[str, Any] = {}
        body = text
        m = re.match(r"^---\s*\n(.*?)\n---\s*\n", text, re.DOTALL)
        if m:
            body = text[m.end():]
            for line in m.group(1).splitlines():
                if ":" not in line:
                    continue
                key, _, val = line.partition(":")
                key = key.strip()
                val = val.strip()
                if val.startswith("[") and val.endswith("]"):
                    val = [v.strip().strip("'\"") for v in val[1:-1].split(",") if v.strip()]
                else:
                    val = val.strip("'\"")
                fm[key] = val
        return fm, body

    def _extract_wiki_links(self, text: str) -> List[str]:
        """Extract [[Wiki Link]] targets (alias after | ignored) from markdown body."""
        return re.findall(r"\[\[([^\]|]+)(?:\|[^\]]+)?\]\]", text)


# Global Singleton Instance
knowledge_service = KnowledgeService()
