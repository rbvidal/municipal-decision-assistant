import { useQuery } from "@tanstack/react-query";
import { supervisorService } from "../services";

export function useSupervisorCases() {
  return useQuery({
    queryKey: ["supervisor", "cases"],
    queryFn: () => supervisorService.getAll(),
    staleTime: 30_000,
  });
}

export function useSupervisorCase(id: string) {
  return useQuery({
    queryKey: ["supervisor", "case", id],
    queryFn: () => supervisorService.getById(id),
    staleTime: 30_000,
    enabled: id !== "",
  });
}
