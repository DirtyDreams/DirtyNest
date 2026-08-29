# ADR-0007 · Streaming zdarzeń do Control Room przez WebSocket sidecar

**Status:** ✅ przyjęta (spójna z rozmową: Control Room konsumuje strumień myśli; potwierdzenie „4. tak" dotyczyło ERD + compose)

**Decyzja:** Zdarzenia agentów (myśli, tool-calls, wyniki, tokeny, HITL-gates) płyną **jednym kanałem WebSocket sidecar** (`/ws/telemetry`, `/ws/acp`), do którego frontend jest już podłączony (`hermesSocket.ts`). Nie wprowadzamy drugiego mechanizmu (socket.io z rozmowy) — FastAPI WS + reconnect w kliencie wystarczą.

**Konsekwencje:**
- SSE/socket.io z szkieletów rozmowy: niewykorzystane.
- Router Next (faza F3) musi rozgłaszać zdarzenia ACP do odpowiednich sesji (pokoje = `sessionId`).

---
