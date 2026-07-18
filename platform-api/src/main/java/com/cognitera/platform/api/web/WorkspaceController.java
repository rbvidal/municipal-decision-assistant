package com.cognitera.platform.api.web;

import com.cognitera.platform.workspace.api.*;
import com.cognitera.platform.workspace.application.WorkspaceService;
import com.cognitera.platform.workspace.model.*;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;
import java.util.UUID;

/**
 * REST controller for workspace CRUD, phase advancement, document linking, and timeline management.
 */
@RestController
@RequestMapping("/api/workspaces")
public class WorkspaceController {

    private final WorkspaceService workspaceService;

    /**
     * Constructs the controller with the workspace service.
     */
    public WorkspaceController(WorkspaceService workspaceService) {
        this.workspaceService = workspaceService;
    }

    /**
     * Creates a new workspace.
     */
    @PostMapping
    public ResponseEntity<WorkspaceDto> createWorkspace(@RequestBody CreateWorkspaceCommand cmd) {
        WorkspaceEntity created = workspaceService.createWorkspace(cmd);
        return ResponseEntity.ok(workspaceService.toDto(created));
    }

    /**
     * Lists all workspaces, optionally filtered by owner.
     */
    @GetMapping
    public ResponseEntity<List<WorkspaceDto>> listWorkspaces(@RequestParam(required = false) String ownerId) {
        List<WorkspaceEntity> workspaces = ownerId != null
                ? workspaceService.findByOwner(ownerId) : workspaceService.findAll();
        return ResponseEntity.ok(workspaces.stream().map(workspaceService::toDto).toList());
    }

