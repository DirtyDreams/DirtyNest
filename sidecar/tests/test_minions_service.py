import asyncio
import sys
from pathlib import Path
import pytest
from fastapi.testclient import TestClient

# Ensure sidecar directory is on sys.path
sys.path.insert(0, str(Path(__file__).resolve().parents[1]))

from minions_service import MinionsService, MinionNode, minions_service
from main import app

client = TestClient(app)


def test_minions_service_initialization():
    service = MinionsService()
    minions = service.get_all_minions()
    assert len(minions) == 4
    ids = [m["id"] for m in minions]
    assert "minion-01" in ids
    assert "minion-02" in ids
    assert "minion-03" in ids
    assert "minion-04" in ids

    aegis = service.get_minion("minion-01")
    assert aegis is not None
    assert aegis["name"] == "Aegis-Alpha"
    assert aegis["role"] == "Security & CVE Patrol"
    assert aegis["status"] == "IDLE"


def test_minions_service_task_dispatch_and_simulation():
    async def _run():
        service = MinionsService()
        task = await service.dispatch_task(
            minion_id="minion-01",
            name="Unit Audit Test",
            directive="Audit localhost ports for anomalies",
            simulate_duration=0.2,
        )
        assert task.status in ["QUEUED", "EXECUTING"]
        assert task.minion_id == "minion-01"
        assert len(service.get_task_history("minion-01")) >= 1

        node = service.nodes["minion-01"]
        assert node.status == "EXECUTING"

        # Wait for simulation to finish
        await asyncio.sleep(0.35)
        assert task.status == "COMPLETED"
        assert node.status == "IDLE"
        assert "successfully executed" in (task.output or "")

    asyncio.run(_run())


def test_minions_service_node_control():
    async def _run():
        service = MinionsService()
        
        # Pause node
        res = await service.control_node("minion-02", "pause")
        assert res["ok"] is True
        assert service.nodes["minion-02"].status == "PAUSED"

        # Dispatch to paused node should fail
        with pytest.raises(ValueError, match="is PAUSED"):
            await service.dispatch_task("minion-02", "Invalid Task", "Should fail")

        # Resume node
        res = await service.control_node("minion-02", "resume")
        assert res["ok"] is True
        assert service.nodes["minion-02"].status == "IDLE"

        # Restart node
        res = await service.control_node("minion-02", "restart")
        assert res["ok"] is True
        assert service.nodes["minion-02"].status == "IDLE"

    asyncio.run(_run())


def test_minions_heartbeat_tick():
    async def _run():
        service = MinionsService()
        await service.heartbeat_tick()
        assert service.nodes["minion-01"].last_ping != ""

    asyncio.run(_run())


def test_api_get_minions():
    response = client.get("/api/hermes/minions")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "success"
    assert data["count"] == 4
    assert len(data["minions"]) == 4


def test_api_get_single_minion():
    response = client.get("/api/hermes/minions/minion-01")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "success"
    assert data["minion"]["name"] == "Aegis-Alpha"

    # Not found case
    res404 = client.get("/api/hermes/minions/nonexistent")
    assert res404.status_code == 404


def test_api_dispatch_and_control():
    # Dispatch task via API
    dispatch_res = client.post(
        "/api/hermes/minions/minion-03/dispatch",
        json={
            "name": "Social Campaign Draft",
            "directive": "Generate draft post ideas for Hermes release",
            "duration": 0.2,
        },
    )
    assert dispatch_res.status_code == 200
    task_data = dispatch_res.json()
    assert task_data["status"] == "success"
    assert task_data["task"]["minion_id"] == "minion-03"

    # Check tasks endpoint
    tasks_res = client.get("/api/hermes/minions/minion-03/tasks")
    assert tasks_res.status_code == 200
    tasks_list = tasks_res.json()["tasks"]
    assert len(tasks_list) >= 1

    # Control endpoint: Pause
    ctrl_res = client.post(
        "/api/hermes/minions/minion-03/control",
        json={"action": "pause"},
    )
    assert ctrl_res.status_code == 200
    assert ctrl_res.json()["result"]["status"] == "PAUSED"

    # Control endpoint: Resume
    ctrl_res2 = client.post(
        "/api/hermes/minions/minion-03/control",
        json={"action": "resume"},
    )
    assert ctrl_res2.status_code == 200
    assert ctrl_res2.json()["result"]["status"] == "IDLE"
