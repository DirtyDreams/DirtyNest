"""Integration tests for sidecar Docker endpoints (Step 9)."""

import sys
from pathlib import Path
from unittest.mock import AsyncMock

import pytest
from fastapi.testclient import TestClient

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))

from main import app  # noqa: E402
from docker_service import docker_engine  # noqa: E402


@pytest.fixture
def client():
    return TestClient(app)


def test_get_docker_images_endpoint(client, monkeypatch):
    sample_images = [
        {
            "id": "86c79eed8a6b",
            "repository": "redis",
            "tag": "7-alpine",
            "size": "57.8MB",
            "created": "3 weeks ago",
            "in_use": True,
        }
    ]
    monkeypatch.setattr(docker_engine, "list_images", AsyncMock(return_value=sample_images))

    resp = client.get("/api/docker/images")
    assert resp.status_code == 200
    data = resp.json()
    assert data["count"] == 1
    assert data["images"][0]["repository"] == "redis"


def test_post_docker_pull_endpoint(client, monkeypatch):
    monkeypatch.setattr(
        docker_engine,
        "pull_image",
        AsyncMock(return_value={"status": "success", "image": "alpine:latest"}),
    )

    resp = client.post("/api/docker/pull", json={"image": "alpine:latest"})
    assert resp.status_code == 200
    data = resp.json()
    assert data["status"] == "success"
    assert data["image"] == "alpine:latest"


def test_post_docker_prune_endpoint(client, monkeypatch):
    monkeypatch.setattr(
        docker_engine,
        "prune_system",
        AsyncMock(return_value={"status": "success", "output": "Total reclaimed space: 500MB"}),
    )

    resp = client.post("/api/docker/prune")
    assert resp.status_code == 200
    data = resp.json()
    assert data["status"] == "success"


def test_post_docker_stack_action_endpoint(client, monkeypatch):
    monkeypatch.setattr(
        docker_engine,
        "manage_compose_stack",
        AsyncMock(return_value={"status": "success", "stack": "dirtynest-core", "action": "restart"}),
    )

    resp = client.post("/api/docker/stacks/dirtynest-core/action", json={"action": "restart"})
    assert resp.status_code == 200
    data = resp.json()
    assert data["status"] == "success"
    assert data["stack"] == "dirtynest-core"
