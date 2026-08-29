# DirtyNest 2.0 — Backend Architecture & DeepSeek Harness (Centralny Mózg)

> ⛔ **ODRZUCONY BLUEPRINT (2026-08-29) — patrz [ADR-0011](./adr/0011-hermes-acp-confirmed-harness-blueprint-rejected.md) i [ADR-0012](./adr/0012-no-separate-backend-service.md).**
> Ten dokument opisuje wymianę silnika na DeepSeek Harness (`dsh`) i warstwę Express :4000 — **nic z tego nie istnieje w kodzie** (`backend/` był zawsze pusty, `dsh` = npm `0.1.1-rc.2`). Silnikiem pozostaje Hermes ACP przez sidecar. Dokument zachowany wyłącznie jako źródło pomysłów adaptowanych inkrementalnie (prompty soul.md, rejestr narzędzi, observability, webhooks). **Nie czytaj dalej jako stanu systemu.**

> **Zmiana koncepcji (2.0):** DeepSeek Harness przestaje być opcjonalnym, hybrydowym
> "drugim silnikiem" i staje się **jedynym runtime'em agentów**. Backend Node.js nie
> implementuje własnej pętli ReAct ani własnego orchestratora — pełni rolę warstwy
> integracyjnej. Poprzednia koncepcja hybrydowa (`AgentOrchestratorProxy`) jest wycofana.

## 1. Architectural Evolution (v2.0)

DirtyNest przechodzi od architektury "backend z własnym silnikiem agentowym" do
architektury **Harness-first**:

- **Centralny mózg:** DeepSeek Harness (`dsh`) — produkcyjny runtime dla agentów AI
  (pętla agenta z HITL, zarządzanie sesjami, wywołania LLM, rejestr narzędzi).
- **Warstwa integracyjna:** backend Node.js + Express — REST API, WebSocket (Socket.IO),
  serwisy domenowe, BullMQ, webhooki. **Nie zawiera** własnego klasyfikatora ani pętli ReAct.
- **Wszystko w Docker Compose:** Postgres (pgvector), Qdrant, Redis, Ollama, SearXNG,
  tdai-memory, Harness, backend, frontend, Prometheus, Grafana.

## 2. Komponenty

| Komponent | Opis | Technologia |
|-----------|------|-------------|
| **Frontend** | Interfejs użytkownika | Next.js 16 + Tailwind |
| **Backend (API)** | REST + WebSocket (integracja) | Node.js + Express + Socket.IO |
| **Harness** | Silnik agentów AI (mózg) | DeepSeek Harness (pnpm + TypeScript) |
| **Profile** | Konfiguracja agentów i narzędzi | YAML (`cordis.patch.yml`) + TS |
| **Narzędzia** | Funkcje wywoływane przez agentów | TypeScript (wtyczki Harness) |
| **PostgreSQL** | Dane relacyjne | Postgres 16 + pgvector |
| **Qdrant** | Baza wektorowa (embeddingi) | Qdrant |
| **Redis** | Cache, kolejki BullMQ | Redis 7 |
| **Ollama** | Lokalne modele LLM (fallback, prywatność) | Ollama (Llama 3) |
| **SearXNG** | Wyszukiwarka internetowa | SearXNG (własna instancja) |
| **tdai-memory** | Pamięć długoterminowa agentów | tdai-memory |
| **BullMQ** | Kolejki zadań asynchronicznych | BullMQ (Redis) |
| **Prometheus / Grafana** | Metryki, dashboardy, alerty | Prometheus + Grafana |

## 3. Core Data Flow

```
[Frontend Chat UI]
       │ (REST / WebSocket Socket.IO)
       ▼
[Backend Node.js — warstwa integracyjna]
   REST: /api/*        WS: send_message / hitl_confirm
       │
       ▼ (JSON-RPC)
[DeepSeek Harness — centralny mózg]
   ├── Profile (cordis.patch.yml): modele, narzędzia, agent-loop, sesje
   ├── Pętla agenta (maxSteps, HITL requireConfirmation)
   ├── Narzędzia DirtyNest (social, docker, security, knowledge, search, system)
   └── Modele: Gemini 2.5 Pro / Claude 3.7 / GPT-4-turbo / Ollama
       │
       ├──► [PostgreSQL]  dane relacyjne, sesje Harness, audyt
       ├──► [Qdrant]      embeddingi Knowledge Vault
       ├──► [tdai-memory] pamięć długoterminowa
       ├──► [SearXNG]     wyszukiwanie internetowe
       ├──► [BullMQ/Redis] zadania asynchroniczne (deep research, publish, skany)
       └──► [Webhook Dispatcher] zdarzenia na zewnątrz (HMAC-SHA256)
       │
       ▼
[Socket.IO agent_event: thinking | tool_call | tool_result | token | done | hitl_request]
       ▼
[Frontend Control Room / Chat]
```

## 4. Kluczowe decyzje względem koncepcji 1.x

| Obszar | Było (1.x) | Jest (2.0) |
|---|---|---|
| Silnik agentów | Własny HermesOrchestrator + ReAct w backendzie | **DeepSeek Harness** (JSON-RPC, pętla + HITL w Harness) |
| Rola backendu | Pełny silnik (orchestrator, klasyfikator, agenci) | Warstwa integracyjna: REST, WS, serwisy, kolejki, webhooki |
| Embeddingi | pgvector w PostgreSQL | **Qdrant** (PostgreSQL trzyma tylko metadane + `qdrant_point_id`) |
| Osobowości agentów | System prompt w tabeli `agents_hermes` | Pliki **soul.md** w `harness/prompts/` (wersjonowane w repo) |
| Narzędzia | Rejestr narzędzi w backendzie | **Wtyczki TypeScript Harness** (`harness/tools/*.ts`) wołające serwisy backendu |
| HITL | Własny gate w backendzie | `requireConfirmation` w profilu Harness + kanał `hitl_confirm` |
| Wyszukiwanie web | Ad-hoc API | **Własna instancja SearXNG** |
| Pamięć | Tylko baza | tdai-memory (pamięć + wiki) |
| Obserwowalność | Logi aplikacyjne | Prometheus + Grafana + alerty |
| Sekrety | JSONB + AES | bez zmian: AES-256-GCM (`ENCRYPTION_KEY`), JWT access+refresh |

## 5. Zasady stałe (wszystkie sprinty)

1. Backend nie implementuje logiki agenta — deleguje do Harness (JSON-RPC `agent.run`).
2. Narzędzie agenta = wtyczka TypeScript w `harness/tools/`, wołająca serwis backendu; żadne narzędzie nie łączy się z bazą bezpośrednio.
3. Socket.IO emituje wyłącznie ustandaryzowane `agent_event` (jeden kontrakt frontend↔backend↔Harness).
4. Sekrety (tokeny social, klucze API) szyfrowane AES-256-GCM przed zapisem.
5. Każda zmiana stanu (auth, HITL, docker, social publish) → wpis w `audit_logs`.
6. Docker przez ograniczony dostęp (dockerode + socket) — akcje destrukcyjne wymagają HITL.

## 6. Szczegółowe dokumenty

- `agent-system.md` — agenci (soul.md), narzędzia DirtyNest, konfiguracja profilu Harness
- `api-specification.md` — REST + Socket.IO + webhooki
- `data-models.md` — 11 tabel PostgreSQL + Qdrant
- `backend-implementation-plan.md` — sprinty S0–S5, szacunki, ryzyka
- `overview.md` — widoki 16 decków frontendu