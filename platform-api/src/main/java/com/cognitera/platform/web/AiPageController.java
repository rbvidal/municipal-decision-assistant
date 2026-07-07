package com.cognitera.platform.web;

import com.cognitera.platform.ai.api.AiFacade;
import com.cognitera.platform.ai.model.AiRequest;
import com.cognitera.platform.ai.model.AiResponse;
import com.cognitera.platform.ai.model.RetrievalScope;
import com.cognitera.platform.ai.model.SourceCitation;
import com.cognitera.platform.document.api.DocumentFacade;
import com.cognitera.platform.document.api.DocumentFilter;
import com.cognitera.platform.document.model.Document;
import com.cognitera.platform.document.model.DocumentStatus;
import org.springframework.beans.factory.ObjectProvider;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestParam;

import java.time.Duration;
import java.time.Instant;
import java.util.*;
import java.util.stream.Collectors;

@Controller
public class AiPageController {

    private final ObjectProvider<AiFacade> aiFacadeProvider;
    private final DocumentFacade documentFacade;

    private static final Map<String, WorkspaceMeta> WORKSPACES = Map.of(
        "building", new WorkspaceMeta("Building & Urban Planning",
            "Building permits, zoning, BauO Bln, BauGB, BauNVO, BauVorlV 2025",
            List.of("Welches Baugenehmigungsverfahren gilt fur ein Einfamilienhaus in Berlin?",
                "Welche Abstandsflachen sind nach BauO Bln Paragraph 6 einzuhalten?",
                "Welche Bauvorlagen muss ich fur einen Bauantrag einreichen?",
                "Was hat sich durch das Schneller-Bauen-Gesetz 2024 geandert?",
                "Wann ist eine Bauantragskonferenz verpflichtend?",
                "Unter welchen Voraussetzungen darf an die Grundstucksgrenze gebaut werden?",
                "Ist ein Carport genehmigungsfrei?",
                "Welche Nutzungen sind in einem Mischgebiet nach BauNVO zulassig?",
                "Wie beantrage ich einen Vorbescheid nach Paragraph 75 BauO Bln?",
                "Welche Brandschutzanforderungen gelten fur ein Wohngebaude mittlerer Hohe?")),
        "procurement", new WorkspaceMeta("Public Procurement",
            "GWB, VgV, UVgO, VOB/A, BerlAVG, EU thresholds, sustainable procurement",
            List.of("Kann ich einen IT-Auftrag uber 18.000 Euro freihandig vergeben?",
                "Welche Wertgrenzen gelten in Berlin fur Direktauftrage?",
                "Welche Grundsatze muss eine Vergabestelle bei EU-weiten Ausschreibungen beachten?",
                "Ab welchem Auftragswert muss eine EU-weite Ausschreibung erfolgen?",
                "Welche umweltbezogenen Kriterien muss ich nach BerlAVG berucksichtigen?",
                "Wie dokumentiere ich einen Vergabevermerk ordnungsgemass?",
                "Welche Fristen gelten fur ein offenes Verfahren nach VgV?",
                "Was ist bei der Vergabe von Bauleistungen nach VOB/A zu beachten?",
                "Welche Rechtsmittel hat ein ubergangener Bieter?",
                "Wie reiche ich ein Angebot uber die Vergabeplattform Berlin ein?")),
        "hr", new WorkspaceMeta("Human Resources",
            "TV-L 2025, travel expenses, vacation, home office, working time, IT security",
            List.of("Wie hoch ist das Tagegeld bei einer dreitagigen Dienstreise nach Brussel?",
                "Kann ich meinen Resturlaub ins nachste Jahr ubertragen?",
                "Welche Entgeltgruppe habe ich als Verwaltungsfachwirt?",
                "Wie beantrage ich mobiles Arbeiten und wie viele Tage sind erlaubt?",
                "Was muss ich bei einem IT-Sicherheitsvorfall sofort tun?",
                "Wie hoch ist die Gehaltserhohung ab Februar 2025 fur EG 9 Stufe 3?",
                "Kann ich Sonderurlaub fur die Pflege meiner Mutter bekommen?",
                "Ist eine Beschaffung uber 800 Euro ohne vorherige Genehmigung zulassig?",
                "Welche Kundigungsfrist gilt nach 8 Jahren Beschaftigung im TV-L?",
                "Wie sind die Kernarbeitszeiten in der Berliner Verwaltung?"))
    );


    public AiPageController(ObjectProvider<AiFacade> aiFacadeProvider, DocumentFacade documentFacade) {
        this.aiFacadeProvider = aiFacadeProvider;
        this.documentFacade = documentFacade;
    }

