import type { Wissenspaket, QdrantMetrics, BackgroundJob, AuditLog } from "../mocks/corpus";
import { mockPackages, mockMetrics, mockBackgroundJobs, mockAuditLogs } from "../mocks/corpus";

export interface CorpusService {
  getPackages(): Promise<Wissenspaket[]>;
  getMetrics(): Promise<QdrantMetrics>;
  getJobs(): Promise<BackgroundJob[]>;
  getAuditLogs(): Promise<AuditLog[]>;
}

export const mockCorpusService: CorpusService = {
  getPackages: async () => mockPackages,
  getMetrics: async () => mockMetrics,
  getJobs: async () => mockBackgroundJobs,
  getAuditLogs: async () => mockAuditLogs,
};
