/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { QdrantMetrics } from '../types';

interface StatusSidebarProps {
  metrics: QdrantMetrics;
  onOpenManagement: () => void;
  isSyncing: boolean;
}

export const StatusSidebar: React.FC<StatusSidebarProps> = ({
  metrics,
  onOpenManagement,
  isSyncing
}) => {
  const [showNotificationAlert, setShowNotificationAlert] = useState(true);

  // Derive dynamic metrics if syncing
  const displayCpu = isSyncing ? 82.5 : metrics.cpuUsagePercent;
  const displayLatency = isSyncing ? '2.1' : `${metrics.latencyP95}`;
  const displayStatus = isSyncing ? 'Syncing' : metrics.status;

  // Pie/circular math: radius=56, circumference=2*pi*r = 351.85
  // We want to draw a 68% segment.
  // strokeDashoffset = circumference - (percent / 100) * circumference
  // For 68%: 351.85 - (0.68 * 351.85) = 112.6
  // This matches the design perfectly!
  const strokeDasharray = 351.85;
  const strokeDashoffset = 351.85 - (0.68 * 351.85);

  return (
    <div className="col-span-12 xl:col-span-3 flex flex-col gap-lg select-none">
      
      {/* Qdrant Status Card */}
      <div className="bg-surface-container-lowest border border-border-standard rounded-lg overflow-hidden flex flex-col shadow-sm">
        <div className="px-xl py-lg border-b border-border-standard bg-white">
          <h3 className="text-h3 font-semibold flex items-center gap-sm text-primary">
            <span className="material-symbols-outlined text-primary text-[20px]">analytics</span>
            Vektordatenbank (Qdrant)
          </h3>
        </div>
        
        <div className="p-xl space-y-lg bg-white">
          {/* Systemstatus */}
          <div className="flex flex-col gap-base">
            <div className="flex justify-between items-center text-caption font-semibold">
              <span className="text-on-surface-variant">Systemstatus</span>
              {displayStatus === 'Online' && (
                <span className="text-success flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-success"></span>
                  Online
                </span>
              )}
              {displayStatus === 'Syncing' && (
                <span className="text-secondary flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-secondary animate-ping"></span>
                  Synchronisiere...
                </span>
              )}
              {displayStatus === 'Offline' && (
                <span className="text-danger flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-danger"></span>
                  Offline
                </span>
              )}
            </div>
            <div className="h-2 w-full bg-surface-muted rounded-full overflow-hidden border border-border-standard/40">
              <div 
                className={`h-full transition-all duration-500 ${isSyncing ? 'bg-secondary animate-pulse' : 'bg-success'}`}
                style={{ width: '100%' }}
              ></div>
            </div>
          </div>

          {/* Latency & Size Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-1 gap-md">
            {/* Latency (P95) */}
            <div className="p-md bg-surface-muted rounded border border-border-standard transition-all hover:bg-surface-container-low/20">
              <p className="text-caption text-on-surface-variant uppercase tracking-wider font-semibold">
                Latenz (p95)
              </p>
              <p className="text-display-stat font-bold text-primary tracking-tight">
                {displayLatency} ms
              </p>
            </div>
            
            {/* Index Size */}
            <div className="p-md bg-surface-muted rounded border border-border-standard transition-all hover:bg-surface-container-low/20">
              <p className="text-caption text-on-surface-variant uppercase tracking-wider font-semibold">
                Index-Größe
              </p>
              <p className="text-display-stat font-bold text-primary tracking-tight">
                {metrics.indexSizeGB} GB
              </p>
            </div>
          </div>

          {/* CPU Allocation indicator */}
          <div className="space-y-sm">
            <div className="flex justify-between text-caption font-medium">
              <span className="text-on-surface-variant">CPU Auslastung</span>
              <span className="font-mono">{displayCpu}%</span>
            </div>
            <div className="h-1.5 w-full bg-surface-muted rounded-full overflow-hidden">
              <div 
                className="h-full bg-primary transition-all duration-500" 
                style={{ width: `${displayCpu}%` }}
              ></div>
            </div>
          </div>
        </div>
      </div>

      {/* Storage Allocation Card */}
      <div className="bg-surface-container-lowest border border-border-standard rounded-lg overflow-hidden flex flex-col shadow-sm">
        <div className="px-xl py-lg border-b border-border-standard bg-white">
          <h3 className="text-h3 font-semibold flex items-center gap-sm text-primary">
            <span className="material-symbols-outlined text-primary text-[20px]">storage</span>
            Speicherbelegung
          </h3>
        </div>
        
        <div className="p-xl space-y-md bg-white">
          {/* Radial progress representation */}
          <div className="flex flex-col items-center justify-center py-lg">
            <div className="relative w-32 h-32 flex items-center justify-center">
              <svg className="w-full h-full rotate-[-90deg]">
                <circle 
                  cx="64" 
                  cy="64" 
                  fill="transparent" 
                  r="56" 
                  stroke="#E2E8F0" 
                  strokeWidth="12"
                ></circle>
                <circle 
                  cx="64" 
                  cy="64" 
                  fill="transparent" 
                  r="56" 
                  stroke="#002045" 
                  strokeWidth="12"
                  strokeDasharray={strokeDasharray}
                  strokeDashoffset={strokeDashoffset}
                  strokeLinecap="round"
                  className="transition-all duration-1000 ease-out"
                ></circle>
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-display-stat font-bold text-primary">68%</span>
                <span className="text-[10px] text-on-surface-variant uppercase font-semibold tracking-wider">
                  Gesamt
                </span>
              </div>
            </div>
          </div>

          {/* Disk breakdown details */}
          <div className="space-y-base bg-surface-muted/50 p-sm rounded border border-border-standard/40">
            <div className="flex items-center gap-sm text-caption">
              <span className="w-2.5 h-2.5 rounded-full bg-primary shrink-0"></span>
              <span className="text-on-surface-variant flex-1">Vektoren</span>
              <span className="font-semibold text-on-surface">{metrics.vectorsGB} GB</span>
            </div>
            <div className="flex items-center gap-sm text-caption">
              <span className="w-2.5 h-2.5 rounded-full bg-secondary shrink-0"></span>
              <span className="text-on-surface-variant flex-1">Metadaten</span>
              <span className="font-semibold text-on-surface">{metrics.metadataGB} GB</span>
            </div>
            <div className="flex items-center gap-sm text-caption">
              <span className="w-2.5 h-2.5 rounded-full bg-outline shrink-0"></span>
              <span className="text-on-surface-variant flex-1">Logs & Cache</span>
              <span className="font-semibold text-on-surface">{metrics.logsCacheGB} GB</span>
            </div>
          </div>

          <button 
            onClick={onOpenManagement}
            className="w-full mt-md py-sm border border-border-standard rounded text-body-base hover:bg-surface-muted transition-all duration-150 cursor-pointer text-primary font-semibold text-center hover:border-primary/50"
            id="open-storage-management-btn"
          >
            Verwaltung öffnen
          </button>
        </div>
      </div>

      {/* Info Alert Maintenance */}
      {showNotificationAlert && (
        <div className="p-lg bg-surface-muted border border-border-standard rounded-lg flex gap-md relative">
          <span className="material-symbols-outlined text-warning text-[24px] shrink-0">info</span>
          <div className="space-y-xs pr-4">
            <p className="text-caption font-semibold text-on-surface">Systemhinweis</p>
            <p className="text-[12px] text-on-surface-variant leading-relaxed">
              Die automatische Re-Indizierung ist für heute Nacht um 02:00 Uhr geplant.
            </p>
          </div>
          <button
            onClick={() => setShowNotificationAlert(false)}
            className="absolute top-2 right-2 text-on-surface-variant hover:text-primary cursor-pointer text-[16px]"
            title="Schließen"
          >
            <span className="material-symbols-outlined text-[16px]">close</span>
          </button>
        </div>
      )}

    </div>
  );
};
