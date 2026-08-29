"""Unit tests for the Knowledge Vault engine (sidecar/knowledge_service.py).

Pure unit tests: Qdrant client and embedder are faked in-process — no
network, no model download, no Qdrant container. Mirrors test_zbiornik.py
conventions (sys.path bootstrap + unittest.mock.patch/monkeypatch).
"""
import sys
from pathlib import Path

import pytest


sys.path.insert(0, str(Path(__file__).parent.parent))


@pytest.fixture()
def stub_client(monkeypatch):
    """In-memory stand-in for QdrantClient catching upsert/delete/scroll/search."""
    import knowledge_service as ks

    class StubClient:
        def __init__(self):
            self.upserted = []
            self.deleted = []
            self.points = []
            self.collection_exists_result = False
            self.created = None

        def collection_exists(self, name):
            return self.collection_exists_result

        def create_collection(self, **kw):
            self.created = kw

        def upsert(self, collection_name, points):
            self.upserted.append((collection_name, points))
            self.points.extend(points)
            return True

        def delete(self, collection_name, points_selector):
            self.deleted.append((collection_name, points_selector))
            doc_id = None
            try:
                cond = points_selector.filter.must[0]
                doc_id = cond.match.value
            except Exception:
                pass
            self.points = [p for p in self.points
                           if (p.payload or {}).get("doc_id") != doc_id]
            return True

        def scroll(self, collection_name, with_payload=False, limit=1000):
            return list(self.points), None

        def query_points(self, **kw):
            hits = [
                SimpleHit(id="hit-1", score=0.91, payload={"doc_id": "d1", "doc_title": "T1", "content": "c1", "chunk_index": 0, "chunk_total": 1, "category": "doc", "source": "s"}),
                SimpleHit(id="hit-2", score=0.75, payload=None),
            ]
            return type("R", (), {"points": hits})()

    class SimpleHit:
        def __init__(self, id, score, payload):
            self.id = id
            self.score = score
            self.payload = payload

    stub = StubClient()
    engine = ks.KnowledgeVaultEngine(qdrant_url="http://stub:6333", embed_fn=lambda t: [0.1] * 384)
    engine.client = stub
    engine.is_ready = True
    monkeypatch.setattr(ks, "knowledge_engine", engine, raising=False)
    return engine, stub


@pytest.mark.parametrize("text,expected", [
    ("", []),
    ("   ", []),
    ("short", ["short"]),
])
def test_chunk_text_trivial(text, expected):
    assert knowledge_chunk(text) == expected


def knowledge_chunk(text):
    import knowledge_service as ks
    return ks.KnowledgeVaultEngine.chunk_text(text)


def test_chunk_text_short_within_size():
    assert knowledge_chunk("abc " * 50) == [("abc " * 50).strip()]


def test_chunk_text_long_breaks_on_spaces():
    text = ("word " * 900).strip()  # 4499 chars > 900
    chunks = knowledge_chunk(text)
    assert len(chunks) >= 4
    # no chunk exceeds size, none is empty, first/last anchors align
    for c in chunks:
        assert 0 < len(c) <= 900
        assert c.split(" ")[0] == "word"
    assert text.startswith(chunks[0])
    assert text.endswith(chunks[-1])
    # overlap continuity: each successive chunk starts inside the prior tail
    for prev, nxt in zip(chunks, chunks[1:]):
        assert prev[-len(nxt) - 1:].strip().startswith(nxt[:20])

def test_chunk_text_size_terminal():
    text = "x" * 1950  # exactly thrice-ish the 900 window
    chunks = knowledge_chunk(text)
    assert all(len(c) <= 900 for c in chunks)
    assert "".join(c for c in chunks).endswith("x")



def test_ingest_upserts_chunks_per_chunk(stub_client):
    engine, stub = stub_client
    content = ("alpha " * 400).strip()  # ~2000 chars → multi-chunk
    result = engine.ingest_document(title="Doc", content=content, doc_id="doc-1", source="test")
    assert result["chunks"] == len(stub.upserted[-1][1])
    assert stub.deleted, "expected idempotent delete-by-doc_id before upsert"
    payload = stub.upserted[-1][1][0].payload
    assert payload["doc_id"] == "doc-1"
    assert payload["chunk_total"] == result["chunks"]
    assert payload["created_at"].startswith("20")


def test_ingest_validation(stub_client):
    engine, stub = stub_client
    try:
        engine.ingest_document(title="", content="body")
        raise AssertionError("expected ValueError")
    except ValueError:
        pass


def test_search_maps_hits_and_threshold(stub_client):
    engine, stub = stub_client
    results = engine.search("anything", limit=5, score_threshold=0.65)
    assert results[0]["id"] == "hit-1"
    assert results[0]["payload"]["title"] == "T1"
    assert results[1]["id"] == "hit-2"          # missing payload tolerated
    assert results[1]["payload"]["title"] is None


def test_not_ready_returns_empty_and_false(stub_client):
    engine, stub = stub_client
    engine.is_ready = False
    assert engine.search("q") == []
    assert engine.list_documents() == []
    assert engine.delete_document("x") is False