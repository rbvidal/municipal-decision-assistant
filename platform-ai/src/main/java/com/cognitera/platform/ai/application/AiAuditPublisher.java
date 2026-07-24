package com.cognitera.platform.ai.application;

import com.cognitera.platform.audit.api.AiAuditEvents;
import com.cognitera.platform.audit.api.AuditEventType;
import com.cognitera.platform.audit.api.AuditMetadata;
import com.cognitera.platform.audit.api.AuditSubject;
import org.springframework.stereotype.Component;

import java.util.Map;

/** Publishes AI audit events through the platform audit module. */
@Component
public class AiAuditPublisher {

    private final AiAuditEvents auditEvents;

    public AiAuditPublisher(AiAuditEvents auditEvents) {
        this.auditEvents = auditEvents;
    }

    /** Emits an AI audit event with actor, tenant, event type, entity ID, and metadata. */
    public void emit(String actorId, String tenantId, AuditEventType eventType, String entityId, Map<String, String> metadata) {
        auditEvents.emit(
                eventType,
                new AuditSubject(actorId, tenantId, "AI_INFERENCE", entityId),
                AuditMetadata.from(metadata));
    }
}
