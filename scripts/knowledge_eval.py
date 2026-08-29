#!/usr/bin/env python
"""F7.3 Vault quality calibration — evaluation harness.

Two Polish suites:
  base       diacritics-light corpus + questions
  diacritics same 20 topics with full Polish diacritics

Ingests into THROWAWAY Qdrant collections, scores top-5 retrieval
(Hit@5, MRR, mean gold-hit score). No real vault touched.

Usage:
  sidecar/.venv/Scripts/python.exe scripts/knowledge_eval.py [--suite base|diacritics|both] [--models ...]

Results: scripts/knowledge-eval-results.json + stdout.
"""
import argparse
import json
import time
from pathlib import Path

DOCS = [
    ("d01", "Replikacja bazy PostgreSQL", "PostgreSQL replikuje dane strumieniowo przez WAL. Replika goraca pozwala na odczyty, a opoznienie replikacji mierzy sie w bajtach lagu. Sloty replikacji chronia przed utrata segmentow WAL."),
    ("d02", "Kompresja obrazow WebP", "Format WebP oferuje kompresje stratna i bezstratna, zmniejszajac rozmiar zdjec o 25-35 procent wzgledem JPEG przy tej samej jakosci percepcyjnej. Obsluguje tez przezroczystosc kanalu alfa."),
    ("d03", "Anatomia stawu kolanowego", "Staw kolanowy laczy kosc udowa z piszczelem i zawiera lakkotki przysrodkowa oraz boczna, ktore amortyzuja nacisk. Wiezadlo krzyzowe przednie zapobiega przesuwaniu sie kosci udowej do tylu."),
    ("d04", "Pielegnacja storczykow phalaenopsis", "Storczyki phalaenopsis lubia rozproszone swiatlo i podlewanie raz na tydzien przez zanurzenie korzeni. Przesadza sie je co dwa lata w podloze z kory, nigdy w zwykla ziemie."),
    ("d05", "Zasady gry w brydza", "W brydzie czterech graczy w dwoch parach licytuje kontrakty w treflach, kierach, karach i pikach. Atut wybiera najwyzsza licytacja, a lewy rozgrywa nalicznik widoku."),
    ("d06", "Fermentacja kiszonej kapusty", "Kiszona kapusta powstaje przez fermentacje mlekowa w roztworze soli, gdzie bakterie Lactobacillus przemieniaja cukry w kwas mlekowy. Proces trwa okolo trzech tygodni w temperaturze pokojowej."),
    ("d07", "Protokol MQTT w IoT", "MQTT to lekki protokol publikuj-subskrybuj dzialajacy na TCP, z brokerem posredniczacym w tematach. Jakosc uslugi QoS 1 gwarantuje dostarczenie przynajmniej raz, a QoS 2 dokladnie raz."),
    ("d08", "Mury obronne Gdanska", "Gdanskie Stare Miasto otaczano murem obronnym od czternastego wieku, z basztami Labedz i Jacek. Odcinek z Podwojna Brama przetrwal do dzis jako trasa turystyczna Starego Miasta."),
    ("d09", "Hodowla krewetek neocaridina", "Krewetki Neocaridina davidi toleruja szeroki zakres twardosci wody i rozmnazaja sie bez wody slonawej. Samica nosi jaja pod odwlokiem okolo trzydziestu dni, mlode wylegaja sie w pelni uformowane."),
    ("d10", "Inhibitory ACE sposob dzialania", "Inhibitory konwertazy angiotensyny blokuja przemiane angiotensyny I w angiotensyne II, obnizajac cisnienie tetnicze. Typowym dzialaniem niepozadanym jest suchy kaszel spowodowany kumulacja bradykininy."),
    ("d11", "Botnet Mirai dzialanie", "Botnet Mirai infekowal urzadzenia IoT przez domyslne hasla administratora i przeprowadzal potzne ataki DDoS. Kod zrodlowy wyciekl w 2016 roku, dajac poczatek dziesiatkom wariantow."),
    ("d12", "Technika temperowania czekolady", "Temperowanie czekolady polega na wytapianiu do 45 stopni, studzeniu do 27 i ponownym podgrzaniu do 31 stopni, co stabilizuje krysztaly kakaowego masla w formie V."),
    ("d13", "Sortowanie przez scalanie", "Sortowanie przez scalanie dzieli tablice na polowki, sortuje je rekurencyjnie i scala w czasie O n log n. Jest sortowaniem stabilnym, ale wymaga dodatkowej pamieci proporcjonalnej do rozmiaru danych."),
    ("d14", "Menzura gitary klasycznej", "Menzura gitary klasycznej wynosi 650 milimetrow i wplywa na napiecie strun oraz barwe. Krotsza menzura ulatwia dociskanie strun, dluzsza daje glosniejszy dzwiek."),
    ("d15", "Cykl Kalvina w fotosyntezie", "Cykl Kalvina wiaze dwutlenek wegla za pomoca enzymu RuBisCO, produkujac trojweglowy kwas 3-fosfoglicerynowy. Zuzuwa ATP i NADPH z fazy jasnej, a glukoza powstaje po szesciu obrotach cyklu."),
    ("d16", "Magistrala CAN w samochodach", "Magistrala CAN komunikuje moduly elektroniczne pojazdu roznnicowo na parach skreconych, z priorytetami nadawania zaleznymi od identyfikatora ramki. Maksymalna predkosc klasycznej magistrali to 1 Mbit na sekunde."),
    ("d17", "Pielegnacja deski snowboardowej", "Deske snowboardowa woskuje sie co piec wyjazdow, topiac wosk zelazkiem o temperaturze 130 stopni i sciagajac nadmiar po wystygnieciu. Krawedzie ostrzy sie co dziesiec dni jazdy."),
    ("d18", "GIL i watki w Pythonie", "Global Interpreter Lock w Pythonie pozwala tylko jednemu watkowi wykonywac kod bajtowy naraz, wiec wielowatkowosc nie przyspiesza zadan CPU-bound. Do rownoleglosci procesow sluzby modul multiprocessing."),
    ("d19", "Warzenie piwa stylu lager", "Lager fermentuje w temperaturze 8-13 stopni drozdami dolnej fermentacji, a nastepnie lezakuje w chlodzie przez cztery do osmiu tygodni, co daje czysty, lagodny profil smakowy."),
    ("d20", "Perspektywa zbiezna w rysunku", "W perspektywie zbieznej linie rownolegle spotykaja sie w punkcie zbiegu na linii horyzontu, a obiekty blizej obserwatora rysuje sie wieksze. Perspektywa dwupunktowa stosuje dwa punkty zbiegu dla skreconych scian."),
]

