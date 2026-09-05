# ADR-0004 · Hosting: homelab / Docker Compose

**Status:** ✅ przyjęta (odpowiedź nr 2: „A" — lokalnie/homelab; potwierdzenie: „2. jest")

**Decyzja:** Wszystko w **Docker Compose** na własnym sprzęcie (Windows 11 / Homelab). Bez Kubernetes, bez chmury publicznej. Reverse proxy i SSL — na później (E2E w homelab).

**Konsekwencje:**
- `docker-compose.yml` musi spinać pełny zestaw usług (obecnie brakuje redis, qdrant, searxng, ollama).
- WebSocket/SSE bez ograniczeń serverless; socket.io niepotrzebny — sidecar używa natywnego WS FastAPI.
- Dostęp do Dockera dla sidecar przez mount `docker.sock` (do przeglądu w fazie F6 — kompromis bezpieczeństwa).

---
