import asyncio
import json
import logging
import shutil
import time
from typing import Dict, List, Optional, Any

logger = logging.getLogger("dirtynest-docker-engine")

class DockerOrchestratorEngine:
    def __init__(self):
        self.docker_bin = shutil.which("docker")

    async def _run_docker_cmd(self, *args: str) -> tuple[int, str, str]:
        if not self.docker_bin:
            return 1, "", "Docker binary not found on host."
        try:
            proc = await asyncio.create_subprocess_exec(
                self.docker_bin,
                *args,
                stdout=asyncio.subprocess.PIPE,
                stderr=asyncio.subprocess.PIPE
            )
            stdout, stderr = await proc.communicate()
            return (
                proc.returncode or 0,
                stdout.decode("utf-8", errors="replace"),
                stderr.decode("utf-8", errors="replace")
            )
        except Exception as e:
            return 1, "", str(e)

    async def list_containers(self) -> List[Dict[str, Any]]:
        code, out, err = await self._run_docker_cmd("ps", "-a", "--format", "{{json .}}")
        if code != 0 or not out.strip():
            logger.warning("Docker ps command failed or returned empty: %s", err)
            return []

        containers = []
        for line in out.strip().split("\n"):
            line = line.strip()
            if not line:
                continue
            try:
                data = json.loads(line)
                state = data.get("State", "stopped").lower()
                containers.append({
                    "id": data.get("ID", "")[:12],
                    "name": data.get("Names", "unknown"),
                    "image": data.get("Image", ""),
                    "status": "running" if state == "running" else "stopped",
                    "state": state,
                    "ports": data.get("Ports", ""),
                    "uptime": data.get("Status", ""),
                    "size": data.get("Size", ""),
                    "created_at": data.get("CreatedAt", ""),
                    "cpu_percent": 0.0,
                    "memory_usage": "0 MB"
                })
            except Exception as e:
                logger.error("Failed to parse container json line: %s", e)

        return containers

    async def get_container_stats(self) -> List[Dict[str, Any]]:
        code, out, err = await self._run_docker_cmd("stats", "--no-stream", "--format", "{{json .}}")
        if code != 0 or not out.strip():
            return []

        stats_list = []
        for line in out.strip().split("\n"):
            line = line.strip()
            if not line:
                continue
            try:
                data = json.loads(line)
                cpu_str = data.get("CPUPerc", "0%").replace("%", "")
                try:
                    cpu_val = float(cpu_str)
                except ValueError:
                    cpu_val = 0.0

                stats_list.append({
                    "id": data.get("ID", "")[:12],
                    "name": data.get("Name", ""),
                    "cpu_percent": cpu_val,
                    "memory_usage": data.get("MemUsage", ""),
                    "memory_percent": data.get("MemPerc", ""),
                    "net_io": data.get("NetIO", "")
                })
            except Exception:
                pass
        return stats_list

    async def manage_container(self, container_id: str, action: str) -> Dict[str, Any]:
        if action not in ["start", "stop", "restart", "pause", "unpause"]:
            return {"status": "error", "message": f"Invalid action {action}"}

        code, out, err = await self._run_docker_cmd(action, container_id)
        if code == 0:
            return {"status": "success", "action": action, "container_id": container_id}
        return {"status": "error", "error": err, "container_id": container_id}

    async def list_stacks(self) -> List[Dict[str, Any]]:
        """List Compose stacks via `docker compose ls` (read-only)."""
        code, out, err = await self._run_docker_cmd("compose", "ls", "--format", "json")
        if code != 0 or not out.strip():
            logger.warning("Docker compose ls failed or returned empty: %s", err)
            return []
        try:
            data = json.loads(out)
        except json.JSONDecodeError:
            logger.warning("Docker compose ls returned non-JSON output: %s", out[:200])
            return []
        stacks = []
        for entry in data:
            stacks.append({
                "name": entry.get("Name", ""),
                "status": entry.get("Status", ""),
                "config_files": entry.get("ConfigFiles", ""),
                "services_count": entry.get("Services", 0),
            })
        return stacks

docker_engine = DockerOrchestratorEngine()
