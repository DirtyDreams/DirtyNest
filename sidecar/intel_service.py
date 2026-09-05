"""Threat-intel CVE feed service (F6.2).

Fetches recent CVE bulletins from the NVD JSON feed and normalizes them into a
stable shape for the `/api/intel/cve` endpoint. Network failures degrade
gracefully to an empty list so the sidecar never crashes on a flaky feed.
"""

import asyncio
import logging
import time
from typing import Any, Dict, List, Optional

import httpx

logger = logging.getLogger("dirtynest-intel")

# NVD API 2.0 — most recent published CVEs (the legacy 1.1 gzip feed is
# deprecated and returns 403). resultsPerPage is capped at 200 by NVD.
NVD_RECENT_URL = "https://services.nvd.nist.gov/rest/json/cves/2.0?resultsPerPage=200"

FETCH_TIMEOUT = 15.0
MAX_CVES = 200


def _parse_severity(metrics: Optional[Dict[str, Any]]) -> str:
    """Derive a severity label from NVD CVSS metrics."""
    if not metrics:
        return "unknown"
    for key in ("cvssMetricV31", "cvssMetricV30", "cvssMetricV2"):
        entries = metrics.get(key)
        if not entries:
            continue
        data = entries[0].get("cvssData", {})
        base_score = data.get("baseScore")
        if base_score is None:
            continue
        if base_score >= 9.0:
            return "critical"
        if base_score >= 7.0:
            return "high"
        if base_score >= 4.0:
            return "medium"
        return "low"
    return "unknown"


def _parse_cvss(metrics: Optional[Dict[str, Any]]) -> str:
    if not metrics:
        return ""
    for key in ("cvssMetricV31", "cvssMetricV30", "cvssMetricV2"):
        entries = metrics.get(key)
        if entries:
            data = entries[0].get("cvssData", {})
            score = data.get("baseScore")
            if score is not None:
                return str(score)
    return ""


def _normalize_nvd_item(item: Dict[str, Any]) -> Optional[Dict[str, Any]]:
    """Normalize an NVD feed item (supports both the legacy 1.1 feed and the
    current API 2.0 shape)."""
    cve = item.get("cve", {})
    # API 2.0: cve.id / cve.descriptions / item.published
    # Legacy 1.1: cve.CVE_data_meta.ID / cve.description.description_data / item.publishedDate
    cve_id = cve.get("id") or cve.get("CVE_data_meta", {}).get("ID", "")
    if not cve_id:
        return None
    descriptions = cve.get("descriptions") or cve.get("description", {}).get("description_data", [])
    description = ""
    for d in descriptions:
        if d.get("lang") == "en":
            description = d.get("value", "")
            break
    if not description and descriptions:
        description = descriptions[0].get("value", "")
    # Title = first sentence of the description, truncated.
    title = description.split(". ")[0][:200] if description else cve_id
    published = item.get("published") or item.get("publishedDate", "")
    url = f"https://nvd.nist.gov/vuln/detail/{cve_id}"
    severity = _parse_severity(item.get("metrics") or cve.get("metrics"))
    cvss = _parse_cvss(item.get("metrics") or cve.get("metrics"))
    return {
        "cve_id": cve_id,
        "title": title,
        "description": description,
        "severity": severity,
        "cvss_score": cvss,
        "published_at": published,
        "source": "nvd",
        "url": url,
    }


class IntelService:
    def __init__(self) -> None:
        self._cache: List[Dict[str, Any]] = []
        self._cache_ts: float = 0.0
        self._cache_ttl = 300.0  # 5 minutes

    async def fetch_cve_feed(self, force: bool = False) -> List[Dict[str, Any]]:
        """Return recent CVEs, using a short in-memory cache to avoid hammering NVD."""
        now = time.time()
        if not force and self._cache and (now - self._cache_ts) < self._cache_ttl:
            return self._cache

        items = await self._fetch_remote()
        # Sort newest first, cap the list.
        items.sort(key=lambda c: c.get("published_at") or "", reverse=True)
        items = items[:MAX_CVES]
        self._cache = items
        self._cache_ts = now
        return items

    async def _fetch_remote(self) -> List[Dict[str, Any]]:
        """Hit the NVD recent feed and normalize. Degrades to [] on failure."""
        items: List[Dict[str, Any]] = []
        try:
            async with httpx.AsyncClient(timeout=FETCH_TIMEOUT, follow_redirects=True) as client:
                resp = await client.get(
                    NVD_RECENT_URL,
                    headers={"User-Agent": "DirtyNest-ThreatIntel/1.0 (security feed monitor)"},
                )
                resp.raise_for_status()
                data = resp.json()
                for item in data.get("vulnerabilities", []):
                    normalized = _normalize_nvd_item(item)
                    if normalized:
                        items.append(normalized)
        except Exception as exc:  # noqa: BLE001 — degrade gracefully
            logger.warning("NVD feed fetch failed: %s", exc)
        return items


intel_service = IntelService()
