import { useQuery } from "@tanstack/react-query";
import { knowledgeService } from "../services";

export function useKnowledgeSearch(query: string, filters: Record<string, string>) {
  return useQuery({
    queryKey: ["knowledge", "search", query, filters],
    queryFn: () => knowledgeService.search(query, filters),
    staleTime: 30_000,
  });
}

export function useKnowledgeDocument(id: string) {
  return useQuery({
    queryKey: ["knowledge", "document", id],
    queryFn: () => knowledgeService.getById(id),
    staleTime: 60_000,
    enabled: id !== "",
  });
}
