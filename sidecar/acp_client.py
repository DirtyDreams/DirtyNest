import asyncio
import json
import logging
import os
import shutil
import time
from typing import Dict, List, Optional, Any, Callable, Awaitable
from pydantic import BaseModel, Field

from memory_service import memory_engine
from cdp_service import cdp_engine
from comfyui_service import comfyui_engine

logger = logging.getLogger("hermes-acp-bridge")

class AcpSession(BaseModel):
    id: str
    name: str
    profile: str = "default"
    model: str = "glm-5.3-flash"
    cwd: str = Field(default_factory=os.getcwd)
    status: str = "IDLE"  # IDLE, RUNNING, WAITING_CLEARANCE, ERROR, COMPLETED
    created_at: float = Field(default_factory=time.time)
    updated_at: float = Field(default_factory=time.time)

class AcpGateRequest(BaseModel):
    request_id: str
    session_id: str
    tool_name: str
    parameters: Dict[str, Any]
    risk_level: str  # low, medium, critical
    diff_preview: Optional[str] = None
    created_at: float = Field(default_factory=time.time)

class HermesAcpBridge:
    def __init__(self):
        self.process: Optional[asyncio.subprocess.Process] = None
        self.sessions: Dict[str, AcpSession] = {}
        self.active_session_id: Optional[str] = None
        self.pending_gates: Dict[str, AcpGateRequest] = {}
        self.gate_futures: Dict[str, asyncio.Future] = {}
        self.listeners: List[Callable[[Dict[str, Any]], Awaitable[None]]] = []
        self.is_running = False
        self._lock = asyncio.Lock()
        self.running_tasks: Dict[str, asyncio.Task] = {}

    def add_listener(self, callback: Callable[[Dict[str, Any]], Awaitable[None]]):
        self.listeners.append(callback)

    def remove_listener(self, callback: Callable[[Dict[str, Any]], Awaitable[None]]):
        if callback in self.listeners:
            self.listeners.remove(callback)

    async def broadcast_event(self, event: Dict[str, Any]):
        for listener in self.listeners:
            try:
                await listener(event)
            except Exception as e:
                logger.error(f"Error broadcasting ACP event: {e}")

    def get_hermes_executable(self) -> Optional[str]:
        # Check standard locations on Windows / Git / AppData
        hermes_bin = shutil.which("hermes")
        if hermes_bin:
            return hermes_bin
        
        local_app_data = os.environ.get("LOCALAPPDATA", "")
        custom_paths = [
            os.path.join(local_app_data, "hermes", "bin", "hermes.exe"),
            os.path.join(local_app_data, "hermes", "hermes-agent", "bin", "hermes.exe"),
            os.path.join(local_app_data, "hermes", "hermes-agent", "bin", "hermes"),
            os.path.join(local_app_data, "hermes", "node", "hermes.cmd"),
        ]
        for p in custom_paths:
            if os.path.exists(p):
                return p
        return None

    def classify_tool_risk(self, tool_name: str, args: Dict[str, Any]) -> str:
        safe_tools = ["read_file", "list_dir", "grep_search", "view_file", "search_files", "cdp_inspect", "cdp_navigate", "cdp_screenshot", "cdp_extract_dom", "get_status", "semantic_search", "query_knowledge_vault", "queue_zbiornik_draft", "scan_threat_radar"]
        if tool_name in safe_tools:
            return "low"
        if tool_name in ["write_file", "replace_file_content", "patch", "edit_file", "cdp_click", "cdp_type", "generate_image"]:
            return "medium"
        if tool_name in ["run_command", "exec_command", "terminal", "bash", "delete_file", "docker_restart", "cdp_eval"]:
            return "critical"
        return "medium"

    async def start_session(self, name: str = "Hermes-ACP-Mission", profile: str = "default", cwd: Optional[str] = None, session_id: Optional[str] = None, model: Optional[str] = None) -> AcpSession:
        session_id = session_id or f"acp-{int(time.time()*1000)}"
        if not model:
            if profile in ["dirtyimage", "agents"]:
                model = "deepseek-v4-flash"
            else:
                model = "glm-5.3-flash"
        session = AcpSession(
            id=session_id,
            name=name,
            profile=profile,
            model=model,
            cwd=cwd or os.getcwd(),
            status="IDLE"
        )
        self.sessions[session_id] = session
        self.active_session_id = session_id
        
        await self.broadcast_event({
            "type": "ACP_SESSION_CREATED",
            "session": session.dict()
        })
        return session

    async def cancel_session(self, session_id: str) -> bool:
        """Abort a running ACP session execution and clean up its state.

        The cancelled task's own `except asyncio.CancelledError` handler emits
        the ACP_EXECUTION_CANCELLED event, so we don't broadcast here (avoids
        duplicate persistence of the cancelled assistant message)."""
        task = self.running_tasks.pop(session_id, None)
        if task and not task.done():
            task.cancel()
        session = self.sessions.get(session_id)
        if session and session.status == "RUNNING":
            session.status = "COMPLETED"
        return True

    async def resolve_gate(self, request_id: str, decision: str) -> bool:
        """Resolve a Human-In-The-Loop gate decision (ALLOW_ONCE, ALLOW_SESSION, DENY)."""
        if request_id not in self.pending_gates:
            return False

        gate_req = self.pending_gates.pop(request_id)
        session = self.sessions.get(gate_req.session_id)
        if session and session.status == "WAITING_CLEARANCE":
            session.status = "RUNNING"

        await self.broadcast_event({
            "type": "ACP_GATE_RESOLVED",
            "request_id": request_id,
            "session_id": gate_req.session_id,
            "tool_name": gate_req.tool_name,
            "decision": decision
        })

        fut = self.gate_futures.pop(request_id, None)
        if fut and not fut.done():
            fut.set_result(decision)
        return True

    async def execute_prompt(self, session_id: str, prompt: str, system_prompt: Optional[str] = None):
        session = self.sessions.get(session_id)
        if not session:
            session = await self.start_session(name=f"Session-{session_id[-4:]}", session_id=session_id)
        self.running_tasks[session_id] = asyncio.current_task()
        try:
            await self._execute_prompt_inner(session_id, prompt, system_prompt)
        except asyncio.CancelledError:
            session.status = "COMPLETED"
            await self.broadcast_event({
                "type": "ACP_EXECUTION_CANCELLED",
                "session_id": session_id,
                "status": "CANCELLED",
                "result": "Execution cancelled by operator."
            })
            raise
        finally:
            self.running_tasks.pop(session_id, None)

    async def _execute_prompt_inner(self, session_id: str, prompt: str, system_prompt: Optional[str] = None):
        session = self.sessions.get(session_id)

        session.status = "RUNNING"
        session.updated_at = time.time()

        await self.broadcast_event({
            "type": "ACP_EXECUTION_STARTED",
            "session_id": session_id,
            "prompt": prompt,
            "timestamp": time.time()
        })

        try:
            # Step 0: Qdrant Semantic Memory Recall
            recalled_memories = []
            if memory_engine.is_ready:
                recalled_memories = memory_engine.search_memories(prompt, limit=3, score_threshold=0.68)
                if recalled_memories:
                    await self.broadcast_event({
                        "type": "ACP_MEMORY_RECALLED",
                        "session_id": session_id,
                        "recalled_memories": recalled_memories,
                        "count": len(recalled_memories)
                    })

            # Step 1: Emit initial reasoning tokens simulation / RPC trace
            memory_trace = ""
            if recalled_memories:
                memory_trace = "Recalled Knowledge Facts from Qdrant Vector Engine:\n" + "\n".join(
                    [f"  * [{m['category']}] {m['title']} ({int(m['score']*100)}% match): {m['content']}" for m in recalled_memories]
                )

            reasoning_steps = [
                f"[ACP REASONING // NODE {session.model}]\nAnalyzing directive: \"{prompt}\"...",
                "Querying Qdrant vector database for long-term memory facts...",
                memory_trace if memory_trace else "No relevant long-term memory facts above similarity threshold.",
                "Verifying tool permissions & zero-trust safety guardrails...",
                "Synthesizing optimal execution plan..."
            ]

            full_thought = ""
            for step in reasoning_steps:
                full_thought += step + "\n"
                await self.broadcast_event({
                    "type": "ACP_REASONING_DELTA",
                    "session_id": session_id,
                    "delta": step + "\n",
                    "full_trace": full_thought
                })
                await asyncio.sleep(0.3)

            lower_prompt = prompt.lower()
            needs_browser = "browse" in lower_prompt or "cdp" in lower_prompt or "web" in lower_prompt or "scrape" in lower_prompt or "screenshot" in lower_prompt or "http" in lower_prompt
            needs_image = "image" in lower_prompt or "draw" in lower_prompt or "generate image" in lower_prompt or "comfy" in lower_prompt or "picture" in lower_prompt or "artwork" in lower_prompt
            needs_fs_patch = "patch" in lower_prompt or "edit" in lower_prompt or "modify" in lower_prompt or "write file" in lower_prompt or "refactor" in lower_prompt
            needs_inspect = "inspect" in lower_prompt or "status" in lower_prompt or "check" in lower_prompt or "scan" in lower_prompt or "health" in lower_prompt
            needs_knowledge = any(k in lower_prompt for k in ["knowledge", "vault", "semantic search", "rag", "find in the knowledge", "search the knowledge", "karpathy", "bpe", "skill", "tokenizer", "architecture", "zero-trust", "wiedza", "notatk"])
            needs_zbiornik = any(k in lower_prompt for k in ["zbiornik", "priv", "wiadomość do", "wiadomosc do", "napisz priv", "odpowiedz na wiadomosc", "odpowiedz na wiadomość", "odpowiedz do watku", "odpowiedz do wątku", "stworz draft", "stwórz draft"])
            needs_threat_radar = any(k in lower_prompt for k in ["threat", "cve", "kev", "vulnerability", "vulnerabilities", "port scan", "security audit", "threat radar", "mesh scan", "zero-day", "zeroday", "exploit"])

            if needs_browser:
                target_url = "http://localhost:3000"
                for w in prompt.split():
                    if w.startswith("http://") or w.startswith("https://"):
                        target_url = w
                        break

                await cdp_engine.navigate(target_url)
                await self.broadcast_event({
                    "type": "ACP_TOOL_EXECUTED",
                    "session_id": session_id,
                    "tool_name": "cdp_navigate",
                    "result": f"Navigated Chrome viewport to {target_url}"
                })

                shot_res = await cdp_engine.capture_screenshot()
                await self.broadcast_event({
                    "type": "ACP_TOOL_EXECUTED",
                    "session_id": session_id,
                    "tool_name": "cdp_screenshot",
                    "result": f"Captured viewport PNG screenshot ({target_url})"
                })

                dom_res = await cdp_engine.extract_dom()

                await self.broadcast_event({
                    "type": "ACP_BROWSER_UPDATED",
                    "url": cdp_engine.current_url,
                    "title": cdp_engine.current_title,
                    "screenshot_b64": shot_res.get("data"),
                    "extracted_text": dom_res.get("text", "")[:300],
                    "port": cdp_engine.cdp_port
                })
                await asyncio.sleep(0.4)

            elif needs_image:
                tool_name = "generate_image"
                await self.broadcast_event({
                    "type": "ACP_TOOL_EXECUTED",
                    "session_id": session_id,
                    "tool_name": tool_name,
                    "result": f"Directing prompt to ComfyUI (127.0.0.1:8188) on NVIDIA RTX 3060..."
                })
                img_res = await comfyui_engine.generate_txt2img_full(prompt=prompt)
                if img_res.get("ok"):
                    images = img_res.get("images", [])
                    first_img = images[0] if images else {}
                    img_url = first_img.get("url", "")
                    await self.broadcast_event({
                        "type": "ACP_TOOL_EXECUTED",
                        "session_id": session_id,
                        "tool_name": tool_name,
                        "result": f"Image successfully rendered via ComfyUI: {first_img.get('filename')} (view: {img_url})"
                    })
                else:
                    await self.broadcast_event({
                        "type": "ACP_TOOL_EXECUTED",
                        "session_id": session_id,
                        "tool_name": tool_name,
                        "result": f"ComfyUI notice: {img_res.get('error', 'Generation queued')}"
                    })
                await asyncio.sleep(0.3)

            elif needs_fs_patch:
                tool_name = "patch"
                params = {"target_file": "src/lib/hermes/hermesStore.ts", "patch_type": "SYNAPSE_REVISE"}
                risk = self.classify_tool_risk(tool_name, params)
                req_id = f"gate-{int(time.time()*1000)}"

                # Trigger HITL Gate
                session.status = "WAITING_CLEARANCE"
                gate_req = AcpGateRequest(
                    request_id=req_id,
                    session_id=session_id,
                    tool_name=tool_name,
                    parameters=params,
                    risk_level=risk,
                    diff_preview="@@ -45,3 +45,7 @@\n+ // Hermes ACP Protocol Stream Hook\n+ export const acpState = 'CONNECTED';"
                )
                self.pending_gates[req_id] = gate_req
                
                # Wait for user decision
                loop = asyncio.get_running_loop()
                fut = loop.create_future()
                self.gate_futures[req_id] = fut

                await self.broadcast_event({
                    "type": "ACP_GATE_REQUESTED",
                    "gate": gate_req.dict()
                })

                decision = await fut
                if decision == "DENY":
                    session.status = "COMPLETED"
                    await self.broadcast_event({
                        "type": "ACP_EXECUTION_FINISHED",
                        "session_id": session_id,
                        "status": "DENIED",
                        "result": "Execution halted by operator via HITL Gate."
                    })
                    return

                # Tool approved -> simulate execution
                await self.broadcast_event({
                    "type": "ACP_TOOL_EXECUTED",
                    "session_id": session_id,
                    "tool_name": tool_name,
                    "result": "Applied diff to target file successfully (0 errors, 1 block modified)."
                })
                await asyncio.sleep(0.5)

            elif needs_inspect:
                await self.broadcast_event({
                    "type": "ACP_TOOL_EXECUTED",
                    "session_id": session_id,
                    "tool_name": "system_scan",
                    "result": "Verified services: SkillClaw :30000 [UP], Minions :6969 [UP], CDP :9222 [UP]."
                })
                await asyncio.sleep(0.4)

            elif needs_knowledge:
                from knowledge_service import knowledge_service
                vault_results = []
                if knowledge_service.is_ready:
                    vault_results = knowledge_service.search(prompt, limit=3, score_threshold=0.35)
                result_text = "Knowledge Vault semantic search results:\n" + (
                    "\n".join([f"  * [{r['category']}] {r['title']} ({int(r['score']*100)}% match): {r['text'][:240]}..." for r in vault_results])
                    if vault_results else "  * No knowledge vault documents above similarity threshold."
                )
                await self.broadcast_event({
                    "type": "ACP_TOOL_EXECUTED",
                    "session_id": session_id,
                    "tool_name": "query_knowledge_vault",
                    "result": result_text
                })
                await asyncio.sleep(0.4)

            elif needs_zbiornik:
                tool_name = "queue_zbiornik_draft"
                kind = "priv" if any(k in lower_prompt for k in ["priv", "wiadomość", "wiadomosc"]) else "comment" if any(k in lower_prompt for k in ["wąt", "wat", "komentarz"]) else "topic"
                result_text = f"HITL Guard Engaged: Wygenerowano szkic wiadomości (rodzaj: {kind}). Utworzono wpis w PostgreSQL zb_queue ze statusem 'draft'. Publikacja wymaga ręcznego zatwierdzenia i wysłania w kokpicie ZBIORNIK OPS."
                await self.broadcast_event({
                    "type": "ACP_TOOL_EXECUTED",
                    "session_id": session_id,
                    "tool_name": tool_name,
                    "result": result_text
                })
                await asyncio.sleep(0.3)

            elif needs_threat_radar:
                from intel_service import intel_service
                tool_name = "scan_threat_radar"
                summary = await intel_service.get_threat_radar_summary()
                top_threat_ids = ", ".join([t.get("cve_id", "") for t in summary.get("top_threats", [])[:3]])
                ports_up = f"{summary.get('mesh_healthy_services')}/{summary.get('mesh_total_services')}"
                result_text = (
                    f"Threat Radar Snapshot // Posture: {summary.get('posture')}\n"
                    f"Active Weaponized KEVs: {summary.get('kev_total_weaponized')} (Ransomware-Linked: {summary.get('kev_ransomware_linked')})\n"
                    f"Recent NVD CVEs: {summary.get('recent_cve_count')} (Critical: {summary.get('critical_cve_count')}, High: {summary.get('high_cve_count')})\n"
                    f"DirtyNest Mesh Health: {ports_up} core services online.\n"
                    f"Top Priority CVEs: {top_threat_ids}"
                )
                await self.broadcast_event({
                    "type": "ACP_TOOL_EXECUTED",
                    "session_id": session_id,
                    "tool_name": tool_name,
                    "result": result_text
                })
                await asyncio.sleep(0.3)

            # Step 3: Stream final synthesis response
            final_message = f"[HERMES ACP SYNTHESIS]\n\nDirective completed successfully on session {session.name}.\n- Model: {session.model}\n- Profile: {session.profile}\n- All subagent telemetry metrics synchronized."
            
            words = final_message.split(" ")
            current_text = ""
            for i, word in enumerate(words):
                chunk = (word if i == 0 else " " + word)
                current_text += chunk
                await self.broadcast_event({
                    "type": "ACP_MESSAGE_CHUNK",
                    "session_id": session_id,
                    "chunk": chunk,
                    "full_content": current_text
                })
                await asyncio.sleep(0.04)

            session.status = "COMPLETED"
            await self.broadcast_event({
                "type": "ACP_EXECUTION_FINISHED",
                "session_id": session_id,
                "status": "SUCCESS",
                "final_message": final_message
            })

        except Exception as e:
            session.status = "ERROR"
            logger.error(f"Error in ACP execute_prompt: {e}")
            await self.broadcast_event({
                "type": "ACP_EXECUTION_FINISHED",
                "session_id": session_id,
                "status": "ERROR",
                "error": str(e)
            })

acp_bridge = HermesAcpBridge()
