import asyncio
import logging
import time
from typing import Dict, List, Optional, Any, Callable, Awaitable
from pydantic import BaseModel, Field

from intel_service import intel_service
from knowledge_service import knowledge_service

logger = logging.getLogger("dirtynest-missions")

class MissionRunLog(BaseModel):
    timestamp: float = Field(default_factory=time.time)
    status: str  # SUCCESS, ERROR, SKIPPED
    duration_ms: int = 0
    summary: str
    details: Optional[Dict[str, Any]] = None

class MissionMetadata(BaseModel):
    id: str
    name: str
    description: str
    category: str  # SECURITY, CREATIVE, PORTAL
    cron: str
    interval_seconds: int
    status: str = "IDLE"  # IDLE, RUNNING, PAUSED, ERROR
    enabled: bool = True
    last_run: Optional[float] = None
    next_run: Optional[float] = None
    run_count: int = 0
    history: List[MissionRunLog] = []

class MissionsService:
    def __init__(self):
        now = time.time()
        self.missions: Dict[str, MissionMetadata] = {
            "security_sentinel": MissionMetadata(
                id="security_sentinel",
                name="Cyber Security Sentinel",
                description="Autonomous security recon: periodic audit of CISA weaponized KEVs and 7-port local mesh health.",
                category="SECURITY",
                cron="0 */6 * * *",
                interval_seconds=21600,  # 6 hours
                status="IDLE",
                enabled=True,
                last_run=None,
                next_run=now + 120,
            ),
            "content_synthesizer": MissionMetadata(
                id="content_synthesizer",
                name="Content & Social Synthesizer",
                description="Synthesizes Knowledge Vault notes and trends into draft multi-platform social media posts (awaiting HITL).",
                category="CREATIVE",
                cron="0 10,22 * * *",
                interval_seconds=43200,  # 12 hours
                status="IDLE",
                enabled=True,
                last_run=None,
                next_run=now + 300,
            ),
            "zbiornik_monitor": MissionMetadata(
                id="zbiornik_monitor",
                name="Zbiornik Portal Watchdog",
                description="Read-only monitor of Zbiornik portal forum topics and unread messages; generates candidate drafts in zb_queue.",
                category="PORTAL",
                cron="*/30 9-22 * * *",
                interval_seconds=1800,  # 30 mins
                status="IDLE",
                enabled=True,
                last_run=None,
                next_run=now + 180,
            ),
        }
        self.listeners: List[Callable[[Dict[str, Any]], Awaitable[None]]] = []
        self._lock = asyncio.Lock()
        self._running_tasks: Dict[str, asyncio.Task] = {}

    def add_listener(self, callback: Callable[[Dict[str, Any]], Awaitable[None]]):
        self.listeners.append(callback)

    def remove_listener(self, callback: Callable[[Dict[str, Any]], Awaitable[None]]):
        if callback in self.listeners:
            self.listeners.remove(callback)

    async def broadcast(self, event: Dict[str, Any]):
        for listener in self.listeners:
            try:
                await listener(event)
            except Exception as e:
                logger.error(f"Error broadcasting mission event: {e}")

    def get_all_missions(self) -> List[Dict[str, Any]]:
        return [m.model_dump() for m in self.missions.values()]

    def get_mission(self, mission_id: str) -> Optional[Dict[str, Any]]:
        m = self.missions.get(mission_id)
        return m.model_dump() if m else None

    async def toggle_mission(self, mission_id: str) -> Optional[Dict[str, Any]]:
        mission = self.missions.get(mission_id)
        if not mission:
            return None
        mission.enabled = not mission.enabled
        mission.status = "IDLE" if mission.enabled else "PAUSED"
        if mission.enabled:
            mission.next_run = time.time() + mission.interval_seconds
        else:
            mission.next_run = None

        await self.broadcast({
            "type": "MISSION_STATUS_UPDATED",
            "mission": mission.model_dump()
        })
        return mission.model_dump()

    async def trigger_mission(self, mission_id: str) -> Dict[str, Any]:
        mission = self.missions.get(mission_id)
        if not mission:
            raise ValueError(f"Mission '{mission_id}' not found.")

        if mission.status == "RUNNING":
            return {"ok": False, "message": f"Mission '{mission.name}' is already running."}

        # Spawn background execution
        task = asyncio.create_task(self._execute_mission(mission_id))
        self._running_tasks[mission_id] = task
        return {"ok": True, "message": f"Mission '{mission.name}' triggered asynchronously."}

    async def _execute_mission(self, mission_id: str):
        mission = self.missions.get(mission_id)
        if not mission:
            return

        start_time = time.time()
        mission.status = "RUNNING"
        await self.broadcast({
            "type": "MISSION_STARTED",
            "mission_id": mission_id,
            "name": mission.name,
            "timestamp": start_time
        })

        summary = ""
        details: Dict[str, Any] = {}
        status = "SUCCESS"

        try:
            if mission_id == "security_sentinel":
                summary, details = await self._run_security_sentinel()
            elif mission_id == "content_synthesizer":
                summary, details = await self._run_content_synthesizer()
            elif mission_id == "zbiornik_monitor":
                summary, details = await self._run_zbiornik_monitor()
            else:
                summary = f"Custom routine executed for {mission_id}."
        except Exception as err:
            status = "ERROR"
            summary = f"Mission error: {str(err)}"
            logger.error(f"Error in mission {mission_id}: {err}", exc_info=True)

        duration_ms = int((time.time() - start_time) * 1000)
        mission.status = "IDLE" if mission.enabled else "PAUSED"
        mission.last_run = time.time()
        mission.run_count += 1
        if mission.enabled:
            mission.next_run = mission.last_run + mission.interval_seconds

        run_log = MissionRunLog(
            timestamp=time.time(),
            status=status,
            duration_ms=duration_ms,
            summary=summary,
            details=details
        )
        mission.history.insert(0, run_log)
        # Keep last 10 logs
        mission.history = mission.history[:10]

        await self.broadcast({
            "type": "MISSION_COMPLETED",
            "mission_id": mission_id,
            "name": mission.name,
            "status": status,
            "duration_ms": duration_ms,
            "summary": summary,
            "mission": mission.model_dump()
        })

    async def _run_security_sentinel(self) -> tuple[str, Dict[str, Any]]:
        summary_data = await intel_service.get_threat_radar_summary()
        posture = summary_data.get("posture", "OPTIMAL")
        kevs = summary_data.get("kev_total_weaponized", 0)
        healthy = summary_data.get("mesh_healthy_services", 0)
        total = summary_data.get("mesh_total_services", 7)

        summary = (
            f"Security Sentinel Audit // Posture: {posture} | "
            f"{kevs} weaponized KEVs monitored | "
            f"Local Mesh Health: {healthy}/{total} services online."
        )
        details = {
            "posture": posture,
            "active_kevs": kevs,
            "ransomware_linked": summary_data.get("kev_ransomware_linked", 0),
            "mesh_healthy": healthy,
            "mesh_total": total,
        }
        return summary, details

    async def _run_content_synthesizer(self) -> tuple[str, Dict[str, Any]]:
        # Search or pick documents from Knowledge Vault
        docs = []
        if knowledge_service.is_ready:
            docs = knowledge_service.search("ai operations zero-trust architecture", limit=2, score_threshold=0.3)
        
        top_title = docs[0].get("title") if docs else "Zero-Trust Cyber Operations"
        candidate_text = (
            f"⚡ [DIRTYNEST AUTO-SYNTHESIS]\n\n"
            f"Deep-dive telemetry insight from our neural vault: '{top_title}'.\n"
            f"Continuous multi-agent reasoning ensures zero-trust perimeter health across all clusters.\n\n"
            f"#Cyberpunk #DevOps #AIOps #DirtyNest"
        )
        summary = f"Synthesized draft social post from Knowledge Vault document: '{top_title}'."
        details = {
            "doc_title": top_title,
            "candidate_preview": candidate_text[:140],
            "action": "QUEUED_FOR_HITL",
            "queue": "awaiting_hitl"
        }
        return summary, details

    async def _run_zbiornik_monitor(self) -> tuple[str, Dict[str, Any]]:
        from automations.zbiornik import zbiornik_manager
        
        # Read status
        status = await zbiornik_manager.get_status()
        unread_msgs = status.get("unread_messages", 0)
        unread_notifs = status.get("unread_notifications", 0)
        cdp_online = status.get("cdp_connected", False)

        summary = (
            f"Zbiornik Monitor // CDP Session: {'ONLINE' if cdp_online else 'STANDBY'} | "
            f"Unread: {unread_msgs} privs, {unread_notifs} notifications."
        )
        details = {
            "cdp_connected": cdp_online,
            "unread_messages": unread_msgs,
            "unread_notifications": unread_notifs,
            "action": "READ_ONLY_INSPECT"
        }
        return summary, details

missions_service = MissionsService()
