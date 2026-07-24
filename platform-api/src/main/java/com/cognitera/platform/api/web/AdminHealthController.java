package com.cognitera.platform.api.web;

import com.cognitera.platform.document.api.DocumentFacade;
import com.cognitera.platform.document.api.IngestionJobFilter;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.lang.management.ManagementFactory;
import java.time.Duration;
import java.time.ZoneId;
import java.time.format.DateTimeFormatter;
import java.util.*;

/**
 * REST controller for admin health and ingestion job status.
 */
@RestController
@RequestMapping("/api/admin")
@PreAuthorize("hasRole('ADMIN')")
public class AdminHealthController {

    private static final DateTimeFormatter ISO_FMT =
            DateTimeFormatter.ofPattern("yyyy-MM-dd'T'HH:mm:ss").withZone(ZoneId.of("UTC"));

    private final DocumentFacade documentFacade;

    public AdminHealthController(DocumentFacade documentFacade) {
        this.documentFacade = documentFacade;
    }

    @GetMapping("/health")
    public ResponseEntity<Map<String, Object>> getSystemHealth() {
        var runtime = Runtime.getRuntime();
        var memoryUsed = runtime.totalMemory() - runtime.freeMemory();
        var memoryPct = runtime.maxMemory() > 0
            ? Math.round((double) memoryUsed / runtime.maxMemory() * 100)
            : 0;
        var uptime = Duration.ofMillis(ManagementFactory.getRuntimeMXBean().getUptime());

        return ResponseEntity.ok(Map.<String, Object>of(
            "status", "UP",
            "uptime", String.format("%dh %dm", uptime.toHours(), uptime.toMinutesPart()),
            "memoryUsage", memoryPct,
            "cpuUsage", 0,
            "activeSessions", 1
        ));
    }

    @GetMapping("/jobs")
    public ResponseEntity<List<Map<String, Object>>> getJobs() {
        var page = documentFacade.findIngestionJobs(
                new IngestionJobFilter(null, null, null, 0, 50));
        List<Map<String, Object>> jobs = new ArrayList<>();
        for (var job : page.jobs()) {
            Map<String, Object> j = new LinkedHashMap<>();
            j.put("id", job.id().toString());
            j.put("name", "Ingestion — " + job.documentId().toString().substring(0, 8));
            j.put("type", job.sourceType() != null ? job.sourceType() : "INGESTION");
            j.put("status", job.status().name());
            j.put("progress", progressFor(job.status().name()));
            j.put("startedAt", job.createdAt() != null ? ISO_FMT.format(job.createdAt()) : null);
            if (job.completedAt() != null) {
                j.put("completedAt", ISO_FMT.format(job.completedAt()));
            }
            if (job.failureReason() != null && !job.failureReason().isBlank()) {
                j.put("errorMessage", job.failureReason());
            }
            jobs.add(j);
        }
        return ResponseEntity.ok(jobs);
    }

    private static int progressFor(String status) {
        return switch (status) {
            case "COMPLETED" -> 100;
            case "FAILED" -> 0;
            case "INGESTING" -> 50;
            default -> 0;
        };
    }
}
