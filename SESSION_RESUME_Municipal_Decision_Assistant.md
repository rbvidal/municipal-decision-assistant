# Session Resume -- Enterprise AI Platform / Municipal Decision Assistant

## Purpose

Use this file to resume the project in a new ChatGPT session.

## Platform

-   Enterprise AI Platform is architecturally stable.
-   Java 21 / Spring Boot modular platform.
-   GraphRAG, Hybrid Retrieval, Neo4j, Qdrant, Prompt Registry and
    Provider SPI implemented.
-   Documentation largely complete.

## Commercial focus

Current priority: 1. Municipal Decision Assistant (SCCON demo) 2.
BuildPilot later.

## Municipal Decision Assistant

Goal: demonstrate a local-first AI decision-support platform for German
municipalities.

Current UI: - Home - New Decision - Regulations & Procedures -
Documents - Administration - Decision workspace - Graph view

German is default language.

157/157 tests pass.

## Current technical state

-   Provider HTTP 404 fixed.
-   Retrieval works.
-   GraphRAG works.
-   Documents are retrieved.

Remaining issue: LLM grounding and reranking.

Example: Question: 'Ist eine Beschaffung über 800 Euro ohne vorherige
Genehmigung zulässig?'

Problems: - Procurement documents retrieved. - LLM ignored best
evidence. - HR regulation ranked too high. - Hallucinated legal
reasoning.

Next work: - Better grounding - Domain-aware reranking - Hallucination
guard - Decision Package instead of chat answer.

## UX work remaining

-   Hide engineering concepts.
-   Replace placeholder texts:
    -   Formulare prüfen
    -   Checklisten prüfen
    -   Siehe Verfahrensdokumente
-   Show actual forms/checklists.
-   Recommendation first.
-   Collapse technical details.
-   Qualitative trust labels.
-   Natural processing time.
-   Better regulation cards.
-   Explain why each regulation was selected.
-   Add Next Actions.

## Next DeepSeek sprint

Run the merged prompt: Decision Quality & Administrative UX Sprint.

## SCCON positioning

Present as: 'Local AI Decision Support Platform for Municipalities.'

Not: 'ChatGPT for regulations.'

## Product philosophy

Users think in: - cases - regulations - procedures - forms - decisions

Never expose: - GraphRAG - embeddings - pipelines unless in Advanced.

## Priority

1.  Finish merged sprint.
2.  Validate answers.
3.  Polish demo dataset.
4.  Prepare SCCON demo.