    /**
     * Retrieves a single workspace by its identifier.
     */
    @GetMapping("/{workspaceId}")
    public ResponseEntity<WorkspaceDto> getWorkspace(@PathVariable String workspaceId) {
        return workspaceService.findById(workspaceId)
                .map(workspaceService::toDto)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    /**
     * Advances the workspace to the next phase.
     */
    @PostMapping("/{workspaceId}/advance")
    public ResponseEntity<WorkspaceDto> advancePhase(@PathVariable String workspaceId) {
        WorkspaceEntity updated = workspaceService.advancePhase(workspaceId);
        return ResponseEntity.ok(workspaceService.toDto(updated));
    }

    /**
     * Updates the phase-specific data for a workspace.
     */
    @PutMapping("/{workspaceId}/phase-data")
    public ResponseEntity<WorkspaceDto> updatePhaseData(@PathVariable String workspaceId,
                                                         @RequestBody Map<String, Object> data) {
        workspaceService.updatePhaseData(workspaceId, data);
        return workspaceService.findById(workspaceId)
                .map(workspaceService::toDto)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    /**
     * Attaches a document to a workspace.
     */
    @PostMapping("/{workspaceId}/documents")
    public ResponseEntity<WorkspaceDocumentDto> attachDocument(@PathVariable String workspaceId,
                                                                @RequestBody AttachDocumentCommand cmd) {
        AttachDocumentCommand fullCmd = new AttachDocumentCommand(
                workspaceId, cmd.documentId(), cmd.documentType(),
                cmd.documentCategory(), cmd.notes());
        WorkspaceDocumentLinkEntity link = workspaceService.attachDocument(fullCmd);
        return ResponseEntity.ok(toDocDto(link));
    }

    /**
     * Lists all documents linked to a workspace.
     */
    @GetMapping("/{workspaceId}/documents")
    public ResponseEntity<List<WorkspaceDocumentDto>> getDocuments(@PathVariable String workspaceId) {
        return ResponseEntity.ok(workspaceService.getWorkspaceDocuments(workspaceId).stream()
                .map(this::toDocDto).toList());
    }

    /**
     * Lists all timeline events for a workspace.
     */
    @GetMapping("/{workspaceId}/timeline")
    public ResponseEntity<List<TimelineEventDto>> getTimeline(@PathVariable String workspaceId) {
        return ResponseEntity.ok(workspaceService.getTimeline(workspaceId).stream()
                .map(e -> new TimelineEventDto(e.getId(), e.getWorkspaceId(), e.getEventDate(), e.getTitle(),
                        e.getDescription(), e.getEventType(), e.getSourceDocumentId(),
                        e.getConfidence(), e.isAiGenerated()))
                .toList());
    }

    /**
     * Adds a timeline event to a workspace.
     */
    @PostMapping("/{workspaceId}/timeline")
    public ResponseEntity<TimelineEventDto> addTimelineEvent(@PathVariable String workspaceId,
                                                              @RequestBody Map<String, Object> body) {
        LocalDate eventDate = LocalDate.parse((String) body.get("eventDate"));
        String title = (String) body.get("title");
        String description = (String) body.getOrDefault("description", "");
        TimelineEventType type = body.get("eventType") != null
                ? TimelineEventType.valueOf((String) body.get("eventType"))
                : TimelineEventType.OTHER;
        TimelineEventEntity event = workspaceService.addTimelineEvent(
                workspaceId, eventDate, title, description, type, null, 1.0, false);
        return ResponseEntity.ok(new TimelineEventDto(event.getId(), event.getWorkspaceId(),
                event.getEventDate(), event.getTitle(), event.getDescription(),
                event.getEventType(), event.getSourceDocumentId(),
                event.getConfidence(), event.isAiGenerated()));
    }

    /**
     * Lists completed wizard steps for a workspace.
     */
    @GetMapping("/{workspaceId}/steps")
    public ResponseEntity<List<Map<String, Object>>> getSteps(@PathVariable String workspaceId) {
        return ResponseEntity.ok(workspaceService.getCompletedSteps(workspaceId).stream()
                .map(s -> Map.<String, Object>of(
                        "id", s.getId(),
                        "phase", s.getPhase().name(),
                        "stepName", s.getStepName() != null ? s.getStepName() : "",
                        "status", s.getStatus(),
                        "completedAt", s.getCompletedAt().toString()))
                .toList());
    }

    /**
     * Updates the workspace status.
     */
    @PutMapping("/{workspaceId}/status")
    public ResponseEntity<WorkspaceDto> updateStatus(@PathVariable String workspaceId,
                                                      @RequestBody Map<String, String> body) {
        WorkspaceStatus newStatus = WorkspaceStatus.valueOf(body.get("status"));
        var ws = workspaceService.findById(workspaceId).orElseThrow();
        ws.setStatus(newStatus);
        workspaceService.save(ws);
        return ResponseEntity.ok(workspaceService.toDto(ws));
    }

    /**
     * Returns checklist items for a workspace from phase data.
     */
    @GetMapping("/{workspaceId}/checklist")
    public ResponseEntity<List<Map<String, Object>>> getChecklist(@PathVariable String workspaceId) {
        var ws = workspaceService.findById(workspaceId).orElse(null);
        if (ws == null) return ResponseEntity.notFound().build();
        @SuppressWarnings("unchecked")
        List<Map<String, Object>> checklist = (List<Map<String, Object>>)
                ws.getPhaseDataMap().getOrDefault("checklist", List.of());
        return ResponseEntity.ok(checklist);
    }

    /**
     * Updates checklist items for a workspace.
     */
    @PutMapping("/{workspaceId}/checklist")
    public ResponseEntity<WorkspaceDto> updateChecklist(@PathVariable String workspaceId,
                                                         @RequestBody List<Map<String, Object>> items) {
        workspaceService.updatePhaseData(workspaceId, Map.of("checklist", items));
        return workspaceService.findById(workspaceId)
                .map(workspaceService::toDto)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    /**
     * Returns internal notes for a workspace from phase data.
     */
    @GetMapping("/{workspaceId}/notes")
    public ResponseEntity<List<Map<String, Object>>> getNotes(@PathVariable String workspaceId) {
        var ws = workspaceService.findById(workspaceId).orElse(null);
        if (ws == null) return ResponseEntity.notFound().build();
        @SuppressWarnings("unchecked")
        List<Map<String, Object>> notes = (List<Map<String, Object>>)
                ws.getPhaseDataMap().getOrDefault("notes", List.of());
        return ResponseEntity.ok(notes);
    }

    /**
     * Adds an internal note to a workspace.
     */
    @PostMapping("/{workspaceId}/notes")
    public ResponseEntity<WorkspaceDto> addNote(@PathVariable String workspaceId,
                                                 @RequestBody Map<String, String> body) {
        var ws = workspaceService.findById(workspaceId).orElseThrow();
        @SuppressWarnings("unchecked")
        List<Map<String, Object>> notes = new java.util.ArrayList<>(
                (List<Map<String, Object>>) ws.getPhaseDataMap().getOrDefault("notes", List.of()));
        notes.addFirst(Map.of(
                "id", UUID.randomUUID().toString(),
                "author", body.getOrDefault("author", "System"),
                "time", java.time.Instant.now().toString(),
                "content", body.getOrDefault("content", "")));
        workspaceService.updatePhaseData(workspaceId, Map.of("notes", notes));
        return workspaceService.findById(workspaceId)
                .map(workspaceService::toDto)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    private WorkspaceDocumentDto toDocDto(WorkspaceDocumentLinkEntity link) {
        return new WorkspaceDocumentDto(link.getId(), link.getWorkspaceId(), link.getDocumentId(),
                link.getDocumentName(),
                link.getDocumentType() != null ? link.getDocumentType() : DocumentType.OTHER,
                link.getDocumentCategory() != null ? link.getDocumentCategory() : "general",
                Map.of(), link.getUploadedAt());
    }
}
