"""Threat-intel CVE feed & Security Mesh Radar service (F6.2 & Step 8).

Fetches recent CVE bulletins from the NVD JSON feed and weaponized zero-days from
the CISA Known Exploited Vulnerabilities (KEV) catalog. Includes a zero-trust local
network mesh port scanner for DirtyNest core services.
Network failures degrade gracefully to empty lists so the sidecar never crashes.
"""

import asyncio
import logging
import time
from typing import Any, Dict, List, Optional

import httpx

logger = logging.getLogger("dirtynest-intel")

NVD_RECENT_URL = "https://services.nvd.nist.gov/rest/json/cves/2.0?resultsPerPage=200"
CISA_KEV_URL = "https://www.cisa.gov/sites/default/files/feeds/known_exploited_vulnerabilities.json"

FETCH_TIMEOUT = 15.0
MAX_ITEMS = 200

# Core services forming the DirtyNest cyber operations mesh
CORE_MESH_SERVICES = [
    {"port": 3000, "service": "Next.js Command Center (Frontend)", "role": "User Interface"},
    {"port": 5432, "service": "PostgreSQL Primary Database", "role": "Relational Persistence"},
    {"port": 6333, "service": "Qdrant Vector Engine", "role": "Neural Memory & PKM"},
    {"port": 6379, "service": "Redis Cache & PubSub", "role": "Event Bus & Telemetry"},
    {"port": 8000, "service": "FastAPI Operations Sidecar", "role": "ACP Bridge & Automations"},
    {"port": 8188, "service": "ComfyUI GenStudio (RTX 3060)", "role": "Generative Graphics Engine"},
    {"port": 9333, "service": "Zbiornik Chrome CDP Session", "role": "HITL Browser Automation"},
]


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
    """Normalize an NVD feed item (supports both the legacy 1.1 feed and API 2.0 shape)."""
    cve = item.get("cve", {})
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


def _normalize_cisa_kev_item(item: Dict[str, Any]) -> Optional[Dict[str, Any]]:
    """Normalize a CISA Known Exploited Vulnerabilities catalog item."""
    cve_id = item.get("cveID") or ""
    if not cve_id:
        return None
    vendor = item.get("vendorProject", "")
    product = item.get("product", "")
    name = item.get("vulnerabilityName", "")
    desc = item.get("shortDescription", "")
    title = f"{vendor} {product}: {name}" if (vendor and product) else (name or desc[:120])
    return {
        "cve_id": cve_id,
        "title": title,
        "vendor": vendor,
        "product": product,
        "description": desc,
        "required_action": item.get("requiredAction", ""),
        "due_date": item.get("dueDate", ""),
        "date_added": item.get("dateAdded", ""),
        "ransomware_use": item.get("knownRansomwareCampaignUse", "Unknown"),
        "severity": "critical",
        "is_actively_exploited": True,
        "source": "cisa-kev",
        "url": f"https://nvd.nist.gov/vuln/detail/{cve_id}",
    }


async def _check_single_port(host: str, port: int, timeout: float = 0.6) -> Dict[str, Any]:
    """Test a single TCP port with non-blocking timeout."""
    start = time.perf_counter()
    is_open = False
    error_type: Optional[str] = None
    try:
        conn = asyncio.open_connection(host, port)
        reader, writer = await asyncio.wait_for(conn, timeout=timeout)
        is_open = True
        writer.close()
        try:
            await writer.wait_closed()
        except Exception:
            pass
    except asyncio.TimeoutError:
        error_type = "TIMEOUT"
    except OSError as err:
        error_type = "REFUSED" if "refused" in str(err).lower() else type(err).__name__
    except Exception as exc:
        error_type = type(exc).__name__

    elapsed_ms = round((time.perf_counter() - start) * 1000, 2)
    return {
        "port": port,
        "open": is_open,
        "latency_ms": elapsed_ms,
        "error": error_type if not is_open else None,
    }


