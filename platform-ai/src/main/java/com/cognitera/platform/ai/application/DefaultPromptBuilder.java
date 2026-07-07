package com.cognitera.platform.ai.application;

import com.cognitera.platform.ai.api.PromptBuilder;
import com.cognitera.platform.ai.model.*;
import org.springframework.stereotype.Component;

/**
 * Builds a compact German-language prompt with strict evidence-first reasoning.
 *
 * <p>Design principles:
 * <ul>
 *   <li>Max 3-4 unique document sources in the prompt</li>
 *   <li>Each document contributes only its most relevant excerpt (max 500 chars)</li>
 *   <li>No duplicate evidence — grouped by document</li>
 *   <li>Target: under 4,000 characters total</li>
 *   <li>LLM explains results; deterministic rules handle calculations</li>
 * </ul>
 */
@Component
public class DefaultPromptBuilder implements PromptBuilder {

    private static final String TEMPLATE_VERSION = "compact-v8";

    @Override
    public String build(PromptContext context) {
        EvidencePackage evidence = context.evidencePackage();
        boolean insufficient = evidence == null || evidence.isEmpty();

        StringBuilder prompt = new StringBuilder();
        prompt.append("Sie sind ein Verwaltungsassistent. Antworten Sie NUR mit den bereitgestellten Beweisstücken. Kein eigenes Wissen.\n\n");

        // ═══ EVIDENCE (compact) ═══
        if (insufficient) {
            prompt.append("KEINE DOKUMENTE GEFUNDEN.\n");
            prompt.append("Antwort: Die Wissensbasis enthält keine ausreichenden Informationen. Bitte folgende Dokumente ergänzen: [konkret benennen].\n\n");
        } else {
            prompt.append("BEWEISSTÜCKE (ausschließliche Quelle):\n");
            for (EvidenceItem item : evidence.items()) {
                prompt.append("── ").append(item.index()).append(". ")
                      .append(item.documentTitle()).append(" ──\n");
                prompt.append("Behörde: ").append(item.authority()).append("\n");
                prompt.append("Abschnitte: ").append(item.paragraph()).append("\n");
                String excerpt = item.excerpt();
                if (excerpt.length() > 500) excerpt = excerpt.substring(0, 500) + "...";
                prompt.append("Text: \"").append(excerpt).append("\"\n");

                if (item.hasNumericData()) {
                    prompt.append("Zahlenwerte (exakt verwenden): ");
                    appendNumericCompact(prompt, item.numericExtraction());
                }
                prompt.append("Unterstützt: ").append(item.supports()).append("\n\n");
            }
        }

        // ═══ RULES ═══
        prompt.append("REGELN:\n");
        prompt.append("- Nur Beweisstücke verwenden. Keine eigenen Vorschriften erfinden.\n");
        prompt.append("- Extrahierte Zahlenwerte direkt zitieren, nicht neu berechnen.\n");
        prompt.append("- Bei Widersprüchen: Konflikt benennen, nicht auflösen.\n");
        prompt.append("- Bei fehlenden Informationen: Das klar sagen, nicht erfinden.\n");
        prompt.append("- Sprache: deutsche Kommunalverwaltung. Keine Floskeln.\n\n");

        // ═══ QUESTION ═══
        prompt.append("FRAGE: ").append(context.userQuestion()).append("\n\n");

        // ═══ OUTPUT FORMAT (compact) ═══
        prompt.append("ANTWORTFORMAT:\n");
        prompt.append("KURZANTWORT\n(Ein Satz)\n\n");
        prompt.append("ENTSCHEIDUNG\n(Empfehlung, 1-2 Sätze)\n\n");
        prompt.append("RECHTSGRUNDLAGE\n- [Dokument], [Abschnitt]\n\n");
        prompt.append("VERFAHREN\n(Konkretes Verfahren oder: Kein Verfahren erforderlich)\n\n");
        prompt.append("NÄCHSTER SCHRITT\n(Eine konkrete Handlung)\n\n");
        prompt.append("KURZANTWORT und ENTSCHEIDUNG zuerst. Dies ist keine Rechtsberatung.\n");

        return prompt.toString();
    }

    private void appendNumericCompact(StringBuilder sb, NumericExtraction n) {
        if (!n.salaryGrades().isEmpty()) {
            for (var sg : n.salaryGrades()) {
                if (sg.amount() > 0)
                    sb.append(sg.grade()).append("=").append(formatMoney(sg.amount())).append("€ ");
                else
                    sb.append(sg.grade()).append(" ");
            }
        }
        if (!n.moneyValues().isEmpty()) {
            for (var m : n.moneyValues())
                sb.append(m.label()).append("=").append(formatMoney(m.amount())).append("€ ");
        }
        if (!n.thresholds().isEmpty()) {
            for (var t : n.thresholds())
                sb.append("Grenze:").append(formatMoney(t.amount())).append("€ ");
        }
        if (!n.percentages().isEmpty()) {
            for (var p : n.percentages())
                sb.append(p.value()).append("% ");
        }
        sb.append("\n");
    }

    private String formatMoney(double amount) {
        if (amount == (long) amount) return String.format(java.util.Locale.US, "%.0f", amount);
        return String.format(java.util.Locale.US, "%.2f", amount);
    }

    @Override
    public String templateVersion() {
        return TEMPLATE_VERSION;
    }
}
