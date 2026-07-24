import { apiClient } from "../api";

export interface DashboardStat {
  id: string;
  label: string;
  value: string;
  status: "info" | "warning" | "success" | "error";
  percentage?: number;
}

export interface DashboardCase {
  id: string;
  title: string;
  status: string;
  dueDate: string;
  actionText: string;
}

export interface DashboardNextTask {
  id: string;
  title: string;
  risk: string;
  lastModified: string;
}

export interface DashboardSuggestion {
  id: string;
  caseId: string;
  type: "info" | "warning" | "success" | "error";
  title: string;
  description: string;
  actionLabel?: string;
}

export interface DashboardData {
  stats: DashboardStat[];
  cases: DashboardCase[];
  nextTask: DashboardNextTask;
  suggestions: DashboardSuggestion[];
}

const DashboardService = {
  getDashboard(): Promise<DashboardData> {
    return apiClient.get<DashboardData>("/api/dashboard");
  },
};

export default DashboardService;
