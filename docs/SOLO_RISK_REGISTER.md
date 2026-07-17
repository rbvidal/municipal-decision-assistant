# Solo Risk Register

**Developer:** Single founder
**Context:** One person doing backend, frontend, infrastructure, testing, documentation
**Review cadence:** Every slice retrospective

---

## Risk Matrix

| Probability | Low (1) | Medium (2) | High (3) |
|---|---|---|---|
| **High (3)** | 3 | 6 | **9** |
| **Medium (2)** | 2 | 4 | 6 |
| **Low (1)** | 1 | 2 | 3 |

---

## Solo-Specific Risks

### SR-01: Context Switching Overload
**Probability:** High (3) | **Impact:** High (3) | **Score:** 9

**Description:** A solo developer switches between Java/Spring Boot, TypeScript/React, Docker, PostgreSQL, Qdrant, Neo4j, and Ollama — often within the same day. Each context switch costs 15–30 minutes of productive time. Over 12 slices, switching costs could consume 20% of total time.

**Mitigation:**
1. **Day-level batching.** Backend on Monday/Tuesday. Frontend on Wednesday/Thursday. Infrastructure on Friday. No switching within a day.
2. **Slice design.** Each slice is backend-heavy or frontend-heavy, not both. Slice 1 is 70% backend. Slice 4 is 80% frontend.
3. **Environment preservation.** Keep terminal tabs open: one for backend logs, one for frontend dev server, one for docker-compose. Don't restart environments unnecessarily.
4. **Checkpoint commits.** Commit at the end of each day with a descriptive message. If you need to switch context mid-day, the commit tells you where you left off.

**Warning sign:** You've opened 3 different IDEs and don't remember what you were working on.

---

### SR-02: Burnout
**Probability:** Medium (2) | **Impact:** Critical (3) | **Score:** 6

**Description:** 23 weeks of solo development with no team support. No one to celebrate wins with. No one to debug with at 10 PM. No one to say "that's good enough, ship it." Burnout risk increases sharply after Week 12.

**Mitigation:**
1. **Strict 40-hour week.** No exceptions. When the timer hits 40, stop. The project will be there Monday.
2. **Sunday completely off.** Not "light documentation Sunday." Off.
3. **External accountability.** Share progress with someone weekly. A friend, a former colleague, a Twitter thread. Someone who will notice if you stop posting.
4. **Celebrate milestones.** v0.1 MVP is a big deal. Take a day off. Go somewhere. The to-do list will wait.
5. **Physical separation.** If working from home, have a dedicated workspace that you physically leave at the end of the day. Laptop closed = work over.

**Warning sign:** You're working Saturday "just to get ahead" or you dread opening the IDE.

---

### SR-03: Long Debugging Sessions Without a Second Pair of Eyes
**Probability:** High (3) | **Impact:** Medium (2) | **Score:** 6

**Description:** A bug that a teammate would spot in 30 seconds can consume 4 hours solo. There is no rubber duck, no code review, no "have you tried restarting?" from a colleague. Debugging solo is exponentially harder.

**Mitigation:**
1. **The 45-minute rule.** If you've been stuck on the same bug for 45 minutes, stop. Write down what you've tried. Take a walk. Come back fresh.
2. **Rubber duck debugging.** Explain the problem out loud to an empty chair. This works surprisingly often.
3. **Commit and bisect.** If a bug appeared recently, `git bisect` is faster than reasoning about it.
4. **Reduce to minimal reproduction.** Strip everything non-essential. The bug is always in the simpler system.
5. **LLM as debugging partner.** Paste the error and relevant code into a Claude/chat window. Treat it as a junior engineer — verify everything, but listen to suggestions.

**Warning sign:** You've been staring at the same stack trace for 90 minutes.

---

### SR-04: Loss of Momentum
**Probability:** High (3) | **Impact:** High (3) | **Score:** 9

**Description:** Solo projects die from loss of momentum, not from technical failure. A multi-day debugging session, a life event, or simply a task that's too large and vague can break the chain of daily progress. Once momentum breaks, restarting is psychologically difficult.

