# DirtyNest 2.0 — API Specification (REST, WebSocket, Webhooki)

> Backend Node.js + Express = warstwa integracyjna. Logika agentów: DeepSeek Harness (JSON-RPC).
> Base URL: `http://localhost:4000/api` · Autoryzacja: `Authorization: Bearer <JWT>`
> Uprawnienia: **Public / Chronione (dowolne konto) / Admin**

## 1. Authentication Endpoints
- `POST /api/auth/register` — Rejestracja operatora (rola domyślna: member).
- `POST /api/auth/login` — Logowanie, JWT access + refresh.
- `POST /api/auth/refresh` — Odświeżenie tokenu dostępu.
- `POST /api/auth/logout` — Wylogowanie (unieważnienie refresh).
- `GET /api/auth/me` — Profil i preferencje aktualnego użytkownika.

## 2. Agentic Chat (delegacja do Harness)
- `GET /api/chat/sessions` — Lista sesji użytkownika.
- `POST /api/chat/sessions` — Nowa sesja (tworzy mapowanie `harness_session_id`).
- `GET /api/chat/sessions/:id` — Szczegóły sesji.
- `DELETE /api/chat/sessions/:id` — Usunięcie sesji.
- `GET /api/chat/sessions/:id/messages` — Historia wiadomości.
- `POST /api/chat/sessions/:id/messages` — Wyślij wiadomość → Harness (`agent.run`), odpowiedź strumieniowana Socket.IO.

## 3. Knowledge Vault (Qdrant + PostgreSQL)
- `GET /api/knowledge/docs` — Lista dokumentów (filtry: tag, kategoria).
- `POST /api/knowledge/docs` — Dodaj dokument (embedding → Qdrant, metadane → PG).
- `GET /api/knowledge/docs/:id` — Pełna treść + metadane.
- `PUT /api/knowledge/docs/:id` — Aktualizacja (re-embedding).
- `DELETE /api/knowledge/docs/:id` — Usunięcie (wymaga HITL przy użyciu przez agenta).
- `POST /api/knowledge/search` — Wyszukiwanie semantyczne (Qdrant).
- `GET /api/knowledge/tags` — Lista tagów.
- `GET /api/knowledge/stats` — Statystyki (liczba docs, punktów Qdrant).

## 4. Social Media Command
- `GET /api/social/accounts` — Lista połączonych kont.
- `POST /api/social/accounts` — Podłączenie konta (OAuth; tokeny szyfrowane AES-256-GCM).
- `DELETE /api/social/accounts/:id` — Usunięcie konta.
- `GET /api/social/posts` — Lista postów (draft/scheduled/queued/published/failed).
- `POST /api/social/posts` — Utworzenie posta (draft lub z harmonogramem).
- `PUT /api/social/posts/:id` — Edycja.
- `DELETE /api/social/posts/:id` — Usunięcie.
- `POST /api/social/posts/:id/publish` — Publikacja natychmiastowa (HITL).
- `POST /api/social/posts/:id/cancel` — Anulowanie zaplanowanego.
- `GET /api/social/posts/:id/metrics` — Statystyki posta.

Platformy: `twitter`, `instagram`, `facebook`, `tiktok`, `reddit`.

## 5. Docker Infrastructure (Admin)
- `GET /api/docker/containers` — Lista kontenerów (cache `docker_containers`).
- `POST /api/docker/containers/refresh` — Odświeżenie cache.
- `POST /api/docker/containers/:id/start` — Start.
- `POST /api/docker/containers/:id/stop` — Stop (HITL).
- `POST /api/docker/containers/:id/restart` — Restart.
- `GET /api/docker/containers/:id/logs` — Logi kontenera.
- `GET /api/docker/compose` — Lista stosów Compose.
- `POST /api/docker/compose` — Deploy stosu z YAML.
- `DELETE /api/docker/compose/:id` — Usunięcie stosu.

## 6. Tasks (BullMQ)
- `GET /api/tasks` — Lista zadań asynchronicznych (filtry: type, status).
- `GET /api/tasks/:id` — Status + postęp zadania.
- `POST /api/tasks/:id/cancel` — Anulowanie zadania.

Typy zadań: `deep_research`, `social_publish`, `cve_scan`, `container_scan`.

## 7. Logs (Admin)
- `GET /api/logs` — Logi audytowe (filtry: level, source, zakres czasu).
- `GET /api/logs/stats` — Statystyki poziomów i błędów.
- `GET /api/logs/source/:source` — Logi po źródle (UI/DATABASE/AGENT/DOCKER/SOCIAL/SYSTEM/API).

## 8. WebSocket (Socket.IO) — `ws://localhost:4000/socket.io`

**Klient → serwer:**
| Zdarzenie | Payload | Opis |
|---|---|---|
| `join_session` | `{ sessionId? }` | Dołączenie do pokoju sesji |
| `send_message` | `{ sessionId, message, tools? }` | Wiadomość → Harness |
| `cancel_agent` | `{ sessionId }` | Przerwanie pracy agenta |
| `hitl_confirm` | `{ sessionId, approve, data? }` | Odpowiedź na prośbę HITL |

**Serwer → klient:**
| Zdarzenie | Payload |
|---|---|
| `session_joined` | `{ sessionId, userId }` |
| `agent_event` | patrz §9 |
| `error` | `{ message }` |

## 9. Format zdarzeń `agent_event`

| Typ | Opis | Przykład |
|---|---|---|
| `thinking` | Krok myślowy | `{ type:'thinking', step:'Analizuję zapytanie…' }` |
| `tool_call` | Wywołanie narzędzia | `{ type:'tool_call', tool:'dirtynest_web_search', args:{ query:'AI' } }` |
| `tool_result` | Wynik narzędzia | `{ type:'tool_result', tool:'dirtynest_web_search', result:[…] }` |
| `token` | Fragment odpowiedzi | `{ type:'token', content:'To jest' }` |
| `done` | Odpowiedź końcowa | `{ type:'done', response:'…', sources:[…] }` |
| `hitl_request` | Prośba o potwierdzenie | `{ type:'hitl_request', step:'Zatrzymać kontener?', data:{…} }` |

**HITL:** Harness emituje `hitl_request` → frontend pokazuje kartę zgody →
klient wysyła `hitl_confirm { sessionId, approve, data? }` → Harness kontynuuje/przerywa
(`confirmationTimeout: 30000` → brak odpowiedzi = odmowa).

## 10. Webhooki

**Konfiguracja:** `WEBHOOK_SECRET`, `WEBHOOK_URLS` (JSON: zdarzenie → URL).

| Zdarzenie | Payload (data) |
|---|---|
| `post.published` | `{ postId, platform, platformPostId, text, metrics }` |
| `post.scheduled` | `{ postId, platform, scheduledTime, cronExpression }` |
| `task.completed` | `{ taskId, type, result }` |
| `task.failed` | `{ taskId, type, error }` |
| `alert.triggered` | `{ alertName, severity, message, value }` |
| `agent.error` | `{ sessionId, agentType, error }` |

Zabezpieczenia: nagłówek `X-Webhook-Signature` (HMAC-SHA256 z `WEBHOOK_SECRET`);
retry 5× (1 min, 5 min, 15 min, 1 h, 6 h) przez kolejkę `webhook-send`.

> Usunięte względem 1.x: `POST /api/chat/orchestrate` (klasyfikator), `GET /api/chat/agents`,
> `/api/agents/*` (rejestr agentów backendu) — te odpowiedzialności przeniosły się do
> Harness/profilu. `WS /ws/chat/stream` itd. zastąpione Socket.IO (`/socket.io`).