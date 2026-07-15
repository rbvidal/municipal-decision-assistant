# Personas

## 1. Sachbearbeiter (Case Worker)

**Who they are:** The primary user. A municipal employee who processes applications, answers citizen inquiries, verifies regulatory compliance, and prepares decisions. They have 2-20 years of experience in public administration. They know the regulations but may not have every threshold value and procedure memoized.

**Responsibilities:**
- Process 10-30 cases per day across building, procurement, personnel, or general administration
- Answer citizen emails and phone calls
- Verify that applications meet regulatory requirements
- Draft decisions, permits, denials, and information requests
- Consult regulations and precedent cases
- Route decisions to supervisors for approval

**Daily tasks:**
- Open the platform in the morning and see what needs attention today
- Process applications in order of urgency
- Search for relevant regulations when handling unfamiliar case types
- Use AI to summarize long documents or generate draft responses
- Upload new regulations or circulars received from higher authorities
- Check whether similar cases exist in the archive

**Frustrations:**
- "I know this rule exists but I cannot find which document it is in."
- "I have to check five different PDFs to answer one citizen question."
- "The threshold for direct procurement changed last year — is my table current?"
- "I spend more time searching than deciding."
- "I am never sure if I missed a relevant regulation."

**AI assistance expectations:**
- Summarize long regulatory texts in plain German
- Find all regulations relevant to a specific case
- Draft routine replies that can be reviewed and edited
- Flag missing information or contradictions
- Never fabricate — every claim must cite a source

---

## 2. Supervisor (Sachgebietsleiter)

**Who they are:** A senior employee who reviews and approves decisions made by Sachbearbeiter. They have 15-30 years of experience. They are legally responsible for the decisions their team makes.

**Responsibilities:**
- Review draft decisions for legal correctness and completeness
- Approve, return for revision, or reject cases
- Manage team workload and deadlines
- Handle escalated or politically sensitive cases
- Ensure consistent application of regulations across the team

**Daily tasks:**
- Check the approval queue for pending decisions
- Review AI-generated summaries of complex cases before reading full documents
- Compare a draft decision against the original application and relevant regulations
- Monitor team workload and reallocate cases if needed
- Check that new regulations have been incorporated into the knowledge base

**Frustrations:**
- "The draft decision looks correct but I still need to verify every citation manually."
- "I cannot see which cases are overdue at a glance."
- "Different Sachbearbeiter handle the same situation differently."

**AI assistance expectations:**
- Highlight changes between application and draft decision
- Flag decisions that deviate from typical outcomes
- Suggest relevant precedent from archived cases
- Summarize the key points of a 50-page case in one paragraph

---

## 3. Department Administrator (Fachbereichsleiter)

**Who they are:** Manages a department (Bauamt, Vergabestelle, Personalamt). Responsible for the regulatory knowledge base, document lifecycle, and workspace configuration.

**Responsibilities:**
- Upload and maintain the department's regulatory document collection
- Ensure documents are current, indexed, and searchable
- Configure department workspaces with the correct document sets
- Monitor that the AI is using the right regulation versions
- Manage user access to department workspaces

**Daily tasks:**
- Upload newly published regulations or circulars
- Check corpus health — are all documents indexed and searchable?
- Review ingestion jobs for failed or stuck processing
- Organize documents by domain, authority, and priority
- Archive superseded regulation versions

**Frustrations:**
- "I uploaded a new circular three days ago — is it searchable yet?"
- "Which documents are missing embeddings?"
- "How do I know if a regulation has been superseded?"

**AI assistance expectations:**
- Flag documents that may be outdated or superseded
- Suggest metadata during upload
- Alert when ingestion or indexing fails

---

## 4. System Administrator (IT-Administrator)

**Who they are:** Municipal IT staff. Manages the platform infrastructure, monitors performance, investigates errors.

**Responsibilities:**
- Ensure the platform is running and responsive
- Monitor Qdrant vector database health
- Investigate failed ingestion jobs
- Run benchmarks to validate retrieval quality
- Manage user accounts and permissions
- Configure AI provider settings (Ollama, embedding models)

**Daily tasks:**
- Check system dashboard for alerts
- Investigate failed document processing jobs
- Reindex documents when embedding models change
- Monitor disk usage, memory, and API latency
- Run retrieval quality benchmarks

**Frustrations:**
- "A user reports missing search results — is it the embedding model or the index?"
- "The corpus health page says 50 documents but Qdrant shows 48 vectors."
- "I need to trace why a specific document is not appearing in search results."

**AI assistance expectations:**
- Diagnose the root cause of indexing gaps
- Suggest remediation actions
- Show end-to-end trace for any document through the ingestion pipeline
