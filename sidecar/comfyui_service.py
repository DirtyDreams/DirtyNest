"""ComfyUI service integration for DirtyNest.

Connects to local ComfyUI instance on port 8188 (default http://127.0.0.1:8188).
Provides system stats, checkpoint enumeration, workflow queueing, history inspection,
and direct image streaming.
"""

from __future__ import annotations

import json
import logging
import os
import random
import time
import urllib.parse
from typing import Any, Dict, List, Optional

import httpx

logger = logging.getLogger("dirtynest-comfyui")

DEFAULT_COMFY_URL = "http://127.0.0.1:8188"


class ComfyUiService:
    """Manages ComfyUI API interactions, execution queuing, and telemetry."""

    def __init__(self, base_url: Optional[str] = None):
        self.base_url = (base_url or os.environ.get("COMFYUI_URL", DEFAULT_COMFY_URL)).rstrip("/")

    async def get_system_stats(self) -> Dict[str, Any]:
        """Fetch GPU, VRAM, and runtime stats from ComfyUI."""
        try:
            async with httpx.AsyncClient(timeout=10.0) as client:
                res = await client.get(f"{self.base_url}/system_stats")
                if res.status_code == 200:
                    data = res.json()
                    devices = data.get("devices", [])
                    gpu_info = devices[0] if devices else {}
                    vram_total_mb = int(gpu_info.get("vram_total", 0) / (1024 * 1024))
                    vram_free_mb = int(gpu_info.get("vram_free", 0) / (1024 * 1024))
                    return {
                        "online": True,
                        "comfyui_version": data.get("system", {}).get("comfyui_version", "unknown"),
                        "gpu_name": gpu_info.get("name", "Unknown GPU"),
                        "vram_total_mb": vram_total_mb,
                        "vram_free_mb": vram_free_mb,
                        "vram_used_pct": round(100 - (vram_free_mb / vram_total_mb * 100), 1) if vram_total_mb > 0 else 0,
                        "python_version": data.get("system", {}).get("python_version", ""),
                        "raw": data,
                    }
        except Exception as e:
            logger.warning(f"ComfyUI offline or unreachable: {e}")
        return {
            "online": False,
            "comfyui_version": None,
            "gpu_name": "Offline",
            "vram_total_mb": 0,
            "vram_free_mb": 0,
            "vram_used_pct": 0,
            "error": "ComfyUI server unreachable on " + self.base_url,
        }

    async def get_checkpoints(self) -> List[str]:
        """List available diffusion checkpoints."""
        try:
            async with httpx.AsyncClient(timeout=10.0) as client:
                res = await client.get(f"{self.base_url}/object_info/CheckpointLoaderSimple")
                if res.status_code == 200:
                    data = res.json()
                    ckpt_info = (
                        data.get("CheckpointLoaderSimple", {})
                        .get("input", {})
                        .get("required", {})
                        .get("ckpt_name", [[]])[0]
                    )
                    if isinstance(ckpt_info, list):
                        return ckpt_info
        except Exception as e:
            logger.warning(f"Failed to fetch checkpoints: {e}")
        return ["hidream_o1_image_bf16.safetensors"]

    async def get_queue_status(self) -> Dict[str, Any]:
        """Fetch queue depth (running and pending executions)."""
        try:
            async with httpx.AsyncClient(timeout=10.0) as client:
                res = await client.get(f"{self.base_url}/queue")
                if res.status_code == 200:
                    data = res.json()
                    return {
                        "running": len(data.get("queue_running", [])),
                        "pending": len(data.get("queue_pending", [])),
                        "raw": data,
                    }
        except Exception:
            pass
        return {"running": 0, "pending": 0}

    def build_txt2img_workflow(
        self,
        prompt: str,
        negative_prompt: str = "ugly, blurry, lowres, bad anatomy, deformed, watermark",
        checkpoint: str = "hidream_o1_image_bf16.safetensors",
        steps: int = 25,
        cfg: float = 7.0,
        width: int = 768,
        height: int = 768,
        seed: Optional[int] = None,
        sampler_name: str = "euler",
    ) -> Dict[str, Any]:
        """Construct standard ComfyUI txt2img execution graph."""
        if seed is None or seed <= 0:
            seed = random.randint(1, 1125899906842624)

        return {
            "4": {
                "inputs": {"ckpt_name": checkpoint},
                "class_type": "CheckpointLoaderSimple",
                "_meta": {"title": "Load Checkpoint"},
            },
            "5": {
                "inputs": {"width": width, "height": height, "batch_size": 1},
                "class_type": "EmptyLatentImage",
                "_meta": {"title": "Empty Latent Image"},
            },
            "6": {
                "inputs": {"text": prompt, "clip": ["4", 1]},
                "class_type": "CLIPTextEncode",
                "_meta": {"title": "CLIP Text Encode (Prompt)"},
            },
            "7": {
                "inputs": {"text": negative_prompt, "clip": ["4", 1]},
                "class_type": "CLIPTextEncode",
                "_meta": {"title": "CLIP Text Encode (Negative)"},
            },
            "3": {
                "inputs": {
                    "seed": seed,
                    "steps": steps,
                    "cfg": cfg,
                    "sampler_name": sampler_name,
                    "scheduler": "normal",
                    "denoise": 1.0,
                    "model": ["4", 0],
                    "positive": ["6", 0],
                    "negative": ["7", 0],
                    "latent_image": ["5", 0],
                },
                "class_type": "KSampler",
                "_meta": {"title": "KSampler"},
            },
            "8": {
                "inputs": {"samples": ["3", 0], "vae": ["4", 2]},
                "class_type": "VAEDecode",
                "_meta": {"title": "VAE Decode"},
            },
            "9": {
                "inputs": {"filename_prefix": "DirtyNest", "images": ["8", 0]},
                "class_type": "SaveImage",
                "_meta": {"title": "Save Image"},
            },
        }

    async def queue_prompt(
        self,
        prompt_graph: Dict[str, Any],
        client_id: Optional[str] = None,
    ) -> Dict[str, Any]:
        """Post execution prompt to ComfyUI /prompt endpoint."""
        client_id = client_id or f"dirtynest_{int(time.time()*1000)}"
        payload = {"prompt": prompt_graph, "client_id": client_id}
        try:
            async with httpx.AsyncClient(timeout=30.0) as client:
                res = await client.post(f"{self.base_url}/prompt", json=payload)
                if res.status_code == 200:
                    data = res.json()
                    return {
                        "ok": True,
                        "prompt_id": data.get("prompt_id"),
                        "number": data.get("number"),
                        "client_id": client_id,
                    }
                return {
                    "ok": False,
                    "error": f"ComfyUI rejected prompt ({res.status_code}): {res.text}",
                }
        except Exception as e:
            logger.error(f"Error submitting prompt to ComfyUI: {e}")
            return {"ok": False, "error": str(e)}

    async def wait_for_execution(
        self,
        prompt_id: str,
        timeout_seconds: float = 120.0,
        poll_interval: float = 1.0,
    ) -> Dict[str, Any]:
        """Poll /history/{prompt_id} until generation completes."""
        start_time = time.time()
        while time.time() - start_time < timeout_seconds:
            try:
                async with httpx.AsyncClient(timeout=10.0) as client:
                    res = await client.get(f"{self.base_url}/history/{prompt_id}")
                    if res.status_code == 200:
                        history = res.json()
                        if prompt_id in history:
                            item = history[prompt_id]
                            status = item.get("status", {})
                            if status.get("completed", False):
                                outputs = item.get("outputs", {})
                                images: List[Dict[str, Any]] = []
                                for node_output in outputs.values():
                                    for img in node_output.get("images", []):
                                        fn = img.get("filename")
                                        sf = img.get("subfolder", "")
                                        tp = img.get("type", "output")
                                        q = urllib.parse.urlencode({"filename": fn, "subfolder": sf, "type": tp})
                                        img_url = f"{self.base_url}/view?{q}"
                                        proxy_url = f"/api/comfy/image/{fn}?subfolder={sf}&type={tp}"
                                        images.append({
                                            "filename": fn,
                                            "subfolder": sf,
                                            "type": tp,
                                            "url": img_url,
                                            "proxy_url": proxy_url,
                                        })
                                return {
                                    "completed": True,
                                    "prompt_id": prompt_id,
                                    "duration": round(time.time() - start_time, 2),
                                    "images": images,
                                }
            except Exception as e:
                logger.warning(f"Polling history error: {e}")
            await asyncio.sleep(poll_interval)

        return {
            "completed": False,
            "prompt_id": prompt_id,
            "error": f"Timeout waiting for generation ({timeout_seconds}s)",
        }

    async def generate_txt2img_full(
        self,
        prompt: str,
        negative_prompt: str = "ugly, blurry, lowres, bad anatomy, deformed, watermark",
        checkpoint: Optional[str] = None,
        steps: int = 25,
        cfg: float = 7.0,
        width: int = 768,
        height: int = 768,
        seed: Optional[int] = None,
        sampler_name: str = "euler",
        scheduler: str = "normal",
    ) -> Dict[str, Any]:
        """Convenience all-in-one txt2img generator."""
        if not checkpoint:
            ckpts = await self.get_checkpoints()
            checkpoint = ckpts[0] if ckpts else "hidream_o1_image_bf16.safetensors"

        graph = self.build_txt2img_workflow(
            prompt=prompt,
            negative_prompt=negative_prompt,
            checkpoint=checkpoint,
            steps=steps,
            cfg=cfg,
            width=width,
            height=height,
            seed=seed,
            sampler_name=sampler_name,
            scheduler=scheduler,
        )

        queued = await self.queue_prompt(graph)
        if not queued.get("ok"):
            return {"ok": False, "error": queued.get("error")}

        prompt_id = queued["prompt_id"]
        result = await self.wait_for_execution(prompt_id)
        if result.get("completed"):
            return {
                "ok": True,
                "prompt_id": prompt_id,
                "duration": result.get("duration"),
                "images": result.get("images", []),
                "prompt": prompt,
                "checkpoint": checkpoint,
            }
        return {"ok": False, "error": result.get("error", "Execution failed")}

    async def get_recent_history(self, limit: int = 15) -> List[Dict[str, Any]]:
        """Fetch recently generated images from history."""
        try:
            async with httpx.AsyncClient(timeout=10.0) as client:
                res = await client.get(f"{self.base_url}/history")
                if res.status_code == 200:
                    history = res.json()
                    items: List[Dict[str, Any]] = []
                    for pid, data in reversed(list(history.items())):
                        outputs = data.get("outputs", {})
                        for node_output in outputs.values():
                            for img in node_output.get("images", []):
                                fn = img.get("filename")
                                sf = img.get("subfolder", "")
                                tp = img.get("type", "output")
                                q = urllib.parse.urlencode({"filename": fn, "subfolder": sf, "type": tp})
                                items.append({
                                    "prompt_id": pid,
                                    "filename": fn,
                                    "subfolder": sf,
                                    "type": tp,
                                    "url": f"{self.base_url}/view?{q}",
                                    "proxy_url": f"/api/comfy/image/{fn}?subfolder={sf}&type={tp}",
                                })
                                if len(items) >= limit:
                                    return items
                    return items
        except Exception as e:
            logger.warning(f"Failed to fetch history: {e}")
        return []

    async def fetch_image_bytes(self, filename: str, subfolder: str = "", folder_type: str = "output") -> Optional[bytes]:
        """Fetch raw image bytes from ComfyUI view endpoint."""
        try:
            q = urllib.parse.urlencode({"filename": filename, "subfolder": subfolder, "type": folder_type})
            async with httpx.AsyncClient(timeout=15.0) as client:
                res = await client.get(f"{self.base_url}/view?{q}")
                if res.status_code == 200:
                    return res.content
        except Exception as e:
            logger.warning(f"Failed to fetch image bytes for {filename}: {e}")
        return None


comfyui_engine = ComfyUiService()
