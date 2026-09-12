import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))

import pytest
import asyncio
from fastapi.testclient import TestClient
from main import app
from missions_service import missions_service

client = TestClient(app)

def test_get_all_missions():
    missions = missions_service.get_all_missions()
    assert len(missions) >= 3
    mission_ids = [m["id"] for m in missions]
    assert "security_sentinel" in mission_ids
    assert "content_synthesizer" in mission_ids
    assert "zbiornik_monitor" in mission_ids

def test_api_get_missions():
    res = client.get("/api/missions")
    assert res.status_code == 200
    data = res.json()
    assert "missions" in data
    assert data["count"] >= 3

def test_api_toggle_mission():
    mission_id = "security_sentinel"
    res1 = client.post(f"/api/missions/{mission_id}/toggle")
    assert res1.status_code == 200
    d1 = res1.json()
    assert d1["ok"] is True
    assert d1["mission"]["enabled"] is False
    assert d1["mission"]["status"] == "PAUSED"

    # Toggle back to enabled
    res2 = client.post(f"/api/missions/{mission_id}/toggle")
    assert res2.status_code == 200
    d2 = res2.json()
    assert d2["mission"]["enabled"] is True
    assert d2["mission"]["status"] == "IDLE"

def test_api_trigger_mission():
    mission_id = "security_sentinel"
    res = client.post(f"/api/missions/{mission_id}/trigger")
    assert res.status_code == 200
    data = res.json()
    assert data["ok"] is True
    assert "triggered asynchronously" in data["message"]

def test_api_trigger_nonexistent_mission():
    res = client.post("/api/missions/nonexistent_xyz/trigger")
    assert res.status_code == 404

def test_api_toggle_nonexistent_mission():
    res = client.post("/api/missions/nonexistent_xyz/toggle")
    assert res.status_code == 404
