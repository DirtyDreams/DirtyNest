"""
Knowledge Vault (F4) — guard-rail tests for the sidecar knowledge_service.

Covers:
- chunk_text: short text stays one chunk; long text splits with overlap
- Obsidian frontmatter parsing (title/tags/category) and [[wiki-link]] extraction
- ingest_document -> search roundtrip against a mocked Qdrant client
- delete_document removes all points for a doc_id
"""

import sys
from pathlib import Path

import numpy as np
import pytest

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))

from knowledge_service import KnowledgeService, CHUNK_SIZE, CHUNK_OVERLAP  # noqa: E402


class FakeEmbedding:
    """Deterministic fake embedding: hash-based vector so identical text
    yields identical vectors (enables a meaningful cosine-ish search)."""

    def embed(self, texts):
        for text in texts:
            vec = [0.0] * 8
            for i, ch in enumerate(text):
                vec[i % 8] += ord(ch) * 0.001
            yield np.array(vec, dtype=np.float32)


class FakeQdrant:
    def __init__(self):
        self.points = {}

    def get_collections(self):
        class C:
            collections = []
        return C()

    def create_collection(self, **kwargs):
        pass

    def upsert(self, collection_name, points):
        for p in points:
            self.points[p.id] = p

    def query_points(self, collection_name, query, limit, score_threshold):
        points = self.points

        class Hit:
            def __init__(self, pid, score):
                self.id = pid
                self.score = score
                self.payload = points[pid].payload

        scored = []
        for pid, p in points.items():
            # crude cosine similarity over the 8-dim fake vectors
            a = p.vector
            b = query
            dot = sum(x * y for x, y in zip(a, b))
            na = sum(x * x for x in a) ** 0.5
            nb = sum(x * x for x in b) ** 0.5
            score = dot / (na * nb) if na and nb else 0.0
            if score >= score_threshold:
                scored.append((score, pid))
        scored.sort(reverse=True)
        class Res:
            points = [Hit(pid, s) for s, pid in scored[:limit]]
        return Res()

    def delete(self, collection_name, points_selector):
        # points_selector is a FilterSelector; drop points whose payload
        # doc_id matches the filter value.
        flt = points_selector.filter
        value = flt.must[0].match.value
        self.points = {pid: p for pid, p in self.points.items() if p.payload.get("doc_id") != value}

    def count(self, collection_name):
        class C:
            count = len(self.points)
        return C()


@pytest.fixture()
def service(monkeypatch):
    ks = KnowledgeService(qdrant_url="http://fake:6333")
    ks.client = FakeQdrant()
    ks.embedding_model = FakeEmbedding()
    ks.is_ready = True
    return ks


def test_chunk_text_short_stays_single():
    ks = KnowledgeService(qdrant_url="http://fake:6333")
    text = "short text"
    assert ks.chunk_text(text) == [text]


def test_chunk_text_long_splits_with_overlap():
    ks = KnowledgeService(qdrant_url="http://fake:6333")
    words = ["w"] * (CHUNK_SIZE * 2 + 10)
    text = " ".join(words)
    chunks = ks.chunk_text(text)
    assert len(chunks) >= 2
    # overlap: consecutive chunks share words
    first_words = chunks[0].split()
    second_words = chunks[1].split()
    assert first_words[-CHUNK_OVERLAP:] == second_words[:CHUNK_OVERLAP]


def test_parse_frontmatter_extracts_fields():
    ks = KnowledgeService(qdrant_url="http://fake:6333")
    text = "---\ntitle: My Doc\ntags: [a, b]\ncategory: ops\n---\nBody here"
    fm, body = ks._parse_frontmatter(text)
    assert fm["title"] == "My Doc"
    assert fm["tags"] == ["a", "b"]
    assert fm["category"] == "ops"
    assert body == "Body here"


def test_parse_frontmatter_no_frontmatter():
    ks = KnowledgeService(qdrant_url="http://fake:6333")
    fm, body = ks._parse_frontmatter("Just body text")
    assert fm == {}
    assert body == "Just body text"


def test_extract_wiki_links():
    ks = KnowledgeService(qdrant_url="http://fake:6333")
    links = ks._extract_wiki_links("See [[Other Doc]] and [[Alias|Target]] and [[Plain]]")
    assert links == ["Other Doc", "Alias", "Plain"]


def test_ingest_search_roundtrip(service):
    service.ingest_document(
        doc_id="7",
        title="DirtyNest Architecture",
        content="DirtyNest uses PostgreSQL for persistence and Qdrant for vector search.",
        category="architecture",
        tags=["postgres", "qdrant"],
    )
    assert service.count_points() == 1
    results = service.search("postgres persistence", limit=3, score_threshold=0.0)
    assert len(results) == 1
    assert results[0]["doc_id"] == "7"
    assert results[0]["title"] == "DirtyNest Architecture"
    assert results[0]["category"] == "architecture"
    assert results[0]["tags"] == ["postgres", "qdrant"]


def test_ingest_multiple_chunks_search(service):
    content = " ".join(["word"] * (CHUNK_SIZE * 2 + 5))
    service.ingest_document(doc_id="9", title="Long Doc", content=content, category="general")
    assert service.count_points() >= 2
    results = service.search("word", limit=5, score_threshold=0.0)
    assert len(results) >= 1
    assert all(r["doc_id"] == "9" for r in results)


def test_delete_document_removes_all_points(service):
    service.ingest_document(doc_id="3", title="Doc A", content="alpha beta gamma", category="general")
    service.ingest_document(doc_id="4", title="Doc B", content="delta epsilon zeta", category="general")
    assert service.count_points() == 2
    assert service.delete_document("3") is True
    assert service.count_points() == 1
    remaining = service.search("alpha", limit=5, score_threshold=0.0)
    assert all(r["doc_id"] != "3" for r in remaining)


def test_index_obsidian_vault(tmp_path):
    (tmp_path / "Home.md").write_text(
        "---\ntitle: Home\ntags: [index, home]\ncategory: wiki\n---\nWelcome. See [[Architecture]].",
        encoding="utf-8",
    )
    sub = tmp_path / "Sub"
    sub.mkdir()
    (sub / "Architecture.md").write_text(
        "---\ntitle: Architecture\ntags: [system]\ncategory: ops\n---\nLinks to [[Home]].",
        encoding="utf-8",
    )
    ks = KnowledgeService(qdrant_url="http://fake:6333")
    result = ks.index_obsidian_vault(str(tmp_path))
    assert len(result["docs"]) == 2
    titles = {d["title"] for d in result["docs"]}
    assert titles == {"Home", "Architecture"}
    home = next(d for d in result["docs"] if d["title"] == "Home")
    assert home["tags"] == ["index", "home"]
    assert home["wiki_links"] == ["Architecture"]
    assert home["obsidian_path"] == "Home.md"
    arch = next(d for d in result["docs"] if d["title"] == "Architecture")
    assert arch["obsidian_path"] == "Sub/Architecture.md"
    assert {"source": "Home", "target": "Architecture"} in result["edges"]
    assert {"source": "Architecture", "target": "Home"} in result["edges"]


def test_index_obsidian_vault_missing_path():
    ks = KnowledgeService(qdrant_url="http://fake:6333")
    with pytest.raises(FileNotFoundError):
        ks.index_obsidian_vault("/nonexistent/vault/path")
