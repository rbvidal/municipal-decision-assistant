import { ChecklistItem, DocumentItem, TimelineEvent, RegulationItem, ChecklistProposal, TabItem } from './types';

export const initialChecklist: ChecklistItem[] = [
  {
    id: 'step-1',
    title: 'Vollständigkeit der Stammdaten prüfen',
    description: 'Geprüft am 24.05.2024 durch System',
    checked: true,
  },
  {
    id: 'step-2',
    title: 'Anbauverordnung (BauO NRW) abgleichen',
    description: 'Prüfung der Abstandsflächen erforderlich',
    checked: false,
    statusLabel: 'Offen',
    statusColor: 'warning',
  },
  {
    id: 'step-3',
    title: 'Nachbarschaftsbeteiligung prüfen',
    description: 'Zustimmung der Flurstücke 102/3 und 102/4 liegt vor',
    checked: false,
  },
];

export const initialDocuments: DocumentItem[] = [
  {
    id: 'doc-1',
    name: 'Grundriss_V1.pdf',
    type: 'Planzeichnung',
    date: '20.05.2024',
    status: 'Geprüft',
  },
  {
    id: 'doc-2',
    name: 'Lageplan_V2.pdf',
    type: 'Lageplan',
    date: '22.05.2024',
    status: 'Geprüft',
  },
];

export const initialTimeline: TimelineEvent[] = [
  {
    id: 'evt-1',
    author: 'Sabine Müller',
    time: 'Heute, 14:12',
    content: 'Rückfrage bei Antragsteller bezüglich der Materialwahl für die Bedachung gehalten. Brandschutznachweis angefordert.',
    type: 'edit',
  },
  {
    id: 'evt-2',
    author: 'System',
    time: 'Heute, 10:45',
    content: 'Automatisierte Prüfung der Grenzabstände abgeschlossen. Ergebnis: Konform.',
    type: 'system',
  },
];

export const applicableRegulations: RegulationItem[] = [
  {
    id: 'reg-1',
    code: '§ 65 BauO NRW',
    title: 'Brandschutzanforderungen bei baulichen Anlagen.',
  },
  {
    id: 'reg-2',
    code: '§ 6 BauO NRW',
    title: 'Abstandsflächen und Abstände.',
  },
];

export const checklistProposals: ChecklistProposal[] = [
  {
    id: 'prop-1',
    text: 'Prüfung der Dachneigung gemäß §12 Abs 3.',
  },
  {
    id: 'prop-2',
    text: 'Einhaltung der Grundflächenzahl (GRZ).',
  },
];

export const subnavTabs: TabItem[] = [
  { id: 'posteingang', label: 'Posteingang', count: 3, type: 'secondary' as any },
  { id: 'offene', label: 'Offene Vorgänge', count: 12, type: 'primary' },
  { id: 'warten', label: 'Warten', count: 5, type: 'default' },
  { id: 'genehmigung', label: 'Genehmigung', count: 2, type: 'warning' },
  { id: 'archiv', label: 'Archiv', count: 47, type: 'default' },
];
