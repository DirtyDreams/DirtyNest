"""Integration tests for sidecar Threat Intel & Security Mesh endpoints (Step 8)."""

import sys
from pathlib import Path
from unittest.mock import AsyncMock

import pytest
from fastapi.testclient import TestClient

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))

from main import app  # noqa: E402
from intel_service import intel_service  # noqa: E402


@pytest.fixture
def client():
    return TestClient(app)


def test_get_intel_cve_endpoint(client, monkeypatch):
    sample_cve = [
        {
            "cve_id": "CVE-2026-1001",
            "title": "Kernel privilege escalation in subsystem",
            "severity": "high",
            "cvss_score": "8.1",
            "source": "nvd",
        }
    ]
    monkeypatch.setattr(intel_service, "fetch_cve_feed", AsyncMock(return_value=sample_cve))

    resp = client.get("/api/intel/cve")
    assert resp.status_code == 200
    data = resp.json()
    assert data["count"] == 1
    assert data["cves"][0]["cve_id"] == "CVE-2026-1001"


def test_get_intel_kev_endpoint(client, monkeypatch):
    sample_kev = [
        {
            "cve_id": "CVE-2026-8888",
            "title": "Fortinet FortiGate Auth Bypass",
            "severity": "critical",
            "is_actively_exploited": True,
            "ransomware_use": "Known",
            "due_date": "2026-09-30",
        }
    ]
    monkeypatch.setattr(intel_service, "fetch_kev_feed", AsyncMock(return_value=sample_kev))

    resp = client.get("/api/intel/kev")
    assert resp.status_code == 200
    data = resp.json()
    assert data["count"] == 1
    assert data["vulnerabilities"][0]["cve_id"] == "CVE-2026-8888"
    assert data["vulnerabilities"][0]["is_actively_exploited"] is True


def test_get_intel_ports_endpoint(client, monkeypatch):
    sample_ports = [
        {"port": 3000, "service": "Next.js", "role": "Frontend", "target": "127.0.0.1", "open": True, "latency_ms": 1.2, "error": None},
        {"port": 8000, "service": "Sidecar", "role": "Backend", "target": "127.0.0.1", "open": True, "latency_ms": 0.5, "error": None},
        {"port": 9333, "service": "Chrome", "role": "CDP", "target": "127.0.0.1", "open": False, "latency_ms": 0.1, "error": "REFUSED"},
    ]
    monkeypatch.setattr(intel_service, "scan_local_ports", AsyncMock(return_value=sample_ports))

    resp = client.get("/api/intel/ports")
    assert resp.status_code == 200
    data = resp.json()
    assert data["target"] == "127.0.0.1"
    assert data["total_services"] == 3
    assert data["open_count"] == 2
    assert len(data["scan"]) == 3


def test_get_intel_summary_endpoint(client, monkeypatch):
    sample_summary = {
        "posture": "OPTIMAL",
        "kev_total_weaponized": 42,
        "kev_ransomware_linked": 12,
        "recent_cve_count": 100,
        "critical_cve_count": 5,
        "high_cve_count": 25,
        "mesh_total_services": 7,
        "mesh_healthy_services": 6,
        "mesh_ports": [],
        "top_threats": [],
        "timestamp": 123456789.0,
    }
    monkeypatch.setattr(intel_service, "get_threat_radar_summary", AsyncMock(return_value=sample_summary))

    resp = client.get("/api/intel/summary")
    assert resp.status_code == 200
    data = resp.json()
    assert data["posture"] == "OPTIMAL"
    assert data["kev_total_weaponized"] == 42
    assert data["mesh_healthy_services"] == 6
