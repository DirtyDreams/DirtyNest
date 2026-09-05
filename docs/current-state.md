# DirtyNest — Audyt stanu bieżącego (current state)

> **Wersja:** 1.1 · **Data:** 2026-08-29 · **Repo:** `pitest` = klon `DirtyDreams/DirtyNest` (gałąź `main`)
> **Źródła:** inspekcja kodu (`src/`, `sidecar/`, `docker-compose.yml`, `drizzle/`, `package.json`), `git log`/`git status`, raporty `SYSTEM_SCAN_REPORT.md` i `HERMES_ECOSYSTEM_REPORT.md`.
>
> Ten dokument jest **mapą tego, co realnie istnieje w kodzie** — odróżnia „działa", „jest mockiem" i „nie istnieje". Wszystkie dalsze dokumenty (`backend-architecture`, `data-models`, `api-specification`, `agent-system`, `implementation-plan`) są z nim zgodne.

---

## 1. Podsumowanie

| Warstwa | Stan | Komentarz |
|---|---|---|
| Frontend (16 decków) | 🟢 **Działa** | Next.js 16.3.2 / React 19.2.8 / Tailwind v4; build i typecheck przechodzą (wg `SYSTEM_SCAN_REPORT.md`). |
| API Next.js (CRUD) | 🟢 **Działa** | 10 grup endpointów na Postgresie przez Drizzle. |
| `/api/chat` | 🟠 **Proxy Gemini** | Prosty proxy do `@google/genai` — **nie jest** częścią architektury agentowej; docelowo zastąpione przez Hermes ACP. |
| Baza danych | 🟢 **Zmigrowana** | `sql.js` usunięty; `drizzle/` w dialekcie PostgreSQL; `initDb()` = `migrate()` + seed; live-DB zrekoncyliowana przez `drizzle-kit push` (9→14 tabel, `todos.created_at` dodane). |
| Sidecar (FastAPI, :8000) | 🟢 **Działa** | Telemetria, ACP, CDP, cron (Redis), docker, automations + **Knowledge Vault** (chunked ingest/search/list/delete). 38 endpointów. |
| Hermes ACP | 🟡 **Zintegrowany częściowo** | Typy ACP + socket + store po stronie klienta gotowe; API Next `/api/hermes/*` proxy do sidecar. |
| Infrastruktura (compose) | 🟢 **Działa** | `postgres` + `web` + `sidecar` + `qdrant` (:6335) + `redis` (:6380); dev-runtime korzysta z żywej płaszczyzny :5432/:6333/:6379. |
| Auth / użytkownicy | 🔴 **Nie istnieje** | Brak tabeli `users`, JWT i ochrony endpointów (decyzja z rozmowy: 2 użytkowników). |
| Knowledge Vault (RAG) | 🟢 **Działa** | `knowledge_vault` w Qdrant: chunked ingest (900/150), search top-k, list/delete; deck „Quick Vector Ingest" podpięty na żywo; wspólny embeder bge-small 384. |
| Social Media backend | 🟠 **Zbiornik realny, reszta brak** | Pipeline zbiornik.com pełny: CDP :9333 + konto operatora + kolejka HITL + publish-gate; X/IG/FB/TikTok nie istnieją. |
| Testy | 🟢 **CI-enforced** | 23 pytest (sidecar) + 14 vitest (web); GitHub Actions `run: push`. |

**Stan repozytorium:** `main` == `origin/main` (push testowane 3× CI-green 2026-08-29), working tree czysty (`c5da10a`).

---

## 2. Frontend — co istnieje

**Stack** (`package.json`): Next.js 16 (App Router + Turbopack), React 19, TypeScript, Tailwind CSS v4, zustand, shadcn/radix-ui, xterm, three.js, sonner.

