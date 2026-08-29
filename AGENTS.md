<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

# Repository Guidelines

## Project Overview

**DirtyNest** is a cyberpunk-themed, single-page "command center" / AI operations hub. It aggregates many subsystems into one themed UI: an AI chatbot (Gemini streaming), an AI-agent swarm / control-room view, Docker management, a knowledge vault (PKM with vector search), developer tools, system/security telemetry widgets, and a human-in-the-loop (HITL) automation console for the `zbiornik.com` portal.

Three tiers live in one repo:

- **Frontend** — Next.js 16.3.2 (App Router, React 19) SPA at repo root (`src/`). Real Postgres persistence for todos/notes/links/calendar/logs/hermes/zbiornik data.
- **Backend** — standalone TypeScript **Fastify 5** service (`backend/`, port 4000). Currently a "Faza 0" skeleton: `/api/health` + a demo agent-orchestrator route. **Not yet wired to the frontend.**
- **Sidecar** — Python 3.11 **FastAPI** service (`sidecar/`, port 8000). The operational backbone: Hermes ACP agent bridge, Chrome CDP automation, Docker control, cron scheduling, Qdrant memory, and social/zbiornik automations.

> Note: much "telemetry" is simulated/mock (e.g. `SystemStats` randomizes values; Hermes stores ship hardcoded defaults; auth is persona-based mock JWT). `docs/current-state.md` is the authoritative audit of what actually exists vs. mocks.

## Architecture & Data Flow

```
Browser (src/app/page.tsx SPA, 'use client')
   │  fetch() → Next App Router route handlers (src/app/api/*)
   │  WebSocket → sidecar /ws/telemetry (hermesSocket)
   ▼
Next.js route handlers ── Drizzle ORM (postgres-js) ──► PostgreSQL (docker-compose postgres:16)
   │  REST → sidecar (NEXT_PUBLIC_SIDECAR_URL, default http://localhost:8000)
   ▼
Sidecar (FastAPI :8000) ──► Hermes ACP agent (profile 'dirtydaily') via acp_client.py
                        ──► Chrome via CDP (cdp_service.py)
                        ──► Docker CLI (docker_service.py)
                        ──► Qdrant vector store (memory_service.py, fastembed)
                        ──► cron jobs (cron_service.py, Redis w/ in-memory fallback)
```

- **Frontend data flow**: all views are client components. `src/app/page.tsx` composes ~18 dynamically-imported views (`next/dynamic`, `ssr:false`); navigation is `useAppStore.activeView` synced to the URL hash (`#view`). Views fetch from route handlers under `src/app/api/*`, which use the shared Drizzle `db` from `@/db` and schema from `@/lib/schema`. Client state is Zustand. Logging flows client → `POST /api/logs` → `system_logs` table.
- **Backend data flow**: `AgentOrchestratorProxy.route()` decides engine — forced `harness`/`local`, else auto-route (`deep_research`, `code_interpreter`) to the DeepSeek Harness when `HARNESS_ENABLED=true`, else local keyword-based classification. LLM classification and SSE streaming are stubbed for later phases.
- **Sidecar data flow**: chat goes UI → Next API → sidecar `/api/hermes/acp/prompt` → Hermes ACP → streamed `agent_event` back over WebSocket to the Control Room, with HITL gates for critical tools.

## Key Directories

