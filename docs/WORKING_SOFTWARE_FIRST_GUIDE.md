# Working Software First — Development Philosophy

**Principle:** Working software is more valuable than completed layers.
**Applies to:** Every implementation task, every slice, every decision.

---

## The Core Principle

> Working software is the primary measure of progress.

Not lines of code. Not completed tasks. Not architectural diagrams. Working software.

A system that uploads a document, indexes it, and answers a question about it — even if the UI is ugly, even if there's no auth, even if it runs on localhost — is infinitely more valuable than a perfectly architected system that doesn't run.

This principle governs every implementation decision:

- When choosing between "build the perfect abstraction" and "make it work with what exists": **make it work.**
- When choosing between "complete the backend layer" and "wire one feature end-to-end": **wire the feature.**
- When choosing between "write all the tests" and "verify the slice works": **verify the slice works, then write tests.**
- When choosing between "polish the UI" and "add the next slice": **add the next slice, then polish.**

---

## The Working Software Invariant

**At all times, the system must be runnable.**

After every task:
```bash
docker-compose up -d
mvn spring-boot:run -pl platform-api
cd frontend && npm run dev
```

If any of these commands fail, the task is not complete. Fix the system before starting anything new.

After every slice:
```bash
# System starts
docker-compose down -v && docker-compose up -d
sleep 30

# Backend compiles and starts
mvn clean install && mvn spring-boot:run -pl platform-api &
sleep 30

# Health check
curl http://localhost:8080/actuator/health

# Frontend compiles and renders
cd frontend && npm run build && npm run preview

# Slice-specific acceptance criteria pass
# (run the verification script for the current slice)
```

This invariant prevents the most common solo-developer failure mode: a broken system that stays broken for weeks while you "finish the next feature."

---

## Every Task Leaves Behind

### 1. Working Code
Code that compiles, runs, and does what the task description says. Not "works on my machine." Works on a fresh clone.

### 2. Tests
At minimum: one test that verifies the happy path. Ideally: tests for the happy path, the error path, and the edge case. At maximum: TDD with 100% branch coverage (only for RuleEngine and other deterministic logic).

### 3. Documentation
Not a separate document. Documentation is:
- A commit message that explains WHY
- A journal entry that records what was done
- A comment on any non-obvious code
- An updated API reference if an endpoint changed

### 4. Screenshot (if UI changed)
A before/after screenshot pair. Before goes in the journal entry. After goes in the demo folder. These become the visual history of the project.

### 5. Runnable Demo
The slice's acceptance criteria pass. You can demonstrate the feature to yourself (or someone else) in under 2 minutes.

---

## No Task Leaves Behind

### A Broken Build
If `mvn clean install` fails, the task is not complete. Ever. Not "I'll fix it tomorrow." Fix it now.

### A Half-Finished Feature
A page that renders but doesn't call the API is not "mostly done." It's not done. Either wire it or don't build it.

### An Untested Code Path
The happy path must be tested. Error paths should be tested. Edge cases are tested when they're likely to occur in production.

### A Mystery Configuration
If you changed a config value and can't explain why in one sentence, revert it. Config changes must be intentional and documented.

### A "Temporary" Workaround
Temporary workarounds are permanent unless they have a removal date. Every workaround gets a `// FIXME(YYYY-MM-DD): ...` comment. When that date arrives, fix it or update the date with justification.

---

## The Friday Rule

**Every Friday at 4 PM, the system must be demonstrable.**

If it's not, you work Saturday morning until it is. This is the only exception to the "no weekends" rule.

The Friday demo doesn't need to be pretty. It needs to work. Run through the current slice's acceptance criteria. If they pass, you're done. If they don't, you know exactly what to fix Monday morning.

The Friday rule serves two purposes:
1. It prevents multi-week divergences where the system is broken and you don't notice.
2. It gives you a concrete win every week. Working software. Demonstrable progress.

---

## Vertical Slicing in Practice

### Wrong way: Horizontal (Layer-First)

```
Week 1-2: Build all backend services
Week 3-4: Build all frontend components
Week 5: Wire them together
Week 6: Debug the wiring (everything is broken because nothing was tested together)
```

This is how teams work (because different people build different layers). It is death for a solo developer. By Week 5, you've forgotten how the backend services work. Integration bugs are everywhere. Momentum is gone.

### Right way: Vertical (Feature-First)

```
Week 1-2: Document upload → extraction → chunking → embedding → indexing → working end-to-end
Week 3-4: Search query → hybrid retrieval → result display → working end-to-end
Week 5-6: Decision question → routing → rule lookup / LLM reasoning → answer display → working end-to-end
```

