# Backend Reconciliation Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Restore and reconcile the complete, verified F0–F7 backend architecture from commit `60a17ce` (Postgres Drizzle schema, FastAPI sidecar services, Hermes ACP orchestrator, JWT auth with Dev Quick-Login, and API routes) with the latest Luminous Cyber-Industrial UI and design tokens.

**Architecture:** Two-tier architecture in a single monorepo: Next.js 16.3.2 App Router (TypeScript, Drizzle ORM, JWT Auth, Intent Classifier & ACP Bridge) + Python 3.11 FastAPI Sidecar (:8000, Hermes ACP `dirtydaily`, Chrome CDP :9222/:9333, Qdrant vector engine, Docker control, cron scheduling).

**Tech Stack:** Next.js 16.3.2, React 19, TypeScript, Drizzle ORM (PostgreSQL 16), FastAPI, Python 3.11, Qdrant, FastEmbed, Chrome DevTools Protocol (CDP), Jose (JWT), Vitest, Pytest.

**Spec:** [`docs/superpowers/specs/2026-09-06-backend-reconciliation-design.md`](file:///c:/Users/coyot/workspace/dirty-test/docs/superpowers/specs/2026-09-06-backend-reconciliation-design.md)

## Global Constraints
- Target commit for restored files: `60a17ce`
- Zero regressions in existing Luminous Cyber-Industrial UI components, `globals.css` Stitch tokens, or newly added skills (`.agents/skills/archify`)
- TypeScript strict mode compliance: 0 errors on `npm run typecheck`
- ESLint strict mode compliance: 0 errors / 0 warnings on `npm run lint`
- All unit and integration test suites must pass: `npm test` (Vitest) and `pytest tests/` (Pytest)

---

### Task 1: Data Layer & Relational Schema Restoration

**Files:**
- Restore: `src/lib/schema.ts` (from `60a17ce`)
- Restore: `drizzle/` migrations 0002 through 0007 and snapshot metadata (from `60a17ce`)
- Restore: `src/db/index.ts` (from `60a17ce`)

**Interfaces:**
- Consumes: PostgreSQL 16 database pool via `postgres-js`.
- Produces: Complete Drizzle schema exporting `users`, `auditLogs`, `systemLogs`, `chatSessions`, `chatMessages`, `agentConfigs`, `knowledgeDocs`, `knowledgeGraphEdges`, `socialAccounts`, `socialPosts`, `socialMetrics`, `zbTopics`, `zbQueue`, `zbActivityLog`, `zbRules`, `todos`, `notes`, `quickLinks`, `calendarEvents`, `focusSessions`, `hermesSessions`, `hermesMessages`, `hermesToolLogs`, `hermesMemories`.

- [ ] **Step 1: Checkout relational schema and migrations from commit `60a17ce`**

```bash
git checkout 60a17ce -- src/lib/schema.ts drizzle/ src/db/index.ts
```

- [ ] **Step 2: Verify schema export and integrity with typecheck**

Run: `npx tsc --noEmit src/lib/schema.ts src/db/index.ts`
Expected: PASS with 0 errors.

- [ ] **Step 3: Commit restored data layer**

```bash
git add src/lib/schema.ts drizzle/ src/db/index.ts
git commit -m "feat(db): restore PostgreSQL Drizzle schema and migrations from 60a17ce"
```

---

### Task 2: Sidecar Engine & Automations Restoration

**Files:**
- Restore: `sidecar/acp_client.py`
- Restore: `sidecar/cdp_service.py`
- Restore: `sidecar/docker_service.py`
- Restore: `sidecar/intel_service.py`
- Restore: `sidecar/memory_service.py`
- Restore: `sidecar/social_scheduler.py`
- Restore: `sidecar/automations/adapters/*` (`base.py`, `cdp_adapter.py`, `facebook.py`, `instagram.py`, `mock.py`, `reddit.py`, `tiktok.py`, `twitter.py`)
- Restore: `sidecar/tests/*`
- Restore: `sidecar/requirements.txt`
- Restore: `sidecar/requirements-dev.txt`
- Restore: `sidecar/main.py` (from `60a17ce`)

**Interfaces:**
- Consumes: Python 3.11, FastAPI, Chrome CDP (:9222), Hermes ACP, Qdrant client.
- Produces: Endpoints for `/api/hermes/*`, `/api/docker/*`, `/api/intel/*`, `/api/automations/*`, and WebSockets `/ws/telemetry` & `/ws/acp`.

- [ ] **Step 1: Checkout sidecar services, adapters, and tests from commit `60a17ce`**

```bash
git checkout 60a17ce -- sidecar/acp_client.py sidecar/cdp_service.py sidecar/docker_service.py sidecar/intel_service.py sidecar/memory_service.py sidecar/social_scheduler.py sidecar/automations/adapters/ sidecar/tests/ sidecar/requirements.txt sidecar/requirements-dev.txt sidecar/main.py
```

- [ ] **Step 2: Run sidecar pytest test suite**

Run: `cd sidecar && pytest tests/ -v` (or via Python environment)
Expected: PASS (all 86 tests pass).

- [ ] **Step 3: Commit restored sidecar modules**

```bash
git add sidecar/
git commit -m "feat(sidecar): restore FastAPI ACP, CDP, Docker, Knowledge, and Social adapters from 60a17ce"
```

---

### Task 3: Next.js Core Libs & Orchestrator Restoration

**Files:**
- Restore: `src/lib/orchestrator/*` (`classifier.ts`, `acpBridge.ts`, `registry.ts`, `persist.ts`, `sidecar.ts`, `types.ts`, test files)
- Restore: `src/lib/auth/*` (`jwt.ts`, `cookies.ts`, `currentUser.ts`, `encryption.ts`, test files)
- Restore: `src/lib/docker/sidecar.ts`
- Restore: `src/lib/intel/sidecar.ts`
- Restore: `src/lib/knowledge/sidecar.ts`
- Restore: `src/lib/social/sidecar.ts`
- Restore: `src/lib/social/publish.ts`
- Restore: `src/middleware.ts`
- Restore: `src/stores/useRealAuthStore.ts`

**Interfaces:**
- Consumes: `src/lib/schema.ts`, `sidecar` endpoints via HTTP & WS.
- Produces: `Classifier`, `AcpBridge`, `verifyJwt`, `encryptApiKey`, `decryptApiKey`, `useRealAuthStore`.

- [ ] **Step 1: Checkout orchestrator, auth, and client bridge libs from `60a17ce`**

```bash
git checkout 60a17ce -- src/lib/orchestrator/ src/lib/auth/ src/lib/docker/ src/lib/intel/ src/lib/knowledge/ src/lib/social/ src/middleware.ts src/stores/useRealAuthStore.ts
```

- [ ] **Step 2: Run Vitest on restored orchestrator and auth modules**

Run: `npx vitest run src/lib/orchestrator src/lib/auth`
Expected: PASS (classifier snapshots, bridge event mapping, jwt and encryption tests pass).

- [ ] **Step 3: Commit restored core libs and orchestrator**

```bash
git add src/lib/orchestrator/ src/lib/auth/ src/lib/docker/ src/lib/intel/ src/lib/knowledge/ src/lib/social/ src/middleware.ts src/stores/useRealAuthStore.ts
git commit -m "feat(orchestrator): restore agent classifier, ACP bridge, and JWT auth libs from 60a17ce"
```

---

### Task 4: Next.js API Routes Restoration

**Files:**
- Restore: `src/app/api/auth/*` (`api-keys`, `login`, `logout`, `me`, `refresh`, `ws-token` + tests)
- Restore: `src/app/api/chat/*` (`sessions`, `agents`, `messages`)
- Restore: `src/app/api/docker/*` (`containers`, `stacks` + tests)
- Restore: `src/app/api/intel/*` (`cve` + tests)
- Restore: `src/app/api/knowledge/*` (`docs`, `graph`, `obsidian/sync`, `search`, `stats`, `tags` + tests)
- Restore: `src/app/api/social/*` (`accounts`, `analytics`, `gate/resolve`, `posts` + tests)
- Restore: `src/app/api/audit/*` (`logs` + tests)
- Restore: `src/app/api/hermes/*` (`acp`, `memories`)

**Interfaces:**
- Consumes: `src/lib/schema.ts`, `src/lib/orchestrator/*`, `src/lib/auth/*`, Sidecar HTTP API.
- Produces: REST API endpoints under `/api/*` validated with Zod and protected by JWT.

- [ ] **Step 1: Checkout API routes and their vitest test files from `60a17ce`**

```bash
git checkout 60a17ce -- src/app/api/auth/ src/app/api/chat/ src/app/api/docker/ src/app/api/intel/ src/app/api/knowledge/ src/app/api/social/ src/app/api/audit/ src/app/api/hermes/
```

- [ ] **Step 2: Run Vitest on API route tests**

Run: `npx vitest run src/app/api`
Expected: PASS (all API route tests pass).

- [ ] **Step 3: Commit restored API routes**

```bash
git add src/app/api/
git commit -m "feat(api): restore auth, chat, docker, intel, knowledge, and social API routes from 60a17ce"
```

---

### Task 5: Infrastructure & ADRs Restoration

**Files:**
- Restore: `docker-compose.yml` (from `60a17ce`)
- Restore: `searxng/` configuration (from `60a17ce`)
- Restore: `scripts/backup.sh`, `scripts/ollama-init.sh`, `scripts/calibrate_x.py`, `scripts/knowledge_eval.py`
- Restore: `docs/adr/` (ADR-0001 through ADR-0014)

**Interfaces:**
- Consumes: Docker engine, homelab network configuration.
- Produces: Full multi-container composition (`postgres`, `qdrant`, `redis`, `searxng`, `ollama`, `web`, `sidecar`) and official architectural records.

- [ ] **Step 1: Checkout infrastructure and ADR files from `60a17ce`**

```bash
git checkout 60a17ce -- docker-compose.yml searxng/ scripts/ docs/adr/
```

- [ ] **Step 2: Verify docker compose file validity**

Run: `docker compose config` (or dry-run parse)
Expected: Valid compose configuration with 7 services.

- [ ] **Step 3: Commit restored infrastructure and ADR documents**

```bash
git add docker-compose.yml searxng/ scripts/ docs/adr/
git commit -m "feat(infra): restore full 7-service docker-compose, searxng config, and ADR records from 60a17ce"
```

---

### Task 6: UI Auth Integration with Dev Quick-Login

**Files:**
- Restore & Update: `src/components/auth/LoginScreen.tsx`
- Restore & Update: `src/components/auth/RealAuthGate.tsx`
- Modify: `src/app/page.tsx`

**Interfaces:**
- Consumes: `useRealAuthStore` from `src/stores/useRealAuthStore.ts`, `/api/auth/login`.
- Produces: Protected SPA root with Luminous Cyber-Industrial styled authentication overlay and 1-click Dev Quick-Login button.

- [ ] **Step 1: Checkout `LoginScreen.tsx` and `RealAuthGate.tsx` from `60a17ce`**

```bash
git checkout 60a17ce -- src/components/auth/LoginScreen.tsx src/components/auth/RealAuthGate.tsx
```

- [ ] **Step 2: Add 1-click Dev Quick-Login button to `LoginScreen.tsx`**

Ensure `LoginScreen.tsx` provides a distinct "⚡ Quick Dev Login" button prefilling and submitting default homelab credentials (`dev` / password from `.env`) when in development environment.

- [ ] **Step 3: Ensure `RealAuthGate` wraps SPA in `src/app/page.tsx`**

Integrate `RealAuthGate` at the top of `src/app/page.tsx` while preserving all new Luminous UI header, sidebar, and context decks.

- [ ] **Step 4: Verify TypeScript build**

Run: `npm run typecheck`
Expected: PASS with 0 errors.

- [ ] **Step 5: Commit auth UI integration**

```bash
git add src/components/auth/ src/app/page.tsx
git commit -m "feat(auth): integrate RealAuthGate and LoginScreen with dev quick-login in page.tsx"
```

---

### Task 7: Full Repository Verification & Quality Gates

**Files:**
- Inspect: All touched files
- Verification commands:
  - `npm run typecheck`
  - `npm test`
  - `npm run lint`
  - `pytest tests/` (in `sidecar/`)

- [ ] **Step 1: Run TypeScript compiler check**

Run: `npm run typecheck`
Expected: 0 errors.

- [ ] **Step 2: Run frontend test suites (Vitest)**

Run: `npm test`
Expected: PASS (all Vitest suites pass).

- [ ] **Step 3: Run ESLint**

Run: `npm run lint`
Expected: 0 errors, 0 warnings.

- [ ] **Step 4: Run Sidecar Pytest suite**

Run: `cd sidecar && pytest tests/`
Expected: 86 passed.

- [ ] **Step 5: Final commit if any lint/typing formatting adjustments were needed**

```bash
git commit -m "chore(qa): ensure all verification quality gates pass across frontend and sidecar"
```
