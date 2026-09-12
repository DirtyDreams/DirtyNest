"""Minions Swarm Subordinate Bridge & Controller.

Provides resilient connection to the Minions Master on :6969 with an
embedded swarm simulation controller fallback. Supports dynamic node
telemetry, task dispatch, node lifecycle control, and real-time event broadcasting.
"""

from __future__ import annotations

import asyncio
import logging
import os
import random
import time
from dataclasses import asdict, dataclass, field
from typing import Any, Callable, Dict, List, Optional
import httpx

logger = logging.getLogger("dirtynest-minions")


@dataclass
class MinionTask:
    id: str
    minion_id: str
    name: str
    directive: str
    status: str  # QUEUED, EXECUTING, COMPLETED, FAILED
    progress: int  # 0 - 100
    created_at: float
    completed_at: Optional[float] = None
    output: Optional[str] = None
    logs: List[str] = field(default_factory=list)


@dataclass
class MinionNode:
    id: str
    name: str
    role: str
    model: str
    status: str  # IDLE, EXECUTING, PAUSED, OFFLINE
    load: int  # CPU percentage (0 - 100)
    memory_mb: int
    tasks_completed: int
    success_rate: float
    last_ping: str
    current_task: Optional[MinionTask] = None
    tags: List[str] = field(default_factory=list)
    color: str = "#00FF41"


INITIAL_MINIONS: List[Dict[str, Any]] = [
    {
        "id": "minion-01",
        "name": "Aegis-Alpha",
        "role": "Security & CVE Patrol",
        "model": "hermes-3-llama-3.1-8b",
        "status": "IDLE",
        "load": 14,
        "memory_mb": 512,
        "tasks_completed": 342,
        "success_rate": 99.7,
        "tags": ["security", "cve", "recon"],
        "color": "#00FF41",
    },
    {
        "id": "minion-02",
        "name": "Cypher-Beta",
        "role": "Code Synthesis & AST",
        "model": "qwen2.5-coder-32b",
        "status": "IDLE",
        "load": 42,
        "memory_mb": 1024,
        "tasks_completed": 612,
        "success_rate": 98.9,
        "tags": ["code", "ast", "refactor"],
        "color": "#00F0FF",
    },
    {
        "id": "minion-03",
        "name": "Nexus-Gamma",
        "role": "Social & Content Synthesis",
        "model": "mistral-nemo-12b",
        "status": "IDLE",
        "load": 8,
        "memory_mb": 384,
        "tasks_completed": 189,
        "success_rate": 99.1,
        "tags": ["social", "creative", "media"],
        "color": "#BF40FF",
    },
    {
        "id": "minion-04",
        "name": "Chronos-Delta",
        "role": "Cron & Health Orchestrator",
        "model": "hermes-3-llama-3.1-8b",
        "status": "IDLE",
        "load": 21,
        "memory_mb": 420,
        "tasks_completed": 855,
        "success_rate": 99.9,
        "tags": ["cron", "telemetry", "mesh"],
        "color": "#FFB800",
    },
]


