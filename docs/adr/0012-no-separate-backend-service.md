# ADR-0012 · Brak osobnej usługi backend — topo dwuwarstwowa

**Status:** ✅ przyjęta (2026-08-29)

**Kontekst:** W repo istnieje **pusty** katalog `backend/` (brak jakichkolwiek plików w historii gita), a `AGENTS.md` opisywał „trzy warstwy" ze standalone usługą Fastify :4000 (concepcja 1.x / plan 2.0: Express). Rzeczywisty orchestrator (routing z ADR-0002) zaimplementowano w `src/lib/orchestrator/` (warstwa Next), a integracje — w sidecarze.

**Decyzja:** DirtyNest to system **dwuwarstwowy**: frontend+API Next.js (`src/app/api/*`, Drizzle/Postgres) i **sidecar** FastAPI :8000 (ACP, CDP, Docker, cron, heurystyki, automations). Osobna usługa backendowa nie powstanie; pusty `backend/` usuwamy.

**Konsekwencje:**
- `AGENTS.md` przepisany do realnej topo (bez „trzech warstw", bez sekcji komend backend/).
- Endpointy „REST backendu" z blueprintu 2.0 nie mają odpowiednika jako osobna usługa; odpowiedniki istnieją jako route handlery Next (`/api/chat/*`, `/api/knowledge/*`, `/api/social/*`, `/api/audit/*`).
- Port 4000 z dokumentów 2.0 jest wolny; kompozycja Docker pozostaje 7-usługowa (postgres/qdrant/redis/searxng/ollama/web/sidecar).