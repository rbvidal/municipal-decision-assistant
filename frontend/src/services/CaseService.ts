import type {
  CaseDetails,
  ChecklistItemData,
  DocumentItemData,
  TimelineEntryData,
  CaseNoteData,
  WorkflowStep,
} from "../mocks/case-workspace";
import {
  mockCase,
  mockWorkflowSteps,
  mockChecklistItems,
  mockDocuments,
  mockTimelineEvents,
  mockCaseNotes,
} from "../mocks/case-workspace";

export interface CaseService {
  getCase(id: string): Promise<CaseDetails>;
  getWorkflowSteps(caseId: string): Promise<WorkflowStep[]>;
  getChecklistItems(caseId: string): Promise<ChecklistItemData[]>;
  getDocuments(caseId: string): Promise<DocumentItemData[]>;
  getTimeline(caseId: string): Promise<TimelineEntryData[]>;
  getNotes(caseId: string): Promise<CaseNoteData[]>;
}

export const mockCaseService: CaseService = {
  getCase: async () => mockCase,
  getWorkflowSteps: async () => mockWorkflowSteps,
  getChecklistItems: async () => mockChecklistItems,
  getDocuments: async () => mockDocuments,
  getTimeline: async () => mockTimelineEvents,
  getNotes: async () => mockCaseNotes,
};
