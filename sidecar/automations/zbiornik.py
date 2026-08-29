"""
Zbiornik Ops — CDP runner wrapper + monitor/poll service for zbiornik.com.

Architecture (docs/zbiornik-ops.md):
- ZbiornikOpsManager: subprocess wrapper around zbiornik-ops.mjs (single JSON line on stdout).
  Read ops are safe; write ops REQUIRE confirm_run=True (HITL upstream in DirtyNest queue).
- ZbiornikMonitorService: periodic poll (read-only) -> snapshot file
  data/zbiornik/poll-latest.json + best-effort ingest POST to the Next.js dashboard.

Constants:
- SINGLE ACCOUNT ONLY. One CDP session. No bulk actions. Guard rails live in
  the Next.js API layer (zb_rules) — this module never bypasses them.
"""

import asyncio
import datetime
import json
import logging
import os
import subprocess
from typing import Any, Dict, List, Optional, Tuple

logger = logging.getLogger("dirtynest.automations.zbiornik")

RUNNER_DIR_DEFAULT = r"C:\Users\coyot\workspace\zbiornik-ops"
RUNNER_SCRIPT = "zbiornik-ops.mjs"

READ_OPS = ["me", "status", "list-topics", "topic", "inbox", "notif", "top-list"]
WRITE_OPS = ["post-topic", "comment", "send-priv"]
ALL_OPS = READ_OPS + WRITE_OPS

POLL_INTERVAL_NOTE = "cron: zbiornik_poll (30 min) — read-only"


def _now_iso() -> str:
    return datetime.datetime.now().isoformat(timespec="seconds")


class ZbiornikOpsManager:
    """Executes zbiornik-ops.mjs ops via subprocess; parses the single JSON output line."""

    def __init__(self, runner_cwd: str | None = None):
        self.runner_cwd = runner_cwd or os.environ.get("ZBIORNIK_RUNNER_CWD", RUNNER_DIR_DEFAULT)

    # ------------------------------------------------------------------ core
    def run_op(
        self,
        op: str,
        args: Optional[List[str]] = None,
        dry: bool = False,
        confirm_run: bool = False,
        timeout: float = 90.0,
    ) -> Tuple[bool, Dict[str, Any]]:
        """Run one runner op. Returns (ok, payload-dict-or-error)."""
        if op not in ALL_OPS:
            return False, {"ok": False, "op": op, "code": "UNKNOWN_OP", "message": f"Op '{op}' not allowed."}
        if op in WRITE_OPS and not (dry or confirm_run):
            return False, {
                "ok": False,
                "op": op,
                "code": "CONFIRM_REQUIRED",
                "message": "Write op wymaga confirm_run=True (kolejka HITL) lub dry=True.",
            }

        cmd = ["node", RUNNER_SCRIPT, op]
        if args:
            cmd.extend(str(a) for a in args)
        if dry:
            cmd.append("--dry")
        if confirm_run:
            cmd.append("--confirm-run")

        try:
            r = subprocess.run(
                cmd,
                cwd=self.runner_cwd,
                capture_output=True,
                text=True,
                encoding="utf-8",
                errors="replace",
                timeout=timeout,
                shell=False,
            )
        except FileNotFoundError as e:
            return False, {"ok": False, "op": op, "code": "RUNNER_MISSING", "message": f"Runner not found: {e}"}
        except subprocess.TimeoutExpired:
            return False, {"ok": False, "op": op, "code": "TIMEOUT", "message": f"Runner timed out after {timeout:.0f}s."}
        except Exception as e:  # noqa: BLE001
            return False, {"ok": False, "op": op, "code": "SPAWN_FAILED", "message": str(e)}

        stdout = (r.stdout or "").strip()
        stderr = (r.stderr or "").strip()
        parsed = self._parse_json_line(stdout)
        if parsed is not None:
            return bool(parsed.get("ok")), parsed
        # No JSON (crash before output) — surface fragments.
        return False, {
            "ok": False,
            "op": op,
            "code": "NO_OUTPUT",
            "message": (stderr or stdout or f"exit {r.returncode}")[:400],
        }

    @staticmethod
    def _parse_json_line(text: str) -> Optional[Dict[str, Any]]:
        if not text:
            return None
        start = text.find("{")
        if start == -1:
            return None
        try:
            # Take from first '{' to last '}' to be tolerant of stray banners.
            end = text.rfind("}")
            if end <= start:
                return None
            return json.loads(text[start : end + 1])
        except json.JSONDecodeError:
            return None

    # ----------------------------------------------------------------- reads
    def session_status(self) -> Dict[str, Any]:
        runner_ok = os.path.isfile(os.path.join(self.runner_cwd, RUNNER_SCRIPT))
        ok, data = self.run_op("me", timeout=45)
        if data.get("code") == "CDP_OFFLINE":
            return {
                "connected": False,
                "runner_present": runner_ok,
                "loginCode": "CDP_OFFLINE",
                "loggedIn": None,
                "account": None,
                "port": None,
                "raw": data,
            }
        d = data.get("data") or {}
        code = "OK" if (ok and d.get("loggedIn")) else "LOGIN_REQUIRED" if ok else str(data.get("code") or "OP_FAILED")
        # A session is "connected" only when the runner reached the browser:
        # NOT_CONFIGURED / RUNNER_MISSING mean we never got that far.
        connected = code in ("OK", "LOGIN_REQUIRED")
        return {
            "connected": connected,
            "runner_present": runner_ok,
            "loginCode": code,
            "loggedIn": bool(d.get("loggedIn")),
            "account": d.get("account"),
            "port": (d.get("cdp") or {}).get("port"),
            "raw": data,
        }

    def list_topics(self, limit: int = 20) -> Tuple[bool, Dict[str, Any]]:
        return self.run_op("list-topics", [str(int(limit))], timeout=60)

    def topic(self, ref: str) -> Tuple[bool, Dict[str, Any]]:
        return self.run_op("topic", [ref], timeout=60)

    def inbox(self, limit: int = 20) -> Tuple[bool, Dict[str, Any]]:
        return self.run_op("inbox", [str(limit)], timeout=60)

    def notif(self, limit: int = 20) -> Tuple[bool, Dict[str, Any]]:
        return self.run_op("notif", [str(limit)], timeout=60)

    # ---------------------------------------------------------------- writes
    def publish(
        self, op: str, args: List[str], dry: bool = False, confirm_run: bool = False
    ) -> Tuple[bool, Dict[str, Any]]:
        if op not in WRITE_OPS:
            return False, {"ok": False, "op": op, "code": "UNKNOWN_OP", "message": f"Op '{op}' is not a write op."}
        return self.run_op(op, args, dry=dry, confirm_run=confirm_run, timeout=120)

    # ------------------------------------------------------------ full poll
    def poll(self, topic_limit: int = 30, inbox_limit: int = 20, notif_limit: int = 20) -> Dict[str, Any]:
        """Read-only poll: me + list-topics + inbox + notif. Never publishes."""
        result: Dict[str, Any] = {
            "at": _now_iso(),
            "ok": False,
            "session": None,
            "topics": [],
            "inbox": [],
            "notif": [],
            "codes": {},
        }
        session = self.session_status()
        result["session"] = session
        result["codes"]["session"] = session.get("loginCode")

        if not session.get("loggedIn"):
            # Read ops require the logged-in session; anything else is skipped.
            return result

        for label, fn, lim in (
            ("list-topics", self.list_topics, topic_limit),
            ("inbox", self.inbox, inbox_limit),
            ("notif", self.notif, notif_limit),
        ):
            ok, data = fn(lim)
            result["codes"][label] = str(data.get("code") or ("OK" if ok else "OP_FAILED"))
            if ok:
                items = ((data.get("data") or {}).get("items")) or []
                if label == "list-topics":
                    result["topics"] = items
                elif label == "inbox":
                    result["inbox"] = items
                else:
                    result["notif"] = items

        result["ok"] = session.get("loggedIn") is True and result["codes"].get("list-topics") == "OK"
        return result


