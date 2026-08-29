/**
 * Shared e2e helpers: hermetic network mocking for the DirtyNest SPA.
 *
 * The app normally talks to Postgres (via Next route handlers), a Python
 * sidecar (REST + WebSockets) and Qdrant. In e2e we intercept every one of
 * those surfaces at the browser network layer so tests never need a backend:
 *
 *  - /api/auth/*               -> mock session (RealAuthGate) + ws-token
 *  - /api/hermes/acp/*         -> ACP sessions/messages/gates (Next proxies)
 *  - /api/knowledge/*          -> knowledge vault REST
 *  - sidecar cross-origin URLs (NEXT_PUBLIC_SIDECAR_URL default :8000)
 *  - ws(s)://host/ws/telemetry -> mocked WebSocket (page.routeWebSocket)
 *  - everything else /api/...  -> safe generic JSON so no view throws
 */
import { Page, Route } from "@playwright/test";

export const SIDECAR = "http://localhost:8000";

export interface AcpMessageRow {
  id: string;
  session_id: string;
  role: "user" | "agent" | "system" | "tool";
  content: string;
  reasoning_trace?: string | null;
  created_at: string;
}

export function makeSession(id: string, name: string) {
  const now = new Date().toISOString();
  return {
    id,
    name,
    profile: "dirtydaily",
    model: "Nous-Hermes-3-Llama-3.1-8B",
    cwd: "C:/dirty-test",
    status: "IDLE",
    created_at: now,
    updated_at: now,
  };
}

const THOUGHT_OPEN = "<" + "thought>";
const THOUGHT_CLOSE = "</" + "thought>";
const TOOL_CALL_OPEN = "<" + "tool_call>";
const TOOL_CALL_CLOSE = "</" + "tool_call>";
const TOOL_RESP_OPEN = "<" + "tool_response>";
const TOOL_RESP_CLOSE = "</" + "tool_response>";

const AGENT_CONTENT = [
  THOUGHT_OPEN,
  "[ACP REASONING // NODE Nous-Hermes-3-Llama-3.1-8B]",
  "Analyzing directive: zero-trust mesh audit...",
  "Verifying tool permissions & zero-trust safety guardrails...",
  "Synthesizing optimal execution plan...",
  THOUGHT_CLOSE,
  TOOL_CALL_OPEN,
  '{"name": "hermes_mesh_status", "parameters": {"cluster": "dirtynest-core"}}',
  TOOL_CALL_CLOSE,
  TOOL_RESP_OPEN,
  '{"status": "ONLINE", "active_skills": 42, "memory_recall_accuracy": "99.8%"}',
  TOOL_RESP_CLOSE,
  "",
  "Directive completed. All 8 mesh microservices report 0 packet loss and the eBPF kernel filter is ARMED.",
].join("\n");

const REASONING_TRACE = [
  "[ACP REASONING // NODE Nous-Hermes-3-Llama-3.1-8B]",
  "Analyzing directive: zero-trust mesh audit...",
  "Verifying tool permissions & zero-trust safety guardrails...",
  "Synthesizing optimal execution plan...",
].join("\n");

/**
 * A persisted agent transcript equivalent to the sidecar `agent_event` stream:
 * thinking (reasoning deltas) -> tool_call -> tool_result -> token chunks -> done.
 * This mirrors what `ACP_EXECUTION_FINISHED` persistence leaves behind
 * (src/lib/orchestrator/acpBridge.ts + sidecar/acp_client.py): the agent
 * message embeds thought / tool_call / tool_response segments plus final text.
 */
export function persistedAgentTranscript(sessionId: string): AcpMessageRow[] {
  const now = new Date().toISOString();
  return [
    {
      id: "msg-sys-1",
      session_id: sessionId,
      role: "system",
      content: "[ACP SESSION INITIALIZED] Hermes Profile: dirtydaily",
      created_at: now,
    },
    {
      id: "msg-usr-1",
      session_id: sessionId,
      role: "user",
      content: "Run the zero-trust mesh audit directive",
      created_at: now,
    },
    {
      id: "msg-agy-1",
      session_id: sessionId,
      role: "agent",
      content: AGENT_CONTENT,
      reasoning_trace: REASONING_TRACE,
      created_at: now,
    },
  ];
}