Each vertical slice produces a working system. Each slice builds on the previous one. The system is always runnable. Momentum compounds.

---

## Testing Philosophy for Solo Development

### Test Immediately, Not Eventually

Write the test as soon as the code works. The sequence is:
1. Write the service method
2. Verify it works via curl or browser
3. Write the unit test
4. Commit

Never: write 5 service methods, verify them all, then write 5 tests. By method 3, you've forgotten the edge cases for method 1.

### Test the Contract, Not the Implementation

A good test verifies: "given this input, I get this output." A bad test verifies: "this method calls this other method with these parameters."

Good tests survive refactoring. Bad tests are broken by refactoring.

### Integration Tests Verify the Seam

The most valuable test is the one that verifies the frontend-backend contract. When the frontend calls `POST /api/ai/decision` with a specific JSON body, it gets back a specific JSON structure. If the structure changes, the integration test fails. This catches the most common bug in solo development: changing the backend and forgetting to update the frontend.

### Test Coverage Targets (Solo-Adjusted)

| Module | Target | Rationale |
|---|---|---|
| platform-ai (RuleEngine, DecisionRouter) | 90%+ | Deterministic logic. Every path must be tested. |
| platform-ai (LLM integration) | 60%+ | LLM output is non-deterministic. Test prompt assembly and response parsing. |
| platform-search | 80%+ | Search quality depends on correct fusion and dedup logic. |
| platform-document | 70%+ | Extraction and chunking are mostly library calls. Test the pipeline orchestration. |
| platform-auth | 80%+ | Security code. Every auth path must be tested. |
| platform-api (controllers) | 60%+ | Controllers should be thin. Test validation and error handling. |
| frontend (components) | 80%+ | Components are the user experience. Test rendering and user interactions. |
| frontend (pages) | 50%+ | Pages compose components. Test happy path and error state. |

---

## When to Break the Rules

These rules are guidelines, not dogma. Break them when:

### You're in flow state at 4:30 PM on a Friday
If you're making great progress and the system works, keep going. Ship the Friday demo Saturday morning. Flow state is rare and valuable.

### The task genuinely requires a horizontal phase
Some infrastructure work (Flyway migration, Docker production image, CI pipeline) is inherently horizontal. It touches multiple modules and doesn't produce a visible user feature. That's OK. These tasks are concentrated in Slices 10–12, after the product works.

### You're blocked and the only path forward is "temporary"
Sometimes the right library doesn't exist, the API is broken, or the infrastructure is fighting you. Ship it with the workaround. Document it with a `FIXME` date. Move on. Perfectionism kills solo projects faster than technical debt.

### The architecture genuinely needs to change
The architecture is frozen, but it's not infallible. If you discover a genuine flaw — not "I would have designed this differently" but "this design prevents the system from working" — document the finding, propose the change, and implement it. The frozen architecture is a constraint that enables focus, not a prison.

---

## Daily Checklist

Before ending each day:

- [ ] Code committed with a descriptive message
- [ ] All tests passing (`mvn test` + `npm test`)
- [ ] System starts (`docker-compose up` → backend → frontend)
- [ ] Journal entry written (or notes captured for tomorrow's entry)
- [ ] Next task identified for tomorrow morning

If all 5 boxes are checked, the day was successful regardless of how many lines of code you wrote.

---

## Slice Completion Checklist

Before marking a slice complete:

- [ ] All slice tasks implemented
- [ ] All acceptance criteria pass
- [ ] Architecture verification checklist passed (slice-level review)
- [ ] Slice reflection written in engineering journal
- [ ] Demo recorded (2-5 minute screen capture)
- [ ] Git tag created for the slice (`v0.1-mvp`, `slice-4-complete`, etc.)
- [ ] Next slice tasks reviewed and understood

---

## References

- [SOLO_IMPLEMENTATION_ROADMAP.md](SOLO_IMPLEMENTATION_ROADMAP.md) — Timeline and milestones
- [VERTICAL_SLICE_PLAN.md](VERTICAL_SLICE_PLAN.md) — Detailed slice definitions
- [MVP_DEFINITION.md](MVP_DEFINITION.md) — What must work before anything else
- [IMPLEMENTATION_SEQUENCE.md](IMPLEMENTATION_SEQUENCE.md) — Exact task order
- [ARCHITECTURE_VERIFICATION_CHECKLIST.md](ARCHITECTURE_VERIFICATION_CHECKLIST.md) — Compliance audit
- [SOLO_RISK_REGISTER.md](SOLO_RISK_REGISTER.md) — What could go wrong

---

**Remember:** The world is full of perfectly architected systems that never shipped. Ship working software. Polish it later. Build the next slice. Repeat.
