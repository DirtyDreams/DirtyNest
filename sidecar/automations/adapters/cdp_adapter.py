"""CDP-based social adapter infrastructure (F7.2).

Implements ADR-0013 (CDP-first social integration) using the zbiornik-ops
pattern (docs/zbiornik-ops.md):

- connect-or-launch Chromium/Chrome with ``--remote-debugging-port``
- per operation: open a new tab at the target URL, drive it with
  ``Runtime.evaluate`` (in-page JS), close the tab
- single-line JSON results with zbiornik-style error codes:
  ``CDP_OFFLINE``, ``LOGIN_REQUIRED``, ``NOT_CONFIGURED``, ``OP_FAILED``
- mandatory dry_run defaulting True for publish (the HITL gate upstream in
  the Next.js dashboard approves a real send; this adapter refuses to drive
  the composer DOM unless ``dry_run=False`` is passed explicitly)
- config-driven: session dir / debug port / per-platform selectors come from
  environment (optionally a .env file via python-dotenv, already a sidecar
  dependency): SOCIAL_CDP_PORT, SOCIAL_CDP_MIN_INTERVAL_S, SOCIAL_CDP_BINARY
- selector candidates are lists; the first selector present in the DOM wins
  (real DOMs need calibration with a logged-in session later)

The transport (CDP HTTP + WebSocket) is isolated behind small private methods
(``_http_get_json``, ``_cdp_call``) so tests can inject a fake tab/evaluate
transport with no network access.
"""

from __future__ import annotations

import asyncio
import httpx
import json
import logging
import os
import time
import urllib.parse
import websockets
from abc import abstractmethod
from typing import Any, Dict, List, Optional, Tuple

from .base import SocialAdapter, normalize_result

logger = logging.getLogger("dirtynest.automations.adapters.cdp")

# Error codes, mirroring the zbiornik-ops contract (docs/zbiornik-ops.md §2).
CDP_OFFLINE = "CDP_OFFLINE"
LOGIN_REQUIRED = "LOGIN_REQUIRED"
OP_FAILED = "OP_FAILED"
NOT_CONFIGURED = "NOT_CONFIGURED"

# Default Chrome profile root — keeps logged-in sessions across runs. The
# operator logs in manually, once; this code never touches credentials.
DEFAULT_USER_DATA_DIR = os.path.join(os.path.expanduser("~"), ".dirtynest", "social-cdp")

# Load .env (python-dotenv is already a sidecar dependency) — best effort.
try:  # pragma: no cover - trivial env plumbing
    from dotenv import load_dotenv

    load_dotenv()
except Exception:  # noqa: BLE001
    pass


# --------------------------------------------------------------------------
# JS snippets executed inside the page via Runtime.evaluate
# --------------------------------------------------------------------------

def _js_probe(selectors: List[str]) -> str:
    """Return a JS expression mapping each selector to whether it exists."""
    sels_json = json.dumps(selectors)
    return (
        "(() => { const out = {}; const sels = " + sels_json + ";"
        " for (const s of sels) { try { out[s] = !!document.querySelector(s); }"
        " catch (e) { out[s] = false; } } return out; })()"
    )


def _js_login_wall() -> str:
    """Heuristic login-wall detection, best effort per platform."""
    return (
        "(() => {"
        " const t = document.title + ' ' + (document.body ? document.body.innerText : '');"
        " return /log ?in|sign ?in|zaloguj/i.test(t.slice(0, 2000));"
        "})()"
    )


def _js_fill(selector: str, text: str) -> str:
    """Fill the compose box via a synthetic paste event.

    Live calibration (X web composer on Chrome 151): execCommand('insertText')
    DOUBLES the text (Draft.js applies both the default-insert and the command
    path); a ClipboardEvent('paste') with a DataTransfer payload inserts
    exactly once. We clear any persisted draft first (X restores /compose/post
    drafts on reopen), then paste.
    """
    sel_json = json.dumps(selector)
    txt_json = json.dumps(text)
    return (
        "(() => { const el = document.querySelector(" + sel_json + ");"
        " if (!el) return 'NOT_FOUND';"
        " el.focus();"
        " if (el.isContentEditable) {"
        "  document.execCommand('selectAll', false, null);"
        "  document.execCommand('delete', false, null);"
        "  const dt = new DataTransfer();"
        "  dt.setData('text/plain', " + txt_json + ");"
        "  el.dispatchEvent(new ClipboardEvent('paste', { clipboardData: dt, bubbles: true, cancelable: true }));"
        " } else {"
        "  el.value = " + txt_json + ";"
        " }"
        " el.dispatchEvent(new Event('input', { bubbles: true }));"
        " el.dispatchEvent(new Event('change', { bubbles: true }));"
        " return 'TYPED'; })()"
    )