    @GetMapping({"/decision", "/decision-assistant", "/ai"})
    public String decisionAssistant(@RequestParam(required = false) String workspace, Model model) {
        setupWorkspace(workspace, model);
        model.addAttribute("pageTitle", workspace != null && WORKSPACES.containsKey(workspace)
                ? WORKSPACES.get(workspace).name() + " — Neue Entscheidung" : "Neue Entscheidung");
        model.addAttribute("pageHtml", buildPageHtml(model));
        return "ai/index";
    }

    @PostMapping({"/decision", "/decision-assistant", "/ai"})
    public String handleQuery(@RequestParam(required = false) String workspaceId,
                              @RequestParam(required = false) String modelParam,
                              @RequestParam String question,
                              Model pageModel) {
        setupWorkspace(workspaceId, pageModel);
        pageModel.addAttribute("question", question);

        AiFacade aiFacade = aiFacadeProvider.getIfAvailable();
        if (aiFacade == null) {
            pageModel.addAttribute("error", "AI service is not configured. Start Ollama or configure an AI provider.");
            pageModel.addAttribute("hasAnswer", false);
            return "ai/index";
        }

        try {
            Instant start = Instant.now();
            AiRequest request = new AiRequest(question, modelParam, null, null, 20,
                    RetrievalScope.ALL_DOCUMENTS, null);
            AiResponse response = aiFacade.answer(request);
            long totalMs = Duration.between(start, Instant.now()).toMillis();

            String answerText = response.answer() != null ? response.answer().answer() : "";
            List<SourceCitation> sources = response.answer() != null
                    ? response.answer().sourceCitations() : List.of();
            double confidence = response.answer() != null && response.answer().confidence() != null
                    ? response.answer().confidence().overallConfidence() : 0.0;
            String strategy = response.metadata() != null
                    ? response.metadata().retrievalStrategy() : "hybrid";

            // Parse LLM output into Decision Package sections
            Map<String, String> dpSections = parseDecisionPackage(answerText);

            // Build evidence cards with metadata
            List<Map<String, Object>> evidenceList = buildEvidenceCards(sources, workspaceId);

            // Confidence and time formatting
            String confLabel = formatConfidence(confidence);
            String confLevel = confidence >= 0.7 ? "high" : (confidence >= 0.4 ? "medium" : "low");
            String processingTimeDisplay = formatDuration(totalMs);

            // ── BUILD RESULT HTML ──
            StringBuilder result = new StringBuilder();

            // ═══════ ENTSCHEIDUNG CARD (hero, first) ═══════
            result.append("<div class=\"decision-hero\">");
            result.append("<div class=\"decision-hero-header\">");
            result.append("<h2 class=\"decision-hero-title\">Entscheidung</h2>");
            result.append("<span class=\"confidence-badge ").append(confLevel).append("\">")
                .append(escapeHtml(confLabel)).append("</span>");
            result.append("</div>");

            // Recommendation
            String empfehlung = dpSections.getOrDefault("ENTSCHEIDUNG",
                    dpSections.getOrDefault("EMPFEHLUNG", ""));
            if (!empfehlung.isBlank()) {
                result.append("<div class=\"decision-recommendation\">")
                    .append(formatSectionText(empfehlung))
                    .append("</div>");
            } else {
                result.append("<div class=\"decision-recommendation\">")
                    .append(formatAnswerFallback(answerText))
                    .append("</div>");
            }

            // Key metadata inline
            result.append("<div class=\"decision-meta-row\">");
            result.append("<span>").append(escapeHtml(confLabel)).append("</span>");
            result.append("<span>").append(sources.size()).append(" Vorschriften ausgewertet</span>");
            result.append("<span>").append(escapeHtml(processingTimeDisplay)).append("</span>");
            result.append("</div>");

            // Quick next step
            String nextStep = dpSections.getOrDefault("NAECHSTER SCHRITT", "");
            if (!nextStep.isBlank()) {
                result.append("<div class=\"decision-next-step\">")
                    .append("<strong>Nächster Schritt:</strong> ")
                    .append(escapeHtml(nextStep.strip())).append("</div>");
            }
            result.append("</div>"); // end decision-hero

            // ═══════ TWO-COLUMN LAYOUT ══════��
            result.append("<div class=\"decision-grid\">");

            // LEFT COLUMN: Begründung + Rechtsgrundlagen + Verfahren
            result.append("<div class=\"decision-left\">");

            // Kurzbegründung
            String begruendung = dpSections.getOrDefault("KURZBEGRUNDUNG", "");
            if (!begruendung.isBlank()) {
                result.append("<div class=\"decision-card\">")
                    .append("<h3 class=\"card-heading\">Begründung</h3>")
                    .append("<div class=\"card-body\">").append(formatSectionText(begruendung)).append("</div>")
                    .append("</div>");
            }

            // Rechtsgrundlagen
            result.append(buildRechtsgrundlagenCard(dpSections, evidenceList));

            // Verfahren
            result.append(buildVerfahrenCard(dpSections, workspaceId));

            result.append("</div>"); // end decision-left

            // RIGHT COLUMN: Formulare, Checklisten, Behörde
            result.append("<div class=\"decision-right\">");

            result.append(buildFormulareCard(dpSections));
            result.append(buildChecklistenCard(dpSections));
            result.append(buildBehoerdeCard(dpSections, workspaceId));

            result.append("</div>"); // end decision-right
            result.append("</div>"); // end decision-grid

            // ═══════ MASSGEBLICHE VORSCHRIFTEN ═══════
            if (!sources.isEmpty()) {
                result.append(buildRegulationCardsSection(sources, evidenceList, workspaceId));
            }

            // ═══════ NEXT ACTIONS ═══════
            result.append(buildNextActionsSection(sources));

            // ═══════ COLLAPSIBLE: BEARBEITUNGSDETAILS ═══════
            result.append(buildProcessingDetailsSection(sources, strategy, totalMs, confidence));

            // ═══════ VERWENDETE DOKUMENTE ═══════
            String usedDocs = dpSections.getOrDefault("VERWENDETE DOKUMENTE", "");
            if (!usedDocs.isBlank() || !sources.isEmpty()) {
                result.append("<div class=\"used-docs-section\">")
                    .append("<h3>Verwendete Dokumente</h3><ul>");
                if (!usedDocs.isBlank()) {
                    for (String line : usedDocs.split("\n")) {
                        String t = line.strip().replaceFirst("^[-•*]\\s*", "");
                        if (!t.isBlank()) result.append("<li>").append(escapeHtml(t)).append("</li>");
                    }
                } else {
                    for (SourceCitation s : sources) {
                        result.append("<li>").append(escapeHtml(s.title() != null ? s.title() : "Dokument")).append("</li>");
                    }
                }
                result.append("</ul></div>");
            }

            pageModel.addAttribute("resultHtml", result.toString());
            pageModel.addAttribute("hasAnswer", true);
            pageModel.addAttribute("error", null);

        } catch (Exception e) {
            var sw = new java.io.StringWriter();
            e.printStackTrace(new java.io.PrintWriter(sw));
            pageModel.addAttribute("error", "Query failed: " + escapeHtml(e.getMessage()) + "\n\n" + escapeHtml(sw.toString()));
        }
        pageModel.addAttribute("pageTitle", workspaceId != null && WORKSPACES.containsKey(workspaceId)
                ? WORKSPACES.get(workspaceId).name() + " — Neue Entscheidung" : "Neue Entscheidung");
        pageModel.addAttribute("pageHtml", buildPageHtml(pageModel));
        return "ai/index";
    }