class ZbiornikMonitorService:
    """Runs polls, writes snapshot file, best-effort ingest push to Next (:3000)."""

    def __init__(self, manager: Optional[ZbiornikOpsManager] = None, snapshot_dir: str | None = None):
        self.manager = manager or ZbiornikOpsManager()
        self.snapshot_dir = snapshot_dir or os.environ.get(
            "ZBIORNIK_SNAPSHOT_DIR", os.path.join(os.getcwd(), "data", "zbiornik")
        )
        self.next_base = os.environ.get("DIRTYNEST_NEXT_URL", "http://127.0.0.1:3000")
        self._last_poll: Dict[str, Any] = {}
        self._lock = asyncio.Lock()

    @property
    def snapshot_path(self) -> str:
        return os.path.join(self.snapshot_dir, "poll-latest.json")

    async def poll(self) -> Dict[str, Any]:
        async with self._lock:
            result = await asyncio.to_thread(self.manager.poll)
            self._last_poll = result
            self._write_snapshot(result)
            await self._push_ingest(result)
            return self.public_snapshot()

    def poll_sync(self) -> Dict[str, Any]:
        """Synchronous variant used by cron job executor."""
        result = self.manager.poll()
        self._last_poll = result
        self._write_snapshot(result)
        # Ingest push is fire-and-forget in cron context; executed via asyncio loop if running.
        try:
            loop = asyncio.get_running_loop()
            loop.create_task(self._push_ingest(result))
        except RuntimeError:
            pass
        return self.public_snapshot()

    def _write_snapshot(self, result: Dict[str, Any]) -> None:
        try:
            os.makedirs(self.snapshot_dir, exist_ok=True)
            with open(self.snapshot_path, "w", encoding="utf-8") as f:
                json.dump(result, f, ensure_ascii=False)
        except Exception as e:  # noqa: BLE001
            logger.error("zbiornik snapshot write failed: %s", e)

    def public_snapshot(self) -> Dict[str, Any]:
        return {
            "at": self._last_poll.get("at"),
            "ok": self._last_poll.get("ok", False),
            "codes": self._last_poll.get("codes", {}),
            "counts": {
                "topics": len(self._last_poll.get("topics", [])),
                "inbox": len(self._last_poll.get("inbox", [])),
                "notif": len(self._last_poll.get("notif", [])),
            },
            "session": {
                "loginCode": (self._last_poll.get("session") or {}).get("loginCode"),
                "loggedIn": (self._last_poll.get("session") or {}).get("loggedIn"),
                "account": (self._last_poll.get("session") or {}).get("account"),
                "port": (self._last_poll.get("session") or {}).get("port"),
            },
            "topics": self._last_poll.get("topics", []),
            "inbox": self._last_poll.get("inbox", []),
            "notif": self._last_poll.get("notif", []),
        }

    async def _push_ingest(self, result: Dict[str, Any]) -> None:
        """Best-effort push to Next /api/zbiornik/ingest (1.5 s timeout, silent fail)."""
        try:
            import httpx

            async with httpx.AsyncClient(timeout=1.5) as client:
                await client.post(
                    f"{self.next_base}/api/zbiornik/ingest",
                    json={"source": "sidecar", "poll": result},
                )
        except Exception:  # noqa: BLE001
            pass  # Next may be down; snapshot file remains source of truth


zbiornik_manager = ZbiornikOpsManager()
zbiornik_monitor = ZbiornikMonitorService(zbiornik_manager)