export interface ChecklistItem {
  id: string;
  title: string;
  description: string;
  checked: boolean;
  statusLabel?: string;
  statusColor?: 'warning' | 'success' | 'none';
}

export interface DocumentItem {
  id: string;
  name: string;
  type: string;
  date: string;
  status: 'Geprüft' | 'Offen' | 'Fehlend';
}

export interface TimelineEvent {
  id: string;
  author: string;
  role?: string;
  time: string;
  content: string;
  type: 'edit' | 'system' | 'general';
}

export interface RegulationItem {
  id: string;
  code: string;
  title: string;
}

export interface ChecklistProposal {
  id: string;
  text: string;
}

export interface TabItem {
  id: string;
  label: string;
  count: number;
  type?: 'default' | 'primary' | 'warning';
}