**16 decków** (`src/components/views/`, potwierdzone listingiem):
`AiAgentsView`, `ApiHealthView`, `ChatbotView`, `ControlRoomView`, `DockerView`, `ImageStudioView`, `IntelFeedView`, `KnowledgeView`, `LogsView`, `PersonaNexusView`, `ScheduleView`, `SettingsView`, `SocialMediaView`, `SoundStudioView`, `StatsView`, `ToolsView` — każdy z własnym podkatalogiem modułów (np. `views/social_media/AutomationsMatrix.tsx`).

**Pozostałe warstwy UI:** `components/widgets/` (30+ widżetów bento), `components/tools/` (narzędzia klienckie), `components/layout/`, `components/modals/`, `components/terminal/`, `components/desktop/` (multi-window OS), `lib/cyberAudio.ts`, `lib/cyberSpeech.ts`.

> Uwaga: większość danych w deckach Docker/Intel/Social/Stats pochodzi z mocków frontendowych lub z sidecar-telemetrii — bez trwałego backendu. Szczegóły per deck → `docs/overview.md`.

---

## 3. API Next.js — istniejące endpointy (z kodu)

| Endpoint | Metody | Stan / uwagi |
|---|---|---|
| `/api/todos`, `/api/todos/[id]` | GET, POST, PATCH, DELETE | 🟢 CRUD na Postgresie (Drizzle), audyt do `system_logs`. |
| `/api/notes` | GET, PUT | 🟢 pojedynczy notatnik. |
| `/api/quick-links`, `/api/quick-links/[id]` | GET, POST, DELETE | 🟢. |
| `/api/calendar`, `/api/calendar/[id]` | GET, POST, DELETE | 🟢. |
| `/api/focus`, `/api/focus/total` | GET, POST | 🟢 sesje Pomodoro + agregaty. |
| `/api/logs`, `/api/logs/stats` | GET, POST, DELETE | 🟢 logi systemowe + statystyki. |
| `/api/import` | POST | 🟢 import konfiguracji. |
| `/api/chat` | POST | 🟠 **proxy Gemini** (`@google/genai`, klucz z Settings lub `GEMINI_API_KEY`); nie obsługuje agentów; ograniczenia: 100 wiadomości / 50 tys. znaków. |
| `/api/hermes/acp`, `/api/hermes/acp/sessions` | POST, GET | 🟡 proxy do sidecar (sesje ACP). |
| `/api/hermes/memories`, `/api/hermes/memories/[id]` | GET, POST, DELETE | 🟡 proxy do sidecar (pamięć Hermes). |

---

## 4. Warstwa danych — stan faktyczny

**Schemat Drizzle** (`src/lib/schema.ts`, `pgTable`) — **10 tabel istniejących**:

| Tabela | Przeznaczenie |
|---|---|
| `todos` | zadania (priorytet, due_date, sort_order). |
| `notes` | pojedynczy notatnik (content + updated_at). |
| `quick_links` | zakładki „Warp Gate". |
| `calendar_events` | wydarzenia kalendarza. |
| `focus_sessions` | sesje Pomodoro. |
| `system_logs` | logi audytowe (level, category, action, actor, latency, hash). |
| `hermes_sessions` | sesje ACP (id, name, profile `dirtydaily`, model, cwd, status). |
| `hermes_messages` | wiadomości sesji (role, content, `reasoning_trace`). |
| `hermes_tool_logs` | logi narzędzi ACP (parameters, result, **risk_level**, **permission_status**, execution_time). |
| `hermes_memories` | pamięć Hermes (category, title, content, tags, recall_count). |

**Połączenie:** `src/db/index.ts` → `postgres-js` + `drizzle-orm/postgres-js` (pool max 10), `DATABASE_URL` z env z fallbackiem.

