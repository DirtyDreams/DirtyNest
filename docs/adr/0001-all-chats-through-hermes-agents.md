# ADR-0001 · Wszystkie czaty obsługiwane przez wyspecjalizowanych agentów Hermes

**Status:** ✅ przyjęta (żądanie użytkownika z rozmowy: „wszystkie czaty beda obslugiwane przez wyspecjalizowanych hermes agentow")

**Kontekst:** Frontend ma widoki Hermes Master Brain / Control Room / AI Agents Swarm; `/api/chat` to tylko proxy Gemini.

**Decyzja:** Nie budujemy prostego proxy LLM. Każda rozmowa przechodzi przez **Hermes Orchestrator**, który wybiera specjalizowanego agenta. Agent działa w pętli **ReAct** (think → act → observe), może wywoływać narzędzia, delegować zadania i zwracać strumień zdarzeń (`thinking`, `tool_call`, `tool_result`, `token`, `source`, `done`).

**Konsekwencje:**
- Model danych musi zapisywać trace rozumowania i wywołania narzędzi (istnieje: `hermes_messages.reasoning_trace`, `hermes_tool_logs`).
- Control Room jest głównym konsumentem strumienia zdarzeń.
- Długoterminowe zadania (deep research) wymagają kolejki asynchronicznej.

---
