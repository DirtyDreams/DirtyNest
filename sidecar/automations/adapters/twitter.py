"""X (Twitter) adapter — CDP automation of the web composer (F7.2, ADR-0013).

Best-effort config; selectors are candidate lists (first match wins) that need
calibration against a logged-in session. X's `data-testid` attributes are
relatively stable. Logging in must happen manually inside the CDP Chrome
window; this adapter never touches credentials.
"""

from __future__ import annotations

from typing import Any, Dict

from .cdp_adapter import CdpSocialAdapter


class TwitterAdapter(CdpSocialAdapter):
    """Publish/verify/metrics for X via CDP against x.com."""

    platform = "twitter"

    def default_config(self) -> Dict[str, Any]:
        base_url = "https://x.com"
        return {
            "platform": self.platform,
            "base_url": base_url,
            # The composer accepts ?text= for prefilling. After publishing, X
            # redirects to /<handle>/status/<id>; {id} is captured via prefix
            # match ("…/status/") so the handle is handled implicitly.
            "compose_url_template": "{base_url}/compose/post",
            "composer_selectors": [
                '[data-testid="tweetTextarea_0"]',
                '[data-testid="tweetTextarea_0_label"]',
                'div[role="textbox"][contenteditable="true"]',
            ],
            "publish_button_candidates": [
                '[data-testid="tweetButtonInline"]',
                '[data-testid="tweetButton"]',
            ],
            "post_url_pattern": "{base_url}/status/{id}",
            "metrics_selectors": {
                "likes": [
                    '[data-testid="like"]',
                    '[data-testid="unlike"]',
                ],
                "comments": [
                    '[data-testid="reply"]',
                ],
                "shares": [
                    '[data-testid="app-tab-bar-share"]',
                    'article button[aria-label*="Share"]',
                ],
            },
        }