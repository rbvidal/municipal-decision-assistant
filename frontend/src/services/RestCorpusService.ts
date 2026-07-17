import type { CorpusService } from './CorpusService';
import { apiClient } from '../api';
import type { Wissenspaket, QdrantMetrics, BackgroundJob, AuditLog } from '../mocks/corpus';

export const restCorpusService: CorpusService = {
  getPackages: () => apiClient.get<Wissenspaket[]>('/api/corpus/packages'),
  getMetrics: () => apiClient.get<QdrantMetrics>('/api/corpus/metrics'),
  getJobs: () => apiClient.get<BackgroundJob[]>('/api/corpus/jobs'),
  getAuditLogs: () => apiClient.get<AuditLog[]>('/api/corpus/audit'),
};
