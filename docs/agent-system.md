# DirtyNest 2.0 — Agenci, osobowości (soul.md) i narzędzia Harness

> ⛔ **ODRZUCONY BLUEPRINT (2026-08-29) — patrz [ADR-0011](./adr/0011-hermes-acp-confirmed-harness-blueprint-rejected.md).** Agenci DirtyNest to nie Harness: żyją w `agent_configs` + profilu Hermes `dirtydaily` (ADR-0002); pętla/HITL/sesje należą do procesu Hermes. Rejestr 16 narzędzi `dirtynest_*` poniżej = inspiracja dla konfiguracji narzędzi agentów (część już pokryta: semantic_search, social_post, docker_*); pakiety `@deepseek-ai/dsh` i pliki `harness/` nie istnieją.

> **Zmiana koncepcji 2.0:** agenci nie są implementowani w backendzie Node.js.
> Ich osobowości to pliki **soul.md** (`harness/prompts/`), a narzędzia to wtyczki
> TypeScript Harness (`harness/tools/`) wołające serwisy warstwy integracyjnej.
> Pętlę agenta, HITL i zarządzanie sesjami prowadzi DeepSeek Harness.

---

## 1. Architektura agentowa

```
[Frontend] ──Socket.IO──► [Backend Node.js] ──JSON-RPC agent.run──► [DeepSeek Harness]
                                                                      │
                                        ┌─────────────────────────────┤
                                        ▼                             ▼
                                  [Modele AI]                  [Narzędzia DirtyNest]
                          Gemini 2.5 Pro / Claude 3.7 /        harness/tools/*.ts
                          GPT-4-turbo / Ollama (lokalnie)      (wołają serwisy backendu)
```

- **Hermes Master Agent** jest agentem domyślnym profilu (`systemPromptFile: prompts/hermes.txt`).
- Delegacja między agentami: narzędzie `dirtynest_delegate`.
- Sesje Harness persystowane w PostgreSQL (`harness_sessions`, TTL 7 dni).

## 2. Role agentów (7 × soul.md)

| Agent | Plik promptu | Rola | Model |
|---|---|---|---|
| Hermes (Master) | `prompts/hermes.txt` | Nadzorca, routing, delegacja, reasoning | Gemini 2.5 Pro |
| Research | `prompts/research.txt` | Deep research, cytaty, fact-check | Gemini 2.5 Pro |
| Code | `prompts/code.txt` | Kod w sandboxie (kontener Docker) | Claude 3.7 Sonnet |
| Security | `prompts/security.txt` | CVE, audyt logów, threat intel | Gemini 2.5 Pro |
| DevOps | `prompts/devops.txt` | Kontenery, Compose, infrastruktura | Claude 3.7 Sonnet |
| Social | `prompts/social.txt` | Copywriting, harmonogram, analityka | Gemini 2.5 Pro |
| Generalist | `prompts/generalist.txt` | Uniwersalny asystent, fallback | Ollama/Llama 3 (proste), Gemini (złożone) |

Pełne treści soul.md (tożsamość, osobowość, zasady, relacja z operatorem) — w
`harness/prompts/*.txt`; struktura: `# SOUL: <Agent>` → Tożsamość / Osobowość / Zasady / Relacja z Operatorem.

## 3. Narzędzia DirtyNest (wtyczki Harness)

Każde narzędzie to plik TypeScript w `harness/tools/` z `defineTool(...)` — parametry
JSON Schema, `execute(args, ctx)` wołający serwis backendu. Rejestracja w `harness/tools/index.ts`
i w profilu (`patch.id: tools → config.register`).

| Narzędzie | Opis | HITL | Kategoria |
|---|---|---|---|
| `dirtynest_social_post` | Publikacja posta (X, IG, FB, TT, Reddit) | ✅ (produkcja) | Social |
| `dirtynest_social_schedule` | Planowanie posta (cron) | ❌ | Social |
| `dirtynest_social_metrics` | Statystyki posta | ❌ | Social |
| `dirtynest_docker_list` | Lista kontenerów | ❌ | Docker |
| `dirtynest_docker_start` | Start kontenera | ❌ | Docker |
| `dirtynest_docker_stop` | Stop kontenera | ✅ | Docker |
| `dirtynest_docker_restart` | Restart kontenera | ❌ | Docker |
| `dirtynest_docker_logs` | Logi kontenera | ❌ | Docker |
| `dirtynest_cve_scan` | Skan kontenera (Trivy) | ❌ | Security |
| `dirtynest_cve_query` | Zapytanie o CVE (NVD) | ❌ | Security |
| `dirtynest_semantic_search` | Wyszukiwanie w Knowledge Vault (Qdrant) | ❌ | Knowledge |
| `dirtynest_knowledge_add` | Dodanie dokumentu | ❌ | Knowledge |
| `dirtynest_knowledge_delete` | Usunięcie dokumentu | ✅ | Knowledge |
| `dirtynest_web_search` | Wyszukiwanie (SearXNG) | ❌ | Search |
| `dirtynest_system_status` | Status Redis/Postgres/Qdrant | ❌ | System |
| `dirtynest_delegate` | Delegacja do innego agenta | ❌ | System |

## 4. Profil Harness (`harness/profiles/dirtynest/cordis.patch.yml`)

Kluczowe sekcje `patch:`:

1. **`llm`** — modele: `gemini` (default, 2.5 Pro), `claude` (3.7 Sonnet), `openai` (GPT-4-turbo), `ollama` (llama3, `${OLLAMA_URL}`).
2. **`tools`** — rejestr 16 narzędzi `dirtynest_*` (lista jak wyżej).
3. **`agent-loop`** — `maxSteps: 10`, `systemPromptFile: prompts/hermes.txt`,
   `requireConfirmation: [dirtynest_docker_stop, dirtynest_social_post, dirtynest_knowledge_delete]`,
   `confirmationTimeout: 30000`.
4. **`session`** — `storage: postgres`, `tableName: harness_sessions`, `ttl: 604800` (7 dni).
5. **`logger`** — `level: info`, `format: json`, `output: stdout`.

Instalacja: `pnpm add -g @deepseek-ai/dsh`; struktura repo: `harness/{profile.yml,tools/,prompts/}`
(albo `~/.dsh/profiles/dirtynest/`). Test: `dsh run --profile dirtynest`.

## 5. Pętla agenta i HITL

1. Harness wywołuje model (system prompt z soul.md + historia sesji).
2. Model decyduje: odpowiedź lub `tool_call`.
3. Narzędzie z `requireConfirmation` → Harness emituje `hitl_request` (timeout 30 s) →
   frontend pyta operatora → `hitl_confirm { approve }` wznawia lub przerywa akcję.
4. Każdy krok (`thinking`, `tool_call`, `tool_result`, `token`, `done`) trafia do
   frontendu jako `agent_event` przez Socket.IO i do `chat_messages.thinking_trace`.

## 6. Uwaga wdrożeniowa (uczciwość wobec planu)

Pakiet `@deepseek-ai/dsh` / `dsh-core` jest opisany w planie jako developer preview;
jeśli publiczna dystrybucja nie będzie dostępna, warstwa abstrakcji `HarnessClient`
(backend) pozwala podmienić silnik bez zmian w REST/Socket.IO — narzędzia i soul.md
pozostają nasze. Ryzyko i mitygacja: patrz `backend-implementation-plan.md` §Ryzyka.