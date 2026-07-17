import type { CaseService } from './CaseService';
import { apiClient } from '../api';
import type { CaseDetails, ChecklistItemData, DocumentItemData, TimelineEntryData, CaseNoteData, WorkflowStep } from '../mocks/case-workspace';

export const restCaseService: CaseService = {
  getCase: (id) => apiClient.get<CaseDetails>(`/api/workspaces/${id}`),
  getWorkflowSteps: (caseId) => apiClient.get<WorkflowStep[]>(`/api/workspaces/${caseId}/steps`),
  getChecklistItems: (caseId) => apiClient.get<ChecklistItemData[]>(`/api/workspaces/${caseId}/checklist`),
  getDocuments: (caseId) => apiClient.get<DocumentItemData[]>(`/api/workspaces/${caseId}/documents`),
  getTimeline: (caseId) => apiClient.get<TimelineEntryData[]>(`/api/workspaces/${caseId}/timeline`),
  getNotes: (caseId) => apiClient.get<CaseNoteData[]>(`/api/workspaces/${caseId}/notes`),
};
