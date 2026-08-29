# DirtyNest — API Catalog (generated)

> **GENERATED FILE — do not edit by hand.** Regenerate with `node scripts/gen-api-docs.mjs`.
> Source of truth: `src/app/api/**/route.ts` + `sidecar/main.py` decorators. Generated at commit `2fd422f`.
> Aspirational contracts live in `docs/api-specification.md`; this file reflects **code reality**.
> 54 Next.js route files (77 handlers), 47 sidecar endpoints.

### Next /api/audit/logs

| Method | Path | Notes |
|---|---|---|
| GET | `/api/audit/logs` | — |

### Next /api/auth/api-keys

| Method | Path | Notes |
|---|---|---|
| PUT | `/api/auth/api-keys` | — |

### Next /api/auth/login

| Method | Path | Notes |
|---|---|---|
| POST | `/api/auth/login` | — |

### Next /api/auth/logout

| Method | Path | Notes |
|---|---|---|
| POST | `/api/auth/logout` | — |

### Next /api/auth/me

| Method | Path | Notes |
|---|---|---|
| GET | `/api/auth/me` | — |

### Next /api/auth/refresh

| Method | Path | Notes |
|---|---|---|
| POST | `/api/auth/refresh` | — |

### Next /api/auth/ws-token

| Method | Path | Notes |
|---|---|---|
| GET | `/api/auth/ws-token` | — |

### Next /api/calendar

| Method | Path | Notes |
|---|---|---|
| GET, POST | `/api/calendar` | — |

### Next /api/calendar/:id

| Method | Path | Notes |
|---|---|---|
| PATCH, DELETE | `/api/calendar/:id` | — |

### Next /api/docker/containers

| Method | Path | Notes |
|---|---|---|
| POST | `/api/docker/containers/:id/action` | zod-validated |

### Next /api/docker/stacks

| Method | Path | Notes |
|---|---|---|
| GET | `/api/docker/stacks` | — |

### Next /api/focus

| Method | Path | Notes |
|---|---|---|
| POST | `/api/focus` | — |

### Next /api/focus/total

| Method | Path | Notes |
|---|---|---|
| GET | `/api/focus/total` | — |

### Next /api/hermes/acp

| Method | Path | Notes |
|---|---|---|
| POST | `/api/hermes/acp/cancel` | zod-validated |
| POST | `/api/hermes/acp/gate/resolve` | zod-validated |
| GET, POST | `/api/hermes/acp/sessions` | — |
| GET, PATCH, DELETE | `/api/hermes/acp/sessions/:id` | — |

### Next /api/hermes/memories

| Method | Path | Notes |
|---|---|---|
| GET, POST | `/api/hermes/memories` | — |
| DELETE | `/api/hermes/memories/:id` | — |

### Next /api/import

| Method | Path | Notes |
|---|---|---|
| POST | `/api/import` | — |

### Next /api/intel/cve

| Method | Path | Notes |
|---|---|---|
| GET | `/api/intel/cve` | — |

### Next /api/knowledge/docs

| Method | Path | Notes |
|---|---|---|
| GET, POST | `/api/knowledge/docs` | zod-validated |
| GET, PUT, DELETE | `/api/knowledge/docs/:id` | zod-validated |

### Next /api/knowledge/graph

| Method | Path | Notes |
|---|---|---|
| GET | `/api/knowledge/graph` | — |

### Next /api/knowledge/obsidian

| Method | Path | Notes |
|---|---|---|
| POST | `/api/knowledge/obsidian/sync` | zod-validated |

### Next /api/knowledge/search

| Method | Path | Notes |
|---|---|---|
| POST | `/api/knowledge/search` | zod-validated |

### Next /api/knowledge/stats

| Method | Path | Notes |
|---|---|---|
| GET | `/api/knowledge/stats` | — |

### Next /api/knowledge/tags

| Method | Path | Notes |
|---|---|---|
| GET | `/api/knowledge/tags` | — |

### Next /api/logs

| Method | Path | Notes |
|---|---|---|
| GET, POST, DELETE | `/api/logs` | — |

### Next /api/logs/stats

| Method | Path | Notes |
|---|---|---|
| GET | `/api/logs/stats` | — |

### Next /api/notes

| Method | Path | Notes |
|---|---|---|
| GET, PUT | `/api/notes` | — |

### Next /api/quick-links

| Method | Path | Notes |
|---|---|---|
| GET, POST | `/api/quick-links` | — |

### Next /api/quick-links/:id

| Method | Path | Notes |
|---|---|---|
| PATCH, DELETE | `/api/quick-links/:id` | — |

### Next /api/social/accounts

| Method | Path | Notes |
|---|---|---|
| GET, POST | `/api/social/accounts` | zod-validated |
| DELETE | `/api/social/accounts/:id` | — |

### Next /api/social/analytics

| Method | Path | Notes |
|---|---|---|
| GET | `/api/social/analytics` | — |

### Next /api/social/gate

| Method | Path | Notes |
|---|---|---|
| POST | `/api/social/gate/resolve` | zod-validated |

### Next /api/social/posts

| Method | Path | Notes |
|---|---|---|
| GET, POST | `/api/social/posts` | zod-validated |
| POST | `/api/social/posts/:id/cancel` | — |
| GET | `/api/social/posts/:id/metrics` | — |
| POST | `/api/social/posts/:id/publish` | zod-validated |
| GET, PUT, DELETE | `/api/social/posts/:id` | zod-validated |

