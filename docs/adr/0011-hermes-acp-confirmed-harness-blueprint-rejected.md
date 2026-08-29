# ADR-0011 · Hermes ACP pozostaje silnikiem; blueprint DeepSeek Harness 2.0 odrzucony

**Status:** ✅ przyjęta (2026-08-29)

**Kontekst:** Dokumenty „v2.0" (`backend-architecture.md`, `backend-implementation-plan.md`, `agent-system.md`, `data-models.md`, `api-specification.md` — 2026-08-28) ogłosiły DeepSeek Harness (`@deepseek-ai/dsh`) jedynym runtime'em agentów i warstwę Express jako nowy „backend integracyjny". Tymczasem repo zrealizowało plan F0–F6 na architekturze Hermes ACP (commit `86c850c`→`d2bf545`): routing, streaming zdarzeń, HITL, RAG, social, CI — zweryfikowane na żywo (typecheck/build zielone, 55 testów sidecar, CI skonfigurowane).

**Decyzja:** Odrzucamy wymianę silnika. Silnikiem pozostaje **Hermes ACP przez sidecar** (ADR-0002, ADR-0007). Z blueprintu 2.0 adaptujemy wyłącznie inkrementalne pomysły do istniejącego stacku: pliki promptów w stylu soul.md, rejestr narzędzi jako konfigurację po stronie Hermes/agent_configs, observability Prometheus/Grafana, webhooks HMAC, BullMQ tylko przy realnej potrzebie (spójnie z ADR-0001 do ADR-0010).

**Uzasadnienie (fakty z weryfikacji 2026-08-29):**
- `@deepseek-ai/dsh` istnieje na npm wyłącznie jako `0.1.1-rc.2` (developer preview) — ryzyko odnotowane w samym planie 2.0 (§Ryzyka).
- Ścieżka Hermes ACP działa end-to-end i jest pokryta testami (acp_bridge w sidecar tests).
- Katalog `backend/` z blueprintu jest pusty — „backend integracyjny" nigdy nie powstał (ADR-0012).
- Koszt vs korzyść: migracja działającego przepływu na silnik v0.1 RC = zero korzyści funkcjonalnych.

**Konsekwencje:**
- Dokumenty 2.0 dostają baner „odrzucony blueprint" i nie są źródłem prawdy o stanie systemu (prawda: `current-state.md`, schemat: `src/lib/schema.ts` + `drizzle/`, kontrakt zdarzeń: ADR-0007 i kod `src/lib/orchestrator/acpBridge.ts`).
- Kontrakt `agent_event` z 2.0 pozostaje wzorcem nazw zdarzeń (już realizowanym przez ACP bridge); Socket.IO nie jest wprowadzany — WS sidecar zostaje (ADR-0007).
- „Backend integracyjny 2.0" (Express + Socket.IO :4000) nie powstanie; rolę integracyjną pełnią route handlery Next + sidecar.