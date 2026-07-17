import type { VorgangStatus } from "../types";

export interface MockVorgang {
  id: string;
  title: string;
  status: VorgangStatus;
  dueDate: string;
  actionText: string;
}

export interface MockNextTask {
  id: string;
  title: string;
  risk: "gering" | "mittel" | "hoch";
  lastModified: string;
  priority: "high" | "medium" | "low";
}

export interface MockSuggestion {
  id: string;
  caseId: string;
  type: "Vorschlag" | "Zusammenfassung";
  title: string;
  description: string;
  actionLabel?: string;
}

export interface MockStat {
  id: string;
  label: string;
  value: number;
  percentage?: number;
  status: "info" | "warning" | "error" | "neutral" | "success";
}

export const mockNextTask: MockNextTask = {
  id: "BAU-2026-0147",
  title: "Bauantrag Carport",
  risk: "gering",
  priority: "high",
  lastModified: "Vor 2 Std.",
};

export const mockVorgaenge: MockVorgang[] = [
  {
    id: "BAU-2026-0092",
    title: "Sanierung Dachstuhl (Dringend)",
    status: "IN_REVIEW",
    dueDate: "Gestern",
    actionText: "Bearbeiten",
  },
  {
    id: "ORD-2024-8812",
    title: "Sondernutzung Marktplatz",
    status: "IN_REVIEW",
    dueDate: "Heute, 16:00",
    actionText: "Bearbeiten",
  },
  {
    id: "BAU-2026-0147",
    title: "Bauantrag Carport (Müller)",
    status: "DECISION_SUPPORT",
    dueDate: "28. Okt.",
    actionText: "Bearbeiten",
  },
  {
    id: "STR-2024-0012",
    title: "Straßensperrung Schulstraße",
    status: "WAITING_FOR_CITIZEN",
    dueDate: "30. Okt.",
    actionText: "Bearbeiten",
  },
  {
    id: "BAU-2026-0201",
    title: "Anbau Wintergarten",
    status: "NEW",
    dueDate: "02. Nov.",
    actionText: "Bearbeiten",
  },
];

export const mockSuggestions: MockSuggestion[] = [
  {
    id: "s1",
    caseId: "BAU-2026-0147",
    type: "Vorschlag",
    title: "Anwendung § 65 BauO NRW prüfen",
    description:
      "Das Vorhaben fällt unter die Verfahrensfreiheit nach § 65 BauO NRW. Prüfen Sie die Anwendung dieser Vorschrift.",
    actionLabel: "Rechtstext öffnen",
  },
  {
    id: "s2",
    caseId: "ORD-2024-8812",
    type: "Vorschlag",
    title: "Unterlagen anfordern",
    description:
      "Für die Sondernutzung des Marktplatzes fehlen noch der Lageplan und die Zustimmung des Ordnungsamtes.",
    actionLabel: "E-Mail Entwurf",
  },
  {
    id: "s3",
    caseId: "STR-2024-0012",
    type: "Zusammenfassung",
    title: "Stellungnahme der Polizei liegt vor",
    description:
      "Die Polizei hat keine Einwände gegen die temporäre Sperrung der Schulstraße am 15. November 2026.",
  },
];

export const mockStats: MockStat[] = [
  { id: "meine_vorgaenge", label: "Meine Vorgänge", value: 48, percentage: 66, status: "info" },
  { id: "heute_faellig", label: "Heute fällig", value: 5, percentage: 25, status: "warning" },
  { id: "ueberfaellig", label: "Überfällig", value: 2, percentage: 8, status: "error" },
  { id: "wartet_buerger", label: "Wartet auf Bürger", value: 12, status: "neutral" },
  { id: "wartet_behoerde", label: "Wartet auf Behörde", value: 8, status: "neutral" },
  { id: "heute_erledigt", label: "Heute erledigt", value: 4, percentage: 33, status: "success" },
];

export const WORKBENCH_GREETINGS = ["Guten Morgen", "Guten Tag", "Guten Abend"] as const;

export function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 10) return WORKBENCH_GREETINGS[0];
  if (hour < 17) return WORKBENCH_GREETINGS[1];
  return WORKBENCH_GREETINGS[2];
}
