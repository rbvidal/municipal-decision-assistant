package com.cognitera.platform.ai.application;

import com.cognitera.platform.ai.api.PromptBuilder;
import com.cognitera.platform.ai.model.*;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.Locale;

/**
 * Builds a German-language prompt that enforces evidence-grounded answers,
 * structured decision package output, and hallucination guard rules.
 */
@Component
public class DefaultPromptBuilder implements PromptBuilder {

    private static final String TEMPLATE_VERSION = "grounded-decision-v6";

    @Override
    public String build(PromptContext context) {
        var sources = context.retrievalContext().sources();
        var authorities = context.retrievalContext().authorityReferences();
        var objectives = context.objectives();
        var hierarchy = context.findingHierarchy();
        var dossier = context.sourceDossier();
        boolean hasInsufficientEvidence = sources.isEmpty()
                || (sources.size() < 2 && dossier != null && dossier.coverageScore() < 0.3);

        StringBuilder prompt = new StringBuilder();
        prompt.append(context.systemInstruction()).append("\n\n");

        // ═══ RETRIEVED EVIDENCE ═══
        appendEvidenceSection(prompt, sources, authorities, hasInsufficientEvidence);

        // ═══ USER QUESTION ═══
        prompt.append("FRAGE:\n").append(context.userQuestion()).append("\n\n");

        // ═══ HALLUCINATION GUARD ═══
        prompt.append("=== HALLUCINATION GUARD (STRENGSTE REGELN) ===\n");
        prompt.append("- Sie durfen NUR die oben aufgefuhrten DOKUMENTE als Quelle verwenden.\n");
        prompt.append("- Sie durfen KEIN eigenes juristisches Wissen einfuhren.\n");
        prompt.append("- Sie durfen KEINE Vorschriften, Paragraphen oder Gesetze erfinden.\n");
        prompt.append("- Sie durfen KEINE verwandten Konzepte einfuhren, die nicht in den Dokumenten stehen.\n");
        prompt.append("- Wenn in den Dokumenten widerspruchliche Informationen stehen, benennen Sie den Widerspruch.\n");
        prompt.append("  Erfinden Sie KEINEN Kompromiss.\n");
        if (hasInsufficientEvidence) {
            prompt.append("- WICHTIG: Die Dokumentenlage reicht fur eine eindeutige Entscheidung NICHT aus.\n");
            prompt.append("  Antworten Sie dann AUSSCHLIESSLICH mit:\n");
            prompt.append("  \"Die vorhandenen Unterlagen reichen fur eine eindeutige Entscheidung nicht aus.\"\n");
            prompt.append("  Nennen Sie konkret, welche Informationen fehlen.\n");
            prompt.append("  Generieren Sie KEINE Spekulation.\n");
        } else {
            prompt.append("- Jede rechtliche Aussage MUSS durch mindestens ein Dokument belegt sein.\n");
            prompt.append("- Jede Empfehlung MUSS auf die einschlagige Vorschrift verweisen.\n");
            prompt.append("- Verwenden Sie wortliche Zitate aus den Dokumenten, wo immer moglich.\n");
            prompt.append("- Fassen Sie zusammen und erklaren Sie — aber NUR auf Basis der Dokumente.\n");
        }
        prompt.append("- Schreiben Sie auf DEUTSCH.\n");
        prompt.append("- Keine Hoflichkeitsfloskeln. Keine Einleitung. Kein Schlusswort.\n\n");

        // ═══ OUTPUT FORMAT: DECISION PACKAGE ═══
        prompt.append("=== AUSGABEFORMAT — STRUKTURIERTES ENTSCHEIDUNGSPAKET ===\n");
        prompt.append("Halten Sie sich GENAU an dieses Format:\n\n");
        prompt.append("ENTSCHEIDUNG\n");
        prompt.append("(Eine kurze, pragnante Empfehlung — ein bis zwei Satze)\n\n");
        prompt.append("KURZBEGRUNDUNG\n");
        prompt.append("(Kurze Erklarung — zwei bis drei Satze, NUR aus den Dokumenten abgeleitet)\n\n");
        prompt.append("RECHTSGRUNDLAGEN\n");
        prompt.append("- [Vorschrift] ([Dokument], [Abschnitt/Paragraph])\n");
        prompt.append("(Jede Rechtsgrundlage mit konkretem Dokument und Abschnitt)\n\n");
        prompt.append("ERFORDERLICHES VERFAHREN\n");
        prompt.append("(Das tatsachlich erforderliche Verfahren — z.B. Direktauftrag, Beschrankte Ausschreibung, Genehmigungsverfahren)\n");
        prompt.append("ODER: Kein spezifisches Verfahren erforderlich.\n\n");
        prompt.append("BENOTIGTE FORMULARE\n");
        prompt.append("- [Formularname]\n");
        prompt.append("(Liste der tatsachlich benotigten Formulare, falls in den Dokumenten genannt)\n");
        prompt.append("ODER: Keine Formulare erforderlich.\n\n");
        prompt.append("BENOTIGTE CHECKLISTEN\n");
        prompt.append("- [Checklistenname]\n");
        prompt.append("ODER: Keine Checkliste erforderlich.\n\n");
        prompt.append("ZUSTANDIGE BEHORDE\n");
        prompt.append("(Die tatsachlich zustandige Behorde, aus den Dokumenten abgeleitet)\n\n");
        prompt.append("NAECHSTER SCHRITT\n");
        prompt.append("(Eine konkrete Handlungsempfehlung)\n\n");
        prompt.append("VERWENDETE DOKUMENTE\n");
        prompt.append("- [Dokumenttitel]\n");
        prompt.append("(Liste aller fur die Entscheidung verwendeten Dokumente)\n\n");

        prompt.append("WICHTIG: Die ENTSCHEIDUNG muss IMMER an erster Stelle stehen.\n");
        prompt.append("Niemals Abschnitte auslassen. Wenn keine Information vorhanden ist, schreiben Sie 'Keine Angabe in den Dokumenten.'\n");
        prompt.append("Niemals freie Langtexte ausserhalb dieser Struktur generieren.\n");
        prompt.append("- End with: Dies ist keine Rechtsberatung.\n");

        return prompt.toString();
    }

