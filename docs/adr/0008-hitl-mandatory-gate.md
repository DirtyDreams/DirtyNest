# ADR-0008 · HITL (Human-in-the-Loop) jako bramka obowiązkowa

**Status:** ✅ przyjęta

**Kontekst:** Frontend ma gotową bramkę HITL w Control Room; typy `HermesHitlPolicy` istnieją w kodzie; sidecar ma `POST /api/hermes/acp/gate/resolve`.

**Decyzja:** Każde narzędzie o `risk_level` `critical` (publikacja social, operacje Docker, shell, zapisy FS) wymaga zgody operatora przez Control Room przed wykonaniem. `autoApproveLowRisk` domyślnie włączone dla `low`.

**Konsekwencje:** Log decyzji HITL zapisujemy w `hermes_tool_logs.permission_status` (pole już istnieje).

---
