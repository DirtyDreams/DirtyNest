# DirtyNest 2.0 — Project Overview & Frontend Architecture

<<<<<<< HEAD
> ⚠️ **Notka „2.0 / DeepSeek Harness" poniżej jest NIEAKTUALNA (2026-08-29) — patrz [ADR-0011](./adr/0011-hermes-acp-confirmed-harness-blueprint-rejected.md).** Centralnym mózgiem jest **Hermes ACP (profil `dirtydaily`)** przez sidecar, nie DeepSeek Harness. Backend Node/Express nie istnieje (ADR-0012). Sekcje 1–3 (koncepcja UI, 16 decków, stack frontendu) pozostają wiarygodne.

=======
>>>>>>> 29c61f5ff3ec86ceaa460801926554e8eed63f24
> **Wersja 2.0 (czerwiec 2025):** zmiana koncepcji — patrz `backend-architecture.md`.
> Centralnym mózgiem systemu jest **DeepSeek Harness**; backend Node.js pełni rolę
> warstwy integracyjnej (REST + WebSocket + serwisy), a nie własnego silnika agentów.

## 1. Introduction
DirtyNest is a cyberpunk tactical command center, AI deep research hub, multi-agent swarm orchestrator, and observability matrix built as a rich frontend application. It serves as a unified workspace for managing autonomous agents, interacting with multiple AI models, monitoring containers, handling social media, and querying knowledge graphs.

**Architektura 2.0:** wszystkie interakcje AI (chat, research, automatyzacje) są realizowane przez **DeepSeek Harness** (`dsh`) uruchomiony jako osobna usługa w Docker Compose. Backend Node.js jest cienką warstwą integracyjną — nie hostuje własnej pętli agentowej.

## 2. Technology Stack
- **Frontend:** Next.js 16 (App Router + Turbopack), React 19, TypeScript, Tailwind CSS v4 (Cyberpunk theme tokens), Zustand
- **Backend (warstwa integracyjna):** Node.js + Express + Socket.IO (REST + WebSocket)
- **Centralny mózg:** DeepSeek Harness (`dsh`) — profile YAML + narzędzia TypeScript + pętla agenta z HITL
- **Dane:** PostgreSQL 16 (relacyjna), Qdrant (wektorowa), Redis 7 (cache + BullMQ)
- **Modele AI:** Gemini 2.5 Pro (główny), Claude 3.7 Sonnet (code), GPT-4-turbo (opcjonalny), Ollama/Llama 3 (lokalny fallback)
- **Pamięć i wyszukiwanie:** tdai-memory (pamięć długoterminowa), SearXNG (własna instancja wyszukiwania)
- **Monitoring:** Prometheus + Grafana

## 3. Workspaces & Decks (16 Core Views)
DirtyNest organizes its capabilities into specialized decks/workspaces:

1. **Overview Bento Grid:** 32+ modular widgets, customizable layouts, and preset views for quick system overview.
2. **Hermes Master Brain & Neural Chat:** czat multi-model realizowany przez Harness (Gemini, Claude, GPT, Ollama) z XML parsing, reasoning traces i citation tracking.
3. **Control Room:** Autonomiczny kokpit z zatwierdzeniami Human-in-the-Loop (HITL) i strumieniem myśli agentów w czasie rzeczywistym.
4. **AI Agents Swarm:** Swarm management, DAG task graphs, and real-time telemetry (CPU, RAM, task success rates).
5. **Knowledge Vault:** 2D/3D knowledge graph visualizer, Markdown document manager, Karpathy skills integration. Embeddingi w **Qdrant**, metadane w PostgreSQL.
6. **Docker Hub:** Container lifecycle management, Docker Compose stacks, logs inspection, and vulnerability (CVE) scanning.
7. **Image & Sound Studios:** Latent diffusion image generation and audio synthesis suites.
8. **Persona Nexus:** Avatar and viseme-based speech synthesis control room.
9. **Social Media Command:** Cross-platform scheduling and monitoring (X, Instagram, Facebook, TikTok, Reddit).
10. **Threat Intel & Security Logs:** CVE radar (Trivy + NVD), audit logs, and threat intelligence feeds.
11. **Dev Tools Suite:** 15+ built-in utility tools (JSON/YAML converters, JWT decoders, color palette generators, Zod schema testers).
12. **Calendar & Focus:** Pomodoro productivity tracking and event management.
13. **Quick Links:** Fast bookmarking and resource navigation.
14. **System Diagnostics:** Hardware metrics, process monitors, and performance tuning.
15. **Import/Export:** Configuration backup and state migration.
16. **Settings & Preferences:** Theme customization, API key management, and provider configuration.