    private void appendEvidenceSection(StringBuilder prompt,
                                        List<SourceCitation> sources,
                                        List<AuthorityReference> authorities,
                                        boolean insufficient) {
        prompt.append("=== DOKUMENTE (AUSSCHLIESSLICHE QUELLEN) ===\n");
        if (sources.isEmpty()) {
            prompt.append("KEINE passenden Dokumente gefunden.\n");
            prompt.append("Sie durfen AUSSCHLIESSLICH antworten, dass keine Informationen vorliegen.\n\n");
            return;
        }
        prompt.append("NUR diese Dokumente durfen verwendet werden:\n\n");
        for (int i = 0; i < sources.size(); i++) {
            SourceCitation s = sources.get(i);
            prompt.append("[").append(i + 1).append("] ");
            prompt.append(s.title() != null ? s.title() : "Unbekanntes Dokument");
            if (s.excerpt() != null && !s.excerpt().isBlank()) {
                String excerpt = s.excerpt();
                if (excerpt.length() > 800) excerpt = excerpt.substring(0, 800) + "...";
                prompt.append("\n    Text: ").append(excerpt);
            }
            prompt.append("\n\n");
        }

        if (!authorities.isEmpty()) {
            prompt.append("Zusatzliche Referenzen:\n");
            for (AuthorityReference a : authorities) {
                prompt.append("- ").append(a.referenceId());
                if (a.entryTitle() != null && !a.entryTitle().isEmpty()) {
                    prompt.append(": ").append(a.entryTitle());
                }
                prompt.append("\n");
            }
            prompt.append("\n");
        }
    }

    @Override
    public String templateVersion() {
        return TEMPLATE_VERSION;
    }
}
