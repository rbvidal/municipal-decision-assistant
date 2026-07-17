# Solo Implementation Roadmap — Version 1.0

**Developer:** Single founder
**Architecture:** FROZEN (v1.0-architecture-complete)
**Date:** 2026-07-17
**Principle:** Working software over completed layers. Every milestone ends with runnable code.

---

## Context Switch from Team → Solo

The original plan assumed 7 engineers working in parallel. That plan is irrelevant for a solo developer. This document replaces it.

A solo developer has one advantage: zero coordination overhead. Every decision is instant. There is no code review bottleneck, no merge conflict with another engineer's work, no misaligned assumptions.

The disadvantage is obvious: one person does everything. Backend, frontend, infrastructure, testing, documentation — all the same pair of hands.

This plan exploits the advantage and mitigates the disadvantage through ruthless sequencing.

---

## Solo Timeline (Realistic)

| Phase | Duration | Cumulative |
|---|---|---|
| Slice 1: Document Pipeline | 2 weeks | 2 weeks |
| Slice 2: Search & Retrieval | 1.5 weeks | 3.5 weeks |
| Slice 3: Decision Engine | 2 weeks | 5.5 weeks |
| Slice 4: Auth & Shell | 1.5 weeks | 7 weeks |
| **MVP (v0.1) Demo** | — | **7 weeks** |
| Slice 5: Case Workspace | 2.5 weeks | 9.5 weeks |
| Slice 6: Corpus Admin | 1.5 weeks | 11 weeks |
| Slice 7: Testing Coverage | 3 weeks | 14 weeks |
| Slice 8: Security Hardening | 2 weeks | 16 weeks |
| Slice 9: Observability | 1.5 weeks | 17.5 weeks |
| **Public Demo (v0.5)** | — | **17.5 weeks** |
| Slice 10: CI/CD Pipeline | 1.5 weeks | 19 weeks |
| Slice 11: Production Deploy | 2 weeks | 21 weeks |
| Slice 12: Production Readiness | 2 weeks | 23 weeks |
| **Pilot Ready (v1.0)** | — | **23 weeks** |

**Total solo effort:** ~814 engineering hours
**Calendar time:** 23 weeks (40h/week)
**Buffer:** +4 weeks for illness, life, debugging hell
**Realistic delivery:** 23–27 weeks (late December 2026 – late January 2027)

---

## The Three Versions

### v0.1 — Minimum Lovable Product (Week 7)

**What it does:**
- Upload a German municipal document (PDF/DOCX/TXT)
- System extracts text, chunks it, generates embeddings, indexes in Qdrant
- User searches for a regulation → hybrid (keyword + vector) results with citations
- User asks a decision question → RuleEngine answers salary/travel/procurement queries deterministically from structured tables; HYBRID_RETRIEVAL answers legal reasoning questions from indexed documents
- User logs in with JWT, session persists across page refresh

**What it does NOT do:**
- Case management (no workspaces, no cases, no checklists)
- Graph visualization (Neo4j data exists but no frontend)
- Corpus health dashboard (admin tools not built yet)
- Rate limiting, CSP, production hardening
- Comprehensive test coverage
- CI/CD pipeline

**Lines of code at v0.1:** ~12,000 (existing 352 Java + ~100 TSX + integration code)
**Demo audience:** Self. Verify the core loop works end-to-end.

### v0.5 — First Public Demo (Week 17.5)

**What it adds over v0.1:**
- Full case workspace: create case → checklist → documents → notes → activity timeline
- Corpus health dashboard with live metrics
- Knowledge graph visualization
- 80% test coverage (backend + frontend)
- Security: CSP headers, rate limiting, input validation
- Observability: OpenTelemetry tracing, structured logging, Grafana dashboard
- CI pipeline running on every push

**Demo audience:** Early adopters, potential pilot municipalities, investors.
**Goal:** Show a complete administrative workflow from document to decision to case resolution.

### v1.0 — Pilot Ready (Week 23)

