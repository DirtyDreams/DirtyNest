# Zbiornik Ops — kontrakt operacyjny (F1)

> Status: **AKTYWNY** · Właściciel: DirtyNest sidecar + `C:\Users\coyot\workspace\zbiornik-ops\`
> Portal docelowy: `https://zbiornik.com` (brak publicznego API; skanowanie zewnętrzne blokowane — operacje wyłącznie w zalogowanej sesji Chrome/CDP).
> Zasada nadrzędna: **jedno konto operatora, każda akcja wychodząca przez kolejkę HITL, jedna sesja CDP, twarde limity tempa.**

## 1. Topologia

```
[Cron/CSV poll 30 min]
  sidecar RedisCronManager "zbiornik_poll"
      └─ zbiornik.py :: ZbiornikMonitorService.poll()
           └─ subprocess → zbiornik-ops.mjs  (CDP :9333 → zalogowana sesja)
                 ├─ read ops: me / list-topics / topic / inbox / notif
                 └─ (publikacja NIGDY nie from cron)
  wynik → data/zbiornik/poll-latest.json  +  POST :3000/api/zbiornik/ingest (best-effort)

[Operator w kokpicie]
  ZbiornikOpsView → /api/zbiornik/* (Next) → DB (Drizzle: zb_*)
      publish → strażnik limitów → sidecar /exec → zbiornik-ops.mjs write op (--confirm-run)
```

## 2. Runner `zbiornik-ops.mjs`

Powłoka: nowa karta na CDP → `Runtime.evaluate` w kontekście strony → zamknięcie karty.
Wyjście: **jedna linia JSON**: `{"ok":bool,"op":str,"data":...,"message":str,"code":str}`.
Kody błędów: `CDP_OFFLINE`, `LOGIN_REQUIRED`, `NOT_CONFIGURED`, `OP_FAILED`, `CONFIRM_REQUIRED`.

### Ops tylko do odczytu (bezpieczne, bez `--confirm-run`)
| op | argumenty | opis |
|---|---|---|
| `me` | — | weryfikacja sesji: nick (`session.user.nick`), licznik nieprzeczytanych |
| `list-topics` | `[limit=20] [gData?]` | tematy grup forum przez `getGroupThreads(mode=forum, gData)` — tokeny `lData/title/slug/cntPosts` |
| `topic` | `<id-albo-url>` | *pending* — `getItemInfo` mapping (do dopięcia) |
| `inbox` | `[limit=20]` | przez `getThreads(mode=inbox)` — items: `portal_ref` = data token, `msdata`, `nick`, `unread`, preview |
| `notif` | `[limit=20]` | `getNotifications` — post/event/comment + userList |
| `top-list` | `[limit=100] [accType?]` | **lustro natywnej topki portalu** (`getRanking`, read-only; accType: 2=kobieta, 3=para; brak automatycznych akcji na profilach — patrz §6) |

### Ops wyjściowe (wycznie z potwierdzonej kolejki; wymagają `--confirm-run`)
| op | argumenty | implementacja |
|---|---|---|
| `post-topic` | `<gData> <tytuł> <treść>` | `createForumThread {topic, text, gData}` |
| `comment` | `<itemToken> <treść>` | `itemAddComment {data, text}` |
| `send-priv` | `<data> [msdata] <treść>` | **`sendMessage {data, msdata, text, client:"mobile", expired:0}`** — zbalansowane hosty (kewinek/aronek/karynka) rozwiązuje fasada portalu |

Wszystkie ops i write-**przez `window.appConnector.apiOk(..., {legacy:!0})`** — CSRF + rotacja hostów + retry po stronie portalu.
Kolejka HITL trzyma `msdata` rozmowy w `zb_queue.extra_json`, więc publikacja priv nie wymaga ponownego odpytania portalu.

Każdy write-op wspiera `--dry` (parsuje i waliduje, nie wysyła) — pełny pre-flight przed `--confirm-run`.

### Konfiguracja `config.json`
Runner jest **config-driven** (dyscovery → config): ścieżki, endpointy XHR/selectory, port CDP, markery logowania.
Brak configu → `NOT_CONFIGURED`. `discovery.mjs` generuje config na żywej sesji (patrz §5).

## 3. Guardian HITL (Next: `src/lib/zbiornik/*` + `/api/zbiornik/*`)
- Stan kolejki: `draft → approved → published | rejected | failed`
- Publikacja wymaga: status `approved` + limity z `zb_rules`:
  `max_per_day` (domyślnie 20), `min_gap_minutes` (10), `quiet_hours` ("23:00–07:00")
- Dedup: sha256(`kind|target_ref|normalized_body`) — odmowa duplikatu nieopublikowanej treści
- Każda próba → wpis `zb_activity_log` (op, target, ok, message)
- Wylogowanie sesji → sidecar zwraca `LOGIN_REQUIRED` → kokpit pauzuje wszystkie akcje wyjściowe

## 4. API Next (`/api/zbiornik/*`)
| route | metody | opis |
|---|---|---|
| `/status` | GET | sesja CDP + runner + ostatni poll + kolejka liczniki + `session.unread` (live liczniki z portalu) |
| `/queue` | GET, POST | lista/tworzenie szkicu (dedup) |
| `/queue/[id]` | PATCH, DELETE | approve/reject/edit |
| `/publish` | POST `{queueId}` | strażnik limitów → sidecar exec → update |
| `/topics` | GET | cache tematów |
| `/poll` | POST | poll now (sidecar) → ingest |
| `/ingest` | POST | push z sidecara (snapshot) |
| `/activity` | GET | dziennik |
| `/rules` | GET, PATCH | limity tempa |

## 5. Discovery (na zalogowanej sesji)
1. Uruchomić zarządzany Chrome z profilem `zbiornik-ops` i `--remote-debugging-port=9333` (skrypt `start-chrome.cmd`), zalogować się ręcznie na zbiornik.com.
2. `node discovery.mjs me` → potwierdzenie sesji.
3. `node discovery.mjs map` → przechodzi: forum (lista), przykładowy temat, skrzynka, powiadomienia — loguje XHR/fetch (URL+method+payload shape) i outline DOM (formularze, przyciski) → `discovery/endpoints.json` + `discovery/dom.json`.
4. Człowiek zweryfikować zapisy → `zbiornik-ops config apply` generuje `config.json`.

## 6. Zakres WYŁĄCZONY (na stałe) / doprecyzowany
Konta wielokrotne, masowa korespondencja (spam), automatyczne rozmowy udające człowieka, omijanie captcha/rate-limit, **eksport/ekstrakcja list profili użytkowników** oraz jakiekolwiek automatyczne kontaktowanie się z wieloma użytkownikami. Submit-time guard odrzuca takie żądania.

**Doprecyzowanie (2026-08-29):** natywne, publiczne widoki portalu (np. topka `getRanking`) mogą być **lustrzanym odczytem** dla operatora w kokpicie — bez filtrowania pod targeting-wyjściowy, bez eksportu, bez łączenia z automatyzacją kontaktu. Automatyzacja kontaktu pozostaje wyłącznie 1‑na‑1 z zatwierdzeniem HITL operatora.