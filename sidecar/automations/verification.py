import json
import logging
from typing import Dict, List, Set, Any

logger = logging.getLogger("dirtynest.automations.verification")

class VerificationService:
    """Validates campaign coverage, cross-checks target links, and checks for missing posts."""

    @staticmethod
    def crosscheck_coverage(
        comments_list: List[Dict[str, Any]],
        targets: Dict[str, str]
    ) -> Dict[str, Any]:
        """Cross-check target post IDs against actual comment link_ids."""
        present: Set[str] = set()

        for c in comments_list:
            link = c.get("link", "")
            if link and link.startswith("t3_"):
                present.add(link[3:])
            elif link:
                present.add(link)

        missing = [{"post_id": pid, "subreddit": sub} for pid, sub in targets.items() if pid not in present]
        covered_count = len(targets) - len(missing)

        return {
            "total_comments_in_listing": len(comments_list),
            "unique_posts_commented": len(present),
            "total_targets": len(targets),
            "covered_targets": covered_count,
            "missing_targets": missing,
            "is_complete": len(missing) == 0
        }
