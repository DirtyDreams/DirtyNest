# DirtyNest Backend Reconciliation & Architecture Design

- **Date:** 2026-09-06
- **Status:** Approved (Brainstorming Architectural Path)
- **Target Repository:** DirtyDreams/DirtyNest (`c:\Users\coyot\workspace\dirty-test`)
- **Reference Baseline:** Commit `60a17ce` ("docs: F7 acceptance closed — HITL publish live-verified on X AND Reddit")

---

## 1. Executive Summary

DirtyNest is a cyberpunk-themed operations hub and AI command center. Its backend architecture comprises two tiers in a single monorepo:
1. **Next.js 16.3.2 App Router** (React 19, TypeScript): Serves the SPA, provides authenticated REST API routes (`/api/*`), manages relational persistence via Drizzle ORM on PostgreSQL 16, orchestrates agent routing (rule-based + LLM fallback), and enforces Human-in-the-Loop (HITL) gates.
2. **Python 3.11 FastAPI Sidecar** (port 8000): Serves as the operational backbone for Hermes ACP agent bridge (profile `dirtydaily`), Chrome CDP automation (ports 9222/9333), Qdrant vector engine, Docker control, cron scheduling, and social automation adapters.

Following an accidental deletion of backend files in commit `61b339f` during UI redesign, this specification defines the technical plan for **Approach A (Surgical Domain Reconciliation)**: restoring the verified F0–F7 backend assets from commit `60a17ce` and integrating them seamlessly with the new Luminous Cyber-Industrial UI tokens, without regressing any frontend styling or newly created skills.

---

## 2. Architecture & Topology

```
                  ┌─────────────────────────────────────────────────────────┐
                  │                 Browser (SPA Shell)                     │
                  │  Next.js 16 (React 19, Tailwind v4, Luminous Cyber UI)   │
                  └─────────────┬───────────────────────────┬───────────────┘
                                │ fetch() (REST)            │ WebSocket (/ws/telemetry, /ws/acp)
                                ▼                           ▼
┌──────────────────────────────────────────────────┐ ┌──────────────────────────────────────┐
│  Tier 1: Next.js API Routes (port 3000)          │ │  Tier 2: Sidecar FastAPI (port 8000) │
│  - Routes: /api/auth, /api/chat, /api/knowledge, │ │  - ACP Bridge to Hermes (dirtydaily) │
│    /api/social, /api/docker, /api/zbiornik       │ │  - Chrome CDP Automation (:9222)     │
│  - JWT (jose, httpOnly cookie) + AES-GCM keys    │ │  - Qdrant Vector Engine (fastembed)  │
│  - Intent Classifier & Agent Router              │ │  - Docker Management (/var/run)      │
│  - Drizzle ORM (postgres-js pool max 10)         │ │  - Social Scheduler & Cron Engine    │
└─────────────────────────┬────────────────────────┘ └──────────────┬───────────────────────┘
                          │                                         │
                          ▼                                         ▼
┌───────────────────────────────────────────────────────────────────────────────────────────┐
│                     Docker Compose Infrastructure (dirtynest-net)                         │
│  • postgres:16-alpine (:5432) — relational state & immutable audit logs                   │
│  • qdrant/qdrant (:6333/:6334) — Knowledge Vault & session memory vectors                │
│  • redis:7-alpine (:6379) — cache & asynchronous task coordination                       │
│  • searxng/searxng (:8080) — private meta-search engine for research agents               │
│  • ollama/ollama (:11434) — local LLMs (Llama 3.1 8B, Qwen) for cost-effective fallback │
│  • web (:3000) & sidecar (:8000) containers                                               │
└───────────────────────────────────────────────────────────────────────────────────────────┘
```

---

## 3. Data Layer Specification

### 3.1 Relational Schema (PostgreSQL 16 / Drizzle ORM)
Located in `src/lib/schema.ts`, executed via Drizzle migrations in `drizzle/`:

1. **Authentication & Audit:**
   - `users`: `id`, `username`, `password_hash` (bcrypt), `display_name`, `role` (`admin`), `api_keys_encrypted` (AES-256-GCM), `created_at`.
   - `audit_logs`: `id`, `timestamp`, `user_id`, `action`, `category`, `target_id`, `details_json`, `ip_address`, `status`.
   - `system_logs`: `id`, `timestamp`, `level`, `category`, `action`, `actor`, `details`, `latency_ms`, `status_code`, `ip_origin`, `hash_sig`.

