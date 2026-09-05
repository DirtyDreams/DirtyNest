# DirtyNest codebase index

_Last reviewed: 2026-09-05_

This file is a navigation index for the current repository state. It is based on the source tree and selected entry points, not just the existing docs.

## 1. At a glance

DirtyNest is a single-repo application with two runtime tiers:

- **Next.js app at repo root**: SPA shell, App Router API routes, Drizzle/Postgres persistence.
- **Python sidecar in `sidecar/`**: FastAPI service for telemetry, Hermes ACP bridge, Docker, CDP, cron, knowledge, and automations.

## 2. Primary entry points

### Frontend / web app

- `src/app/page.tsx`
  - Main SPA shell.
  - Composes the dashboard widgets plus dynamically imported deck views.
  - Syncs active view to the URL hash.
- `src/app/layout.tsx`
  - Global layout, fonts, theme initializer, tooltip provider, toaster.
- `src/middleware.ts`
  - Protects `/api/*` routes except auth.
  - Adds simple in-memory rate limiting for `/api/auth/*` and `/api/chat/*` paths.

### Data layer

- `src/db/index.ts`
  - Shared Postgres client + Drizzle instance.
  - Runs migrations with `migrate()`.
  - Seeds notes, quick links, calendar events, todos, users, and agent configs.
- `src/lib/db.ts`
  - Compatibility re-export layer pointing to `src/db/index.ts`.
- `src/lib/schema.ts`
  - Central Drizzle schema.
  - Current file defines tables for core app data, auth, Hermes, knowledge, social, Zbiornik, audit, Docker cache, and CVE intel.

### Agent/runtime integration

- `src/lib/orchestrator/classifier.ts`
  - Rule-based prompt routing with optional LLM fallback.
- `src/lib/orchestrator/registry.ts`
  - Loads enabled agent configs from the database.
- `src/lib/orchestrator/acpBridge.ts`
  - Maps sidecar ACP events to persisted chat/tool history.
  - Maintains a server-side bridge to `/ws/acp`.
- `src/lib/hermes/hermesSocket.ts`
  - Client WebSocket for telemetry and ACP event forwarding.

### Sidecar

- `sidecar/main.py`
  - FastAPI app entry point.
  - Owns telemetry broadcast loop, WebSocket connection manager, ACP/Docker/CDP/automation endpoints, JWT verification for WS handshakes.

## 3. Top-level directory index

| Path | Purpose |
|---|---|
| `src/app/` | App Router shell and REST API routes |
| `src/components/` | UI components, deck views, widgets, modals, terminal, desktop shell |
| `src/db/` | Shared Drizzle/Postgres runtime |
| `src/lib/` | Business logic and integrations |
| `src/stores/` | Zustand app/auth stores |
| `src/types/` | Shared TS types |
| `sidecar/` | FastAPI operational sidecar |
| `drizzle/` | SQL migrations |
| `docs/` | ADRs, audits, plans, and repo docs |
| `e2e/` | Playwright tests |
| `scripts/` | Project scripts and utilities |
| `public/` | Static assets |
| `searxng/` | SearXNG config mounted by compose |

## 4. Frontend index

### SPA shell and navigation

The SPA shell lives in `src/app/page.tsx` and combines:

- layout chrome: sidebar, right panel, status bar, command palette, mobile nav
- modal systems: settings, theme, dashboard customization, dev tools, audio, quick commands
- desktop/window affordances: `TerminalDock`, `CyberWindowManager`
- overview dashboard widgets rendered directly in the shell
- dynamic deck imports with `ssr: false`

### Deck views

The repository currently contains these deck view components in `src/components/views/`:

- `AiAgentsView.tsx`
- `ApiHealthView.tsx`
- `ChatbotView.tsx`
- `ControlRoomView.tsx`
- `DockerView.tsx`
- `ImageStudioView.tsx`
- `IntelFeedView.tsx`
- `KnowledgeView.tsx`
- `LogsView.tsx`
- `PersonaNexusView.tsx`
- `ScheduleView.tsx`
- `SettingsView.tsx`
- `SocialMediaView.tsx`
- `SoundStudioView.tsx`
- `StatsView.tsx`
- `ToolsView.tsx`
- `ZbiornikOpsView.tsx`

