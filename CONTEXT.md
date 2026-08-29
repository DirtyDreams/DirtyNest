# DirtyNest — Context (glossary)

Single-page command center orchestrating AI agents, automation, and infrastructure for a two-person homelab. This file defines the project's canonical vocabulary; implementation truth lives in `src/lib/schema.ts`, `docs/current-state.md`, and `docs/adr/`.

## Language

### Core architecture

**Engine**:
The Hermes ACP process (profile `dirtydaily`) that runs all agent chat — routing, tool calls, HITL, streaming.
_Avoid_: Harness, DeepSeek Harness, dsh, agent engine, mózg (brain)

**Sidecar**:
The Python FastAPI service (`sidecar/`, :8000): ACP bridge to the Engine, Chrome CDP, Docker control, cron, memory, social/zbiornik automations. The only non-Next service.
_Avoid_: backend, API server

**Orchestrator**:
The router in `src/lib/orchestrator/` that classifies a prompt (rule-based + fallback) and forwards it to the sidecar ACP endpoint. Lives in the Next layer, not a separate service.
_Avoid_: AgentOrchestratorProxy, backend orchestrator

**Agent config**:
A row in `agent_configs` (seeded ~6): name, system prompt, allowed tools, LLM backend attribute. The agent registry is data, not code.
_Avoid_: soul.md, persona file

**Next layer (API)**:
The Next.js App Router route handlers under `src/app/api/*` — DirtyNest's REST surface, talking to Postgres via Drizzle and to the Sidecar over REST/WS.
_Avoid_: backend, integration layer, Express/Fastify service

### Execution & safety

**HITL Gate**:
The mandatory approval step for `critical`-risk actions (social publish, docker stop, FS/shell writes, knowledge delete). Operator approves in Control Room; decision logged in `hermes_tool_logs.permission_status` / `zb_activity_log`.
_Avoid_: confirmation dialog, permission prompt

**Minion**:
A named auxiliary agent process from the Hermes ecosystem (e.g. SkillClaw, jcode) surfaced in the AI Agents view; status comes from live port probes, not the old hardcoded registry.
_Avoid_: bot, worker

**Zbiornik Ops**:
The automation contract for zbiornik.com — CDP runner (`zbiornik-ops.mjs`), HITL queue, rate limits, 1-on-1 contact only. See `docs/zbiornik-ops.md`.
_Avoid_: bot, scraper

**Adapter (social)**:
Platform integration behind one interface (`publish/schedule/metrics/verify`); path = CDP by default (ADR-0013), official API only where CDP fails. Only Reddit is real today; X/IG/FB/TikTok are `MockAdapter` stubs.
_Avoid_: connector, plugin

### Data & UI

**Vault (Knowledge Vault)**:
Documents + Qdrant vectors + graph edges behind `/api/knowledge/*`; agents reach it via the `semantic_search` tool. Distinct from Hermes memory (session facts).
_Avoid_: memory, RAG store, Knowledge Base

**Deck**:
One of the ~16 full-screen workspaces of the SPA (Control Room, Docker Hub, Zbiornik Ops…), composed in `page.tsx` from `src/components/views/*`.
_Avoid_: page, view (use "deck" in docs; "View" only as component suffix)

**Control Room**:
The deck consuming the live agent event stream and hosting HITL approvals.
_Avoid_: dashboard, monitor

**Agent event**:
One streamed step of an agent run (`thinking | tool_call | tool_result | token | source | hitl_gate | done | error`) crossing sidecar WS → hermesSocket → stores. Contract owner: `src/lib/orchestrator/acpBridge.ts` (ADR-0007).
_Avoid_: message, update, tick

**System log**:
Audit row in `system_logs` (client- and API-side actions). Superset in `audit_logs` since F6.
_Avoid_: console log

### Legacy / rejected terms (do not use as current truth)

**Harness / DeepSeek Harness / dsh**:
Rejected blueprint (ADR-0011) naming a Node integration layer + `@deepseek-ai/dsh` engine. Docs using it are marked superseded.
_Avoid_ in new docs entirely.

**Backend (as a service)**:
There is no standalone backend service (ADR-0012); the word means the Next API layer at most.