**Niespójności i długi (do domknięcia w fazie F0):**
1. **Stara migracja w złym dialekcie:** `drizzle/0000_young_shiver_man.sql` zawiera `AUTOINCREMENT` (SQLite), a `drizzle.config.ts` ma `dialect: "postgresql"` i schemat używa `pgTable` — migracja jest niekompatybilna i przestarzała (tylko tabela `todos`).
2. **Runtime-DDL:** `src/db/index.ts` tworzy tabele instrukcjami `CREATE TABLE IF NOT EXISTS` przy starcie zamiast z migracji — dwie prawdy o schemacie.
3. **Hardcoded hasło bazy** w trzech miejscach: `docker-compose.yml` (2×), `src/db/index.ts`, `drizzle.config.ts` — sekret w repo.
4. **`sql.js` nadal w `package.json`** mimo przejścia na Postgres.
5. **Daty jako `varchar(100)`** zamiast `timestamptz` w całym schemacie.
6. **Brak tabel** z planu rozmowy: `users`, `chat_sessions`, `chat_messages`, `knowledge_docs`, `social_posts`, `social_accounts`, `agents_config`, `audit_logs` (rolę częściowo pełni `system_logs` + `hermes_*`).

---

## 5. Sidecar (FastAPI, port 8000)

**Plik główny:** `sidecar/main.py` (~750 linii, 38 endpointów). **Moduły:** `acp_client.py` (most Hermes ACP), `memory_service.py`, **`knowledge_service.py`** (Knowledge Vault), `cdp_service.py` (Chrome DevTools), `cron_service.py`, `docker_service.py`, `automations/` (engagement, topics, dedup, verification, zbiornik), `migrate_sqlite_to_pg.py`.

**Endpointy (potwierdzone grep-em):**
- Health/telemetria: `GET /health`, `GET /api/hermes/status`, `WS /ws/telemetry`
- ACP: `GET /api/hermes/acp/status`, `POST /api/hermes/acp/sessions/new`, `POST /api/hermes/acp/prompt`, `POST /api/hermes/acp/gate/resolve`, `WS /ws/acp`
- Pamięć: `GET|POST /api/hermes/memories`, `GET /api/hermes/memories/search`, `DELETE /api/hermes/memories/{id}`
- CDP: `GET /api/hermes/cdp/status`, `POST /api/hermes/cdp/{navigate,screenshot,extract,interact}`
- Miniony/cron/exec: `GET /api/hermes/minions`, `GET /api/hermes/cron`, `POST /api/hermes/cron/{job_name}/run`, `POST /api/hermes/exec`, `POST /api/hermes/swarm/dag/execute`
- Docker: `GET /api/docker/containers`, `POST /api/docker/containers/{id}/action`, `GET /api/docker/containers/{id}/logs`
- Chat: `POST /api/chat` (w sidecar)
- Automations: `GET /api/automations/status`, `POST /api/automations/engagement/{post,reply}`, `POST /api/automations/dedup/clean`, `GET /api/automations/topics/{subreddit}`, `POST /api/automations/verification/crosscheck`
- Terminal: `WS /ws/terminal`

**Prober telemetrii** śledzi porty ekosystemu Hermes: SkillClaw `:30000`, Minions `:6969`, PostgreSQL `:5432`, Qdrant `:6333`, Chrome CDP `:9222` (main) i `:9333` (Mina) — zgodnie z `HERMES_ECOSYSTEM_REPORT.md`.

**Mocki (do zastąpienia realnymi danymi):**
- `minions_registry` w `main.py` — stała lista 4 minionów (mock),
- `cron_jobs_registry` w `main.py` — stałe wpisy cron (mock).

**Zależności** (`sidecar/requirements.txt`): FastAPI, uvicorn, pydantic, httpx, websockets, psutil, **qdrant-client, fastembed**, psycopg2-binary, asyncpg.

---

## 6. Integracja Hermes ACP po stronie klienta

