# Knowledge Vault — kalibracja jakości (F7.3)

> Data: 2026-08-29 · Uruchomiono na żywym Qdrancie (`dirtynest-qdrant`, kolekcje ewaluacyjne tymczasowe).
> Harness: `scripts/knowledge_eval.py` (`sidecar/.venv/Scripts/python.exe scripts/knowledge_eval.py [--suite base|diacritics|both]`).
> Surowe wyniki: `scripts/knowledge-eval-results.json`.

## Metodologia

- 20 krótkich dokumentów PL + 20 sparafrazowanych pytań PL (gold-pairing 1:1).
- Dwa zbiory (suite): **base** (bez diakrytyków) i **diacritics** (pełne diakrytyki).
- Metryki: recall@5 (trafienie złotego dokumentu w top-5), MRR, średni score trafienia.
- Kandydaci: `BAAI/bge-small-en-v1.5` (obecny baseline, EN-only) vs `sentence-transformers/paraphrase-multilingual-MiniLM-L12-v2` (multilingual, 384-dim, wspierany przez zainstalowany fastembed). `intfloat/multilingual-e5-small` **niewspierany** przez fastembed w wersji z `requirements.txt` (`TextEmbedding` odrzuca; wspierany jest dopiero e5-large 1024-dim → wymagałby zmiany `VECTOR_DIM` + re-ingestu).

## Wyniki (2026-08-29)

| Model | suite | recall@5 | MRR | mean gold score |
|---|---|---|---|---|
| bge-small-en-v1.5 (baseline) | base | **1.0** | **1.0** | **0.833** |
| bge-small-en-v1.5 (baseline) | diacritics | **1.0** | **1.0** | **0.833** |
| paraphrase-multilingual-MiniLM-L12-v2 | base | 1.0 | 1.0 | 0.724 |
| paraphrase-multilingual-MiniLM-L12-v2 | diacritics | 1.0 | 1.0 | 0.726 |

## Decyzja

**Zostaje `BAAI/bge-small-en-v1.5`.** Oba modele mają perfekcyjny recall@5 na obu suitach, ale baseline daje wyraźnie większy margines oddzielenia (0.83 vs 0.72 mean gold score przy progu `score_threshold=0.5` — multilingual średnio 0.72 jest blisko progu i przy gęstszym vaultcie zrobiłby false-negatives na granicy). Zmiana modelu = re-ingest całego vaultu; baseline wygrywa bez żadnej migracji.

Warunek ponownej Kalibracji: jeśli vault urośnie o treści ciężkie w idiomatycznym PL z diakrytykami i recall spadnie poniżej 0.9 — przetestować `paraphrase-multilingual-MiniLM-L12-v2` na PRAWDZIWYM korpusie (harness gotowy, `--models` przyjmuje dowolny model fastembed).

## Zaimplementowane dokręcenia

1. **Prompty agentów** (`src/db/index.ts`, seed — obowiązuje świeże deploye/bazy CI): Research ma instruować `semantic_search`-first dla pytań faktograficznych z cytowaniami tytułów; Hermes (router) deleguje pytania o wewnętrzną wiedzę do Research z instruowaniem uzycia `semantic_search`. Wcześniej agent mógł być myślnie "podpięty" (whitelist), ale prompt nigdy nie sugerował użycia narzędzia.
2. Weryfikacja e2e jakości (odpowiedzi agenta z cytowaniami Vault) — pozostaje w zakresie F7.5 e2e (mock ACP) i realnych sesji.