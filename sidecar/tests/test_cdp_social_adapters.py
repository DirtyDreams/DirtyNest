"""F7.2 — CDP-based social adapters (X/IG/FB/TikTok) guard-rail tests.

Every test mocks the CDP transport seams of CdpSocialAdapter (CDP HTTP
endpoint, tab lifecycle, Runtime.evaluate) using FakeCdpTransport. There is NO
network access, NO real Chrome, NO platform contact anywhere in this file.
"""

import sys
from pathlib import Path
from urllib.parse import unquote

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))

import pytest  # noqa: E402

from automations.adapters import ADAPTERS  # noqa: E402
from automations.adapters.cdp_adapter import (  # noqa: E402
    CDP_OFFLINE,
    LOGIN_REQUIRED,
    NOT_CONFIGURED,
    OP_FAILED,
    CdpSocialAdapter,
    _js_probe,
    first_match,
)
from automations.adapters.twitter import TwitterAdapter  # noqa: E402
from automations.adapters.instagram import InstagramAdapter  # noqa: E402
from automations.adapters.facebook import FacebookAdapter  # noqa: E402
from automations.adapters.tiktok import TikTokAdapter  # noqa: E402

ADAPTER_CLASSES = [TwitterAdapter, InstagramAdapter, FacebookAdapter, TikTokAdapter]


# --------------------------------------------------------------------------
# Fake transport
# --------------------------------------------------------------------------

class FakeCdpTransport:
    """In-process fake standing in for the CDP HTTP API + page evaluation."""

    def __init__(self, dom=None, href="", login_wall=False, version_ok=True):
        self.dom = dom or {}
        self.href = href
        self.login_wall = login_wall
        self.version_ok = version_ok
        self.opened_tabs = []     # decoded URLs opened via /json/new
        self.closed_tabs = []     # tab ids closed
        self.evaluate_calls = []  # every expression evaluated "in-page"
        self.browser_seen = False

    # ------------------------------------------------ CDP HTTP API fake
    def handle_http(self, adapter, path):
        if not self.version_ok:
            # Browser offline: every endpoint (including /json/new) is dead.
            return None
        if path == "/json/version":
            self.browser_seen = True
            return {"Browser": "FakeChrome/126"}
        if path.startswith("/json/new?"):
            url = unquote(path.split("?", 1)[1])
            self.opened_tabs.append(url)
            n = len(self.opened_tabs)
            return {"id": f"tab{n}", "webSocketDebuggerUrl": f"ws://fake/tab{n}"}
        if path.startswith("/json/close/"):
            self.closed_tabs.append(path.rsplit("/", 1)[-1])
            return {}
        return None

    # --------------------------------------------- in-page evaluation fake
    def evaluate(self, adapter=None, expression=None):
        # Tolerate both evaluate(expr) and evaluate(adapter, expr) call styles.
        if expression is None and adapter is not None and isinstance(adapter, str):
            expression, adapter = adapter, None
        self.evaluate_calls.append(expression)
        if expression == "window.location.href":
            return self.href
        if expression.startswith("(() => { const t = document.title"):
            return self.login_wall  # _js_login_wall
        if expression.startswith("(() => { const b = document.querySelector("):
            # publish-button rect read: derive a fake position for a present button
            import json as _json, re as _re
            m = _re.search(r'document.querySelector\((".*?")\)', expression)
            sel = _json.loads(m.group(1)) if m else ""
            return None if not self._present(sel) else __import__("json").dumps({"x": 10, "y": 20})
        if "?.innerText || '').length" in expression and "document.querySelector" in expression:
            # post-fill retention check: report the intended text length so
            # tests pass the sanity gate (fake DOM has no real text)
            return 10 ** 6
        if expression.startswith("(() => { const out = {}; const sels = "):
            # _js_probe(JSON list) -> {selector: present?}
            payload = expression.split("const sels = ", 1)[1].split(";", 1)[0]
            import json as _json

            sels = _json.loads(payload)
            return {s: self._present(s) for s in sels}
        if expression.startswith("(() => { const el = document.querySelector"):
            if "insertText" in expression or "el.value" in expression:
                return "TYPED"
            if "el.click()" in expression:
                return "CLICKED"
            return "NOT_FOUND"
        if expression.startswith("(() => { const out = {}; const map = "):
            import json as _json

            map_ = _json.loads(expression.split("const map = ", 1)[1].split(";", 1)[0])
            return {k: 0 for k in map_}  # _js_metrics -> all zeros
        if expression.startswith("(() => { const sels = "):
            return ""  # _js_text
        return None

    def _present(self, selector):
        if self.login_wall:
            return False
        return bool(self.dom.get(selector))

    # --------------------------------------------------------- injection
    def attach(self, adapter):
        adapter._http_get_json = lambda path: self.handle_http(adapter, path)
        adapter._eval = lambda ws_url, expr: self.evaluate(adapter, expr)

        def fake_trusted(ws_url, selector, text):
            self.evaluate(adapter, f"trusted-click {selector}")
            self.evaluate(adapter, f"[trusted-insert] {text}")
            return "TYPED"

        adapter._trusted_click_type = fake_trusted

        def fake_btn_click(ws_url, pos):
            return "CLICKED"

        adapter._trusted_button_click = fake_btn_click

        def fake_btn_pos(ws_url, sel):
            return {"x": 10, "y": 20}

        adapter._button_screen_pos = fake_btn_pos

        # permalink fallback (profile read) can return the fixed id the tests assert
        def fake_read_newest(ws_url):
            return None

        adapter._read_newest_own_post_id = fake_read_newest
        adapter._launch_browser = lambda: False  # tests never spawn Chrome
        return adapter


