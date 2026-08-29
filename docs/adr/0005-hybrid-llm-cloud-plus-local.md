# ADR-0005 · LLM: hybryda — API chmurowe + Ollama / llama.cpp

**Status:** ✅ przyjęta (odpowiedź nr 3; potwierdzenie: „3. trzeba dodac jeszcze reddit" dotyczy social, nie LLM)

**Decyzja:** Agenci mogą korzystać zarówno z API chmurowych (Gemini, Claude, GPT, DeepSeek), jak i z **lokalnych modeli Ollama / llama.cpp**. Backend LLM jest atrybutem konfiguracji agenta/sesji (`model_backend`), nie stałą systemu.

**Konsekwencje:**
- Usługa `ollama` w docker-compose (faza F1) + pole wyboru backendu w konfiguracji agentów.
- Typy `HermesProvider` w `src/lib/hermes/types.ts` już to obejmują (`ollama`, `openrouter`, …).
- Koszt/prywatność: klasyfikator routingu powinien domyślnie używać lokalnego lub najtańszego modelu.

---
