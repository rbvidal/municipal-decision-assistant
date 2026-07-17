import type { DecisionPackage } from '../types/decision';
import { apiClient, getAuthToken } from '../api';

const API_BASE = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:8080';

export interface DecisionService {
  getDecision(caseId: string): Promise<DecisionPackage>;
  requestAnalysis(caseId: string): Promise<DecisionPackage>;
  generateDraft(caseId: string): Promise<DecisionPackage['draft']>;
  streamDecision(caseId: string, onChunk: (chunk: Partial<DecisionPackage>) => void, signal: AbortSignal): Promise<void>;
}

export const restDecisionService: DecisionService = {
  getDecision: (caseId) => apiClient.get<DecisionPackage>(`/api/decision/${caseId}`),
  requestAnalysis: (caseId) => apiClient.post<DecisionPackage>(`/api/decision/${caseId}/analyze`),
  generateDraft: (caseId) => apiClient.post<DecisionPackage['draft']>(`/api/decision/${caseId}/draft`),
  streamDecision: async (caseId, onChunk, signal) => {
    const token = getAuthToken();
    const response = await fetch(`${API_BASE}/api/decision/${caseId}/stream`, {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
      signal,
    });
    const reader = response.body?.getReader();
    if (!reader) throw new Error('Streaming nicht unterstützt');
    const decoder = new TextDecoder();
    let buffer = '';
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split('\n');
      buffer = lines.pop() ?? '';
      for (const line of lines) {
        if (line.startsWith('data: ')) {
          try { onChunk(JSON.parse(line.slice(6))); } catch { /* skip */ }
        }
      }
    }
  },
};

export const mockDecisionService: DecisionService = {
  getDecision: async () => {
    const { mockDecisionPackage } = await import('../mocks/decision');
    return mockDecisionPackage;
  },
  requestAnalysis: async () => {
    const { mockDecisionPackage } = await import('../mocks/decision');
    await new Promise((r) => setTimeout(r, 2000));
    return mockDecisionPackage;
  },
  generateDraft: async () => {
    const { mockDecisionPackage } = await import('../mocks/decision');
    return mockDecisionPackage.draft;
  },
  streamDecision: async (_caseId, onChunk, signal) => {
    const { mockDecisionPackage } = await import('../mocks/decision');
    const steps = mockDecisionPackage.reasoning;
    for (const step of steps) {
      if (signal.aborted) break;
      await new Promise((r) => setTimeout(r, 800));
      onChunk({ reasoning: [step], workflow: { ...mockDecisionPackage.workflow, step: steps.indexOf(step) + 1 } });
    }
    await new Promise((r) => setTimeout(r, 500));
    onChunk(mockDecisionPackage);
  },
};
