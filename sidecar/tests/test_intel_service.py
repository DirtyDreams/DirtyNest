"""Threat-intel CVE feed & Security Mesh Radar (Step 8) — guard-rail tests."""

import sys
from pathlib import Path

import httpx
import pytest

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))

from intel_service import (  # noqa: E402
    IntelService,
    _normalize_nvd_item,
    _normalize_cisa_kev_item,
    _parse_cvss,
    _parse_severity,
    _check_single_port,
)


def _sample_nvd_item(cve_id="CVE-2026-0001", score=9.8):
    return {
        "cve": {
            "CVE_data_meta": {"ID": cve_id},
            "description": {
                "description_data": [
                    {"lang": "en", "value": "Critical remote code execution in the widget parser. Exploitable over the network."}
                ]
            },
        },
        "metrics": {
            "cvssMetricV31": [
                {"cvssData": {"baseScore": score, "baseSeverity": "CRITICAL"}}
            ]
        },
        "publishedDate": "2026-08-01T00:00:00.000Z",
    }


def _sample_cisa_kev_item(cve_id="CVE-2026-9999", ransomware="Known"):
    return {
        "cveID": cve_id,
        "vendorProject": "OpenSSH",
        "product": "Portable OpenSSH",
        "vulnerabilityName": "Remote Code Execution in PAM",
        "dateAdded": "2026-08-10",
        "shortDescription": "Race condition leading to remote unauthenticated code execution in default installations.",
        "requiredAction": "Apply vendor security update immediately.",
        "dueDate": "2026-08-24",
        "knownRansomwareCampaignUse": ransomware,
    }


def test_normalize_nvd_item_shape():
    item = _normalize_nvd_item(_sample_nvd_item())
    assert item is not None
    assert item["cve_id"] == "CVE-2026-0001"
    assert item["severity"] == "critical"
    assert item["cvss_score"] == "9.8"
    assert item["source"] == "nvd"
    assert item["url"].startswith("https://nvd.nist.gov/vuln/detail/")
    assert "Critical remote code execution" in item["title"]


def test_normalize_nvd_item_missing_id_returns_none():
    assert _normalize_nvd_item({"cve": {"CVE_data_meta": {}}}) is None


def test_normalize_cisa_kev_item_shape():
    item = _normalize_cisa_kev_item(_sample_cisa_kev_item())
    assert item is not None
    assert item["cve_id"] == "CVE-2026-9999"
    assert item["is_actively_exploited"] is True
    assert item["severity"] == "critical"
    assert item["source"] == "cisa-kev"
    assert item["ransomware_use"] == "Known"
    assert "OpenSSH Portable OpenSSH" in item["title"]
    assert item["due_date"] == "2026-08-24"


def test_normalize_cisa_kev_missing_id_returns_none():
    assert _normalize_cisa_kev_item({}) is None


def test_parse_severity_thresholds():
    assert _parse_severity({"cvssMetricV31": [{"cvssData": {"baseScore": 9.0}}]}) == "critical"
    assert _parse_severity({"cvssMetricV31": [{"cvssData": {"baseScore": 7.0}}]}) == "high"
    assert _parse_severity({"cvssMetricV31": [{"cvssData": {"baseScore": 4.0}}]}) == "medium"
    assert _parse_severity({"cvssMetricV31": [{"cvssData": {"baseScore": 1.0}}]}) == "low"
    assert _parse_severity(None) == "unknown"


def test_parse_cvss_empty_when_no_metrics():
    assert _parse_cvss(None) == ""


def test_fetch_cve_feed_uses_cache(monkeypatch):
    svc = IntelService()
    calls = {"n": 0}

    async def fake_fetch():
        calls["n"] += 1
        return [_normalize_nvd_item(_sample_nvd_item())]

    monkeypatch.setattr(svc, "_fetch_nvd_remote", fake_fetch)

    async def run():
        first = await svc.fetch_cve_feed()
        second = await svc.fetch_cve_feed()
        return first, second

    first, second = asyncio_run(run())
    assert calls["n"] == 1  # second call served from cache
    assert first == second


def test_fetch_kev_feed_uses_cache(monkeypatch):
    svc = IntelService()
    calls = {"n": 0}

    async def fake_fetch_cisa():
        calls["n"] += 1
        return [_normalize_cisa_kev_item(_sample_cisa_kev_item())]

    monkeypatch.setattr(svc, "_fetch_cisa_remote", fake_fetch_cisa)

    async def run():
        first = await svc.fetch_kev_feed()
        second = await svc.fetch_kev_feed()
        return first, second

    first, second = asyncio_run(run())
    assert calls["n"] == 1
    assert first == second


def test_fetch_remote_degrades_on_network_error(monkeypatch):
    svc = IntelService()

    class FakeClient:
        async def __aenter__(self):
            return self

        async def __aexit__(self, *exc):
            return False

        async def get(self, url):
            raise httpx.ConnectError("network down")

    monkeypatch.setattr("intel_service.httpx.AsyncClient", lambda **kw: FakeClient())

    async def run():
        nvd_res = await svc._fetch_nvd_remote()
        cisa_res = await svc._fetch_cisa_remote()
        return nvd_res, cisa_res

    nvd_res, cisa_res = asyncio_run(run())
    assert nvd_res == []
    assert cisa_res == []


def test_scan_single_port_closed():
    # Scanning high random port that should be closed
    res = asyncio_run(_check_single_port("127.0.0.1", 59999, timeout=0.2))
    assert res["port"] == 59999
    assert res["open"] is False
    assert res["error"] is not None


def test_scan_local_ports_structure():
    svc = IntelService()
    test_targets = [{"port": 59998, "service": "Dummy Test Service", "role": "Test"}]
    results = asyncio_run(svc.scan_local_ports("127.0.0.1", targets=test_targets))
    assert len(results) == 1
    assert results[0]["port"] == 59998
    assert results[0]["service"] == "Dummy Test Service"
    assert "latency_ms" in results[0]


def test_threat_radar_summary_aggregation(monkeypatch):
    svc = IntelService()

    async def fake_cve(force=False):
        return [_normalize_nvd_item(_sample_nvd_item())]

    async def fake_kev(force=False):
        return [_normalize_cisa_kev_item(_sample_cisa_kev_item())]

    async def fake_ports(host="127.0.0.1", targets=None):
        return [
            {"port": 3000, "service": "Next.js", "open": True, "latency_ms": 1.2},
            {"port": 8000, "service": "Sidecar", "open": True, "latency_ms": 0.8},
            {"port": 5432, "service": "Postgres", "open": True, "latency_ms": 0.5},
        ]

    monkeypatch.setattr(svc, "fetch_cve_feed", fake_cve)
    monkeypatch.setattr(svc, "fetch_kev_feed", fake_kev)
    monkeypatch.setattr(svc, "scan_local_ports", fake_ports)

    summary = asyncio_run(svc.get_threat_radar_summary())
    assert summary["posture"] == "OPTIMAL"
    assert summary["kev_total_weaponized"] == 1
    assert summary["kev_ransomware_linked"] == 1
    assert summary["mesh_healthy_services"] == 3
    assert summary["mesh_total_services"] == 3


def asyncio_run(coro):
    import asyncio

    return asyncio.run(coro)

