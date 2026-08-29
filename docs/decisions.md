# DirtyNest — Rejestr decyzji (indeks ADR)

> **Format zmieniony 2026-08-29:** każda decyzja żyje teraz jako osobny plik w [`docs/adr/`](./adr/) (`NNNN-slug.md`, format: kontekst → decyzja → konsekwencje). Ten plik jest wyłącznie indeksem. Nowe ADR-y dodajemy jako kolejny numer w `docs/adr/`.

| ADR | Decyzja | Status |
|---|---|---|
| [0001](./adr/0001-all-chats-through-hermes-agents.md) | Wszystkie czaty przez wyspecjalizowanych agentów Hermes | ✅ |
| [0002](./adr/0002-hermes-acp-via-sidecar-not-own-framework.md) | Silnik: Hermes ACP przez sidecar, nie własny framework | ✅ |
| [0003](./adr/0003-exactly-two-users.md) | Skala: dokładnie 2 użytkowników, prosty JWT | ✅ |
| [0004](./adr/0004-homelab-docker-compose.md) | Hosting: homelab / Docker Compose | ✅ |
| [0005](./adr/0005-hybrid-llm-cloud-plus-local.md) | LLM: hybryda chmura + lokal; backend LLM = atrybut agenta | ✅ |
| [0006](./adr/0006-social-platform-priorities.md) | Social: X, Instagram, Facebook, TikTok, Reddit | ✅ |
| [0007](./adr/0007-single-sidecar-websocket-event-stream.md) | Jeden kanał WS sidecar dla zdarzeń agentów | ✅ |
| [0008](./adr/0008-hitl-mandatory-gate.md) | HITL jako bramka obowiązkowa dla ryzyka `critical` | ✅ |
| [0009](./adr/0009-postgres-drizzle-plus-qdrant.md) | PostgreSQL + Drizzle (migracje), wektory w Qdrant | ✅ |
| [0010](./adr/0010-lightweight-task-queue-defer-bullmq.md) | Lekka kolejka (cron_service + tabela), BullMQ odroczony | ⏳→✅ |
| [0011](./adr/0011-hermes-acp-confirmed-harness-blueprint-rejected.md) | **Hermes ACP potwierdzony silnikiem; blueprint DeepSeek Harness 2.0 odrzucony** | ✅ |
| [0012](./adr/0012-no-separate-backend-service.md) | **Brak osobnej usługi backend — topo dwuwarstwowa (Next + sidecar)** | ✅ |
| [0013](./adr/0013-social-cdp-first.md) | **Social: CDP-first, API tylko gdzie CDP zawodzi** | ✅ |

## Historia

- **2026-08-27** — ADR-001…010 zapisane po audycie i rozmowie planistycznej (źródło: share DeepSeek + rozstrzygnięcia własne).
- **2026-08-29** — Rejestr rozdzielony na `docs/adr/NNNN-*.md` (format ADR per plik). Nowe: ADR-0011 (rozstrzyga rozjazd „v2.0" z kodem po weryfikacji F0–F6), ADR-0012 (pusty `backend/` usunięty, topo dwuwarstwowa), ADR-0013 (ścieżka social = CDP-first; rozstrzyga otwarte pytanie nr 3). Otwarte pytania z poprzedniej wersji: nr 1 i 4 → do F7 (patrz `implementation-plan.md` §F7); nr 2 → ADR-0005/ADR-0004 (ollama jako opcja w compose, bez GPU); nr 3 → ADR-0013.