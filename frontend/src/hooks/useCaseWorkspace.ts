import { useState, useEffect, useCallback } from "react";
import { caseService } from "../services/serviceFactory";
import type {
  CaseDetails,
  ChecklistItemData,
  DocumentItemData,
  TimelineEntryData,
  CaseNoteData,
  WorkflowStep,
  RegulationItemData,
} from "../mocks/case-workspace";

interface UseCaseWorkspaceResult {
  caseData: CaseDetails | null;
  workflowSteps: WorkflowStep[];
  checklistItems: ChecklistItemData[];
  documents: DocumentItemData[];
  timelineEvents: TimelineEntryData[];
  caseNotes: CaseNoteData[];
  regulations: RegulationItemData[];
  isLoading: boolean;
  toggleChecklistItem: (id: string) => void;
  addChecklistItem: (title: string, description?: string) => void;
  uploadDocument: (name: string, type: string) => void;
  addNote: (content: string) => void;
}

export function useCaseWorkspace(caseId: string): UseCaseWorkspaceResult {
  const [caseData, setCaseData] = useState<CaseDetails | null>(null);
  const [workflowSteps, setWorkflowSteps] = useState<WorkflowStep[]>([]);
  const [checklistItems, setChecklistItems] = useState<ChecklistItemData[]>([]);
  const [documents, setDocuments] = useState<DocumentItemData[]>([]);
  const [timelineEvents, setTimelineEvents] = useState<TimelineEntryData[]>([]);
  const [caseNotes, setCaseNotes] = useState<CaseNoteData[]>([]);
  const [regulations, setRegulations] = useState<RegulationItemData[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      setIsLoading(true);
      try {
        const [c, w, cl, d, t, n] = await Promise.all([
          caseService.getCase(caseId),
          caseService.getWorkflowSteps(caseId).catch(() => [] as WorkflowStep[]),
          caseService.getChecklistItems(caseId).catch(() => [] as ChecklistItemData[]),
          caseService.getDocuments(caseId).catch(() => [] as DocumentItemData[]),
          caseService.getTimeline(caseId).catch(() => [] as TimelineEntryData[]),
          caseService.getNotes(caseId).catch(() => [] as CaseNoteData[]),
        ]);
        if (cancelled) return;
        setCaseData(c);
        setWorkflowSteps(w);
        setChecklistItems(cl);
        setDocuments(d);
        setTimelineEvents(t);
        setCaseNotes(n);
      } catch {
        if (!cancelled) setCaseData(null);
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    };
    load();
    return () => { cancelled = true; };
  }, [caseId]);

  const toggleChecklistItem = useCallback((id: string) => {
    setChecklistItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, checked: !item.checked } : item)),
    );
  }, []);

  const addChecklistItem = useCallback((title: string, description?: string) => {
    setChecklistItems((prev) => [
      ...prev,
      { id: `c${Date.now()}`, title, description: description ?? "", checked: false, statusLabel: "Offen" },
    ]);
  }, []);

  const uploadDocument = useCallback((name: string, type: string) => {
    setDocuments((prev) => [
      ...prev,
      { id: `d${Date.now()}`, name, type, date: new Date().toLocaleDateString("de-DE"), status: "Offen" as const },
    ]);
  }, []);

  const addNote = useCallback((content: string) => {
    const note: CaseNoteData = { id: `n${Date.now()}`, author: "Aktueller Benutzer", time: "Jetzt", content };
    setCaseNotes((prev) => [note, ...prev]);
  }, []);

  return {
    caseData, workflowSteps, checklistItems, documents, timelineEvents, caseNotes,
    regulations, isLoading, toggleChecklistItem, addChecklistItem, uploadDocument, addNote,
  };
}