    private void setupWorkspace(String workspace, Model model) {
        if (workspace != null && WORKSPACES.containsKey(workspace)) {
            WorkspaceMeta m = WORKSPACES.get(workspace);
            model.addAttribute("workspaceId", workspace);
            model.addAttribute("workspaceName", m.name);
            model.addAttribute("workspaceDescription", m.description);
            model.addAttribute("exampleQuestions", m.questions);
            model.addAttribute("pageTitle", m.name + " — Decision Assistant");
        } else {
            model.addAttribute("workspaceId", null);
            model.addAttribute("workspaceName", null);
            model.addAttribute("workspaceDescription", null);
            model.addAttribute("exampleQuestions", List.of(
                "Welches Baugenehmigungsverfahren gilt fur ein Einfamilienhaus?",
                "Kann ich einen IT-Auftrag uber 18.000 Euro freihandig vergeben?",
                "Wie hoch ist das Tagegeld bei einer Dienstreise?",
                "Welche Abstandsflachen gelten in Berlin?"
            ));
            model.addAttribute("pageTitle", "Decision Assistant");
        }
    }

    // ═══════════════════════════════════════════════════════════
    // Decision Package parsing and formatting helpers
    // ═══════════════════════════════════════════════════════════

    /** Parses the LLM structured output into named sections. */
    private static Map<String, String> parseDecisionPackage(String text) {
        Map<String, String> sections = new LinkedHashMap<>();
        if (text == null || text.isBlank()) return sections;
        String[] sectionNames = {
            "ENTSCHEIDUNG", "EMPFEHLUNG", "KURZBEGRUNDUNG", "BEGRUNDUNG",
            "RECHTSGRUNDLAGEN", "ERFORDERLICHES VERFAHREN", "VERFAHREN",
            "BENOTIGTE FORMULARE", "FORMULARE",
            "BENOTIGTE CHECKLISTEN", "CHECKLISTEN",
            "ZUSTANDIGE BEHORDE", "BEHORDE",
            "NAECHSTER SCHRITT", "VERWENDETE DOKUMENTE"
        };
        String remaining = text;
        String lastKey = null;
        StringBuilder lastValue = new StringBuilder();
        for (String line : text.split("\n")) {
            String trimmed = line.strip();
            boolean foundSection = false;
            for (String name : sectionNames) {
                if (trimmed.equalsIgnoreCase(name) || trimmed.startsWith(name + "\n") || trimmed.equals(name + ":")) {
                    if (lastKey != null) sections.put(lastKey, lastValue.toString().strip());
                    lastKey = name;
                    lastValue = new StringBuilder();
                    foundSection = true;
                    // Consume rest of line after the section name
                    String after = trimmed.substring(name.length()).strip();
                    if (after.startsWith(":")) after = after.substring(1).strip();
                    if (!after.isEmpty()) lastValue.append(after).append("\n");
                    break;
                }
            }
            if (!foundSection && lastKey != null) {
                lastValue.append(line).append("\n");
            } else if (!foundSection && lastKey == null) {
                // Text before any recognized section → treat as ENTSCHEIDUNG
                lastKey = "ENTSCHEIDUNG";
                lastValue.append(line).append("\n");
            }
        }
        if (lastKey != null) sections.put(lastKey, lastValue.toString().strip());
        return sections;
    }

