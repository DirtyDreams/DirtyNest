"""Simulated adapter for platforms without live API credentials (F5).

X/IG/FB/TikTok have no configured API keys in this homelab, so publishing is
simulated: a deterministic platform_post_id is returned and metrics are
generated from a seeded PRNG. This keeps the scheduler, HITL gate, and
analytics pipeline fully exercisable end-to-end. Swap in a real HTTP adapter
when credentials exist.
"""
import hashlib
import random
from typing import Any, Dict

from .base import SocialAdapter, normalize_result


class MockAdapter(SocialAdapter):
    """Deterministic simulated publish for a platform."""

    def __init__(self, platform: str):
        self.platform = platform

    def _post_id(self, text: str) -> str:
        digest = hashlib.sha256(f"{self.platform}:{text}".encode("utf-8")).hexdigest()[:16]
        return f"{self.platform}_{digest}"

    def publish(self, text: str, **kwargs: Any) -> Dict[str, Any]:
        pid = self._post_id(text)
        return normalize_result(True, pid, None)

    def verify(self, platform_post_id: str) -> Dict[str, Any]:
        return {"ok": bool(platform_post_id), "exists": bool(platform_post_id), "error": None}

    def metrics(self, platform_post_id: str) -> Dict[str, Any]:
        rng = random.Random(platform_post_id)
        reach = rng.randint(50, 5000)
        likes = rng.randint(0, reach)
        comments = rng.randint(0, max(1, likes // 10))
        shares = rng.randint(0, max(1, likes // 5))
        return {
            "reach": reach,
            "engagement": likes + comments + shares,
            "likes": likes,
            "comments": comments,
            "shares": shares,
        }
