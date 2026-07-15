# Verwaltung (Administration)

## Design Principle

Everything technical belongs here. Normal Sachbearbeiter never need to visit this section. The Verwaltung navigation item is only visible to users with the ADMIN role.

The Verwaltung landing page is a tool grid — clear, labeled cards that link to each administrative function. Cards link either to dedicated sub-pages (navigated via sub-tabs) or to inline panels within the Übersicht. No metrics, no dashboards, just navigation to tools.

Systemkonfiguration, Analytik, and Wissensgraph are accessed as cards from the Übersicht tool grid. They are not separate sub-navigation tabs. They open as inline panels or modals within the Übersicht page.

## Main Screen: Verwaltung Overview

```
┌──────────────────────────────────────────────────────────────────────────────┐
│  Verwaltung                                                                   │
│                                                                              │
│  [ Übersicht ]  Korpus-Status  Audit  Aufträge  Benchmarks  Entwickler        │
│                                                                              │
│  ┌─────────────────────────────────────┐ ┌──────────────────────────────────┐│
│  │                                     │ │                                  ││
│  │  📊  Korpus-Status                  │ │  📋  Audit-Protokoll             ││
│  │                                     │ │                                  ││
│  │  Dokumente, Chunks, Embeddings      │ │  Sicherheitsrelevante Ereignisse ││
│  │  und Qdrant-Vektoren überwachen.    │ │  einsehen und durchsuchen.       ││
│  │                                     │ │                                  ││
│  │  23 Dokumente  |  1 Warnung         │ │  1.247 Einträge                  ││
│  │                                     │ │                                  ││
│  │            [ Öffnen ]               │ │            [ Öffnen ]            ││
│  └─────────────────────────────────────┘ └──────────────────────────────────┘│
│                                                                              │
│  ┌─────────────────────────────────────┐ ┌──────────────────────────────────┐│
│  │                                     │ │                                  ││
│  │  ⚙️  Verarbeitungsaufträge          │ │  ⏱  Benchmarks                   ││
│  │                                     │ │                                  ││
│  │  Laufende und abgeschlossene        │ │  Retrieval-Qualität messen       ││
│  │  Indizierungsaufträge.              │ │  und vergleichen.                ││
│  │                                     │ │                                  ││
│  │  2 aktiv  |  156 abgeschlossen      │ │  Zuletzt: 14.07.2026             ││
│  │                                     │ │                                  ││
│  │            [ Öffnen ]               │ │            [ Öffnen ]            ││
│  └─────────────────────────────────────┘ └──────────────────────────────────┘│
│                                                                              │
│  ┌─────────────────────────────────────┐ ┌──────────────────────────────────┐│
│  │                                     │ │                                  ││
│  │  🔗  Wissensgraph                   │ │  🛠  Entwickler                  ││
│  │                                     │ │                                  ││
│  │  Neo4j-Graph der rechtlichen        │ │  Performance-Dashboard und       ││
│  │  Beziehungen erkunden.              │ │  Knowledge-Debugging.            ││
│  │                                     │ │                                  ││
│  │            [ Öffnen ]               │ │            [ Öffnen ]            ││
│  └─────────────────────────────────────┘ └──────────────────────────────────┘│
│                                                                              │
│  ┌─────────────────────────────────────┐ ┌──────────────────────────────────┐│
│  │                                     │ │                                  ││
│  │  📈  Analytik                        │ │  🔧  Systemkonfiguration         ││
│  │                                     │ │                                  ││
│  │  Systemmetriken und Nutzungs-       │ │  KI-Provider, API-Einstellungen, ││
│  │  statistiken einsehen.              │ │  Modellauswahl.                  ││
│  │                                     │ │                                  ││
│  │            [ Öffnen ]               │ │            [ Öffnen ]            ││
│  └─────────────────────────────────────┘ └──────────────────────────────────┘│
└──────────────────────────────────────────────────────────────────────────────┘
```

---

## Screen: Korpus-Status (Corpus Health)

