# ADR-0010 · Automatyzacje długotrwałe: kolejka taskowa

**Status:** ⏳ odroczona do F3/F5

**Kontekst:** Rozmowa proponowała BullMQ + Redis. `REDIS_URL` jest w `.env.local`, ale Redis nie istnieje w compose ani w kodzie.

**Decyzja:** MVP używa lekkiego mechanizmu: **cron_service w sidecar** + tabela zadań w Postgres. BullMQ wprowadzamy dopiero wtedy, gdy pojawi się realne zapotrzebowanie (harmonogram postów social, deep research w tle) — nie wcześniej, by nie dokładać usługi „na zapas".

**Konsekwencje:** Faza F1 dodaje Redis do compose (bo URL już istnieje i telemetria go zakłada), ale kod kolejek powstaje dopiero w F3/F5.

---

## Otwarte pytania (do decyzji w trakcie implementacji)

| # | Pytanie | Powiązanie |
|---|---|---|
| 1 | Czy klasyczny czat Gemini (`/api/chat`) zostaje jako fallback „Generalist", czy zostaje całkowicie wycofany? | F3 |
| 2 | Ollama jako kontener w compose czy proces natywny (GPU na hoście)? | F1 |
| 3 | Publikacja na X/IG/FB/TikTok: API oficjalne vs. automatyzacja przez CDP (Chrome), które już jest w sidecar? | F5 |
| 4 | Czy graf wiedzy (Knowledge Vault) ma indeksować pliki Obsidian z dysku, czy tylko dokumenty wgrane przez UI? | F4 |

---

## Powiązane dokumenty

- [current-state.md](./current-state.md) — co z powyższego jest już w kodzie,
- [implementation-plan.md](./implementation-plan.md) — jak decyzje przekładają się na fazy F0–F6.
