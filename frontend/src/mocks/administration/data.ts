import type { TabItem } from "../../components/navigation";
export interface SystemHealth {
  apiStatus: "Online" | "Degraded" | "Offline";
  dbStatus: "Connected" | "Disconnected";
  qdrantStatus: "Online" | "Syncing" | "Offline";
  uptime: string;
  version: string;
  cpuPercent: number;
  memoryPercent: number;
  diskPercent: number;
}

export interface BackgroundJob {
  id: string;
  name: string;
  status: "Running" | "Completed" | "Failed" | "Queued";
  progress: number;
  startedAt: string;
  duration: string;
}

export interface AuditLogEntry {
  id: string;
  timestamp: string;
  user: string;
  action: string;
  target: string;
  ip: string;
}

export interface DepartmentConfig {
  id: string;
  name: string;
  shortCode: string;
  activeUsers: number;
  totalCases: number;
}

export const mockSystemHealth: SystemHealth = {
  apiStatus: "Online",
  dbStatus: "Connected",
  qdrantStatus: "Online",
  uptime: "14d 7h 32m",
  version: "2.4.1",
  cpuPercent: 31,
  memoryPercent: 58,
  diskPercent: 42,
};

export const mockBackgroundJobs: BackgroundJob[] = [
  {
    id: "j1",
    name: "Vollständige Re-Indizierung BauO NRW",
    status: "Running",
    progress: 62,
    startedAt: "Heute, 06:00",
    duration: "2h 14m",
  },
  {
    id: "j2",
    name: "Täglicher Datenabgleich DSGVO",
    status: "Completed",
    progress: 100,
    startedAt: "Heute, 04:00",
    duration: "18m",
  },
  {
    id: "j3",
    name: "OCR-Nachbearbeitung LHO Grundwerk",
    status: "Completed",
    progress: 100,
    startedAt: "Gestern, 22:00",
    duration: "45m",
  },
  {
    id: "j4",
    name: "Import Kommunalrecht BW",
    status: "Failed",
    progress: 42,
    startedAt: "Vor 3 Tagen",
    duration: "1h 8m",
  },
  {
    id: "j5",
    name: "Embedding-Generierung NEU",
    status: "Queued",
    progress: 0,
    startedAt: "—",
    duration: "—",
  },
];

export const mockAuditLogs: AuditLogEntry[] = [
  {
    id: "a1",
    timestamp: "Heute, 09:15",
    user: "Joachim Dehmel",
    action: "Paket aktualisiert",
    target: "Bauordnung NRW 2024",
    ip: "10.0.1.42",
  },
  {
    id: "a2",
    timestamp: "Heute, 08:47",
    user: "Sarah Lindner",
    action: "Benutzer angelegt",
    target: "m.schmitt@verwaltung.de",
    ip: "10.0.1.18",
  },
  {
    id: "a3",
    timestamp: "Heute, 08:00",
    user: "SYSTEM",
    action: "Automatische Indizierung",
    target: "DSGVO Kommentar",
    ip: "localhost",
  },
  {
    id: "a4",
    timestamp: "Gestern, 16:30",
    user: "Sarah Lindner",
    action: "Paket gelöscht",
    target: "VV BauO NRW (veraltet)",
    ip: "10.0.1.18",
  },
  {
    id: "a5",
    timestamp: "Gestern, 14:00",
    user: "SYSTEM",
    action: "Fehler bei Indizierung",
    target: "Kommunalrecht BW",
    ip: "localhost",
  },
  {
    id: "a6",
    timestamp: "Gestern, 11:22",
    user: "Dr. Michael Schmitt",
    action: "Berechtigung geändert",
    target: "e.rostova@verwaltung.de",
    ip: "10.0.2.55",
  },
];

export const mockDepartments: DepartmentConfig[] = [
  { id: "d1", name: "Bauaufsicht", shortCode: "BAU", activeUsers: 24, totalCases: 312 },
  { id: "d2", name: "Ordnungsamt", shortCode: "ORD", activeUsers: 18, totalCases: 156 },
  { id: "d3", name: "Umweltamt", shortCode: "UWB", activeUsers: 12, totalCases: 89 },
  { id: "d4", name: "Sozialamt", shortCode: "SOZ", activeUsers: 8, totalCases: 203 },
  { id: "d5", name: "Amt für Digitalisierung", shortCode: "DIG", activeUsers: 6, totalCases: 0 },
];

export const ADMIN_TABS: TabItem[] = [
  { id: "overview", label: "Übersicht" },
  { id: "jobs", label: "Aufträge" },
  { id: "audit", label: "Audit" },
  { id: "departments", label: "Dezernate" },
  { id: "settings", label: "Einstellungen" },
] as const;