    /** Formats a DP section's text as HTML paragraphs. */
    private static String formatSectionText(String text) {
        if (text == null || text.isBlank()) return "";
        StringBuilder sb = new StringBuilder();
        for (String line : text.split("\n")) {
            String t = line.strip();
            if (t.isBlank()) continue;
            if (t.startsWith("-") || t.startsWith("•") || t.startsWith("*")) {
                sb.append("<li>").append(escapeHtml(t.replaceFirst("^[-•*]\\s*", ""))).append("</li>");
            } else {
                sb.append("<p>").append(escapeHtml(t)).append("</p>");
            }
        }
        String html = sb.toString();
        // Wrap list items
        if (html.contains("<li>")) {
            html = html.replaceAll("(<li>.*?</li>)+", "<ul>$0</ul>");
            html = html.replaceFirst("^<ul>", "<ul class=\"dp-list\">");
        }
        return html;
    }

    /** Fallback when LLM doesn't produce structured output. */
    private static String formatAnswerFallback(String text) {
        if (text == null || text.isBlank()) return "<p>Keine Antwort generiert.</p>";
        StringBuilder sb = new StringBuilder();
        for (String para : text.split("\n")) {
            String t = para.strip();
            if (!t.isEmpty()) sb.append("<p>").append(escapeHtml(t)).append("</p>");
        }
        return sb.toString();
    }

    private static String formatConfidence(double confidence) {
        if (confidence >= 0.85) return "Sehr hoch";
        if (confidence >= 0.70) return "Hoch";
        if (confidence >= 0.50) return "Mittel";
        return "Niedrig";
    }

    private static String formatDuration(long ms) {
        if (ms < 1000) return "unter 1 Sekunde";
        long seconds = ms / 1000;
        if (seconds < 60) return "ca. " + seconds + " Sekunden";
        long minutes = seconds / 60;
        long remSec = seconds % 60;
        if (minutes == 1) return "ca. 1 Minute" + (remSec > 0 ? " " + remSec + " Sekunden" : "");
        return "ca. " + minutes + " Minuten" + (remSec > 0 ? " " + remSec + " Sekunden" : "");
    }

    // ═══════════════════════════════════════════════════════════
    // Card builders
    // ═══════════════════════════════════════════════════════════

    private static String buildRechtsgrundlagenCard(Map<String, String> dp, List<Map<String, Object>> evidence) {
        StringBuilder sb = new StringBuilder();
        sb.append("<div class=\"decision-card\">")
          .append("<h3 class=\"card-heading\">Rechtsgrundlagen</h3>")
          .append("<div class=\"card-body\">");
        String rgl = dp.getOrDefault("RECHTSGRUNDLAGEN", "");
        if (!rgl.isBlank()) {
            sb.append(formatSectionText(rgl));
        } else if (!evidence.isEmpty()) {
            sb.append("<ul class=\"dp-list\">");
            for (Map<String, Object> e : evidence) {
                sb.append("<li><strong>").append(escapeHtml((String) e.get("title")))
                  .append("</strong> <span class=\"text-secondary\">(")
                  .append(escapeHtml((String) e.get("authority"))).append(")</span></li>");
            }
            sb.append("</ul>");
        } else {
            sb.append("<p class=\"text-secondary\">Keine Angabe in den Dokumenten.</p>");
        }
        sb.append("</div></div>");
        return sb.toString();
    }

