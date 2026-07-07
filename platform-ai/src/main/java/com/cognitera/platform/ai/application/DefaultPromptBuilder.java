package com.cognitera.platform.ai.application;

import com.cognitera.platform.ai.api.PromptBuilder;
import com.cognitera.platform.ai.model.*;
import com.cognitera.platform.ai.model.EvidencePackage.Contradiction;
import com.cognitera.platform.ai.model.EvidencePackage.CoverageStatus;
import org.springframework.stereotype.Component;

/**
 * Builds a German-language prompt that enforces evidence-first reasoning.
 *
 * <p>The LLM receives a structured {@link EvidencePackage} with numbered items,
 * extracted numeric data, and contradiction detection. Every answer must:
 * <ul>
 *   <li>Reason ONLY over the provided evidence items</li>
 *   <li>Cite specific documents, paragraphs, and numeric values</li>
 *   <li>Report contradictions instead of inventing compromises</li>
 *   <li>State missing evidence explicitly</li>
 *   <li>Output a structured Decision Package in German</li>
 * </ul>
 */
@Component
public class DefaultPromptBuilder implements PromptBuilder {

    private static final String TEMPLATE_VERSION = "evidence-reasoning-v7";

    @Override
    public String build(PromptContext context) {
        EvidencePackage evidence = context.evidencePackage();
        var objectives = context.objectives();
        boolean insufficient = evidence == null || evidence.isEmpty()
                || evidence.coverageStatus() == CoverageStatus.INSUFFICIENT;

        StringBuilder prompt = new StringBuilder();
        prompt.append(context.systemInstruction()).append("\n\n");

        // ═══════════ EVIDENCE PACKAGE ═══════════
        appendEvidencePackage(prompt, evidence, insufficient);

        // ═══════════ USER QUESTION ═══════════
        prompt.append("FRAGE:\n").append(context.userQuestion()).append("\n\n");

        // ═══════════ REASONING RULES ═══════════
        appendReasoningRules(prompt, evidence, insufficient);

        // ═══════════ OUTPUT FORMAT ═══════════
        appendOutputFormat(prompt);

        return prompt.toString();
    }

    // ──────── EVIDENCE PACKAGE ────────

    private void appendEvidencePackage(StringBuilder prompt, EvidencePackage evidence,
                                        boolean insufficient) {
        prompt.append("=== EVIDENZPAKET (AUSSCHLIESSLICHE GRUNDLAGE) ===\n");
        prompt.append("Sie durfen NUR uber die folgenden Beweisstucke nachdenken.\n");
        prompt.append("JEDE Aussage MUSS durch mindestens ein Beweisstuck belegt sein.\n\n");

        if (evidence == null || evidence.isEmpty()) {
            prompt.append("KEINE Beweisstucke verfugbar.\n");
            prompt.append("Die Wissensbasis enthalt keine ausreichenden Informationen.\n\n");
            prompt.append("WICHTIG: Antworten Sie NICHT aus Ihrem eigenen Wissen.\n");
            prompt.append("Sagen Sie explizit, dass keine Dokumente gefunden wurden.\n\n");
            return;
        }

        // Summary stats
        prompt.append("Dokumente durchsucht: ").append(evidence.totalDocumentsSearched()).append("\n");
        prompt.append("Relevante Vorschriften: ").append(evidence.relevantDocumentsFound()).append("\n");
        prompt.append("Davon ausgewertet: ").append(evidence.documentsUsed()).append("\n");
        prompt.append("Abdeckung: ").append(coverageLabel(evidence.coverageStatus())).append("\n\n");

        if (evidence.hasContradictions()) {
            prompt.append("REGELUNGSKONFLIKTE GEFUNDEN:\n");
            for (Contradiction c : evidence.contradictions()) {
                prompt.append("- ").append(c.description()).append("\n");
                prompt.append("  Dokument A: ").append(String.join("; ", c.documentA())).append("\n");
                prompt.append("  Dokument B: ").append(String.join("; ", c.documentB())).append("\n");
                prompt.append("  Empfehlung: ").append(c.recommendation()).append("\n\n");
            }
            prompt.append("Wenn Sie Konflikte im Antworttext erwähnen:\n");
            prompt.append("- Schreiben Sie 'REGELUNGSKONFLIKT ERKANNT'\n");
            prompt.append("- Listen Sie beide widersprüchlichen Dokumente\n");
            prompt.append("- Empfehlen Sie: 'Manuelle Prüfung erforderlich.'\n");
            prompt.append("- Wählen Sie KEINE Seite aus.\n\n");
        }

        // Individual evidence items
        for (EvidenceItem item : evidence.items()) {
            appendEvidenceItem(prompt, item);
        }
    }