### Next /api/todos

| Method | Path | Notes |
|---|---|---|
| GET, POST | `/api/todos` | — |

### Next /api/todos/:id

| Method | Path | Notes |
|---|---|---|
| PATCH, DELETE | `/api/todos/:id` | — |

### Next /api/zbiornik/activity

| Method | Path | Notes |
|---|---|---|
| GET | `/api/zbiornik/activity` | — |

### Next /api/zbiornik/ingest

| Method | Path | Notes |
|---|---|---|
| POST | `/api/zbiornik/ingest` | — |

### Next /api/zbiornik/poll

| Method | Path | Notes |
|---|---|---|
| POST | `/api/zbiornik/poll` | — |

### Next /api/zbiornik/publish

| Method | Path | Notes |
|---|---|---|
| POST | `/api/zbiornik/publish` | — |

### Next /api/zbiornik/queue

| Method | Path | Notes |
|---|---|---|
| GET, POST | `/api/zbiornik/queue` | — |
| PATCH, DELETE | `/api/zbiornik/queue/:id` | — |

### Next /api/zbiornik/rules

| Method | Path | Notes |
|---|---|---|
| GET, PATCH | `/api/zbiornik/rules` | — |

### Next /api/zbiornik/status

| Method | Path | Notes |
|---|---|---|
| GET | `/api/zbiornik/status` | — |

### Next /api/zbiornik/top

| Method | Path | Notes |
|---|---|---|
| GET | `/api/zbiornik/top` | — |

### Next /api/zbiornik/topics

| Method | Path | Notes |
|---|---|---|
| GET | `/api/zbiornik/topics` | — |

### Sidecar /api/automations

| Method | Path | Notes |
|---|---|---|
| GET | `/api/automations/status` | — |
| POST | `/api/automations/engagement/post` | — |
| POST | `/api/automations/engagement/reply` | — |
| POST | `/api/automations/dedup/clean` | — |
| GET | `/api/automations/topics/{subreddit}` | — |
| POST | `/api/automations/verification/crosscheck` | — |
| GET | `/api/automations/zbiornik/status` | — |
| POST | `/api/automations/zbiornik/read` | — |
| POST | `/api/automations/zbiornik/exec` | — |
| POST | `/api/automations/zbiornik/poll` | — |
| GET | `/api/automations/zbiornik/poll-latest` | — |

### Sidecar /api/chat

| Method | Path | Notes |
|---|---|---|
| POST | `/api/chat` | — |

### Sidecar /api/docker

| Method | Path | Notes |
|---|---|---|
| GET | `/api/docker/containers` | — |
| POST | `/api/docker/containers/{container_id}/action` | — |
| GET | `/api/docker/stacks` | — |

### Sidecar /api/hermes

| Method | Path | Notes |
|---|---|---|
| GET | `/api/hermes/status` | — |
| GET | `/api/hermes/acp/status` | — |
| POST | `/api/hermes/acp/sessions/new` | — |
| POST | `/api/hermes/acp/prompt` | — |
| POST | `/api/hermes/acp/gate/resolve` | HITL |
| POST | `/api/hermes/acp/cancel` | — |
| GET | `/api/hermes/memories` | — |
| GET | `/api/hermes/memories/search` | — |
| POST | `/api/hermes/memories` | — |
| GET | `/api/hermes/cdp/status` | — |
| POST | `/api/hermes/cdp/navigate` | HITL |
| POST | `/api/hermes/cdp/screenshot` | — |
| POST | `/api/hermes/cdp/extract` | — |
| POST | `/api/hermes/cdp/interact` | — |
| GET | `/api/hermes/minions` | — |
| GET | `/api/hermes/cron` | — |
| POST | `/api/hermes/cron/{job_name}/run` | — |
| POST | `/api/hermes/exec` | — |
| POST | `/api/hermes/swarm/dag/execute` | — |

### Sidecar /api/intel

| Method | Path | Notes |
|---|---|---|
| GET | `/api/intel/cve` | — |

### Sidecar /api/knowledge

| Method | Path | Notes |
|---|---|---|
| POST | `/api/knowledge/ingest` | — |
| POST | `/api/knowledge/search` | — |
| DELETE | `/api/knowledge/docs/{doc_id}` | — |
| GET | `/api/knowledge/stats` | — |
| POST | `/api/knowledge/obsidian/index` | — |

### Sidecar /api/social

| Method | Path | Notes |
|---|---|---|
| GET | `/api/social/adapters` | — |
| POST | `/api/social/publish` | — |

### Sidecar /health

| Method | Path | Notes |
|---|---|---|
| GET | `/health` | — |

### Sidecar /ws/acp

| Method | Path | Notes |
|---|---|---|
| WS | `/ws/acp` | — |

### Sidecar /ws/docker

| Method | Path | Notes |
|---|---|---|
| WS | `/ws/docker/logs/{container_id}` | — |

### Sidecar /ws/telemetry

| Method | Path | Notes |
|---|---|---|
| WS | `/ws/telemetry` | telemetry |

### Sidecar /ws/terminal

| Method | Path | Notes |
|---|---|---|
| WS | `/ws/terminal` | — |
