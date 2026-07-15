# Municipal Decision Assistant — Application Overview

## What It Is

The Municipal Decision Assistant is an enterprise AI platform built for German public administration. It helps municipal employees (Sachbearbeiter) process administrative work faster by combining deterministic regulation rules, semantic document search, and AI-powered text generation.

The platform does not replace human judgment. It reduces the mechanical effort of finding regulations, cross-referencing documents, and drafting routine text so the employee can focus on the decision itself.

## Who Uses It

**Primary user:** Sachbearbeiter in German municipalities — the desk officers who process building permits, procurement requests, personnel actions, and citizen applications.

**Secondary users:** Supervisors who review and approve decisions. Department administrators who manage document collections. System administrators who monitor infrastructure.

These users work on desktop workstations in municipal offices. They are not software engineers. They are domain experts in public administration law and procedure.

## What It Does

1. **Unterstützt die Fallbearbeitung.** Die Entscheidungsunterstützung analysiert Dokumente, schlägt anwendbare Vorschriften vor und identifiziert fehlende Informationen. Der Sachbearbeiter prüft und entscheidet.

2. **Verwaltet Vorschriften und Dokumente.** Administratoren laden Gesetze, Verordnungen und Erlasse als PDF hoch. Die Plattform extrahiert Text, erstellt Chunks, generiert Embeddings und indiziert alles für die semantische Suche.

3. **Führt durch den Vorgangs-Workflow.** Sachbearbeiter bearbeiten Anträge in definierten Phasen — Posteingang, Prüfung, Entscheidungsunterstützung, Entwurf, Genehmigung, Versand, Archiv.

4. **Überwacht den Dokumentenbestand.** Administratoren sehen auf einen Blick, ob Dokumente korrekt indiziert, mit Embeddings versehen und durchsuchbar sind.

## Design Philosophy

**AI assists, it does not dominate.** The AI suggests; the human decides. Every AI output shows its sources, confidence level, and provenance. The employee always has the final word.

**Reduce cognitive load.** Municipal employees process dozens of cases per day. The interface must surface what matters now and hide what does not. No dashboards full of metrics the user did not ask for.

**Desktop-first, information-dense.** These are not mobile apps. The interface targets 1280-1920px screens with high information density. Tables show 20-50 rows. Cards use available horizontal space. White space is functional, not decorative.

**German public administration, not Silicon Valley.** The visual language conveys reliability, precision, and trust. No neon gradients, no glassmorphism, no startup aesthetic. The platform should feel like a well-designed government form — digital, but familiar.

**Progressive disclosure.** Technical details (chunk IDs, embedding dimensions, vector counts) exist behind "Advanced" toggles. Normal users never see them.

## What This Platform Replaces

Today, many municipal employees work with:
- Paper binders of regulations
- Shared network drives of PDFs
- Email threads asking colleagues "which rule applies here?"
- Word templates copied and pasted
- Mental checklists of procedure steps

The platform digitizes all of this into a single, searchable, AI-assisted workspace.
