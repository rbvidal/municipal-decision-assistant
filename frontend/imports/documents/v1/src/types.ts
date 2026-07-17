/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export enum DocumentStatus {
  Aktiv = "Aktiv",
  InPruefung = "In Prüfung",
  Fehlend = "Fehlend",
  Archiviert = "Archiviert",
}

export interface Document {
  id: string;
  name: string;
  vorgangId: string;
  buerger: string;
  typ: string;
  version: string;
  status: DocumentStatus;
  geaendert: string;
  
  // Detailed metadata
  dokumentId: string;
  detailedTyp: string;
  dateigroesse: string;
  hochgeladenAm: string;
  
  // Versions
  versions: VersionInfo[];
  
  // References
  references: ReferenceInfo[];
  
  // History
  history: HistoryEvent[];
  
  // Expanded/Technical details
  ocrStatus: string;
  vektorisierung: string;
  chunkCount: number;
  vectorId: string;
}

export interface VersionInfo {
  version: string;
  date: string;
  author: string;
  isCurrent: boolean;
}

export interface ReferenceInfo {
  id: string;
  title: string;
  type: "gavel" | "article";
}

export interface HistoryEvent {
  id: string;
  title: string;
  timestamp: string;
  author: string;
  status: "completed" | "info" | "system";
}
