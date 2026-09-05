<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

# Repository Guidelines

## Project Overview

**DirtyNest** is a cyberpunk-themed, single-page "command center" / AI operations hub. It aggregates many subsystems into one themed UI: an AI chatbot (Gemini streaming), an AI-agent swarm / control-room view, Docker management, a knowledge vault (PKM with vector search), developer tools, system/security telemetry widgets, and a human-in-the-loop (HITL) automation console for the `zbiornik.com` portal.

Two tiers live in one repo (there is **no** separate backend service — ADR-0012 in `docs/adr/`):

- **Frontend + API** — Next.js 16.3.2 (App Router, React 19) SPA at repo root (`src/`). Real Postgres persistence (Drizzle) for todos/notes/links/calendar/logs/auth/hermes/knowledge/social/zbiornik data. Agent orchestration lives in `src/lib/orchestrator/` (classifier → sidecar ACP bridge), streaming events flow over the sidecar WebSocket.
- **Sidecar** — Python 3.11 **FastAPI** service (`sidecar/`, port 8000). The operational backbone: Hermes ACP agent bridge (profile `dirtydaily`), Chrome CDP automation, Docker control, cron scheduling, Qdrant memory/knowledge, and social/zbiornik automations.

> Note: `docs/current-state.md` is the authoritative audit of what exists vs. mocks (as of 2026-08-29: F0–F6 done; X/IG/FB/TikTok social adapters are still `MockAdapter` stubs — Reddit is real; Knowledge graph view still partially mocked; overall telemetry real via psutil + port probes). Architecture decisions: `docs/adr/` (ADR-0011 rejects the "DeepSeek Harness v2.0" blueprint; the Engine is Hermes ACP). Project glossary: `CONTEXT.md`.

## Architecture & Data Flow

```
Browser (src/app/page.tsx SPA, 'use client')
   │  fetch() → Next App Router route handlers (src/app/api/*)
   │  WebSocket → sidecar /ws/telemetry + /ws/acp (hermesSocket)
   ▼
Next.js route handlers ── Drizzle ORM (postgres-js) ──► PostgreSQL 16 (docker-compose postgres)
   │  REST → sidecar (NEXT_PUBLIC_SIDECAR_URL, default http://localhost:8000)
   ▼
Sidecar (FastAPI :8000) ──► Hermes ACP agent (profile 'dirtydaily') via acp_client.py
                        ──► Chrome via CDP (cdp_service.py)
                        ──► Docker (docker_service.py)
                        ──► Qdrant vectors (knowledge/memory services, fastembed)
                        ──► cron jobs (cron_service.py, Redis w/ in-memory fallback)
```

- **Frontend data flow**: all views are client components. `src/app/page.tsx` composes the decks via dynamic imports (`next/dynamic`, `ssr:false`); navigation is `useAppStore.activeView` synced to the URL hash (`#view`). Views fetch from route handlers under `src/app/api/*`, which use the shared Drizzle `db` from `@/db` and schema from `@/lib/schema`. Client state is Zustand. Logging flows client → `POST /api/logs` → `system_logs` table.
- **Agentic chat flow**: UI → `POST /api/chat/sessions/[id]/messages` → orchestrator (`src/lib/orchestrator/router` + `acpBridge`) → sidecar `/api/hermes/acp/prompt` → Hermes ACP → streamed `agent_event` back over the sidecar WS to Control Room/Chat, with HITL gates for `critical` tools (ADR-0008).
- **Zbiornik flow**: ZbiornikOpsView → `/api/zbiornik/*` (Next, HITL gate + rate limits in `src/lib/zbiornik/ops.ts`) → sidecar `/exec` → `zbiornik-ops.mjs` (CDP, logged-in session). Writes never run from cron. See `docs/zbiornik-ops.md`.

## Key Directories

