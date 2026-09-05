import subprocess
import json
import logging
from typing import Dict, List, Any, Optional

logger = logging.getLogger("dirtynest.automations.topics")

class TopicManager:
    """Fetches and manages trending topics and discussions across target subreddits."""

    def __init__(self, runner_cwd: str = r"C:\Users\coyot\workspace\reddit-ops"):
        self.runner_cwd = runner_cwd

    def fetch_post_details(self, post_id: str) -> Optional[Dict[str, Any]]:
        """Fetch post text and metadata by post_id."""
        try:
            r = subprocess.run(
                ["node", "reddit-ops.mjs", "get-post", post_id],
                cwd=self.runner_cwd,
                capture_output=True,
                text=True,
                timeout=60
            )
            out = (r.stdout or "").strip()
            start = out.find("{")
            if start != -1:
                return json.loads(out[start:])
            return None
        except Exception as e:
            logger.error(f"Error fetching post {post_id}: {e}")
            return None

    def pull_subreddit_posts(self, subreddit: str, limit: int = 10) -> List[Dict[str, Any]]:
        """Pull recent posts from a subreddit."""
        try:
            r = subprocess.run(
                ["node", "reddit-ops.mjs", "list-posts", subreddit, str(limit)],
                cwd=self.runner_cwd,
                capture_output=True,
                text=True,
                timeout=60
            )
            out = (r.stdout or "").strip()
            start = out.find("[")
            if start != -1:
                return json.loads(out[start:])
            return []
        except Exception as e:
            logger.error(f"Error pulling subreddit r/{subreddit}: {e}")
            return []