QUESTIONS = [
    ("d01", "Jak PostgreSQL chroni dane przy strumieniowej replikacji i czym jest opoznienie repliki?"),
    ("d02", "Czy format WebP realnie zmniejsza wage plikow zdjec w porownaniu z JPEG?"),
    ("d03", "Co dokladnie amortyzuje nacisk w kolanie i ktore wiezadlo pilnuje stabilnosci?"),
    ("d04", "Jak czesto podlewać orchidee i w jakim podlozu ja trzymac?"),
    ("d05", "Ilu graczy i w jakich parach gra sie w brydza oraz co wyznacza atut?"),
    ("d06", "Dlaczego kapusta kiszona jest kwasna i jak dlugo trwa fermentacja?"),
    ("d07", "Czym roznia sie QoS 1 od QoS 2 w protokole MQTT dla urzadzen IoT?"),
    ("d08", "Z jakiego wieku pochodza mury obronne Gdanska i jakie baszty przetrwaly?"),
    ("d09", "Jak rozmnazaja sie krewetki Neocaridina w slodkowodnym akwarium?"),
    ("d10", "Dlaczego leki z grupy inhibitorow ACE powoduja suchy kaszel?"),
    ("d11", "W jaki sposob botnet Mirai przejmowal urzadzenia i co robil po infekcji?"),
    ("d12", "W jakich temperaturach przeprowadza sie temperowanie czekolady?"),
    ("d13", "Jaka jest zlozonosc sortowania przez scalanie i ile pamieci potrzebuje?"),
    ("d14", "Jaka jest dlugosc menzury gitary klasycznej i jak wplywa na grywalnosc?"),
    ("d15", "Jaka role odgrywa RuBisCO w cyklu Kalvina podczas fotosyntezy?"),
    ("d16", "Jak przesylane sa dane miedzy modulami elektronicznymi samochodu po magistrali CAN?"),
    ("d17", "Jak czesto woskowac deske snowboardowa i w jakiej temperaturze?"),
    ("d18", "Czym jest GIL w Pythonie i dlaczego watki nie przyspieszaja kodu CPU-bound?"),
    ("d19", "W jakiej temperaturze fermentuje lager i ile trwa lezakowanie?"),
    ("d20", "Jak w rysunku wykorzystac punkty zbiegu i linie horyzontu w perspektywie?"),
]

