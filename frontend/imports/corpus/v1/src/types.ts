/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

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

export interface AppNotification {
  id: string;
  title: string;
  message: string;
  time: string;
  unread: boolean;
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
