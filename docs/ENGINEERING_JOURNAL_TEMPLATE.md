# Engineering Journal — Municipal Decision Assistant

**Purpose:** Long-term engineering memory. One entry per completed task. This journal is the first thing to read when resuming work after a break.

---

## How to Use This Journal

1. **Create a new entry immediately after completing each task.** Don't wait until end of day — details fade.
2. **Be honest about problems.** "Smooth sailing" entries are useless. The value is in what went wrong and how you fixed it.
3. **Include measurements.** "fast enough" is not a measurement. "850ms p95" is.
4. **Link commits.** Every entry must reference a commit hash.
5. **Review before starting new work.** Read the last 3 entries to reload context.

---

## Journal Entry Template

```markdown
---

## Task: [Task ID] — [Task Title]

**Date:** YYYY-MM-DD
**Slice:** [Slice Number] — [Slice Name]
**Commit:** [`abc1234`](https://github.com/rbvidal/municipal-decision-assistant/commit/abc1234)
**Duration:** [X] hours (estimated: [Y] hours)

### Summary
[One paragraph — what was built, in plain language.]

### Files Changed
| File | Change |
|---|---|
| `platform-ai/src/main/java/.../Foo.java` | Added normalizeCategory() for edge cases |
| `platform-ai/src/test/java/.../FooTest.java` | 12 new test cases |
| ... | ... |

### Problems Encountered
[Bullet list. What broke? What was confusing? What took longer than expected?]

### Architecture Deviations
[If any implementation diverged from the frozen architecture, document it here with justification. If none, write "None — implementation matches architecture."]

### Performance Measurements
| Metric | Before | After | Notes |
|---|---|---|---|
| [e.g., Ingestion time per doc] | [value] | [value] | — |
| [e.g., Test count] | [value] | [value] | — |
| [e.g., Build time] | [value] | [value] | — |

### Runtime Verification
[How was this verified to work at runtime?]
- [ ] curl command: `curl -X POST ...` → expected response received
- [ ] Browser: visited http://localhost:5173/... → correct page rendered
- [ ] Docker: `docker-compose ps` → all services healthy
- [ ] Other: [describe]

### Tests Added
| Test | Type | What It Verifies |
|---|---|---|
| `shouldNormalizeITDienstleistungToLieferung` | Unit | IT-Dienstleistung → Lieferung/Dienstleistung |
| ... | ... | ... |

**Test count before:** [N]
**Test count after:** [M]

### Screenshots
[Optional. Include `![screenshot](path)` if UI changed.]

### Lessons Learned
[What would you do differently if you did this task again? What surprised you?]

### Future Cleanup
[Technical debt intentionally left. What should be cleaned up later and why was it deferred?]

### Technical Debt Introduced
| Item | Severity | When to Fix |
|---|---|---|
| [e.g., Hardcoded timeout in FooService] | Low | Before v1.0 |
| ... | ... | ... |

### Technical Debt Removed
| Item | Was | Now |
|---|---|---|
| [e.g., Mock service replaced with real API] | Mock data | Real API with error handling |
| ... | ... | ... |

---

## Slice Reflection: [Slice Name]

[Complete this after the last task in each slice.]

**Slice completed:** YYYY-MM-DD
**Slice duration:** [X] calendar days (estimated: [Y])

### What worked well?
[Bullet list.]

### What didn't work?
[Bullet list.]

### Architecture compliance
- [ ] Module boundaries intact
- [ ] DTOs clean (no business logic)
- [ ] APIs consistent
- [ ] No new dependencies on specific providers
- [ ] Graceful degradation still works

### Demo recorded?
- [ ] Yes — [link to video file or path]
- [ ] No — reason: [why]

### Next slice readiness
- [ ] All tasks in current slice complete
- [ ] All tests passing
- [ ] System runs end-to-end
- [ ] Ready to start [Next Slice Name]

---

```

---

## Example Entry

