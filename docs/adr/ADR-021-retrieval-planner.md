# ADR-021: Retrieval Planner — Single-Pass Architecture

## Status
Accepted (2026-07-07)

## Context

The previous retrieval architecture used a recursive orchestration pattern.
One user question triggered:

1. An initial hybrid retrieval (keyword + vector + graph)
2. A source dossier classification assigning roles (ESTABLISHING_DOCUMENT,
   CORRESPONDENCE, FINANCIAL_RECORD, CHRONOLOGY)
3. For each "missing" mandatory role, a targeted retrieval query
4. Each targeted retrieval executed a full hybrid search

A single procurement question could trigger 3-5 retrieval executions,
each with separate network calls to PostgreSQL, Qdrant, and Neo4j.

Additionally:
- Domain classification used heuristic keywords with poor accuracy
  (procurement questions classified as GENERAL)
- Evidence diversity was poor (20 chunks from 1 document, 0 unique)
- The RuleEngine existed but wasn't wired as the decision authority
- Source roles (ESTABLISHING_DOCUMENT, CORRESPONDENCE) were designed
  for a different product domain (legal document analysis)

## Decision

Replace the recursive orchestration with a **Retrieval Planner** pattern:

```
Question → Intent → Domain → RetrievalPlan → Execute (once)
```

### Key Architectural Changes

1. **RetrievalPlanner**: Creates one plan per question. Decides domain,
   retrieval strategy, eligible collections, max results, and diversity
   constraints. Executed exactly once.

2. **Weighted DomainClassifier**: Replaces keyword heuristics with weighted
   term scoring. Every query receives exactly one primary domain.
   Optionally one secondary domain. Never returns GENERAL unless
   confidence is very low (<0.15 threshold).

3. **Diversity-aware Retrieval**: Max 2 chunks per document by default.
   After 2 chunks from the same document, ranking continues to other
   documents. Targets 3-5 unique regulations per query.

4. **RuleEngine as Decision Authority**: For procurement thresholds,
   travel expenses, and salary lookups, the Java RuleEngine makes the
   decision. The LLM only produces natural language explanation.

5. **Removed Source Roles**: ESTABLISHING_DOCUMENT, CORRESPONDENCE, etc.
   are no longer used for retrieval orchestration. They remain as
   metadata only. No targeted retrieval. No missing-role searches.

6. **Single LLM Call**: No evidence-coverage auto-retry. Coverage
   validation is a metric, not a gate.

### New Architecture Flow

```
User Question
    │
    ▼
Intent Classification  (<20ms)
    │
    ▼
Domain Classification  (<20ms)  — weighted, never GENERAL for known domains
    │
    ▼
Retrieval Plan          (<10ms)  — domain + strategy + eligible collections
    │
    ▼
Hybrid Retrieval        (<2s)    — single execution, diversity-aware
    │
    ▼
Evidence Package        (<50ms)  — grouped by document, deduplicated
    │
    ▼
RuleEngine              (<5ms)   — deterministic procurement/travel/salary
    │
    ▼
Compact Prompt          (<10ms)  — <4000 chars, 3-4 unique sources
    │
    ▼
LLM Inference           (model dependent) — explains only, never decides
    │
    ▼
Coverage Validation     (non-blocking metric)
    │
    ▼
Decision Package → UI
```

### Old Architecture (removed)

```
User Question
    │
    ▼
Initial Hybrid Retrieval
    │
    ▼
Source Dossier + Role Classification
    │
    ▼
For each missing role:
    ├── Targeted Retrieval 1 → PostgreSQL + Qdrant + Neo4j
    ├── Targeted Retrieval 2 → PostgreSQL + Qdrant + Neo4j
    ├── Targeted Retrieval 3 → PostgreSQL + Qdrant + Neo4j
    └── ...
    │
    ▼
Quota-enforced Merged Results
    │
    ▼
LLM → Coverage Check (fail) → Reorder → LLM again
```

## Consequences

### Positive

- **Latency**: Non-LLM pipeline stages target <2.5s total (was 5-10s+)
- **Determinism**: Procurement thresholds, travel rates, salary tables
  evaluated in Java, not by LLM
- **Diversity**: 3-5 unique regulations instead of 20 chunks from 1 doc
- **Simplicity**: 12 pipeline stages → 9 stages, all sequential
- **Correctness**: Weighted domain classification eliminates GENERAL
  misclassification for known administrative domains
- **Debugging**: Retrieval Diagnostics log domain, unique docs, duplicate
  ratio, and authorities after every request

### Negative

- Secondary domains are classified but not fully utilized in retrieval
  filtering (future enhancement)
- Edge cases with hybrid queries (e.g., "procurement of IT for HR dept")
  may benefit from dual-domain search

### Risks Mitigated

- Recursive retrieval latency spikes eliminated
- Cross-domain contamination (procurement→travel docs) prevented
- LLM hallucinated thresholds replaced with RuleEngine deterministic evaluation

## Related ADRs
- ADR-011: Retrieval Orchestration (superseded by this ADR)
- ADR-003: Provider Abstraction
- ADR-016: Graceful Degradation