- `src/lib/hermes/types.ts` — kompletna specyfikacja typów „Hermes Agent Standard": dostawcy (`nous_portal`, `openrouter`, `ollama`, `anthropic`, `openai`, `deepseek`, `gemini`), tryby sandboxa (`docker|isolate|ssh|modal|local`), kategorie pamięci, **poziomy ryzyka narzędzi** (`low|medium|critical`) i **polityka HITL** (`autoApproveLowRisk`, `requireClearanceFor{FsWrite,Docker,Shell,Network}`, budżet tokenów).
- `src/lib/hermes/hermesSocket.ts` — klient WebSocket do sidecar (`/ws/telemetry`), rozgłaszanie statusów i telemetrii, nasłuch zdarzeń ACP.
- `src/lib/hermes/hermesStore.ts` / `hermesAcpStore.ts` — stan zustand sesji i zdarzeń ACP.
- Widoki konsumujące: `ControlRoomView` (strumień myśli, HITL), `AiAgentsView` (miniony), `ApiHealthView` (proby portów).

---

## 7. Infrastruktura i konfiguracja

- `docker-compose.yml`: `postgres:16-alpine` (+healthcheck), `web` (`Dockerfile.next`, :3000), `sidecar` (:8000), `qdrant` (:6335), `redis` (:6380→6379). **Brak usług:** `searxng`, `ollama`.
- `.env.local` nie zawiera kluczy dostawców LLM (`GEMINI_API_KEY` itd.) ani social APIs — `/api/chat` wymaga klucza przekazywanego z UI lub z env.

## 8. Repozytorium i jakość (z `git status`, `SYSTEM_SCAN_REPORT.md`)

- `main` == `origin/main` — wszystkie push-e 2026-08-29 przeszły CI (`web` ✓, `sidecar` ✓).
- Usunięte skrypty Python z root (`post_engagement.py`, `pull_topics.py`, `reply_inbox.py`…) — logika przeniesiona do `sidecar/automations/`; archiwum w `scripts/legacy_archive/`.
- Lint: **0 errors / 164 warnings** (unused-imports plugin pilnuje importów; `_`-prefix scaffold + `exhaustive-deps` pozostają celowo) — nie blokuje builda.
- Hygiene: transients ignorowane (`.tmp-*.ps1`, `sidecar/data/`); `sidecar/__pycache__` zdjęte z trackingu.
- Build i typecheck: ✅ przechodzą; pytest 23/23, vitest 14/14.

## 9. Mapa „co jest mockiem"

| Obszar | Mock / realne |
|---|---|
| Telemetria hosta i portów (sidecar) | 🟢 realne (psutil + TCP probe) |
| Miniony AI (lista w sidecar) | 🔴 mock (stała lista) |
| Cron jobs (lista w sidecar) | 🔴 mock (realne cron jobs istnieją w profilu Hermes `dirtydaily`) |
| Docker containers (sidecar) | 🟢 realne (docker_service → Docker API) |
| ACP sessions/prompt/gate | 🟢 realne (acp_client → Hermes ACP) |
| Pamięć Hermes | 🟢 realne (memory_service → Postgres/Qdrant) |
| CVE radar / Intel feed | 🔴 frontend z mockami |
| Social Media (X/IG/FB/TikTok) | 🔴 brak backendu; **zbiornik.com 🟢 pełny HITL pipeline** (poll, kolejka, publish-gate, sesja CDP live) |
| Knowledge Vault (graf, RAG) | 🟢 realne — `knowledge_vault` w Qdrant (ingest/search/list/delete + chunking) + `hermes_memories` (live); RAG Tester i „Quick Vector Ingest" odpytują prawdziwe endpointy |
| Docker Hub (frontend) | 🟡 strumień logów przez sidecar, reszta mock |

---

## 10. Powiązane dokumenty

- [decisions.md](./decisions.md) — skąd biorą się cele architektury (zapis decyzji z rozmowy DeepSeek),
- [backend-architecture.md](./backend-architecture.md) — docelowa topologia i przepływy,
- [data-models.md](./data-models.md) — schemat istniejący i docelowy,
- [api-specification.md](./api-specification.md) — katalog endpointów (istnieje vs plan),
- [agent-system.md](./agent-system.md) — Hermes ACP, agenci, HITL,
- [implementation-plan.md](./implementation-plan.md) — plan fazowy F0–F6.