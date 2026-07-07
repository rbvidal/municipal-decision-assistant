package com.cognitera.platform.web;

import com.cognitera.platform.document.api.DocumentFacade;
import com.cognitera.platform.document.api.DocumentFilter;
import com.cognitera.platform.document.model.Document;
import com.cognitera.platform.document.model.DocumentStatus;
import com.cognitera.platform.workspace.infrastructure.persistence.JpaWorkspaceRepository;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;

import java.util.*;
import java.util.stream.Collectors;

/** Page controllers for Regulations, Knowledge Graph, Analytics, Administration, and Cases. */
@Controller
public class PlatformPageController {

    private final DocumentFacade documentFacade;
    private final JpaWorkspaceRepository workspaceRepo;
    private final com.cognitera.platform.audit.api.AuditService auditService;

    public PlatformPageController(DocumentFacade documentFacade, JpaWorkspaceRepository workspaceRepo,
                                  com.cognitera.platform.audit.api.AuditService auditService) {
        this.documentFacade = documentFacade;
        this.workspaceRepo = workspaceRepo;
        this.auditService = auditService;
    }

    @GetMapping({"/regulations", "/knowledge"})
    public String regulations(Model model) {
        List<Map<String, Object>> docs = new ArrayList<>();
        try {
            var page = documentFacade.findDocuments(
                    new DocumentFilter(null, null, null, null, null, null, null, 0, 100));
            for (Document doc : page.documents()) {
                Map<String, Object> m = new LinkedHashMap<>();
                m.put("id", doc.id().toString());
                m.put("title", doc.metadata().title());
                m.put("type", doc.metadata().type().name());
                m.put("status", doc.status().name());
                m.put("category", doc.metadata().category() != null ? doc.metadata().category() : "");
                m.put("version", doc.currentVersion());
                m.put("tags", String.join(", ", doc.metadata().tags()));
                docs.add(m);
            }
        } catch (Exception ignored) {}
        model.addAttribute("documents", docs);
        return "regulations";
    }

    @GetMapping("/cases")
    public String cases(Model model) {
        try {
            var auditPage = auditService.query(new com.cognitera.platform.audit.api.AuditQuery(
                    null, null, null, null, null, null, null, null, null, null, 0, 20));
            model.addAttribute("recentAudits", auditPage.events());
        } catch (Exception ignored) {
            model.addAttribute("recentAudits", java.util.List.of());
        }
        return "cases";
    }

    @GetMapping("/graph")
    public String graph(Model model) {
        return "graph";
    }

    @GetMapping("/analytics")
    public String analytics(Model model) {
        List<Map<String, Object>> docs = new ArrayList<>();
        try {
            var page = documentFacade.findDocuments(
                    new DocumentFilter(null, null, null, null, null, null, null, 0, 100));
            int ready = 0, other = 0;
            Map<String, Integer> byCategory = new LinkedHashMap<>();
            for (Document doc : page.documents()) {
                if (doc.status() == DocumentStatus.READY) ready++; else other++;
                String cat = doc.metadata().category() != null ? doc.metadata().category() : "uncategorized";
                byCategory.merge(cat, 1, Integer::sum);
            }
            model.addAttribute("totalDocs", page.documents().size());
            model.addAttribute("readyDocs", ready);
            model.addAttribute("processingDocs", other);
            model.addAttribute("categories", byCategory);
            model.addAttribute("workspaceCount", workspaceRepo.count());
        } catch (Exception ignored) {
            model.addAttribute("totalDocs", 0);
            model.addAttribute("readyDocs", 0);
            model.addAttribute("workspaceCount", 0);
        }
        return "analytics";
    }

    @GetMapping("/admin")
    public String admin(Model model) {
        model.addAttribute("workspaceCount", workspaceRepo.count());
        return "admin";
    }
}
