"""TikTok adapter — CDP automation of the web composer (F7.2, ADR-0013).

Best-effort config; selectors are candidate lists (first match wins) that need
calibration against a logged-in session. TikTok (like Instagram) is a media-
first platform: text-only publishing is generally not possible through the
upload composer, so the adapter surfaces that at calibration time. Logging in
must happen manually inside the CDP Chrome window.
"""

from __future__ import annotations

from typing import Any, Dict

from .cdp_adapter import CdpSocialAdapter

__all__ = ["TikTokAdapter"]


class TikTokAdapter(CdpSocialAdapter):
    """Publish/verify/metrics for TikTok via CDP against tiktok.com."""

    platform = "tiktok"

    def default_config(self) -> Dict[str, Any]:
        base_url = "https://www.tiktok.com"
        return {
            "platform": self.platform,
            "base_url": base_url,
            # Upload flow (media required upstream in practice).
            "compose_url_template": "{base_url}/upload?lang=en",
            "composer_selectors": [
                'div[contenteditable="true"][data-e2e="caption-editor"]',
                'div[contenteditable="true"][data-e2e="caption-container"] editor',
                'div[contenteditable="true"]',
            ],
            "publish_button_candidates": [
                'button[data-e2e="post-button"]',
                'button[data-e2e="publish"]',
                'div[data-e2e="post-button"]',
            ],
            # Permalink form: /<user>/video/<id>
            "post_url_pattern": "{base_url}/video/{id}",
            "metrics_selectors": {
                "likes": [
                    '[data-e2e="like-count"]',
                    '[data-e2e="browse-like-count"]',
                ],
                "comments": [
                    '[data-e2e="comment-count"]',
                    '[data-e2e="browse-comment-count"]',
                ],
                "shares": [
                    '[data-e2e="share-count"]',
                    '[data-e2e="browse-share-count"]',
                ],
            },
        }