def _js_click(selector: str) -> str:
    return (
        "(() => { const el = document.querySelector(" + json.dumps(selector) + ");"
        " if (!el) return 'NOT_FOUND'; el.click(); return 'CLICKED'; })()"
    )


def _js_text(selectors: List[str]) -> str:
    """Read the trimmed text of the first matching selector."""
    return (
        "(() => { const sels = " + json.dumps(selectors) + ";"
        " for (const s of sels) { try { const el = document.querySelector(s);"
        " if (el) return (el.innerText || el.textContent || '').trim(); } catch (e) {} }"
        " return ''; })()"
    )


def _js_metrics(selectors: Dict[str, List[str]]) -> str:
    """Scrape integer metrics: for each metric key, first selector wins."""
    map_json = json.dumps(selectors)
    return (
        "(() => { const out = {}; const map = " + map_json + ";"
        " for (const key of Object.keys(map)) {"
        "  for (const s of map[key]) {"
        "   try { const el = document.querySelector(s);"
        "    if (el) { const num = parseInt((el.getAttribute('aria-label') ||"
        "      el.innerText || el.textContent || '').replace(/[^0-9]/g, ''), 10);"
        "     if (!isNaN(num)) { out[key] = num; break; } } } catch (e) {}"
        "  }"
        " } return out; })()"
    )


# --------------------------------------------------------------------------
# Base adapter
# --------------------------------------------------------------------------

