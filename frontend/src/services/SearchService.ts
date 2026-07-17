import { apiClient } from "../api";

export interface SearchResult {
  chunk: {
    chunkId: string;
    documentId: string;
    documentVersion: number;
    title: string;
  };
  text: string;
  score: number;
  confidenceScore: number;
  provider: string;
  citation: {
    documentId: string;
    chunkId: string;
    title: string;
    excerpt: string;
  } | null;
  keywordScore: number;
  vectorScore: number;
}

export interface SearchResponse {
  results: SearchResult[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
}

export const searchService = {
  search: (query: string, documentType?: string, page = 0, size = 20) =>
    apiClient.post<SearchResponse>("/api/search", {
      query,
      documentType: documentType || null,
      page,
      size,
    }),
};