2. **Agentic Chat & Orchestrator:**
   - `chat_sessions`: `id`, `title`, `agent_type`, `status`, `orchestrator_decision` (classifier metadata), `created_at`, `updated_at`.
   - `chat_messages`: `id`, `session_id`, `role`, `content`, `agent_used`, `reasoning_trace`, `tool_calls_json`, `citations_json`, `execution_time_ms`, `created_at`.
   - `agent_configs`: `id`, `name`, `type` (`security`|`coder`|`social`|`scheduler`|`research`|`generalist`), `description`, `system_prompt`, `model_backend`, `tool_whitelist_json`, `hitl_policy_json`, `is_active`, `updated_at`.

3. **Knowledge Vault:**
   - `knowledge_docs`: `id`, `title`, `category`, `source_path`, `file_type`, `content`, `word_count`, `chunk_count`, `tags_json`, `qdrant_collection`, `created_at`, `updated_at`.
   - `knowledge_graph_edges`: `id`, `source_doc_id`, `target_doc_id`, `edge_type` (`backlink`|`tag`|`semantic`), `weight`, `created_at`.

4. **Social Media & Automations:**
   - `social_accounts`: `id`, `platform` (`twitter`|`reddit`|`facebook`|`instagram`|`tiktok`), `account_name`, `credentials_encrypted`, `status`, `updated_at`.
   - `social_posts`: `id`, `account_id`, `platform`, `content`, `media_urls_json`, `scheduled_at`, `published_at`, `status` (`draft`|`awaiting_hitl`|`approved`|`published`|`failed`), `hitl_gate_status`, `external_post_id`, `error_message`, `created_at`.
   - `social_metrics`: `id`, `post_id`, `platform`, `reach`, `likes`, `comments`, `shares`, `collected_at`.
   - `zb_topics`, `zb_queue`, `zb_activity_log`, `zb_rules`: Zbiornik.com HITL automation pipeline state.

5. **Personal Tools & Hermes Engine:**
   - `todos`, `notes`, `quick_links`, `calendar_events`, `focus_sessions`.
   - `hermes_sessions`, `hermes_messages`, `hermes_tool_logs`, `hermes_memories`.

### 3.2 Vector Layer (Qdrant)
- Collection: `knowledge_vault`
  - Vector size: 384 dimensions
  - Distance: Cosine
  - Embedding Model: `fastembed` (`BAAI/bge-small-en-v1.5`)
  - Payload: `{ doc_id, chunk_index, text, title, category, tags }`
- Search Strategy: Hybrid Search via Reciprocal Rank Fusion (RRF) combining Qdrant cosine similarity scores with PostgreSQL full-text search (`tsvector`).

---

## 4. Subsystem Specifications

### 4.1 Authentication & Dev Experience (ADR-0003)
- **Token Mechanism:** Stateless JWT (`jose`), access token (15-minute expiration, httpOnly cookie) + refresh token (7-day expiration, httpOnly cookie, automatic rotation).
- **Route Guard:** `src/middleware.ts` intercepts all requests to `/api/*` and UI decks, allowing unauthenticated access only to `/api/auth/login` and public assets.
- **Seeding:** On startup, `initDb()` seeds 2 administrator accounts if absent (`dev` and `admin` using passwords defined in `.env`).
- **Dev Quick-Login:** `LoginScreen.tsx` / `RealAuthGate.tsx` includes a fast "Quick Dev Login" button pre-populating dev credentials for rapid homelab access while fully preserving JWT security.
- **Secret Protection:** All third-party credentials and API keys stored in `users.api_keys_encrypted` are encrypted with AES-256-GCM.

### 4.2 Hermes Agentic Engine & Orchestrator (ADR-0001, ADR-0002, ADR-0007, ADR-0008)
- **Routing:**
  - `src/lib/orchestrator/classifier.ts`: Evaluates incoming user prompts against bilingual keyword rules for 6 agent specializations:
    1. `security` (Aegis): CVE patrol, vulnerability research, port scan analysis.
    2. `coder` (Cypher): Code generation, AST synthesis, refactoring.
    3. `social` (Nexus): Social content creation, engagement metrics.
    4. `scheduler` (Chronos): Health monitoring, Docker containers, cron jobs.
    5. `research` (Scribe): Knowledge Vault search, Obsidian queries, SearXNG.
    6. `generalist`: Broad assistance.
  - LLM Fallback: Low-cost local model (Ollama) or API JSON extraction if keyword score is ambiguous.