```
┌──────────────────────────────────────────────────────────────────────────────┐
│  Verwaltung > Korpus-Status                                                   │
│                                                                              │
│  Status: ⚠️ 1 Warnung                                                        │
│                                                                              │
│  ┌────────────┬────────────┬────────────┬────────────┬────────────┐          │
│  │            │            │            │            │            │          │
│  │  23        │  157       │  145       │  145       │  92,4%     │          │
│  │  Dokumente │  Chunks    │  Mit Emb.  │  In Qdrant │  Embedding │          │
│  │            │            │            │            │  Abdeckung │          │
│  └────────────┴────────────┴────────────┴────────────┴────────────┘          │
│                                                                              │
│  ┌────────────┬────────────┬────────────┬────────────┬────────────┐          │
│  │  12        │  6,8       │  0,82      │  768       │  23/0/0    │          │
│  │  Ohne Emb. │  Ø Chunks  │  Ø Score   │  Dimension │  Grün/Gelb │          │
│  └────────────┴────────────┴────────────┴────────────┴────────────┘          │
│                                                                              │
│  ───────────────────────────────────────────────────────────────────────────  │
│                                                                              │
│  Warnungen (1)                                                                │
│  ┌──────────────────────────────────────────────────────────────────────────┐│
│  │ ⚠️ LRKG NRW — 12 Chunks ohne Embeddings. Letzte Indizierung fehlgeschlagen││
│  │    am 10.06.2024. Mögliche Ursache: Embedding-Provider nicht erreichbar.  ││
│  │    [ Neu indizieren ]  [ Ausblenden ]                                     ││
│  └──────────────────────────────────────────────────────────────────────────┘│
│                                                                              │
│  ───────────────────────────────────────────────────────────────────────────  │
│                                                                              │
│  Dokumenten-Status (23 Dokumente)                              [ Alle Filter ]│
│                                                                              │
│  ┌──────────────────────────┬──────────┬────────┬──────┬────────┬──────────┐ │
│  │ Dokument                 │ Chunks   │ Mit Em.│ Qdr. │ Status │ Aktion   │ │
│  ├──────────────────────────┼──────────┼────────┼──────┼────────┼──────────┤ │
│  │ BauO NRW 2024            │ 127      │ 127    │ 127  │ 🟢     │ Details  │ │
│  │ AV zu §55 LHO            │ 42       │ 42     │ 42   │ 🟢     │ Details  │ │
│  │ TVöD Entgelttabelle 2025 │ 12       │ 12     │ 12   │ 🟢     │ Details  │ │
│  │ VOB/A 2024               │ 35       │ 35     │ 35   │ 🟢     │ Details  │ │
│  │ LRKG NRW                 │ 12       │ 0      │ 0    │ 🔴     │ Details  │ │
│  └──────────────────────────┴──────────┴────────┴──────┴────────┴──────────┘ │
│                                                                              │
│  ───────────────────────────────────────────────────────────────────────────  │
│                                                                              │
│  Aktionen                                                                     │
│  ┌──────────────────────────────────────────────────────────────────────────┐│
│  │ [ Korpus-Inventar generieren ]  [ Release-Report generieren ]             ││
│  │ [ Alle neu indizieren ]         [ Qdrant neu aufbauen ]                   ││
│  └──────────────────────────────────────────────────────────────────────────┘│
└──────────────────────────────────────────────────────────────────────────────┘
```

---

## Screen: Audit-Protokoll

