"""Social Media scheduler worker (F5).

Scans social_posts for due scheduled posts and publishes them through the
platform adapters, then records engagement metrics into social_metrics. Runs as
a cron job in cron_service. Reads DATABASE_URL (same PG the Next.js app owns).
"""
import json
import logging
import os
from typing import Any, Dict, List, Optional

import asyncpg

from automations.adapters import get_adapter

logger = logging.getLogger("dirtynest-social-scheduler")


def _db_url() -> str:
    return os.environ.get("DATABASE_URL", "postgresql://postgres:testpass@localhost:5433/dirtynest")


class SocialScheduler:
    """Publishes due scheduled posts and collects metrics."""

    def __init__(self, db_url: Optional[str] = None):
        self.db_url = db_url or _db_url()
        self._pool: Optional[asyncpg.Pool] = None

    async def _pool_conn(self) -> asyncpg.Pool:
        if self._pool is None:
            self._pool = await asyncpg.create_pool(self.db_url, min_size=1, max_size=3)
        return self._pool

    async def close(self) -> None:
        if self._pool:
            await self._pool.close()
            self._pool = None

    async def find_due_posts(self) -> List[Dict[str, Any]]:
        """Return scheduled posts whose scheduled_time has passed."""
        pool = await self._pool_conn()
        async with pool.acquire() as conn:
            rows = await conn.fetch(
                """
                SELECT id, platform, text, media_urls, account_id, scheduled_time
                FROM social_posts
                WHERE status = 'scheduled'
                  AND scheduled_time IS NOT NULL
                  AND scheduled_time <= now()
                ORDER BY scheduled_time ASC
                LIMIT 20
                """
            )
        return [dict(r) for r in rows]

    async def _mark_published(self, post_id: int, ok: bool, pid: Optional[str], error: Optional[str]) -> None:
        pool = await self._pool_conn()
        async with pool.acquire() as conn:
            if ok:
                await conn.execute(
                    "UPDATE social_posts SET status='published', platform_post_id=$2, "
                    "published_time=now(), error=NULL, updated_at=now() WHERE id=$1",
                    post_id, pid,
                )
            else:
                await conn.execute(
                    "UPDATE social_posts SET status='failed', error=$2, updated_at=now() WHERE id=$1",
                    post_id, error,
                )

    async def publish_due(self) -> Dict[str, Any]:
        """Publish every due scheduled post through its adapter."""
        due = await self.find_due_posts()
        results: List[Dict[str, Any]] = []
        for post in due:
            adapter = get_adapter(post["platform"])
            if adapter is None:
                results.append({"post_id": post["id"], "ok": False, "error": f"no adapter for {post['platform']}"})
                continue
            result = adapter.publish(post["text"])
            ok = bool(result.get("ok"))
            pid = result.get("platform_post_id")
            error = result.get("error")
            await self._mark_published(post["id"], ok, pid, error)
            results.append({"post_id": post["id"], "ok": ok, "platform_post_id": pid, "error": error})
        return {"due": len(due), "results": results}

    async def collect_metrics(self) -> Dict[str, Any]:
        """Fetch metrics for published posts and store a snapshot per post."""
        pool = await self._pool_conn()
        async with pool.acquire() as conn:
            rows = await conn.fetch(
                "SELECT id, platform, platform_post_id FROM social_posts "
                "WHERE status='published' AND platform_post_id IS NOT NULL"
            )
        collected = 0
        for post in rows:
            adapter = get_adapter(post["platform"])
            if adapter is None:
                continue
            m = adapter.metrics(post["platform_post_id"])
            async with pool.acquire() as conn:
                await conn.execute(
                    "INSERT INTO social_metrics (post_id, platform, reach, engagement, likes, comments, shares, collected_at) "
                    "VALUES ($1,$2,$3,$4,$5,$6,$7, now())",
                    post["id"], post["platform"], m["reach"], m["engagement"], m["likes"], m["comments"], m["shares"],
                )
            collected += 1
        return {"collected": collected}


social_scheduler = SocialScheduler()
