# DirtyNest — Audyt stanu bieżącego (current state)

> **Wersja:** 1.0 · **Data:** 2026-08-27 · **Repo:** `dirty-test` = klon `DirtyDreams/DirtyNest` (gałąź `main`)
> **Źródła:** inspekcja kodu (`src/`, `sidecar/`, `docker-compose.yml`, `drizzle/`, `package.json`), `git log`/`git status`, raporty `SYSTEM_SCAN_REPORT.md` i `HERMES_ECOSYSTEM_REPORT.md`.
>
> Ten dokument jest **mapą tego, co realnie istnieje w kodzie** — odróżnia „działa", „jest mockiem" i „nie istnieje". Wszystkie dalsze dokumenty (`backend-architecture`, `data-models`, `api-specification`, `agent-system`, `implementation-plan`) są z nim zgodne.

---

## 1. Podsumowanie

> **Aktualizacja 2026-08-29** (audyt + weryfikacja na żywo, pełny przebieg: `verification-plan.md`): fazy **F0–F6 zrealizowane i skomitowane** (`86c850c`→`d2bf545`, drzewo czyste, `main` ahead 10). Tabela poniżej zaktualizowana o stan po F6. Rejestr decyzji: `docs/adr/` (0011–0013 rozstrzygają rozjazd „v2.0"), słownik: `CONTEXT.md`.

| Warstwa | Stan | Komentarz |
|---|---|---|
| Frontend (16 decków) | 🟢 **Działa** | Next.js 16.3.2 / React 19 / Tailwind v4; typecheck + build zielone; **40+ tras API** (dokument z 2026-08-27 podawał 28 i 10 grup — nieaktualne). |
| API Next.js (CRUD + agentic) | 🟢 **Działa** | CRUD + `/api/chat/*` (sessions/agents), `/api/knowledge/*`, `/api/social/*` (+HITL gate), `/api/audit/logs`, `/api/zbiornik/*`. |
| `/api/chat` | 🟠 **Proxy Gemini** | Nadal legacja — docelowo wycofane w F7 (otwarte pytanie nr 1). |
| Baza danych | 🟢 **Zmigrowana (F0)** | 8 migracji PG, zero runtime-DDL, zero sekretów w kodzie, `timestamptz`, `sql.js` usunięty. |
| Sidecar (FastAPI, :8000) | 🟢 **Działa** | Telemetria, ACP, CDP, cron, docker, automations; **55 testów pytest**; minions mają live-sync (probe :6969), nie hardcode. |
| Hermes ACP | 🟢 **Zintegrowany** | F3a/F3b: `chat_sessions/messages/agent_configs`, orchestrator (`src/lib/orchestrator/`), streaming zdarzeń, HITL resolve, cancel, snapshot-testy. |
| Infrastruktura (compose) | 🟢 **Pełna (F1)** | 7 usług: postgres/qdrant/redis/searxng/ollama/web/sidecar; `${POSTGRES_PASSWORD:?}` egzekwowane; backup + ollama-init scripts. |
| Auth / użytkownicy | 🟢 **F2 gotowe** | Tabela `users` (seed 2 kont), JWT (jose) + middleware, szyfrowane klucze API, rate limit, ekran logowania. |
| Knowledge Vault (RAG) | 🟡 **F4 zbudowane, jakość do kalibracji** | Ingest Qdrant + `/api/knowledge/*` + obsidian sync + narzędzie `semantic_search`; ewaluacja jakości top-5 do zrobienia. |
| Social Media backend | 🟠 **Reddit + X realne (HITL publish live-verified 2026-08-29); IG/FB/TikTok = CDP adapters** | Registry z F7.2; ścieżka CDP-first (ADR-0013); X selektory skalibrowane na żywej sesji. |
| Docker Hub / Threat Intel / audyt | 🟡 **F6 zbudowane** | CVE feed, audit_logs, strumienie logów; część ekranów wymaga docięcia do realnych danych. |
| Testy | 🟢 **55 pytest + vitest (orchestrator) + CI** | `.github/workflows/ci.yml`: typecheck/lint/vitest/build + pytest vs postgres:16. E2E (Playwright) nadal brak. |
| Lint | 🟢 **0 błędów / 1241 ostrzeżeń** | Naprawiony w F0 (wcześniej „zepsuty" wg tamtego audytu); ostrzeżenia = dług na F7. |

**Stan repozytorium:** `main` ahead 10 commits, working tree **czysty**; na F0 posprzątano (PNG/logi z .gitignore, skrypty root zarchiwizowane).

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

**Plik główny:** `sidecar/main.py` (~660 linii, 33 endpointy). **Moduły:** `acp_client.py` (most Hermes ACP), `memory_service.py`, `cdp_service.py` (Chrome DevTools), `cron_service.py`, `docker_service.py`, `automations/` (engagement, topics, dedup, verification), `migrate_sqlite_to_pg.py`.

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

- `docker-compose.yml`: `postgres:16-alpine` (+healthcheck) → `web` (`Dockerfile.next`, :3000) → `sidecar` (:8000). **Brak usług:** `redis`, `qdrant`, `searxng`, `ollama`.
- `.env.local` zawiera już: `DATABASE_URL`, `NEXT_PUBLIC_SIDECAR_URL`, `QDRANT_URL`, `REDIS_URL`, `SEARXNG_URL` — czyli plan zakłada usługi, których compose jeszcze nie uruchamia.
- `.env.local` nie zawiera kluczy dostawców LLM (`GEMINI_API_KEY` itd.) ani social APIs — `/api/chat` wymaga klucza przekazywanego z UI lub z env.

## 8. Repozytorium i jakość (z `git status`, `SYSTEM_SCAN_REPORT.md`)

- `main` jest 2 commity przed `origin/main`; working tree brudny (migracja w toku).
- Usunięte skrypty Python z root (`post_engagement.py`, `pull_topics.py`, `reply_inbox.py`…) — logika przeniesiona do `sidecar/automations/`; archiwum w `scripts/legacy_archive/`.
- Lint: ~80 błędów / 239 ostrzeżeń (gł. `no-explicit-any`, nieużywane importy) — nie blokuje builda.
- Hygiene: ~10 zrzutów PNG (~4,6 MB) w root, logi (`*.log`, `cleanup.log`) w repo, `tsconfig.tsbuildinfo` w repo.
- Build i typecheck: ✅ przechodzą.

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
| Social Media (X/IG/FB/TikTok) | 🔴 brak backendu; Reddit 🟡 pipeline w sidecar |
| Knowledge Vault (graf, RAG) | 🔴 frontend z mockami; backend nie istnieje |
| Docker Hub (frontend) | 🟡 strumień logów przez sidecar, reszta mock |

---

## 10. Powiązane dokumenty

- [decisions.md](./decisions.md) — skąd biorą się cele architektury (zapis decyzji z rozmowy DeepSeek),
- [backend-architecture.md](./backend-architecture.md) — docelowa topologia i przepływy,
- [data-models.md](./data-models.md) — schemat istniejący i docelowy,
- [api-specification.md](./api-specification.md) — katalog endpointów (istnieje vs plan),
- [agent-system.md](./agent-system.md) — Hermes ACP, agenci, HITL,
- [implementation-plan.md](./implementation-plan.md) — plan fazowy F0–F6.