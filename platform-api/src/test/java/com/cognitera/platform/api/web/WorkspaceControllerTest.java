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

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

class WorkspaceControllerTest {

    private static final String WS_ID = "a1b2c3d4-e5f6-7890-abcd-ef1234567890";
    private static final String WS_CODE = "WS-TEST01";

    private MockMvc mockMvc;
    private WorkspaceService service;
    private WorkspaceEntity testWs;

    @BeforeEach
    void setUp() {
        service = mock(WorkspaceService.class);
        mockMvc = MockMvcBuilders.standaloneSetup(new WorkspaceController(service)).build();

        testWs = new WorkspaceEntity(WS_CODE, "Test Vorfall", "Test Beschreibung",
                "GENERAL", "user-1");
        testWs.setPhase(WorkspacePhase.SETUP);
        testWs.setStatus(WorkspaceStatus.DRAFT);

        when(service.findById(any())).thenReturn(Optional.of(testWs));
        when(service.toDto(any())).thenReturn(new WorkspaceDto(
                testWs.getId(), WS_CODE, testWs.getName(), testWs.getDescription(),
                testWs.getWorkspaceType(), testWs.getStatus(), testWs.getPhase(),
                testWs.getOwnerId(), java.util.Collections.emptyMap(),
                java.util.Collections.emptyList(), java.util.Collections.emptyList(),
                testWs.getCreatedAt(), testWs.getUpdatedAt()));
    }

    @Test
    void shouldCreateWorkspace() throws Exception {
        when(service.createWorkspace(any())).thenReturn(testWs);

        mockMvc.perform(post("/api/workspaces")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                            {"name":"Test","description":"desc","workspaceType":"GENERAL","createdBy":"user-1"}
                            """))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(testWs.getId()))
                .andExpect(jsonPath("$.name").value("Test Vorfall"));
    }

    @Test
    void shouldListWorkspaces() throws Exception {
        when(service.findAll()).thenReturn(List.of(testWs));

        mockMvc.perform(get("/api/workspaces"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].id").value(testWs.getId()));
    }

    @Test
    void shouldListWorkspacesByOwner() throws Exception {
        when(service.findByOwner("user-1")).thenReturn(List.of(testWs));

        mockMvc.perform(get("/api/workspaces?ownerId=user-1"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].id").value(testWs.getId()));
    }

    @Test
    void shouldGetWorkspaceById() throws Exception {
        mockMvc.perform(get("/api/workspaces/" + testWs.getId()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(testWs.getId()))
                .andExpect(jsonPath("$.phase").value("SETUP"));
    }

    @Test
    void shouldReturn404ForMissingWorkspace() throws Exception {
        when(service.findById("missing")).thenReturn(Optional.empty());

        mockMvc.perform(get("/api/workspaces/missing"))
                .andExpect(status().isNotFound());
    }

    @Test
    void shouldAdvancePhase() throws Exception {
        WorkspaceEntity advanced = new WorkspaceEntity(WS_CODE, "Test Vorfall", "desc",
                "GENERAL", "user-1");
        advanced.setPhase(WorkspacePhase.INGESTION);
        when(service.advancePhase(WS_ID)).thenReturn(advanced);
        when(service.toDto(advanced)).thenReturn(new WorkspaceDto(
                WS_ID, WS_CODE, advanced.getName(), advanced.getDescription(),
                advanced.getWorkspaceType(), advanced.getStatus(), advanced.getPhase(),
                advanced.getOwnerId(), java.util.Collections.emptyMap(),
                java.util.Collections.emptyList(), java.util.Collections.emptyList(),
                advanced.getCreatedAt(), advanced.getUpdatedAt()));

        mockMvc.perform(post("/api/workspaces/" + WS_ID + "/advance"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.phase").value("INGESTION"));
    }

    @Test
    void shouldUpdateStatus() throws Exception {
        mockMvc.perform(put("/api/workspaces/" + WS_ID + "/status")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"status\":\"ACTIVE\"}"))
                .andExpect(status().isOk());
    }

    @Test
    void shouldGetDocuments() throws Exception {
        when(service.getWorkspaceDocuments(WS_ID)).thenReturn(List.of());

        mockMvc.perform(get("/api/workspaces/" + WS_ID + "/documents"))
                .andExpect(status().isOk());
    }

    @Test
    void shouldAttachDocument() throws Exception {
        var link = new WorkspaceDocumentLinkEntity(null, WS_ID, "doc-1", "notes",
                DocumentType.REPORT, "general");
        when(service.attachDocument(any())).thenReturn(link);

        mockMvc.perform(post("/api/workspaces/" + WS_ID + "/documents")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                            {"documentId":"doc-1","documentType":"REPORT","documentCategory":"general"}
                            """))
                .andExpect(status().isOk());
    }

    @Test
    void shouldGetTimeline() throws Exception {
        when(service.getTimeline(WS_ID)).thenReturn(List.of());

        mockMvc.perform(get("/api/workspaces/" + WS_ID + "/timeline"))
                .andExpect(status().isOk());
    }

    @Test
    void shouldAddTimelineEvent() throws Exception {
        var event = new TimelineEventEntity(null, WS_ID, java.time.LocalDate.now(),
                "Test Event", "desc", TimelineEventType.EVENT, null, 1.0, false);
        when(service.addTimelineEvent(any(), any(), any(), any(), any(), any(), anyDouble(), anyBoolean()))
                .thenReturn(event);

        mockMvc.perform(post("/api/workspaces/" + WS_ID + "/timeline")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                            {"eventDate":"2025-01-15","title":"Test Event","description":"desc","eventType":"EVENT"}
                            """))
                .andExpect(status().isOk());
    }

    @Test
    void shouldGetSteps() throws Exception {
        when(service.getCompletedSteps(WS_ID)).thenReturn(List.of());

        mockMvc.perform(get("/api/workspaces/" + WS_ID + "/steps"))
                .andExpect(status().isOk());
    }

    @Test
    void shouldGetChecklist() throws Exception {
        mockMvc.perform(get("/api/workspaces/" + WS_ID + "/checklist"))
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
        mockMvc.perform(put("/api/workspaces/" + WS_ID + "/checklist")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                            [{"id":"c1","title":"Item 1","checked":false}]
                            """))
                .andExpect(status().isOk());
    }

    @Test
    void shouldGetNotes() throws Exception {
        mockMvc.perform(get("/api/workspaces/" + WS_ID + "/notes"))
                .andExpect(status().isOk());
    }

    @Test
    void shouldAddNote() throws Exception {
        mockMvc.perform(post("/api/workspaces/" + WS_ID + "/notes")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                            {"author":"Sabine Müller","content":"Eine neue Notiz"}
                            """))
                .andExpect(status().isOk());
    }
}
