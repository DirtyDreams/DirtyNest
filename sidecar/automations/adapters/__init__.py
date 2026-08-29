"""Social adapter registry (F5, updated F7.2).

Maps a platform name to a SocialAdapter instance. Reddit uses the real
reddit-ops pipeline; X/Instagram/Facebook/TikTok use CDP-based automation
(ADR-0013: CDP-first, no official-API dependency) replacing the MockAdapter
stubs from F5. MockAdapter remains available (mock.py) for tests / local
experiments, but no longer backs a live registry entry.
"""
from typing import Dict, Optional

from .base import SocialAdapter
from .reddit import RedditAdapter
from .mock import MockAdapter
from .twitter import TwitterAdapter
from .instagram import InstagramAdapter
from .facebook import FacebookAdapter
from .tiktok import TikTokAdapter

# Platforms supported by the Social Media Command (docs/api-specification.md §4).
PLATFORMS = ("twitter", "instagram", "facebook", "tiktok", "reddit")

# Reddit = reddit-ops pipeline; the four web platforms = CDP adapters
# (connect-or-launch Chrome, dry-run-first publish, HITL upstream).
ADAPTERS: Dict[str, SocialAdapter] = {
    "reddit": RedditAdapter(),
    "twitter": TwitterAdapter(),
    "instagram": InstagramAdapter(),
    "facebook": FacebookAdapter(),
    "tiktok": TikTokAdapter(),
}


def get_adapter(platform: str) -> Optional[SocialAdapter]:
    """Return the adapter for a platform, or None if unsupported."""
    return ADAPTERS.get(platform)


def list_adapters() -> Dict[str, str]:
    """Return {platform: adapter_class} for the status endpoint."""
    return {name: type(adapter).__name__ for name, adapter in ADAPTERS.items()}


__all__ = [
    "SocialAdapter",
    "RedditAdapter",
    "MockAdapter",
    "TwitterAdapter",
    "InstagramAdapter",
    "FacebookAdapter",
    "TikTokAdapter",
    "get_adapter",
    "list_adapters",
    "PLATFORMS",
    "ADAPTERS",
]