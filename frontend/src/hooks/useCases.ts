import { useQuery } from "@tanstack/react-query";
import { caseService } from "../services";

export function useCases() {
  return useQuery({
    queryKey: ["cases"],
    queryFn: () => caseService.getAll(),
    staleTime: 30_000,
  });
}

export function useCase(id: string) {
  return useQuery({
    queryKey: ["case", id],
    queryFn: () => caseService.getCase(id),
    staleTime: 30_000,
  });
}

export function useCaseWorkflowSteps(caseId: string) {
  return useQuery({
    queryKey: ["case", caseId, "workflow-steps"],
    queryFn: () => caseService.getWorkflowSteps(caseId),
    staleTime: 30_000,
  });
}

export function useCaseChecklist(caseId: string) {
  return useQuery({
    queryKey: ["case", caseId, "checklist"],
    queryFn: () => caseService.getChecklistItems(caseId),
    staleTime: 30_000,
  });
}

export function useCaseDocuments(caseId: string) {
  return useQuery({
    queryKey: ["case", caseId, "documents"],
    queryFn: () => caseService.getDocuments(caseId),
    staleTime: 30_000,
  });
}

export function useCaseTimeline(caseId: string) {
  return useQuery({
    queryKey: ["case", caseId, "timeline"],
    queryFn: () => caseService.getTimeline(caseId),
    staleTime: 30_000,
  });
}

export function useCaseNotes(caseId: string) {
  return useQuery({
    queryKey: ["case", caseId, "notes"],
    queryFn: () => caseService.getNotes(caseId),
    staleTime: 30_000,
  });
}
