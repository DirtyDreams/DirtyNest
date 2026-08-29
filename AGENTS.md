<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

# Repository Guidelines

## Project Overview

**DirtyNest** (package `dirtynest`) is a cyberpunk-themed "tactical command center" / AI-ops hub: a Next.js 16 App Router SPA (port 3000) presenting ~17 dashboard views — AI chat (Gemini streaming), agent swarm / control room, Docker management, knowledge vault, telemetry, and a human-in-the-loop (HITL) ops console for the zbiornik.com portal (Reddit-persona social engagement automation).

- **Frontend** (`src/`): Next.js 16.3.2, React 19, single-SPA dashboard; real persistence via Drizzle ORM + PostgreSQL; mid-migration away from legacy sql.js/SQLite.
- **Sidecar** (`sidecar/`): Python 3.11 FastAPI (port 8000) — the operational backbone: Hermes ACP agent bridge, Chrome CDP automation, Docker control, cron (Redis w/ in-memory fallback), Qdrant memory, Reddit/zbiornik automations.
- **`backend/` is EMPTY.** The former Fastify 5 service was removed during the sql.js→Postgres / sidecar-first rearchitecture. Ignore older docs (previous AGENTS.md, `docs/backend-architecture.md`) that reference backend commands.
- Much UI data is **simulated by design** mid-migration (random `SystemStats`, hardcoded minion/cron registries, mock JWT auth). `docs/current-state.md` is the authoritative real-vs-mock audit — do not "fix" mock data.

## Architecture & Data Flow

```
Browser (src/app/page.tsx SPA, "use client")
   │  fetch() → Next route handlers (src/app/api/**/route.ts)
   │  WebSocket → sidecar /ws/telemetry (src/lib/hermes/hermesSocket.ts)
   ▼
Next.js route handlers ── Drizzle ORM (postgres-js) ──► PostgreSQL (compose postgres:16)
   │  server-side REST proxy → sidecar (NEXT_PUBLIC_SIDECAR_URL, default http://localhost:8000)
   ▼
Sidecar (FastAPI :8000) ──► Hermes ACP agent (acp_client.py, profile "dirtydaily")
                        ──► Chrome via CDP (cdp_service.py)
                        ──► Docker CLI (docker_service.py)
                        ──► Qdrant vectors (memory_service.py)
                        ──► cron jobs (cron_service.py, Redis w/ in-memory fallback)
```

- **Views**: all client components; navigation via `useAppStore.activeView` (no URL routes); heavy views load via `next/dynamic({ ssr: false })` with `ViewLoadingSkeleton`.
- **Persistence**: route handlers → shared postgres-js pool (`src/db/index.ts`, idempotent `initDb()` runtime-DDL) + Drizzle schema `src/lib/schema.ts`. Caveat: `initDb()` runtime-DDL and `drizzle/` migrations are two schema truths (flagged in `docs/current-state.md` §7); timestamps are ISO strings in `varchar(100)`.
- **Proxies**: `/api/chat` streams Gemini (`@google/genai`); `/api/hermes/*` and `/api/zbiornik/*` proxy the sidecar server-side. The browser never calls the sidecar directly for zbiornik ops — `src/lib/zbiornik/ops.ts` (`sidecarPost/sidecarGet`, `AbortSignal.timeout`, non-throwing `{ok,status,data,error}` envelope).
- **Telemetry**: `src/lib/hermes/hermesSocket.ts` singleton (WS `/ws/telemetry`, auto-reconnect) forwards ACP_/SWARM_ events into Zustand stores via `useHermesStore.getState()`.
- **Chat flow**: UI → `/api/hermes/acp/prompt` → sidecar → ACP agent → `agent_event` streamed back over WS, with HITL gates for critical tools.
- **HITL pipeline (non-negotiable)**: zbiornik drafts go draft → approved → `publishGate` (daily limit / min-gap / quiet hours) → published. Every outbound action through the HITL queue; one operator account, one CDP session; publication NEVER from cron (polling is read-only); sidecar write ops require `--confirm-run`. `sidecar/automations/zbiornik.py` subprocess-wraps an **external** runner `zbiornik-ops.mjs` that lives in a separate workspace, not this repo (contract: `docs/zbiornik-ops.md`).
- **Ports**: web :3000, sidecar :8000, postgres :5432; sidecar additionally probes Qdrant :6333, CDP :9222/:9333, SkillClaw :30000, Minions :6969.

## Key Directories

