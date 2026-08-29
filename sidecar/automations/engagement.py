import subprocess
import time
import datetime
import logging
from typing import List, Tuple, Dict, Any, Optional

logger = logging.getLogger("dirtynest.automations.engagement")

class EngagementManager:
    """Manages social / Reddit engagement campaigns, automated replies, and greetings."""

    def __init__(self, runner_cwd: str = r"C:\Users\coyot\workspace\reddit-ops"):
        self.runner_cwd = runner_cwd

    def post_comment(self, post_id: str, subreddit: str, text: str) -> Tuple[bool, str]:
        """Post a comment to a specific thread/post."""
        try:
            r = subprocess.run(
                ["node", "reddit-ops.mjs", "post-comment", post_id, text],
                cwd=self.runner_cwd,
                capture_output=True,
                text=True,
                timeout=90
            )
            out = (r.stdout or r.stderr or "").strip()
            ok = '"ok": true' in out or '"ok":true' in out or '"success"' in out or '"id"' in out
            return ok, out[:200]
        except Exception as e:
            logger.error(f"Error posting comment to {post_id} on r/{subreddit}: {e}")
            return False, str(e)

    def reply_to_notification(self, nid: str, text: str) -> Tuple[bool, str]:
        """Reply to an inbox notification message."""
        try:
            r = subprocess.run(
                ["node", "reddit-ops.mjs", "reply-msg", nid, text],
                cwd=self.runner_cwd,
                capture_output=True,
                text=True,
                timeout=90
            )
            out = (r.stdout or r.stderr or "").strip()
            ok = '"ok": true' in out or '"ok":true' in out or '"success"' in out
            return ok, out[:200]
        except Exception as e:
            logger.error(f"Error replying to notification {nid}: {e}")
            return False, str(e)

    def run_engagement_batch(
        self,
        items: List[Tuple[str, str, str]],
        delay_seconds: float = 12.0,
        log_callback: Optional[Any] = None
    ) -> Dict[str, Any]:
        """Run a sequential batch of engagement comments with spaced delays."""
        results = []
        success_count = 0

        for i, (post_id, subreddit, text) in enumerate(items):
            timestamp = datetime.datetime.now().strftime("%H:%M:%S")
            ok, msg = self.post_comment(post_id, subreddit, text)
            if ok:
                success_count += 1
            entry = {
                "index": i + 1,
                "timestamp": timestamp,
                "post_id": post_id,
                "subreddit": subreddit,
                "success": ok,
                "message": msg
            }
            results.append(entry)
            if log_callback:
                log_callback(entry)
            else:
                logger.info(f"[{timestamp}] {'OK' if ok else 'FAIL'} {post_id} (r/{subreddit}): {msg}")

            if i < len(items) - 1:
                time.sleep(delay_seconds)

        return {
            "total": len(items),
            "success": success_count,
            "failed": len(items) - success_count,
            "items": results
        }
