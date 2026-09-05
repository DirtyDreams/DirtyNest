"""Instagram adapter — CDP automation of the web composer (F7.2, ADR-0013).

Best-effort config; selectors are candidate lists (first match wins) that need
calibration against a logged-in session. Instagram is the most login-strict of
the four (frequent login walls, session invalidation) — the LOGIN_REQUIRED
path matters most here. Logging in must happen manually inside the CDP Chrome
window.
"""

from __future__ import annotations

from typing import Any, Dict

from .cdp_adapter import CdpSocialAdapter


class InstagramAdapter(CdpSocialAdapter):
    """Publish/verify/metrics for Instagram via CDP against instagram.com."""

    platform = "instagram"

    def default_config(self) -> Dict[str, Any]:
        base_url = "https://www.instagram.com"
        return {
            "platform": self.platform,
            "base_url": base_url,
            # New-post flow (no public ?text= prefill — text is typed in-page).
            # Media: IG generally requires an image/video for feed posts; a
            # dry-run/confirm without media will surface OP_FAILED at
            # calibration time unless the operator tests the text-only path.
            "compose_url_template": "{base_url}/",
            "composer_selectors": [
                "textarea[placeholder*='Caption']",
                'div[role="dialog"] textarea',
                'div[role="textbox"][contenteditable="true"]',
                "textarea[aria-label*='caption' i]",
                "textarea",
            ],
            "publish_button_candidates": [
                'div[role="button"]',  # IG uses divs for Share; narrowed below
                'div[role="dialog"] div[role="button"]:not([aria-disabled="true"])',
                "button[type='submit']",
            ],
            "post_url_pattern": "{base_url}/p/{id}/",
            "metrics_selectors": {
                "likes": [
                    "section article a[href*='/liked_by/']",
                    "section span[class*='like']",
                ],
                "comments": [
                    "section article a[href*='/comments/']",
                    "section article button[aria-label*='Comment']",
                ],
                "shares": [],
            },
        }