**What it adds over v0.5:**
- Production Docker image with multi-stage build
- Flyway database migrations
- Automated backup & restore (PostgreSQL + Qdrant)
- Load tested at 50 concurrent users
- Chaos tested: graceful degradation verified
- Incident playbook and operations manual
- API reference documentation
- Kubernetes manifests (if needed; otherwise docker-compose prod profile)

**Pilot audience:** 1–2 German municipalities using real data.
**Goal:** System runs stably for 4 weeks with real Sachbearbeiter users.

---

## What Moves to v1.1

These items are explicitly deferred. They are valuable but not pilot-blocking:

| Item | Reason for Deferral |
|---|---|
| Kubernetes manifests (T-067) | docker-compose is sufficient for single-machine pilot |
| LLM evaluation framework (T-072) | Manual testing adequate for pilot; automated eval needed before scaling |
| Chunked upload for >100MB files (T-027) | Pilot documents are < 50MB scanned PDFs |
| Advanced query builder with boolean ops (T-034) | Basic search is sufficient for pilot |
| Corpus versioning snapshot/rollback (T-045) | Manual backup is acceptable for single-instance pilot |
| SonarQube quality gates (T-064) | CI pipeline with tests is sufficient; add SonarQube when team grows |
| Grafana dashboard (T-059) | /actuator/metrics + health checks are sufficient for single-instance monitoring |

---

## Key Sequencing Decisions (Solo vs. Team)

| Decision | Team Plan | Solo Plan | Why |
|---|---|---|---|
| Auth first? | Yes (Sprint 1) | No (Slice 4) | Auth matters when there are users. The document pipeline works without it. Build the core loop first. |
| Testing when? | Sprint 6 (late) | Incrementally, each slice | Solo developer can't defer testing — by the time you reach "testing phase," you've forgotten how the code works. Test each slice before moving on. |
| Frontend or backend first? | Parallel | Backend API verified via curl, then frontend | Solo can't work on both simultaneously. Backend produces testable artifacts immediately. |
| Infrastructure first? | Yes (Sprint 1) | Yes (Day 1) | docker-compose must work before anything else. This is unchanged. |
| Admin pages when? | Alongside user pages | After core product works | Admin tools are internal. Users don't see them. Build them after the product has users. |

---

## First Demo — What to Show

**Date:** End of Week 7
**Duration:** 5 minutes

**Demo script:**
1. Start the system: `docker-compose up` (30 seconds of logs scrolling)
2. Login (10 seconds)
3. Upload "AV zu Paragraph 55 LHO Berlin — Wertgrenzen.txt" (15 seconds)
4. Wait for ingestion to complete (30 seconds — show logs or progress)
5. Search for "Wertgrenzen Beschaffung" → see result with citation (30 seconds)
6. Ask "Welches Vergabeverfahren bei 50.000 € IT-Dienstleistung?" → see structured decision via RuleEngine (60 seconds)
7. Ask "Welche Abstandsflächen gelten in Berlin?" → see HYBRID_RETRIEVAL response with evidence citations (90 seconds)
8. Done.

This 5-minute demo proves the entire value proposition: document → index → retrieve → decide.

---

## Solo Work Rhythm

**Daily:**
- 2h deep work (hardest problem first)
- 2h implementation (build what was designed)
- 1h testing (test what was built today)
- 1h documentation (journal entry, update checklist)
- Remaining: email, planning, breaks

**Weekly:**
- Monday: Plan the week's slice progress
- Tuesday–Thursday: Implement
- Friday: Test, document, demo to self, plan next week
- Saturday: Architecture verification checklist review
- Sunday: Off

**Slice rhythm:**
- Start: Write acceptance criteria for the slice
- Implement: Build backend → test via curl → build frontend → test via browser
- Verify: Architecture compliance checklist
- Document: Engineering journal entry, screenshots, updated ROADMAP
- Demo: Record 2-minute screen capture of working functionality
