package com.cognitera.platform.workspace.api;

import com.cognitera.platform.workspace.model.WorkspaceStatus;
import com.cognitera.platform.workspace.model.WorkspacePhase;
import jakarta.persistence.*;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

import java.time.Instant;
import java.util.Map;
import java.util.UUID;

/** JPA entity representing a workspace with name, type, status, phase, and workspace code. */
@Entity
@Table(name = "workspaces")
public class WorkspaceEntity {

    @Id
    @Column(name = "id")
    private UUID id;

    @Column(name = "workspace_code", unique = true, length = 50)
    private String workspaceCode;

    @Column(name = "name", nullable = false)
    private String name;

    @Column(name = "description")
    private String description;

    @Column(name = "workspace_type", nullable = false)
    private String workspaceType;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false)
    private WorkspaceStatus status;

    @Enumerated(EnumType.STRING)
    @Column(name = "phase", nullable = false)
    private WorkspacePhase phase;

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "phase_data", columnDefinition = "jsonb")
    private String phaseData;

    @Column(name = "created_at", nullable = false)
    private Instant createdAt;

    @Column(name = "updated_at", nullable = false)
    private Instant updatedAt;

    @Column(name = "owner_id", nullable = false)
    private String ownerId;

    public WorkspaceEntity() {}

    public WorkspaceEntity(String workspaceCode, String name, String description,
                           String workspaceType, String ownerId) {
        this.id = UUID.randomUUID();
        this.workspaceCode = workspaceCode;
        this.name = name;
        this.description = description;
        this.workspaceType = workspaceType;
        this.status = WorkspaceStatus.DRAFT;
        this.phase = WorkspacePhase.SETUP;
        this.phaseData = "{}";
        this.createdAt = Instant.now();
        this.updatedAt = Instant.now();
        this.ownerId = ownerId;
    }

    public UUID getUuid() { return id; }

    public String getId() { return id != null ? id.toString() : null; }
    public void setId(String id) { this.id = id != null ? UUID.fromString(id) : null; }

    public String getWorkspaceCode() { return workspaceCode; }
    public void setWorkspaceCode(String workspaceCode) { this.workspaceCode = workspaceCode; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public String getWorkspaceType() { return workspaceType; }
    public void setWorkspaceType(String workspaceType) { this.workspaceType = workspaceType; }

    public WorkspaceStatus getStatus() { return status; }
    public void setStatus(WorkspaceStatus status) { this.status = status; }

    public WorkspacePhase getPhase() { return phase; }
    public void setPhase(WorkspacePhase phase) { this.phase = phase; }

    public String getPhaseData() { return phaseData; }
    public void setPhaseData(String phaseData) { this.phaseData = phaseData; }

    /** Parses the phase data JSON into a mutable map. Returns empty map on parse failure. */
    public Map<String, Object> getPhaseDataMap() {
        if (phaseData == null || phaseData.isBlank() || "{}".equals(phaseData))
            return new java.util.LinkedHashMap<>();
        try {
            return new com.fasterxml.jackson.databind.ObjectMapper()
                    .readValue(phaseData, new com.fasterxml.jackson.core.type.TypeReference<
                            java.util.LinkedHashMap<String, Object>>() {});
        } catch (Exception e) {
            return new java.util.LinkedHashMap<>();
        }
    }

    public Instant getCreatedAt() { return createdAt; }
    public void setCreatedAt(Instant createdAt) { this.createdAt = createdAt; }

    public Instant getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(Instant updatedAt) { this.updatedAt = updatedAt; }

    public String getOwnerId() { return ownerId; }
    public void setOwnerId(String ownerId) { this.ownerId = ownerId; }
}
