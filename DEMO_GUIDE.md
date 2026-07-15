# SCCON Demonstration Guide — Municipal Decision Assistant

**Smart Country Convention 2025 · Berlin**
**Duration:** 5 minutes
**Audience:** CIOs, Digital Transformation Managers, Public Administration Directors

---

## Pre-Demo Checklist

- [ ] Docker containers running: `docker compose up -d`
- [ ] Ollama running with model: `ollama pull qwen2.5:14b`
- [ ] Application started: `mvn spring-boot:run -pl platform-api`
- [ ] Demo data seeded (happens automatically on first startup — 3 workspaces, 20 documents)
- [ ] Browser open at `http://localhost:8080`
- [ ] Screen resolution: 1920×1080 or higher
- [ ] Browser zoom: 100%

---

## Five-Minute Demo Script

### Minute 1: Landing Page Impression (0:00–1:00)

**Show the landing page.**

> "This is the Municipal Decision Assistant — an AI-powered knowledge platform for Berlin public administration. It ingests regulations, procedures, forms, and manuals, then lets you ask questions in natural language and get grounded answers with source citations."

**Point to the three domain cards.**

> "Three domains are pre-loaded: Building and Urban Planning, Public Procurement, and Human Resources. Each domain contains actual Berlin and federal regulations."

**Click "Building & Urban Planning."**

---

### Minute 2: First Query — The Building Permit (1:00–2:00)

**The AI page loads with example questions.**

> "Notice the suggested questions — employees never need to guess what to ask. One click executes the query."

**Click: "Welches Baugenehmigungsverfahren gilt für ein Einfamilienhaus in Berlin?"**

**Wait for answer. Point out:**

> "The AI searched 20+ documents, retrieved relevant passages from the Berlin Building Code and the new Building Documents Ordinance 2025, and generated a grounded answer. Confidence: shown as a percentage. Strategy: hybrid keyword plus semantic search. Processing time in milliseconds."

**Point to sources:**

> "Every claim is backed by a source. Click any source to open the original document with the relevant passage highlighted."

**Click a source to open the document preview.**

---

### Minute 3: The Document Preview (2:00–2:30)

**Document opens with highlighted chunk.**

> "This is the original regulation text. The platform doesn't just show a summary — it shows the exact paragraph that answers the question. Below the answer, you see related procedures, related forms, and related checklists."

**Point to related documents in the sidebar.**

---

### Minute 4: Switch Domains — Procurement (2:30–3:30)

**Click the browser back button or navigate to the landing page, then click "Public Procurement."**

> "Let me switch to a completely different domain — procurement."

**Click: "Kann ich einen IT-Auftrag über 18.000 Euro freihändig vergeben?"**

**While waiting:**

> "This is the most common type of question in municipal procurement. Employees need to know: what's the right procedure for this budget?"

**Answer appears:**

> "The AI found the Berlin administrative regulation to Section 55 LHO. It identifies the correct value thresholds: for supplies and services up to 10,000 euros it's a direct award; up to 100,000 euros, a restricted tender. At 18,000 euros, a negotiated award with competition is the correct procedure."

**Point to sources and explainability chips.**

> "Notice the platform shows: retrieval strategy, number of documents searched, processing time. This is the explainability that public administration requires — you can see exactly how the AI arrived at its answer."

---

### Minute 5: The Cross-Domain Question (3:30–4:15)

**Navigate to HR workspace.**

> "One more domain — Human Resources."

**Click: "Wie hoch ist das Tagegeld bei einer dreitägigen Dienstreise nach Brüssel?"**

> "The AI correctly identifies that this requires both the Federal Travel Expense Act (BRKG) for international per diem rates, and the Berlin State Travel Expense Act (LRKG) for procedural requirements. It provides the specific Brussels rate — 47 euros per day — and notes the 6-month claim deadline."

---

### Closing (4:15–5:00)

**Return to landing page.**

> "Three domains, twenty documents, AI-grounded answers with full explainability — all running on local infrastructure. No data leaves this server."

**Key closing points:**

> "Three things make this different from ChatGPT or generic AI:
> 1. **Grounded in official sources** — every answer cites the exact regulation and paragraph.
> 2. **On-premise** — all data stays on municipal infrastructure. No cloud dependency.
> 3. **Explainable** — you can see why the AI gave this answer and which documents it used."

> "The platform is built on the open-source Enterprise AI Platform. It's available today. Thank you — I'm happy to answer questions."

---

## Backup Demos (if time allows)

### Backup 1: The Type Approval (NEW 2025)
Navigate to Building workspace. Ask: "Was ist eine Typengenehmigung und wer ist dafür zuständig?"
Shows the brand-new BauVorlV 2025 content about the Type Approval procedure.

### Backup 2: EU-Bekanntmachung vergessen
Navigate to Procurement. Ask: "Wir haben einen 230.000 Euro Auftrag ohne EU-Bekanntmachung vergeben. Welche Konsequenzen drohen?"
Shows the GWB Section 135 consequences — contracts are voidable, 30-day notice period.

### Backup 3: IT-Sicherheitsvorfall
Navigate to HR. Ask: "Ich habe auf einen Phishing-Link geklickt. Was muss ich jetzt tun?"
Shows the step-by-step incident response from the IT security policy.

---

## Troubleshooting

| Issue | Solution |
|-------|----------|
| No answers returned | Check Ollama is running: `ollama ps` |
| Pages look unstyled | Reload browser; check Bootstrap CDN is reachable |
| Demo data not seeded | Check `workspaceRepo.count() > 0` — delete DB rows or drop and recreate DB |
| Build fails | `mvn clean compile -DskipTests` then restart |
| UI looks wrong | Check browser is at 100% zoom, 1920×1080 |
