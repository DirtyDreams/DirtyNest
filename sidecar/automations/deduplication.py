import subprocess
import time
import logging
from typing import List, Tuple, Dict, Any

logger = logging.getLogger("dirtynest.automations.deduplication")

class DeduplicationService:
    """Manages comment deduplication, identifying redundant greetings and cleaning duplicates."""

    def __init__(self, runner_cwd: str = r"C:\Users\coyot\workspace\reddit-ops"):
        self.runner_cwd = runner_cwd

    def delete_comment(self, comment_id: str) -> Tuple[bool, str]:
        """Delete a single comment by ID."""
        try:
            r = subprocess.run(
                ["node", "reddit-ops.mjs", "delete", comment_id],
                cwd=self.runner_cwd,
                capture_output=True,
                text=True,
                timeout=90
            )
            out = (r.stdout or r.stderr or "").strip()
            ok = '"ok": true' in out or '"ok":true' in out or '"success"' in out
            return ok, out[:120]
        except Exception as e:
            logger.error(f"Error deleting comment {comment_id}: {e}")
            return False, str(e)

    def batch_cleanup(self, comment_ids: List[str], delay_seconds: float = 12.0) -> Dict[str, Any]:
        """Safely delete duplicate or redundant comments with rate-limit pacing."""
        results = []
        success_count = 0

        for i, cid in enumerate(comment_ids):
            ok, msg = self.delete_comment(cid)
            if ok:
                success_count += 1
            results.append({"comment_id": cid, "success": ok, "message": msg})
            logger.info(f"[{i+1}/{len(comment_ids)}] {'OK' if ok else 'FAIL'} {cid}: {msg}")

            if i < len(comment_ids) - 1:
                time.sleep(delay_seconds)

        return {
            "total": len(comment_ids),
            "deleted": success_count,
            "failed": len(comment_ids) - success_count,
            "results": results
        }
