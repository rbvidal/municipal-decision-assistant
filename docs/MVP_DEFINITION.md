# MVP Definition — Version 0.1

**Principle:** The Minimum Lovable Product is the smallest system that delivers genuine value to a municipal Sachbearbeiter. It must complete one full workflow: document → index → search → decide.

**Date:** 2026-07-17
**Target delivery:** Week 7 of solo implementation

---

## The One Workflow That Must Work

```
Sachbearbeiter uploads a regulation
→ System extracts text, chunks, embeds, indexes
→ Sachbearbeiter searches for a topic
→ System returns relevant regulations with citations
→ Sachbearbeiter asks a decision question
→ System answers deterministically (when rules apply) or with evidence-grounded reasoning
→ Sachbearbeiter can cite the source
```

If this workflow does not work end-to-end, the MVP is not done.

---

## Must Have (MVP v0.1)

These features must work before the software is shown to anyone.

### Document Ingestion
- [ ] Upload a document (PDF, DOCX, TXT) via web form
- [ ] System extracts text automatically (PDFBox → Tika fallback for PDF; POI → Tika for DOCX)
- [ ] System chunks text with configurable size/overlap
- [ ] System generates embeddings via Ollama (nomic-embed-text)
- [ ] System indexes chunks in Qdrant
- [ ] User sees document in document list with status (UPLOADED → INDEXED)
- [ ] Ingestion failure produces partial results with error metadata, not a 500

### Search
- [ ] User types a search query
- [ ] System returns results from keyword search (PostgreSQL full-text) AND vector search (Qdrant)
- [ ] Results are fused and deduplicated
- [ ] Each result shows: document title, matching text excerpt, relevance score, citation
- [ ] Results can be filtered by document type and legal domain
- [ ] Empty search returns empty state (not error)

### Decision Engine
- [ ] User asks a salary question ("EG 10 Stufe 3 TV-L Gehalt") → RuleEngine returns exact monthly amount with legal source
- [ ] User asks a travel allowance question ("8-stündige Dienstreise Berlin") → RuleEngine returns Tagegeld amount with BRKG citation
- [ ] User asks a procurement question ("50.000 € IT-Dienstleistung Beschaffung") → RuleEngine returns correct procedure (Direktauftrag / Beschränkte Ausschreibung / etc.)
- [ ] User asks a legal reasoning question ("Welche Abstandsflächen gelten in Berlin?") → HYBRID_RETRIEVAL returns evidence-grounded answer with citations
- [ ] Every answer includes: decision text, source document, confidence score
- [ ] Loading state shown during inference (5-60 seconds)
- [ ] Error state shown on timeout or API failure

### Authentication
- [ ] User registers with email, display name, password
- [ ] User logs in with email and password
- [ ] JWT access token stored in memory (never localStorage)
- [ ] Expired token refreshed silently
- [ ] Protected routes redirect unauthenticated users to /login
- [ ] User logs out: tokens invalidated, redirected to /login

### Polish
- [ ] All user-facing text in German
- [ ] Error messages are meaningful (not stack traces)
- [ ] Forms validate input before submission
- [ ] No blank pages on navigation
- [ ] Application does not crash on API error

---

## Should Have (Before Public Demo v0.5)

These features make the product usable for daily work. They are not MVP-blocking but must be complete before showing to external users.

- [ ] Case workspace: create case, view case header with metadata
- [ ] Case checklist: dynamic checklist based on case type
- [ ] Case documents: attach documents to a specific case
- [ ] Internal notes: case-specific notes with timestamps
- [ ] Activity timeline: all case events in chronological order
- [ ] My Work page: list of assigned cases with status and priority filters
- [ ] Knowledge base page: regulations grouped by legal domain
- [ ] Corpus health dashboard: documents, chunks, embeddings, vectors count
- [ ] Batch document import from MANIFEST.yaml
- [ ] Knowledge graph visualization (Neo4j → frontend)
- [ ] 80% test coverage (backend + frontend)
- [ ] CSP headers
- [ ] Rate limiting on auth and decision endpoints
- [ ] OpenTelemetry tracing
- [ ] Structured JSON logging in production
- [ ] CI pipeline (build + test on every push)

---

## Nice to Have (Before Pilot v1.0)

These features improve reliability and operations. They matter for production but not for demonstrating the product.

