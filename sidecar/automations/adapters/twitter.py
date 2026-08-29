"""X (Twitter) adapter — CDP automation of the web composer (F7.2, ADR-0013).

Calibrated 2026-08-29 against a live logged-in session (@MinaReilly26739 on the
Mina Chrome :9333): all primary testids confirmed present on x.com/home —
`tweetTextarea_0`, `tweetButtonInline`, `SideNav_AccountSwitcher_Button`,
`AppTabBar_Home_Link`, `SideNav_NewTweet_Button`, timeline `article[data-testid="tweet"]`.
Composer aria-label = "Post text". Login is session-cookie based (CDP profile).
Logging in must happen manually inside the CDP Chrome window; this adapter
never touches credentials.
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
            # Live calibration (2026-08-29): the inline composer on /home is
            # present and has tweetButtonInline right next to it, but the
            # dedicated /compose/post page is the more deterministic surface
            # (no timeline race). After publishing, X redirects to
            # /<handle>/status/<id>; {id} is captured via prefix match.
            "compose_url_template": "{base_url}/compose/post",
            # Verified live: profile link resolves to /MinaReilly26739
            "verify_profile_hint": "MinaReilly26739",
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

    def _post_id_regex(self):
        """Strict X permalink matcher: /<handle>/status/<numeric snowflake>.

        Requires the numeric snowflake form so placeholder ids and login-wall
        URLs cannot false-positive as verified posts (live calibration:
        /status/<garbage> keeps the URL but is not a real permalink).
        """
        import re
        return re.compile(r"https?://\S*?/[A-Za-z0-9_]{1,15}/status/([0-9]{10,20})")