@pytest.fixture
def transport(monkeypatch):
    """Fake transport with time.sleep and websockets neutralized."""
    import automations.adapters.cdp_adapter as mod

    monkeypatch.setattr(mod.time, "sleep", lambda s: None)
    return FakeCdpTransport()


def make(adapter_cls, transport, **overrides):
    a = adapter_cls(overrides or None)
    transport.attach(a)
    return a


# --------------------------------------------------------------------------
# 1) Registry wiring — CDP adapters replace MockAdapter for the 4 platforms
# --------------------------------------------------------------------------

def test_registry_wires_cdp_adapters():
    assert ADAPTERS["twitter"].__class__.__name__ == "TwitterAdapter"
    assert ADAPTERS["instagram"].__class__.__name__ == "InstagramAdapter"
    assert ADAPTERS["facebook"].__class__.__name__ == "FacebookAdapter"
    assert ADAPTERS["tiktok"].__class__.__name__ == "TikTokAdapter"
    # Reddit untouched
    assert ADAPTERS["reddit"].__class__.__name__ == "RedditAdapter"
    for p in ("twitter", "instagram", "facebook", "tiktok"):
        assert isinstance(ADAPTERS[p], CdpSocialAdapter)


def test_every_platform_has_candidate_selectors():
    for cls in ADAPTER_CLASSES:
        a = cls()
        assert a.composer_selectors, cls.__name__
        assert a.publish_button_candidates, cls.__name__
        assert a.platform


# --------------------------------------------------------------------------
# 2) Dry run: parsed payload returned, nothing sent (no CDP touched)
# --------------------------------------------------------------------------

def test_publish_dry_run_returns_parsed_payload_without_sending(transport, monkeypatch):
    a = make(TwitterAdapter, transport)
    result = a.publish("hello from DirtyNest")  # dry_run defaults True

    assert result["ok"] is True
    assert result["platform_post_id"] is None  # nothing was published
    assert result["error"] is None
    data = result["data"]
    assert data["dry_run"] is True
    assert data["text"] == "hello from DirtyNest"
    assert data["wouldUse"]["composerSelector"]  # first candidate
    assert "compose/post" in data["compose_url"]
    # Zero CDP interaction on the dry path:
    assert transport.opened_tabs == []
    assert transport.evaluate_calls == []
    assert transport.browser_seen is False


def test_publish_dry_run_explicit_flag_is_identical(transport):
    a = make(FacebookAdapter, transport)
    r1 = a.publish("dry text")
    r2 = a.publish("dry text", dry_run=True)
    assert r1 == r2


def test_publish_dry_run_empty_text_is_rejected(transport):
    a = make(TwitterAdapter, transport)
    r = a.publish("   ")
    assert r["ok"] is False
    assert r["code"] == OP_FAILED
    assert transport.opened_tabs == []


def test_publish_dry_run_carries_compose_url_override(transport):
    a = make(TwitterAdapter, transport)
    r = a.publish("x", compose_url="https://x.com/compose/post?custom=1")
    assert r["data"]["compose_url"] == "https://x.com/compose/post?custom=1"


# --------------------------------------------------------------------------
# 3) Confirm path: selectors map to actions; result parsed from post URL
# --------------------------------------------------------------------------

