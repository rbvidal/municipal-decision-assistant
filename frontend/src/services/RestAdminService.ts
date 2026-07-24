import { apiClient } from "../api";
import type { BackgroundJob } from "../types/domain";

export interface SystemHealth {
  status: string;
  uptime: string;
  memoryUsage: number;
  cpuUsage: number;
  activeSessions: number;
}

export interface AdminService {
  getSystemHealth(): Promise<SystemHealth>;
  getJobs(): Promise<BackgroundJob[]>;
}

export const restAdminService: AdminService = {
  getSystemHealth: () => apiClient.get<SystemHealth>("/api/admin/health"),
  getJobs: () => apiClient.get<BackgroundJob[]>("/api/admin/jobs"),
};
