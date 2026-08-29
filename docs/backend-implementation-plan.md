# DirtyNest 2.0 — Plan implementacji backendu (DeepSeek Harness jako mózg)

> ⛔ **ODRZUCONY (2026-08-29) — patrz [ADR-0011](./adr/0011-hermes-acp-confirmed-harness-blueprint-rejected.md).** Sprinty S0–S5 poniżej nie są realizowane; F0–F6 wykonano na architekturze Hermes ACP (commit `86c850c`→`d2bf545`, zweryfikowane). Obowiązujący plan: `implementation-plan.md` (+ nadchodzący F7). Dokument zostaje jako katalog pomysłów (BullMQ, webhooks, monitoring, 11 tabel).

> Wersja: 2.0 · Data: 2026-08-28 · Status: ~~przyjęty do realizacji~~ **ODRZUCONY**
> **Zmiana koncepcji względem 1.x:** DeepSeek Harness jest centralnym mózgiem
> (jedyny runtime agentów); backend Node.js/Express to warstwa integracyjna
> (REST + Socket.IO + serwisy + kolejki + webhooki). Poprzedni plan hybrydowy
> (`AgentOrchestratorProxy`, pgvector, własny ReAct) jest **wycofany**.
> Źródło koncepcji: rozmowa DeepSeek share/bflap76bsblm2y9oqf („finałowy plan DirtyNest 2.0").

---

## 0. Decyzje (aktualne)

| Wymiar | Decyzja |
|---|---|
| Mózg agentów | **DeepSeek Harness** (`dsh`, profil `dirtynest`, JSON-RPC `agent.run`) |
| Rola backendu | Warstwa integracyjna: REST + Socket.IO + serwisy domenowe + BullMQ + webhooki |
| Embeddingi | **Qdrant** (kolekcja `knowledge_vault`); PostgreSQL tylko metadane |
| Modele | Gemini 2.5 Pro (default), Claude 3.7 Sonnet (code), GPT-4-turbo (opcja), Ollama/Llama 3 (lokalny fallback) |
| Wyszukiwanie web | Własna instancja **SearXNG** |
| Pamięć | **tdai-memory** (pamięć długoterminowa + wiki) |
| Monitoring | Prometheus + Grafana + alerty |
| Stack backendu | Node.js + Express + Socket.IO (zmiana względem fazy 0: Fastify → Express, zgodnie z planem 2.0) |
| Weryfikacja | lint/typecheck zielone + żywy endpoint health + smoke importów |

**Nie-cele:** własna pętla ReAct w backendzie, rejestr agentów w DB, klasyfikator
regułowy/LLM, pgvector, front-end (poza konfiguracją URL API/WS).

---

## 1. Architektura (skrót)

Szczegóły i diagramy: `backend-architecture.md` §1–3.

```
[Next.js 16] ──REST/Socket.IO──► [Backend Node.js (integracja)]
                                      │ JSON-RPC agent.run
                                      ▼
                              [DeepSeek Harness] ── narzędzia (wtyczki TS) ──► serwisy backendu
                                │        │        │
                             Gemini   Claude   Ollama
[Postgres 16] [Qdrant] [Redis 7 + BullMQ] [tdai-memory] [SearXNG] [Prometheus/Grafana]
```

Zasady stałe: backend nie implementuje logiki agenta; narzędzia = wtyczki TS Harness
wołające serwisy backendu; jeden kontrakt `agent_event` (Socket.IO); sekrety AES-256-GCM;
każda zmiana stanu → `audit_logs`; docker stop / social post / knowledge delete wymagają HITL.

---

## 2. Sprinty (zadania i szacunki — jeden developer)

### Sprint 0 — Środowisko (1–2 dni, ~9 h)
- **S0.1** `docker-compose.yml`: postgres (pgvector/pgvector:pg16), qdrant, redis 7, ollama, tdai-memory, searxng, harness, backend, frontend, prometheus, grafana — healthchecki + wolumeny. (4 h)
- **S0.2** Struktura projektu: `backend/`, `harness/`, TS config, ESLint/Prettier. (2 h)
- **S0.3** `.env.example` + dokumentacja zmiennych. (1 h)
- **S0.4** Migracje SQL: 11 tabel + rozszerzenia. (2 h)

**Kryteria:** `docker-compose up -d` podnosi wszystkie usługi; healthchecki zielone; `curl backend:4000/api/health` → ok.

### Sprint 1 — Harness: instalacja i profil (2–3 dni, ~11 h)
- **S1.1** Instalacja `@deepseek-ai/dsh` (pnpm), weryfikacja `dsh --version`. (2 h)
- **S1.2** Profil `cordis.patch.yml`: modele (gemini/claude/openai/ollama), rejestr 16 narzędzi, agent-loop (maxSteps 10, requireConfirmation, timeout 30 s), sesje (postgres, ttl 7 d), logger JSON. (4 h)
- **S1.3** Pliki soul.md × 7 (hermes, research, code, security, devops, social, generalist). (3 h)
- **S1.4** Test: `dsh run --profile dirtynest` — pełna odpowiedź na proste zapytanie. (2 h)

**Kryteria:** Harness odpowiada przez JSON-RPC; HITL prosi o potwierdzenie dla narzędzi chronionych; sesja przetrwa restart (postgres storage).

### Sprint 2 — Narzędzia DirtyNest (3–4 dni, ~28 h)
- **S2.1** Social: `social_post` (HITL), `social_schedule`, `social_metrics`. (6 h)
- **S2.2** Docker: `docker_list/start/stop(HITL)/restart/logs`. (6 h)
- **S2.3** Security: `cve_scan` (Trivy), `cve_query` (NVD). (4 h)
- **S2.4** Knowledge: `semantic_search` (Qdrant), `knowledge_add`, `knowledge_delete` (HITL). (5 h)
- **S2.5** System: `web_search` (SearXNG), `system_status`, `delegate`. (4 h)
- **S2.6** Bundle `harness/tools/index.ts` + testy integracyjne. (3 h)

**Kryteria:** każde narzędzie zdefiniowane `defineTool` (JSON Schema parametrów), woła serwis backendu, zwraca ustandaryzowany wynik; test integracyjny na kolejkę narzędzi.

### Sprint 3 — Warstwa integracyjna (4–5 dni, ~40 h)
- **S3.1** `HarnessClient`: JSON-RPC do Harness, zarządzanie procesem/timeoutami. (6 h)
- **S3.2** WebSocket Handler (Socket.IO): `join_session`, `send_message`, `cancel_agent`, `hitl_confirm`; emisja `agent_event`. (5 h)
- **S3.3** REST Auth: register/login/refresh/logout/me (argon2id, JWT access+refresh, AES-256-GCM na kluczach). (4 h)
- **S3.4** REST Chat: sesje + wiadomości → Harness. (4 h)
- **S3.5** REST Knowledge: CRUD + `POST /knowledge/search` (Qdrant) + tags + stats. (5 h)
- **S3.6** REST Social: konta, posty, harmonogram (cron). (6 h)
- **S3.7** REST Docker: kontenery + compose (admin). (4 h)
- **S3.8** REST Tasks: lista/status/anulowanie. (3 h)
- **S3.9** REST Logs: filtry + statystyki. (3 h)

**Kryteria:** login→sesja→wiadomość→strumień `agent_event`→`done` end-to-end; HITL round-trip działa; brak endpointów z planu 1.x (orchestrate/agents) w kodzie.

### Sprint 4 — BullMQ + Webhooki (2–3 dni, ~22 h)
- **S4.1** BullMQ: Redis connection, kolejki `deep-research`, `social-publish`, `cve-scan`, `webhook-send`. (2 h)
- **S4.2–S4.5** Workery: deep-research, social-publish, cve-scan, webhook-send (retry 5×: 1 m/5 m/15 m/1 h/6 h). (14 h)
- **S4.6** Harmonogram: parser cron, generowanie zadań z `social_posts`. (4 h)
- **S4.7** Webhook Dispatcher: HMAC-SHA256 `X-Webhook-Signature`, retry, logi. (2 h)

**Kryteria:** zaplanowany post publikuje się w terminie; webhook dochodzi z ważnym podpisem; anulowanie zadania działa.

### Sprint 5 — Monitoring i dokumentacja (2–3 dni, ~25 h)
- **S5.1** Metryki Prometheus: `http_requests_total`, `agent_requests_total`, `agent_response_time_seconds`, `agent_errors_total`, `bull_queue_*`, `qdrant_collection_points_count`. (4 h)
- **S5.2** Dashboard Grafana: 6 paneli (błędy, agenci, kolejki, Docker, Qdrant, webhooki). (4 h)
- **S5.3** Alerty: HighErrorRate, AgentTimeout, QueueBacklog, PostgresqlDown, QdrantDown. (3 h)
- **S5.4** OpenAPI/Swagger. (4 h) · **S5.5** Dokumentacja użytkownika. (4 h) · **S5.6** Testy e2e (WS + REST). (6 h)

**Kryteria:** alerty przechodzą na środowisku testowym; e2e zielone.

**RAZEM:** 14–20 dni, ~135 h (1 osoba); 10–14 dni przy 2 osobach.

---

## 3. Środowisko (docker-compose + .env)

Pełny `docker-compose.yml` (12 usług + wolumeny + healthchecki) i `.env.example`
są sparametryzowane w rozmowie źródłowej; kluczowe porty:

| Usługa | Port | | Usługa | Port |
|---|---|---|---|---|
| PostgreSQL (pgvector) | 5432 | | Backend API | 4000 |
| Qdrant HTTP/gRPC | 6333/6334 | | Frontend | 3000 |
| Redis | 6379 | | Prometheus | 9090 |
| Ollama | 11434 | | Grafana | 3001 |
| tdai-memory | 8000 | | SearXNG | 8080 |
| Harness (JSON-RPC) | 5000 | | | |

Kluczowe env: `DATABASE_URL, REDIS_URL, QDRANT_URL, OLLAMA_URL, TD_MEMORY_URL,
SEARXNG_URL, HARNESS_URL, HARNESS_PROFILE, JWT_SECRET, JWT_REFRESH_SECRET,
ENCRYPTION_KEY, WEBHOOK_SECRET, WEBHOOK_URLS, GEMINI_API_KEY, CLAUDE_API_KEY,
OPENAI_API_KEY` (+ opcjonalne tokeny social).

---

## 4. Model danych

11 tabel PostgreSQL (pełne DDL: `data-models.md`): `users, chat_sessions, chat_messages,
social_accounts, social_posts, knowledge_docs, docker_containers, compose_stacks,
async_tasks, audit_logs, harness_sessions` + kolekcja Qdrant `knowledge_vault`.
Zmiany względem 1.x: usunięte `agents_hermes` i `agent_executions` (rejestr agentów
żyje w profilu Harness); `chat_sessions.harness_session_id` zamiast
`assigned_agent_type`; `knowledge_docs.qdrant_point_id` zamiast `embedding vector(1536)`.

## 5. Ryzyka

| Ryzyko | Prawdopodob. | Wpływ | Mitygacja |
|---|---|---|---|
| `@deepseek-ai/dsh` to developer preview — API może się zmieniać / dystrybucja niedostępna | Średnie | Wysoki | Pinowanie wersji, fork, **warstwa abstrakcji `HarnessClient`** (podmiana silnika bez zmian REST/WS; narzędzia i soul.md pozostają nasze) |
| Koszt API (Gemini/Claude) | Średnie | Średni | Limity tokenów, fallback Ollama dla prostych zapytań |
| Utrata sesji Harness | Niskie | Średni | Persystencja postgres + backup |
| Błąd narzędzia (np. publish) | Średnie | Średni | Walidacja JSON Schema, HITL, logi błędów |
| Wydajność przy obciążeniu | Niskie | Wysoki | Testy wydajnościowe, skalowanie workerów |

## 6. Definition of done (całości)

1. `docker-compose up -d` → wszystkie healthchecki zielone.
2. Backend: lint/typecheck zielone; `GET /api/health` żywy.
3. e2e: login → wiadomość → `agent_event` stream → `done`; HITL round-trip na `docker stop`.
4. Ingest 3 dokumentów → `POST /knowledge/search` top-1 trafienie (Qdrant).
5. Webhook `post.published` podpisany HMAC dochodzi do testowego odbiorcy.