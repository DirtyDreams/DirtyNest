"""Threat-intel CVE feed (F6.2) — guard-rail tests."""

import sys
from pathlib import Path

import httpx
import pytest

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))

from intel_service import (  # noqa: E402
    IntelService,
    _normalize_nvd_item,
    _parse_cvss,
    _parse_severity,
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

    monkeypatch.setattr(svc, "_fetch_remote", fake_fetch)

    async def run():
        first = await svc.fetch_cve_feed()
        second = await svc.fetch_cve_feed()
        return first, second

    first, second = asyncio_run(run())
    assert calls["n"] == 1  # second call served from cache
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
        return await svc._fetch_remote()

    result = asyncio_run(run())
    assert result == []


def asyncio_run(coro):
    import asyncio

    return asyncio.run(coro)
