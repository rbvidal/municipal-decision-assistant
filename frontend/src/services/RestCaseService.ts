import { apiClient } from "../api";
import type { CaseDetails, ChecklistItemData, DocumentItemData, CaseNoteData, WorkflowStep } from "../types/domain";

export interface TimelineEntryData {
  id: string;
  timestamp: string;
  actor: string;
  action: string;
  description: string;
  type: "status" | "document" | "note" | "system";
}

// ── Raw API workspace shape ──

interface ApiWorkspace {
  id: string;
  name: string;
  description: string;
  workspaceType: string;
  status: string;
  phase: string;
  ownerId: string;
  phaseData: Record<string, unknown>;
  documents?: ApiWorkspaceDocument[];
  timelineEvents?: unknown[];
  createdAt: string;
  updatedAt: string;
}

interface ApiWorkspaceDocument {
  id: string;
  workspaceId: string;
  documentId: string;
  documentName: string;
  documentType: string;
  documentCategory: string;
  extractedMetadata: Record<string, unknown>;
  uploadedAt: string;
}

// ── Mapping ──

function formatDate(iso: string): string {
  if (!iso) return "-";
  try {
    return new Date(iso).toLocaleDateString("de-DE", { day: "2-digit", month: "2-digit", year: "numeric" });
  } catch {
    return iso.substring(0, 10);
  }
}

function mapWorkspaceToCaseDetails(ws: ApiWorkspace): CaseDetails {
  return {
    id: ws.id,
    title: ws.name ?? ws.id,
    status: ws.status,
    type: ws.workspaceType,
    department: (ws.phaseData?.department as string) ?? (ws.workspaceType === "RESEARCH" ? "Fachbereich" : "-"),
    phase: ws.phase,
    createdAt: formatDate(ws.createdAt),
    dueDate: formatDate(ws.updatedAt),
    risk: (ws.phaseData?.risk as string) ?? "mittel",
    assignee: ws.ownerId ?? "-",
    description: ws.description ?? "",
    applicant: (ws.phaseData?.applicant as string) ?? (ws.workspaceType === "RESEARCH" ? "Demo-Benutzer" : "-"),
    address: (ws.phaseData?.address as string) ?? "-",
    parcelNumber: (ws.phaseData?.parcelNumber as string) ?? "-",
    projectType: ws.workspaceType,
    budget: (ws.phaseData?.budget as number) ?? 0,
    lastModified: formatDate(ws.updatedAt),
    priority: (ws.phaseData?.priority as string) ?? "medium",
    deadline: (ws.phaseData?.deadline as string) ?? "-",
  };
}

function mapWorkspaceDocument(doc: ApiWorkspaceDocument): DocumentItemData {
  return {
    id: doc.id,
    documentId: doc.documentId,
    name: doc.documentName || "",
    type: doc.documentType || "",
    date: doc.uploadedAt ? new Date(doc.uploadedAt).toLocaleDateString("de-DE") : "",
    uploadedAt: doc.uploadedAt ? new Date(doc.uploadedAt).toLocaleDateString("de-DE") : "",
    status: "Bereit",
  };
}

export interface CaseService {
  getAll(): Promise<CaseDetails[]>;
  getCase(id: string): Promise<CaseDetails>;
  getWorkflowSteps(caseId: string): Promise<WorkflowStep[]>;
  getChecklistItems(caseId: string): Promise<ChecklistItemData[]>;
  getDocuments(caseId: string): Promise<DocumentItemData[]>;
  getTimeline(caseId: string): Promise<TimelineEntryData[]>;
  getNotes(caseId: string): Promise<CaseNoteData[]>;
  toggleChecklistItem(caseId: string, itemId: string): Promise<void>;
  addNote(caseId: string, text: string, type: string): Promise<CaseNoteData>;
  uploadDocument(caseId: string, file: File, onProgress?: (pct: number) => void): Promise<DocumentItemData>;
}

export const restCaseService: CaseService = {
  getAll: async () => {
    const data = await apiClient.get<ApiWorkspace[]>("/api/workspaces");
    return data.map(mapWorkspaceToCaseDetails);
  },
  getCase: async (id) => {
    const data = await apiClient.get<ApiWorkspace>(`/api/workspaces/${id}`);
    return mapWorkspaceToCaseDetails(data);
  },
  getWorkflowSteps: (caseId) => apiClient.get<WorkflowStep[]>(`/api/workspaces/${caseId}/steps`),
  getChecklistItems: (caseId) =>
    apiClient.get<ChecklistItemData[]>(`/api/workspaces/${caseId}/checklist`),
  getDocuments: async (caseId) => {
    const docs = await apiClient.get<ApiWorkspaceDocument[]>(`/api/workspaces/${caseId}/documents`);
    return docs.map(mapWorkspaceDocument);
  },
  getTimeline: (caseId) => apiClient.get<TimelineEntryData[]>(`/api/workspaces/${caseId}/timeline`),
  getNotes: (caseId) => apiClient.get<CaseNoteData[]>(`/api/workspaces/${caseId}/notes`),
  toggleChecklistItem: (_caseId, _itemId) => Promise.resolve(),
  addNote: (_caseId, _text, _type) =>
    Promise.resolve({ id: "", author: "", time: "", content: "" }),
  uploadDocument: (_caseId, _file, _onProgress) =>
    Promise.resolve({ id: "", name: "", type: "", status: "" }),
};