| Path | Purpose |
|------|---------|
| `src/app/` | Next.js App Router: `page.tsx` (the whole SPA), `layout.tsx`, `globals.css`, `api/` route handlers |
| `src/components/` | React components: `views/` (full pages incl. `ZbiornikOpsView`), `layout/`, `widgets/`, `modals/`, `desktop/`, `common/`, `auth/`, `ui/` (shadcn), `magicui/`, `terminal/`, `tools/` |
| `src/lib/` | Shared logic: `schema.ts` (Drizzle), `db.ts`, `hermes/` (socket, stores, types), `zbiornik/ops.ts`, `theme.ts`, `widgetLayout.ts`, `cyberAudio.ts`, `cyberSpeech.ts`, `aiModels.ts`, `logger.ts`, `utils.ts` |
| `src/stores/` | Zustand stores: `useAppStore.ts`, `useAuthStore.ts` |
| `src/db/` | `index.ts` — shared postgres-js pool + `initDb()` + `insertLog()` |
| `src/types/` | `paperclip.ts`, `auth.ts`, `sql.js.d.ts` |
| `backend/src/` | Fastify service: `server.ts`, `config.ts`, `db/`, `orchestrator/`, `services/deepseek-harness.client.ts` |
| `sidecar/` | Python FastAPI service: `main.py`, `cron_service.py`, `acp_client.py`, `cdp_service.py`, `docker_service.py`, `memory_service.py`, `automations/`, `tests/` |
| `scripts/` | Scratch Postgres admin (`pg-*.cjs`) + `legacy_archive/` (archived Reddit-engagement Python) |
| `docs/` | Architecture, ADRs (`decisions.md`), data models, API spec, agent system, phased F0–F6 plan, `current-state.md` audit |
| `drizzle/` | Drizzle SQL migrations |

## Development Commands

**Frontend (repo root, npm):**
```bash
npm run dev        # next dev (Turbopack)
npm run build      # next build
npm run start      # next start
npm run lint       # eslint
npm run typecheck  # tsc --noEmit
```

**Backend (`backend/`, npm, ESM):**
```bash
npm run dev        # tsx watch src/server.ts
npm run build      # tsc -p tsconfig.json → dist/
npm run typecheck  # tsc --noEmit
npm run start      # node dist/server.js
```

**Sidecar (`sidecar/`, Python):**
```bash
pip install -r requirements.txt
uvicorn main:app --host 0.0.0.0 --port 8000
pytest tests/      # run the single test module
```

**Full stack:** `docker compose up` (postgres:16, web :3000, sidecar :8000).

## Code Conventions & Common Patterns

- **Naming**: kebab-case files; PascalCase components/classes; camelCase functions/vars; `SCREAMING_SNAKE` for constants (`DEFAULT_LAYOUT`, `AUTH_PERSONAS`, `AGENT_DEFINITIONS`); `UPPER_SNAKE` for status/level enums (`INFO`/`SUCCESS`, `draft`/`approved`/`published`). Polish comments/strings in the zbiornik module and backend; English elsewhere.
- **Error handling**: `try/catch` around every async handler; `catch (err: unknown)` then narrow via `err instanceof Error ? err.message : String(err)`; return `{ error }` JSON with 4xx/5xx. Client `apiJson()` throws on `!res.ok || ok === false`. Many empty `catch {}` blocks intentionally swallow (localStorage, audio, sidecar fallbacks) — don't "fix" them.
- **Async**: `async/await` throughout; route handlers are async functions; streaming via `ReadableStream` + `for-await`; `AbortSignal.timeout` for sidecar calls; `AbortController` + `setTimeout` in the harness client.
- **Dependency injection**: no framework DI. Backend uses constructor injection (`AgentOrchestratorProxy` takes `HarnessConfig` + `OrchestratorConfig`; `Classifier` takes registry + config; `DeepSeekHarnessClient` takes config). Frontend uses module singletons (`cyberAudio`, `cyberSpeech`, `hermesSocket`) and Zustand stores.
- **State management**: Zustand `create<T>()((set, get) => ...)`. `useAuthStore` uses `persist` middleware with `partialize`. Components select via `useAppStore()` destructuring.
- **API route pattern**: `export async function GET/POST/DELETE(request: NextRequest | Request)`; validate inputs with early returns; call `initDb()`/`db`; return `Response.json`/`NextResponse.json`; `export const dynamic = 'force-dynamic'` for zbiornik routes.
- **DB access**: Drizzle ORM over postgres-js. Frontend: single shared pool in `src/db/index.ts`, schema in `src/lib/schema.ts`, idempotent `initDb()` (table creation + seeding), `insertLog()` helper, `db.transaction(tx)` for multi-table ops. Backend: `createDb()` factory with an isolated schema. Frontend timestamps are ISO strings in `varchar` columns; backend uses `timestamp`/`jsonb`/`uuid`.
- **Styling**: Tailwind v4 (CSS-first, `@tailwindcss/postcss`) with hardcoded neon hex classes (`#00FF41` green, `#BF40FF` purple, `#00F0FF` cyan) overridden at runtime by `theme.ts` `generateThemeCss()`. `cn()` = `twMerge(clsx(...))`. lucide-react icons; shadcn/radix `ui/` components; `cyber-card`/`hud-corner`/`widget-header` classes.