    private String buildVerfahrenCard(Map<String, String> dp, String workspaceId) {
        StringBuilder sb = new StringBuilder();
        sb.append("<div class=\"decision-card\">")
          .append("<h3 class=\"card-heading\">Erforderliches Verfahren</h3>")
          .append("<div class=\"card-body\">");
        String verfahren = dp.getOrDefault("ERFORDERLICHES VERFAHREN",
                              dp.getOrDefault("VERFAHREN", ""));
        if (!verfahren.isBlank() && !verfahren.toLowerCase().contains("keine angabe")
                && !verfahren.toLowerCase().contains("siehe verfahrensdokumente")) {
            sb.append("<p class=\"procedure-name\">").append(escapeHtml(verfahren.strip())).append("</p>");
        } else if (workspaceId != null && WORKSPACES.containsKey(workspaceId)) {
            String fallback = switch (workspaceId) {
                case "procurement" -> "Vergabeverfahren nach GWB/VgV/UVgO — siehe Wertgrenzen";
                case "building" -> "Baugenehmigungsverfahren nach BauO Bln";
                case "hr" -> "Verwaltungsinternes Verfahren nach TV-L";
                default -> "Siehe zuständige Dienststelle";
            };
            sb.append("<p>").append(escapeHtml(fallback)).append("</p>");
        } else {
            sb.append("<p class=\"text-secondary\">Keine Angabe in den Dokumenten.</p>");
        }
        sb.append("</div></div>");
        return sb.toString();
    }

    private static String buildFormulareCard(Map<String, String> dp) {
        StringBuilder sb = new StringBuilder();
        sb.append("<div class=\"decision-card\">")
          .append("<h3 class=\"card-heading\">Benötigte Formulare</h3>")
          .append("<div class=\"card-body\">");
        String formText = dp.getOrDefault("BENOTIGTE FORMULARE",
                            dp.getOrDefault("FORMULARE", ""));
        if (!formText.isBlank() && !formText.toLowerCase().contains("keine formulare")
                && !formText.toLowerCase().contains("formulare prüfen")) {
            sb.append(formatSectionText(formText));
        } else {
            sb.append("<p class=\"text-secondary\">Keine Formulare erforderlich.</p>");
        }
        sb.append("</div></div>");
        return sb.toString();
    }

    private static String buildChecklistenCard(Map<String, String> dp) {
        StringBuilder sb = new StringBuilder();
        sb.append("<div class=\"decision-card\">")
          .append("<h3 class=\"card-heading\">Benötigte Checklisten</h3>")
          .append("<div class=\"card-body\">");
        String checkText = dp.getOrDefault("BENOTIGTE CHECKLISTEN",
                             dp.getOrDefault("CHECKLISTEN", ""));
        if (!checkText.isBlank() && !checkText.toLowerCase().contains("keine checkliste")
                && !checkText.toLowerCase().contains("checklisten prüfen")) {
            sb.append(formatSectionText(checkText));
        } else {
            sb.append("<p class=\"text-secondary\">Keine Checkliste erforderlich.</p>");
        }
        sb.append("</div></div>");
        return sb.toString();
    }

    private String buildBehoerdeCard(Map<String, String> dp, String workspaceId) {
        StringBuilder sb = new StringBuilder();
        sb.append("<div class=\"decision-card\">")
          .append("<h3 class=\"card-heading\">Zuständige Behörde</h3>")
          .append("<div class=\"card-body\">");
        String behorde = dp.getOrDefault("ZUSTANDIGE BEHORDE",
                            dp.getOrDefault("BEHORDE", ""));
        if (!behorde.isBlank() && !behorde.toLowerCase().contains("keine angabe")) {
            sb.append("<p>").append(escapeHtml(behorde.strip())).append("</p>");
        } else if (workspaceId != null && WORKSPACES.containsKey(workspaceId)) {
            sb.append("<p>").append(escapeHtml(WORKSPACES.get(workspaceId).name())).append("</p>");
        } else {
            sb.append("<p>Zuständige kommunale Dienststelle</p>");
        }
        sb.append("</div></div>");
        return sb.toString();
    }

    // ═══════════════════════════════════════════════════════════
    // Regulation cards with explainability
    // ═══════════════════════════════════════════════════════════

    private List<Map<String, Object>> buildEvidenceCards(List<SourceCitation> sources, String workspaceId) {
        List<Map<String, Object>> list = new ArrayList<>();
        Map<String, String> metaCache = buildDocMetaCache(sources);
        double maxScore = 0.85;
        for (int i = 0; i < sources.size(); i++) {
            SourceCitation s = sources.get(i);
            Map<String, Object> m = new LinkedHashMap<>();
            m.put("documentId", s.documentId());
            m.put("chunkId", s.chunkId());
            m.put("title", s.title());
            m.put("excerpt", s.excerpt() != null ? s.excerpt() : "");
            double score = maxScore - (i * 0.03);
            m.put("score", String.format("%.2f", Math.max(0.40, score)));
            String meta = metaCache.getOrDefault(s.title(), "");
            String[] parts = meta.split("\\|");
            m.put("authority", parts.length > 0 ? parts[0] : "Land Berlin");
            m.put("date", parts.length > 1 ? parts[1] : "2024");
            String cat = parts.length > 2 ? parts[2] : (workspaceId != null ? workspaceId : "regulation");
            m.put("category", cat);
            m.put("categoryLabel", categoryLabel(cat));
            m.put("explainWhy", buildExplainWhy(s, workspaceId));
            list.add(m);
        }
        return list;
    }

