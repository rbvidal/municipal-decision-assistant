package com.cognitera.platform.observability.health;

import org.springframework.boot.actuate.health.*;
import org.springframework.stereotype.Component;

import javax.sql.DataSource;
import java.util.LinkedHashMap;
import java.util.Map;

/**
 * Aggregates health status across all infrastructure components
 * (DB, Qdrant, Neo4j, Ollama) into a single composite decision.
 *
 * <p>Status logic:
 * <ul>
 *   <li>UP — all components healthy</li>
 *   <li>DEGRADED — one or more non-critical components unhealthy (Neo4j, Ollama)</li>
 *   <li>DOWN — critical component unhealthy (DB, Qdrant)</li>
 * </ul>
 */
@Component
public class AggregatedHealthIndicator implements HealthIndicator {

    private final DataSource dataSource;
    private final QdrantHealthIndicator qdrantHealth;
    private final OllamaHealthIndicator ollamaHealth;
    private final Map<String, HealthIndicator> healthIndicators;

    public AggregatedHealthIndicator(DataSource dataSource,
                                      QdrantHealthIndicator qdrantHealth,
                                      OllamaHealthIndicator ollamaHealth,
                                      Map<String, HealthIndicator> healthIndicators) {
        this.dataSource = dataSource;
        this.qdrantHealth = qdrantHealth;
        this.ollamaHealth = ollamaHealth;
        this.healthIndicators = healthIndicators;
    }

    @Override
    public Health health() {
        Map<String, Object> components = new LinkedHashMap<>();
        boolean down = false;
        boolean degraded = false;

        // DB (critical)
        try {
            dataSource.getConnection().close();
            components.put("db", Map.of("status", "UP"));
        } catch (Exception e) {
            components.put("db", Map.of("status", "DOWN", "error", e.getMessage()));
            down = true;
        }

        // Qdrant (critical)
        try {
            Health qh = qdrantHealth.health();
            components.put("qdrant", Map.of("status", qh.getStatus().getCode(),
                    "details", qh.getDetails()));
            if (!qh.getStatus().equals(Status.UP)) down = true;
        } catch (Exception e) {
            components.put("qdrant", Map.of("status", "DOWN", "error", e.getMessage()));
            down = true;
        }

        // Ollama (non-critical)
        try {
            Health oh = ollamaHealth.health();
            components.put("ollama", Map.of("status", oh.getStatus().getCode()));
            if (!oh.getStatus().equals(Status.UP)) degraded = true;
        } catch (Exception e) {
            components.put("ollama", Map.of("status", "UNKNOWN"));
            degraded = true;
        }

        // Neo4j (non-critical, optional)
        String neo4jKey = null;
        for (String key : healthIndicators.keySet()) {
            if (key.toLowerCase().contains("neo4j")) {
                neo4jKey = key;
                break;
            }
        }
        if (neo4jKey != null) {
            try {
                Health nh = healthIndicators.get(neo4jKey).health();
                components.put("neo4j", Map.of("status", nh.getStatus().getCode()));
                if (!nh.getStatus().equals(Status.UP)) degraded = true;
            } catch (Exception e) {
                components.put("neo4j", Map.of("status", "DOWN", "error", e.getMessage()));
                degraded = true;
            }
        } else {
            components.put("neo4j", Map.of("status", "UNKNOWN", "note", "not configured"));
        }

        Status aggregate;
        if (down) {
            aggregate = Status.DOWN;
        } else if (degraded) {
            aggregate = new Status("DEGRADED");
        } else {
            aggregate = Status.UP;
        }

        return Health.status(aggregate)
                .withDetails(Map.of("components", components))
                .build();
    }
}
