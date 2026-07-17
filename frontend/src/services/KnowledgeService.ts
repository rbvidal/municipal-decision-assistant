import type { KnowledgeDocument } from "../mocks/knowledge";
import { initialDocuments } from "../mocks/knowledge";

export interface KnowledgeService {
  search(query: string, filters: Record<string, string>): Promise<KnowledgeDocument[]>;
  getAll(): Promise<KnowledgeDocument[]>;
  getById(id: string): Promise<KnowledgeDocument | null>;
}

export const mockKnowledgeService: KnowledgeService = {
  search: async (query: string) => {
    await new Promise((r) => setTimeout(r, 200));
    const q = query.toLowerCase().trim();
    if (!q) return initialDocuments;
    return initialDocuments
      .filter(
        (doc) =>
          doc.title.toLowerCase().includes(q) ||
          doc.snippet.toLowerCase().includes(q) ||
          doc.fullText.toLowerCase().includes(q),
      )
      .sort((a, b) => b.relevance - a.relevance);
  },
  getAll: async () => initialDocuments,
  getById: async (id) => initialDocuments.find((d) => d.id === id) ?? null,
};
