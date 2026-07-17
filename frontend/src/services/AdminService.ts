import type { SystemHealth, BackgroundJob, AuditLogEntry, DepartmentConfig } from '../mocks/administration';
import { mockSystemHealth, mockBackgroundJobs, mockAuditLogs, mockDepartments } from '../mocks/administration';

export interface AdminService {
  getSystemHealth(): Promise<SystemHealth>;
  getJobs(): Promise<BackgroundJob[]>;
  getAuditLogs(): Promise<AuditLogEntry[]>;
  getDepartments(): Promise<DepartmentConfig[]>;
}

export const mockAdminService: AdminService = {
  getSystemHealth: async () => mockSystemHealth,
  getJobs: async () => mockBackgroundJobs,
  getAuditLogs: async () => mockAuditLogs,
  getDepartments: async () => mockDepartments,
};
