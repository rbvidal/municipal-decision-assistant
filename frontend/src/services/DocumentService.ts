import type { DocumentItem } from '../mocks/documents';
import { mockDocuments } from '../mocks/documents';

export interface DocumentService {
  getAll(): Promise<DocumentItem[]>;
  getById(id: string): Promise<DocumentItem | null>;
  search(query: string): Promise<DocumentItem[]>;
}

export const mockDocumentService: DocumentService = {
  getAll: async () => mockDocuments,
  getById: async (id) => mockDocuments.find((d) => d.id === id) ?? null,
  search: async (query: string) => {
    const q = query.toLowerCase().trim();
    if (!q) return mockDocuments;
    return mockDocuments.filter((d) =>
      d.name.toLowerCase().includes(q) ||
      d.vorgangId.toLowerCase().includes(q) ||
      d.buerger.toLowerCase().includes(q));
  },
};
