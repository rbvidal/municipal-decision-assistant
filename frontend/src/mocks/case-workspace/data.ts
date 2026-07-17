import type { VorgangStatus, Priority, Risk } from '../../types';

export interface CaseDetails {
  id: string;
  title: string;
  applicant: string;
  department: string;
  assignee: string;
  status: VorgangStatus;
  priority: Priority;
  risk: Risk;
  deadline: string;
}

export interface WorkflowStep {
  id: string;
  label: string;
  state: 'completed' | 'active' | 'inactive';
}

export interface ChecklistItemData {
  id: string;
  title: string;
  description: string;
  checked: boolean;
  statusLabel?: string;
}

export interface DocumentItemData {
  id: string;
  name: string;
  type: string;
  date: string;
  status: 'Geprüft' | 'Offen' | 'Fehlend';
}

export interface TimelineEntryData {
  id: string;
  author: string;
  time: string;
  content: string;
  type: 'edit' | 'system';
}

export interface RegulationItemData {
  id: string;
  code: string;
  title: string;
}

export interface ChecklistProposalData {
  id: string;
  text: string;
}

export interface CaseNoteData {
  id: string;
  author: string;
  time: string;
  content: string;
}

export const mockCase: CaseDetails = {
  id: 'BAU-2026-0147',
  title: 'Bauantrag Carport',
  applicant: 'Thomas Becker',
  department: 'Bauamt',
  assignee: 'Sabine Müller',
  status: 'IN_REVIEW',
  priority: 'high',
  risk: 'gering',
  deadline: 'Heute',
};

export const WORKSPACE_TABS = [
  { id: 'overview', label: 'Übersicht' },
  { id: 'checklist', label: 'Checkliste' },
  { id: 'documents', label: 'Dokumente' },
  { id: 'notes', label: 'Interne Notizen' },
  { id: 'activity', label: 'Aktivität' },
  { id: 'decision-support', label: 'Entscheidungshilfe' },
  { id: 'draft', label: 'Entwurf' },
  { id: 'send', label: 'Versand' },
] as const;

export const mockWorkflowSteps: WorkflowStep[] = [
  { id: 'posteingang', label: 'Posteingang', state: 'completed' },
  { id: 'pruefung', label: 'Prüfung', state: 'active' },
  { id: 'entscheidung', label: 'Entscheidung', state: 'inactive' },
  { id: 'entwurf', label: 'Entwurf', state: 'inactive' },
  { id: 'versand', label: 'Versand', state: 'inactive' },
];

export const mockChecklistItems: ChecklistItemData[] = [
  {
    id: 'c1',
    title: 'Vollständigkeit der Stammdaten prüfen',
    description: 'Geprüft am 24.05.2024 durch System',
    checked: true,
  },
  {
    id: 'c2',
    title: 'Anbauverordnung (BauO NRW) abgleichen',
    description: 'Prüfung der Abstandsflächen erforderlich',
    checked: false,
    statusLabel: 'Offen',
  },
  {
    id: 'c3',
    title: 'Nachbarschaftsbeteiligung prüfen',
    description: 'Zustimmung der Flurstücke 102/3 und 102/4 liegt vor',
    checked: false,
  },
];

export const mockDocuments: DocumentItemData[] = [
  { id: 'd1', name: 'Grundriss_V1.pdf', type: 'Planzeichnung', date: '20.05.2024', status: 'Geprüft' },
  { id: 'd2', name: 'Lageplan_V2.pdf', type: 'Lageplan', date: '22.05.2024', status: 'Geprüft' },
];

export const mockTimelineEvents: TimelineEntryData[] = [
  {
    id: 't1',
    author: 'Sabine Müller',
    time: 'Heute, 14:12',
    content: 'Rücksprache mit Antragsteller bezüglich Dacheindeckung und Brandschutz gehalten. Unterlagen werden nachgereicht.',
    type: 'edit',
  },
  {
    id: 't2',
    author: 'System',
    time: 'Heute, 10:45',
    content: 'Automatische Prüfung der Abstandsflächen: Konform.',
    type: 'system',
  },
];

export const mockRegulations: RegulationItemData[] = [
  { id: 'r1', code: '§ 65 BauO NRW', title: 'Brandschutzanforderungen bei baulichen Anlagen.' },
  { id: 'r2', code: '§ 6 BauO NRW', title: 'Abstandsflächen und Abstände.' },
];

export const mockChecklistProposals: ChecklistProposalData[] = [
  { id: 'p1', text: 'Prüfung der Dachneigung gemäß § 12 Abs 3.' },
  { id: 'p2', text: 'Einhaltung der Grundflächenzahl (GRZ).' },
];

export const mockCaseNotes: CaseNoteData[] = [
  {
    id: 'n1',
    author: 'Sabine Müller',
    time: 'Heute, 14:12',
    content: 'Rücksprache mit Antragsteller bezüglich Dacheindeckung und Brandschutz gehalten.',
  },
  {
    id: 'n2',
    author: 'Sabine Müller',
    time: 'Gestern, 16:30',
    content: 'Erste Durchsicht der eingereichten Unterlagen. Lageplan und Grundriss liegen vor.',
  },
];

export const DOCUMENT_TYPES = ['Planzeichnung', 'Lageplan', 'Brandschutznachweis', 'Nachbarschaftszustimmung', 'Sonstiges'] as const;
