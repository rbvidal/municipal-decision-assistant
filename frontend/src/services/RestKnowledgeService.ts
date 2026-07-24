import { apiClient } from "../api";
import type { KnowledgeDocument } from "../types/domain";

export interface KnowledgeService {
  getAll(): Promise<KnowledgeDocument[]>;
  search(query: string, filters?: Record<string, string>): Promise<KnowledgeDocument[]>;
  getById(id: string): Promise<KnowledgeDocument>;
}

export const restKnowledgeService: KnowledgeService = {
  getAll: () => apiClient.get<KnowledgeDocument[]>("/api/knowledge"),
  search: (query, filters) => {
    const params: Record<string, string> = { q: query };
    if (filters) {
      if (filters.category && filters.category !== "Alle") params.category = filters.category;
      if (filters.fachbereich && filters.fachbereich !== "Alle") params.fachbereich = filters.fachbereich;
      if (filters.bundesland && filters.bundesland !== "Alle") params.bundesland = filters.bundesland;
    }
    return apiClient.get<KnowledgeDocument[]>("/api/knowledge/search", params);
  },
  getById: (id) => apiClient.get<KnowledgeDocument>(`/api/knowledge/${id}`),
};
