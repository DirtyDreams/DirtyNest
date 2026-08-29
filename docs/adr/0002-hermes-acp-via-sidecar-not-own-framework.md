# ADR-0002 · Silnik agentów: Hermes ACP przez sidecar, nie własny framework

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