```markdown
---

## Task: S3.1 (T-021) — Procurement Category Normalization

**Date:** 2026-08-12
**Slice:** Slice 3 — Decision Engine
**Commit:** [`d4e5f67`](https://github.com/rbvidal/municipal-decision-assistant/commit/d4e5f67)
**Duration:** 7 hours (estimated: 8 hours)

### Summary
Completed all VgV/DVO category mappings in ThresholdTable.normalizeCategory(). Every known procurement category now maps correctly to Lieferung/Dienstleistung or Bauleistung. Unknown categories default to Lieferung/Dienstleistung with a WARN log. Added 100% branch coverage with 24 test cases.

### Files Changed
| File | Change |
|---|---|
| `platform-ai/src/main/java/.../ThresholdTable.java` | Added 14 category mappings to normalizeCategory() |
| `platform-ai/src/test/java/.../ThresholdTableTest.java` | 24 new test cases for all categories + edge cases |

### Problems Encountered
- "IT-Dienstleistung" was being classified as "Dienstleistung" but the AV §55 LHO treats IT as a subcategory of Lieferung/Dienstleistung. Fixed by mapping IT-* patterns to Lieferung/Dienstleistung before the general Dienstleistung match.
- "Freiberufliche Leistungen" (architects, engineers) map to a separate VgV threshold but share the same AV §55 LHO category. Added explicit mapping with a comment linking to VgV §74.
- Test data had "Bauleistung" and "Bauleistungen" (plural) — both must work. Added plural normalization.

### Architecture Deviations
None — implementation matches architecture.

### Performance Measurements
| Metric | Before | After | Notes |
|---|---|---|---|
| Test count (ThresholdTableTest) | 8 | 32 | +24 test cases |
| Branch coverage (normalizeCategory) | 45% | 100% | All paths covered |

### Runtime Verification
- [x] curl: N/A (unit test only)
- [x] `mvn test -pl platform-ai -Dtest=ThresholdTableTest` → 32/32 pass
- [x] `mvn verify -pl platform-ai` → JaCoCo reports 100% branch coverage on normalizeCategory()

### Tests Added
| Test | Type | What It Verifies |
|---|---|---|
| `shouldNormalizeITDienstleistung` | Unit | IT-Dienstleistung → Lieferung/Dienstleistung |
| `shouldNormalizeBauleistung` | Unit | Bauleistung → Bauleistung |
| `shouldNormalizeFreiberuflicheLeistung` | Unit | Freiberufliche Leistungen → Lieferung/Dienstleistung |
| `shouldDefaultUnknownCategory` | Unit | Unknown → Lieferung/Dienstleistung + WARN log |
| [+ 20 more test cases] | Unit | All VgV/DVO categories |

**Test count before:** 8
**Test count after:** 32

### Lessons Learned
- German administrative law has subtle category distinctions. "Dienstleistung" (service) and "Lieferung/Dienstleistung" (supply/service) are DIFFERENT legal categories, not a hierarchy. The slash is part of the name.
- Always test with real AV §55 LHO text, not just the category names. The legal document uses slightly different terminology than the VgV.

### Technical Debt Introduced
| Item | Severity | When to Fix |
|---|---|---|
| Hardcoded category strings — could be externalized to a config file | Low | Post-pilot |

### Technical Debt Removed
| Item | Was | Now |
|---|---|---|
| IT categories mapped incorrectly | IT-Dienstleistung → Dienstleistung (wrong) | IT-Dienstleistung → Lieferung/Dienstleistung (correct) |

---
```

---

## Quick-Start: Resuming Work After a Break

1. Read the last 3 journal entries
2. Read the current slice's acceptance criteria in VERTICAL_SLICE_PLAN.md
3. Read ARCHITECTURE_VERIFICATION_CHECKLIST.md — run the slice-level checklist
4. Run `docker-compose up && mvn clean install && cd frontend && npm run dev`
5. Run all tests: `mvn test && cd frontend && npm test`
6. Read the next task in IMPLEMENTATION_SEQUENCE.md
7. Start working

---

## Journal File Naming

Store journal entries in `docs/journal/` as:
- `YYYY-MM-DD_S[N]-[task-id].md` for individual task entries
- `YYYY-MM-DD_SLICE-[N]-REFLECTION.md` for slice reflections

Example:
- `docs/journal/2026-08-12_S3-T021.md`
- `docs/journal/2026-08-26_SLICE-3-REFLECTION.md`

---

## Template Variables Cheat Sheet

| Variable | Source |
|---|---|
| Task ID | IMPLEMENTATION_SEQUENCE.md |
| Slice number/name | VERTICAL_SLICE_PLAN.md |
| Commit hash | `git log --oneline -1` |
| Estimated hours | ENGINEERING_BACKLOG.md or IMPLEMENTATION_SEQUENCE.md |
| Actual hours | Your timesheet / clock |
| Test counts | `mvn test` output or `npm test -- --coverage` output |
| Performance measurements | `/actuator/metrics`, browser DevTools, `time curl ...` |