/**
 * Install all hermetic mocks on a page. Call once per test, before goto.
 * NOTE: Playwright applies page.route handlers LIFO (last registered wins),
 * so the broad catch-all is registered FIRST and every specific mock after
 * it takes precedence.
 */
export async function installHermeticMocks(page: Page): Promise<void> {
  // ---- Auth: RealAuthGate polls /api/auth/me; ws-token for sidecar WS ------
  // ---- Catch-all for any remaining /api fetch a deck may fire ----------------
  // NOTE: registered FIRST (lowest priority — specifics below override it) because Playwright gives priority to the
  // last-registered matching route. Specific mocks below override this.
  await page.route("**/api/**", (route) => {
    if (route.request().method() === "OPTIONS") return route.fulfill({ status: 204 });
    return route.fulfill({ json: { ok: true, results: [], docs: [], sessions: [], memories: [] } });
  });


  await page.route("**/api/auth/me", (route) =>
    route.fulfill({ json: { id: 1, username: "cipher-zero", role: "root" } })
  );
  await page.route("**/api/auth/ws-token", (route) =>
    route.fulfill({ json: { token: "e2e-ws-token" } })
  );

  // ---- ACP REST (Next proxied routes) + sidecar cross-origin equivalents ---
  const acpSessions: Record<string, unknown> = {};

  const handleAcpSessions = (route: Route) => {
    const req = route.request();
    if (req.method() === "POST") {
      const body = (req.postDataJSON() || {}) as { name?: string };
      const id = `acp-ses-e2e-${Date.now()}`;
      const session = makeSession(id, body.name || "Hermes Thread");
      acpSessions[id] = session;
      return route.fulfill({ status: 201, json: { status: "success", session } });
    }
    const sessions = Object.values(acpSessions);
    // NOTE: no seeded session — the app auto-selects sessions[0] on load, which
    // would suppress the session-create POST the chat spec asserts.
    return route.fulfill({ json: { status: "success", sessions } });
  };

  const handleAcpSessionDetail = (route: Route) => {
    const url = new URL(route.request().url());
    const id = decodeURIComponent(url.pathname.split("/").pop() || "acp-ses-e2e-seed");
    return route.fulfill({
      json: {
        status: "success",
        session: acpSessions[id] || makeSession(id, "Hermes Thread - seeded"),
        messages: persistedAgentTranscript(id),
        toolLogs: [
          {
            id: "tl-1",
            session_id: id,
            tool_name: "hermes_mesh_status",
            status: "success",
            result: '{"status": "ONLINE"}',
            timestamp: Date.now(),
          },
        ],
      },
    });
  };

  await page.route("**/api/hermes/acp/sessions", handleAcpSessions);
  await page.route("**/api/hermes/acp/sessions/*", (route) => {
    if (route.request().method() === "GET") return handleAcpSessionDetail(route);
    return route.fulfill({ json: { status: "success" } });
  });
  await page.route(`${SIDECAR}/api/hermes/acp/sessions**`, handleAcpSessions);
  await page.route(`${SIDECAR}/api/hermes/acp/sessions/**`, handleAcpSessionDetail);

  // HITL gate resolve: reply success; the HITL spec registers its own payload
  // observer before navigating (see hitl.spec.ts).
  const handleGateResolve = (route: Route) => {
    const body = (route.request().postDataJSON() || {}) as {
      request_id?: string;
      decision?: string;
    };
    return route.fulfill({
      json: { status: "resolved", request_id: body.request_id, decision: body.decision },
    });
  };
  await page.route("**/api/hermes/acp/gate/resolve", handleGateResolve);
  await page.route(`${SIDECAR}/api/hermes/acp/gate/resolve**`, handleGateResolve);

  // ACP prompt fallback (sidecar REST, posted when the socket is closed) and
  // the other sidecar endpoints the decks probe on mount.
  const okJson = { status: "success", ok: true };
  await page.route(`${SIDECAR}/api/hermes/acp/prompt**`, (route) =>
    route.fulfill({ json: okJson })
  );
  await page.route(`${SIDECAR}/api/hermes/cron**`, (route) =>
    route.fulfill({ json: { cron_jobs: [] } })
  );
  await page.route(`${SIDECAR}/api/hermes/memories**`, (route) =>
    route.fulfill({ json: { memories: [] } })
  );
  await page.route(`${SIDECAR}/api/hermes/cdp/**`, (route) =>
    route.fulfill({ json: { cdp: { is_connected: false } } })
  );

  // ---- Knowledge routes -----------------------------------------------------
  await page.route("**/api/knowledge/docs**", (route) =>
    route.fulfill({
      json: {
        docs: [
          {
            id: 11,
            title: "Zero-Trust eBPF Kernel Mesh",
            category: "System Arch",
            tags: ["ebpf", "network"],
            content: "eBPF zero-copy packet filtration at the XDP driver layer.",
            source: "operator",
          },
          {
            id: 12,
            title: "Karpathy Skill: NanoGPT KV-Cache Matrix",
            category: "Karpathy Skills",
            tags: ["karpathy", "transformers"],
            content: "Karpathy KV-cache projection matrices for autoregressive generation; validated against the same eBPF observability pipeline as the kernel mesh notes.",
            source: "operator",
          },
        ],
      },
    })
  );
  await page.route("**/api/knowledge/search", (route) =>
    route.fulfill({
      json: {
        query: "eBPF",
        results: [
          {
            doc_id: 11,
            score: 0.93,
            content: "eBPF zero-copy packet filtration at the XDP driver layer.",
            doc: { id: 11, title: "Zero-Trust eBPF Kernel Mesh", category: "System Arch", tags: [], source: "operator" },
          },
          {
            doc_id: 12,
            score: 0.81,
            content: "Karpathy KV-cache projection matrices for autoregressive generation.",
            doc: { id: 12, title: "Karpathy Skill: NanoGPT KV-Cache Matrix", category: "Karpathy Skills", tags: [], source: "operator" },
          },
        ],
        count: 2,
      },
    })
  );
  await page.route("**/api/knowledge/stats**", (route) =>
    route.fulfill({ json: { docs: 0, chunks: 0, vectors: 0, collection: "e2e" } })
  );
  await page.route("**/api/knowledge/tags**", (route) => route.fulfill({ json: { tags: [] } }));

  // ---- Chat orchestrator routes (legacy session list path) ------------------
  await page.route("**/api/chat/**", (route) =>
    route.fulfill({ json: { sessions: [], messages: [], ok: true } })
  );

  // ---- Logs / audit consumers ------------------------------------------------
  await page.route("**/api/logs**", (route) => route.fulfill({ json: { ok: true } }));
  await page.route("**/api/audit/**", (route) => route.fulfill({ json: { logs: [] } }));


  // ---- Dashboard CRUD widgets expect RAW ARRAYS from these GETs ------------
  const emptyList = [] as unknown[];
  const listOf = (route: Route) => route.fulfill({ json: emptyList });
  await page.route("**/api/todos", listOf);
  await page.route("**/api/todos/*", listOf);
  await page.route("**/api/notes", listOf);
  await page.route("**/api/quick-links", listOf);
  await page.route("**/api/calendar**", listOf);
  await page.route("**/api/focus/**", (route) => route.fulfill({ json: { total: 0, focus: [] } }));

  // ---- Telemetry WebSocket mock (hermeticity belt & braces) ------------------
  // Should any deck open the sidecar WS, it never reaches a real sidecar and
  // immediately receives an INITIAL_SNAPSHOT frame.
  await page.routeWebSocket(/\/ws\/telemetry/, (ws) => {
    ws.onMessage(() => {
      ws.send(
        JSON.stringify({
          type: "INITIAL_SNAPSHOT",
          timestamp: Date.now(),
          host: { hostname: "e2e-host", cpu_percent: 12, memory_percent: 40 },
          services: {},
          minions: [],
        })
      );
    });
  });
}

/** Capture console errors + page errors. Returns a function listing them. */
export function trackConsoleErrors(page: Page): () => string[] {
  const errors: string[] = [];
  const onPageError = (err: Error) => errors.push(`pageerror: ${err.message}`);
  const onConsole = (msg: { type(): string; text(): string }) => {
    if (msg.type() === "error") errors.push(`console.error: ${msg.text()}`);
  };
  page.on("pageerror", onPageError);
  page.on("console", onConsole);
  return () => errors;
}
