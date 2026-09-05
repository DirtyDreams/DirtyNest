# ADR-0014 · Wycofanie `/api/chat` (proxy Gemini) — kompletne usunięcie

**Status:** ✅ przyjęta (2026-08-29, rozstrzyga otwarte pytanie nr 1 z rejestru ADR-0001…0010)

**Kontekst:** Otwarte pytanie nr 1: czy klasyczny czat Gemini (`/api/chat`, proxy `@google/genai`) zostaje jako fallback „Generalist", czy zostaje całkowicie wycofany? Stan faktyczny (weryfikacja 2026-08-29): w trybie ACP działają już `standard` i `reasoning`; do legacy route prowadzi **jedyna** ścieżka — przycisk trybu `code_interpreter` w `ChatbotView` — a `@google/genai` jest importowane wyłącznie przez ten jeden route. Branch `deep_research` to symulacja czysto frontendowa (bez API).

**Decyzja:** `/api/chat` (proxy Gemini) zostaje **całkowite usunięte**:
- delete `src/app/api/chat/route.ts`; usunięcie `@google/genai` z zależności;
- tryb `code_interpreter` przechodzi przez tę samą ścieżkę ACP co standard/reasoning (osobny tryb = inny prompt agenta, nie inny transport);
- brak fallbacku „Generalist" na proxy LLM — fallbackiem jest agent Generalist na kliencie Hermes (ADR-0005), nie osobne proxy;
- pole klucza Gemini w SettingsModal zostaje (uniwersalny magazyn kluczy UI — wygasłe, nieużywane przez kod);
- symulator deep_research pozostaje do czasu kolejkowego deep research (ADR-0010); jest uczciwie oznaczony jako symulacja w UI.

**Konsekwencje:**
- Każda rozmowa w DirtyNest przebiega przez Engine (Hermes ACP) zgodnie z ADR-0001 i ADR-0011 — zero drugiego kanału LLM (reguła 4: jeden protokół agentów).
- `GEMINI_API_KEY`/`GOOGLE_API_KEY` przestają być istotne dla frontendu; jedynym miejscem konfiguracji modeli jest konfiguracja agentów/profilu Hermes.
- Mniejsze API surface: jedna trasa publiczna mniej (była niezabezpieczona przed F2 — usunięcie czyni to moot).