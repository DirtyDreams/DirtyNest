"""Social Media adapters (F5) — guard-rail tests.

Covers:
- registry: get_adapter/list_adapters resolve the 5 platforms
- MockAdapter: deterministic publish id, stable verify, seeded metrics
- RedditAdapter: requires post_id; wraps EngagementManager.post_comment
"""

import sys
from pathlib import Path

import pytest

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))

from automations.adapters import ADAPTERS, PLATFORMS, get_adapter, list_adapters  # noqa: E402
from automations.adapters.mock import MockAdapter  # noqa: E402
from automations.adapters.reddit import RedditAdapter  # noqa: E402


def test_platform_registry_has_five_platforms():
    assert set(PLATFORMS) == {"twitter", "instagram", "facebook", "tiktok", "reddit"}


def test_get_adapter_resolves_every_platform():
    for platform in PLATFORMS:
        adapter = get_adapter(platform)
        assert adapter is not None
        assert adapter.platform == platform


def test_get_adapter_unknown_returns_none():
    assert get_adapter("myspace") is None


def test_list_adapters_returns_platform_entries():
    entries = list_adapters()
    assert isinstance(entries, dict)
    assert set(entries.keys()) == set(PLATFORMS)
    for platform, adapter in entries.items():
        assert isinstance(platform, str)
        assert isinstance(adapter, str)


def test_mock_publish_is_deterministic():
    a = MockAdapter("twitter")
    r1 = a.publish("hello world")
    r2 = a.publish("hello world")
    assert r1["ok"] is True
    assert r1["platform_post_id"] == r2["platform_post_id"]
    assert r1["platform_post_id"].startswith("twitter_")
    assert r1["error"] is None


def test_mock_publish_differs_by_text():
    a = MockAdapter("twitter")
    r1 = a.publish("one")
    r2 = a.publish("two")
    assert r1["platform_post_id"] != r2["platform_post_id"]


def test_mock_verify():
    a = MockAdapter("instagram")
    assert a.verify("instagram_abc")["exists"] is True
    assert a.verify("")["exists"] is False


def test_mock_metrics_are_seeded_and_stable():
    a = MockAdapter("facebook")
    m1 = a.metrics("facebook_abc")
    m2 = a.metrics("facebook_abc")
    assert m1 == m2
    for key in ("reach", "engagement", "likes", "comments", "shares"):
        assert key in m1
        assert isinstance(m1[key], int)
        assert m1[key] >= 0


def test_reddit_publish_requires_post_id():
    a = RedditAdapter(engagement=None)
    r = a.publish("some text")
    assert r["ok"] is False
    assert r["error"] == "post_id required for reddit comment publish"


def test_reddit_publish_calls_engagement():
    class FakeEngagement:
        def post_comment(self, post_id, subreddit, text):
            assert post_id == "t3_abc"
            assert subreddit == "r/Cyberpunk"
            assert text == "hi"
            return True, "posted"

    a = RedditAdapter(engagement=FakeEngagement())
    r = a.publish("hi", post_id="t3_abc", subreddit="r/Cyberpunk")
    assert r["ok"] is True
    assert r["platform_post_id"] == "t3_abc"


def test_reddit_metrics_stable_shape():
    a = RedditAdapter(engagement=None)
    m = a.metrics("t3_abc")
    assert m == {"reach": 0, "engagement": 0, "likes": 0, "comments": 0, "shares": 0}
