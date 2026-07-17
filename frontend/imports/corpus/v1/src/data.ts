/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Wissenspaket, QdrantMetrics, BackgroundJob, AuditLog, AppNotification } from './types';

export const INITIAL_WISSENSPAKETE: Wissenspaket[] = [
  {
    id: '1',
    name: 'Bauordnung NRW 2024',
    description: 'Landesrecht Nordrhein-Westfalen',
    version: 'v2.4.1',
    documents: 1240,
    chunks: 48291,
    status: 'Bereit',
    lastSync: 'Heute, 09:12'
  },
  {
    id: '2',
    name: 'LHO Grundwerk',
    description: 'Landeshaushaltsordnung',
    version: 'v1.0.8',
    documents: 850,
    chunks: 22104,
    status: 'Bereit',
    lastSync: 'Gestern, 18:45'
  },
  {
    id: '3',
    name: 'Vergaberecht Bund',
    description: 'GWB, VgV, UVgO',
    version: 'v3.2.0',
    documents: 2105,
    chunks: 104290,
    status: 'Indiziert...',
    lastSync: 'Vor 15 Min.'
  },
  {
    id: '4',
    name: 'Kommunalrecht BW',
    description: 'Baden-Württemberg Archiv',
    version: 'v0.9.1',
    documents: 560,
    chunks: 12440,
    status: 'Fehler',
    lastSync: '12.04.2024'
  },
  {
    id: '5',
    name: 'Flächennutzungsplan Muster',
    description: 'Musterverordnungen Stadtplanung',
    version: 'v1.2.0',
    documents: 410,
    chunks: 9820,
    status: 'Bereit',
    lastSync: '14.07.2026'
  },
  {
    id: '6',
    name: 'Gemeindeordnung NRW',
    description: 'GO NRW Vorschriften',
    version: 'v3.1.2',
    documents: 980,
    chunks: 32150,
    status: 'Bereit',
    lastSync: '10.07.2026'
  },
  {
    id: '7',
    name: 'KAG Abgabengesetz',
    description: 'Kommunalabgabengesetz Bayern',
    version: 'v2.0.0',
    documents: 620,
    chunks: 15400,
    status: 'Bereit',
    lastSync: '08.07.2026'
  },
  {
    id: '8',
    name: 'BGB Nachbarschaftsrecht',
    description: 'Nachbarschaftsgesetz Hessen',
    version: 'v1.1.0',
    documents: 340,
    chunks: 6200,
    status: 'Bereit',
    lastSync: '05.07.2026'
  },
  {
    id: '9',
    name: 'SGB VIII Kinder/Jugend',
    description: 'Sozialgesetzbuch Kommunalbezug',
    version: 'v4.1.0',
    documents: 1540,
    chunks: 88300,
    status: 'Bereit',
    lastSync: '29.06.2026'
  },
  {
    id: '10',
    name: 'VwVfG Verwaltungsverfahren',
    description: 'Bundes- und Landesrecht',
    version: 'v2.2.0',
    documents: 1100,
    chunks: 54200,
    status: 'Bereit',
    lastSync: '20.06.2026'
  },
  {
    id: '11',
    name: 'Bremische Landesbauordnung',
    description: 'BremLBO 2025',
    version: 'v1.0.2',
    documents: 480,
    chunks: 18120,
    status: 'Fehler',
    lastSync: '15.06.2026'
  },
  {
    id: '12',
    name: 'Sächsische Kommunalordnung',
    description: 'SächsGemO Richtlinien',
    version: 'v2.1.0',
    documents: 890,
    chunks: 24600,
    status: 'Bereit',
    lastSync: '12.06.2026'
  },
  {
    id: '13',
    name: 'Kita-Gesetz Brandenburg',
    description: 'KGB Kita-Archiv',
    version: 'v1.3.1',
    documents: 310,
    chunks: 8900,
    status: 'Bereit',
    lastSync: '10.06.2026'
  },
  {
    id: '14',
    name: 'Feuerwehrgesetz LSA',
    description: 'Brandschutz Sachsen-Anhalt',
    version: 'v2.0.4',
    documents: 520,
    chunks: 14300,
    status: 'Bereit',
    lastSync: '04.06.2026'
  },
  {
    id: '15',
    name: 'Thüringer Straßengesetz',
    description: 'ThürStrG Bestimmungen',
    version: 'v1.5.0',
    documents: 440,
    chunks: 11900,
    status: 'Bereit',
    lastSync: '01.06.2026'
  },
  {
    id: '16',
    name: 'Denkmalschutzgesetz BW',
    description: 'DSchG Denkmalschutz',
    version: 'v1.0.0',
    documents: 670,
    chunks: 20100,
    status: 'Bereit',
    lastSync: '25.05.2026'
  },
  {
    id: '17',
    name: 'Hundesteuersatzung Muster',
    description: 'Mustersatzungen Finanzen',
    version: 'v2.1.1',
    documents: 150,
    chunks: 3200,
    status: 'Bereit',
    lastSync: '20.05.2026'
  },
  {
    id: '18',
    name: 'Abwassersatzung Muster',
    description: 'Umweltrecht Kommunal',
    version: 'v1.8.0',
    documents: 220,
    chunks: 5800,
    status: 'Bereit',
    lastSync: '18.05.2026'
  },
  {
    id: '19',
    name: 'Friedhofssatzung Vorlage',
    description: 'Öffentliche Einrichtungen',
    version: 'v1.0.5',
    documents: 180,
    chunks: 4100,
    status: 'Bereit',
    lastSync: '12.05.2026'
  },
  {
    id: '20',
    name: 'Strabs-Ersatzrecht',
    description: 'Straßenbaubeitragsrecht',
    version: 'v1.2.3',
    documents: 290,
    chunks: 7400,
    status: 'Bereit',
    lastSync: '05.05.2026'
  },
  {
    id: '21',
    name: 'Spielplatzsatzung Vorlage',
    description: 'Jugend und Familie',
    version: 'v1.0.1',
    documents: 110,
    chunks: 2100,
    status: 'Bereit',
    lastSync: '01.05.2026'
  },
  {
    id: '22',
    name: 'Satzung Sondernutzung',
    description: 'Straßen- und Wegerecht',
    version: 'v2.1.0',
    documents: 310,
    chunks: 8300,
    status: 'Bereit',
    lastSync: '28.04.2026'
  },
  {
    id: '23',
    name: 'Zweitwohnungssteuer NRW',
    description: 'Satzungsarchiv Kommunen',
    version: 'v1.4.2',
    documents: 250,
    chunks: 6100,
    status: 'Bereit',
    lastSync: '20.04.2026'
  },
  {
    id: '24',
    name: 'Gewerbeordnung Handbuch',
    description: 'GewO Kommunaler Vollzug',
    version: 'v3.0.1',
    documents: 1150,
    chunks: 42100,
    status: 'Bereit',
    lastSync: '15.04.2026'
  }
];