| Path | Purpose |
|------|---------|
| `src/app/` | Next.js App Router: `page.tsx` (the SPA), `layout.tsx`, `globals.css`, `api/` route handlers (chat/knowledge/social/audit/hermes/zbiornik/CRUD) |
| `src/components/` | React components: `views/` (decks incl. `ZbiornikOpsView`), `layout/`, `widgets/`, `modals/`, `desktop/`, `common/`, `auth/`, `ui/` (shadcn), `magicui/`, `terminal/`, `tools/` |
| `src/lib/` | Shared logic: `schema.ts` (Drizzle), `db.ts`, `orchestrator/` (classifier, acpBridge, registry, persist + tests), `hermes/` (socket, stores, types), `zbiornik/ops.ts`, `auth/`, `theme.ts`, `widgetLayout.ts`, `cyberAudio.ts`, `cyberSpeech.ts`, `aiModels.ts`, `logger.ts`, `utils.ts` |
| `src/stores/` | Zustand stores: `useAppStore.ts`, `useAuthStore.ts` (JWT session) |
| `src/db/` | `index.ts` — shared postgres-js pool + `initDb()` (runs Drizzle migrations) + `insertLog()` |
| `sidecar/` | Python FastAPI service: `main.py`, `cron_service.py`, `acp_client.py`, `cdp_service.py`, `docker_service.py`, `memory_service.py`, `knowledge_service.py`, `automations/` (incl. `adapters/`, CDP-first per ADR-0013), `tests/` (8 files, 86 tests) |
| `scripts/` | `pg-*.cjs` Postgres admin, `backup.sh`, `ollama-init.sh`, `legacy_archive/` |
| `docs/` | ADRs (`adr/NNNN-*.md`), `current-state.md` audit, `implementation-plan.md` (F0–F6 done, F7 next), `zbiornik-ops.md`, data models, API spec (aspirational catalog — generate truth from code) |
| `drizzle/` | Drizzle SQL migrations (PostgreSQL baseline + additive migrations; legacy SQLite moved to `drizzle/_legacy-sqlite/`) |
| `backend/` | **Removed** (was always empty; ADR-0012). Do not recreate. |

## Development Commands

**Frontend (repo root, npm):**
```bash
npm run dev        # next dev (Turbopack)
npm run build      # next build
npm run start      # next start
npm run lint       # eslint - 0 errors / 0 warnings enforced since F7.4
npm run typecheck  # tsc --noEmit
npm test           # vitest (orchestrator)
```

**Sidecar (`sidecar/`, Python 3.11 via `.venv`):**
```bash
pip install -r requirements.txt
uvicorn main:app --host 0.0.0.0 --port 8000
pytest tests/      # 8 test files, 86 tests (zbiornik, docker, acp_bridge, knowledge, social_adapters incl. CDP, scheduler, intel)
```

**Full stack:** `docker compose up` — 7 services: postgres:16, qdrant, redis, searxng, ollama, web :3000, sidecar :8000. `${POSTGRES_PASSWORD:?}` is enforced from `.env` (never hardcode secrets; see `.env.example`).

**CI:** `.github/workflows/ci.yml` — typecheck, lint (`--max-warnings 0`), vitest, next build, pytest (postgres:16 service), e2e Playwright job (hermetic).

## Code Conventions & Common Patterns

- **Naming**: kebab-case files; PascalCase components/classes; camelCase functions/vars; `SCREAMING_SNAKE` for constants (`DEFAULT_LAYOUT`, `AUTH_PERSONAS`, `AGENT_DEFINITIONS`); `UPPER_SNAKE` for status/level enums (`INFO`/`SUCCESS`, `draft`/`approved`/`published`). Polish comments/strings in the zbiornik module; English elsewhere.
- **Error handling**: `try/catch` around every async handler; `catch (err: unknown)` then narrow via `err instanceof Error ? err.message : String(err)`; return `{ error }` JSON with 4xx/5xx. Client `apiJson()` throws on `!res.ok || ok === false`. Many empty `catch {}` blocks intentionally swallow (localStorage, audio, sidecar fallbacks) — don't "fix" them.
- **Async**: `async/await` throughout; route handlers are async functions; streaming via `ReadableStream` + `for-await`; `AbortSignal.timeout` for sidecar calls.
- **Dependency injection**: no framework DI. Orchestrator components take config/registry via constructor injection (`Classifier` takes registry + config). Frontend uses module singletons (`cyberAudio`, `cyberSpeech`, `hermesSocket`) and Zustand stores.
- **State management**: Zustand `create<T>()((set, get) => ...)`. `useAuthStore` uses `persist` middleware with `partialize`. Components select via `useAppStore()` destructuring.
- **API route pattern**: `export async function GET/POST/DELETE(request: NextRequest | Request)`; validate inputs with early returns; call `initDb()`/`db`; return `Response.json`/`NextResponse.json`; `export const dynamic = 'force-dynamic'` for zbiornik routes.
- **DB access**: Drizzle ORM over postgres-js. Single shared pool in `src/db/index.ts`, schema in `src/lib/schema.ts`, `initDb()` applies migrations (no runtime DDL — ADR/consolidation F0), `insertLog()` helper, `db.transaction(tx)` for multi-table ops. Timestamps are `timestamptz`; schema changes only via `drizzle-kit generate` migrations (never `CREATE TABLE` in code).
- **Auth**: JWT (jose) access + refresh in httpOnly cookies via Next middleware; two seeded users only (ADR-0003); API keys encrypted AES-GCM. Never add public registration.
- **Agent events**: one contract (`thinking | tool_call | tool_result | token | source | hitl_gate | done | error`) crossing sidecar WS → `hermesSocket.ts` → stores; owner: `src/lib/orchestrator/acpBridge.ts` (ADR-0007). Don't add a second agent protocol (ADR-0002).
- **Styling**: Tailwind v4 (CSS-first, `@tailwindcss/postcss`) with hardcoded neon hex classes (`#00FF41` green, `#BF40FF` purple, `#00F0FF` cyan) overridden at runtime by `theme.ts` `generateThemeCss()`. `cn()` = `twMerge(clsx(...))`. lucide-react icons; shadcn/radix `ui/` components; `cyber-card`/`hud-corner`/`widget-header` classes.

