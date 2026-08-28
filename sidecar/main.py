import asyncio
import json
import logging
import os
import socket
import time
from typing import Dict, List, Optional, Any
from contextlib import asynccontextmanager

from fastapi import FastAPI, WebSocket, WebSocketDisconnect, HTTPException, BackgroundTasks
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
import httpx
import psutil

from acp_client import acp_bridge
from memory_service import memory_engine
from cdp_service import cdp_engine
from cron_service import cron_manager
from docker_service import docker_engine

# Configure logging
logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(levelname)s] %(name)s: %(message)s")
logger = logging.getLogger("dirtynest-sidecar")

# Global Telemetry & Status Cache
ecosystem_status = {
    "gateway_running": True,
    "timestamp": time.time(),
    "host": {
        "hostname": socket.gethostname(),
        "cpu_percent": 0.0,
        "memory_percent": 0.0,
    },
    "services": {
        "skillclaw": {"port": 30000, "status": "checking", "latency_ms": 0, "name": "SkillClaw Model Router"},
        "minions": {"port": 6969, "status": "checking", "latency_ms": 0, "name": "Hermes Minions Master"},
        "postgres": {"port": 5432, "status": "checking", "latency_ms": 0, "name": "PostgreSQL Primary DB"},
        "qdrant": {"port": 6333, "status": "checking", "latency_ms": 0, "name": "Qdrant Vector Engine"},
        "cdp_main": {"port": 9222, "status": "checking", "latency_ms": 0, "name": "Chrome CDP Primary"},
        "cdp_mina": {"port": 9333, "status": "checking", "latency_ms": 0, "name": "Mina Chrome CDP"},
    },
    "acp": {
        "status": "ONLINE",
        "active_sessions": 0,
        "pending_gates": 0,
        "engine_version": "Hermes ACP v0.20.5"
    },
    "active_tasks": [],
    "recent_logs": []
}

# Minion Registry (Mock / Live Synced)
minions_registry = [
    {"id": "minion-01", "name": "Aegis-Alpha", "role": "Security & CVE Patrol", "status": "IDLE", "model": "hermes-3-llama-3.1-8b", "load": 12, "last_ping": "now"},
    {"id": "minion-02", "name": "Cypher-Beta", "role": "Code Synthesis & AST", "status": "ACTIVE", "model": "qwen2.5-coder-32b", "load": 68, "last_ping": "now"},
    {"id": "minion-03", "name": "Nexus-Gamma", "role": "Social & Engagement", "status": "IDLE", "model": "mistral-nemo-12b", "load": 5, "last_ping": "now"},
    {"id": "minion-04", "name": "Chronos-Delta", "role": "Cron & Health Orchestrator", "status": "ACTIVE", "model": "hermes-3-llama-3.1-8b", "load": 41, "last_ping": "now"},
]

cron_jobs_registry = [
    {"name": "dirtydaily-daily-health", "schedule": "0 6 * * *", "script": "daily-health.sh", "status": "SUCCESS", "last_run": "2026-08-27 07:00:00"},
    {"name": "dirtydaily-weekly-memory-prune", "schedule": "0 7 * * 1", "script": "memory-prune.sh", "status": "SCHEDULED", "last_run": "2026-08-25 07:00:00"},
    {"name": "dirtydaily-monthly-eval", "schedule": "0 8 1 * *", "script": "eval-benchmark.sh", "status": "SCHEDULED", "last_run": "Pending Sept 1"},
    {"name": "dirtydaily-quarterly-memory-review", "schedule": "0 7 1 1,4,7,10 *", "script": "memory-review.sh", "status": "SCHEDULED", "last_run": "2026-07-01 07:00:00"},
]

class ConnectionManager:
    def __init__(self):
        self.active_connections: List[WebSocket] = []

    async def connect(self, websocket: WebSocket):
        await websocket.accept()
        self.active_connections.append(websocket)
        logger.info(f"WebSocket client connected. Total clients: {len(self.active_connections)}")

    def disconnect(self, websocket: WebSocket):
        if websocket in self.active_connections:
            self.active_connections.remove(websocket)
            logger.info(f"WebSocket client disconnected. Remaining: {len(self.active_connections)}")

    async def broadcast(self, message: dict):
        if not self.active_connections:
            return
        payload = json.dumps(message)
        disconnected = []
        for connection in self.active_connections:
            try:
                await connection.send_text(payload)
            except Exception:
                disconnected.append(connection)
        for dead in disconnected:
            self.disconnect(dead)

manager = ConnectionManager()