    private void appendEvidenceItem(StringBuilder prompt, EvidenceItem item) {
        prompt.append("── Beweisstück ").append(item.index()).append(" ──\n");
        prompt.append("Dokument: ").append(item.documentTitle()).append("\n");
        prompt.append("Behörde: ").append(item.authority()).append("\n");
        if (item.paragraph() != null && !item.paragraph().isBlank()) {
            prompt.append("Abschnitt: ").append(item.paragraph()).append("\n");
        }
        prompt.append("Relevanter Auszug:\n");
        String excerpt = item.excerpt() != null ? item.excerpt() : "";
        if (excerpt.length() > 1000) excerpt = excerpt.substring(0, 1000) + "...";
        prompt.append("  \"").append(excerpt).append("\"\n");

        prompt.append("Unterstützt: ").append(item.supports()).append("\n");
        prompt.append("Verlässlichkeit: ").append(confidenceLabel(item.confidence())).append("\n");

        // Structured numeric data
        if (item.hasNumericData()) {
            appendNumericData(prompt, item.numericExtraction());
        }

        prompt.append("\n");
    }

    private void appendNumericData(StringBuilder prompt, NumericExtraction n) {
        prompt.append("Extrahierte Zahlenwerte (exakt, NICHT neu berechnen):\n");
        if (!n.moneyValues().isEmpty()) {
            for (var m : n.moneyValues()) {
                prompt.append("  • Geldbetrag: ").append(formatGerman(m.amount()))
                        .append(" ").append(m.currency())
                        .append(" (").append(m.label()).append(")\n");
            }
        }
        if (!n.percentages().isEmpty()) {
            for (var p : n.percentages()) {
                prompt.append("  • Prozentsatz: ").append(formatGerman(p.value()))
                        .append("% (").append(p.label()).append(")\n");
            }
        }
        if (!n.salaryGrades().isEmpty()) {
            for (var sg : n.salaryGrades()) {
                prompt.append("  • Entgeltgruppe: ").append(sg.grade());
                if (sg.step() > 0) prompt.append(" Stufe ").append(sg.step());
                if (sg.amount() > 0)
                    prompt.append(" = ").append(formatGerman(sg.amount())).append(" ").append(sg.currency());
                if (sg.effectiveDate() != null) prompt.append(" gültig ab ").append(sg.effectiveDate());
                prompt.append("\n");
            }
        }
        if (!n.thresholds().isEmpty()) {
            for (var t : n.thresholds()) {
                prompt.append("  • Grenzwert: ").append(formatGerman(t.amount()))
                        .append(" ").append(t.currency())
                        .append(" (").append(t.label()).append(")\n");
            }
        }
        if (!n.dates().isEmpty()) {
            for (var d : n.dates()) {
                prompt.append("  • Datum: ").append(d.displayDate())
                        .append(" (").append(d.label()).append(")\n");
            }
        }
    }

    // ──────── REASONING RULES ────────

    private void appendReasoningRules(StringBuilder prompt, EvidencePackage evidence,
                                       boolean insufficient) {
        prompt.append("=== BEGRÜNDUNGSREGELN (STRENGSTE VORGABEN) ===\n");
        prompt.append("1. Denken Sie NUR über die oben aufgeführten Beweisstücke nach.\n");
        prompt.append("2. Führen Sie KEIN eigenes Wissen ein — auch nicht, wenn Sie es zu kennen glauben.\n");
        prompt.append("3. Erfinden Sie KEINE Vorschriften, Paragraphen, Beträge oder Daten.\n");
        prompt.append("4. Zitieren Sie wörtlich aus den Beweisstücken, wo immer möglich.\n");
        prompt.append("5. Verwenden Sie die extrahierten Zahlenwerte DIREKT — berechnen Sie nichts neu.\n");
        prompt.append("6. Nennen Sie bei jedem Fakt das konkrete Dokument und den Abschnitt.\n");

        if (insufficient) {
            prompt.append("\nWICHTIG — UNZUREICHENDE EVIDENZ:\n");
            prompt.append("Die Beweislage reicht NICHT aus. Antworten Sie:\n");
            prompt.append("\"Die Wissensbasis enthält derzeit keine ausreichenden Informationen ");
            prompt.append("für diese Fragestellung.\"\n");
            prompt.append("Nennen Sie konkret, welche Dokumente fehlen.\n");
            prompt.append("Schlagen Sie vor: \"Bitte folgende Dokumente ergänzen: ...\"\n");
        } else {
            prompt.append("7. Wenn Beweisstücke sich widersprechen: Konflikt benennen, KEINE Seite wählen.\n");
            prompt.append("8. Numerische Werte aus den extrahierten Daten verwenden, nicht selbst rechnen.\n");

            if (evidence != null && evidence.coverageStatus() == CoverageStatus.PARTIAL) {
                prompt.append("9. HINWEIS: Die Beweislage ist teilweise. Kennzeichnen Sie Unsicherheiten.\n");
            }
        }

        prompt.append("\nSchreiben Sie auf DEUTSCH.\n");
        prompt.append("Verwenden Sie die Sprache einer deutschen Kommunalverwaltung.\n");
        prompt.append("Keine Höflichkeitsfloskeln. Keine Einleitung. Kein Schlusswort.\n\n");
    }