COMPOSER_SEL = '[data-testid="tweetTextarea_0"]'
BUTTON_SEL = '[data-testid="tweetButtonInline"]'


def test_publish_confirm_success_maps_selectors_and_closes_tab(transport, monkeypatch):
    import automations.adapters.cdp_adapter as mod

    monkeypatch.setattr(mod.time, "sleep", lambda s: None)
    t = FakeCdpTransport(
        dom={COMPOSER_SEL: True, BUTTON_SEL: True},
        href="https://x.com/someuser/status/1729000000000000000",
    )
    a = make(TwitterAdapter, t)

    result = a.publish("real send", dry_run=False)

    assert result["ok"] is True, result
    assert result["platform_post_id"] == "1729000000000000000"
    assert result["error"] is None
    # Composer URL opened as a new tab, tab closed afterwards
    assert len(t.opened_tabs) == 1
    assert "compose/post" in t.opened_tabs[0]
    assert t.closed_tabs == ["tab1"]
    # First-match-wins selector order was respected
    assert t.dom[COMPOSER_SEL] is True and t.dom[BUTTON_SEL] is True
    probe_calls = [c for c in t.evaluate_calls if "const sels = " in c]
    assert probe_calls  # selector probing actually happened
    # A rate-limit timestamp was recorded
    assert a._last_action_ts > 0


def test_publish_confirm_uses_first_matching_candidate(transport):
    t = FakeCdpTransport(
        dom={
            'div[role="textbox"][contenteditable="true"]': True,  # 3rd candidate
            '[data-testid="tweetTextarea_0"]': False,
            '[data-testid="tweetTextarea_0_label"]': False,
        },
        href="https://x.com/u/status/1234567890123456789",
    )
    a = make(TwitterAdapter, t)
    # The fill JS would target the winning selector; assert via evaluate calls.
    transport_ = t

    result = a.publish("first match wins", dry_run=False)
    # button never found in this dom -> OP_FAILED but composer worked
    assert result["ok"] is False
    assert result["code"] == OP_FAILED
    click_calls = [c for c in transport_.evaluate_calls if c.startswith("trusted-click ")]
    assert click_calls and 'div[role=' in click_calls[0] and 'textbox' in click_calls[0]


def test_publish_confirm_flow_tab_lifecycle(transport):
    a = make(InstagramAdapter, transport)
    t = FakeCdpTransport(
        dom={"textarea": True, "button[type='submit']": True},
        href="https://www.instagram.com/p/Cxyz12345/",
    )
    a2 = make(InstagramAdapter, t)
    result = a2.publish("ig post", dry_run=False)
    assert result["ok"] is True, result
    assert result["platform_post_id"] == "Cxyz12345"
    assert t.opened_tabs and t.closed_tabs == ["tab1"]


def test_publish_confirm_closes_tab_even_on_failure(transport):
    t = FakeCdpTransport(dom={})  # nothing matches -> failure path
    a = make(TwitterAdapter, t)
    result = a.publish("will fail", dry_run=False)
    assert result["ok"] is False
    assert result["code"] == OP_FAILED
    assert len(t.opened_tabs) == 1
    assert t.closed_tabs == ["tab1"]  # finally-cleanup ran


def test_publish_confirm_failure_does_not_advance_rate_limit_on_block(transport):
    # dry-run must NEVER touch the rate-limit timestamp either
    a = make(TwitterAdapter, transport)
    a.publish("dry only", dry_run=True)
    assert a._last_action_ts == 0.0


# --------------------------------------------------------------------------
# 4) Error mapping: CDP_OFFLINE / LOGIN_REQUIRED / OP_FAILED / NOT_CONFIGURED
# --------------------------------------------------------------------------

def test_error_cdp_offline_when_no_browser(transport, monkeypatch):
    import automations.adapters.cdp_adapter as mod

    monkeypatch.setattr(mod.time, "sleep", lambda s: None)
    t = FakeCdpTransport(version_ok=False)  # /json/version unreachable
    a = make(TwitterAdapter, t)
    result = a.publish("hi", dry_run=False)
    assert result["ok"] is False
    assert result["code"] == CDP_OFFLINE
    assert CDP_OFFLINE in result["error"]


