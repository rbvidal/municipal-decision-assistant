import { apiClient } from "../api";
import type { AuditLog } from "../types/domain";

export interface CorpusHealthResponse {
  status: string;
  documentCount: number;
  chunkCount: number;
  metrics: { collectionName: string; vectorCount: number; vectorDimension: number; indexType: string; diskUsageMB: number; status: string };
  summary?: CorpusHealthSummary;
  warnings?: Array<{ message: string; severity: string }>;
  categories?: Array<{ key: string; label: string; count: number; statusClass: string }>;
  documents?: Array<{ title: string; legalDomain: string; authority: string; language: string; pageCount: number; chunkCount: number; chunksWithEmbeddings: number; chunksWithoutEmbeddings: number; indexedInQdrant: boolean; vectorCount: number; metadataCompleteness: number; lastIndexingTime: string; status: string }>;
}

export interface CorpusHealthSummary {
  status: string;
  documentCount: number;
  chunkCount: number;
}

export interface ManifestSummary {
  total: number;
  completed: number;
  failed: number;
  pending: number;
}

export interface CorpusService {
  getAuditLogs(): Promise<AuditLog[]>;
  getHealth(): Promise<CorpusHealthResponse>;
  getManifestSummary(): Promise<ManifestSummary>;
}

export const restCorpusService: CorpusService = {
  getAuditLogs: () => apiClient.get<AuditLog[]>("/api/corpus/audit"),
  getHealth: () => apiClient.get("/api/admin/corpus/health"),
  getManifestSummary: () => apiClient.get("/api/admin/corpus/manifest-summary"),
};
