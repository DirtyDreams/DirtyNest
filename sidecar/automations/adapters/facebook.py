"""Facebook adapter — CDP automation of the web composer (F7.2, ADR-0013).

Best-effort config; selectors are candidate lists (first match wins) that need
calibration against a logged-in session. Facebook's DOM is heavily obfuscated
(CSS modules, randomized classes), so we lean on ARIA roles + legacy names.
Logging in must happen manually inside the CDP Chrome window.
"""

from __future__ import annotations

from typing import Any, Dict

from .cdp_adapter import CdpSocialAdapter


class FacebookAdapter(CdpSocialAdapter):
    """Publish/verify/metrics for Facebook via CDP against facebook.com."""

    platform = "facebook"

    def default_config(self) -> Dict[str, Any]:
        base_url = "https://www.facebook.com"
        return {
            "platform": self.platform,
            "base_url": base_url,
            # No reliable public composer deep link with text prefill; the
            # adapter opens the home feed and finds the in-feed composer.
            "compose_url_template": "{base_url}/",
            "composer_selectors": [
                "div[role='textbox'][contenteditable='true'][data-legacy-placeholder-id]",
                "div[aria-label*=\"What's on your mind\" i][contenteditable='true']",
                "div[role='textbox'][aria-label][contenteditable='true']",
                "textarea[name='xhpc_message_text']",
                "div[contenteditable='true'][role='textbox']",
            ],
            "publish_button_candidates": [
                "div[aria-label='Post'][role='button']",
                "div[aria-label='Post to Facebook'][role='button']",
                "div[aria-label*='Post' i][role='button'][aria-disabled='false']",
            ],
            # Permalink: /<name>/posts/<pfbid…> or /permalink.php?story_fbid=…
            # {id} best-effort captures the tail after /posts/.
            "post_url_pattern": "{base_url}/posts/{id}",
            "metrics_selectors": {
                "likes": [
                    "span[data-sigil='reactions-sentence-container']",
                    "div[aria-label*='Like'][role='button'] span",
                ],
                "comments": [
                    "div[aria-label*='Comment'][role='button'] span",
                    "a[aria-label*='Comment'][role='link']",
                ],
                "shares": [
                    "div[aria-label*='Share'][role='button'] span",
                ],
            },
        }