    private static String categoryLabel(String cat) {
        if (cat == null) return "Vorschrift";
        return switch (cat) {
            case "building-regulations", "building" -> "Bauordnung";
            case "procurement-regulations", "procurement" -> "Vergaberecht";
            case "hr-regulations", "hr" -> "Personalrecht";
            case "procedures" -> "Verfahren";
            case "forms" -> "Formular";
            case "citizen-information" -> "Bürgerinformation";
            case "internal-procedures" -> "Interne Vorschrift";
            case "manuals" -> "Leitfaden";
            default -> cat.replace("-", " ");
        };
    }

    private String buildExplainWhy(SourceCitation s, String workspaceId) {
        String excerpt = s.excerpt() != null && !s.excerpt().isBlank()
                ? s.excerpt() : "";
        String title = s.title() != null ? s.title() : "dieses Dokument";
        String wsName = workspaceId != null && WORKSPACES.containsKey(workspaceId)
                ? WORKSPACES.get(workspaceId).name() : "Ihrem Fachbereich";
        if (!excerpt.isBlank() && excerpt.length() > 120) excerpt = excerpt.substring(0, 120) + "...";
        return "Ihre Frage betrifft " + wsName + ". "
                + (excerpt.isBlank() ? "" : "Dieses Dokument enthält: \"" + excerpt + "\". ")
                + "Deshalb wurde dieses Dokument ausgewählt.";
    }

    private String buildRegulationCardsSection(List<SourceCitation> sources,
                                                List<Map<String, Object>> evidenceList,
                                                String workspaceId) {
        StringBuilder sb = new StringBuilder();
        sb.append("<div class=\"regulation-section\">");
        sb.append("<h2 class=\"section-title\">Maßgebliche Vorschriften</h2>");
        sb.append("<div class=\"section-subtitle\">")
          .append(sources.size()).append(" Dokumente gefunden und ausgewertet</div>");

        for (int i = 0; i < evidenceList.size(); i++) {
            Map<String, Object> s = evidenceList.get(i);
            sb.append("<div class=\"regulation-card\">");

            // Main content
            sb.append("<div class=\"reg-card-main\">");
            sb.append("<div class=\"reg-card-number\">").append(i + 1).append("</div>");
            sb.append("<div class=\"reg-card-content\">");
            sb.append("<h4 class=\"reg-card-title\">").append(escapeHtml((String) s.get("title"))).append("</h4>");
            sb.append("<div class=\"reg-card-meta\">");
            sb.append("<span class=\"reg-meta-item\">").append(escapeHtml((String) s.get("authority"))).append("</span>");
            sb.append("<span class=\"reg-meta-sep\">·</span>");
            sb.append("<span class=\"reg-meta-item\">").append(escapeHtml((String) s.get("date"))).append("</span>");
            sb.append("<span class=\"reg-meta-sep\">·</span>");
            sb.append("<span class=\"reg-tag\">").append(escapeHtml((String) s.get("categoryLabel"))).append("</span>");
            sb.append("</div>");
            if (s.get("excerpt") != null && !s.get("excerpt").toString().isBlank()) {
                sb.append("<div class=\"reg-card-excerpt\">")
                  .append(escapeHtml(s.get("excerpt").toString())).append("</div>");
            }
            // Explainability
            String explainWhy = (String) s.get("explainWhy");
            if (explainWhy != null && !explainWhy.isBlank()) {
                sb.append("<details class=\"reg-card-explain\"><summary>Warum wurde dieses Dokument ausgewählt?</summary>")
                  .append("<p>").append(escapeHtml(explainWhy)).append("</p></details>");
            }
            sb.append("</div></div>");

            // Actions
            sb.append("<div class=\"reg-card-actions\">");
            sb.append("<a href=\"/documents/").append(s.get("documentId"))
              .append("\" target=\"_blank\" class=\"btn-reg-action\">Originaldokument öffnen</a>");
            if (s.get("chunkId") != null) {
                sb.append("<a href=\"/documents/").append(s.get("documentId"))
                  .append("?chunk=").append(s.get("chunkId"))
                  .append("\" target=\"_blank\" class=\"btn-reg-action\">Relevante Stelle anzeigen</a>");
            }
            sb.append("</div>");

            sb.append("</div>"); // end regulation-card
        }
        sb.append("</div>");
        return sb.toString();
    }

    // ═══════════════════════════════════════════════════════════
    // Next actions
    // ═══════════════════════════════════════════════════════════

