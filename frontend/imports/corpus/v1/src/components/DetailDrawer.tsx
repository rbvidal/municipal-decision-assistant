/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Wissenspaket } from '../types';

interface DetailDrawerProps {
  pkg: Wissenspaket | null;
  onClose: () => void;
  onVerify: (id: string) => void;
  onDelete: (id: string) => void;
}

export const DetailDrawer: React.FC<DetailDrawerProps> = ({
  pkg,
  onClose,
  onVerify,
  onDelete
}) => {
  if (!pkg) return null;

  // Generate realistic legal text fragments based on package name
  const getMockChunkText = (name: string) => {
    if (name.includes('Bauordnung') || name.includes('NRW')) {
      return `BauO NRW 2024 - § 3 Allgemeine Anforderungen:
(1) Anlagen sind so anzuordnen, zu errichten, zu ändern und instand zu halten, dass die öffentliche Sicherheit und Ordnung, insbesondere Leben, Gesundheit und die natürlichen Lebensgrundlagen, nicht gefährdet werden.
(2) Für die Errichtung oder Änderung baulicher Anlagen ist eine Baugenehmigung erforderlich, soweit in § 61 bis § 63 nichts anderes bestimmt ist.`;
    }
    if (name.includes('LHO') || name.includes('haushalt')) {
      return `LHO § 34 Verpflichtungsermächtigungen:
(1) Verpflichtungen zur Leistung von Ausgaben für künftige Haushaltsjahre dürfen nur eingegangen werden, wenn der Haushaltsplan dazu ermächtigt.
(2) Sie dürfen im Haushaltsjahr in der Regel nur bis zu der im Haushaltsplan festgesetzten Höhe eingegangen werden. Ausnahmen bedürfen der Zustimmung des Finanzministeriums.`;
    }
    return `Mustertext - Abs. 1 Geltungsbereich:
Dieses Ortsrecht regelt alle behördlichen Verfahrensentscheidungen im zugewiesenen Kreisgebiet der Bundesrepublik Deutschland. Alle Vektoreinbettungen entsprechen der semantischen Kodierungsnorm des Bundesamtes für Sicherheit in der Informationstechnik (BSI).`;
  };

  return (
    <div className="fixed inset-y-0 right-0 z-90 w-full max-w-lg bg-white border-l border-border-standard shadow-2xl flex flex-col select-none animate-slide-in">
      
      {/* Drawer Header */}
      <div className="p-xl border-b border-border-standard flex justify-between items-center bg-surface-muted">
        <div className="flex items-center gap-sm">
          <span className="material-symbols-outlined text-primary text-[24px]">database</span>
          <div>
            <h3 className="text-h3 font-bold text-primary">Detailansicht</h3>
            <p className="text-[11px] text-on-surface-variant font-medium">Paket-ID: {pkg.id}</p>
          </div>
        </div>
        <button
          onClick={onClose}
          className="text-on-surface-variant hover:text-primary p-1.5 rounded-full hover:bg-surface-container cursor-pointer"
          title="Schließen"
        >
          <span className="material-symbols-outlined text-[20px]">close</span>
        </button>
      </div>

      {/* Drawer Content */}
      <div className="flex-1 overflow-y-auto p-xl space-y-lg">
        
        {/* Core Info */}
        <div className="space-y-xs">
          <span className="text-[11px] font-bold text-secondary uppercase tracking-wider">
            {pkg.description}
          </span>
          <h2 className="text-h2 font-bold text-primary">{pkg.name}</h2>
          <div className="flex gap-sm items-center pt-1">
            <span className="font-mono text-caption bg-surface-muted px-2 py-0.5 rounded border border-border-standard/40 text-on-surface-variant">
              {pkg.version}
            </span>
            <span className="text-[11px] text-on-surface-variant">
              Synchronisiert: {pkg.lastSync}
            </span>
          </div>
        </div>

        {/* State Status Badge */}
        <div className="p-md bg-surface-muted rounded-lg border border-border-standard/50 flex justify-between items-center">
          <span className="text-caption text-on-surface-variant font-medium">
            Einbettungsstatus
          </span>
          {pkg.status === 'Bereit' && (
            <span className="bg-success/10 text-success px-sm py-1 rounded text-caption font-semibold flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-success"></span>
              Einsatzbereit
            </span>
          )}
          {pkg.status === 'Indiziert...' && (
            <span className="bg-secondary-container/20 text-secondary px-sm py-1 rounded text-caption font-semibold flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-secondary animate-pulse"></span>
              Indizierung läuft
            </span>
          )}
          {pkg.status === 'Fehler' && (
            <span className="bg-error-container text-on-error-container px-sm py-1 rounded text-caption font-semibold flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-error animate-bounce"></span>
              Fehlerhaft
            </span>
          )}
        </div>

        {/* Quantitative Data */}
        <div className="grid grid-cols-2 gap-md">
          <div className="p-md border border-border-standard rounded-lg">
            <span className="text-[11px] text-on-surface-variant font-medium uppercase tracking-wider block">
              Quell-Dokumente
            </span>
            <span className="text-h2 font-bold text-primary">
              {pkg.documents.toLocaleString('de-DE')}
            </span>
          </div>
          <div className="p-md border border-border-standard rounded-lg">
            <span className="text-[11px] text-on-surface-variant font-medium uppercase tracking-wider block">
              Erzeugte Chunks
            </span>
            <span className="text-h2 font-bold text-primary">
              {pkg.chunks.toLocaleString('de-DE')}
            </span>
          </div>
        </div>

        {/* Semantic Vector Details */}
        <div className="space-y-base">
          <h4 className="text-caption font-bold text-primary uppercase tracking-wider">
            Vektorkonfiguration
          </h4>
          <div className="bg-surface-muted rounded-lg p-md border border-border-standard/50 space-y-2 text-caption">
            <div className="flex justify-between">
              <span className="text-on-surface-variant">Embedding-Modell:</span>
              <span className="font-semibold text-primary">text-embedding-004</span>
            </div>
            <div className="flex justify-between">
              <span className="text-on-surface-variant">Dimensionen:</span>
              <span className="font-mono text-primary font-semibold">768 (dense)</span>
            </div>
            <div className="flex justify-between">
              <span className="text-on-surface-variant">Chunking-Strategie:</span>
              <span className="font-semibold text-primary">Semantisch (Absatz)</span>
            </div>
            <div className="flex justify-between">
              <span className="text-on-surface-variant">Max. Token pro Chunk:</span>
              <span className="font-mono text-primary font-semibold">512 Token</span>
            </div>
          </div>
        </div>

        {/* Sample Chunk Preview */}
        <div className="space-y-base">
          <h4 className="text-caption font-bold text-primary uppercase tracking-wider flex justify-between items-center">
            <span>Beispiel-Chunk Vorschau</span>
            <span className="font-mono text-[10px] text-on-surface-variant bg-white px-2 py-0.5 rounded border border-border-standard/40">
              Chunk #001
            </span>
          </h4>
          <div className="bg-slate-900 text-slate-100 p-md rounded-lg font-mono text-[11px] leading-relaxed max-h-52 overflow-y-auto whitespace-pre-wrap border border-slate-950">
            {getMockChunkText(pkg.name)}
          </div>
        </div>

      </div>

      {/* Drawer Actions */}
      <div className="p-xl border-t border-border-standard bg-surface-muted flex gap-sm">
        <button
          onClick={() => {
            onVerify(pkg.id);
            alert('Re-Indizierung wurde für dieses Paket gestartet.');
          }}
          className="flex-1 bg-primary text-white py-sm rounded-lg font-semibold hover:bg-primary/90 transition-colors flex items-center justify-center gap-1 cursor-pointer text-caption"
        >
          <span className="material-symbols-outlined text-[16px]">sync</span>
          Re-Indizieren
        </button>
        <button
          onClick={() => {
            if (confirm(`Möchten Sie das Wissenspaket "${pkg.name}" wirklich aus der Vektordatenbank löschen?`)) {
              onDelete(pkg.id);
              onClose();
            }
          }}
          className="px-md py-sm border border-danger text-danger hover:bg-red-50 rounded-lg font-semibold transition-colors flex items-center justify-center gap-1 cursor-pointer text-caption"
          title="Löschen"
        >
          <span className="material-symbols-outlined text-[16px]">delete</span>
          Löschen
        </button>
      </div>

    </div>
  );
};