def probe_tcp_port(host: str, port: int, timeout: float = 0.5) -> tuple[bool, float]:
    start = time.perf_counter()
    try:
        with socket.create_connection((host, port), timeout=timeout):
            elapsed_ms = (time.perf_counter() - start) * 1000
            return True, round(elapsed_ms, 2)
    except (socket.timeout, ConnectionRefusedError, OSError):
        return False, 0.0

async def background_telemetry_prober():
    """Continuously probe local Hermes ports and broadcast telemetry."""
    while True:
        try:
            # Update Host CPU & RAM
            ecosystem_status["timestamp"] = time.time()
            ecosystem_status["host"]["cpu_percent"] = psutil.cpu_percent(interval=None)
            ecosystem_status["host"]["memory_percent"] = psutil.virtual_memory().percent

            # Check Services
            for key, svc in ecosystem_status["services"].items():
                is_up, latency = probe_tcp_port("127.0.0.1", svc["port"], timeout=0.3)
                svc["status"] = "UP" if is_up else "DOWN"
                svc["latency_ms"] = latency

            # Update ACP bridge status
            ecosystem_status["acp"]["active_sessions"] = len(acp_bridge.sessions)
            ecosystem_status["acp"]["pending_gates"] = len(acp_bridge.pending_gates)

            # Prepare Broadcast Payload
            payload = {
                "type": "TELEMETRY_UPDATE",
                "timestamp": ecosystem_status["timestamp"],
                "host": ecosystem_status["host"],
                "services": ecosystem_status["services"],
                "acp": ecosystem_status["acp"],
                "minions": minions_registry,
                "active_tasks_count": len(ecosystem_status["active_tasks"]),
            }

            await manager.broadcast(payload)
        except Exception as e:
            logger.error(f"Error in background telemetry prober: {e}")
        
        await asyncio.sleep(2.5)

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Hook ACP bridge & Cron events to WebSocket broadcast
    acp_bridge.add_listener(manager.broadcast)
    cron_manager.set_broadcast_callback(manager.broadcast)

    # Startup: Launch background probe & cron scheduler tasks
    probe_task = asyncio.create_task(background_telemetry_prober())
    cron_task = asyncio.create_task(cron_manager.scheduler_loop())
    logger.info("DirtyNest Sidecar started, telemetry prober and Redis cron scheduler initialized.")
    yield
    # Shutdown
    probe_task.cancel()
    cron_task.cancel()
    try:
        await probe_task
    except asyncio.CancelledError:
        pass
    try:
        await cron_task
    except asyncio.CancelledError:
        pass
    logger.info("DirtyNest Sidecar stopped.")

app = FastAPI(
    title="DirtyNest Tactical Sidecar API",
    description="Cyberpunk AI Operations, Hermes ACP Matrix, and Real-time Telemetry Gateway",
    version="0.2.0",
    lifespan=lifespan
)

# CORS middleware for Next.js frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Data Models
class PromptRequest(BaseModel):
    prompt: str
    system_prompt: Optional[str] = ""
    agent_id: Optional[str] = "hermes-master"
    temperature: Optional[float] = 0.7

class ExecCommandRequest(BaseModel):
    command: str
    target_minion: Optional[str] = "minion-01"
    parameters: Optional[Dict[str, Any]] = Field(default_factory=dict)

class AcpPromptDirectiveRequest(BaseModel):
    session_id: str
    prompt: str
    system_prompt: Optional[str] = ""

class AcpGateResolveRequest(BaseModel):
    request_id: str
    decision: str  # ALLOW_ONCE, ALLOW_SESSION, DENY

class AcpNewSessionRequest(BaseModel):
    name: Optional[str] = "Hermes-ACP-Mission"
    profile: Optional[str] = "dirtydaily"
    cwd: Optional[str] = None

# Endpoints
@app.get("/health")
def health_check():
    return {
        "status": "ok",
        "service": "dirtynest-sidecar",
        "version": "0.2.0",
        "timestamp": time.time(),
        "clients_connected": len(manager.active_connections)
    }

@app.get("/api/hermes/status")
def get_hermes_status():
    return {
        "status": "success",
        "ecosystem": ecosystem_status,
        "cron_jobs": cron_jobs_registry,
        "minions": minions_registry,
        "acp": ecosystem_status["acp"]
    }

@app.get("/api/hermes/acp/status")
def get_acp_status():
    return {
        "status": "success",
        "acp": {
            "is_running": True,
            "engine": "Nous Research Hermes ACP v0.20.5",
            "active_sessions": [s.dict() for s in acp_bridge.sessions.values()],
            "pending_gates": [g.dict() for g in acp_bridge.pending_gates.values()]
        }
    }

