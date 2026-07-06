# Municipal Decision Assistant v1.0.0

**Smart Country Convention (SCCON) Demonstration Release** · July 2026

---

## Overview

The Municipal Decision Assistant is a demonstration application built on the Enterprise AI Platform for Smart Country Convention (SCCON) — Germany's leading trade fair for the digitization of the public sector.

It showcases how AI-powered semantic search, knowledge graphs, and document intelligence can support decision-making in municipal administrations. Council resolutions, regulatory texts, building permits, development plans, and administrative regulations become instantly searchable and AI-actionable.

This release is a **hard fork** of the Enterprise AI Platform v1.0.0, rebranded for the municipal administration domain. The underlying architecture, module structure, SPIs, and database schema are preserved unchanged.

---

## Demonstration Highlights

### Municipal Document Intelligence
Upload council meeting minutes, resolutions, building codes, development plans, and administrative regulations. The application extracts text, enriches content with semantic metadata, and indexes documents across keyword, vector, and graph stores. Natural language queries return grounded, cited answers.

### AI-Assisted Decision Support
Query across thousands of municipal documents: "What are the setback requirements for mixed-use buildings in zone MI-3?" "Which council resolutions in 2025 affected the school construction program?" "What is the procedure for processing a building permit application?"

### Privacy-First Architecture
All infrastructure runs locally — PostgreSQL, Qdrant, Neo4j, and Ollama on municipal hardware. No documents leave the network. No data sent to external APIs. This architecture directly addresses the data sovereignty requirements of German municipal administrations.

---

## Platform Foundation

Built on the Enterprise AI Platform v1.0.0:

- **9 compile-time-enforced Maven modules** with strict dependency boundaries
- **Multi-provider AI orchestration** — Ollama and OpenAI-compatible providers behind a common SPI
- **Hybrid retrieval** — keyword, vector (Qdrant), and graph (Neo4j) search with weighted linear fusion
- **Knowledge graph** — auto-generated Neo4j graph with typed nodes and full provenance
- **GraphRAG** — graph traversal augments retrieval with relationship-aware discovery
- **Automated evaluation** — grounding, faithfulness, and hallucination scoring on every answer
- **Explainability by default** — full inference metadata on every generated answer
- **Immutable audit log** — every action recorded with correlation IDs
- **Graceful degradation** — every external dependency is optional

---

## Compatibility

The Municipal Decision Assistant preserves full compatibility with the Enterprise AI Platform:

- Java package names: `com.cognitera.platform.*` (unchanged)
- Maven module names: `platform-api`, `platform-ai`, etc. (unchanged)
- SPI interfaces: all unchanged
- Database schema: all Flyway migrations unchanged
- REST APIs: all endpoints unchanged

Only user-visible branding strings were updated: application name, page titles, navigation, configuration, Docker containers, and documentation.

---

## Build & Run

```bash
git clone https://github.com/cognitera/municipal-decision-assistant
cd municipal-decision-assistant

docker compose up -d                    # PostgreSQL + Qdrant
docker compose --profile graph up -d     # + Neo4j for GraphRAG

mvn spring-boot:run -pl platform-api
```

**Requirements:** Java 21, Maven 3.x, Docker. Ollama optional.

Open `http://localhost:8080`.

---

## Acknowledgements

Built on the [Enterprise AI Platform](https://github.com/cognitera/enterprise-ai-platform) and the exceptional open-source ecosystem: Spring Boot, Neo4j, Qdrant, PostgreSQL, Ollama, Apache Tika, Micrometer, Docker, and Playwright.

---

**Municipal Decision Assistant v1.0.0** — Demonstrating AI for municipal administrations at SCCON 2026.
