package com.cognitera.platform.api.web;

import com.cognitera.platform.ai.knowledge.KnowledgeDataLoader;
import com.cognitera.platform.ai.knowledge.KnowledgeRegistry;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

/**
 * Admin endpoint for runtime knowledge table reload.
 *
 * <p>POST /api/admin/knowledge/reload — clears and reloads all
 * structured knowledge tables (salary, travel, thresholds) with
 * atomic swap and failure rollback.
 */
@RestController
@RequestMapping("/api/admin/knowledge")
@PreAuthorize("hasRole('ADMIN')")
public class AdminKnowledgeController {

    private static final Logger log = LoggerFactory.getLogger(AdminKnowledgeController.class);

    private final KnowledgeDataLoader loader;
    private final KnowledgeRegistry registry;

    public AdminKnowledgeController(KnowledgeDataLoader loader, KnowledgeRegistry registry) {
        this.loader = loader;
        this.registry = registry;
    }

    @PostMapping("/reload")
    public ResponseEntity<Map<String, Object>> reload() {
        log.info("Admin: knowledge reload requested");
        loader.reload();

        Map<String, Object> result = Map.of(
                "status", "reloaded",
                "salaryEntries", registry.totalSalaryEntries(),
                "travelEntries", registry.totalTravelEntries(),
                "thresholdEntries", registry.totalThresholdEntries(),
                "totalTables", registry.totalTables());

        log.info("Admin: knowledge reload complete — {} tables, {} total entries",
                registry.totalTables(),
                registry.totalSalaryEntries()
                + registry.totalTravelEntries()
                + registry.totalThresholdEntries());

        return ResponseEntity.ok(result);
    }

    @GetMapping("/status")
    public ResponseEntity<Map<String, Object>> status() {
        return ResponseEntity.ok(Map.of(
                "salaryTables", registry.salaryTables().size(),
                "salaryEntries", registry.totalSalaryEntries(),
                "travelTables", registry.travelTables().size(),
                "travelEntries", registry.totalTravelEntries(),
                "thresholdTables", registry.thresholdTables().size(),
                "thresholdEntries", registry.totalThresholdEntries(),
                "totalTables", registry.totalTables()));
    }
}
