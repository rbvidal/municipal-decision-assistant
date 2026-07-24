// ── Shared domain types (formerly in mocks/) ──

export interface DocumentItem {
  id: string;
  titel: string;
  name: string;
  typ: string;
  detailedTyp?: string;
  status: string;
  kategorie: string;
  erstellt: string;
  geaendert: string;
  groesse: string;
  dateigroesse?: string;
  versionen: number;
  version?: number;
  versions?: DocumentVersion[];
  ocrStatus: string;
  inhalte?: string;
  thumbnailUrl?: string;
  vorgangId?: string;
  dokumentId?: string;
  buerger?: string;
  hochgeladenAm?: string;
  references?: ReferenceItem[];
  history?: HistoryEvent[];
}

export interface DocumentVersion {
  version: string;
  date: string;
  author: string;
  isCurrent: boolean;
  changeDescription?: string;
  size?: string;
}

export interface ReferenceItem {
  id: string;
  type: string;
  title: string;
  description?: string;
  url?: string;
}

export interface HistoryEvent {
  id: string;
  title: string;
  timestamp: string;
  author: string;
  status: "completed" | "info" | "pending";
}

export interface CaseDetails {
  id: string;
  title: string;
  status: string;
  type: string;
  department: string;
  phase: string;
  createdAt: string;
  dueDate: string;
  risk: string;
  assignee: string;
  description: string;
  applicant: string;
  address: string;
  parcelNumber: string;
  projectType: string;
  budget: number;
  lastModified: string;
  priority?: string;
  deadline?: string;
}

export interface ChecklistItemData {
  id: string;
  title: string;
  text?: string;
  completed: boolean;
  checked?: boolean;
  required: boolean;
  category?: string;
  assignee?: string;
  dueDate?: string;
  description?: string;
  statusLabel?: string;
}

export interface DocumentItemData {
  id: string;
  documentId?: string;
  name: string;
  type: string;
  date?: string;
  uploadedAt?: string;
  size?: string;
  status: string;
  url?: string;
}

export interface CaseNoteData {
  id: string;
  text?: string;
  content: string;
  author: string;
  time?: string;
  createdAt?: string;
  type?: "internal" | "system";
}

export interface RegulationItemData {
  id: string;
  title: string;
  code?: string;
  status: string;
  category: string;
  relevance: string;
}

export interface WorkflowStep {
  id: string;
  label: string;
  description: string;
  completed: boolean;
  current: boolean;
  date?: string;
  state?: "completed" | "active" | "inactive";
}

export interface AuditLog {
  id: string;
  timestamp: string;
  event: string;
  user: string;
  details: string;
  action?: string;
  target?: string;
  status: "success" | "warning" | "error";
}

export interface KnowledgeDocument {
  id: string;
  title: string;
  type: string;
  category: string;
  fachbereich: string;
  bundesland: string;
  status: string;
  lastUpdated: string;
  excerpt: string;
  fullText?: string;
  tags: string[];
  toc?: TocItem[];
  relatedProcedures?: RelatedProcedure[];
  downloads?: DownloadItem[];
}

export interface TocItem {
  id: string;
  title: string;
  label?: string;
  page: number;
}

export interface RelatedProcedure {
  id: string;
  title: string;
  type: string;
  description: string;
  name?: string;
  paragraph?: string;
}

export interface DownloadItem {
  id: string;
  name: string;
  filename?: string;
  format: string;
  filetype?: string;
  size: string;
  url?: string;
}

export interface BackgroundJob {
  id: string;
  name: string;
  type: string;
  status: string;
  progress: number;
  startedAt: string;
  completedAt?: string;
  errorMessage?: string;
}