| Path | Purpose |
|------|---------|
| `src/app/` | `layout.tsx` (providers, PWA), SPA `page.tsx`, `api/**/route.ts` handlers (todos, notes, quick-links, calendar, focus, logs, import, chat, `hermes/*`, `zbiornik/*`) |
| `src/components/views/` | One component per dashboard view + per-feature subfolders (`zbiornik_ops/`, `control_room/`, `agents/`, `image_studio/`, …) |
| `src/components/layout/` | `Sidebar` (exports `NavViewId`), `RightPanel`, `StatusBar`, `CommandPalette`, `context_decks/` |
| `src/components/ui/` | shadcn/radix primitives + `animated/`, `glass/`, `magicui/` |
| `src/components/widgets/` | ~30 dashboard widgets; also `modals/`, `terminal/`, `chatbot/`, `desktop/CyberWindowManager` |
| `src/lib/` | `schema.ts` (Drizzle), `utils.ts` (`cn`), `widgetLayout.ts`, `theme.ts`, `hermes/` (socket + stores), `zbiornik/ops.ts` |
| `src/stores/` | Zustand `useAppStore.ts` (nav/modals/FX/audio/layout) |
| `src/db/` | `index.ts` — postgres-js pool, idempotent `initDb()`, `insertLog()` |
| `sidecar/` | `main.py` (33+ endpoints + WebSockets), `automations/` (engagement/topics/deduplication/verification/zbiornik), `tests/` |
| `scripts/` | `pg-*.cjs` Postgres one-off patches; `legacy_archive/` (retired root Python pipeline) |
| `docs/` | `current-state.md`, `implementation-plan.md` (F0–F6), `decisions.md` (ADRs), `zbiornik-ops.md` |
| `drizzle/` | Generated SQL migrations; `_legacy-sqlite/` holds the retired SQLite dialect |
| `backend/` | Empty — removed service; do not add code or commands here |

## Development Commands

```bash
# Repo root (npm; Node 20, Next.js 16)
npm run dev        # next dev
npm run build      # next build — build-time env vars must be set first (see Dockerfile.next)
npm run start      # next start
npm run lint       # eslint
npm run typecheck  # tsc --noEmit
npm test           # vitest run

# Sidecar (from sidecar/, Python 3.11)
pip install -r requirements-dev.txt
uvicorn main:app --port 8000
pytest tests/                      # sidecar suite

# Drizzle migrations (no npm alias — schema lives in src/lib/schema.ts)
npx drizzle-kit generate
npx drizzle-kit push

# Full stack
docker compose up   # postgres:16 + web + sidecar + qdrant + redis on `dirtynest-network`
```

`typecheck` + `lint` + `test` (vitest) are the frontend QA gates.

## Code Conventions & Common Patterns

- **Naming**: kebab-case files/dirs; PascalCase components (filename = default export); camelCase functions/vars; `SCREAMING_SNAKE` constants; status enums like `draft`/`approved`/`published`, `INFO`/`SUCCESS`. Polish comments/strings in zbiornik code; English elsewhere.
- **`"use client"`** at the top of every UI file and client-side lib module.
- **Error handling** (route handlers): `try/catch (err: unknown)`, narrow via `err instanceof Error ? err.message : String(err)`, return `Response.json({ error }, { status: 4xx/5xx })`. Business logic belongs in `src/lib/` helpers, not in routes. Sidecar calls never throw — they resolve `{ok, status, data, error}`. Intentional empty `catch {}` blocks (localStorage, audio, sidecar fallbacks) exist — do not "fix" them.
- **API route pattern**: `export async function GET/POST/DELETE(request)`; early-return input validation; `export const dynamic = "force-dynamic"` on sidecar-proxying routes (`/api/zbiornik/publish` also sets `maxDuration = 300`). Client fetch via `apiJson<T>()` wrappers; UI fails closed (e.g. Zbiornik view requires `loginCode === "OK"`).
- **State management**: Zustand `create<T>()((set, get) => ...)`; stores: `src/stores/useAppStore.ts` (nav/modals/FX), `src/lib/hermes/hermesStore.ts` + `hermesAcpStore.ts` (agents/HITL; socket writes via `getState()`). No Redux/React-Query. Components otherwise use `useState` + `useEffect`/`useCallback` with refresh-key counters.
- **Dependency injection**: none — module singletons (`hermesSocket`, `cyberAudio`, `cyberSpeech`) + Zustand.
- **Async patterns**: `async/await` throughout route handlers; `AbortSignal.timeout` for sidecar HTTP; WS singleton with reconnect timer and status listeners; streaming via `ReadableStream` + `for-await` (chat).
- **Styling**: Tailwind v4 CSS-first (no config file; theme in `src/app/globals.css`, shadcn style `radix-nova`), `cn()` = `twMerge(clsx(...))` from `src/lib/utils.ts`; heavy arbitrary-value neon classes (`bg-[#00F0FF]/10`, `#00FF41`, `#BF40FF`) plus custom `cyber-card`/`hud-corner` classes; runtime theme injection via `src/lib/theme.ts`.
- **DB access**: Drizzle over postgres-js; single shared pool in `src/db/index.ts`; schema in `src/lib/schema.ts`; `initDb()` for idempotent table creation + seeding. Credentials come only from `DATABASE_URL` (`.env.local`/env — no hardcoded fallbacks).
- **Language**: code comments/UI strings in English; Polish comments/strings in the zbiornik module; repo docs are mostly Polish.

## Important Files

