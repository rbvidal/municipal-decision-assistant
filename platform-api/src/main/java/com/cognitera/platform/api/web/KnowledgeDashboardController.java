package com.cognitera.platform.api.web;

import com.cognitera.platform.ai.knowledge.KnowledgeRegistry;
import com.cognitera.platform.ai.knowledge.SalaryTable;
import com.cognitera.platform.ai.knowledge.ThresholdTable;
import com.cognitera.platform.ai.knowledge.TravelAllowanceTable;
import com.cognitera.platform.document.api.DocumentFacade;
import com.cognitera.platform.document.api.DocumentFilter;
import org.springframework.beans.factory.ObjectProvider;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseBody;

import java.util.*;

/**
 * Developer-only knowledge base dashboard.
 * Shows structured knowledge tables, corpus statistics, and quality metrics.
 */
@Controller
@RequestMapping("/api/dev/knowledge")
public class KnowledgeDashboardController {

    private final KnowledgeRegistry registry;
    private final DocumentFacade documentFacade;

    public KnowledgeDashboardController(KnowledgeRegistry registry,
                                          ObjectProvider<DocumentFacade> docFacade) {
        this.registry = registry;
        this.documentFacade = docFacade.getIfAvailable();
    }

    @GetMapping
    public String dashboard() {
        return buildHtml();
    }

    @GetMapping("/stats")
    @ResponseBody
    public Map<String, Object> stats() {
        Map<String, Object> s = new LinkedHashMap<>();
        s.put("salaryTables", registry.salaryTables().size());
        s.put("salaryEntries", registry.totalSalaryEntries());
        s.put("travelTables", registry.travelTables().size());
        s.put("travelEntries", registry.totalTravelEntries());
        s.put("thresholdTables", registry.thresholdTables().size());
        s.put("thresholdEntries", registry.totalThresholdEntries());
        s.put("totalTables", registry.totalTables());

        // Document counts
        try {
            var page = documentFacade.findDocuments(
                    new DocumentFilter(null, null, null, null, null, null, null, 0, 100));
            s.put("totalDocuments", page.totalElements());
            s.put("documentsReady", page.documents().stream()
                    .filter(d -> d.status().name().equals("READY")).count());
        } catch (Exception e) {
            s.put("totalDocuments", "unavailable");
        }

        s.put("metadata", registry.metadata());
        return s;
    }

    @GetMapping("/salary")
    @ResponseBody
    public List<Map<String, Object>> salaryTable() {
        List<Map<String, Object>> result = new ArrayList<>();
        for (SalaryTable t : registry.salaryTables()) {
            Map<String, Object> m = new LinkedHashMap<>();
            m.put("source", t.sourceDocument());
            m.put("payScale", t.payScale());
            m.put("effectiveFrom", t.effectiveFrom().toString());
            m.put("entries", t.size());
            List<Map<String, Object>> rows = new ArrayList<>();
            for (var e : t.entries()) {
                rows.add(Map.of("grade", e.grade(), "step", e.step(),
                        "amount", e.monthlyAmount(), "notes", e.notes()));
            }
            m.put("rows", rows);
            result.add(m);
        }
        return result;
    }

    @GetMapping("/travel")
    @ResponseBody
    public List<Map<String, Object>> travelTable() {
        List<Map<String, Object>> result = new ArrayList<>();
        for (TravelAllowanceTable t : registry.travelTables()) {
            Map<String, Object> m = new LinkedHashMap<>();
            m.put("source", t.sourceDocument());
            m.put("regulation", t.regulation());
            m.put("entries", t.size());
            List<Map<String, Object>> rows = new ArrayList<>();
            for (var e : t.entries()) {
                rows.add(Map.of("minHours", e.minHours(), "maxHours",
                        e.maxHours() != null ? e.maxHours() : "unlimited",
                        "allowance", e.allowanceEur(), "category", e.category(),
                        "description", e.description()));
            }
            m.put("rows", rows);
            result.add(m);
        }
        return result;
    }

    @GetMapping("/thresholds")
    @ResponseBody
    public List<Map<String, Object>> thresholds() {
        List<Map<String, Object>> result = new ArrayList<>();
        for (ThresholdTable t : registry.thresholdTables()) {
            Map<String, Object> m = new LinkedHashMap<>();
            m.put("source", t.sourceDocument());
            m.put("regulation", t.regulation());
            m.put("entries", t.size());
            List<Map<String, Object>> rows = new ArrayList<>();
            for (var e : t.entries()) {
                rows.add(Map.of("minAmount", e.minAmount(), "maxAmount",
                        e.maxAmount() != null ? e.maxAmount() : "unlimited",
                        "procedure", e.procedure(), "category", e.category(),
                        "requirements", e.requirements()));
            }
            m.put("rows", rows);
            result.add(m);
        }
        return result;
    }

    private String buildHtml() {
        var ss = stats();
        StringBuilder h = new StringBuilder();
        h.append("<!doctype html><html lang=\"de\"><head><title>Knowledge Dashboard</title>");
        h.append("<style>body{font-family:Inter,system-ui,sans-serif;background:#f8f9fb;color:#232632;padding:24px;max-width:1000px;margin:0 auto}");
        h.append("h1{font-size:1.3rem;margin:0 0 8px}h2{font-size:1rem;margin:24px 0 12px}");
        h.append(".card{background:#fff;border:1px solid #e2e4eb;border-radius:10px;padding:16px 20px;margin-bottom:16px}");
        h.append(".metric-big{font-size:2rem;font-weight:800;color:#1a4cd4}");
        h.append(".metric-label{font-size:.78rem;color:#6f7585;text-transform:uppercase;letter-spacing:.04em}");
        h.append(".metrics{display:flex;gap:32px;margin-bottom:16px;flex-wrap:wrap}");
        h.append("table{width:100%;border-collapse:collapse;font-size:.82rem;margin-top:10px}");
        h.append("th{text-align:left;padding:6px 10px;background:#f0f1f5;font-weight:600}");
        h.append("td{padding:5px 10px;border-bottom:1px solid #e2e4eb}");
        h.append("</style></head><body>");
        h.append("<h1>Knowledge Base Dashboard</h1>");
        h.append("<div class=\"metrics\">");
        h.append("<div><div class=\"metric-big\">").append(ss.get("salaryEntries")).append("</div><div class=\"metric-label\">Gehaltsstufen</div></div>");
        h.append("<div><div class=\"metric-big\">").append(ss.get("travelEntries")).append("</div><div class=\"metric-label\">Reisekostensätze</div></div>");
        h.append("<div><div class=\"metric-big\">").append(ss.get("thresholdEntries")).append("</div><div class=\"metric-label\">Schwellenwerte</div></div>");
        h.append("<div><div class=\"metric-big\">").append(ss.get("totalTables")).append("</div><div class=\"metric-label\">Strukturierte Tabellen</div></div>");
        h.append("<div><div class=\"metric-big\">").append(ss.getOrDefault("totalDocuments", "?")).append("</div><div class=\"metric-label\">Dokumente Gesamt</div></div>");
        h.append("</div>");
        h.append("<p style=\"font-size:.80rem;color:#6f7585\">Strukturierte Wissensbasis für deterministische Entscheidungen. Regelwerk: TV-L, BRKG, AV §55 LHO.</p>");
        h.append("</body></html>");
        return h.toString();
    }
}
