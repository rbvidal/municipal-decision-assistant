import { apiClient } from "../api";

export interface DecisionService {
  getDecision(caseId: string): Promise<unknown>;
  requestAnalysis(caseId: string, question: string): Promise<unknown>;
  generateDraft(caseId: string): Promise<unknown>;
  streamDecision(caseId: string, onChunk: (chunk: Record<string, unknown>) => void, signal?: AbortSignal): Promise<void>;
}

export const restDecisionService: DecisionService = {
  getDecision: (caseId) => apiClient.get(`/api/decision/${caseId}`),
  requestAnalysis: (caseId, question) => apiClient.post(`/api/decision/${caseId}/analyze`, { question }),
  generateDraft: (caseId) => apiClient.post(`/api/decision/${caseId}/draft`),
  streamDecision: (caseId, onChunk, signal) =>
    apiClient.stream(`/api/decision/${caseId}/stream`, onChunk, signal),
};
