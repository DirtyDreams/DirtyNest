# ADR-0006 · Priorytety integracji social media: X, Instagram, Facebook, TikTok + Reddit

**Status:** ✅ przyjęta (odpowiedź nr 4: „najwazniejsze sa ; X , Instagram , Facebook , tiktok"; korekta końcowa: „3. trzeba dodac jeszcze reddit")

**Decyzja:** MVP backendu social obsługuje pięć platform: **X (Twitter), Instagram, Facebook, TikTok, Reddit**. Discord / Telegram / LinkedIn zostają odroczone (frontend je wyświetla — mocki).

**Konsekwencje:**
- Reddit jest najbliższy realności: pipeline engagement/topics/dedup/verification już istnieje w `sidecar/automations/` (przeniesiony ze starych skryptów root) — staje się wzorcem dla adapterów pozostałych platform.
- Wspólny interfejs adaptera (publish / schedule / metrics) + polityka HITL przed publikacją (decyzja ADR-08).

---
