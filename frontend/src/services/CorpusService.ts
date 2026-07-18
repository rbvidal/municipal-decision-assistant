import type { Wissenspaket, QdrantMetrics, BackgroundJob, AuditLog } from "../mocks/corpus";
import { mockPackages, mockMetrics, mockBackgroundJobs, mockAuditLogs } from "../mocks/corpus";

export interface CorpusHealthSummary {
  documentCount: number;
  chunkCount: number;
  embeddedChunks: number;
  missingEmbeddings: number;
  qdrantVectors: number;
  embeddingCoveragePct: number;
  avgChunksPerDocument: number;
  avgRetrievalScore: string;
  qdrantVectorDimension: number;
}

export interface CorpusHealthCategory {
  key: string;
  label: string;
  count: number;
  statusClass: string;
}

export interface DocumentHealth {
  title: string;
  legalDomain: string;
  authority: string;
  language: string;
  pageCount: number;
  chunkCount: number;
  chunksWithEmbeddings: number;
  chunksWithoutEmbeddings: number;
  indexedInQdrant: boolean;
  vectorCount: number;
  metadataCompleteness: number;
  lastIndexingTime: string;
  status: string;
}

export interface CorpusHealthResponse {
  summary: CorpusHealthSummary;
  warnings: string[];
  categories: CorpusHealthCategory[];
  documents: DocumentHealth[];
}

export interface ManifestSummary {
  totalEntries: number;
  byDomain: Record<string, number>;
  byPriority: Record<string, number>;
}

export interface CorpusService {
  getPackages(): Promise<Wissenspaket[]>;
  getMetrics(): Promise<QdrantMetrics>;
  getJobs(): Promise<BackgroundJob[]>;
  getAuditLogs(): Promise<AuditLog[]>;
  getHealth(): Promise<CorpusHealthResponse>;
  getManifestSummary(): Promise<ManifestSummary>;
}

export const mockCorpusService: CorpusService = {
  getPackages: async () => mockPackages,
  getMetrics: async () => mockMetrics,
  getJobs: async () => mockBackgroundJobs,
  getAuditLogs: async () => mockAuditLogs,
  getHealth: async () => ({
    summary: {
      documentCount: 23,
      chunkCount: 156,
      embeddedChunks: 148,
      missingEmbeddings: 8,
      qdrantVectors: 148,
      embeddingCoveragePct: 94.9,
      avgChunksPerDocument: 6.8,
      avgRetrievalScore: "0.87",
      qdrantVectorDimension: 768,
    },
    warnings: ["3 Dokumente haben keine Embeddings"],
    categories: [
      { key: "withoutEmbeddings", label: "Ohne Embeddings", count: 3, statusClass: "yellow" },
      { key: "withoutVectors", label: "Ohne Vektoren", count: 1, statusClass: "red" },
      { key: "failedExtraction", label: "Fehlerhafte Extraktion", count: 0, statusClass: "green" },
      { key: "failedIndexing", label: "Fehlerhafte Indexierung", count: 0, statusClass: "green" },
    ],
    documents: [
      { title: "BauO Bln", legalDomain: "Baurecht", authority: "SenStadt", language: "de", pageCount: 45, chunkCount: 12, chunksWithEmbeddings: 12, chunksWithoutEmbeddings: 0, indexedInQdrant: true, vectorCount: 12, metadataCompleteness: 1.0, lastIndexingTime: "2025-07-15", status: "GREEN" },
      { title: "GWB Teil 4", legalDomain: "Vergabe", authority: "BMWK", language: "de", pageCount: 120, chunkCount: 8, chunksWithEmbeddings: 8, chunksWithoutEmbeddings: 0, indexedInQdrant: true, vectorCount: 8, metadataCompleteness: 0.95, lastIndexingTime: "2025-07-14", status: "GREEN" },
      { title: "TV-L 2025", legalDomain: "Personal", authority: "TdL", language: "de", pageCount: 80, chunkCount: 6, chunksWithEmbeddings: 5, chunksWithoutEmbeddings: 1, indexedInQdrant: true, vectorCount: 5, metadataCompleteness: 0.9, lastIndexingTime: "2025-07-13", status: "YELLOW" },
      { title: "BRKG", legalDomain: "Personal", authority: "BMI", language: "de", pageCount: 35, chunkCount: 4, chunksWithEmbeddings: 4, chunksWithoutEmbeddings: 0, indexedInQdrant: false, vectorCount: 0, metadataCompleteness: 0.85, lastIndexingTime: "2025-07-10", status: "RED" },
    ],
  }),
  getManifestSummary: async () => ({
    totalEntries: 62,
    byDomain: { procurement: 18, building: 14, hr: 16, "cross-domain": 14 },
    byPriority: { HIGHEST: 12, HIGH: 18, STANDARD: 20, MEDIUM: 12 },
  }),
};