DOCS_PL = [
    ("d01", "Replikacja bazy PostgreSQL", "PostgreSQL replikuje dane strumieniowo przez WAL. Replika gorąca pozwala na odczyty, a opóźnienie replikacji mierzy się w bajtach lagu. Sloty replikacji chronią przed utratą segmentów WAL."),
    ("d02", "Kompresja obrazów WebP", "Format WebP oferuje kompresję stratną i bezstratną, zmniejszając rozmiar zdjęć o 25–35 procent względem JPEG przy tej samej jakości percepcyjnej. Obsługuje też przezroczystość kanału alfa."),
    ("d03", "Anatomia stawu kolanowego", "Staw kolanowy łączy kość udową z piszczelem i zawiera łąkotki przyśrodkową oraz boczną, które amortyzują nacisk. Więzadło krzyżowe przednie zapobiega przesuwaniu się kości udowej do tyłu."),
    ("d04", "Pielęgnacja storczyków phalaenopsis", "Storczyki phalaenopsis lubią rozproszone światło i podlewanie raz na tydzień przez zanurzenie korzeni. Przesadza się je co dwa lata w podłoże z kory, nigdy w zwykłą ziemię."),
    ("d05", "Zasady gry w brydża", "W brydżu czterech graczy w dwóch parach licytuje kontrakty w treflach, kierach, karach i pikach. Atut wybiera najwyższa licytacja, a lewy rozgrywa się na widoku."),
    ("d06", "Fermentacja kiszonej kapusty", "Kiszona kapusta powstaje przez fermentację mlekową w roztworze soli, gdzie bakterie Lactobacillus przetwarzają cukry w kwas mlekowy. Proces trwa około trzech tygodni w temperaturze pokojowej."),
    ("d07", "Protokół MQTT w IoT", "MQTT to lekki protokół publikuj–subskrybuj działający na TCP, z brokerem pośredniczącym w tematach. Jakość usługi QoS 1 gwarantuje dostarczenie przynajmniej raz, a QoS 2 dokładnie raz."),
    ("d08", "Mury obronne Gdańska", "Gdańskie Stare Miasto otaczano murem obronnym od XIV wieku, z basztami Łabędź i Jacek. Odcinek z Podwójną Bramą przetrwał do dziś jako trasa turystyczna Starego Miasta."),
    ("d09", "Hodowla krewetek neocaridina", "Krewetki Neocaridina davidi tolerują szeroki zakres twardości wody i rozmnażają się bez wody słonawej. Samica nosi jaja pod odwłokiem około trzydziestu dni, młode wylęgają się w pełni uformowane."),
    ("d10", "Inhibitory ACE sposób działania", "Inhibitory konwertazy angiotensyny blokują przemianę angiotensyny I w angiotensynę II, obniżając ciśnienie tętnicze. Typowym działaniem niepożądanym jest suchy kaszel spowodowany kumulacją bradykininy."),
    ("d11", "Botnet Mirai działanie", "Botnet Mirai infekował urządzenia IoT przez domyślne hasła administratora i przeprowadzał potężne ataki DDoS. Kod źródłowy wyciekł w 2016 roku, dając początek dziesiątkom wariantów."),
    ("d12", "Technika temperowania czekolady", "Temperowanie czekolady polega na wytapianiu do 45 stopni, studzeniu do 27 i ponownym podgrzaniu do 31 stopni, co stabilizuje kryształy kakaowego masła w formie V."),
    ("d13", "Sortowanie przez scalanie", "Sortowanie przez scalanie dzieli tablicę na połówki, sortuje je rekurencyjnie i scala w czasie O n log n. Jest sortowaniem stabilnym, ale wymaga dodatkowej pamięci proporcjonalnej do rozmiaru danych."),
    ("d14", "Menżura gitary klasycznej", "Menżura gitary klasycznej wynosi 650 milimetrów i wpływa na napięcie strun oraz barwę. Krótsza menżura ułatwia dociskanie strun, dłuższa daje głośniejszy dźwięk."),
    ("d15", "Cykl Kalvina w fotosyntezie", "Cykl Kalvina wiąże dwutlenek węgla za pomocą enzymu RuBisCO, produkując trójwęglowy kwas 3-fosfoglicerynowy. Zużywa ATP i NADPH z fazy jasnej, a glukoza powstaje po sześciu obrotach cyklu."),
    ("d16", "Magistrala CAN w samochodach", "Magistrala CAN komunikuje moduły elektroniczne pojazdu różnicowo na parach skręconych, z priorytetami nadawania zależnymi od identyfikatora ramki. Maksymalna prędkość klasycznej magistrali to 1 Mbit na sekundę."),
    ("d17", "Pielęgnacja deski snowboardowej", "Deskę snowboardową woskuje się co pięć wyjazdów, topiąc wosk żelazkiem o temperaturze 130 stopni i ściągając nadmiar po wystygnięciu. Krawędzie ostrzy się co dziesięć dni jazdy."),
    ("d18", "GIL i wątki w Pythonie", "Global Interpreter Lock w Pythonie pozwala tylko jednemu wątkowi wykonywać kod bajtowy naraz, więc wielowątkowość nie przyspiesza zadań CPU-bound. Do równoległości procesów służy moduł multiprocessing."),
    ("d19", "Warzenie piwa stylu lager", "Lager fermentuje w temperaturze 8–13 stopni drożdżami dolnej fermentacji, a następnie leżakuje w chłodzie przez cztery do ośmiu tygodni, co daje czysty, łagodny profil smakowy."),
    ("d20", "Perspektywa zbieżna w rysunku", "W perspektywie zbieżnej linie równoległe spotykają się w punkcie zbiegu na linii horyzontu, a obiekty bliżej obserwatora rysuje się większe. Perspektywa dwupunktowa stosuje dwa punkty zbiegu dla skręconych ścian."),
]

