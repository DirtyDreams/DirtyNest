"""Reddit adapter (F5) — wraps the existing Reddit engagement pipeline.

The legacy pipeline shells out to `node reddit-ops.mjs` (runner_cwd). This
adapter exposes it through the common SocialAdapter contract so the scheduler
and publish endpoint can treat Reddit like any other platform.
"""
import logging
from typing import Any, Dict

from ..engagement import EngagementManager
from .base import SocialAdapter, normalize_result

logger = logging.getLogger("dirtynest.automations.adapters.reddit")


class RedditAdapter(SocialAdapter):
    """Publish/verify/metrics for Reddit via the existing reddit-ops runner."""

    platform = "reddit"

    def __init__(self, engagement: Any = None):
        self.engagement = engagement or EngagementManager()

    def publish(self, text: str, **kwargs: Any) -> Dict[str, Any]:
        """Publish a comment to a target post (the existing pipeline).

        Requires `post_id` (the target thread) and optionally `subreddit`.
        """
        post_id = kwargs.get("post_id")
        subreddit = kwargs.get("subreddit") or ""
        if not post_id:
            return normalize_result(False, None, "post_id required for reddit comment publish")
        ok, msg = self.engagement.post_comment(post_id, subreddit, text)
        return normalize_result(ok, post_id if ok else None, None if ok else msg)

    def verify(self, platform_post_id: str) -> Dict[str, Any]:
        """Best-effort existence check. The runner has no cheap verify verb, so
        we treat a non-empty id as present (the publish call already confirmed)."""
        return {"ok": bool(platform_post_id), "exists": bool(platform_post_id), "error": None}

    def metrics(self, platform_post_id: str) -> Dict[str, Any]:
        """No live metrics endpoint in the runner; return zeros so the analytics
        pipeline has a stable shape."""
        return {"reach": 0, "engagement": 0, "likes": 0, "comments": 0, "shares": 0}