- `src/app/page.tsx` — the entire SPA (~1478 lines): view switching, dashboard widget grid, modals, window manager, global shortcuts.
- `src/app/layout.tsx` — fonts, `ThemeInitializer`, `TooltipProvider`, sonner `Toaster`, PWA manifest; hard-coded `dark` theme.
- `src/lib/schema.ts` + `src/db/index.ts` — all Drizzle tables (`todos`, `notes`, `quick_links`, `calendar_events`, `focus_sessions`, `system_logs`, `hermes_*`, `zb*`) and the shared pool.
- `src/lib/hermes/hermesSocket.ts` / `hermesStore.ts` / `hermesAcpStore.ts` — sidecar WS client + agent/ACP/HITL state.
- `src/lib/zbiornik/ops.ts` — server-side sidecar HTTP client; HITL queue, rules, publish gate.
- `src/app/api/chat/route.ts` — Gemini streaming proxy (`GEMINI_API_KEY`/`GOOGLE_API_KEY` or client-supplied key).
- `sidecar/main.py` — FastAPI app (33+ endpoints, WS `/ws/telemetry|/ws/acp|/ws/terminal`); `sidecar/automations/zbiornik.py` — ops manager + monitor service.
- `drizzle.config.ts` — schema → `src/lib/schema.ts`, out → `drizzle/`; contains a hardcoded DB-URL fallback (known debt — never add real secrets).
- `next.config.ts` — `serverExternalPackages: ["sql.js"]`; `allowedDevOrigins` incl. `*.trycloudflare.com`.
- **Docs authority order**: `docs/current-state.md` (real vs mock audit) → `docs/implementation-plan.md` (F0–F6 roadmap) → `docs/decisions.md` (ADR register) → `docs/zbiornik-ops.md` (ops contract). `README.md`/`DOCUMENTATION.md` are partly superseded.

## Runtime/Tooling Preferences

- **Package manager: npm** (package-lock.json v3; `npm ci` in Docker). No `engines` field; Docker builds on `node:20-alpine`.
- **Runtimes**: Node 20 + Next.js 16.3.2 / React 19 for the web tier; Python 3.11 (`sidecar/.venv`, uvicorn) for the sidecar. TypeScript strict, `noEmit`, alias `@/*` → `./src/*`, `isolatedModules`.
- **Next.js 16 has breaking changes vs training data** — read `node_modules/next/dist/docs/` before writing Next code. The auto-managed block at the top of this file is written and re-added by `next dev`; never strip it.
- **ESLint** (`eslint.config.mjs`): flat config extending `eslint-config-next`; `no-explicit-any` and `prefer-const` are off, several react-hooks purity rules are off — these relaxations are deliberate; keep lint errors at 0 (warnings are numerous and non-blocking). `sidecar/**` is fully ignored — treat `sidecar/` as a separate sub-project.
- **Styling**: Tailwind v4 via `@tailwindcss/postcss` only (CSS-first config in `globals.css`).
- **Env** (`.env.local`, gitignored — never commit secrets): `DATABASE_URL`, `NEXT_PUBLIC_SIDECAR_URL` (default `http://localhost:8000`), `QDRANT_URL`, `REDIS_URL`, `SEARXNG_URL`, `GEMINI_API_KEY`/`GOOGLE_API_KEY`.
- **Docker**: `Dockerfile.next` (multi-stage, node:20-alpine, non-root `nextjs`, standalone), `sidecar/Dockerfile` (uvicorn :8000), `docker-compose.yml` = postgres:16 + web + sidecar + qdrant + redis on `dirtynest-network`. SearXNG var exists but the service is not (yet) in compose.
- Root scratch/output artifacts (`.tmp-*.ps1`, `*.log`, `*.png`, `topics.json`, `drafts.md`, `verification-kit.md`, …) are transient working files — do not treat them as source.

## Testing & QA

- **Python suite**: `sidecar/tests/test_zbiornik.py` — pytest unit tests for `sidecar/automations/zbiornik.py` (run-op guard rails, tolerant JSON parsing, poll login gating, monitor snapshots). Pure unit tests: `tmp_path`, `unittest.mock.patch`/`monkeypatch`, `@pytest.mark.parametrize`; no network/browser/real subprocess; `sys.path.insert` handles imports (no conftest/pytest.ini).
- **Run**: `pytest tests/` from `sidecar/` (or `pytest sidecar/tests/` from root); installed via `pip install -r requirements-dev.txt`.
- **JS/TS tests**: vitest (`npm test`) — `src/lib/*.test.ts` suites (utils, widgetLayout, theme) run under happy-dom.
- **CI**: `.github/workflows/ci.yml` (lint + typecheck + vitest on node 20; pytest on python 3.11); no pre-commit/husky.
- **Coverage**: none formalized; no coverage tooling. `docs/implementation-plan.md` mandates "tests per phase" as a standing F0–F6 rule. Untested sidecar modules: `engagement.py`, `topics.py`, `verification.py`, `deduplication.py`.