- **ACP Bridge & Streaming:**
  - `src/lib/orchestrator/acpBridge.ts` routes the prompt to FastAPI sidecar `POST /api/hermes/acp/prompt`.
  - Sidecar runs Hermes ACP agent (profile `dirtydaily`) and broadcasts real-time events over WebSocket `/ws/acp`.
  - Client (`src/lib/hermes/hermesSocket.ts`) dispatches events to `hermesAcpStore` indexed by `sessionId`.
- **HITL Enforcement:**
  - Tools with `risk_level: "critical"` (Docker write/destroy, social publishing, raw shell execution, system FS mutation) trigger `hitl_gate` event, halting agent execution.
  - User reviews tool call parameters in `ControlRoomView` or `HitlApprovalModal` and triggers `POST /api/hermes/acp/gate/resolve` to approve or reject.

### 4.3 Social Media Automation & CDP (ADR-0006, ADR-0013)
- **Architecture:** Chrome DevTools Protocol (CDP) first over fragile official APIs.
- **Adapters (`sidecar/automations/adapters/`):**
  - `twitter.py` (`XAdapter`): CDP automation on live browser instance (port 9222), human typing simulation, composer navigation.
  - `reddit.py` (`RedditAdapter`): Subreddit submission, inbox polling, deduplication.
  - `mock.py`: Standard stub for Facebook, Instagram, TikTok adhering to `BaseSocialAdapter`.
- **Scheduling Worker:** `sidecar/social_scheduler.py` polls `social_posts` table for scheduled posts and verifies that `hitl_gate_status == "approved"` before publishing.

### 4.4 Knowledge Vault & Obsidian Integration (ADR-0009)
- **Ingestion:** Text files split into chunks (900 chars, 150 overlap) via `knowledge_service.py` and indexed into Qdrant `knowledge_vault`.
- **Obsidian Sync:** Scans local Markdown vault, parses YAML frontmatter, maps `[[wikilinks]]` into `knowledge_graph_edges` table for interactive 2D/3D visualization.

---

## 5. Implementation Strategy (Domain Restoration)

To achieve 100% fidelity without disturbing the newly polished UI:
1. **Restore Data & Schema:**
   - Checkout `src/lib/schema.ts`, `drizzle/` migrations 0002–0007, and `src/db/index.ts` from `60a17ce`.
2. **Restore Sidecar Services & Tests:**
   - Checkout `sidecar/acp_client.py`, `cdp_service.py`, `docker_service.py`, `intel_service.py`, `memory_service.py`, `social_scheduler.py`, `automations/adapters/`, `tests/`, and `requirements.txt`.
3. **Restore Next.js API Routes & Orchestrator:**
   - Checkout `src/lib/orchestrator/*`, `src/lib/auth/*`, `src/lib/{docker,intel,knowledge,social}/*`.
   - Checkout `src/app/api/{auth,chat,docker,intel,knowledge,social,audit}/*`.
   - Checkout `src/middleware.ts` and `src/stores/useRealAuthStore.ts`.
4. **Restore Infrastructure & ADRs:**
   - Checkout `docker-compose.yml`, `searxng/`, `scripts/`, and `docs/adr/*`.
5. **Reconcile UI Integration:**
   - Integrate `RealAuthGate.tsx` / `LoginScreen.tsx` into `src/app/page.tsx` styled with the new Luminous Cyber Industrial tokens.
   - Add dev quick-login prefill button for seamless local development.

---

## 6. Verification & Quality Gates

The implementation must strictly satisfy all repository quality gates:
1. **TypeScript Typecheck:** `npm run typecheck` passes with 0 errors.
2. **ESLint:** `npm run lint` passes with 0 errors / 0 warnings.
3. **Frontend Vitest Suite:** `npm test` executes and passes (orchestrator classifier, acpBridge, auth encryption/jwt, route snapshots).
4. **Sidecar Pytest Suite:** `pytest tests/` in `sidecar/` passes all 86 unit and integration tests.
5. **E2E Smoke Verification:** Verify server boots, `/health` and `/api/hermes/status` respond with 200, and WebSocket handshake completes.
