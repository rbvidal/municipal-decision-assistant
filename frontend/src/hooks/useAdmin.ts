import { useQuery } from "@tanstack/react-query";
import { adminService } from "../services";

export function useAdminHealth() {
  return useQuery({
    queryKey: ["admin", "health"],
    queryFn: () => adminService.getSystemHealth(),
    staleTime: 15_000,
  });
}

export function useAdminJobs() {
  return useQuery({
    queryKey: ["admin", "jobs"],
    queryFn: () => adminService.getJobs(),
    staleTime: 15_000,
  });
}

export function useAdminAuditLogs() {
  return useQuery({
    queryKey: ["admin", "audit"],
    queryFn: () => adminService.getAuditLogs(),
    staleTime: 30_000,
  });
}

export function useAdminDepartments() {
  return useQuery({
    queryKey: ["admin", "departments"],
    queryFn: () => adminService.getDepartments(),
    staleTime: 60_000,
  });
}