Notes:

- Existing docs often say **16 decks**. The current tree has **17 named `*View.tsx` deck components**, plus the overview/dashboard content embedded in `page.tsx`.
- `src/components/views/` also contains per-domain subfolders like `chatbot/`, `control_room/`, `social_media/`, and `zbiornik_ops/`.

### Stores and client state

- `src/stores/useAppStore.ts`
- `src/stores/useAuthStore.ts`
- `src/stores/useRealAuthStore.ts`
- Hermes-specific client state is under `src/lib/hermes/`

## 5. API route index

There are **54** App Router `route.ts` files under `src/app/api/`.

### Auth

- `/api/auth/login`
- `/api/auth/logout`
- `/api/auth/me`
- `/api/auth/refresh`
- `/api/auth/api-keys`
- `/api/auth/ws-token`

### Core productivity / shell data

- `/api/todos`
- `/api/todos/[id]`
- `/api/notes`
- `/api/quick-links`
- `/api/quick-links/[id]`
- `/api/calendar`
- `/api/calendar/[id]`
- `/api/focus`
- `/api/focus/total`
- `/api/logs`
- `/api/logs/stats`
- `/api/import`

### Hermes / ACP

- `/api/hermes/acp/sessions`
- `/api/hermes/acp/sessions/[id]`
- `/api/hermes/acp/gate/resolve`
- `/api/hermes/acp/cancel`
- `/api/hermes/memories`
- `/api/hermes/memories/[id]`

### Docker

- `/api/docker/containers/[id]/action`
- `/api/docker/stacks`

### Knowledge

- `/api/knowledge/docs`
- `/api/knowledge/docs/[id]`
- `/api/knowledge/search`
- `/api/knowledge/graph`
- `/api/knowledge/stats`
- `/api/knowledge/tags`
- `/api/knowledge/obsidian/sync`

### Social

- `/api/social/accounts`
- `/api/social/accounts/[id]`
- `/api/social/posts`
- `/api/social/posts/[id]`
- `/api/social/posts/[id]/publish`
- `/api/social/posts/[id]/cancel`
- `/api/social/posts/[id]/metrics`
- `/api/social/analytics`
- `/api/social/gate/resolve`

### Intel / audit

- `/api/intel/cve`
- `/api/audit/logs`

### Zbiornik

- `/api/zbiornik/activity`
- `/api/zbiornik/ingest`
- `/api/zbiornik/poll`
- `/api/zbiornik/publish`
- `/api/zbiornik/queue`
- `/api/zbiornik/queue/[id]`
- `/api/zbiornik/rules`
- `/api/zbiornik/status`
- `/api/zbiornik/top`
- `/api/zbiornik/topics`

## 6. Database schema index

`src/lib/schema.ts` currently defines these table groups:

### Core app

- `todos`
- `notes`
- `quick_links`
- `calendar_events`
- `focus_sessions`
- `system_logs`

### Hermes / ACP

- `hermes_sessions`
- `hermes_messages`
- `hermes_tool_logs`
- `hermes_memories`

### Zbiornik

- `zb_topics`
- `zb_queue`
- `zb_activity_log`
- `zb_rules`

### Auth and chat

- `users`
- `chat_sessions`
- `chat_messages`
- `agent_configs`

### Knowledge

- `knowledge_docs`
- `knowledge_graph_edges`

### Social

- `social_accounts`
- `social_posts`
- `social_metrics`

### Audit / infra / intel

- `audit_logs`
- `docker_containers_cache`
- `intel_cves`

## 7. Sidecar index

### Main modules

