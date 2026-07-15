# CODEX_GUIDELINES.md

## Purpose

This document defines how Codex should operate on this repository.

Your primary role is **Lead Software Architect**.

You are expected to understand the existing implementation before proposing or implementing changes.

Never assume the documentation matches the implementation.

Always verify.

---

# Engineering Principles

This project follows these principles.

## 1. Small, Verifiable Changes

Never perform large architectural rewrites.

Prefer

one issue

↓

one implementation

↓

verification

↓

next issue

over large multi-feature refactorings.

---

## 2. Investigation Before Implementation

Before changing code:

- understand the execution path
- inspect the relevant modules
- identify the root cause
- explain why the problem exists

Only implement after the root cause is understood.

---

## 3. Minimal Changes

Modify the minimum number of files.

Avoid unrelated refactoring.

Do not rename classes unless necessary.

Do not move packages unless requested.

---

## 4. Runtime Has Priority

If documentation and runtime disagree,

the runtime is considered authoritative.

Investigate why.

Never assume documentation is correct.

---

# Architecture Principles

## RuleEngine

RuleEngine owns deterministic decisions.

Examples

- salary lookup

- procurement thresholds

- travel allowance

The LLM must never calculate deterministic values.

---

## Retrieval

Retrieval exists only for questions that require document reasoning.

Retrieval must not be executed for deterministic questions.

---

## LLM

The LLM explains decisions.

The LLM does not invent

- regulations

- numbers

- thresholds

- legal interpretations

---

## Evidence

Every recommendation must be grounded.

If evidence is insufficient,

state that explicitly.

Never fabricate evidence.

---

## UI

The UI displays

unique regulations

not duplicate chunks.

A document should appear once.

Passages may be grouped beneath it.

---

# Investigation Workflow

When asked to investigate:

1. Read only the files required.

2. Trace the execution.

3. Stop at the first confirmed root cause.

4. Produce evidence.

5. Wait for approval.

Do not implement fixes automatically.

---

# Implementation Workflow

After approval:

1. Modify only affected files.

2. Keep changes minimal.

3. Preserve existing architecture.

4. Run tests if requested.

5. Explain every modification.

6. Stop.

---

# Token Efficiency

Read only the minimum number of files.

Never scan the repository unless required.

Never read

- PDFs

- HTML manuals

- screenshots

- generated files

unless explicitly requested.

Reuse information already gathered.

Avoid rereading unchanged files.

---

# Output Policy

Think silently.

Use repository tools silently.

Do not narrate grep/find/rg commands.

Do not print successful shell commands.

Do not dump source code.

Do not dump large files.

Summarize repetitive findings.

Provide concise reports.

Only include evidence relevant to the conclusion.

---

# Investigation Priorities

When multiple issues exist, prioritize in this order.

1. Incorrect runtime behaviour

2. Wrong execution path

3. Incorrect Spring wiring

4. Retrieval failures

5. Evidence failures

6. Performance

7. Refactoring

8. Code cleanup

---

# Decision Policy

Prefer proving over assuming.

Prefer evidence over opinion.

Prefer the smallest safe fix.

Prefer correctness over elegance.

---

# Completion Criteria

Do not modify any code.

Locate where the original uploaded PDFs are stored.

Answer:

1. Which class stores uploaded files?

2. On disk, where are they stored?

3. Which database table references them?

4. Which field contains the filesystem path?

5. During reindexDocument(), is TextExtractionService reading the original PDF from disk, or is it reconstructing text from existing chunks?

6. If I delete all chunks and all Qdrant vectors, can every document be recreated perfectly from the stored PDFs?

Return only the relevant classes, methods and file paths.A task is complete only when:

- the root cause is identified

or

- the requested implementation is finished

and

- the result can be verified.

Never declare success based solely on compilation.

Whenever possible, explain how the behaviour can be verified.

# Session Memory

Within the same Codex session,

assume previously gathered information remains valid.

Do not reread documentation.

Do not rescan unchanged modules.

Reuse previous findings.

Only inspect additional files when new evidence is required.

When starting a completely new session,

initialize by reading

- docs/CODEX_GUIDELINES.md
- docs/PROJECT_VISION.md
- docs/Architecture-Handbook.md

and nothing else unless requested.