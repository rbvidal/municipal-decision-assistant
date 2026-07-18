package com.cognitera.platform.api.web;

import com.cognitera.platform.workspace.api.*;
import com.cognitera.platform.workspace.application.WorkspaceService;
import com.cognitera.platform.workspace.model.*;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;

import java.time.Instant;
import java.util.*;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

/**
 * Verification tests for workspace CRUD REST endpoints.
 * Covers create, list, get, advance phase, status update, documents,
 * timeline, steps, checklist, and notes endpoints.
 */
class WorkspaceControllerTest {

    private MockMvc mockMvc;
    private WorkspaceService service;
    private WorkspaceEntity testWs;

    @BeforeEach
    void setUp() {
        service = mock(WorkspaceService.class);
        mockMvc = MockMvcBuilders.standaloneSetup(new WorkspaceController(service)).build();

        testWs = new WorkspaceEntity("ws-1", "Test Vorfall", "Test Beschreibung",
                "GENERAL", "user-1");
        testWs.setPhase(WorkspacePhase.SETUP);
        testWs.setStatus(WorkspaceStatus.DRAFT);

        when(service.findById("ws-1")).thenReturn(Optional.of(testWs));
        when(service.toDto(any())).thenReturn(new WorkspaceDto(
                testWs.getId(), testWs.getName(), testWs.getDescription(),
                testWs.getWorkspaceType(), testWs.getStatus(), testWs.getPhase(),
                testWs.getOwnerId(), Map.of(), List.of(), List.of(),
                testWs.getCreatedAt(), testWs.getUpdatedAt()));
    }

    // ── Create ──

    @Test
    void shouldCreateWorkspace() throws Exception {
        when(service.createWorkspace(any())).thenReturn(testWs);

        mockMvc.perform(post("/api/workspaces")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                            {"name":"Test","description":"desc","workspaceType":"GENERAL","createdBy":"user-1"}
                            """))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value("ws-1"))
                .andExpect(jsonPath("$.name").value("Test Vorfall"));
    }

    // ── List ──

    @Test
    void shouldListWorkspaces() throws Exception {
        when(service.findAll()).thenReturn(List.of(testWs));

        mockMvc.perform(get("/api/workspaces"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].id").value("ws-1"));
    }

    @Test
    void shouldListWorkspacesByOwner() throws Exception {
        when(service.findByOwner("user-1")).thenReturn(List.of(testWs));

        mockMvc.perform(get("/api/workspaces?ownerId=user-1"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].id").value("ws-1"));
    }

    // ── Get ──

    @Test
    void shouldGetWorkspaceById() throws Exception {
        mockMvc.perform(get("/api/workspaces/ws-1"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value("ws-1"))
                .andExpect(jsonPath("$.phase").value("SETUP"));
    }

    @Test
    void shouldReturn404ForMissingWorkspace() throws Exception {
        when(service.findById("missing")).thenReturn(Optional.empty());

        mockMvc.perform(get("/api/workspaces/missing"))
                .andExpect(status().isNotFound());
    }

    // ── Advance phase ──

    @Test
    void shouldAdvancePhase() throws Exception {
        WorkspaceEntity advanced = new WorkspaceEntity("ws-1", "Test Vorfall", "desc",
                "GENERAL", "user-1");
        advanced.setPhase(WorkspacePhase.INGESTION);
        when(service.advancePhase("ws-1")).thenReturn(advanced);
        when(service.toDto(advanced)).thenReturn(new WorkspaceDto(
                advanced.getId(), advanced.getName(), advanced.getDescription(),
                advanced.getWorkspaceType(), advanced.getStatus(), advanced.getPhase(),
                advanced.getOwnerId(), Map.of(), List.of(), List.of(),
                advanced.getCreatedAt(), advanced.getUpdatedAt()));

        mockMvc.perform(post("/api/workspaces/ws-1/advance"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.phase").value("INGESTION"));
    }

    // ── Update status ──

    @Test
    void shouldUpdateStatus() throws Exception {
        mockMvc.perform(put("/api/workspaces/ws-1/status")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"status\":\"ACTIVE\"}"))
                .andExpect(status().isOk());
    }

    // ── Documents ──

    @Test
    void shouldGetDocuments() throws Exception {
        when(service.getWorkspaceDocuments("ws-1")).thenReturn(List.of());

        mockMvc.perform(get("/api/workspaces/ws-1/documents"))
                .andExpect(status().isOk());
    }

    @Test
    void shouldAttachDocument() throws Exception {
        var link = new WorkspaceDocumentLinkEntity(null, "ws-1", "doc-1", "notes",
                DocumentType.REPORT, "general");
        when(service.attachDocument(any())).thenReturn(link);

        mockMvc.perform(post("/api/workspaces/ws-1/documents")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                            {"documentId":"doc-1","documentType":"REPORT","documentCategory":"general"}
                            """))
                .andExpect(status().isOk());
    }

    // ── Timeline ──

    @Test
    void shouldGetTimeline() throws Exception {
        when(service.getTimeline("ws-1")).thenReturn(List.of());

        mockMvc.perform(get("/api/workspaces/ws-1/timeline"))
                .andExpect(status().isOk());
    }

    @Test
    void shouldAddTimelineEvent() throws Exception {
        var event = new TimelineEventEntity(null, "ws-1", java.time.LocalDate.now(),
                "Test Event", "desc", TimelineEventType.EVENT, null, 1.0, false);
        when(service.addTimelineEvent(any(), any(), any(), any(), any(), any(), anyDouble(), anyBoolean()))
                .thenReturn(event);

        mockMvc.perform(post("/api/workspaces/ws-1/timeline")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                            {"eventDate":"2025-01-15","title":"Test Event","description":"desc","eventType":"EVENT"}
                            """))
                .andExpect(status().isOk());
    }

    // ── Steps ──

    @Test
    void shouldGetSteps() throws Exception {
        when(service.getCompletedSteps("ws-1")).thenReturn(List.of());

        mockMvc.perform(get("/api/workspaces/ws-1/steps"))
                .andExpect(status().isOk());
    }

    // ── Checklist ──

    @Test
    void shouldGetChecklist() throws Exception {
        mockMvc.perform(get("/api/workspaces/ws-1/checklist"))
                .andExpect(status().isOk());
    }

    @Test
    void shouldReturn404ForChecklistOfMissingWorkspace() throws Exception {
        when(service.findById("missing")).thenReturn(Optional.empty());

        mockMvc.perform(get("/api/workspaces/missing/checklist"))
                .andExpect(status().isNotFound());
    }

    @Test
    void shouldUpdateChecklist() throws Exception {
        mockMvc.perform(put("/api/workspaces/ws-1/checklist")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                            [{"id":"c1","title":"Item 1","checked":false}]
                            """))
                .andExpect(status().isOk());
    }

    // ── Notes ──

    @Test
    void shouldGetNotes() throws Exception {
        mockMvc.perform(get("/api/workspaces/ws-1/notes"))
                .andExpect(status().isOk());
    }

    @Test
    void shouldAddNote() throws Exception {
        mockMvc.perform(post("/api/workspaces/ws-1/notes")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                            {"author":"Sabine Müller","content":"Eine neue Notiz"}
                            """))
                .andExpect(status().isOk());
    }
}
