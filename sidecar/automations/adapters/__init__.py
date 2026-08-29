"""Social adapter registry (F5).

Maps a platform name to a SocialAdapter instance. Reddit uses the real
reddit-ops pipeline; the remaining platforms use the simulated MockAdapter
until live API credentials are configured.
"""
from typing import Dict, Optional

from .base import SocialAdapter
from .reddit import RedditAdapter
from .mock import MockAdapter

# Platforms supported by the Social Media Command (docs/api-specification.md §4).
PLATFORMS = ("twitter", "instagram", "facebook", "tiktok", "reddit")

# Reddit is real; the rest are simulated until credentials exist.
ADAPTERS: Dict[str, SocialAdapter] = {
    "reddit": RedditAdapter(),
    "twitter": MockAdapter("twitter"),
    "instagram": MockAdapter("instagram"),
    "facebook": MockAdapter("facebook"),
    "tiktok": MockAdapter("tiktok"),
}


def get_adapter(platform: str) -> Optional[SocialAdapter]:
    """Return the adapter for a platform, or None if unsupported."""
    return ADAPTERS.get(platform)


def list_adapters() -> Dict[str, str]:
    """Return {platform: adapter_class} for the status endpoint."""
    return {name: type(adapter).__name__ for name, adapter in ADAPTERS.items()}


__all__ = ["SocialAdapter", "RedditAdapter", "MockAdapter", "get_adapter", "list_adapters", "PLATFORMS", "ADAPTERS"]
