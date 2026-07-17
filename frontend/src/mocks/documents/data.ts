export type DocumentStatus = "Aktiv" | "In Prüfung" | "Fehlend" | "Archiviert";
export type DocumentType =
  "Antrag" | "Lageplan" | "Nachweis" | "Beilage" | "Vorlage" | "Formular" | "Sonstiges";

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

export interface DocumentItem {
  id: string;
  name: string;
  vorgangId: string;
  buerger: string;
  typ: DocumentType;
  version: string;
  status: DocumentStatus;
  geaendert: string;
  dokumentId: string;
  detailedTyp: string;
  dateigroesse: string;
  hochgeladenAm: string;
  versions: VersionInfo[];
  references: ReferenceInfo[];
  history: HistoryEvent[];
  ocrStatus: string;
  vektorisierung: string;
  chunkCount: number;
  vectorId: string;
}

export const DOCUMENT_CATEGORIES = [
  { id: "vorgangsdokumente", label: "Vorgangsdokumente", count: 45 },
  { id: "meine", label: "Meine Dokumente", count: 12 },
  { id: "eingehend", label: "Eingehende Dokumente", count: 8 },
  { id: "ausgehend", label: "Ausgehende Dokumente", count: 15 },
  { id: "vorlagen", label: "Vorlagen", count: 24 },
  { id: "formulare", label: "Formulare", count: 10 },
  { id: "archiv", label: "Archiv" },
  { id: "favoriten", label: "Favoriten" },
];

export const DOCUMENT_STATUS_LABELS: Record<DocumentStatus, string> = {
  Aktiv: "Aktiv",
  "In Prüfung": "In Prüfung",
  Fehlend: "Fehlend",
  Archiviert: "Archiviert",
};

export const DOCUMENT_STATUS_COLORS: Record<
  DocumentStatus,
  "success" | "warning" | "error" | "neutral"
> = {
  Aktiv: "success",
  "In Prüfung": "warning",
  Fehlend: "error",
  Archiviert: "neutral",
};

