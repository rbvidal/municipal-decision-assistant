import type { AdminService } from "./AdminService";
import { apiClient } from "../api";
import type {
  SystemHealth,
  BackgroundJob,
  AuditLogEntry,
  DepartmentConfig,
} from "../mocks/administration";

export const restAdminService: AdminService = {
  getSystemHealth: () => apiClient.get<SystemHealth>("/api/admin/health"),
  getJobs: () => apiClient.get<BackgroundJob[]>("/api/admin/jobs"),
  getAuditLogs: () => apiClient.get<AuditLogEntry[]>("/api/admin/audit"),
  getDepartments: () => apiClient.get<DepartmentConfig[]>("/api/admin/departments"),
};