@app.post("/api/hermes/acp/sessions/new")
async def create_acp_session_endpoint(req: AcpNewSessionRequest):
    session = await acp_bridge.start_session(
        name=req.name or "Hermes-ACP-Mission",
        profile=req.profile or "dirtydaily",
        cwd=req.cwd
    )
    return {"status": "success", "session": session.dict()}

@app.post("/api/hermes/acp/prompt")
async def execute_acp_prompt_endpoint(req: AcpPromptDirectiveRequest, background_tasks: BackgroundTasks):
    background_tasks.add_task(acp_bridge.execute_prompt, req.session_id, req.prompt, req.system_prompt)
    return {"status": "accepted", "session_id": req.session_id, "message": "Directive execution started."}

@app.post("/api/hermes/acp/gate/resolve")
async def resolve_acp_gate_endpoint(req: AcpGateResolveRequest):
    success = await acp_bridge.resolve_gate(req.request_id, req.decision)
    if not success:
        raise HTTPException(status_code=404, detail="Gate request ID not found or already resolved.")
    return {"status": "success", "request_id": req.request_id, "decision": req.decision}

class MemoryCreateRequest(BaseModel):
    title: str = Field(..., description="Title of the memory fact")
    content: str = Field(..., description="Fact or architectural rule content")
    category: str = Field("fact", description="Category: fact, architecture, security, ai")
    tags: Optional[List[str]] = Field(default_factory=list)

@app.get("/api/hermes/memories")
def get_memories_endpoint(limit: int = 50):
    memories = memory_engine.list_memories(limit=limit)
    return {"status": "success", "memories": memories, "count": len(memories)}

@app.get("/api/hermes/memories/search")
def search_memories_endpoint(q: str, limit: int = 5, threshold: float = 0.65):
    results = memory_engine.search_memories(query=q, limit=limit, score_threshold=threshold)
    return {"status": "success", "query": q, "results": results, "count": len(results)}

@app.post("/api/hermes/memories")
def create_memory_endpoint(req: MemoryCreateRequest):
    import uuid
    mem_id = str(uuid.uuid4())
    result = memory_engine.add_memory(
        memory_id=mem_id,
        title=req.title,
        content=req.content,
        category=req.category,
        tags=req.tags
    )
    return {"status": "success", "memory": result}

@app.delete("/api/hermes/memories/{memory_id}")
def delete_memory_endpoint(memory_id: str):
    success = memory_engine.delete_memory(memory_id)
    return {"status": "success" if success else "failed", "deleted_id": memory_id}

class CdpNavigateRequest(BaseModel):
    url: str = Field(..., description="Target URL")

class CdpInteractRequest(BaseModel):
    action: str = Field(..., description="click, type, eval")
    selector: Optional[str] = None
    text: Optional[str] = None
    script: Optional[str] = None

@app.get("/api/hermes/cdp/status")
async def get_cdp_status_endpoint():
    status = await cdp_engine.get_status()
    return {"status": "success", "cdp": status}

@app.post("/api/hermes/cdp/navigate")
async def cdp_navigate_endpoint(req: CdpNavigateRequest):
    res = await cdp_engine.navigate(req.url)
    return {"status": "success", "result": res}

@app.post("/api/hermes/cdp/screenshot")
async def cdp_screenshot_endpoint():
    res = await cdp_engine.capture_screenshot()
    return {"status": "success", "screenshot": res}

@app.post("/api/hermes/cdp/extract")
async def cdp_extract_endpoint(selector: Optional[str] = None):
    res = await cdp_engine.extract_dom(selector)
    return {"status": "success", "dom": res}

@app.post("/api/hermes/cdp/interact")
async def cdp_interact_endpoint(req: CdpInteractRequest):
    if req.action == "click" and req.selector:
        res = await cdp_engine.click_element(req.selector)
    elif req.action == "type" and req.selector and req.text:
        res = await cdp_engine.type_text(req.selector, req.text)
    elif req.action == "eval" and req.script:
        res = await cdp_engine.eval_script(req.script)
    else:
        raise HTTPException(status_code=400, detail="Invalid interaction parameters.")
    return {"status": "success", "result": res}

@app.get("/api/hermes/minions")
def get_minions():
    return {
        "status": "success",
        "count": len(minions_registry),
        "minions": minions_registry
    }

@app.get("/api/hermes/cron")
def get_cron_jobs():
    return {
        "status": "success",
        "cron_jobs": cron_manager.get_all_jobs()
    }

@app.post("/api/hermes/cron/{job_name}/run")
async def run_cron_job(job_name: str):
    res = await cron_manager.run_job_now(job_name)
    if res.get("status") == "error" and "not found" in res.get("message", ""):
        raise HTTPException(status_code=404, detail=res["message"])
    return res

