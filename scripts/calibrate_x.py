#!/usr/bin/env python
"""Calibrate X adapter: read-only DOM inspection via CDP (no typing, no clicks).

Usage: sidecar/.venv/Scripts/python.exe scripts/calibrate_x.py
"""
import json
import sys
import urllib.request

sys.path.insert(0, "sidecar")
CDP_HTTP = "http://127.0.0.1:9333"


def http_json(method, path, payload=None):
    req = urllib.request.Request(
        CDP_HTTP + path, method=method,
        data=json.dumps(payload).encode() if payload else None,
        headers={"Content-Type": "application/json"})
    with urllib.request.urlopen(req, timeout=10) as r:
        return json.loads(r.read().decode() or "{}")


def main() -> None:
    from websockets.sync.client import connect

    # reuse or open tab
    tab_id = None
    try:
        info = json.load(open("scripts/_x_probe_tab.json"))
        tab_id = info.get("tab_id")
    except Exception:
        pass

    target = next((t for t in http_get_tabs() if t.get("id") == tab_id and t["type"] == "page"), None)
    if not target:
        opened = http_new_tab("https://x.com/home")
        import time; time.sleep(6)
        target = next((t for t in http_get_tabs() if t.get("id") == opened.get("id")), opened)
        json.dump({"tab_id": target["id"]}, open("scripts/_x_probe_tab.json", "w"))

    ws_url = target["webSocketDebuggerUrl"]
    print("tab:", target["id"], target["url"][:80])

    eval_js = """
    JSON.stringify({
        url: location.href,
        loggedIn: !!document.querySelector('[data-testid="SideNav_AccountSwitcher_Button"]'),
        composer_inline: !!document.querySelector('[data-testid="tweetTextarea_0"]'),
        composer_rich: !!document.querySelector('[data-testid="tweetTextarea_0RichTextInputContainer"]'),
        inline_btn: !!document.querySelector('[data-testid="tweetButtonInline"]'),
        fab_btn: !!document.querySelector('a[data-testid="SideNav_NewTweet_Button"], a[aria-label="Post"][href="/compose/post"]'),
        nav_home_btn: !!document.querySelector('[data-testid="AppTabBar_Home_Link"]'),
        login_btn: !!document.querySelector('[data-testid="loginButton"]'),
        account_nick: (document.querySelector('[data-testid="SideNav_AccountSwitcher_Button"]')?.textContent || '').slice(0, 90).replace(/[\\n\\s]+/g, ' ').trim(),
        user_cells_sample: Array.from(document.querySelectorAll('[data-testid="UserCell"]')).length
    })
    """

    def evaluate(expr):
        ws_url_send = json.dumps({"id": 7, "method": "Runtime.evaluate",
                                  "params": {"expression": expr, "returnByValue": True}})
        with __import__("websockets.sync.client", fromlist=["connect"]).connect(ws_url, max_size=None) as ws:
            ws.send(ws_url_send)
            import time
            for _ in range(40):
                msg = json.loads(ws.recv(timeout=10))
                if msg.get("id") == 7:
                    return msg["result"]["result"].get("value")
        return None

    import time
    for attempt in range(4):
        raw = evaluate(eval_js)
        state_probe = json.loads(raw)
        if state_probe.get("loggedIn") or state_probe.get("login_btn"):
            break
        time.sleep(3)
    raw = evaluate(eval_js)
    state = json.loads(raw)
    print(json.dumps(state, indent=2))
    print("VERDICT:", "LOGGED-IN" if state.get("loggedIn") else "NOT LOGGED IN")

    inv = evaluate("""
    (function(){
      const ids = Array.from(document.querySelectorAll('[data-testid]')).map(el => el.getAttribute('data-testid'));
      const uniq = Array.from(new Set(ids));
      window.__dump = JSON.stringify({count: uniq.length, relevant: uniq.filter(t => /tweet|.SideNav|compose|Post|Timeline/i.test(t)).slice(0, 40)});
      return window.__dump;
    })()
    """) or evaluate("window.__dump")
    print("TESTIDS:", inv)


def http_get_tabs():
    with urllib.request.urlopen(CDP_HTTP + "/json", timeout=10) as r:
        return json.loads(r.read().decode())


def http_new_tab(url):
    with urllib.request.urlopen(f"{CDP_HTTP}/json/new?{url}", timeout=10) as r:
        return json.loads(r.read().decode())


if __name__ == "__main__":
    main()