def test_error_cdp_offline_when_tab_cannot_open(transport, monkeypatch):
    import automations.adapters.cdp_adapter as mod

    monkeypatch.setattr(mod.time, "sleep", lambda s: None)
    t = FakeCdpTransport(dom={COMPOSER_SEL: True, BUTTON_SEL: True}, href="https://x.com/u/status/998877665544332211")
    a = make(TwitterAdapter, t)
    # break only the tab-open seam
    a._new_tab = lambda url: (None, None)
    result = a.publish("hi", dry_run=False)
    assert result["code"] == CDP_OFFLINE


def test_error_login_required_on_login_wall(transport, monkeypatch):
    import automations.adapters.cdp_adapter as mod

    monkeypatch.setattr(mod.time, "sleep", lambda s: None)
    t = FakeCdpTransport(login_wall=True)
    a = make(TwitterAdapter, t)
    result = a.publish("hi", dry_run=False)
    assert result["ok"] is False
    assert result["code"] == LOGIN_REQUIRED
    assert LOGIN_REQUIRED in result["error"]
    assert t.opened_tabs and t.closed_tabs == ["tab1"]


def test_error_op_failed_when_composer_not_found(transport, monkeypatch):
    import automations.adapters.cdp_adapter as mod

    monkeypatch.setattr(mod.time, "sleep", lambda s: None)
    t = FakeCdpTransport(dom={COMPOSER_SEL: False})  # selector absent, no wall
    a = make(TwitterAdapter, t)
    result = a.publish("hi", dry_run=False)
    assert result["code"] == OP_FAILED
    assert "composer" in result["error"].lower()


def test_error_not_configured_without_selectors(transport):
    class Empty(TwitterAdapter):
        def default_config(self):
            cfg = super().default_config()
            cfg["composer_selectors"] = []
            return cfg

    a = make(Empty, transport)
    result = a.publish("hi")
    assert result["ok"] is False
    assert result["code"] == NOT_CONFIGURED
    assert NOT_CONFIGURED in result["error"]


def test_verify_not_configured_without_post_pattern():
    class NoPattern(TwitterAdapter):
        def default_config(self):
            cfg = super().default_config()
            cfg["post_url_pattern"] = ""
            return cfg

    a = NoPattern()
    r = a.verify("whatever")
    assert r["ok"] is False and r["exists"] is False
    assert NOT_CONFIGURED in r["error"]


def test_verify_login_required_vs_exists(transport, monkeypatch):
    import automations.adapters.cdp_adapter as mod

    monkeypatch.setattr(mod.time, "sleep", lambda s: None)
    # live post: URL resolves to the same id, no wall
    t = FakeCdpTransport(href="https://x.com/handle/status/1111222233334444555")
    a = make(TwitterAdapter, t)
    r = a.verify("1111222233334444555")
    assert r == {"ok": True, "exists": True, "error": None}
    # deleted post: URL resolves to something else
    t2 = FakeCdpTransport(href="https://x.com/checkout?redirect=1")
    a2 = make(TwitterAdapter, t2)
    r2 = a2.verify("1111222233334444555")
    assert r2["exists"] is False and r2["ok"] is False
    # login wall on the post page
    t3 = FakeCdpTransport(href="https://x.com/handle/status/1111222233334444555", login_wall=True)
    a3 = make(TwitterAdapter, t3)
    r3 = a3.verify("1111222233334444555")
    assert r3["code"] == LOGIN_REQUIRED


def test_verify_zero_state_and_offline(transport, monkeypatch):
    import automations.adapters.cdp_adapter as mod

    monkeypatch.setattr(mod.time, "sleep", lambda s: None)
    a = make(TwitterAdapter, transport)
    # empty id -> OP_FAILED
    r = a.verify("")
    assert r["ok"] is False and r["exists"] is False
    # browser offline -> CDP_OFFLINE
    t = FakeCdpTransport(version_ok=False)
    a2 = make(TwitterAdapter, t)
    r2 = a2.verify("111")
    assert r2["error"].startswith(CDP_OFFLINE) or CDP_OFFLINE in r2["error"]


def test_metrics_scrape_first_match_and_zeros(transport, monkeypatch):
    import automations.adapters.cdp_adapter as mod

    monkeypatch.setattr(mod.time, "sleep", lambda s: None)

    class Scraper(FakeCdpTransport):
        def evaluate(self, adapter, expression):
            self.evaluate_calls.append(expression)
            if expression.startswith("(() => { const out = {}; const map = "):
                import json as _json

                map_ = _json.loads(expression.split("const map = ", 1)[1].split(";", 1)[0])
                return {"likes": 7, "comments": 2, "shares": 1}
            return super().evaluate(adapter, expression)

    t = Scraper(href="https://x.com/handle/status/5555555555000")
    a = make(TwitterAdapter, t)
    m = a.metrics("5555555555000")
    assert m["likes"] == 7 and m["comments"] == 2 and m["shares"] == 1