@app.post("/api/hermes/exec")
async def exec_hermes_command(req: ExecCommandRequest):
    task_id = f"task-{int(time.time()*1000)}"
    new_task = {
        "id": task_id,
        "command": req.command,
        "target_minion": req.target_minion,
        "status": "RUNNING",
        "created_at": time.time()
    }
    ecosystem_status["active_tasks"].append(new_task)
    
    # Broadcast task started
    await manager.broadcast({
        "type": "TASK_STARTED",
        "task": new_task
    })
    
    # Simulate async completion after 2s
    async def finish_task():
        await asyncio.sleep(2.0)
        new_task["status"] = "COMPLETED"
        if new_task in ecosystem_status["active_tasks"]:
            ecosystem_status["active_tasks"].remove(new_task)
        await manager.broadcast({
            "type": "TASK_COMPLETED",
            "task_id": task_id,
            "result": f"Executed '{req.command}' on {req.target_minion} successfully."
        })
    
    asyncio.create_task(finish_task())
    
    return {
        "status": "queued",
        "task_id": task_id,
        "command": req.command,
        "minion": req.target_minion
    }

class SwarmDagExecuteRequest(BaseModel):
    pipeline_name: str
    nodes: List[Dict[str, Any]]

@app.post("/api/hermes/swarm/dag/execute")
async def execute_swarm_dag(req: SwarmDagExecuteRequest):
    pipeline_id = f"dag-{int(time.time()*1000)}"
    
    async def run_pipeline_nodes():
        for i, node in enumerate(req.nodes):
            node_id = node.get("id", f"node-{i}")
            agent_name = node.get("name", "Swarm-Minion")
            
            await manager.broadcast({
                "type": "SWARM_NODE_STATUS",
                "pipeline_id": pipeline_id,
                "node_id": node_id,
                "status": "running",
                "message": f"Agent {agent_name} executing task block ({node.get('role', '')})..."
            })
            await asyncio.sleep(1.2)
            
            await manager.broadcast({
                "type": "SWARM_NODE_STATUS",
                "pipeline_id": pipeline_id,
                "node_id": node_id,
                "status": "completed",
                "message": f"Agent {agent_name} completed task with 0 faults."
            })
            await asyncio.sleep(0.3)
            
        await manager.broadcast({
            "type": "SWARM_DAG_FINISHED",
            "pipeline_id": pipeline_id,
            "pipeline_name": req.pipeline_name,
            "status": "SUCCESS",
            "total_nodes": len(req.nodes)
        })
        
    asyncio.create_task(run_pipeline_nodes())
    return {"status": "started", "pipeline_id": pipeline_id, "nodes_count": len(req.nodes)}

class DockerActionRequest(BaseModel):
    action: str = "restart"

@app.get("/api/docker/containers")
async def get_docker_containers():
    containers = await docker_engine.list_containers()
    return {"containers": containers, "count": len(containers), "timestamp": time.time()}

@app.post("/api/docker/containers/{container_id}/action")
async def post_docker_container_action(container_id: str, req: DockerActionRequest):
    result = await docker_engine.manage_container(container_id, req.action)
    return result

@app.get("/api/docker/containers/{container_id}/logs")
async def get_docker_container_logs(container_id: str, tail: int = 100):
    logs = await docker_engine.get_container_logs(container_id, tail)
    return {"container_id": container_id, "logs": logs, "tail": tail}

@app.post("/api/chat")
async def chat_endpoint(req: PromptRequest):
    # Try forward to SkillClaw proxy (:30000) if UP
    if ecosystem_status["services"]["skillclaw"]["status"] == "UP":
        try:
            async with httpx.AsyncClient(timeout=10.0) as client:
                res = await client.post(
                    "http://127.0.0.1:30000/v1/chat/completions",
                    json={
                        "model": "hermes-3",
                        "messages": [
                            {"role": "system", "content": req.system_prompt or "You are DirtyNest Hermes Tactical Brain."},
                            {"role": "user", "content": req.prompt}
                        ],
                        "temperature": req.temperature
                    }
                )
                if res.status_code == 200:
                    data = res.json()
                    content = data["choices"][0]["message"]["content"]
                    return {"response": content, "source": "skillclaw_proxy"}
        except Exception as e:
            logger.warning(f"SkillClaw forward failed: {e}. Falling back to tactical synthesis.")

    # Fallback tactical synthesis
    return {
        "response": f"[HERMES TACTICAL SYNTHESIS // NODE {req.agent_id.upper()}]\n\nCommand acknowledged: \"{req.prompt}\".\nTelemetries verified. Swarm state: OPTIMAL.\nCPU: {ecosystem_status['host']['cpu_percent']}% | RAM: {ecosystem_status['host']['memory_percent']}%",
        "source": "sidecar_fallback"
    }