QUESTIONS_PL = [
    ("d01", "Jak PostgreSQL chroni dane przy strumieniowej replikacji i czym jest opóźnienie repliki?"),
    ("d02", "Czy format WebP realnie zmniejsza wagę plików zdjęć w porównaniu z JPEG?"),
    ("d03", "Co dokładnie amortyzuje nacisk w kolanie i które więzadło pilnuje stabilności?"),
    ("d04", "Jak często podlewać orchideę i w jakim podłożu ją trzymać?"),
    ("d05", "Iloma graczami i w jakich parach gra się w brydża oraz co wyznacza atut?"),
    ("d06", "Dlaczego kapusta kiszona jest kwaśna i jak długo trwa fermentacja?"),
    ("d07", "Czym różni się QoS 1 od QoS 2 w protokole MQTT dla urządzeń IoT?"),
    ("d08", "Z jakiego wieku pochodzą mury obronne Gdańska i jakie baszty przetrwały?"),
    ("d09", "Jak rozmnażają się krewetki Neocaridina w słodkowodnym akwarium?"),
    ("d10", "Dlaczego leki z grupy inhibitorów ACE powodują suchy kaszel?"),
    ("d11", "W jaki sposób botnet Mirai przejmował urządzenia i co robił po infekcji?"),
    ("d12", "W jakich temperaturach przeprowadza się temperowanie czekolady?"),
    ("d13", "Jaka jest złożoność sortowania przez scalanie i ile pamięci potrzebuje?"),
    ("d14", "Jaka jest długość menżury gitary klasycznej i jak wpływa na grywalność?"),
    ("d15", "Jaką rolę odgrywa RuBisCO w cyklu Kalvina podczas fotosyntezy?"),
    ("d16", "Jak przesyłane są dane między modułami elektronicznymi samochodu po magistrali CAN?"),
    ("d17", "Jak często woskować deskę snowboardową i w jakiej temperaturze?"),
    ("d18", "Czym jest GIL w Pythonie i dlaczego wątki nie przyspieszają kodu CPU-bound?"),
    ("d19", "W jakiej temperaturze fermentuje lager i ile trwa leżakowanie?"),
    ("d20", "Jak w rysunku wykorzystać punkty zbiegu i linię horyzontu w perspektywie?"),
]


MODELS = {
    "BAAI/bge-small-en-v1.5": {"prefix": False},          # current baseline (English-only)
    "sentence-transformers/paraphrase-multilingual-MiniLM-L12-v2": {"prefix": False},  # multilingual candidate
}

