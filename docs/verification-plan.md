# DirtyNest — Verification & Missing-Work Plan

> **Wersja:** 1.0 · **Data:** 2026-08-29
> **Źródła:** weryfikacja na żywo (typecheck/build/lint/pytest), audyt [current-state.md](./current-state.md), plan [implementation-plan.md](./implementation-plan.md).
> Ten dokument jest **planem działań dla tego, czego brakuje** — opartym na faktycznie zweryfikowanym stanie kodu, nie tylko na dokumentacji.

---

## 1. Wyniki weryfikacji (uruchomione 2026-08-29)

| Kontrola | Wynik | Uwagi |
|---|---|---|
| Frontend `npm run typecheck` | 🟢 pass | `tsc --noEmit` |
| Frontend `npm run build` | 🟢 pass | 28 tras (App Router) |
| Frontend `npm run lint` | 🔴 **FAIL** | flat config odwołuje się do `react-hooks/*`, plugin nie zarejestrowany |
| Backend `npm run typecheck` | 🟢 pass | |
| Backend `npm run build` | 🟢 pass | `tsc -p tsconfig.json` → dist/ |
| Sidecar `pytest tests/` | 🟢 13 passed | venv `.venv` (Python 3.11.16) |

**Toolchain:** Node v22.23.2 / npm 12.0.2. Python tylko przez `sidecar/.venv` (brak systemowego `python`/`py` na PATH).

---

## 2. Potwierdzone luki (zweryfikowane w kodzie)

### 2.1 Warstwa danych (F0) — wszystkie potwierdzone
- `sql.js` nadal w `package.json` (1 wystąpienie).
- **Runtime-DDL:** `CREATE TABLE IF NOT EXISTS` ×10 w `src/db/index.ts` — prawda o schemacie w kodzie, nie w migracjach.
- **Hardcoded hasło bazy** (w **3 plikach**: `src/db/index.ts:8`, `drizzle.config.ts:8`, `docker-compose.yml:12,32,50`).
- Stara migracja SQLite `0000_young_shiver_man.sql` w `drizzle/_legacy-sqlite/`; brak baseline PostgreSQL dla 10 tabel rdzeniowych.
- Brak `.env.example`.
- Daty jako `varchar(100)`, nie `timestamptz`.

### 2.2 Nowe ustalenie (nieobecne w docs)
- `npm run lint` jest **zepsuty** — `eslint.config.mjs` nadpisuje reguły `react-hooks/*`, ale plugin nie jest rozwiązywalny w flat config. Ostatni commit `255aed8` ("fix(eslint): restore rule overrides — drop all errors to 0") to wprowadził. Udokumentowane "~80 błędów / 239 ostrzeżeń" jest nieaktualne — lint obecnie w ogóle nie działa.

### 2.3 Luki architektoniczne (F1–F6, zgodne z kodem)
- **Infra:** compose uruchamia tylko postgres+web+sidecar; brak redis/qdrant/searxng/ollama (zmienne env już istnieją).
- **Auth:** brak tabeli `users`, JWT, ochrony endpointów — tylko mock persona.
- **Hermes engine:** backend orchestrator (`backend/`) nie podpięty do frontendu; `/api/chat` to proxy Gemini; `minions_registry`/`cron_jobs_registry` w sidecar to mocki.
- **Knowledge RAG:** zależności są, brak ingestu/API.
- **Social:** tylko Reddit częściowo; X/IG/FB/TikTok nie istnieją.
- **Jakość:** brak testów JS/TS, CI, e2e.
- **Higiena repo:** 78 brudnych plików, 17 usuniętych skryptów Python z roota niezacommitowanych, PNG/logi w repo.

---

## 3. Plan działań

Repo ma już szczegółowy plan F0–F6 w `docs/implementation-plan.md` — jest trafny. Wykonujemy go w kolejności, z **dwoma dodatkami** wynikającymi z weryfikacji.

### Faza 0 — Naprawa zepsutej bramki + warstwa danych (najpierw, ~1 dzień)

| # | Zadanie | Pliki | Uwagi |
|---|---|---|---|
| 0.1 | **Naprawa lintu** (nowe): zarejestruj `eslint-plugin-react-hooks` w flat config (import + `plugins`) albo usuń nadpisania `react-hooks/*` | `eslint.config.mjs` | zweryfikuj `npm run lint` działa |
| 0.2 | Regeneracja baseline migracji PostgreSQL przez `drizzle-kit generate`; usunięcie starej migracji SQLite | `drizzle/`, `drizzle.config.ts` | |
| 0.3 | Usunięcie runtime-DDL z `initDb()` → `drizzle-kit migrate` przy starcie | `src/db/index.ts` | |
| 0.4 | Usunięcie `sql.js` z `package.json` (sprawdź brak importów) | `package.json` | |
| 0.5 | Hasło bazy → env; utworzenie `.env.example`; **rotacja** wyciekłego hasła | `src/db/index.ts`, `drizzle.config.ts`, `docker-compose.yml`, `.env.example` | |
| 0.6 | `varchar(100)` → `timestamptz` (etapowy cast) | `src/lib/schema.ts`, `drizzle/` | |
| 0.7 | Commit 78-plikowego brudnego drzewa (w tym 17 usuniętych skryptów root) | — | |

### Faza 1 — Infrastruktura
Dodanie qdrant/redis/searxng/ollama do compose, podpięcie env, skrypt backupu.

### Faza 2 — Auth
Tabela `users` (2 seedowane), JWT przez `jose`, httpOnly cookies, ochrona `/api/*`, szyfrowanie kluczy API.

### Faza 3 — Hermes engine
Podpięcie backend orchestrator → frontend, zastąpienie proxy Gemini, realne minions/cron, HITL end-to-end.

### Faza 4 — Knowledge RAG
Ingest Qdrant + `/api/knowledge/*` + narzędzie `semantic_search`.

### Faza 5 — Social
Interfejs adaptera, refaktor Reddit, dodanie X/IG/FB/TikTok.

### Faza 6 — Jakość
CI, testy JS/TS, lint debt do 0, e2e.

---

## 4. Rekomendowany następny krok

**Naprawa bramki lint (Faza 0.1)** — to jedyne zepsute polecenie weryfikacyjne i blokuje zielony baseline, na którym buduje się reszta.
