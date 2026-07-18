import type { DecisionPackage } from "../types/decision";
import { apiClient } from "../api";

export interface DecisionService {
  getDecision(caseId: string): Promise<DecisionPackage>;
  requestAnalysis(caseId: string): Promise<DecisionPackage>;
  generateDraft(caseId: string): Promise<DecisionPackage["draft"]>;
  streamDecision(
    caseId: string,
    onChunk: (chunk: Partial<DecisionPackage>) => void,
    signal: AbortSignal,
  ): Promise<void>;
}

export const restDecisionService: DecisionService = {
  getDecision: (caseId) => apiClient.get<DecisionPackage>(`/api/decision/${caseId}`),
  requestAnalysis: (caseId) => apiClient.post<DecisionPackage>(`/api/decision/${caseId}/analyze`),
  generateDraft: (caseId) =>
    apiClient.post<DecisionPackage["draft"]>(`/api/decision/${caseId}/draft`),
  streamDecision: (caseId, onChunk, signal) =>
    apiClient.stream<Partial<DecisionPackage>>(`/api/decision/${caseId}/stream`, onChunk, signal),
};

export const mockDecisionService: DecisionService = {
  getDecision: async () => {
    const { mockDecisionPackage } = await import("../mocks/decision");
    return mockDecisionPackage;
  },
  requestAnalysis: async () => {
    const { mockDecisionPackage } = await import("../mocks/decision");
    await new Promise((r) => setTimeout(r, 2000));
    return mockDecisionPackage;
  },
  generateDraft: async () => {
    const { mockDecisionPackage } = await import("../mocks/decision");
    return mockDecisionPackage.draft;
  },
  streamDecision: async (_caseId, onChunk, signal) => {
    const { mockDecisionPackage } = await import("../mocks/decision");
    const steps = mockDecisionPackage.reasoning;
    for (const step of steps) {
      if (signal.aborted) break;
      await new Promise((r) => setTimeout(r, 800));
      onChunk({
        reasoning: [step],
        workflow: { ...mockDecisionPackage.workflow, step: steps.indexOf(step) + 1 },
      });
    }
    await new Promise((r) => setTimeout(r, 500));
    onChunk(mockDecisionPackage);
  },
};
