"""Social scheduler (F5) — guard-rail tests.

Covers:
- find_due_posts queries only scheduled + due rows
- publish_due publishes through the adapter and marks published/failed
- collect_metrics inserts a snapshot per published post
"""

import asyncio
import sys
from pathlib import Path

import pytest

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))

from social_scheduler import SocialScheduler  # noqa: E402


class FakeConn:
    def __init__(self, fetch_result=None, executed=None):
        self.fetch_result = fetch_result or []
        self.executed = executed if executed is not None else []

    async def __aenter__(self):
        return self

    async def __aexit__(self, *exc):
        return False

    async def fetch(self, query, *args):
        return self.fetch_result

    async def execute(self, query, *args):
        self.executed.append((query, args))


class FakePool:
    def __init__(self, conn):
        self.conn = conn

    def acquire(self):
        return FakeConn(self.conn.fetch_result, self.conn.executed)


def make_scheduler(conn):
    s = SocialScheduler(db_url="postgresql://x")
    s._pool = FakePool(conn)
    return s


def test_find_due_posts_returns_rows():
    conn = FakeConn(fetch_result=[{"id": 1, "platform": "twitter", "text": "hi"}])
    s = make_scheduler(conn)
    due = asyncio.run(s.find_due_posts())
    assert due == [{"id": 1, "platform": "twitter", "text": "hi"}]


def test_publish_due_marks_published_on_success():
    conn = FakeConn(fetch_result=[{"id": 1, "platform": "twitter", "text": "hi"}])
    s = make_scheduler(conn)
    result = asyncio.run(s.publish_due())
    assert result["due"] == 1
    assert result["results"][0]["ok"] is True
    # one UPDATE executed for the published post
    assert len(conn.executed) == 1
    query, args = conn.executed[0]
    assert "status='published'" in query
    assert args[0] == 1


def test_publish_due_marks_failed_on_unknown_platform():
    conn = FakeConn(fetch_result=[{"id": 2, "platform": "myspace", "text": "hi"}])
    s = make_scheduler(conn)
    result = asyncio.run(s.publish_due())
    assert result["due"] == 1
    assert result["results"][0]["ok"] is False
    assert "no adapter" in result["results"][0]["error"]


def test_collect_metrics_inserts_snapshot():
    conn = FakeConn(fetch_result=[{"id": 1, "platform": "twitter", "platform_post_id": "twitter_abc"}])
    s = make_scheduler(conn)
    result = asyncio.run(s.collect_metrics())
    assert result["collected"] == 1
    assert len(conn.executed) == 1
    query, args = conn.executed[0]
    assert "INSERT INTO social_metrics" in query
    assert args[0] == 1
