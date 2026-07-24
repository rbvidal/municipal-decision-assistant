import { useQuery } from "@tanstack/react-query";
import { adminService } from "../services";
import type { SystemHealth } from "../services/RestAdminService";

export function useAdminHealth() {
  return useQuery<SystemHealth>({
    queryKey: ["admin", "health"],
    queryFn: () => adminService.getSystemHealth(),
    staleTime: 30_000,
  });
}