- [ ] Chunked upload for files > 100MB
- [ ] Advanced search with boolean operators and field-specific queries
- [ ] Corpus versioning: snapshot and rollback
- [ ] Production Docker image with multi-stage build
- [ ] Flyway database migrations
- [ ] Automated PostgreSQL backup & restore
- [ ] Qdrant snapshot backup & restore
- [ ] Incident response playbook
- [ ] Load testing: 50 concurrent users
- [ ] Chaos testing: graceful degradation verified
- [ ] Operations manual
- [ ] API reference documentation
- [ ] HTTPS with HSTS
- [ ] Pre-commit hooks (lint-staged + prettier + ESLint)
- [ ] Backend static analysis (SpotBugs + Checkstyle)
- [ ] Audit log page in UI

---

## Future (v1.1+)

These features are explicitly deferred. They have clear value but are not needed for a working product with 1–2 pilot municipalities.

- [ ] Kubernetes manifests (docker-compose is sufficient)
- [ ] LLM evaluation framework (automated eval of answer quality)
- [ ] Grafana dashboard (health endpoints + metrics are sufficient)
- [ ] SonarQube quality gates
- [ ] Reranking service (cross-encoder) — basic fusion reranking is sufficient
- [ ] Multi-user collaborative case editing
- [ ] Email notifications for case deadlines
- [ ] Document comparison (diff viewer)
- [ ] OCR fallback for image-based PDFs (Tesseract integration)
- [ ] Multi-language support beyond German
- [ ] SSO / OAuth integration (SAML for municipal IdP)
- [ ] Advanced analytics dashboard
- [ ] Role-based access control beyond USER/ADMIN
- [ ] Audit report generation (PDF export)
- [ ] Mobile-responsive layout

---

## What Makes This "Lovable" vs. "Viable"

A Minimum Viable Product answers "can this work?" A Minimum Lovable Product answers "would someone choose to use this?"

The MLP differentiators for this project:

1. **German legal accuracy.** If the RuleEngine says "Direktauftrag" for a 50.000 € IT procurement, that must be legally correct. Wrong legal advice is worse than no advice.

2. **Citations that can be verified.** Every answer must link to the source document and the specific passage. The Sachbearbeiter must be able to click through and read the original regulation.

3. **Deterministic where possible.** The RuleEngine is not an LLM guessing — it's a lookup table. When the system can be 100% certain, it is. The LLM is only used where reasoning is genuinely required.

4. **German-language UX.** Not translated. Written in German by design. Municipal employees should never encounter English UI text, error messages, or labels.

5. **Speed that respects attention.** An answer in 5 seconds is good. An answer in 60 seconds with a progress indicator is acceptable. A blank page for 60 seconds is not.

---

## MVP Verification Test

Run this script before declaring MVP complete:

```bash
# 1. Start fresh
docker-compose down -v
docker-compose up -d
sleep 30

# 2. Register and login
curl -X POST http://localhost:8080/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@munich.de","displayName":"Test Sachbearbeiter","password":"SecurePass123!"}'

TOKEN=$(curl -X POST http://localhost:8080/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@munich.de","password":"SecurePass123!"}' | jq -r '.accessToken')

# 3. Upload a document
curl -X POST http://localhost:8080/api/documents/upload \
  -H "Authorization: Bearer $TOKEN" \
  -F "file=@demo-data/AV zu Paragraph 55 LHO Berlin — Wertgrenzen.txt"

# Wait for ingestion
sleep 15

# 4. Search
curl "http://localhost:8080/api/search?q=Wertgrenzen" \
  -H "Authorization: Bearer $TOKEN"

# 5. Decision — RuleEngine
curl -X POST http://localhost:8080/api/ai/decision \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"question":"Welches Vergabeverfahren bei 50.000 € IT-Dienstleistung?"}'

# 6. Decision — HYBRID_RETRIEVAL
curl -X POST http://localhost:8080/api/ai/decision \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"question":"Welche Wertgrenzen gelten für Direktaufträge nach AV §55 LHO?"}'
```

All 6 commands must succeed. The decision responses must contain `strategy`, `decision`, `source`, and `confidence` fields.

---

## MVP Scope Boundary

**IN scope (Must Have):**
- Document upload, extraction, chunking, embedding, indexing
- Hybrid search (keyword + vector) with citations
- Decision Engine (RuleEngine + HYBRID_RETRIEVAL)
- JWT authentication (register, login, logout, refresh)
- Single-user experience (no role management beyond USER/ADMIN)

**OUT of scope (Should Have / Nice to Have / Future):**
- Case management (workspaces, cases, checklists, notes)
- Multi-user collaboration
- Graph visualization
- Corpus health dashboard
- Batch import
- Security hardening (CSP, rate limiting, HTTPS)
- Observability (tracing, structured logging, dashboards)
- CI/CD
- Production Docker
- Backup/restore
- Load/chaos testing
- Operations documentation

Everything out of scope for MVP will be built in Slices 5–12. The MVP is the foundation — it must work perfectly before anything else is added.
