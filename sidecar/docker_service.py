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

    async def list_containers(self, include_stats: bool = True) -> List[Dict[str, Any]]:
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
                    "memory_usage": "0 MB",
                    "net_io": "0 B"
                })
            except Exception as e:
                logger.error("Failed to parse container json line: %s", e)

        if include_stats and containers:
            try:
                stats = await self.get_container_stats()
                if stats:
                    stats_map = {s["id"]: s for s in stats}
                    stats_map.update({s["name"]: s for s in stats})
                    for c in containers:
                        st = stats_map.get(c["id"]) or stats_map.get(c["name"])
                        if st:
                            c["cpu_percent"] = st.get("cpu_percent", 0.0)
                            c["memory_usage"] = st.get("memory_usage", "0 MB")
                            c["net_io"] = st.get("net_io", "0 B")
            except Exception as stat_err:
                logger.debug("Failed to merge live container stats: %s", stat_err)

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
                    "memory_usage": data.get("MemUsage", "0 MB"),
                    "memory_percent": data.get("MemPerc", "0%"),
                    "net_io": data.get("NetIO", "0 B")
                })
            except Exception:
                pass
        return stats_list

    async def list_images(self) -> List[Dict[str, Any]]:
        """List locally cached Docker images via `docker images --format '{{json .}}'`."""
        code, out, err = await self._run_docker_cmd("images", "--format", "{{json .}}")
        if code != 0 or not out.strip():
            logger.warning("Docker images command failed or returned empty: %s", err)
            return []

        images = []
        for line in out.strip().split("\n"):
            line = line.strip()
            if not line:
                continue
            try:
                data = json.loads(line)
                containers_count = data.get("Containers", "0")
                in_use = containers_count not in ("0", "N/A", "")
                images.append({
                    "id": data.get("ID", "")[:12],
                    "repository": data.get("Repository", ""),
                    "tag": data.get("Tag", "latest"),
                    "size": data.get("Size", ""),
                    "created": data.get("CreatedSince", "") or data.get("CreatedAt", ""),
                    "in_use": in_use,
                })
            except Exception as e:
                logger.error("Failed to parse image json line: %s", e)
        return images

    async def manage_container(self, container_id: str, action: str) -> Dict[str, Any]:
        if action not in ["start", "stop", "restart", "pause", "unpause"]:
            return {"status": "error", "message": f"Invalid action {action}"}

        code, out, err = await self._run_docker_cmd(action, container_id)
        if code == 0:
            return {"status": "success", "action": action, "container_id": container_id}
        return {"status": "error", "error": err, "container_id": container_id}

    async def pull_image(self, image_name: str) -> Dict[str, Any]:
        """Pull an image from Docker registry."""
        if not image_name or not image_name.strip():
            return {"status": "error", "message": "Image name cannot be empty."}
        image = image_name.strip()
        code, out, err = await self._run_docker_cmd("pull", image)
        if code == 0:
            return {"status": "success", "image": image, "output": out.strip().split("\n")[-1]}
        return {"status": "error", "error": err or "Failed to pull image", "image": image}

    async def prune_system(self) -> Dict[str, Any]:
        """Execute `docker system prune -f` to clean unused containers and dangling images."""
        code, out, err = await self._run_docker_cmd("system", "prune", "-f")
        if code == 0:
            return {"status": "success", "output": out.strip()}
        return {"status": "error", "error": err or "Failed to prune system"}

    async def manage_compose_stack(self, stack_name: str, action: str) -> Dict[str, Any]:
        """Orchestrate a compose stack (up -d, stop, restart, down)."""
        valid_actions = {
            "restart": ["compose", "-p", stack_name, "restart"],
            "stop": ["compose", "-p", stack_name, "stop"],
            "start": ["compose", "-p", stack_name, "start"],
            "up": ["compose", "-p", stack_name, "up", "-d"],
            "down": ["compose", "-p", stack_name, "down"],
        }
        cmd_args = valid_actions.get(action)
        if not cmd_args:
            return {"status": "error", "message": f"Invalid compose action {action}"}

        code, out, err = await self._run_docker_cmd(*cmd_args)
        if code == 0:
            return {"status": "success", "stack": stack_name, "action": action}
        return {"status": "error", "stack": stack_name, "action": action, "error": err}

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

    async def get_container_logs(self, container_id: str, tail: int = 150) -> str:
        """Fetch latest container logs (read-only snapshot)."""
        code, out, err = await self._run_docker_cmd("logs", "--tail", str(tail), container_id)
        if code != 0:
            logger.warning("Docker logs failed for %s: %s", container_id, err)
            return err or ""
        return out

docker_engine = DockerOrchestratorEngine()
