# DirtyNest — Rejestr decyzji architektonicznych (ADR)

> **Wersja:** 1.0 · **Data:** 2026-08-27
> **Źródło:** analiza udostępnionej rozmowy DeepSeek (`https://chat.deepseek.com/share/r2sypjaido23j1jaov`) + decyzje własne podjęte przy tworzeniu tej dokumentacji.
>
> Format: każda decyzja = kontekst → decyzja → konsekwencje. Statusy: ✅ przyjęta, 🔄 zmieniona, ⏳ odroczona.

---

## Uwaga metodyczna

Rozmowa z linku to planowanie backendu DirtyNest przeprowadzone z DeepSeek na podstawie publicznego wówczas frontendu. Repo (`dirty-test`) jest **dalej niż ta rozmowa** — część postulatów została już wdrożona inaczej (przede wszystkim: integracja z realnym agentem Hermes przez ACP i sidecar FastAPI zamiast samodzielnego silnika agentów napisanego od zera). Ten dokument rozstrzyga, **które decyzje obowiązują**, i dokumentuje odchylenia.

---

## ADR-01 · Wszystkie czaty obsługiwane przez wyspecjalizowanych agentów Hermes

**Status:** ✅ przyjęta (żądanie użytkownika z rozmowy: „wszystkie czaty beda obslugiwane przez wyspecjalizowanych hermes agentow")

**Kontekst:** Frontend ma widoki Hermes Master Brain / Control Room / AI Agents Swarm; `/api/chat` to tylko proxy Gemini.

**Decyzja:** Nie budujemy prostego proxy LLM. Każda rozmowa przechodzi przez **Hermes Orchestrator**, który wybiera specjalizowanego agenta. Agent działa w pętli **ReAct** (think → act → observe), może wywoływać narzędzia, delegować zadania i zwracać strumień zdarzeń (`thinking`, `tool_call`, `tool_result`, `token`, `source`, `done`).

**Konsekwencje:**
- Model danych musi zapisywać trace rozumowania i wywołania narzędzi (istnieje: `hermes_messages.reasoning_trace`, `hermes_tool_logs`).
- Control Room jest głównym konsumentem strumienia zdarzeń.
- Długoterminowe zadania (deep research) wymagają kolejki asynchronicznej.

---

## ADR-02 · Silnik agentów: Hermes ACP przez sidecar, nie własny framework

**Status:** 🔄 zmieniona względem rozmowy (decyzja wykonawcza przy tworzeniu dokumentacji)

**Kontekst:** Rozmowa proponowała własne klasy TypeScript (`BaseAgent`, `think/act/observe`) z wywołaniami API dostawców LLM. Repo już zawiera **realną integrację**: typy specyfikacji Hermes (`src/lib/hermes/types.ts`), klient WS (`hermesSocket.ts`), most ACP w sidecar (`acp_client.py`) oraz endpointy `/api/hermes/acp/*`, `/api/hermes/memories/*`.

**Decyzja:** Agentami są **realne procesy Hermes** (profil `dirtydaily`) komunikujące się przez **ACP (Agent Client Protocol)**, a nie klasy symulujące agentów w backendzie Next. Warstwa z rozmowy (klasyfikator regułowy + LLM fallback → wybór agenta) zostaje jako **routing przed ACP**:

```
UI → Next API → [Router: klasyfikacja regułowa + LLM fallback] → sidecar /api/hermes/acp/prompt → Hermes ACP → minion/profil Hermes
```

**Konsekwencje:**
- Pętla ReAct, narzędzia, sandbox i pamięć są własnością procesu Hermes (nie implementujemy ich od zera).
- Z szkieletów kodu z rozmowy adaptujemy: format zdarzeń strumienia, rejestr agentów jako konfigurację, testy klasyfikatora.
- `/api/chat` (proxy Gemini) zostaje wycofywane do trybu fallback/demo.

---

## ADR-03 · Skala: dokładnie 2 użytkowników

**Status:** ✅ przyjęta (odpowiedź nr 1 w rozmowie: „dwie osoby"; potwierdzenie: „1. ok")

**Decyzja:** System dwuosobowy — prosty **JWT** (login + hasło, bcrypt), obaj użytkownicy z pełnymi uprawnieniami (admin). Bez RBAC, bez rejestracji publicznej, bez odzyskiwania hasła przez e-mail w MVP.

**Konsekwencje:**
- Tabela `users` + `POST /api/auth/login`, `GET /api/auth/me`; ochrona REST i WS middlewarem.
- Prostota ponad skalowalność: pool Postgres 10 połączeń jest OK; brak limitów per-user poza budżetem tokenów.

---

## ADR-04 · Hosting: homelab / Docker Compose

**Status:** ✅ przyjęta (odpowiedź nr 2: „A" — lokalnie/homelab; potwierdzenie: „2. jest")

**Decyzja:** Wszystko w **Docker Compose** na własnym sprzęcie (Windows 11 / Homelab). Bez Kubernetes, bez chmury publicznej. Reverse proxy i SSL — na później (E2E w homelab).

**Konsekwencje:**
- `docker-compose.yml` musi spinać pełny zestaw usług (obecnie brakuje redis, qdrant, searxng, ollama).
- WebSocket/SSE bez ograniczeń serverless; socket.io niepotrzebny — sidecar używa natywnego WS FastAPI.
- Dostęp do Dockera dla sidecar przez mount `docker.sock` (do przeglądu w fazie F6 — kompromis bezpieczeństwa).

---

## ADR-05 · LLM: hybryda — API chmurowe + Ollama / llama.cpp

**Status:** ✅ przyjęta (odpowiedź nr 3; potwierdzenie: „3. trzeba dodac jeszcze reddit" dotyczy social, nie LLM)

**Decyzja:** Agenci mogą korzystać zarówno z API chmurowych (Gemini, Claude, GPT, DeepSeek), jak i z **lokalnych modeli Ollama / llama.cpp**. Backend LLM jest atrybutem konfiguracji agenta/sesji (`model_backend`), nie stałą systemu.

**Konsekwencje:**
- Usługa `ollama` w docker-compose (faza F1) + pole wyboru backendu w konfiguracji agentów.
- Typy `HermesProvider` w `src/lib/hermes/types.ts` już to obejmują (`ollama`, `openrouter`, …).
- Koszt/prywatność: klasyfikator routingu powinien domyślnie używać lokalnego lub najtańszego modelu.

---

## ADR-06 · Priorytety integracji social media: X, Instagram, Facebook, TikTok + Reddit

**Status:** ✅ przyjęta (odpowiedź nr 4: „najwazniejsze sa ; X , Instagram , Facebook , tiktok"; korekta końcowa: „3. trzeba dodac jeszcze reddit")

**Decyzja:** MVP backendu social obsługuje pięć platform: **X (Twitter), Instagram, Facebook, TikTok, Reddit**. Discord / Telegram / LinkedIn zostają odroczone (frontend je wyświetla — mocki).

**Konsekwencje:**
- Reddit jest najbliższy realności: pipeline engagement/topics/dedup/verification już istnieje w `sidecar/automations/` (przeniesiony ze starych skryptów root) — staje się wzorcem dla adapterów pozostałych platform.
- Wspólny interfejs adaptera (publish / schedule / metrics) + polityka HITL przed publikacją (decyzja ADR-08).

---

## ADR-07 · Streaming zdarzeń do Control Room przez WebSocket sidecar

**Status:** ✅ przyjęta (spójna z rozmową: Control Room konsumuje strumień myśli; potwierdzenie „4. tak" dotyczyło ERD + compose)

**Decyzja:** Zdarzenia agentów (myśli, tool-calls, wyniki, tokeny, HITL-gates) płyną **jednym kanałem WebSocket sidecar** (`/ws/telemetry`, `/ws/acp`), do którego frontend jest już podłączony (`hermesSocket.ts`). Nie wprowadzamy drugiego mechanizmu (socket.io z rozmowy) — FastAPI WS + reconnect w kliencie wystarczą.

**Konsekwencje:**
- SSE/socket.io z szkieletów rozmowy: niewykorzystane.
- Router Next (faza F3) musi rozgłaszać zdarzenia ACP do odpowiednich sesji (pokoje = `sessionId`).

---

## ADR-08 · HITL (Human-in-the-Loop) jako bramka obowiązkowa

**Status:** ✅ przyjęta

**Kontekst:** Frontend ma gotową bramkę HITL w Control Room; typy `HermesHitlPolicy` istnieją w kodzie; sidecar ma `POST /api/hermes/acp/gate/resolve`.

**Decyzja:** Każde narzędzie o `risk_level` `critical` (publikacja social, operacje Docker, shell, zapisy FS) wymaga zgody operatora przez Control Room przed wykonaniem. `autoApproveLowRisk` domyślnie włączone dla `low`.

**Konsekwencje:** Log decyzji HITL zapisujemy w `hermes_tool_logs.permission_status` (pole już istnieje).

---

## ADR-09 · Baza: PostgreSQL + Drizzle; wektory: Qdrant

**Status:** ✅ przyjęta z odchyleniem od rozmowy

**Kontekst:** Rozmowa proponowała `pgvector` w PostgreSQL. Repo poszło inną drogą: **Qdrant** (URL w `.env.local`, klient w sidecar, `fastembed` do embeddingów, prober portu 6333).

**Decyzja:** Relacyjne dane w **PostgreSQL + Drizzle ORM** (migracje, nie runtime-DDL); wyszukiwanie semantyczne w **Qdrant + fastembed**. Hybrydowe wyszukiwanie (wektor + FTS) jak w rozmowie, ale implementowane po stronie sidecar.

**Konsekwencje:**
- Sekcja `knowledge_docs` z rozmowy przechodzi do Qdrant (payload = metadane dokumentu), a relacyjne metadane dokumentów pozostają w Postgres.
- Migracja `sql.js → PostgreSQL` ma istniejące narzędzie: `sidecar/migrate_sqlite_to_pg.py`.

---

## ADR-10 · Automatyzacje długotrwałe: kolejka taskowa

**Status:** ⏳ odroczona do F3/F5

**Kontekst:** Rozmowa proponowała BullMQ + Redis. `REDIS_URL` jest w `.env.local`, ale Redis nie istnieje w compose ani w kodzie.

**Decyzja:** MVP używa lekkiego mechanizmu: **cron_service w sidecar** + tabela zadań w Postgres. BullMQ wprowadzamy dopiero wtedy, gdy pojawi się realne zapotrzebowanie (harmonogram postów social, deep research w tle) — nie wcześniej, by nie dokładać usługi „na zapas".

**Konsekwencje:** Faza F1 dodaje Redis do compose (bo URL już istnieje i telemetria go zakłada), ale kod kolejek powstaje dopiero w F3/F5.

---

## Otwarte pytania (do decyzji w trakcie implementacji)

| # | Pytanie | Powiązanie |
|---|---|---|
| 1 | Czy klasyczny czat Gemini (`/api/chat`) zostaje jako fallback „Generalist", czy zostaje całkowicie wycofany? | F3 |
| 2 | Ollama jako kontener w compose czy proces natywny (GPU na hoście)? | F1 |
| 3 | Publikacja na X/IG/FB/TikTok: API oficjalne vs. automatyzacja przez CDP (Chrome), które już jest w sidecar? | F5 |
| 4 | Czy graf wiedzy (Knowledge Vault) ma indeksować pliki Obsidian z dysku, czy tylko dokumenty wgrane przez UI? | F4 |

---

## Powiązane dokumenty

- [current-state.md](./current-state.md) — co z powyższego jest już w kodzie,
- [implementation-plan.md](./implementation-plan.md) — jak decyzje przekładają się na fazy F0–F6.