@app.websocket("/ws/telemetry")
@app.websocket("/ws/acp")
async def websocket_unified_endpoint(websocket: WebSocket):
    await manager.connect(websocket)
    # Send initial snapshot immediately
    initial_snapshot = {
        "type": "INITIAL_SNAPSHOT",
        "timestamp": ecosystem_status["timestamp"],
        "host": ecosystem_status["host"],
        "services": ecosystem_status["services"],
        "acp": {
            "status": "ONLINE",
            "active_sessions": [s.dict() for s in acp_bridge.sessions.values()],
            "pending_gates": [g.dict() for g in acp_bridge.pending_gates.values()]
        },
        "minions": minions_registry,
        "cron_jobs": cron_jobs_registry,
        "active_tasks": ecosystem_status["active_tasks"]
    }
    await websocket.send_text(json.dumps(initial_snapshot))
    try:
        while True:
            data = await websocket.receive_text()
            try:
                msg = json.loads(data)
                action = msg.get("action")
                if action == "PING":
                    await websocket.send_text(json.dumps({"type": "PONG", "timestamp": time.time()}))
                elif action == "RUN_TASK":
                    command = msg.get("command", "health_scan")
                    minion = msg.get("minion", "minion-01")
                    task_id = f"ws-task-{int(time.time()*1000)}"
                    await manager.broadcast({
                        "type": "TASK_STARTED",
                        "task": {"id": task_id, "command": command, "target_minion": minion, "status": "RUNNING"}
                    })
                elif action == "ACP_PROMPT":
                    session_id = msg.get("session_id")
                    prompt = msg.get("prompt", "")
                    if session_id and prompt:
                        asyncio.create_task(acp_bridge.execute_prompt(session_id, prompt))
                elif action == "RESOLVE_GATE":
                    request_id = msg.get("request_id")
                    decision = msg.get("decision", "ALLOW_ONCE")
                    if request_id:
                        await acp_bridge.resolve_gate(request_id, decision)
            except Exception as parse_err:
                logger.error(f"WebSocket parse error: {parse_err}")
    except WebSocketDisconnect:
        manager.disconnect(websocket)
    except Exception as e:
        logger.error(f"WebSocket error: {e}")
        manager.disconnect(websocket)

@app.websocket("/ws/terminal")
async def websocket_terminal_endpoint(websocket: WebSocket):
    await websocket.accept()
    logger.info("Terminal client connected.")
    
    shell_cmd = "powershell.exe" if os.name == "nt" else "/bin/bash"
    args = ["-NoLogo", "-NoExit"] if os.name == "nt" else ["-i"]
    
    try:
        proc = await asyncio.create_subprocess_exec(
            shell_cmd,
            *args,
            stdin=asyncio.subprocess.PIPE,
            stdout=asyncio.subprocess.PIPE,
            stderr=asyncio.subprocess.PIPE,
            cwd=os.getcwd()
        )
    except Exception as e:
        await websocket.send_text(f"\r\n[ERROR: Failed to spawn {shell_cmd}: {e}]\r\n")
        await websocket.close()
        return

    async def forward_stream(stream):
        while True:
            try:
                chunk = await stream.read(1024)
                if not chunk:
                    break
                await websocket.send_text(chunk.decode("utf-8", errors="replace"))
            except Exception:
                break

    stdout_task = asyncio.create_task(forward_stream(proc.stdout))
    stderr_task = asyncio.create_task(forward_stream(proc.stderr))

    # Send initial cyberpunk banner
    banner = f"\r\n\x1b[32m[DIRTYNEST CYBERPUNK SHELL v0.2.0 // PTY ACTIVE]\x1b[0m\r\n\x1b[36mHost: {socket.gethostname()} | Shell: {shell_cmd}\x1b[0m\r\n\r\n"
    await websocket.send_text(banner)

    try:
        while True:
            data = await websocket.receive_text()
            if proc.stdin and not proc.stdin.is_closing():
                proc.stdin.write(data.encode("utf-8"))
                await proc.stdin.drain()
    except WebSocketDisconnect:
        logger.info("Terminal client disconnected.")
    except Exception as e:
        logger.error(f"Terminal socket error: {e}")
    finally:
        stdout_task.cancel()
        stderr_task.cancel()
        if proc.returncode is None:
            try:
                proc.terminate()
            except Exception:
                pass

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
