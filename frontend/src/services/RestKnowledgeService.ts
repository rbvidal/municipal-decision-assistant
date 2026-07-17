import type { KnowledgeService } from './KnowledgeService';
import { apiClient } from '../api';
import type { KnowledgeDocument } from '../mocks/knowledge';

export const restKnowledgeService: KnowledgeService = {
  getAll: () => apiClient.get<KnowledgeDocument[]>('/api/knowledge'),
  search: (query, _filters) =>
    apiClient.get<KnowledgeDocument[]>('/api/knowledge/search', { q: query }),
  getById: (id) => apiClient.get<KnowledgeDocument>(`/api/knowledge/${id}`),
};