**Mitigation:**
1. **Never end a day on a failure.** If you're stuck at 4 PM, switch to something you can complete: write documentation, add a test, clean up code. End every day with a commit that passes.
2. **Keep tasks small.** The original 4–16h task sizing applies doubly for solo. A 16h task is 2 days. If you haven't finished in 2 days, the task was too large.
3. **Visible progress.** The engineering journal and commit history are your momentum trackers. When demotivated, read the last week's entries. You did more than you remember.
4. **Minimum viable day.** On low-energy days, do ONE thing: fix one test, write one paragraph of documentation, review one file. Something. Anything to keep the chain unbroken.
5. **Slice completion dopamine.** Every slice ends with a working demo. Ship it. Record it. That feeling of "it works" is the fuel for the next slice.

**Warning sign:** You haven't committed code in 3 days.

---

### SR-05: Infrastructure Maintenance Distraction
**Probability:** Medium (2) | **Impact:** Medium (2) | **Score:** 4

**Description:** Docker updates break docker-compose. Ollama model updates change behavior. Qdrant version bump changes API. A solo developer can lose days to infrastructure maintenance that a DevOps engineer would handle in hours.

**Mitigation:**
1. **Pin everything.** Docker images pinned to exact versions. Ollama models pinned. Maven and npm dependencies pinned. No surprise updates.
2. **Update only between slices.** Never update infrastructure mid-slice. If everything works, don't touch it.
3. **One command to start everything.** `docker-compose up` must always work. If it breaks, it's the highest priority to fix.
4. **Separate "maintenance day."** One Friday per month: update dependencies, check for CVEs, clean up disk space. The rest of the month: hands off.

**Warning sign:** You're reading Qdrant changelogs instead of writing application code.

---

### SR-06: Delayed Testing = No Testing
**Probability:** High (3) | **Impact:** Medium (2) | **Score:** 6

**Description:** When a team has a "testing phase" (Sprint 6), engineers write tests because the sprint plan says so. A solo developer with a "testing slice" (Slice 7) will be tempted to skip it — "the code works, why write tests now?" The result is 0% test coverage that never improves.

**Mitigation:**
1. **No untested code committed.** Every new service method has at least one test written the same day. No exceptions.
2. **Test before moving on.** Each slice's acceptance criteria include test coverage. Don't start the next slice until current slice tests pass.
3. **Slice 7 is about coverage gaps, not starting testing.** By Slice 7, coverage should already be ~50% from incremental testing. Slice 7 fills the remaining gaps.
4. **Red-green-refactor.** The discipline of writing a failing test first prevents the "I'll test it later" trap.

**Warning sign:** You wrote 500 lines of code today and 0 lines of tests.

---

### SR-07: Documentation Debt
**Probability:** High (3) | **Impact:** Medium (2) | **Score:** 6

**Description:** Documentation is the first thing dropped under time pressure. A solo developer has no one to ask "how does this work?" — so documentation is actually MORE important, not less. When you return after a 2-week break, your own code will be unfamiliar.

**Mitigation:**
1. **Journal entry as part of "done."** A task is not complete until the journal entry is written. It takes 10 minutes. Do it immediately.
2. **Code comments for WHY, not WHAT.** When you do something non-obvious, write one line explaining why. Future you will be grateful.
3. **API reference as you build.** When you add an endpoint, add it to API_REFERENCE.md immediately. Not "later."
4. **Screenshots as progress markers.** A screenshot takes 5 seconds. It captures UI state that is otherwise lost to history.

**Warning sign:** You can't remember what you worked on last Tuesday.

---

### SR-08: Knowledge Concentration (Bus Factor = 1)
**Probability:** High (3) | **Impact:** High (3) | **Score:** 9

**Description:** Every architectural decision, every configuration choice, every "temporary" workaround lives in one person's head. If that person is unavailable for any reason, the project is frozen. There is no one to hand off to.

**Mitigation:**
1. **The engineering journal IS the second brain.** Every decision, every configuration, every workaround goes in the journal. If you get hit by a bus, the journal is the onboarding document for the next developer.
2. **Architecture documents are kept current.** If a decision changes, update the ADR. Don't let documentation drift.
3. **Commit messages are meaningful.** "fix bug" is useless. "Fix procurement category normalization: IT-Dienstleistung → Lieferung/Dienstleistung, not Dienstleistung" is useful.
4. **Consider a part-time collaborator.** Even 5 hours/week from a contractor — code review, rubber duck, documentation review — dramatically reduces bus factor.

