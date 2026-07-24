package com.cognitera.platform.api.dto.dashboard;

import java.util.List;

/**
 * Response DTO for the /api/dashboard endpoint.
 * Provides home-page data: stats, cases, suggested next task, and AI suggestions.
 */
public record DashboardResponse(
    List<DashboardStat> stats,
    List<DashboardCase> cases,
    DashboardNextTask nextTask,
    List<DashboardSuggestion> suggestions
) {
    public record DashboardStat(String id, String label, String value, String status, Integer percentage) {}
    public record DashboardCase(String id, String title, String status, String dueDate, String actionText) {}
    public record DashboardNextTask(String id, String title, String risk, String lastModified) {}
    public record DashboardSuggestion(String id, String caseId, String type, String title, String description, String actionLabel) {}
}