- `sidecar/main.py` — FastAPI app, telemetry loop, WS manager, endpoint definitions
- `sidecar/acp_client.py` — Hermes ACP bridge
- `sidecar/cdp_service.py` — Chrome DevTools operations
- `sidecar/docker_service.py` — Docker integration
- `sidecar/cron_service.py` — cron scheduler / broadcast integration
- `sidecar/knowledge_service.py` — Qdrant-backed knowledge operations
- `sidecar/memory_service.py` — Hermes memory service
- `sidecar/intel_service.py` — threat intel / CVE logic
- `sidecar/social_scheduler.py` — scheduling logic
- `sidecar/automations/` — engagement, topics, dedup, verification, Zbiornik, social adapters

### Sidecar tests

`sidecar/tests/` currently contains 8 test files:

- `test_acp_bridge.py`
- `test_cdp_social_adapters.py`
- `test_docker_service.py`
- `test_intel_service.py`
- `test_knowledge_service.py`
- `test_social_adapters.py`
- `test_social_scheduler.py`
- `test_zbiornik.py`

## 8. Infra and tooling index

### Web tooling

- `package.json`
  - `dev`, `build`, `start`, `lint`, `typecheck`, `test`, `test:e2e`, `docs:api`
- `next.config.ts`
- `eslint.config.mjs`
- `vitest.config.ts`
- `playwright.config.ts`
- `drizzle.config.ts`

### Containers

- `docker-compose.yml`
  - defines `postgres`, `qdrant`, `redis`, `searxng`, `ollama`, `web`, `sidecar`
- `Dockerfile.next`
- `sidecar/Dockerfile`

### CI

- `.github/workflows/ci.yml`
  - Node: typecheck, lint, vitest, build
  - Python: sidecar venv + pytest
  - Playwright e2e job

## 9. Review notes

These are the biggest repo-level observations from this inspection.

### 1. Docs-to-code drift exists

A few project docs describe paths or states that do not exactly match the current tree:

- The docs mention `src/app/api/chat/*`, but the current repo tree does **not** contain that directory.
- The active ACP/session surface is under `src/app/api/hermes/acp/*`.
- Existing docs say **16 decks**; the current tree has **17 deck view components** plus the shell dashboard.

### 2. Some UI surfaces still contain demo/mock framing

Two important deck entry files contain substantial mock/demo-shaped UI state alongside real ACP integration:

- `src/components/views/ChatbotView.tsx`
- `src/components/views/ControlRoomView.tsx`

Both are wired to real Hermes ACP store hooks, but also still embed placeholder sessions, canned text, or legacy “harness” terminology in the component itself.

### 3. Legacy residue is still present

- `next.config.ts` still lists `serverExternalPackages: ["sql.js"]`.
- `package.json` no longer includes `sql.js`.

That suggests leftover config from an older storage model.

### 4. The current runtime architecture is more mature than some top-level prose suggests

The current codebase already includes:

- auth routes and middleware
- agent registry + routing logic
- knowledge, social, audit, intel, and Zbiornik APIs
- sidecar integrations for telemetry, ACP, Docker, CDP, cron, and automations

So newer source files show a broader implemented surface than older “in progress” summaries imply.

### 5. Static diagnostics are clean right now

Project diagnostics returned:

- **0 errors**
- **0 warnings**

## 10. Recommended navigation order for new contributors

If you are onboarding into the repo, read in this order:

1. `AGENTS.md`
2. `docs/current-state.md`
3. `CONTEXT.md`
4. `src/app/page.tsx`
5. `src/lib/schema.ts`
6. `src/db/index.ts`
7. `src/lib/orchestrator/classifier.ts`
8. `src/lib/orchestrator/acpBridge.ts`
9. `src/lib/hermes/hermesSocket.ts`
10. `sidecar/main.py`
11. `docker-compose.yml`
12. `.github/workflows/ci.yml`

## 11. Suggested next maintenance task

The highest-value documentation cleanup would be to align `README.md` and `docs/current-state.md` with the actual route tree, deck count, and runtime ownership boundaries.