**Warning sign:** You're the only person who has ever read the code.

---

### SR-09: Financial Runway Pressure
**Probability:** Medium (2) | **Impact:** High (3) | **Score:** 6

**Description:** A solo founder has finite savings. The 23-week timeline assumes full-time work. If financial pressure forces part-time or client work, the timeline stretches proportionally. A project that takes 23 weeks full-time takes 46 weeks half-time — and loses momentum.

**Mitigation:**
1. **Ruthless scope control.** v0.1 MVP at Week 7 is the first external validation point. If the MVP doesn't attract interest, reassess before investing another 16 weeks.
2. **v0.5 public demo as funding trigger.** A working demo at Week 17.5 can unlock grant funding, pilot contracts, or investment. Don't wait for v1.0 to show anyone.
3. **Billable work containment.** If consulting is necessary, contain it to specific days (e.g., Monday/Tuesday client work, Wednesday–Friday product work). Don't interleave.
4. **Grant eligibility.** German municipal software may qualify for government innovation grants (ZIM, EXIST, Landesförderung). Apply early — grant writing takes months.

**Warning sign:** You've spent more time this week on client work than product work.

---

### SR-10: Feature Creep (Solo Edition)
**Probability:** High (3) | **Impact:** Medium (2) | **Score:** 6

**Description:** With no product manager saying "no," a solo developer can add "just one more feature" indefinitely. Every new idea feels urgent. The backlog grows faster than it shrinks.

**Mitigation:**
1. **The frozen architecture is the product manager.** If a feature isn't in the architecture, it doesn't exist. Period.
2. **Write ideas down, don't implement them.** Maintain an `IDEAS.md` file. Every "wouldn't it be cool if..." goes there. Review it after v1.0 ships.
3. **Slice acceptance criteria are the contract.** If the acceptance criteria are met, the slice is done. Don't polish. Move on.
4. **v1.1 is the release valve.** Knowing that there IS a v1.1 makes it easier to defer features. They're not rejected — they're scheduled.

**Warning sign:** You're implementing something that isn't in any task description.

---

### SR-11: Health & Ergonomics
**Probability:** Medium (2) | **Impact:** High (3) | **Score:** 6

**Description:** 23 weeks of intense solo development. Repetitive strain injury, eye strain, back problems, and sedentary lifestyle health risks are real. An injury that prevents typing for 2 weeks adds 2 weeks to the timeline.

**Mitigation:**
1. **Proper desk setup.** External monitor at eye level. Mechanical keyboard. Good chair. This is a business expense, not a luxury.
2. **Eye breaks.** 20-20-20 rule: every 20 minutes, look at something 20 feet away for 20 seconds.
3. **Movement breaks.** Stand up every hour. Walk for 5 minutes every 2 hours.
4. **Voice typing backup.** Learn to use voice dictation for documentation and emails. It's slower but it keeps you working if your hands need rest.

**Warning sign:** Your wrists hurt and you're still typing.

---

## Residual Team Risks (Still Apply)

These risks from the team risk register still apply to a solo developer:

| ID | Risk | Score | Solo-specific note |
|---|---|---|---|
| R-001 | SSE Streaming Complexity | 4 (was 6) | Solo: test with curl first, build fallback before UI |
| R-004 | Ollama Model Performance | 4 (was 6) | Solo: more patience, fewer alternatives |
| R-007 | Frontend-Backend DTO Mismatch | 3 (was 6) | Solo: same person writes both, mismatch unlikely |
| R-009 | Frontend Test Coverage Gap | 6 | Solo: incremental testing mitigates |
| R-013 | Production DB Migration | 6 | Solo: backup-first, no one to help if migration fails |
| R-017 | German Legal Domain Knowledge | 6 | Solo: learn it or hire a domain consultant |

---

## Summary: Critical Solo Risks (Score ≥ 8)

| ID | Risk | Score | Primary Mitigation |
|---|---|---|---|
| SR-01 | Context Switching Overload | 9 | Day-level batching, single-language days |
| SR-04 | Loss of Momentum | 9 | Never end on failure, minimum viable days |
| SR-08 | Knowledge Concentration | 9 | Engineering journal as second brain |

These three risks are the most likely to kill the project. Every slice retrospective must review them specifically.