## Important Files

- `src/app/page.tsx` — the SPA shell: sidebar, panels, modals, terminal dock, window manager, decks, global keyboard shortcuts, hash routing.
- `src/lib/orchestrator/` — `classifier.ts` (routing), `acpBridge.ts` (sidecar ACP calls + event mapping), `registry.ts`, `persist.ts` (chat persistence), + `*.test.ts`.
- `src/app/api/chat/` — agentic chat endpoints (sessions, messages, agents). `src/app/api/chat/route.ts` = legacy Gemini proxy, slated for decision in F7 (ADR-0011 context).
- `src/lib/schema.ts` + `src/db/index.ts` — Drizzle schema and shared DB pool.
- `src/lib/hermes/hermesSocket.ts` — WebSocket client to sidecar (auto-reconnect).
- `src/lib/auth/` + `src/middleware.ts` — JWT auth, route protection.
- `src/lib/zbiornik/ops.ts` — Zbiornik Ops helpers incl. the HITL `publishGate` (daily limit / min-gap / quiet-hours).
- `sidecar/main.py` — FastAPI app (telemetry, ACP, CDP, docker, cron, automations endpoints + WebSockets).
- `sidecar/automations/adapters/` — social adapter registry (`base.py`, `reddit.py` real, `mock.py` stub for X/IG/FB/TikTok → replace in F7 per ADR-0013).
- `sidecar/automations/zbiornik.py` — ZbiornikOpsManager/MonitorService (subprocess wrapper around `zbiornik-ops.mjs`).
- `docs/current-state.md` — truth table of what exists vs. mocks; `docs/adr/` — decisions; `CONTEXT.md` — glossary.

## Runtime/Tooling Preferences

- **Node** (Docker uses `node:20-alpine`), npm (package-lock.json). TypeScript strict.
- **Sidecar**: Python 3.11 (`python:3.11-slim`), pip; local dev uses `sidecar/.venv`. `pytest` used but not declared in `requirements.txt`.
- **Next.js 16.3.2 has breaking changes** vs. older Next — read `node_modules/next/dist/docs/` before writing code (see the auto-managed block at the top of this file).
- **Env** (`.env.local`, gitignored; `.env.example` documents all): `DATABASE_URL`, `NEXT_PUBLIC_SIDECAR_URL=http://localhost:8000`, `QDRANT_URL`, `REDIS_URL`, `SEARXNG_URL`, `POSTGRES_PASSWORD`, `JWT_SECRET`, `ENCRYPTION_KEY`. Secrets never in code or compose.
- **Path alias**: `@/*` → `./src/*`.
- **Docker**: `Dockerfile.next` (web, standalone output, non-root `nextjs` user), `sidecar/Dockerfile` (uvicorn :8000), `docker-compose.yml` (7 services, healthchecks, volumes).

## Testing & QA

- **Sidecar**: `pytest tests/` from `sidecar/` with `sidecar/.venv` - 8 test files / 86 tests: zbiornik, docker, acp_bridge, knowledge, social_adapters (incl. CDP adapters), scheduler, intel. Pure unit tests where possible (mocks over network).
- **Frontend**: orchestrator vitest suite (`src/lib/orchestrator/*.test.ts`: classifier, acp bridge, router snapshots); `npm test` at repo root.
- **CI** (`.github/workflows/ci.yml`): typecheck + lint (`--max-warnings 0`) + vitest + build + pytest vs postgres:16 + e2e Playwright job (hermetic).
- **Coverage expectations**: none formalized. `docs/implementation-plan.md` rules: tests accompany every phase; F7 adds Playwright e2e.
- **QA gates**: `npm run typecheck`, `npm test`, `npm run lint` (0 errors / 0 warnings enforced since F7.4), sidecar `pytest tests/`.