    // ──────── OUTPUT FORMAT ────────

    private void appendOutputFormat(StringBuilder prompt) {
        prompt.append("=== AUSGABEFORMAT — STRUKTURIERTES ENTSCHEIDUNGSPAKET ===\n");
        prompt.append("Halten Sie sich GENAU an dieses Format:\n\n");

        prompt.append("KURZANTWORT\n");
        prompt.append("(Eine prägnante Antwort — maximal zwei Sätze. Die wichtigste Information zuerst.)\n\n");

        prompt.append("ENTSCHEIDUNG\n");
        prompt.append("(Konkrete Empfehlung — ein bis zwei Sätze)\n\n");

        prompt.append("BEGRÜNDUNG\n");
        prompt.append("(Begründung NUR aus den Beweisstücken, mit Dokument- und Abschnittszitaten)\n\n");

        prompt.append("RECHTSGRUNDLAGEN\n");
        prompt.append("- [Dokument], [Abschnitt/Paragraph] — [kurze Beschreibung]\n\n");

        prompt.append("ERFORDERLICHES VERFAHREN\n");
        prompt.append("(Konkret benanntes Verfahren, z.B. Direktauftrag, Beschränkte Ausschreibung, Baugenehmigungsverfahren)\n");
        prompt.append("ODER: Für diese Auskunft ist kein Verwaltungsverfahren erforderlich.\n\n");

        prompt.append("BENÖTIGTE FORMULARE\n");
        prompt.append("- [Formularname]\n");
        prompt.append("ODER: Für diesen Vorgang sind keine Formulare erforderlich.\n\n");

        prompt.append("BENÖTIGTE CHECKLISTEN\n");
        prompt.append("- [Checklistenname]\n");
        prompt.append("ODER: Für diesen Vorgang ist keine Checkliste erforderlich.\n\n");

        prompt.append("ZUSTÄNDIGE BEHÖRDE\n");
        prompt.append("(Die tatsächlich zuständige Behörde)\n\n");

        prompt.append("NÄCHSTER SCHRITT\n");
        prompt.append("(Eine konkrete Handlungsempfehlung für den Sachbearbeiter)\n\n");

        prompt.append("VERWENDETE DOKUMENTE\n");
        prompt.append("- [Dokumenttitel]\n\n");

        prompt.append("WICHTIG: KURZANTWORT und ENTSCHEIDUNG müssen IMMER an erster Stelle stehen.\n");
        prompt.append("Niemals Abschnitte auslassen.\n");
        prompt.append("Bei fehlenden Informationen schreiben Sie:\n");
        prompt.append("  'Die Wissensbasis enthält derzeit keine ausreichenden Informationen.'\n");
        prompt.append("Niemals: 'Keine Angabe.'\n");
        prompt.append("Ende mit: Dies ist keine Rechtsberatung.\n");
    }

    // ──────── FORMATTING HELPERS ────────

    private static String formatGerman(double value) {
        return String.format(java.util.Locale.GERMANY, "%,.2f", value)
                .replaceAll(",00$", "").replaceAll("\\.00$", "");
    }

    private static String confidenceLabel(double score) {
        if (score >= 0.85) return "Sehr hoch (✓✓✓)";
        if (score >= 0.70) return "Hoch (✓✓)";
        if (score >= 0.50) return "Mittel (✓)";
        return "Niedrig";
    }

    private static String coverageLabel(CoverageStatus status) {
        return switch (status) {
            case SUFFICIENT -> "Ausreichend";
            case PARTIAL -> "Teilweise";
            case INSUFFICIENT -> "Unzureichend";
        };
    }

    @Override
    public String templateVersion() {
        return TEMPLATE_VERSION;
    }
}
