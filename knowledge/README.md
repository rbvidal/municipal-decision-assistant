# Municipal Decision Assistant — Knowledge Base

**Berlin Municipal Administration Demonstration Corpus**

This knowledge base contains the demonstration dataset for the Enterprise AI Platform, to be presented at Smart Country Convention (SCCON) in Berlin.

## Scope

Three administrative domains representing the daily work of Berlin municipal administration:

| Domain | Focus | Documents |
|--------|-------|-----------|
| **Public Procurement** (Vergabe) | Regulations, procedures, forms, manuals for public tendering | ~27 |
| **Building & Urban Planning** (Bauen & Stadtplanung) | Building code, permits, zoning, citizen information | ~30 |
| **HR & Internal Administration** (Personal & Innere Verwaltung) | Travel, vacation, home office, working time, IT security | ~35 |
| **Cross-Domain** | Administrative procedure law, data protection, eGovernment | 5 |

## Structure

```
knowledge/
├── procurement/     # Public procurement domain
├── building/        # Building & urban planning domain
├── hr/              # HR & internal administration domain
└── cross-domain/    # Cross-domain resources
```

## Sources

All documents are sourced from official authorities:

- **Land Berlin** — Senatsverwaltungen, Bezirksämter, gesetze.berlin.de
- **Bund** — Bundesministerien, gesetze-im-internet.de
- **EU** — EUR-Lex, EU directives
- **TdL** — Tarifgemeinschaft deutscher Länder

## Quality

- No AI-generated summaries of legal texts
- No unofficial blogs or third-party commentary
- Original paragraph and section numbering preserved
- Source URLs and publication dates included
- Quality over quantity — curated, not scraped

## Usage

This knowledge base is designed to be ingested by the Enterprise AI Platform's document pipeline:

1. Documents are stored as Markdown files
2. The platform-ai module indexes them for hybrid retrieval (keyword + vector + graph)
3. The AI answers queries with grounded citations from these documents
4. Every answer shows provenance — which document, which paragraph

## Demo

See `KNOWLEDGE_BASE_SPECIFICATION.md` for:
- Complete document catalog with metadata
- 20 SCCON demonstration scenarios
- Demo questions for every document
- Recommended indexing order

---

**Version:** 1.0.0 | **Created:** 2025-07-06 | **For:** SCCON Demonstration
