# ADR-0003 · Skala: dokładnie 2 użytkowników

**Status:** ✅ przyjęta (odpowiedź nr 1 w rozmowie: „dwie osoby"; potwierdzenie: „1. ok")

**Decyzja:** System dwuosobowy — prosty **JWT** (login + hasło, bcrypt), obaj użytkownicy z pełnymi uprawnieniami (admin). Bez RBAC, bez rejestracji publicznej, bez odzyskiwania hasła przez e-mail w MVP.

**Konsekwencje:**
- Tabela `users` + `POST /api/auth/login`, `GET /api/auth/me`; ochrona REST i WS middlewarem.
- Prostota ponad skalowalność: pool Postgres 10 połączeń jest OK; brak limitów per-user poza budżetem tokenów.

---