    private String buildNextActionsSection(List<SourceCitation> sources) {
        StringBuilder sb = new StringBuilder();
        sb.append("<div class=\"next-actions\">");
        sb.append("<h3>Nächste Schritte</h3>");
        sb.append("<div class=\"next-actions-grid\">");
        sb.append("<button class=\"next-action-btn\" onclick=\"window.print()\">Drucken</button>");
        sb.append("<button class=\"next-action-btn\" onclick=\"saveAsPdf()\">Als PDF speichern</button>");
        if (!sources.isEmpty()) {
            sb.append("<a href=\"/documents/").append(sources.getFirst().documentId())
              .append("\" target=\"_blank\" class=\"next-action-btn\">Originalvorschrift öffnen</a>");
        }
        sb.append("<a href=\"/decision\" class=\"next-action-btn\">Neuen Vorgang beginnen</a>");
        sb.append("</div></div>");
        return sb.toString();
    }

    // ═══════════════════════════════════════════════════════════
    // Collapsible processing details
    // ═══════════════════════════════════════════════════════════

    private String buildProcessingDetailsSection(List<SourceCitation> sources, String strategy,
                                                   long totalMs, double confidence) {
        StringBuilder sb = new StringBuilder();
        sb.append("<details class=\"processing-details\">");
        sb.append("<summary><span class=\"pd-summary-text\">");
        sb.append("Analyse abgeschlossen · ").append(sources.size())
          .append(" passende Vorschriften ausgewertet · Bearbeitungszeit: ")
          .append(escapeHtml(formatDuration(totalMs)));
        sb.append("</span><span class=\"pd-toggle\">Bearbeitungsdetails anzeigen</span></summary>");
        sb.append("<div class=\"pd-content\">");
        sb.append("<div class=\"pd-grid\">");
        sb.append("<div class=\"pd-item\"><span class=\"pd-label\">Abrufstrategie</span><span class=\"pd-value\">")
          .append(escapeHtml(strategy != null ? strategy : "hybrid")).append("</span></div>");
        sb.append("<div class=\"pd-item\"><span class=\"pd-label\">Dokumente durchsucht</span><span class=\"pd-value\">")
          .append(sources.size()).append("</span></div>");
        sb.append("<div class=\"pd-item\"><span class=\"pd-label\">Verlässlichkeit</span><span class=\"pd-value\">")
          .append(escapeHtml(formatConfidence(confidence)))
          .append(" <span class=\"text-xs text-tertiary\">(")
          .append(String.format("%.0f", confidence * 100)).append("%)</span></span></div>");
        sb.append("<div class=\"pd-item\"><span class=\"pd-label\">Bearbeitungszeit</span><span class=\"pd-value\">")
          .append(escapeHtml(formatDuration(totalMs))).append("</span></div>");
        sb.append("</div></div></details>");
        return sb.toString();
    }

    // ═══════════════════════════════════════════════════════════
    // Legacy helpers (retained for compatibility)
    // ═══════════════════════════════════════════════════════════

    private Map<String, String> buildDocMetaCache(List<SourceCitation> sources) {
        Map<String, String> cache = new LinkedHashMap<>();
        try {
            var page = documentFacade.findDocuments(
                    new DocumentFilter(null, null, null, null, null, null, null, 0, 100));
            for (Document doc : page.documents()) {
                String title = doc.metadata().title();
                String cat = doc.metadata().category() != null ? doc.metadata().category() : "regulation";
                String authority = resolveAuthority(cat);
                cache.put(title, authority + "|2024|" + cat + "|" + cat);
            }
        } catch (Exception ignored) {}
        for (SourceCitation s : sources) {
            cache.putIfAbsent(s.title(), "Land Berlin|2024|regulation|regulation");
        }
        return cache;
    }

    private static String resolveAuthority(String cat) {
        if (cat == null) return "Land Berlin";
        if (cat.contains("building")) return "Senatsverwaltung für Stadtentwicklung, Bauen und Wohnen";
        if (cat.contains("procurement")) return "Senatsverwaltung für Finanzen";
        if (cat.contains("hr")) return "Senatsverwaltung für Inneres und Sport";
        return "Land Berlin";
    }

    private static String escapeHtml(String s) {
        if (s == null) return "";
        return s.replace("&", "&amp;").replace("<", "&lt;").replace(">", "&gt;")
                .replace("\"", "&quot;").replace("'", "&#39;");
    }

    private record WorkspaceMeta(String name, String description, List<String> questions) {}

