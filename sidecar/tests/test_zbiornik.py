"""
Zbiornik Ops — guard-rail tests (sidecar layer, no network / no browser).

Covers the invariants from docs/zbiornik-ops.md:
- run_op rejects unknown ops
- write ops require dry=True or confirm_run=True (CONFIRM_REQUIRED)
- JSON single-line parsing is tolerant
- poll() never issues read ops when the session is not logged in
- ZbiornikMonitorService writes a snapshot file and its public shape is stable
"""

import json
import sys
from pathlib import Path
from unittest.mock import patch

import pytest

sys.path.insert(0, str(__import__("pathlib").Path(__file__).resolve().parents[1]))

from automations.zbiornik import (  # noqa: E402
    WRITE_OPS,
    ZbiornikMonitorService,
    ZbiornikOpsManager,
)


class FakeCompleted:
    def __init__(self, stdout: str, returncode: int = 0):
        self.stdout = stdout
        self.stderr = ""
        self.returncode = returncode


@pytest.fixture()
def runner_dir(tmp_path):
    d = tmp_path / "zb-runner"
    d.mkdir()
    return d


# --------------------------------------------------------------------- run_op
def test_unknown_op_rejected(runner_dir):
    m = ZbiornikOpsManager(runner_cwd=str(runner_dir))
    ok, data = m.run_op("hack-the-planet")
    assert ok is False
    assert data["code"] == "UNKNOWN_OP"


@pytest.mark.parametrize("op", WRITE_OPS)
def test_write_op_requires_confirmation(runner_dir, op):
    m = ZbiornikOpsManager(runner_cwd=str(runner_dir))
    ok, data = m.run_op(op, ["a", "b"])
    assert ok is False
    assert data["code"] == "CONFIRM_REQUIRED"


@pytest.mark.parametrize("op", WRITE_OPS)
def test_write_op_dry_flags_passed_to_runner(runner_dir, op):
    """dry=True reaches the runner (node missing in fake cwd -> NO_OUTPUT), never CONFIRM_REQUIRED."""
    m = ZbiornikOpsManager(runner_cwd=str(runner_dir))
    ok, data = m.run_op(op, ["a", "b"], dry=True, timeout=3)
    assert data.get("code") in {"NO_OUTPUT", "NOT_CONFIGURED", "DRY_OK", "RUNNER_MISSING", "OP_FAILED"}


def test_read_op_unknown_still_allowed_with_confirm_only_for_writes(runner_dir):
    m = ZbiornikOpsManager(runner_cwd=str(runner_dir))
    ok, data = m.run_op("list-topics", ["5"], timeout=2)
    # Empty runner cwd: subprocess fails to produce JSON -> NO_OUTPUT (not UNKNOWN_OP).
    assert data.get("code") in {"NO_OUTPUT", "NOT_CONFIGURED", "CDP_OFFLINE"}


# ------------------------------------------------------------------- parsing
def test_parse_json_line_tolerant():
    raw = 'banner noise\n{"ok": true, "op": "me", "data": {"x": 1}}\ntrailing'
    parsed = ZbiornikOpsManager._parse_json_line(raw)
    assert parsed == {"ok": True, "op": "me", "data": {"x": 1}}


def test_parse_json_line_garbage():
    assert ZbiornikOpsManager._parse_json_line("nothing here") is None
    assert ZbiornikOpsManager._parse_json_line("") is None
    assert ZbiornikOpsManager._parse_json_line("{broken") is None


# ----------------------------------------------------------------- poll gates
def test_poll_skips_reads_when_logged_out():
    m = ZbiornikOpsManager(runner_cwd=".")
    called = []

    def fake_list_topics(limit):
        called.append("list-topics")
        return True, {"ok": True, "data": {"items": []}}

    with patch.object(m, "session_status", return_value={"connected": True, "runner_present": True, "loginCode": "LOGIN_REQUIRED", "loggedIn": False, "account": None, "port": 9333}):
        with patch.object(m, "list_topics", side_effect=fake_list_topics):
            res = m.poll()

    assert called == []  # read ops must NOT run without a logged-in session
    assert res["ok"] is False


def test_poll_runs_read_ops_when_logged_in():
    m = ZbiornikOpsManager(runner_cwd=".")

    def fake_session():
        return {"connected": True, "runner_present": True, "loginCode": "OK", "loggedIn": True, "account": "tester", "port": 9333}

    def fake_list(limit):
        return True, {"ok": True, "data": {"items": [{"id": "t1", "title": "Temat"}]}}

    def fake_inbox(limit):
        return True, {"ok": True, "data": {"items": [{"id": "m1", "from": "ktos"}]}}

    def fake_notif(limit):
        return True, {"ok": True, "data": {"items": []}}

    with patch.object(m, "session_status", side_effect=fake_session):
        with patch.object(m, "list_topics", side_effect=fake_list):
            with patch.object(m, "inbox", side_effect=fake_inbox):
                with patch.object(m, "notif", side_effect=fake_notif):
                    res = m.poll()

    assert res["ok"] is True
    assert res["topics"] == [{"id": "t1", "title": "Temat"}]
    assert len(res["inbox"]) == 1
    assert res["codes"]["session"] == "OK"


# -------------------------------------------------------------- snapshot
def test_monitor_snapshot_written_and_public(tmp_path, monkeypatch):
    m = ZbiornikOpsManager(runner_cwd=".")
    svc = ZbiornikMonitorService(manager=m, snapshot_dir=str(tmp_path))

    fake_poll = {
        "at": "2026-01-01T10:00:00",
        "ok": True,
        "session": {"loginCode": "OK", "loggedIn": True, "account": "op", "port": 9333},
        "codes": {"session": "OK", "list-topics": "OK", "inbox": "OK", "notif": "OK"},
        "topics": [{"id": "t1", "title": "A"}],
        "inbox": [{"id": "m1", "from": "ktos"}],
        "notif": [],
    }
    monkeypatch.setattr(svc.manager, "poll", lambda: fake_poll)
    # _push_ingest must not be awaited in sync path without loop
    monkeypatch.setattr(svc, "_push_ingest", lambda result: None)

    snap = svc.poll_sync()
    assert snap["ok"] is True
    assert snap["counts"] == {"topics": 1, "inbox": 1, "notif": 0}
    assert (tmp_path / "poll-latest.json").exists()
    disk = json.loads((tmp_path / "poll-latest.json").read_text(encoding="utf-8"))
    assert disk["topics"][0]["id"] == "t1"