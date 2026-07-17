/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Vorgang, NextTask, Suggestion, StatCard } from './types';

export const mockNextTask: NextTask = {
  id: 'BAU-2026-0147',
  title: 'Bauantrag Carport',
  risk: 'Gering',
  lastModified: 'Vor 2 Std.',
  priority: 'Hoch',
};

export const mockVorgaenge: Vorgang[] = [
  {
    id: 'BAU-2026-0092',
    title: 'Sanierung Dachstuhl (Dringend)',
    status: 'Überfällig',
    dueDate: 'Gestern',
    actionText: 'Bearbeiten',
  },
  {
    id: 'ORD-2024-8812',
    title: 'Sondernutzung Marktplatz',
    status: 'In Prüfung',
    dueDate: 'Heute, 16:00',
    actionText: 'Bearbeiten',
  },
  {
    id: 'BAU-2026-0147',
    title: 'Bauantrag Carport (Müller)',
    status: 'In Bearbeitung',
    dueDate: '28. Okt.',
    actionText: 'Bearbeiten',
  },
  {
    id: 'STR-2024-0012',
    title: 'Straßensperrung Schulstraße',
    status: 'Wartet Bürger',
    dueDate: '30. Okt.',
    actionText: 'Bearbeiten',
  },
  {
    id: 'BAU-2026-0201',
    title: 'Anbau Wintergarten',
    status: 'Erfasst',
    dueDate: '02. Nov.',
    actionText: 'Bearbeiten',
  },
];

export const mockSuggestions: Suggestion[] = [
  {
    id: 's1',
    caseId: 'BAU-2026-0147',
    type: 'Vorschlag',
    title: 'Anwendung §65 BauO NRW prüfen',
    description: 'Aufgrund der Quadratmeterzahl (18m²) könnte das vereinfachte Verfahren anwendbar sein.',
    actionLabel: 'Rechtstext öffnen',
  },
  {
    id: 's2',
    caseId: 'ORD-2024-8812',
    type: 'Vorschlag',
    title: 'Unterlagen anfordern',
    description: 'Der Lageplan des Marktplatzes scheint veraltet zu sein. System schlägt aktuelle Anforderung vor.',
    actionLabel: 'E-Mail Entwurf',
  },
  {
    id: 's3',
    caseId: 'STR-2024-0012',
    type: 'Zusammenfassung',
    title: 'Stellungnahme der Polizei liegt vor',
    description: 'Inhalt: Keine Bedenken bei Einhaltung der Absperrung zwischen 08:00 und 14:00 Uhr.',
  },
];

export const mockStats: StatCard[] = [
  {
    id: 'meine_vorgaenge',
    label: 'Meine Vorgänge',
    value: 48,
    percentage: 66,
    colorClass: 'text-text-primary',
    barColorClass: 'bg-primary',
  },
  {
    id: 'heute_faellig',
    label: 'Heute fällig',
    value: 5,
    percentage: 25,
    colorClass: 'text-status-warning',
    barColorClass: 'bg-status-dot-amber',
  },
  {
    id: 'ueberfaellig',
    label: 'Überfällig',
    value: 2,
    percentage: 8,
    colorClass: 'text-status-error',
    barColorClass: 'bg-status-dot-red',
  },
  {
    id: 'wartet_buerger',
    label: 'Wartet Bürger',
    value: 12,
    percentage: 0,
    colorClass: 'text-on-surface-variant',
    barColorClass: '',
  },
  {
    id: 'wartet_behoerde',
    label: 'Wartet Behörde',
    value: 8,
    percentage: 0,
    colorClass: 'text-on-surface-variant',
    barColorClass: '',
  },
  {
    id: 'heute_erledigt',
    label: 'Heute erledigt',
    value: 4,
    percentage: 33,
    colorClass: 'text-status-success',
    barColorClass: 'bg-status-dot-green',
  },
];
