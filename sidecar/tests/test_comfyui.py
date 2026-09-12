"""Unit tests for ComfyUI service integration (sidecar)."""

import sys
from pathlib import Path
from unittest.mock import AsyncMock, patch

import pytest
from fastapi.testclient import TestClient

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))

from comfyui_service import ComfyUiService, comfyui_engine
from main import app


def test_build_txt2img_workflow():
    service = ComfyUiService()
    workflow = service.build_txt2img_workflow(
        prompt="cyberpunk neon hacker desk",
        negative_prompt="blurry, bad art",
        checkpoint="hidream_o1_image_bf16.safetensors",
        steps=30,
        cfg=6.5,
        width=1024,
        height=768,
        seed=42,
    )

    assert "4" in workflow  # CheckpointLoaderSimple
    assert workflow["4"]["inputs"]["ckpt_name"] == "hidream_o1_image_bf16.safetensors"

    assert "5" in workflow  # EmptyLatentImage
    assert workflow["5"]["inputs"]["width"] == 1024
    assert workflow["5"]["inputs"]["height"] == 768

    assert "6" in workflow  # Positive CLIPTextEncode
    assert workflow["6"]["inputs"]["text"] == "cyberpunk neon hacker desk"

    assert "7" in workflow  # Negative CLIPTextEncode
    assert workflow["7"]["inputs"]["text"] == "blurry, bad art"

    assert "3" in workflow  # KSampler
    assert workflow["3"]["inputs"]["steps"] == 30
    assert workflow["3"]["inputs"]["cfg"] == 6.5
    assert workflow["3"]["inputs"]["seed"] == 42


import asyncio


def test_system_stats_parsing(monkeypatch):
    service = ComfyUiService()

    fake_response = {
        "system": {"comfyui_version": "0.35.1", "python_version": "3.13.12"},
        "devices": [
            {
                "name": "cuda:0 NVIDIA GeForce RTX 3060",
                "vram_total": 12884901888,  # 12288 MB
                "vram_free": 6442450944,   # 6144 MB
            }
        ],
    }

    class MockResponse:
        status_code = 200
        def json(self):
            return fake_response

    class MockClient:
        async def __aenter__(self):
            return self
        async def __aexit__(self, *args):
            pass
        async def get(self, url):
            return MockResponse()

    monkeypatch.setattr("httpx.AsyncClient", lambda **kwargs: MockClient())

    stats = asyncio.run(service.get_system_stats())
    assert stats["online"] is True
    assert "RTX 3060" in stats["gpu_name"]
    assert stats["vram_total_mb"] == 12288
    assert stats["vram_free_mb"] == 6144
    assert stats["vram_used_pct"] == 50.0


def test_offline_fallback():
    service = ComfyUiService(base_url="http://127.0.0.1:9999")
    stats = asyncio.run(service.get_system_stats())
    assert stats["online"] is False
    assert stats["gpu_name"] == "Offline"


def test_fastapi_comfy_endpoints():
    client = TestClient(app)

    # 1. Stats endpoint
    res = client.get("/api/comfy/stats")
    assert res.status_code == 200
    assert "online" in res.json()

    # 2. Checkpoints endpoint
    res = client.get("/api/comfy/checkpoints")
    assert res.status_code == 200
    assert "checkpoints" in res.json()

    # 3. Queue endpoint
    res = client.get("/api/comfy/queue")
    assert res.status_code == 200
    assert "running" in res.json()
