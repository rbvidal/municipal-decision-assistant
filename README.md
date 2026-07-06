# Municipal Decision Assistant

**AI-powered decision support for municipal administrations** — a demonstration application for Smart Country Convention (SCCON).

Semantic search, document reasoning, and knowledge graphs applied to municipal documents: council resolutions, regulatory texts, building permits, development plans, citizen correspondence, and administrative regulations.

**Java 21 · Spring Boot 3.3 · 9 Modules · 176 Tests**

---

## What Is This?

The Municipal Decision Assistant is a **demonstration application** built on the Enterprise AI Platform. It showcases how AI can support municipal decision-making by making thousands of administrative documents instantly searchable and AI-actionable.

This project was created for **Smart Country Convention (SCCON)** — Germany's leading trade fair for the digitization of the public sector.

It demonstrates:

- **Semantic search** across council resolutions, regulatory texts, building codes, and administrative documents
- **AI-grounded answers** with citations from official municipal documents
- **Knowledge graphs** connecting regulations, departments, procedures, and decisions
- **On-premise deployment** — all data stays on municipal infrastructure
- **Full explainability** — every AI answer shows its sources and reasoning

---

## Quick Start

```bash
git clone https://github.com/cognitera/municipal-decision-assistant
cd municipal-decision-assistant

# Start infrastructure (PostgreSQL + Qdrant)
docker compose up -d

# Enable knowledge graph and GraphRAG
docker compose --profile graph up -d

# Build and run
mvn spring-boot:run -pl platform-api
```

Open `http://localhost:8080`. Upload municipal documents and start querying.

---

## Demonstration Scenarios

### Council Resolution Search
Upload council meeting minutes and resolutions. Search: "What did the council decide about the new school building in district Nord?" The system finds the relevant resolution, extracts the decision text, and cites the source document.

### Regulatory Compliance
Upload building codes (BauGB, BauNVO), environmental regulations, and municipal statutes. Query: "What are the setback requirements for a mixed-use building in zone MI-3?" The system retrieves the relevant paragraphs and explains requirements with citations.

### Development Plan Intelligence
Upload Bebauungspläne (development plans) and associated documentation. Cross-reference with zoning regulations, environmental assessments, and infrastructure plans. Query: "Which development plans in the city include provisions for rainwater management?"

### Administrative Knowledge Management
Upload internal administrative regulations (Dienstanweisungen), process documentation, and organizational charts. New employees query: "What is the procedure for processing a building permit application?" The system retrieves the relevant process documentation with step-by-step guidance.

---

## Architecture

```
platform-api              Application assembly (REST + Thymeleaf UI)
    ↓
platform-ai               RAG orchestration, enrichment, evaluation, registries
platform-search           Hybrid search (keyword + vector + graph)
platform-document         Document lifecycle + ingestion pipeline
platform-neo4j            Knowledge graph persistence (auto-generated)
platform-workspace        Workspace management + document organization
platform-observability    Micrometer metrics + health indicators
platform-auth             JWT authentication + user management
    ↓
platform-audit            Immutable audit log (leaf module)
```

Dependency direction flows downward. `platform-api` depends on everything; nobody depends on `platform-api`. Compile-time boundaries enforced by Maven.

---

## Platform Capabilities

| Capability | Municipal Application |
|-----------|----------------------|
| **AI Orchestration** | Multi-provider LLM (Ollama local, OpenAI-compatible cloud) behind a common SPI |
| **Hybrid Retrieval** | Keyword + vector + graph search across regulations, resolutions, and administrative documents |
| **Semantic Enrichment** | Auto-extraction of entities (departments, locations, legal references, dates) from municipal documents |
| **Knowledge Graph** | Auto-generated graph linking regulations, departments, procedures, decisions, and document references |
| **GraphRAG** | Graph traversal for cross-referencing related regulations and council decisions |
| **Explainability** | Full inference metadata — provider, model, prompt version, strategy, timing, source counts |
| **Evaluation** | Automated grounding, faithfulness, and hallucination scoring on every answer |
| **Workflow Engine** | Configurable multi-step processes for document review and approval |
| **On-Premise Deployment** | All infrastructure runs locally — suitable for municipal data governance requirements |
| **Audit Trail** | Immutable audit log with correlation IDs — supports compliance and transparency obligations |
| **Graceful Degradation** | Every external dependency is optional — starts with only PostgreSQL |

---

## Documentation

| Book | Audience | Purpose |
|------|----------|---------|
| [Architecture Handbook](docs/Enterprise-AI-Platform-Architecture-Handbook.pdf) | Architects, Staff Engineers | Design philosophy, architecture, trade-offs |
| [Architecture & Engineering Handbook](docs/Enterprise-AI-Platform-Architecture-and-Engineering-Handbook.pdf) | Senior Engineers | Complete technical reference with diagrams |
| [Architecture Decision Records](docs/Enterprise-AI-Platform-Architecture-Decision-Records.pdf) | Architects | Permanent record of every major engineering decision |
| [Developer Guide](docs/Enterprise-AI-Platform-Developer-Guide.pdf) | Developers, Contributors | Build, run, extend, test, debug, contribute |

---

## Testing

```bash
mvn verify                    # 176 tests: unit + integration + architecture + contract
mvn verify -Pui-tests         # + Playwright browser tests
```

---

## Requirements

- Java 21
- Maven 3.x
- Docker (for PostgreSQL, Qdrant, Neo4j)
- Ollama (optional — for local LLM inference)

---

## Powered By

This demonstration application is built on the [Enterprise AI Platform](https://github.com/cognitera/enterprise-ai-platform), a reusable foundation for building production-grade AI applications. The platform provides the core AI infrastructure — provider orchestration, hybrid retrieval, knowledge graphs, evaluation, and observability. The Municipal Decision Assistant demonstrates how these capabilities serve municipal administration use cases.

---

## License

**[Apache License 2.0](LICENSE)**

---

> **For SCCON visitors:** Start with the Quick Start above. Upload your municipal documents and explore how AI can support decision-making in your administration.
>
> **For architects:** Start with the [Architecture Handbook](docs/Enterprise-AI-Platform-Architecture-Handbook.pdf). It explains *why* the platform was designed this way.
>
> **For developers:** Start with the [Developer Guide](docs/Enterprise-AI-Platform-Developer-Guide.pdf). It explains *how* to build, run, and extend the application.
