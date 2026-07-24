package com.cognitera.platform.api.web;

import com.cognitera.platform.audit.api.AuditEvent;
import com.cognitera.platform.audit.api.AuditEventType;
import com.cognitera.platform.audit.api.AuditQuery;
import com.cognitera.platform.audit.api.AuditService;
import com.fasterxml.jackson.databind.JsonNode;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.time.ZoneId;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

/**
 * REST controller for corpus audit log queries.
 */
@RestController
@RequestMapping("/api/corpus")
@PreAuthorize("hasRole('ADMIN')")
public class CorpusRestController {

    private final AuditService auditService;

    public CorpusRestController(AuditService auditService) {
        this.auditService = auditService;
    }

    @GetMapping("/audit")
    public ResponseEntity<List<Map<String, Object>>> getAuditLogs() {
        var page = auditService.query(new AuditQuery(
                null, null, null, null, null, null, null, null, null, null, 0, 200));
        List<Map<String, Object>> result = new ArrayList<>();
        DateTimeFormatter fmt = DateTimeFormatter.ofPattern("yyyy-MM-dd'T'HH:mm:ss")
                .withZone(ZoneId.of("UTC"));
        for (AuditEvent e : page.events()) {
            Map<String, Object> entry = new LinkedHashMap<>();
            entry.put("id", e.id().toString());
            entry.put("timestamp", fmt.format(e.timestamp()));
            entry.put("event", e.eventType().name());
            entry.put("user", e.actorId() != null ? e.actorId() : "System");
            entry.put("details", buildDetails(e));
            entry.put("action", toAction(e.eventType()));
            entry.put("target", e.sourceModule() != null ? e.sourceModule() : e.entityType());
            entry.put("status", e.eventType().name().endsWith("_FAILED") ? "error" : "success");
            result.add(entry);
        }
        return ResponseEntity.ok(result);
    }

    private String buildDetails(AuditEvent e) {
        JsonNode meta = e.metadata();
        if (meta != null && meta.has("reason")) {
            return meta.get("reason").asText();
        }
        return e.eventType().name() + " — " + (e.actorId() != null ? e.actorId() : "System");
    }

    private String toAction(AuditEventType type) {
        return switch (type) {
            case USER_LOGIN, USER_LOGIN_FAILED -> "LOGIN";
            case USER_LOGOUT -> "LOGOUT";
            case USER_CREATED, USER_REGISTRATION_FAILED -> "REGISTRATION";
            case TOKEN_REFRESHED, TOKEN_REFRESH_FAILED -> "TOKEN";
            case DOCUMENT_INGESTED, DOCUMENT_UPDATED, DOCUMENT_VIEWED, DOCUMENT_DELETED -> "DOCUMENT";
            case SEARCH_EXECUTED, RETRIEVAL_EXECUTED, RERANKING_EXECUTED -> "SEARCH";
            case MODEL_INFERENCE, PROMPT_EXECUTED, SUMMARY_GENERATED, CONTENT_EXTRACTION_EXECUTED -> "AI";
            case WORKFLOW_STARTED, WORKFLOW_COMPLETED, WORKFLOW_FAILED -> "WORKFLOW";
            default -> type.name();
        };
    }
}
