import asyncio
import json
import logging
import os
import time
from typing import Dict, List, Optional, Any
import httpx
import websockets

logger = logging.getLogger("dirtynest-cdp")

class ChromeCdpEngine:
    def __init__(self, cdp_port: int = 9333):
        self.cdp_port = cdp_port
        self.base_url = f"http://127.0.0.1:{cdp_port}"
        self.last_screenshot_b64: Optional[str] = None
        self.current_url: str = "about:blank"
        self.current_title: str = "No Active Tab"

    async def get_status(self) -> Dict[str, Any]:
        # Try configured port, fallback to 9222 if closed
        ports_to_try = [self.cdp_port, 9222, 9333]
        
        for port in ports_to_try:
            try:
                async with httpx.AsyncClient(timeout=1.5) as client:
                    res = await client.get(f"http://127.0.0.1:{port}/json/version")
                    if res.status_code == 200:
                        data = res.json()
                        self.cdp_port = port
                        self.base_url = f"http://127.0.0.1:{port}"
                        
                        # Get active tabs
                        tabs_res = await client.get(f"http://127.0.0.1:{port}/json/list")
                        tabs = tabs_res.json() if tabs_res.status_code == 200 else []
                        page_tabs = [t for t in tabs if t.get("type") == "page"]
                        
                        if page_tabs:
                            self.current_url = page_tabs[0].get("url", self.current_url)
                            self.current_title = page_tabs[0].get("title", self.current_title)
                            
                        return {
                            "is_connected": True,
                            "port": port,
                            "browser": data.get("Browser", "Chrome"),
                            "webSocketDebuggerUrl": data.get("webSocketDebuggerUrl"),
                            "active_tabs": len(page_tabs),
                            "current_url": self.current_url,
                            "current_title": self.current_title,
                            "last_screenshot": self.last_screenshot_b64 is not None
                        }
            except Exception:
                continue
                
        return {
            "is_connected": False,
            "port": self.cdp_port,
            "browser": "Offline",
            "active_tabs": 0,
            "current_url": self.current_url,
            "current_title": self.current_title,
            "last_screenshot": self.last_screenshot_b64 is not None
        }

    async def get_active_tab_ws(self) -> Optional[str]:
        try:
            async with httpx.AsyncClient(timeout=2.0) as client:
                res = await client.get(f"{self.base_url}/json/list")
                if res.status_code == 200:
                    tabs = res.json()
                    page_tabs = [t for t in tabs if t.get("type") == "page"]
                    if page_tabs:
                        return page_tabs[0].get("webSocketDebuggerUrl")
        except Exception as e:
            logger.warning(f"Failed to fetch CDP tabs list: {e}")
        return None

    async def send_cdp_command(self, method: str, params: Optional[Dict[str, Any]] = None) -> Dict[str, Any]:
        ws_url = await self.get_active_tab_ws()
        if not ws_url:
            # Emulated / Mock execution if no active Chrome CDP port is listening
            return await self._emulate_cdp_command(method, params or {})
            
        params = params or {}
        req_id = int(time.time() * 1000)
        
        try:
            async with websockets.connect(ws_url, close_timeout=2) as ws:
                payload = json.dumps({
                    "id": req_id,
                    "method": method,
                    "params": params
                })
                await ws.send(payload)
                
                # Wait for matching response
                for _ in range(15):
                    raw_msg = await asyncio.wait_for(ws.recv(), timeout=3.0)
                    msg = json.loads(raw_msg)
                    if msg.get("id") == req_id:
                        return msg.get("result", {})
        except Exception as e:
            logger.error(f"CDP command {method} failed: {e}")
            return await self._emulate_cdp_command(method, params)
            
        return {}

    async def navigate(self, url: str) -> Dict[str, Any]:
        self.current_url = url
        self.current_title = f"Inspecting {url}"
        res = await self.send_cdp_command("Page.navigate", {"url": url})
        return {"status": "navigated", "url": url, "frame_id": res.get("frameId", "frame-main")}

    async def capture_screenshot(self) -> Dict[str, Any]:
        res = await self.send_cdp_command("Page.captureScreenshot", {"format": "png", "quality": 80})
        b64_data = res.get("data")
        if b64_data:
            self.last_screenshot_b64 = b64_data
        return {
            "status": "captured",
            "format": "png",
            "data": b64_data,
            "url": self.current_url
        }

    async def extract_dom(self, selector: Optional[str] = None) -> Dict[str, Any]:
        expression = f"document.querySelector('{selector}').innerText" if selector else "document.title + '\\n' + document.body.innerText.substring(0, 2000)"
        res = await self.send_cdp_command("Runtime.evaluate", {
            "expression": expression,
            "returnByValue": True
        })
        value = res.get("result", {}).get("value", "")
        return {
            "status": "extracted",
            "selector": selector or "body",
            "text": value,
            "url": self.current_url
        }

    async def click_element(self, selector: str) -> Dict[str, Any]:
        expression = f"(() => {{ const el = document.querySelector('{selector}'); if (el) {{ el.click(); return 'CLICKED'; }} return 'NOT_FOUND'; }})()"
        res = await self.send_cdp_command("Runtime.evaluate", {
            "expression": expression,
            "returnByValue": True
        })
        val = res.get("result", {}).get("value", "UNKNOWN")
        return {"status": "executed", "action": "click", "selector": selector, "result": val}

    async def type_text(self, selector: str, text: str) -> Dict[str, Any]:
        safe_text = text.replace("'", "\\'")
        expression = f"(() => {{ const el = document.querySelector('{selector}'); if (el) {{ el.value = '{safe_text}'; el.dispatchEvent(new Event('input', {{ bubbles: true }})); return 'TYPED'; }} return 'NOT_FOUND'; }})()"
        res = await self.send_cdp_command("Runtime.evaluate", {
            "expression": expression,
            "returnByValue": True
        })
        val = res.get("result", {}).get("value", "UNKNOWN")
        return {"status": "executed", "action": "type", "selector": selector, "text": text, "result": val}

    async def eval_script(self, script: str) -> Dict[str, Any]:
        res = await self.send_cdp_command("Runtime.evaluate", {
            "expression": script,
            "returnByValue": True
        })
        val = res.get("result", {}).get("value")
        return {"status": "evaluated", "result": val}

    async def _emulate_cdp_command(self, method: str, params: Dict[str, Any]) -> Dict[str, Any]:
        """Fallback simulation when Chrome CDP port is temporarily offline."""
        logger.info(f"[CDP EMULATOR] Method: {method} with params: {params}")
        if method == "Page.navigate":
            return {"frameId": "sim-frame-1"}
        elif method == "Page.captureScreenshot":
            # Tiny 1x1 transparent PNG fallback base64
            mock_png = "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+A8AAQUBAScY42YAAAAASUVORK5CYII="
            return {"data": self.last_screenshot_b64 or mock_png}
        elif method == "Runtime.evaluate":
            expr = params.get("expression", "")
            return {"result": {"value": f"[SIMULATED EVAL] Executed: {expr[:60]}"}}
        return {}

# Global Singleton
cdp_engine = ChromeCdpEngine()
