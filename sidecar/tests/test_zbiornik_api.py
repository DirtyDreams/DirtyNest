"""Unit tests for Zbiornik HITL Automation API endpoints and ACP integration."""

import sys
from pathlib import Path
from unittest.mock import AsyncMock, patch

import pytest
from fastapi.testclient import TestClient

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))

from main import app
from acp_client import acp_bridge


@pytest.fixture
def client():
    return TestClient(app)


def test_get_zbiornik_status(client):
    with patch("main.zbiornik_manager.session_status") as mock_status, \
         patch("main.zbiornik_monitor.public_snapshot") as mock_snapshot:
        mock_status.return_value = {
            "connected": True,
            "runner_present": True,
            "loginCode": "OK",
            "loggedIn": True,
            "account": "dirty_operator",
            "port": 9333,
            "raw": {"data": {"counters": {"unreadMessages": 3, "unseenNotifications": 1}}},
        }
        mock_snapshot.return_value = {
            "at": "2026-09-12T04:00:00",
            "ok": True,
            "codes": {"session": "OK", "list-topics": "OK"},
            "counts": {"topics": 12, "inbox": 4, "notif": 2},
        }

        res = client.get("/api/automations/zbiornik/status")
        assert res.status_code == 200
        data = res.json()
        assert data["ok"] is True
        assert data["session"]["account"] == "dirty_operator"
        assert data["session"]["loginCode"] == "OK"
        assert data["lastPoll"]["counts"]["topics"] == 12


def test_exec_zbiornik_op(client):
    with patch("main.zbiornik_manager.publish") as mock_pub:
        mock_pub.return_value = (True, {"ok": True, "op": "comment", "code": "OK"})

        res = client.post("/api/automations/zbiornik/exec", json={
            "op": "comment",
            "args": ["item-1", "Komentarz testowy"],
            "dry": True,
            "confirm_run": False
        })
        assert res.status_code == 200
        data = res.json()
        assert data["ok"] is True
        assert data["result"]["code"] == "OK"


def test_exec_zbiornik_write_op_requires_confirm(client):
    # Testing guard-rail without mock: write op without confirm_run or dry must fail
    res = client.post("/api/automations/zbiornik/exec", json={
        "op": "comment",
        "args": ["item-123", "Super post!"],
        "dry": False,
        "confirm_run": False
    })
    assert res.status_code == 200
    data = res.json()
    assert data["ok"] is False
    assert data["result"]["code"] == "CONFIRM_REQUIRED"


def test_read_zbiornik_op(client):
    with patch("main.zbiornik_manager.run_op") as mock_run:
        mock_run.return_value = (True, {
            "ok": True,
            "op": "top-list",
            "data": {"items": [{"nick": "Queen", "points": 1000}]}
        })

        res = client.post("/api/automations/zbiornik/read", json={
            "op": "top-list",
            "args": ["20"]
        })
        assert res.status_code == 200
        data = res.json()
        assert data["ok"] is True
        assert len(data["result"]["data"]["items"]) == 1


def test_poll_zbiornik_endpoint(client):
    with patch("main.zbiornik_monitor.poll", new_callable=AsyncMock) as mock_poll:
        mock_poll.return_value = {
            "at": "2026-09-12T04:00:00",
            "ok": True,
            "codes": {"session": "OK"},
            "counts": {"topics": 5, "inbox": 2, "notif": 1},
            "topics": [{"id": 1, "title": "Test topic"}],
            "inbox": [{"nick": "UserA", "unread": 1}],
            "notif": [],
            "session": {"loggedIn": True, "loginCode": "OK"},
        }

        res = client.post("/api/automations/zbiornik/poll")
        assert res.status_code == 200
        data = res.json()
        assert data["ok"] is True
        assert data["counts"]["topics"] == 5
        assert len(data["topics"]) == 1


def test_get_zbiornik_topics(client):
    with patch("main.zbiornik_manager.list_topics") as mock_topics:
        mock_topics.return_value = (True, {
            "ok": True,
            "code": "OK",
            "data": {"items": [{"id": 101, "title": "Forum Cyberpunk"}]}
        })

        res = client.get("/api/automations/zbiornik/topics?limit=10")
        assert res.status_code == 200
        data = res.json()
        assert data["ok"] is True
        assert len(data["topics"]) == 1
        assert data["topics"][0]["title"] == "Forum Cyberpunk"


def test_get_zbiornik_ranking(client):
    with patch("main.zbiornik_manager.run_op") as mock_run:
        mock_run.return_value = (True, {
            "ok": True,
            "code": "OK",
            "data": {"items": [{"nick": "Valkyrie", "points": 999}]}
        })

        res = client.get("/api/automations/zbiornik/ranking?limit=25&acc_type=2")
        assert res.status_code == 200
        data = res.json()
        assert data["ok"] is True
        assert data["ranking"][0]["nick"] == "Valkyrie"


def test_launch_chrome_endpoint(client):
    with patch("main.launch_chrome_session") as mock_launch:
        mock_launch.return_value = {
            "ok": True,
            "port": 9333,
            "message": "Uruchomiono sesję Chrome CDP."
        }

        res = client.post("/api/automations/zbiornik/chrome/launch", json={"port": 9333})
        assert res.status_code == 200
        data = res.json()
        assert data["ok"] is True
        assert data["port"] == 9333


def test_hermes_acp_draft_zbiornik_tool():
    # Verify queue_zbiornik_draft is safe / low risk
    risk = acp_bridge.classify_tool_risk("queue_zbiornik_draft", {})
    assert risk == "low"
