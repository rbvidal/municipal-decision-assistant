import type { DocumentService, DocumentUploadResult } from "./DocumentService";
import { apiClient } from "../api";
import type { DocumentItem } from "../mocks/documents";

export const restDocumentService: DocumentService = {
  getAll: () => apiClient.get<DocumentItem[]>("/api/documents"),
  getById: (id) => apiClient.get<DocumentItem>(`/api/documents/${id}`),
  search: (query) => apiClient.get<DocumentItem[]>("/api/documents/search", { q: query }),
  upload: (file, title, onProgress) => {
    const path =
      "/api/documents/upload" + (title ? `?title=${encodeURIComponent(title)}` : "");
    return apiClient.upload<DocumentUploadResult>(path, file, onProgress);
  },
};
