# ADR-0009 · Baza: PostgreSQL + Drizzle; wektory: Qdrant

**Status:** ✅ przyjęta z odchyleniem od rozmowy

**Kontekst:** Rozmowa proponowała `pgvector` w PostgreSQL. Repo poszło inną drogą: **Qdrant** (URL w `.env.local`, klient w sidecar, `fastembed` do embeddingów, prober portu 6333).

**Decyzja:** Relacyjne dane w **PostgreSQL + Drizzle ORM** (migracje, nie runtime-DDL); wyszukiwanie semantyczne w **Qdrant + fastembed**. Hybrydowe wyszukiwanie (wektor + FTS) jak w rozmowie, ale implementowane po stronie sidecar.

**Konsekwencje:**
- Sekcja `knowledge_docs` z rozmowy przechodzi do Qdrant (payload = metadane dokumentu), a relacyjne metadane dokumentów pozostają w Postgres.
- Migracja `sql.js → PostgreSQL` ma istniejące narzędzie: `sidecar/migrate_sqlite_to_pg.py`.

---