```
┌──────────────────────────────────────────────────────────────────────────────┐
│  Verwaltung > Audit                                                           │
│                                                                              │
│  ┌──────────────────────────────────────────────────────────────────────────┐│
│  │ Filter:                                                                  ││
│  │ Ereignis: [ Alle ▾ ]  Akteur: [_________]  Korrelation: [_________]      ││
│  │ Von: [ 01.07.2026 ]  Bis: [ 15.07.2026 ]                                 ││
│  │                                                                          ││
│  │ 1.247 Einträge                                                [ Filter... ]││
│  └──────────────────────────────────────────────────────────────────────────┘│
│                                                                              │
│  ┌──────────────────┬──────────┬──────────────────────┬────────────────────┐ │
│  │ Zeit             │ Typ      │ Akteur               │ Details            │ │
│  ├──────────────────┼──────────┼──────────────────────┼────────────────────┤ │
│  │15.07. 10:23:15   │ DOC_OPEN │ mueller@stadt-essen  │ doc=BauO NRW 2024  │ │
│  │15.07. 10:20:02   │ CASE_EDIT│ mueller@stadt-essen  │ case=BAU-2026-0147         │ │
│  │15.07. 09:15:44   │ DOC_UPLD │ schmidt@stadt-essen  │ doc=VOB/A 2024     │ │
│  │15.07. 09:15:30   │ INGEST   │ system               │ doc=VOB/A 2024     │ │
│  │15.07. 09:15:12   │ EMBED    │ system               │ chunks=127         │ │
│  │15.07. 08:30:01   │ LOGIN    │ mueller@stadt-essen  │ ip=192.168.1.47    │ │
│  └──────────────────┴──────────┴──────────────────────┴────────────────────┘ │
│                                                                              │
│  Seite 1 von 125            [ ←  Zurück ]  [ 1 ] [ 2 ] [ 3 ] ... [ Weiter → ]│
└──────────────────────────────────────────────────────────────────────────────┘
```

---

## Screen: Benchmarks

```
┌──────────────────────────────────────────────────────────────────────────────┐
│  Verwaltung > Benchmarks                                                      │
│                                                                              │
│  ┌──────────────────────────────────────────────────────────────────────────┐│
│  │ Retrieval-Qualität                                                        ││
│  │ ───────────────────────────────────────────────────────────────────────  ││
│  │                                                                          ││
│  │ Letzter Lauf: 14.07.2026 16:00                                           ││
│  │                                                                          ││
│  │  ┌────────────────┬──────┬──────┬──────┐                                 ││
│  │  │ Metrik         │ Wert │ Ziel │ Status│                                ││
│  │  ├────────────────┼──────┼──────┼──────┤                                 ││
│  │  │ Precision@5    │ 0.87 │ 0.80 │  ✓   │                                 ││
│  │  │ Recall@5       │ 0.82 │ 0.75 │  ✓   │                                 ││
│  │  │ MRR            │ 0.91 │ 0.85 │  ✓   │                                 ││
│  │  │ NDCG@10        │ 0.84 │ 0.80 │  ✓   │                                 ││
│  │  └────────────────┴──────┴──────┴──────┘                                 ││
│  │                                                                          ││
│  │ [ Benchmark ausführen ]  [ Verlauf anzeigen ]                             ││
│  └──────────────────────────────────────────────────────────────────────────┘│
│                                                                              │
│  ┌──────────────────────────────────────────────────────────────────────────┐│
│  │ Kein Benchmark-Verlauf vorhanden. Führen Sie den ersten Benchmark aus.    ││
│  └──────────────────────────────────────────────────────────────────────────┘│
└──────────────────────────────────────────────────────────────────────────────┘
```

---

## Screen: Verarbeitungsaufträge (Jobs)

```
┌──────────────────────────────────────────────────────────────────────────────┐
│  Verwaltung > Aufträge                                                        │
│                                                                              │
│  Filter: Status [ Alle ▾ ]  Dokument [_________]                             │
│                                                                              │
│  ┌──────┬─────────────────────────┬──────────┬────────────┬────────────────┐ │
│  │  #   │ Dokument                │ Status   │ Angefordert│ Datum          │ │
│  ├──────┼─────────────────────────┼──────────┼────────────┼────────────────┤ │
│  │ 0156 │ LRKG NRW                │ ❌ Fehler│ Schmidt    │ 10.06. 14:00   │ │
│  │ 0155 │ GemHVO 2024             │ ✓ Fertig │ Schmidt    │ 10.06. 13:30   │ │
│  │ 0154 │ VOB/A 2024              │ ✓ Fertig │ Schmidt    │ 09.06. 09:15   │ │
│  │ 0153 │ BauO NRW 2024           │ ✓ Fertig │ System     │ 08.06. 08:00   │ │
│  └──────┴─────────────────────────┴──────────┴────────────┴────────────────┘ │
│                                                                              │
│  Seite 1 von 4              [ ←  Zurück ]  [ 1 ] [ 2 ] [ 3 ] [ 4 ] [ Weiter → ]│
└──────────────────────────────────────────────────────────────────────────────┘
```