export const mockDocuments: DocumentItem[] = [
  {
    id: "doc-1",
    name: "Bauantrag_Carport_Müller.pdf",
    vorgangId: "BAU-2026-0147",
    buerger: "Thomas Müller",
    typ: "Antrag",
    version: "v2.1",
    status: "Aktiv",
    geaendert: "Heute, 14:12",
    dokumentId: "DOC-2024-08421",
    detailedTyp: "Bauantrag nach § 65 BauO NRW",
    dateigroesse: "4.2 MB",
    hochgeladenAm: "15.05.2024, 10:34",
    versions: [
      { version: "v2.1", date: "15.05.2024", author: "Sabine Müller", isCurrent: true },
      { version: "v2.0", date: "10.05.2024", author: "Sabine Müller", isCurrent: false },
      { version: "v1.0", date: "01.04.2024", author: "Thomas Müller", isCurrent: false },
    ],
    references: [
      { id: "r1", title: "§ 65 BauO NRW — Bauantrag und Bauvorlagen", type: "gavel" },
      { id: "r2", title: "§ 64 BauO NRW — Vereinfachtes Verfahren", type: "gavel" },
    ],
    history: [
      {
        id: "h1",
        title: "Dokument hochgeladen",
        timestamp: "15.05.2024, 10:34",
        author: "Sabine Müller",
        status: "completed",
      },
      {
        id: "h2",
        title: "OCR-Texterkennung abgeschlossen",
        timestamp: "15.05.2024, 10:35",
        author: "System",
        status: "completed",
      },
      {
        id: "h3",
        title: "Vektordatenbank-Indizierung",
        timestamp: "15.05.2024, 10:36",
        author: "System",
        status: "completed",
      },
    ],
    ocrStatus: "COMPLETED",
    vektorisierung: "SUCCESS",
    chunkCount: 24,
    vectorId: "vec-8a3f2b1c",
  },
  {
    id: "doc-2",
    name: "Lageplan_Flurstück_102-5.pdf",
    vorgangId: "BAU-2026-0147",
    buerger: "Thomas Müller",
    typ: "Lageplan",
    version: "v1.0",
    status: "Aktiv",
    geaendert: "Gestern, 16:30",
    dokumentId: "DOC-2024-08390",
    detailedTyp: "Amtlicher Lageplan M 1:500",
    dateigroesse: "8.1 MB",
    hochgeladenAm: "12.05.2024, 09:15",
    versions: [{ version: "v1.0", date: "12.05.2024", author: "Thomas Müller", isCurrent: true }],
    references: [{ id: "r3", title: "§ 2 BauVorlV — Bauvorlagenverordnung", type: "article" }],
    history: [
      {
        id: "h4",
        title: "Dokument hochgeladen",
        timestamp: "12.05.2024, 09:15",
        author: "Thomas Müller",
        status: "completed",
      },
    ],
    ocrStatus: "COMPLETED",
    vektorisierung: "SUCCESS",
    chunkCount: 12,
    vectorId: "vec-7b2e1d4f",
  },
  {
    id: "doc-3",
    name: "Brandschutznachweis_V3.pdf",
    vorgangId: "BAU-2026-0147",
    buerger: "Thomas Müller",
    typ: "Nachweis",
    version: "v3.2",
    status: "In Prüfung",
    geaendert: "Heute, 09:00",
    dokumentId: "DOC-2024-08500",
    detailedTyp: "Brandschutznachweis nach § 65 BauO NRW",
    dateigroesse: "12.7 MB",
    hochgeladenAm: "18.05.2024, 14:22",
    versions: [
      { version: "v3.2", date: "18.05.2024", author: "Sabine Müller", isCurrent: true },
      { version: "v3.1", date: "15.05.2024", author: "Sabine Müller", isCurrent: false },
      { version: "v3.0", date: "10.05.2024", author: "Brandschutzbüro", isCurrent: false },
      { version: "v2.0", date: "01.03.2024", author: "Brandschutzbüro", isCurrent: false },
    ],
    references: [
      { id: "r4", title: "§ 65 BauO NRW — Brandschutz", type: "gavel" },
      { id: "r5", title: "DIN 14090 — Feuerwehrzufahrt", type: "article" },
    ],
    history: [
      {
        id: "h5",
        title: "Dokument zur Prüfung eingereicht",
        timestamp: "18.05.2024, 14:22",
        author: "Sabine Müller",
        status: "completed",
      },
      {
        id: "h6",
        title: "Fachliche Prüfung läuft",
        timestamp: "19.05.2024, 08:15",
        author: "System",
        status: "info",
      },
    ],
    ocrStatus: "COMPLETED",
    vektorisierung: "PENDING",
    chunkCount: 48,
    vectorId: "vec-9c4a5d6e",
  },
  {
    id: "doc-4",
    name: "Nachbarzustimmung_Schmidt.pdf",
    vorgangId: "BAU-2026-0147",
    buerger: "Thomas Müller",
    typ: "Beilage",
    version: "v1.0",
    status: "Aktiv",
    geaendert: "Vor 2 Tagen",
    dokumentId: "DOC-2024-08200",
    detailedTyp: "Schriftliche Nachbarzustimmung",
    dateigroesse: "1.2 MB",
    hochgeladenAm: "08.05.2024, 11:00",
    versions: [{ version: "v1.0", date: "08.05.2024", author: "Thomas Müller", isCurrent: true }],
    references: [],
    history: [
      {
        id: "h7",
        title: "Dokument hochgeladen",
        timestamp: "08.05.2024, 11:00",
        author: "Thomas Müller",
        status: "completed",
      },
    ],
    ocrStatus: "COMPLETED",
    vektorisierung: "SUCCESS",
    chunkCount: 4,
    vectorId: "vec-1a2b3c4d",
  },
  {
    id: "doc-5",
    name: "Stellplatznachweis_Anlage.pdf",
    vorgangId: "ORD-2024-8812",
    buerger: "Anna Schmidt",
    typ: "Nachweis",
    version: "v1.0",
    status: "Fehlend",
    geaendert: "Vor 1 Woche",
    dokumentId: "DOC-2024-07900",
    detailedTyp: "Stellplatznachweis gemäß Stellplatzsatzung",
    dateigroesse: "—",
    hochgeladenAm: "—",
    versions: [],
    references: [{ id: "r6", title: "§ 48 BauO NRW — Stellplatzpflicht", type: "gavel" }],
    history: [
      {
        id: "h8",
        title: "Dokument als fehlend markiert",
        timestamp: "01.05.2024, 08:00",
        author: "System",
        status: "system",
      },
    ],
    ocrStatus: "—",
    vektorisierung: "—",
    chunkCount: 0,
    vectorId: "—",
  },
  {
    id: "doc-6",
    name: "Baugenehmigung_Entwurf_v2.pdf",
    vorgangId: "BAU-2023-0912",
    buerger: "Klaus Becker",
    typ: "Antrag",
    version: "v2.0",
    status: "Archiviert",
    geaendert: "12.03.2023",
    dokumentId: "DOC-2023-05100",
    detailedTyp: "Baugenehmigung — archiviert",
    dateigroesse: "3.8 MB",
    hochgeladenAm: "12.03.2023, 16:45",
    versions: [
      { version: "v2.0", date: "12.03.2023", author: "Sabine Müller", isCurrent: true },
      { version: "v1.0", date: "01.02.2023", author: "Sabine Müller", isCurrent: false },
    ],
    references: [{ id: "r7", title: "§ 65 BauO NRW", type: "gavel" }],
    history: [
      {
        id: "h9",
        title: "Dokument archiviert",
        timestamp: "12.03.2023, 16:45",
        author: "Sabine Müller",
        status: "completed",
      },
    ],
    ocrStatus: "COMPLETED",
    vektorisierung: "SUCCESS",
    chunkCount: 18,
    vectorId: "vec-5e6f7g8h",
  },
];
