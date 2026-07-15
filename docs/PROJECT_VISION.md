# PROJECT_VISION.md
When this document conflicts with the current implementation, this document defines the intended direction of the project. The implementation should evolve toward this vision through small, verifiable changes rather than large refactorings.
# Municipal Decision Assistant

## Vision

The Municipal Decision Assistant is an Enterprise AI Platform designed to assist public administration employees in making faster, more transparent, and legally grounded administrative decisions.

The platform is **not** a chatbot.

It is a decision support system.

Every recommendation must be explainable, traceable, and backed by official regulations.

The system must never replace human decision makers.

Its purpose is to increase productivity while improving legal certainty.

---

# Target Users

Primary users

- municipal employees
- administrative staff
- HR departments
- procurement officers
- building authorities
- legal departments

Secondary users

- state authorities
- public agencies
- universities
- public enterprises

Future

The platform should become domain-independent so that additional knowledge domains can be added without changing the core architecture.

---

# Core Principles

## 1. Explainability First

Every recommendation must explain

- why
- based on which regulation
- using which evidence

The user must always understand how a conclusion was reached.

---

## 2. No Hallucinations

The system must never invent

- regulations
- legal paragraphs
- authorities
- monetary values
- thresholds
- procedures

If evidence is insufficient the system must explicitly state that.

---

## 3. Deterministic Knowledge

Facts that can be represented as structured data must never be calculated by an LLM.

Examples

- salary tables
- procurement thresholds
- travel allowances
- administrative fees
- tax rates

These belong to the structured knowledge base.

The LLM only explains them.

---

## 4. Retrieval is Evidence

Retrieval is not a source of creativity.

Its only purpose is to locate relevant official documents.

The LLM reasons only over retrieved evidence.

---

## 5. Local First

The platform is designed for on-premise deployment.

Reasons

- privacy

- GDPR compliance

- public administration requirements

- confidential documents

The system must continue functioning without Internet access.

---

# Product Goals

The platform should answer questions such as

- Can this procurement procedure be used?

- Which approval is required?

- Which regulation applies?

- Which authority is responsible?

- Which forms are required?

- Which deadline applies?

- Which legal basis supports this decision?

---

# User Experience Goals

The user should receive

1. Short answer

2. Decision

3. Explanation

4. Legal basis

5. Required procedure

6. Required forms

7. Required checklists

8. Responsible authority

9. Next step

10. Supporting regulations

The interface should resemble an administrative assistant rather than a general-purpose AI chat.

---

# Architecture Vision

The platform consists of four logical layers.

## Knowledge Layer

Owns

- documents

- structured knowledge

- metadata

- knowledge graph

---

## Retrieval Layer

Owns

- keyword search

- semantic search

- graph search

- reranking

- evidence collection

---

## Decision Layer

Owns

- RuleEngine

- DecisionRouter

- deterministic reasoning

- orchestration

---

## Explanation Layer

Owns

- prompt construction

- LLM interaction

- evidence citation

- natural language generation

The LLM belongs only to this layer.

---

# RuleEngine

The RuleEngine is the authoritative source for deterministic decisions.

It owns

- salary calculations

- procurement thresholds

- travel allowance calculations

- administrative fee calculations

- future structured knowledge

The RuleEngine produces facts.

The LLM explains those facts.

---

# Retrieval

Retrieval is used only when reasoning over regulations is required.

Retrieval must never be executed for deterministic questions.

Examples of deterministic questions

- salary

- travel allowance

- procurement threshold

- fees

Examples requiring retrieval

- legal interpretation

- building regulations

- conflicting regulations

- procedural questions

---

# LLM Responsibilities

The LLM may

- summarize

- explain

- compare

- justify

- translate legal language

The LLM must never

- invent evidence

- invent numbers

- invent authorities

- invent legal paragraphs

- invent procedures

---

# Explainability

Every answer should be traceable.

The platform should always be able to answer

"Why was this recommendation made?"

using retrieved evidence or structured knowledge.

---

# Performance Goals

Simple deterministic questions

Target

< 3 seconds

Retrieval-based questions

Target

< 10 seconds

Large document reasoning

Target

< 20 seconds

Performance must never compromise correctness.

---

# Long-Term Vision

The Municipal Decision Assistant is only the first domain.

The underlying Enterprise AI Platform should eventually support

- legal document intelligence

- enterprise knowledge management

- compliance

- engineering documentation

- healthcare regulations

- insurance

- finance

- corporate policies

without changing the platform architecture.

Only domain knowledge should change.

---

# Success Criteria

The platform is successful when

- recommendations are legally grounded

- answers are explainable

- deterministic answers are always correct

- retrieval returns the correct regulations

- the LLM never hallucinates

- every recommendation can be audited

- administrators trust the platform

- adding a new knowledge domain requires configuration rather than architectural changes.

---

# Non-Negotiable Principles

1. Correctness is more important than creativity.

2. Explainability is more important than fluency.

3. Evidence is more important than confidence.

4. Deterministic knowledge belongs to the RuleEngine.

5. The LLM explains decisions; it does not make deterministic decisions.

6. Every architectural change must preserve these principles.