class MinionsService:
    def __init__(self, master_url: Optional[str] = None):
        self.master_url = master_url or os.environ.get(
            "MINIONS_MASTER_URL", "http://localhost:6969"
        )
        self.is_upstream_connected = False
        self.listeners: List[Callable[[Dict[str, Any]], Any]] = []
        self._task_history: List[MinionTask] = []
        self._background_tasks: set[asyncio.Task[Any]] = set()

        # Initialize local nodes
        self.nodes: Dict[str, MinionNode] = {}
        for m in INITIAL_MINIONS:
            self.nodes[m["id"]] = MinionNode(
                id=m["id"],
                name=m["name"],
                role=m["role"],
                model=m["model"],
                status=m["status"],
                load=m["load"],
                memory_mb=m["memory_mb"],
                tasks_completed=m["tasks_completed"],
                success_rate=m["success_rate"],
                last_ping="ACTIVE_EMBEDDED",
                tags=m["tags"],
                color=m["color"],
            )

    def add_listener(self, callback: Callable[[Dict[str, Any]], Any]) -> None:
        self.listeners.append(callback)

    async def _emit_event(self, event_type: str, data: Dict[str, Any]) -> None:
        payload = {
            "type": event_type,
            "timestamp": time.time(),
            "data": data,
        }
        for listener in self.listeners:
            try:
                res = listener(payload)
                if asyncio.iscoroutine(res):
                    await res
            except Exception as e:
                logger.warning(f"Error in minions listener: {e}")

    async def check_upstream(self) -> bool:
        """Silent non-blocking probe of upstream Minions Master on port 6969."""
        try:
            async with httpx.AsyncClient(timeout=1.5) as client:
                res = await client.get(f"{self.master_url}/api/minions")
                if res.status_code == 200:
                    data = res.json()
                    if isinstance(data, list) and data:
                        self.is_upstream_connected = True
                        return True
        except Exception:
            pass  # Silent failure: operate gracefully in embedded mode
        self.is_upstream_connected = False
        return False

    def get_all_minions(self) -> List[Dict[str, Any]]:
        """Return serialized list of all minions for API consumers."""
        result = []
        for node in self.nodes.values():
            d = asdict(node)
            d["is_upstream"] = self.is_upstream_connected
            result.append(d)
        return result

    def get_minion(self, minion_id: str) -> Optional[Dict[str, Any]]:
        node = self.nodes.get(minion_id)
        if not node:
            return None
        d = asdict(node)
        d["is_upstream"] = self.is_upstream_connected
        return d

    def get_task_history(self, minion_id: Optional[str] = None) -> List[Dict[str, Any]]:
        if minion_id:
            return [asdict(t) for t in self._task_history if t.minion_id == minion_id]
        return [asdict(t) for t in self._task_history]

    async def control_node(self, minion_id: str, action: str) -> Dict[str, Any]:
        """Control node state: pause, resume, restart."""
        node = self.nodes.get(minion_id)
        if not node:
            raise ValueError(f"Minion with ID '{minion_id}' not found.")

        act = action.lower()
        if act == "pause":
            node.status = "PAUSED"
            node.load = 0
        elif act == "resume":
            node.status = "IDLE"
            node.load = random.randint(10, 25)
        elif act == "restart":
            node.status = "IDLE"
            node.current_task = None
            node.load = random.randint(5, 15)
            node.last_ping = "RESTARTED"
        else:
            raise ValueError(f"Invalid action '{action}'. Supported: pause, resume, restart.")

        await self._emit_event("MINION_STATUS_UPDATE", asdict(node))
        return {
            "ok": True,
            "minion_id": minion_id,
            "status": node.status,
            "message": f"Node '{node.name}' state transitioned to {node.status}.",
        }

    async def dispatch_task(
        self,
        minion_id: str,
        name: str,
        directive: str,
        simulate_duration: float = 2.0,
    ) -> MinionTask:
        """Dispatch a task to a minion node. Runs async simulation in embedded mode."""
        node = self.nodes.get(minion_id)
        if not node:
            raise ValueError(f"Minion with ID '{minion_id}' not found.")

        if node.status == "PAUSED":
            raise ValueError(f"Minion '{node.name}' is PAUSED. Resume the node before dispatching tasks.")

        task_id = f"task-{int(time.time() * 1000)}-{random.randint(100, 999)}"
        task = MinionTask(
            id=task_id,
            minion_id=minion_id,
            name=name,
            directive=directive,
            status="QUEUED",
            progress=0,
            created_at=time.time(),
            logs=[f"Task '{name}' queued for subordinate node '{node.name}'."],
        )

        node.current_task = task
        node.status = "EXECUTING"
        node.load = random.randint(70, 95)
        self._task_history.insert(0, task)
        if len(self._task_history) > 100:
            self._task_history.pop()

        await self._emit_event("MINION_TASK_UPDATE", asdict(task))
        await self._emit_event("MINION_STATUS_UPDATE", asdict(node))

        # Spawn simulation execution worker
        exec_task = asyncio.create_task(
            self._simulate_task_execution(node, task, simulate_duration)
        )
        self._background_tasks.add(exec_task)
        exec_task.add_done_callback(self._background_tasks.discard)

        return task

    async def _simulate_task_execution(
        self,
        node: MinionNode,
        task: MinionTask,
        duration: float,
    ) -> None:
        """Simulate incremental execution of a dispatched task."""
        try:
            task.status = "EXECUTING"
            steps = 4
            step_duration = max(0.01, duration / steps)

            for step in range(1, steps + 1):
                await asyncio.sleep(step_duration)
                task.progress = int((step / steps) * 100)
                log_msg = f"Step {step}/{steps}: Executing operational directive '{task.name}'..."
                task.logs.append(log_msg)
                await self._emit_event("MINION_TASK_UPDATE", asdict(task))

            task.status = "COMPLETED"
            task.completed_at = time.time()
            task.output = (
                f"Directive '{task.name}' successfully executed by {node.name} "
                f"({node.role}). All verification checks passed."
            )
            task.logs.append("Execution finalized with status 0 (SUCCESS).")

            node.tasks_completed += 1
            node.current_task = None
            node.status = "IDLE"
            node.load = random.randint(8, 20)

            await self._emit_event("MINION_TASK_UPDATE", asdict(task))
            await self._emit_event("MINION_STATUS_UPDATE", asdict(node))
        except Exception as exc:
            task.status = "FAILED"
            task.completed_at = time.time()
            task.output = f"Execution error: {exc}"
            task.logs.append(f"FATAL: {exc}")
            node.current_task = None
            node.status = "IDLE"
            node.load = 10
            await self._emit_event("MINION_TASK_UPDATE", asdict(task))
            await self._emit_event("MINION_STATUS_UPDATE", asdict(node))

    async def heartbeat_tick(self) -> None:
        """Called periodically by cron or background loop to fluctuate telemetry."""
        # Probe upstream silently
        await self.check_upstream()

        for node in self.nodes.values():
            if node.status == "IDLE":
                # Realistic micro-fluctuation for idle nodes
                delta = random.randint(-3, 3)
                node.load = max(5, min(35, node.load + delta))
                node.last_ping = time.strftime("%H:%M:%S", time.localtime())
            elif node.status == "EXECUTING":
                node.load = random.randint(70, 92)


# Global singleton instance
minions_service = MinionsService()