export const INITIAL_METRICS: QdrantMetrics = {
  status: 'Online',
  latencyP95: 12.4,
  indexSizeGB: 8.42,
  cpuUsagePercent: 24.2,
  vectorsGB: 5.8,
  metadataGB: 1.2,
  logsCacheGB: 1.42
};

export const INITIAL_NOTIFICATIONS: AppNotification[] = [
  {
    id: 'n1',
    title: 'Indizierung abgeschlossen',
    message: 'Das Paket "Vergaberecht Bund" wurde erfolgreich aktualisiert und indiziert.',
    time: 'Vor 5 Min.',
    unread: true
  },
  {
    id: 'n2',
    title: 'Fehlerbericht generiert',
    message: 'Bei der Indizierung von "Kommunalrecht BW" wurden 12 fehlerhafte Chunks übersprungen.',
    time: 'Heute, 11:30',
    unread: true
  },
  {
    id: 'n3',
    title: 'System-Wartung',
    message: 'Die automatische Re-Indizierung ist für heute Nacht um 02:00 Uhr geplant.',
    time: 'Gestern, 14:00',
    unread: false
  }
];

export const MOCK_BACKGROUND_JOBS: BackgroundJob[] = [
  {
    id: 'job-101',
    name: 'Einbettung Vergaberecht Bund v3.2.0',
    status: 'Running',
    progress: 74,
    startedAt: 'Heute, 12:48'
  },
  {
    id: 'job-102',
    name: 'Optimierung Vektor-Index (HNSW)',
    status: 'Completed',
    progress: 100,
    startedAt: 'Heute, 08:30'
  },
  {
    id: 'job-103',
    name: 'Dokumentenanalyse Kommunalrecht BW v0.9.1',
    status: 'Failed',
    progress: 42,
    startedAt: 'Gestern, 15:10'
  }
];

export const MOCK_AUDIT_LOGS: AuditLog[] = [
  {
    id: 'log-001',
    timestamp: '15.07.2026 12:48:11',
    user: 'Joachim Dehmel (JD)',
    action: 'Paket Indizierung gestartet',
    target: 'Vergaberecht Bund v3.2.0'
  },
  {
    id: 'log-002',
    timestamp: '15.07.2026 11:22:04',
    user: 'Joachim Dehmel (JD)',
    action: 'Wissenspaket hochgeladen',
    target: 'Vergaberecht Bund'
  },
  {
    id: 'log-003',
    timestamp: '15.07.2026 09:12:45',
    user: 'SYSTEM',
    action: 'Automatische Synchronisation',
    target: 'Bauordnung NRW 2024'
  },
  {
    id: 'log-004',
    timestamp: '14.07.2026 18:45:10',
    user: 'Sarah Lindner (SL)',
    action: 'Paket synchronisiert',
    target: 'LHO Grundwerk'
  }
];