class IntelService:
    def __init__(self) -> None:
        self._cve_cache: List[Dict[str, Any]] = []
        self._cve_cache_ts: float = 0.0
        self._cve_cache_ttl = 300.0  # 5 minutes

        self._kev_cache: List[Dict[str, Any]] = []
        self._kev_cache_ts: float = 0.0
        self._kev_cache_ttl = 600.0  # 10 minutes

    async def fetch_cve_feed(self, force: bool = False) -> List[Dict[str, Any]]:
        """Return recent CVEs from NVD, using a short in-memory cache."""
        now = time.time()
        if not force and self._cve_cache and (now - self._cve_cache_ts) < self._cve_cache_ttl:
            return self._cve_cache

        items = await self._fetch_nvd_remote()
        items.sort(key=lambda c: c.get("published_at") or "", reverse=True)
        items = items[:MAX_ITEMS]
        self._cve_cache = items
        self._cve_cache_ts = now
        return items

    async def fetch_kev_feed(self, force: bool = False) -> List[Dict[str, Any]]:
        """Return CISA Known Exploited Vulnerabilities actively weaponized in the wild."""
        now = time.time()
        if not force and self._kev_cache and (now - self._kev_cache_ts) < self._kev_cache_ttl:
            return self._kev_cache

        items = await self._fetch_cisa_remote()
        # Sort newest date added first
        items.sort(key=lambda c: c.get("date_added") or "", reverse=True)
        self._kev_cache = items
        self._kev_cache_ts = now
        return items

    async def scan_local_ports(
        self, host: str = "127.0.0.1", targets: Optional[List[Dict[str, Any]]] = None
    ) -> List[Dict[str, Any]]:
        """Perform concurrent zero-trust TCP port scan across DirtyNest infrastructure."""
        services = targets or CORE_MESH_SERVICES
        tasks = [_check_single_port(host, s["port"]) for s in services]
        results = await asyncio.gather(*tasks, return_exceptions=True)

        scanned: List[Dict[str, Any]] = []
        for svc, res in zip(services, results):
            if isinstance(res, dict):
                scanned.append({
                    "port": svc["port"],
                    "service": svc["service"],
                    "role": svc.get("role", "Core Service"),
                    "target": host,
                    "open": res["open"],
                    "latency_ms": res["latency_ms"],
                    "error": res["error"],
                    "timestamp": time.time(),
                })
            else:
                scanned.append({
                    "port": svc["port"],
                    "service": svc["service"],
                    "role": svc.get("role", "Core Service"),
                    "target": host,
                    "open": False,
                    "latency_ms": 0.0,
                    "error": str(res),
                    "timestamp": time.time(),
                })
        return scanned

    async def get_threat_radar_summary(self) -> Dict[str, Any]:
        """Aggregate security posture: active KEV exploits, critical CVEs, and local mesh health."""
        cves, kevs, ports = await asyncio.gather(
            self.fetch_cve_feed(),
            self.fetch_kev_feed(),
            self.scan_local_ports(),
            return_exceptions=True,
        )

        cve_list = cves if isinstance(cves, list) else []
        kev_list = kevs if isinstance(kevs, list) else []
        port_list = ports if isinstance(ports, list) else []

        critical_cves = [c for c in cve_list if c.get("severity") == "critical"]
        high_cves = [c for c in cve_list if c.get("severity") == "high"]
        ransomware_kevs = [k for k in kev_list if k.get("ransomware_use") == "Known"]

        open_ports = [p for p in port_list if p.get("open")]

        # Determine overall threat posture
        posture = "OPTIMAL"
        if len(open_ports) < 3:
            posture = "DEGRADED"
        elif len(critical_cves) > 10:
            posture = "ELEVATED_THREAT"

        return {
            "posture": posture,
            "kev_total_weaponized": len(kev_list),
            "kev_ransomware_linked": len(ransomware_kevs),
            "recent_cve_count": len(cve_list),
            "critical_cve_count": len(critical_cves),
            "high_cve_count": len(high_cves),
            "mesh_total_services": len(port_list),
            "mesh_healthy_services": len(open_ports),
            "mesh_ports": port_list,
            "top_threats": kev_list[:5] if kev_list else critical_cves[:5],
            "timestamp": time.time(),
        }

    async def _fetch_nvd_remote(self) -> List[Dict[str, Any]]:
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
        except Exception as exc:  # noqa: BLE001
            logger.warning("NVD feed fetch failed: %s", exc)
        return items

    async def _fetch_cisa_remote(self) -> List[Dict[str, Any]]:
        """Hit the CISA KEV feed and normalize. Degrades to [] on failure."""
        items: List[Dict[str, Any]] = []
        try:
            async with httpx.AsyncClient(timeout=FETCH_TIMEOUT, follow_redirects=True) as client:
                resp = await client.get(
                    CISA_KEV_URL,
                    headers={"User-Agent": "DirtyNest-ThreatIntel/1.0 (cisa-kev monitor)"},
                )
                resp.raise_for_status()
                data = resp.json()
                for item in data.get("vulnerabilities", []):
                    normalized = _normalize_cisa_kev_item(item)
                    if normalized:
                        items.append(normalized)
        except Exception as exc:  # noqa: BLE001
            logger.warning("CISA KEV feed fetch failed: %s", exc)
        return items


intel_service = IntelService()
