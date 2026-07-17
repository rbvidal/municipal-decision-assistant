/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Wissenspaket } from '../types';

interface OverviewDashboardProps {
  packages: Wissenspaket[];
  onNavigateToTab: (tab: string) => void;
  onOpenUpload: () => void;
}

export const OverviewDashboard: React.FC<OverviewDashboardProps> = ({
  packages,
  onNavigateToTab,
  onOpenUpload
}) => {
  // Compute key stats
  const totalDocs = packages.reduce((sum, p) => sum + p.documents, 0);
  const totalChunks = packages.reduce((sum, p) => sum + p.chunks, 0);
  const errorPackagesCount = packages.filter(p => p.status === 'Fehler').length;

  const kpis = [
    {
      title: 'Vektoren gesamt',
      value: totalChunks.toLocaleString('de-DE'),
      desc: 'In Qdrant indizierte Chunks',
      icon: 'database',
      color: 'text-primary bg-primary-container/10'
    },
    {
      title: 'Quell-Dokumente',
      value: totalDocs.toLocaleString('de-DE'),
      desc: 'Satzungen, Gesetze & Entwürfe',
      icon: 'description',
      color: 'text-secondary bg-secondary-container/10'
    },
    {
      title: 'Datenkonsistenz',
      value: `${((packages.length - errorPackagesCount) / packages.length * 100).toFixed(0)}%`,
      desc: `${errorPackagesCount} fehlerhafte Pakete`,
      icon: 'verified_user',
      color: errorPackagesCount > 0 ? 'text-warning bg-amber-50' : 'text-success bg-green-50'
    },
    {
      title: 'Wissenspakete',
      value: `${packages.length}`,
      desc: 'Aktive Regelwerke',
      icon: 'library_books',
      color: 'text-tertiary bg-blue-50'
    }
  ];

  return (
    <div className="space-y-lg select-none">
      
      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-md">
        {kpis.map((kpi, idx) => (
          <div key={idx} className="bg-white border border-border-standard rounded-lg p-xl flex items-start gap-md shadow-sm">
            <div className={`p-md rounded-lg ${kpi.color} shrink-0`}>
              <span className="material-symbols-outlined text-[24px] block">{kpi.icon}</span>
            </div>
            <div className="space-y-1">
              <p className="text-caption text-on-surface-variant font-semibold uppercase tracking-wider">{kpi.title}</p>
              <p className="text-display-stat font-bold text-primary tracking-tight">{kpi.value}</p>
              <p className="text-[12px] text-on-surface-variant leading-none">{kpi.desc}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-lg">
        {/* Core Quickstart Panel */}
        <div className="lg:col-span-8 bg-white border border-border-standard rounded-lg p-xl flex flex-col justify-between shadow-sm space-y-md">
          <div className="space-y-xs">
            <h3 className="text-h2 font-semibold text-primary">Willkommen beim Entscheidungs-Support</h3>
            <p className="text-body-base text-on-surface-variant max-w-2xl leading-relaxed">
              Dieses System ermöglicht dem Amt für Digitalisierung und den Dezernaten eine semantische Suche in der Wissensbasis aller Landesgesetze, Kommunalverordnungen und Beschlüsse der Bundesrepublik Deutschland.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-md">
            <div className="p-md border border-border-standard rounded-lg bg-surface-muted/30 flex flex-col justify-between space-y-2">
              <span className="material-symbols-outlined text-primary text-[24px]">upload_file</span>
              <div>
                <p className="text-caption font-semibold text-primary">Daten einpflegen</p>
                <p className="text-[11px] text-on-surface-variant">Laden Sie neue Gesetzestexte hoch.</p>
              </div>
              <button
                onClick={onOpenUpload}
                className="text-left text-caption text-secondary font-semibold hover:underline cursor-pointer"
              >
                Paket hochladen &rarr;
              </button>
            </div>

            <div className="p-md border border-border-standard rounded-lg bg-surface-muted/30 flex flex-col justify-between space-y-2">
              <span className="material-symbols-outlined text-secondary text-[24px]">database</span>
              <div>
                <p className="text-caption font-semibold text-secondary">Vektor-Index prüfen</p>
                <p className="text-[11px] text-on-surface-variant">Verwalten Sie Ihre Wissensdatenbank.</p>
              </div>
              <button
                onClick={() => onNavigateToTab('korpus')}
                className="text-left text-caption text-secondary font-semibold hover:underline cursor-pointer"
              >
                Index öffnen &rarr;
              </button>
            </div>

            <div className="p-md border border-border-standard rounded-lg bg-surface-muted/30 flex flex-col justify-between space-y-2">
              <span className="material-symbols-outlined text-success text-[24px]">history</span>
              <div>
                <p className="text-caption font-semibold text-success">Audit & Sicherheit</p>
                <p className="text-[11px] text-on-surface-variant">Überprüfen Sie administrative Zugriffe.</p>
              </div>
              <button
                onClick={() => onNavigateToTab('audit')}
                className="text-left text-caption text-secondary font-semibold hover:underline cursor-pointer"
              >
                Audit-Log einsehen &rarr;
              </button>
            </div>
          </div>
        </div>

        {/* System Health Summary */}
        <div className="lg:col-span-4 bg-white border border-border-standard rounded-lg p-xl shadow-sm flex flex-col justify-between">
          <div>
            <h4 className="text-caption font-bold text-primary uppercase tracking-wider mb-sm">
              Infrastruktur-Status
            </h4>
            <div className="divide-y divide-border-standard text-caption">
              <div className="py-md flex justify-between">
                <span className="text-on-surface-variant">API-Status</span>
                <span className="text-success font-semibold flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-success"></span>
                  Basiert (Online)
                </span>
              </div>
              <div className="py-md flex justify-between">
                <span className="text-on-surface-variant">Qdrant Node 1</span>
                <span className="text-success font-semibold flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-success animate-pulse"></span>
                  Aktiv
                </span>
              </div>
              <div className="py-md flex justify-between">
                <span className="text-on-surface-variant">Index-Schema</span>
                <span className="font-semibold text-primary">v4-dense-768</span>
              </div>
            </div>
          </div>

          <div className="p-sm bg-blue-50/50 rounded border border-blue-100 flex gap-sm mt-md">
            <span className="material-symbols-outlined text-secondary text-[18px]">cloud_sync</span>
            <p className="text-[11px] text-on-surface-variant leading-normal">
              Die Vektordatenbank ist vollständig mit den kommunalen Dokumentenservern abgeglichen.
            </p>
          </div>
        </div>
      </div>

    </div>
  );
};