    /** Builds the entire page content as HTML — zero Thymeleaf expressions in the template. */
    private String buildPageHtml(Model model) {
        String wsName = (String) model.getAttribute("workspaceName");
        String wsDesc = (String) model.getAttribute("workspaceDescription");
        String wsId = (String) model.getAttribute("workspaceId");
        String question = (String) model.getAttribute("question");
        String error = (String) model.getAttribute("error");
        String resultHtml = (String) model.getAttribute("resultHtml");
        @SuppressWarnings("unchecked")
        List<String> exampleQuestions = (List<String>) model.getAttribute("exampleQuestions");

        StringBuilder h = new StringBuilder();

        // Page header
        h.append("<div class=\"page-header flex-between\"><div>");
        h.append("<h1>").append(wsName != null ? wsName : "Neue Entscheidung").append("</h1>");
        h.append("<p class=\"page-description\">").append(wsDesc != null ? wsDesc : "Beschreiben Sie einen Verwaltungsvorgang.").append("</p>");
        h.append("</div><div class=\"d-flex gap-8 align-items-center\">");
        h.append("<select class=\"form-select\" name=\"workspaceId\" form=\"queryForm\" style=\"width:auto;font-size:.80rem\">");
        h.append("<option value=\"\">Alle Fachbereiche</option>");
        h.append("<option value=\"building\"").append("building".equals(wsId) ? " selected" : "").append(">Bauen &amp; Stadtplanung</option>");
        h.append("<option value=\"procurement\"").append("procurement".equals(wsId) ? " selected" : "").append(">Offentliche Beschaffung</option>");
        h.append("<option value=\"hr\"").append("hr".equals(wsId) ? " selected" : "").append(">Personal &amp; Innere Verwaltung</option>");
        h.append("</select>");
        h.append("<span class=\"text-xs text-tertiary\" id=\"modelLabel\">Modell</span>");
        h.append("</div></div>");

        // Query bar
        h.append("<div class=\"card mb-16\"><div class=\"card-body\" style=\"padding:14px 18px\">");
        h.append("<form action=\"/decision\" method=\"post\" id=\"queryForm\" style=\"display:flex;gap:10px;align-items:center\">");
        h.append("<input type=\"hidden\" name=\"modelParam\" id=\"modelParam\" value=\"\">");
        h.append("<textarea name=\"question\" class=\"form-textarea\" rows=\"1\" style=\"font-size:.90rem;resize:none;flex:1\" placeholder=\"");
        h.append(wsName != null ? "Vorgang fur " + wsName + " beschreiben..." : "Beschreiben Sie den Verwaltungsvorgang...");
        h.append("\">").append(question != null ? escapeHtml(question) : "").append("</textarea>");
        h.append("<button class=\"btn btn-primary\" type=\"submit\" style=\"padding:10px 22px;font-size:.86rem;white-space:nowrap\">Vorgang analysieren</button>");
        h.append("</form></div></div>");

        // Error
        if (error != null) {
            h.append("<div class=\"card mb-16\" style=\"border-left:3px solid var(--status-err)\">");
            h.append("<div class=\"card-body\" style=\"color:var(--red-600);font-weight:500;white-space:pre-wrap;font-size:.82rem\">").append(error).append("</div></div>");
        }

        // Result or empty state
        if (resultHtml != null) {
            h.append(resultHtml);
        } else if (exampleQuestions != null && !exampleQuestions.isEmpty()) {
            h.append("<div class=\"card mt-16\"><div class=\"card-header\">Typische Verwaltungsvorgange</div>");
            h.append("<div class=\"card-body\" style=\"padding:12px 16px\"><div class=\"question-chips\">");
            for (String q : exampleQuestions) {
                h.append("<button class=\"question-chip\" type=\"button\" onclick=\"var t=document.querySelector('textarea[name=question]');t.value='")
                    .append(escapeAttr(q)).append("';document.getElementById('queryForm').submit()\">")
                    .append(escapeHtml(q)).append("</button>");
            }
            h.append("</div></div></div>");
        }

        // JS
        h.append("<script>fetch('/api/providers/models').then(function(r){return r.json()}).then(function(d){")
            .append("if(d.models&&d.models.length>0){var n=typeof d.models[0].name==='string'?d.models[0].name:String(d.models[0]);")
            .append("document.getElementById('modelLabel').textContent='Modell: '+n;")
            .append("document.getElementById('modelParam').value=n}}).catch(function(){});")
            .append("function sortEvidence(b){var l=document.getElementById('evidenceList');if(!l)return;")
            .append("var c=Array.from(l.querySelectorAll('.evidence-card'));c.sort(function(a,b){if(b==='score')return parseFloat(b.getAttribute('data-score'))-parseFloat(a.getAttribute('data-score'));")
            .append("return a.getAttribute('data-'+b).localeCompare(b.getAttribute('data-'+b))});c.forEach(function(c){l.appendChild(c)})}</script>");

        return h.toString();
    }

    private static String escapeAttr(String s) {
        if (s == null) return "";
        return s.replace("&", "&amp;").replace("<", "&lt;").replace(">", "&gt;")
                .replace("\"", "&quot;").replace("'", "&#39;");
    }
}
