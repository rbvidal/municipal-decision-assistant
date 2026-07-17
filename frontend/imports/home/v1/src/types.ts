/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface Vorgang {
  id: string;
  title: string;
  status: 'Überfällig' | 'In Prüfung' | 'In Bearbeitung' | 'Wartet Bürger' | 'Erfasst';
  dueDate: string;
  actionText: string;
}

export interface NextTask {
  id: string;
  title: string;
  risk: 'Gering' | 'Mittel' | 'Hoch';
  lastModified: string;
  priority: string;
}

export interface Suggestion {
  id: string;
  caseId: string;
  type: 'Vorschlag' | 'Zusammenfassung';
  title: string;
  description: string;
  actionLabel?: string;
}

export interface StatCard {
  id: string;
  label: string;
  value: number;
  percentage: number; // For progress bar width (e.g. 66 for 2/3)
  colorClass: string; // e.g. text-text-primary, text-status-warning, text-status-error, etc.
  barColorClass: string; // e.g. bg-primary, bg-status-dot-amber, bg-status-dot-red, etc.
}