class CdpSocialAdapter(SocialAdapter):
    """Shared CDP automation core for x/twitter, instagram, facebook, tiktok.

    Subclasses declare ``platform`` and build a config dict via
    ``default_config()``; everything else (transport, dry-run gate,
    rate limiting, error mapping, tab lifecycle) lives here.
    """

    platform = ""

    def __init__(self, config: Optional[Dict[str, Any]] = None) -> None:
        cfg = {**self.default_config(), **(config or {})}
        self.platform = cfg["platform"]
        self.compose_url_template: str = cfg["compose_url_template"]
        self.composer_selectors: List[str] = list(cfg.get("composer_selectors", []))
        self.publish_button_candidates: List[str] = list(cfg.get("publish_button_candidates", []))
        self.post_url_pattern: str = cfg.get("post_url_pattern", "")
        self.metrics_selectors: Dict[str, List[str]] = {
            k: list(v) for k, v in (cfg.get("metrics_selectors") or {}).items()
        }
        self.base_url: str = cfg.get("base_url", "")
        self.cdp_port: int = int(cfg.get("cdp_port") or os.environ.get("SOCIAL_CDP_PORT", "9333"))
        self.host: str = cfg.get("host", "127.0.0.1")
        self.user_data_dir: str = cfg.get("user_data_dir") or os.path.join(
            DEFAULT_USER_DATA_DIR, self.platform
        )
        self.chrome_binary: str = cfg.get("chrome_binary") or os.environ.get("SOCIAL_CDP_BINARY", "")
        self.min_action_interval: float = float(
            cfg.get("min_action_interval")
            if cfg.get("min_action_interval") is not None
            else os.environ.get("SOCIAL_CDP_MIN_INTERVAL_S", "10")
        )
        self._last_action_ts = 0.0

    # ------------------------------------------------------------------
    # Per-platform config contract
    # ------------------------------------------------------------------
    @abstractmethod
    def default_config(self) -> Dict[str, Any]:
        """Return the best-effort default config for this platform.

        Selectors are candidate lists (first DOM match wins) — they need
        calibration against a logged-in session later.
        """

    # ------------------------------------------------------------------
    # Transport layer — the ONLY methods that touch the network. Tests
    # monkeypatch these (fake tab / evaluate transport, no real CDP).
    # ------------------------------------------------------------------
    def _http_get_json(self, path: str) -> Any:
        """GET http://{host}:{port}{path} on the CDP HTTP API; None if unreachable."""
        try:
            resp = httpx.get(f"http://{self.host}:{self.cdp_port}{path}", timeout=2.5)
            resp.raise_for_status()
            return resp.json()
        except Exception:  # noqa: BLE001
            return None

    async def _cdp_call(self, ws_url: str, method: str, params: Dict[str, Any]) -> Any:
        """One CDP command over WebSocket; returns the result dict."""
        req_id = int(time.time() * 1000) % (10**9)
        async with websockets.connect(ws_url, close_timeout=2) as ws:
            await ws.send(json.dumps({"id": req_id, "method": method, "params": params}))
            while True:
                raw = await asyncio.wait_for(ws.recv(), timeout=15.0)
                msg = json.loads(raw)
                if msg.get("id") == req_id:
                    if msg.get("error"):
                        raise RuntimeError(f"CDP {method}: {msg['error']}")
                    return msg.get("result") or {}

    async def _trusted_click_type(self, ws_url: str, selector: str, text: str) -> str:
        """Real-CDP caret placement + Input.insertText (trusted input path).

        Synthetic ClipboardEvent/execCommand paths double or drop text in the
        X web composer (Draft.js + Chrome 151, live-calibrated 2026-08-29).
        Trusted CDP input (mouse click to place caret, then Input.insertText)
        inserts exactly once - same lesson as the FB trusted-input gate.
        """
        box = await self._cdp_call(
            ws_url, "Runtime.evaluate",
            {"returnByValue": True, "expression": (
                "(() => { const el = document.querySelector(" + json.dumps(selector) + ");"
                " if (!el) return null; el.focus();"
                " const r = el.getBoundingClientRect();"
                " return JSON.stringify({x: r.x + r.width/2, y: r.y + Math.min(r.height/2, 30)}); })()"
            )})
        raw = (box or {}).get("result", {}).get("value")
        if not raw:
            return "NOT_FOUND"
        pos = json.loads(raw)
        await self._cdp_call(ws_url, "Input.dispatchMouseEvent",
                             {"type": "mousePressed", "x": pos["x"], "y": pos["y"],
                              "button": "left", "clickCount": 1})
        await self._cdp_call(ws_url, "Input.dispatchMouseEvent",
                             {"type": "mouseReleased", "x": pos["x"], "y": pos["y"],
                              "button": "left", "clickCount": 1})
        await asyncio.sleep(0.3)
        # select-all + delete any persisted draft, then type fresh
        await self._cdp_call(ws_url, "Input.dispatchKeyEvent",
                             {"type": "rawKeyDown", "windowsVirtualKeyCode": 65, "code": "KeyA",
                              "modifiers": 2, "commands": ["selectAll"]})
        await self._cdp_call(ws_url, "Input.dispatchKeyEvent",
                             {"type": "keyDown", "windowsVirtualKeyCode": 46, "code": "Delete"})
        await self._cdp_call(ws_url, "Input.dispatchKeyEvent",
                             {"type": "keyUp", "windowsVirtualKeyCode": 46, "code": "Delete"})
        await self._cdp_call(ws_url, "Input.insertText", {"text": text})
        return "TYPED"

    def _launch_browser(self) -> bool:  # pragma: no cover - OS process
        """Spawn Chrome/Chromium with the debug port + persistent profile dir.

        Returns True when the process start was handed to the OS. The operator
        must log in manually inside that window (this code never logs in).
        """
        import subprocess

        binary = self.chrome_binary or (
            r"C:\Program Files\Google\Chrome\Application\chrome.exe"
            if os.name == "nt"
            else "chromium"
        )
        cmd = [
            binary,
            f"--remote-debugging-port={self.cdp_port}",
            f"--user-data-dir={self.user_data_dir}",
            "--no-first-run",
            "--no-default-browser-check",
            "about:blank",
        ]
        try:
            subprocess.Popen(cmd)
        except Exception:  # noqa: BLE001
            logger.exception("Failed to launch Chrome for %s", self.platform)
            return False
        return True

    def _ensure_browser(self) -> bool:
        """True when CDP is reachable; otherwise try launching once and wait
        briefly for the debug endpoint to come up."""
        if self._http_get_json("/json/version") is not None:
            return True
        if self._launch_browser():
            for _ in range(10):
                time.sleep(0.5)
                if self._http_get_json("/json/version") is not None:
                    return True
        return False

    # ------------------------------------------------------------------
    # Tab lifecycle (one tab per op, closed in finally)
    # ------------------------------------------------------------------
    def _new_tab(self, url: str) -> Tuple[Optional[str], Optional[str]]:
        """Open a new CDP tab at url -> (webSocketDebuggerUrl, tab_id).

        Chrome >= 128 answers /json/new only via PUT (405 on GET); older
        builds accepted GET. Try PUT first, fall back to GET.
        """
        # GET first (older Chrome; also the test seam), escalate to PUT on
        # Chrome >= 128 where /json/new answers 405 to GET.
        target = self._http_get_json("/json/new?" + urllib.parse.quote(url, safe=""))
        if not isinstance(target, dict) or not target.get("webSocketDebuggerUrl"):
            target = self._http_put_json("/json/new?" + urllib.parse.quote(url, safe=""))
        if not isinstance(target, dict) or not target.get("webSocketDebuggerUrl"):
            return None, None
        return target["webSocketDebuggerUrl"], target.get("id")

    def _http_put_json(self, path: str) -> Any:
        """PUT http://{host}:{port}{path} on the CDP HTTP API; None if unreachable."""
        try:
            resp = httpx.put(f"http://{self.host}:{self.cdp_port}{path}", timeout=5.0)
            resp.raise_for_status()
            return resp.json()
        except Exception:  # noqa: BLE001
            return None

    def _close_tab(self, tab_id: str) -> None:
        if not tab_id:
            return
        try:
            self._http_get_json(f"/json/close/{tab_id}")
        except Exception:  # noqa: BLE001
            pass

    # ------------------------------------------------------------------
    # In-page evaluation
    # ------------------------------------------------------------------
    def _eval(self, ws_url: str, expression: str) -> Any:
        """Runtime.evaluate with returnByValue=True; unwrapped value or None.

        Synchronous wrapper around the async WebSocket call; safe to call from
        sync adapter code and trivially mocked in tests.
        """
        import asyncio

        try:
            result = asyncio.run(
                self._cdp_call(
                    ws_url,
                    "Runtime.evaluate",
                    {"expression": expression, "returnByValue": True},
                )
            )
        except Exception:  # noqa: BLE001 — transport/timeout/eval error -> None
            return None
        if not result or result.get("exceptionDetails"):
            return None
        return (result.get("result") or {}).get("value")

    # ------------------------------------------------------------------
    # Rate-limit guard — adapter-level tempo floor (zb_rules still governs
    # upstream; this is a hard stop against bursts inside one process).
    # ------------------------------------------------------------------
    def _rate_limit_wait(self) -> float:
        """Seconds until the next action is allowed (0 = allowed now)."""
        elapsed = time.time() - self._last_action_ts
        if elapsed >= self.min_action_interval:
            return 0.0
        return round(self.min_action_interval - elapsed, 2)

    def _mark_action(self) -> None:
        self._last_action_ts = time.time()

    def _err(self, code: str, message: str) -> Dict[str, Any]:
        return {"ok": False, "platform_post_id": None, "error": f"{code}: {message}", "code": code}

    def _compose_url(self, kwargs: Dict[str, Any]) -> str:
        url = kwargs.get("compose_url") or self.compose_url_template
        return url.replace("{base_url}", self.base_url)

    # ==================================================================
    # SocialAdapter contract
    # ==================================================================
    def publish(self, text: str, dry_run: bool = True, **kwargs: Any) -> Dict[str, Any]:
        """Publish via the platform's web composer.

        ``dry_run`` DEFAULTS TO TRUE (mandatory flag): a real send requires
        dry_run=False explicitly. HITL approval happens upstream in
        Next.js /api/social; this adapter never auto-publishes (e.g. from
        cron regardless — scheduler must pass dry_run explicitly too).
        """
        if not text or not str(text).strip():
            return self._err(OP_FAILED, "empty text")
        if not self.composer_selectors:
            return self._err(NOT_CONFIGURED, "no composer selectors configured")

        if dry_run:
            return self._publish_dry_run(text, **kwargs)
        return self._publish_confirm(text, **kwargs)

    # ------------------------------------------------------- dry run path
    def _publish_dry_run(self, text: str, **kwargs: Any) -> Dict[str, Any]:
        """Parse and validate WITHOUT touching CDP at all (zero side effects)."""
        composer_sel = self.composer_selectors[0]
        button_sel = self.publish_button_candidates[0] if self.publish_button_candidates else None
        preview = {
            "platform": self.platform,
            "op": "publish",
            "dry_run": True,
            "text": str(text),
            "compose_url": self._compose_url(kwargs),
            "wouldUse": {
                "composerSelector": composer_sel,
                "publishButton": button_sel,
                "postUrlPattern": self.post_url_pattern,
            },
        }
        return {
            "ok": True,
            "platform_post_id": None,
            "error": None,
            "data": preview,
            "message": "dry-run: validated payload, nothing sent",
            "code": "DRY_RUN",
        }

    # ---------------------------------------------------- confirmed path
    def _publish_confirm(self, text: str, **kwargs: Any) -> Dict[str, Any]:
        wait = self._rate_limit_wait()
        if wait > 0:
            return self._err(
                OP_FAILED,
                f"rate limit: next action allowed in {wait:.1f}s "
                f"(min gap {self.min_action_interval:.0f}s)",
            )
        self._mark_action()  # every confirm attempt counts toward the tempo floor

        if not self._ensure_browser():
            return self._err(CDP_OFFLINE, f"no Chrome on CDP port {self.cdp_port}")

        ws_url, tab_id = self._new_tab(self._compose_url(kwargs))
        if not ws_url:
            return self._err(CDP_OFFLINE, "cannot open composer tab via CDP")

        try:
            time.sleep(2.0)  # let the composer page settle
            flags = self._eval(ws_url, _js_probe(self.composer_selectors))
            composer_sel = first_match(self.composer_selectors, flags)
            if composer_sel is None:
                wall = self._eval(ws_url, _js_login_wall())
                if wall:
                    return self._err(
                        LOGIN_REQUIRED, "compose page shows a login wall (log in manually in the CDP Chrome window)"
                    )
                return self._err(OP_FAILED, "composer box not found; selectors need calibration")

            typed_result = self._trusted_click_type(ws_url, composer_sel, text)
            typed = asyncio.run(typed_result) if hasattr(typed_result, "__await__") else typed_result
            if typed != "TYPED":
                return self._err(OP_FAILED, f"failed to type into composer ({composer_sel})")

            btn_flags = self._eval(ws_url, _js_probe(self.publish_button_candidates))
            button_sel = first_match(self.publish_button_candidates, btn_flags)
            if button_sel is None:
                return self._err(OP_FAILED, "publish button not found; selectors need calibration")

            clicked = self._eval(ws_url, _js_click(button_sel))
            if clicked not in ("CLICKED", True):
                return self._err(OP_FAILED, f"failed to click publish button ({button_sel})")

            pid = None
            if self.post_url_pattern:
                time.sleep(1.5)  # redirect to the post permalink
                pid = self._extract_post_id(ws_url)
                if pid is None:
                    return self._err(
                        OP_FAILED, "publish submitted but post id could not be confirmed from URL"
                    )
            self._mark_action()
            return normalize_result(True, pid, None)
        finally:
            self._close_tab(tab_id)

    def _extract_post_id(self, ws_url: str) -> Optional[str]:
        """Read location.href inside the tab and extract the post id."""
        href = self._eval(ws_url, "window.location.href")
        if isinstance(href, str) and href:
            return self._extract_id_from_url(href)
        return None

    def _post_id_regex(self):
        """Derive a regex from post_url_pattern: '{base_url}' matches loosely
        (so an implicit handle/name segment before it is tolerated), '{id}'
        captures the id. Returns None when no '{id}' placeholder exists."""
        import re

        pattern = (self.post_url_pattern or "").replace("{base_url}", "")
        if "{id}" not in pattern:
            return None
        head, _, tail = pattern.partition("{id}")
        head_seg = head.strip("/")
        if head_seg:
            head_rx = re.escape(head_seg) + "/"
        else:
            head_rx = ""
        regex = r"https?://[^\"'\s]*?" + head_rx + r"([A-Za-z0-9_-]+)"
        if tail and tail != "/":
            regex += re.escape(tail)
        elif tail == "/":
            regex += "/?"
        return re.compile(regex)

    def _extract_id_from_url(self, url: str) -> Optional[str]:
        """Extract the post id from a permalink URL using post_url_pattern."""
        regex = self._post_id_regex()
        if regex is None:
            return None
        m = regex.search(url or "")
        return m.group(1) if m else None

    def _match_post_url(self, url: str) -> Optional[str]:
        """Match a URL against post_url_pattern -> extracted id or None."""
        return self._extract_id_from_url(url)

    # ------------------------------------------------------------- verify
    def verify(self, platform_post_id: str) -> Dict[str, Any]:
        """Open the post permalink and check the tab reaches the post URL.

        Error shape matches publish: ``code`` carries the zbiornik-style code
        (CDP_OFFLINE / LOGIN_REQUIRED / OP_FAILED / NOT_CONFIGURED).
        """
        if not platform_post_id:
            return {"ok": False, "exists": False, "error": f"{OP_FAILED}: empty post id", "code": OP_FAILED}
        if not self.post_url_pattern:
            # Unverifiable without an embeddable public URL: report honestly.
            return {
                "ok": False,
                "exists": False,
                "error": f"{NOT_CONFIGURED}: no post_url_pattern for {self.platform}",
                "code": NOT_CONFIGURED,
            }

        if not self._ensure_browser():
            return {
                "ok": False,
                "exists": False,
                "error": f"{CDP_OFFLINE}: no Chrome on CDP port {self.cdp_port}",
                "code": CDP_OFFLINE,
            }

        url = self._post_url(platform_post_id)
        ws_url, tab_id = self._new_tab(url)
        if not ws_url:
            return {
                "ok": False,
                "exists": False,
                "error": f"{CDP_OFFLINE}: cannot open tab via CDP",
                "code": CDP_OFFLINE,
            }
        try:
            time.sleep(2.0)
            href = self._eval(ws_url, "window.location.href")
            extracted = self._match_post_url(href or "") if isinstance(href, str) else None
            if extracted is None:
                if self._eval(ws_url, _js_login_wall()):
                    return {
                        "ok": False,
                        "exists": False,
                        "error": f"{LOGIN_REQUIRED}: post page shows a login wall",
                        "code": LOGIN_REQUIRED,
                    }
                return {
                    "ok": False,
                    "exists": False,
                    "error": f"{OP_FAILED}: post URL did not resolve (got {str(href)[:120]!r})",
                    "code": OP_FAILED,
                }
            if extracted != platform_post_id:
                return {
                    "ok": False,
                    "exists": False,
                    "error": f"{OP_FAILED}: URL resolved to a different post ({extracted})",
                    "code": OP_FAILED,
                }
            if self._eval(ws_url, _js_login_wall()):
                return {
                    "ok": False,
                    "exists": False,
                    "error": f"{LOGIN_REQUIRED}: post page shows a login wall",
                    "code": LOGIN_REQUIRED,
                }
            return {"ok": True, "exists": True, "error": None}
        finally:
            self._close_tab(tab_id)

    def _post_url(self, platform_post_id: str) -> str:
        url = (self.post_url_pattern or "").replace("{base_url}", self.base_url)
        return url.replace("{id}", str(platform_post_id)).replace("{post_id}", str(platform_post_id))

    # ------------------------------------------------------------- metrics
    def metrics(self, platform_post_id: str) -> Dict[str, Any]:
        """Scrape engagement counters off the post permalink page."""
        zero = {"reach": 0, "engagement": 0, "likes": 0, "comments": 0, "shares": 0}
        if not platform_post_id:
            return zero
        if not self.metrics_selectors:
            return zero
        if not self._ensure_browser():
            return zero
        url = self._post_url(platform_post_id)
        ws_url, tab_id = self._new_tab(url)
        if not ws_url:
            return zero
        try:
            time.sleep(2.0)
            values = self._eval(ws_url, _js_metrics(self.metrics_selectors))
            if not isinstance(values, dict):
                return zero
        finally:
            self._close_tab(tab_id)
        likes = int(values.get("likes") or 0)
        comments = int(values.get("comments") or 0)
        shares = int(values.get("shares") or 0)
        views = int(values.get("reach") or 0)
        return {
            "reach": views,
            "engagement": likes + comments + shares,
            "likes": likes,
            "comments": comments,
            "shares": shares,
        }


def first_match(selectors: List[str], dom_flags: Any) -> Optional[str]:
    """First selector flagged present in the DOM map (first match wins)."""
    if not isinstance(dom_flags, dict) or not selectors:
        return None
    for sel in selectors:
        if dom_flags.get(sel):
            return sel
    return None