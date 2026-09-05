"""Docker service (F6.1) — guard-rail tests for compose stacks + container parsing."""

import sys
from pathlib import Path

import pytest

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))

from docker_service import DockerOrchestratorEngine  # noqa: E402


def _engine_with(monkeypatch, code, out, err=""):
    eng = DockerOrchestratorEngine()
    eng.docker_bin = "docker"

    async def fake_run(*args):
        return code, out, err

    monkeypatch.setattr(eng, "_run_docker_cmd", fake_run)
    return eng


def test_list_stacks_parses_compose_ls(monkeypatch):
    out = (
        '[{"Name":"dirtynest-core","Status":"running(2)","ConfigFiles":"/app/docker-compose.yml","Services":2},'
        '{"Name":"mesh-infra","Status":"running(2)","ConfigFiles":"/infra/docker-compose.infra.yml","Services":2}]'
    )
    eng = _engine_with(monkeypatch, 0, out)
    stacks = asyncio_run(eng.list_stacks())
    assert len(stacks) == 2
    assert stacks[0]["name"] == "dirtynest-core"
    assert stacks[0]["services_count"] == 2
    assert stacks[1]["config_files"].endswith("docker-compose.infra.yml")


def test_list_stacks_empty_on_failure(monkeypatch):
    eng = _engine_with(monkeypatch, 1, "", "docker not found")
    assert asyncio_run(eng.list_stacks()) == []


def test_list_stacks_empty_on_non_json(monkeypatch):
    eng = _engine_with(monkeypatch, 0, "not json at all")
    assert asyncio_run(eng.list_stacks()) == []


def test_list_containers_parses_ps(monkeypatch):
    out = (
        '{"ID":"abc123def456","Names":"dirtynest-web","Image":"dirtynest/web:latest","State":"running",'
        '"Ports":"0.0.0.0:3000->3000/tcp","Status":"Up 2 hours","CreatedAt":"2026-08-01T00:00:00Z"}\n'
        '{"ID":"def456abc123","Names":"dirtynest-db","Image":"postgres:16-alpine","State":"exited",'
        '"Ports":"","Status":"Exited (0) 1 hour ago","CreatedAt":"2026-08-01T00:00:00Z"}'
    )
    eng = _engine_with(monkeypatch, 0, out)
    containers = asyncio_run(eng.list_containers())
    assert len(containers) == 2
    assert containers[0]["status"] == "running"
    assert containers[0]["id"] == "abc123def456"
    assert containers[1]["status"] == "stopped"


def test_list_containers_empty_on_failure(monkeypatch):
    eng = _engine_with(monkeypatch, 1, "", "error")
    assert asyncio_run(eng.list_containers()) == []


def test_manage_container_rejects_invalid_action(monkeypatch):
    eng = _engine_with(monkeypatch, 0, "")
    result = asyncio_run(eng.manage_container("abc", "explode"))
    assert result["status"] == "error"


def test_manage_container_success(monkeypatch):
    eng = _engine_with(monkeypatch, 0, "")
    result = asyncio_run(eng.manage_container("abc", "restart"))
    assert result["status"] == "success"
    assert result["action"] == "restart"


def asyncio_run(coro):
    import asyncio

    return asyncio.run(coro)