## Important Files

- `src/app/page.tsx` — the entire SPA (1478 lines): sidebar, panels, modals, terminal dock, window manager, ~18 views, global keyboard shortcuts, hash routing.
- `src/app/api/chat/route.ts` — Gemini streaming proxy (`@google/genai` `sendMessageStream`).
- `src/lib/schema.ts` + `src/db/index.ts` — Drizzle schema and shared DB pool.
- `src/lib/hermes/hermesSocket.ts` — WebSocket client to sidecar `/ws/telemetry` (auto-reconnect).
- `src/lib/zbiornik/ops.ts` — server-side Zbiornik Ops helpers incl. the HITL `publishGate` (daily limit / min-gap / quiet-hours).
- `backend/src/server.ts` — Fastify bootstrap; `backend/src/orchestrator/agent-orchestrator-proxy.ts` — engine routing.
- `sidecar/main.py` — FastAPI app (33+ endpoints, WebSockets).
- `sidecar/automations/zbiornik.py` — ZbiornikOpsManager/MonitorService (subprocess wrapper around `zbiornik-ops.mjs`).
- `docs/current-state.md` — what actually exists vs. mocks; `docs/decisions.md` — ADR register (ADR-01..10).

## Runtime/Tooling Preferences

- **Frontend/backend**: Node (Docker uses `node:20-alpine`), npm (package-lock.json). TypeScript strict.
- **Sidecar**: Python 3.11 (`python:3.11-slim`), pip. `pytest` is used but **not** declared in `requirements.txt`.
- **Next.js 16.3.2 has breaking changes** vs. older Next — read `node_modules/next/dist/docs/` before writing code (see the auto-managed block at the top of this file).
- **Env** (`.env.local`, gitignored): `DATABASE_URL`, `NEXT_PUBLIC_SIDECAR_URL=http://localhost:8000`, `QDRANT_URL`, `REDIS_URL`, `SEARXNG_URL`. Backend reads `PORT`, `DATABASE_URL`, `REDIS_URL`, `HARNESS_*`, `CLASSIFIER_*`.
- **Path alias**: `@/*` → `./src/*`.
- **Docker**: `Dockerfile.next` (web, standalone output, non-root `nextjs` user), `sidecar/Dockerfile` (uvicorn :8000), `docker-compose.yml` (postgres:16 + web + sidecar; redis/qdrant/searxng/ollama planned but not yet in compose).

## Testing & QA

- **Only one test file exists**: `sidecar/tests/test_zbiornik.py` — a pytest suite (Python 3.11) unit-testing `sidecar/automations/zbiornik.py` (ZbiornikOpsManager + ZbiornikMonitorService). 9 tests covering run-op guard rails, tolerant JSON parsing, poll login gating, and monitor snapshot. Uses `tmp_path`, `unittest.mock.patch`, `monkeypatch`, `@pytest.mark.parametrize`. Pure unit tests — no network/browser/real subprocess.
- **No JS/TS tests** (`*.test.*`, `*.spec.*`), no pytest config files, and **no `test` script** in either `package.json`.
- **Run**: `pytest tests/` from `sidecar/`.
- **Coverage expectations**: none formalized. `docs/implementation-plan.md` lists "tests per phase" as a standing rule (F0–F6 roadmap).
- **QA gates**: `npm run typecheck` and `npm run lint` (lint currently has ~80 errors / 239 warnings — non-blocking per `SYSTEM_SCAN_REPORT.md`).
