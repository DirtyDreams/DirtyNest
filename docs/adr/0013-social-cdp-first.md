# ADR-0013 · Integracje social: CDP-first, API tam, gdzie CDP zawodzi

**Status:** ✅ przyjęta (2026-08-29, rozstrzyga otwarte pytanie nr 3 z rejestru)

**Kontekst:** ADR-0006 ustanowił pięć platform (X, Instagram, Facebook, TikTok, Reddit). Weryfikacja F5 pokazała, że realny jest tylko adapter Reddit; X/IG/FB/TikTok to stuby `MockAdapter`. Ekosystem DirtyNest ma dojrzałą praktykę CDP (sidecar `cdp_service`, sesje Chrome Mina :9333, działające grippery zbiornik/Reddit).

**Decyzja:** Ścieżką domyślną dla wszystkich platform jest **automatyzacja przez CDP** (zalogowana sesja Chrome), a nie oficjalne API. Kontrakt adaptera z F5 zostaje: `publish/schedule/metrics/verify` — ścieżka (CDP/API) to konfiguracja adaptera, nie rewrite. Oficjalne API rozważamy tylko tam, gdzie CDP jest nieopłacalny (twarde blokady, captcha-walls, długotrwałe limity).

**Konsekwencje:**
- Brak zależności od kluczy/app-review X API i Meta Graph w MVP 2-userowym.
- Publikacje zawsze za bramką HITL (ADR-0008) niezależnie od ścieżki; tempo i dedup jak w kontrakcie zbiornik (docs/zbiornik-ops.md) jako wzorzec.
- Ryzyka ścieżki CDP (zmiany DOM, rate-limity portalu) są akceptowane; mitygacją są dry-run + limity + HITL, nie zmiana ścieżki.