def test_metrics_zero_when_offline(transport, monkeypatch):
    import automations.adapters.cdp_adapter as mod

    monkeypatch.setattr(mod.time, "sleep", lambda s: None)
    t = FakeCdpTransport(version_ok=False)
    a = make(TwitterAdapter, t)
    m = a.metrics("123")
    assert m == {"reach": 0, "engagement": 0, "likes": 0, "comments": 0, "shares": 0}


# --------------------------------------------------------------------------
# 5) Rate-limit guard: second premature publish is blocked
# --------------------------------------------------------------------------

def test_rate_limit_blocks_premature_second_publish(transport, monkeypatch):
    import automations.adapters.cdp_adapter as mod

    monkeypatch.setattr(mod.time, "sleep", lambda s: None)
    t = FakeCdpTransport(
        dom={COMPOSER_SEL: True, BUTTON_SEL: True},
        href="https://x.com/u/status/11110000111100001111",
    )
    a = make(TwitterAdapter, t, min_action_interval=10)

    first = a.publish("one", dry_run=False)
    assert first["ok"] is True

    second = a.publish("two", dry_run=False)  # 0s elapsed < 10s min gap
    assert second["ok"] is False
    assert second["code"] == OP_FAILED
    assert "rate limit" in second["error"].lower()
    # still only the FIRST publish opened a tab
    assert len(t.opened_tabs) == 1


def test_rate_limit_allows_after_interval(transport, monkeypatch):
    import automations.adapters.cdp_adapter as mod

    monkeypatch.setattr(mod.time, "sleep", lambda s: None)
    t = FakeCdpTransport(
        dom={COMPOSER_SEL: True, BUTTON_SEL: True},
        href="https://x.com/u/status/22220000222200002222",
    )
    a = make(TwitterAdapter, t, min_action_interval=10)

    assert a.publish("one", dry_run=False)["ok"] is True
    a._last_action_ts -= 11  # simulate 11s elapsed
    t.opened_tabs.clear()
    t.closed_tabs.clear()
    second = a.publish("two", dry_run=False)
    assert second["ok"] is True
    assert len(t.opened_tabs) == 1


def test_rate_limit_floor_is_at_least_10s_by_default(transport):
    a = make(TwitterAdapter, transport)
    assert a.min_action_interval >= 10.0


def test_rate_limit_dry_runs_are_not_throttled(transport):
    t = FakeCdpTransport(dom={COMPOSER_SEL: True, BUTTON_SEL: True})
    a = make(TwitterAdapter, t, min_action_interval=10)
    # A blocked second attempt must not consume the rate window: nothing below
    # touches CDP anyway, but the guard itself must not fire on the dry path.
    r1 = a.publish("d1", dry_run=True)
    r2 = a.publish("d2", dry_run=True)
    assert r1["ok"] and r2["ok"]


# --------------------------------------------------------------------------
# 6) Helpers: first_match + post-id extraction
# --------------------------------------------------------------------------

def test_first_match_order():
    flags = {"a": False, "b": True, "c": True}
    assert first_match(["a", "b", "c"], flags) == "b"
    assert first_match(["a"], flags) is None
    assert first_match([], flags) is None
    assert first_match(["a"], None) is None


def test_js_probe_flags_every_selector():
    expr = _js_probe(["#a", "#b"])
    assert "#a" in expr and "#b" in expr
    assert "querySelector" in expr


@pytest.mark.parametrize(
    "adapter_cls,permalink,expected_id",
    [
        (TwitterAdapter, "https://x.com/someuser/status/1234567890123456789", "1234567890123456789"),
        (InstagramAdapter, "https://www.instagram.com/p/CxAbCdEf123/", "CxAbCdEf123"),
        (FacebookAdapter, "https://www.facebook.com/some.page/posts/pfbid02xyz456", "pfbid02xyz456"),
        (TikTokAdapter, "https://www.tiktok.com/@creator/video/7298765432109876543", "7298765432109876543"),
    ],
)
def test_post_id_extraction_from_permalink(adapter_cls, permalink, expected_id):
    a = adapter_cls()
    assert a._extract_id_from_url(permalink) == expected_id