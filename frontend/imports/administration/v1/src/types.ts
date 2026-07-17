/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type ServiceStatus = "success" | "warning" | "danger" | "info";

export interface SystemService {
  id: string;
  name: string;
  status: ServiceStatus;
  versionOrStatusText: string;
}

export interface CorpusStatusItem {
  id: string;
  name: string;
  version: string;
  countText: string;
  countValue: number;
  hasProgressBar?: boolean;
}

export type JobStatus = "active" | "completed" | "failed";

export interface BackgroundJob {
  id: string;
  type: string;
  details: string;
  progress: number; // 0 to 100
  eta: string; // "08:45m" etc or "-"
  status: JobStatus;
  isWarningColor?: boolean;
}

export type AuditLogType = "success" | "warning" | "danger" | "info";

export interface AuditLog {
  id: string;
  event: string;
  timestamp: string;
  details: string;
  type: AuditLogType;
  icon: string; // Name of Lucide icon
}
