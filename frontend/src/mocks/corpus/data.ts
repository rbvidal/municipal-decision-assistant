import type { TabItem } from '../../components/navigation';
export interface Wissenspaket {
  id: string;
  name: string;
  description: string;
  version: string;
  documents: number;
  chunks: number;
  status: 'Bereit' | 'Indiziert...' | 'Fehler';
  lastSync: string;
}

export interface QdrantMetrics {
  status: 'Online' | 'Offline' | 'Syncing';
  latencyP95: number;
  indexSizeGB: number;
  cpuUsagePercent: number;
  vectorsGB: number;
  metadataGB: number;
  logsCacheGB: number;
}

export interface BackgroundJob {
  id: string;
  name: string;
  status: 'Running' | 'Completed' | 'Failed';
  progress: number;
  startedAt: string;
}

export interface AuditLog {
  id: string;
  timestamp: string;
  user: string;
  action: string;
  target: string;
}

export const mockPackages: Wissenspaket[] = [
  { id: 'p1', name: 'Bauordnung NRW 2024', description: 'Landesbauordnung Nordrhein-Westfalen — vollständiger Gesetzestext mit Kommentierung', version: 'v3.2', documents: 42, chunks: 1247, status: 'Bereit', lastSync: 'Heute, 08:15' },
  { id: 'p2', name: 'Vergaberecht Bund', description: 'GWB, VgV, UVgO — Vergaberecht des Bundes mit EU-Schwellenwerten', version: 'v2.8', documents: 18, chunks: 892, status: 'Indiziert...', lastSync: 'Gestern, 22:30' },
  { id: 'p3', name: 'LHO Grundwerk', description: 'Landeshaushaltsordnung — Haushaltsgrundsätze, Wirtschaftlichkeit, Sparsamkeit', version: 'v4.1', documents: 28, chunks: 653, status: 'Bereit', lastSync: 'Heute, 04:00' },
  { id: 'p4', name: 'Kommunalrecht BW', description: 'Gemeindeordnung Baden-Württemberg — vollständiger Gesetzestext', version: 'v2.0', documents: 35, chunks: 1102, status: 'Fehler', lastSync: 'Vor 3 Tagen' },
  { id: 'p5', name: 'Bremische Landesbauordnung', description: 'BremLBO — Bauordnungsrecht der Freien Hansestadt Bremen', version: 'v1.5', documents: 15, chunks: 478, status: 'Fehler', lastSync: 'Vor 1 Woche' },
  { id: 'p6', name: 'DSGVO Kommentar', description: 'Datenschutz-Grundverordnung — Artikel-für-Artikel-Kommentierung', version: 'v5.0', documents: 99, chunks: 2847, status: 'Bereit', lastSync: 'Heute, 07:00' },
  { id: 'p7', name: 'VwVfG NRW', description: 'Verwaltungsverfahrensgesetz NRW — Verfahrensgrundsätze, Fristen, Zustellung', version: 'v2.3', documents: 12, chunks: 345, status: 'Bereit', lastSync: 'Gestern, 16:45' },
  { id: 'p8', name: 'BImSchG Bund', description: 'Bundes-Immissionsschutzgesetz — Genehmigungsverfahren, Grenzwerte', version: 'v3.0', documents: 22, chunks: 723, status: 'Bereit', lastSync: 'Heute, 02:00' },
];

export const mockMetrics: QdrantMetrics = {
  status: 'Online',
  latencyP95: 12.4,
  indexSizeGB: 8.42,
  cpuUsagePercent: 24.2,
  vectorsGB: 5.8,
  metadataGB: 1.2,
  logsCacheGB: 1.42,
};

export const mockBackgroundJobs: BackgroundJob[] = [
  { id: 'j1', name: 'Indizierung: Bauordnung NRW 2024', status: 'Running', progress: 74, startedAt: 'Heute, 07:30' },
  { id: 'j2', name: 'Re-Indizierung: DSGVO Kommentar', status: 'Completed', progress: 100, startedAt: 'Heute, 06:00' },
  { id: 'j3', name: 'Import: Kommunalrecht BW', status: 'Failed', progress: 42, startedAt: 'Vor 3 Tagen' },
];

export const mockAuditLogs: AuditLog[] = [
  { id: 'a1', timestamp: 'Heute, 09:15', user: 'Joachim Dehmel', action: 'Paket aktualisiert', target: 'Bauordnung NRW 2024' },
  { id: 'a2', timestamp: 'Heute, 08:00', user: 'SYSTEM', action: 'Automatische Indizierung', target: 'DSGVO Kommentar' },
  { id: 'a3', timestamp: 'Gestern, 16:30', user: 'Sarah Lindner', action: 'Paket gelöscht', target: 'VV BauO NRW (veraltet)' },
  { id: 'a4', timestamp: 'Gestern, 14:00', user: 'SYSTEM', action: 'Fehler bei Indizierung', target: 'Kommunalrecht BW' },
];

export const CORPUS_TABS: TabItem[] = [
  { id: 'overview', label: 'Übersicht' },
  { id: 'users', label: 'Benutzer' },
  { id: 'corpus', label: 'Korpus' },
  { id: 'jobs', label: 'Hintergrundjobs' },
  { id: 'benchmarks', label: 'Benchmarks' },
  { id: 'audit', label: 'Audit' },
] as const;
