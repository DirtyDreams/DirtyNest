import os
import logging
import uuid
from typing import List, Dict, Any, Optional
from fastembed import TextEmbedding
from qdrant_client import QdrantClient
from qdrant_client.http import models

logger = logging.getLogger("dirtynest-memory")

COLLECTION_NAME = "hermes_memories"
VECTOR_DIM = 384  # BAAI/bge-small-en-v1.5 dimension

class QdrantMemoryEngine:
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
            
            # Ensure collection exists
            collections_res = self.client.get_collections().collections
            existing_names = [c.name for c in collections_res]
            
            if COLLECTION_NAME not in existing_names:
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
            logger.info("Qdrant Memory Engine initialized successfully.")
            
            # Seed initial architecture facts if empty
            count = self.client.count(collection_name=COLLECTION_NAME).count
            if count == 0:
                self.seed_system_facts()
                
        except Exception as e:
            logger.error(f"Failed to initialize QdrantMemoryEngine: {e}")
            self.is_ready = False

    def embed_text(self, text: str) -> List[float]:
        if not self.embedding_model:
            raise RuntimeError("Embedding model not loaded")
        embeddings = list(self.embedding_model.embed([text]))
        return embeddings[0].tolist()

    def add_memory(self, memory_id: str, title: str, content: str, category: str = "fact", tags: Optional[List[str]] = None) -> Dict[str, Any]:
        if not self.is_ready or not self.client:
            raise RuntimeError("Qdrant engine not ready")
        
        tags = tags or []
        payload_text = f"{title}\n{content}\nTags: {', '.join(tags)}"
        vector = self.embed_text(payload_text)
        
        point_id = memory_id if isinstance(memory_id, str) and "-" in memory_id else str(uuid.uuid4())
        
        self.client.upsert(
            collection_name=COLLECTION_NAME,
            points=[
                models.PointStruct(
                    id=point_id,
                    vector=vector,
                    payload={
                        "memory_id": memory_id,
                        "title": title,
                        "content": content,
                        "category": category,
                        "tags": tags,
                        "created_at": os.popen("date /t").read().strip() if os.name == "nt" else "now"
                    }
                )
            ]
        )
        return {
            "id": point_id,
            "title": title,
            "category": category,
            "tags": tags,
            "status": "UPSERTED"
        }

    def search_memories(self, query: str, limit: int = 5, score_threshold: float = 0.65) -> List[Dict[str, Any]]:
        if not self.is_ready or not self.client:
            logger.warning("Qdrant engine not ready, returning empty search results")
            return []
        
        query_vector = self.embed_text(query)
        
        # Use query_points for modern qdrant-client
        try:
            search_res = self.client.query_points(
                collection_name=COLLECTION_NAME,
                query=query_vector,
                limit=limit,
                score_threshold=score_threshold
            ).points
        except Exception:
            search_res = self.client.search(
                collection_name=COLLECTION_NAME,
                query_vector=query_vector,
                limit=limit,
                score_threshold=score_threshold
            )
        
        results = []
        for hit in search_res:
            payload = hit.payload or {}
            results.append({
                "id": str(hit.id),
                "memory_id": payload.get("memory_id", str(hit.id)),
                "title": payload.get("title", "Untitled"),
                "content": payload.get("content", ""),
                "category": payload.get("category", "general"),
                "tags": payload.get("tags", []),
                "score": round(float(hit.score), 4)
            })
        return results

    def delete_memory(self, memory_id: str) -> bool:
        if not self.is_ready or not self.client:
            return False
        
        self.client.delete(
            collection_name=COLLECTION_NAME,
            points_selector=models.PointIdsList(points=[memory_id])
        )
        return True

    def list_memories(self, limit: int = 50) -> List[Dict[str, Any]]:
        if not self.is_ready or not self.client:
            return []
        
        records, _ = self.client.scroll(
            collection_name=COLLECTION_NAME,
            limit=limit,
            with_payload=True,
            with_vectors=False
        )
        
        results = []
        for r in records:
            payload = r.payload or {}
            results.append({
                "id": str(r.id),
                "memory_id": payload.get("memory_id", str(r.id)),
                "title": payload.get("title", "Untitled"),
                "content": payload.get("content", ""),
                "category": payload.get("category", "general"),
                "tags": payload.get("tags", [])
            })
        return results

    def seed_system_facts(self):
        logger.info("Seeding initial DirtyNest architecture facts into Qdrant...")
        initial_facts = [
            {
                "title": "DirtyNest Architecture & Ports",
                "content": "DirtyNest is a Next.js 16 (Turbopack) & Cyberpunk UI dashboard with a FastAPI Python sidecar on :8000, SkillClaw Model Router on :30000, PostgreSQL 16 on :5432, Qdrant Vector Engine on :6333, Redis on :6379, and Minions Swarm on :6969.",
                "category": "architecture",
                "tags": ["ports", "architecture", "docker", "services"]
            },
            {
                "title": "Hermes ACP Protocol & Zero-Trust HITL",
                "content": "Hermes ACP (Agent Client Protocol) runs over JSON-RPC 2.0. Risky tools like run_command and file edits require Human-In-The-Loop (HITL) clearance before execution.",
                "category": "security",
                "tags": ["acp", "hitl", "permissions", "zero-trust"]
            },
            {
                "title": "Database Schema & Persistence",
                "content": "Primary database is PostgreSQL 16 accessed via Drizzle ORM (postgres-js). Core tables include todos, hermes_sessions, hermes_messages, hermes_tool_logs, and hermes_memories.",
                "category": "database",
                "tags": ["postgres", "drizzle", "schema", "tables"]
            },
            {
                "title": "SkillClaw Proxy & Models",
                "content": "SkillClaw runs on http://127.0.0.1:30000 with 108 injected skills, routing to Nous-Hermes-3-Llama-3.1-8B and meta-llama/Llama-3.3-70B-Instruct.",
                "category": "ai",
                "tags": ["skillclaw", "models", "hermes", "proxy"]
            }
        ]
        
        for fact in initial_facts:
            fid = str(uuid.uuid4())
            self.add_memory(
                memory_id=fid,
                title=fact["title"],
                content=fact["content"],
                category=fact["category"],
                tags=fact["tags"]
            )
        logger.info("Initial architecture facts seeded successfully.")

# Global Singleton Instance
memory_engine = QdrantMemoryEngine()
