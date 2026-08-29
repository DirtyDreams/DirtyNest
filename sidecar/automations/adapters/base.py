"""Social platform adapter interface (F5).

Each platform implements publish/verify/metrics. The registry maps a platform
name to an adapter instance. Adapters are intentionally thin: they translate a
canonical post payload into the platform's native call and return a normalized
result dict.
"""
from abc import ABC, abstractmethod
from typing import Any, Dict, Optional


class SocialAdapter(ABC):
    """Common contract for publishing to a social platform."""

    platform: str = ""

    @abstractmethod
    def publish(self, text: str, **kwargs: Any) -> Dict[str, Any]:
        """Publish content.

        Returns a normalized dict:
            {"ok": bool, "platform_post_id": str|None, "error": str|None}
        """

    @abstractmethod
    def verify(self, platform_post_id: str) -> Dict[str, Any]:
        """Verify a published item still exists / is live.

        Returns {"ok": bool, "exists": bool, "error": str|None}.
        """

    @abstractmethod
    def metrics(self, platform_post_id: str) -> Dict[str, Any]:
        """Fetch engagement metrics for a published item.

        Returns {"reach": int, "engagement": int, "likes": int,
                 "comments": int, "shares": int}.
        """


def normalize_result(ok: bool, platform_post_id: Optional[str], error: Optional[str]) -> Dict[str, Any]:
    return {"ok": ok, "platform_post_id": platform_post_id, "error": error}