SUITES = {"base": (DOCS, QUESTIONS), "diacritics": (DOCS_PL, QUESTIONS_PL)}


def main() -> None:
    ap = argparse.ArgumentParser()
    ap.add_argument("--models", nargs="*", default=None, help="fastembed model names (default: the two calibrated)")
    ap.add_argument("--suite", default="both", choices=["base", "diacritics", "both"])
    ap.add_argument("--collection-prefix", default="vault_eval")
    ap.add_argument("--keep", action="store_true", help="keep eval collections in Qdrant")
    args = ap.parse_args()

    import sys
    sys.path.insert(0, str(Path(__file__).resolve().parent.parent / "sidecar"))

    import knowledge_service as ks
    from qdrant_client.http import models as qm
    from fastembed import TextEmbedding

    names = args.models or list(MODELS.keys())
    suite_names = list(SUITES.keys()) if args.suite == "both" else [args.suite]
    results = {"when_epoch_s": int(time.time()), "questions_per_suite": 20, "models": {}}

    for model_name in names:
        results["models"][model_name] = {}
        use_prefix = "e5" in model_name.lower()
        qpx = "query: " if use_prefix else ""
        pfx = "passage: " if use_prefix else ""
        for suite_name in suite_names:
            docs, questions = SUITES[suite_name]
            tag = "".join(ch if ch.isalnum() else "_" for ch in model_name)[-48:]
            coll = f"{args.collection_prefix}_{suite_name}_{tag}"[:70]
            print(f"\n=== MODEL {model_name} / suite {suite_name} (collection {coll}) ===")
            entry: dict = {}
            t0 = time.time()
            try:
                client = ks.QdrantClient(url="http://localhost:6333", timeout=30)
                model = TextEmbedding(model_name=model_name)
                probe = list(model.embed(["probe"]))[0]
                dim = len(probe)
                entry["dim"] = dim
                entry["load_s"] = round(time.time() - t0, 1)
                print(f"loaded in {entry['load_s']}s, dim={dim}")
                if dim != 384:
                    entry["skipped"] = f"dim {dim} != 384: would need VECTOR_DIM change + re-ingest"
                    results["models"][model_name][suite_name] = entry
                    continue

                try:
                    client.delete_collection(collection_name=coll)
                except Exception:
                    pass
                client.create_collection(
                    collection_name=coll,
                    vectors_config=qm.VectorParams(size=dim, distance=qm.Distance.COSINE),
                )

                svc = ks.KnowledgeService(qdrant_url="http://localhost:6333")
                svc.client = client
                svc.embedding_model = model
                svc.is_ready = True
                ks.COLLECTION_NAME = coll

                t1 = time.time()
                for doc_id, title, text in docs:
                    svc.ingest_document(doc_id=doc_id, title=title, content=text, category="eval", tags=["eval"])
                entry["ingest_s"] = round(time.time() - t1, 1)

                hit5 = 0
                rr_sum = 0.0
                gold_scores = []
                misses = []
                for gold_id, q in questions:
                    res = svc.search(qpx + q, limit=5, score_threshold=0.0)
                    ids = [r["doc_id"] for r in res]
                    rank = ids.index(gold_id) + 1 if gold_id in ids else 0
                    hit5 += 1 if rank else 0
                    rr_sum += (1.0 / rank) if rank else 0.0
                    gold_scores.append(res[rank - 1]["score"] if rank else 0.0)
                    if not rank:
                        misses.append(gold_id)

                n = len(questions)
                entry.update({
                    "recall_at_5": round(hit5 / n, 3),
                    "mrr": round(rr_sum / n, 3),
                    "mean_gold_score": round(sum(gold_scores) / n, 4),
                    "misses": misses,
                })
                print(json.dumps(entry, indent=2, ensure_ascii=False))
                results["models"][model_name][suite_name] = entry

                if not args.keep:
                    try:
                        client.delete_collection(collection_name=coll)
                    except Exception:
                        pass
            except Exception as e:
                print(f"FAILED {model_name}/{suite_name}: {type(e).__name__}: {e}")
                entry["error"] = f"{type(e).__name__}: {e}"
                results["models"][model_name][suite_name] = entry

    out = Path(__file__).parent / "knowledge-eval-results.json"
    out.write_text(json.dumps(results, indent=2, ensure_ascii=False), encoding="utf-8")
    print(f"\nsaved -> {out}")


if __name__ == "__main__":
    main()
