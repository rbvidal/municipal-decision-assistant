/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef } from 'react';
import { Wissenspaket } from '../types';

interface UploadModalProps {
  onClose: () => void;
  onUploadComplete: (newPkg: Wissenspaket) => void;
}

export const UploadModal: React.FC<UploadModalProps> = ({
  onClose,
  onUploadComplete
}) => {
  const [name, setName] = useState('');
  const [jurisdiction, setJurisdiction] = useState('Landesrecht Nordrhein-Westfalen');
  const [version, setVersion] = useState('v1.0.0');
  const [docsCount, setDocsCount] = useState<number>(120);
  const [isDragging, setIsDragging] = useState(false);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [isSimulating, setIsSimulating] = useState(false);
  const [simulatedProgress, setSimulatedProgress] = useState(0);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    setIsSimulating(true);
    let currentProgress = 0;
    
    const interval = setInterval(() => {
      currentProgress += 10;
      setSimulatedProgress(currentProgress);
      
      if (currentProgress >= 100) {
        clearInterval(interval);
        
        // Calculate chunks: approx 35 per doc
        const chunks = docsCount * 35;
        
        const newPkg: Wissenspaket = {
          id: Math.random().toString(36).substring(2, 9),
          name: name.trim(),
          description: jurisdiction,
          version: version.trim() || 'v1.0.0',
          documents: docsCount || 1,
          chunks: chunks,
          status: 'Bereit',
          lastSync: 'Gerade eben'
        };
        
        onUploadComplete(newPkg);
        setIsSimulating(false);
        onClose();
      }
    }, 200);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      setUploadedFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setUploadedFile(e.target.files[0]);
    }
  };

  return (
    <div className="fixed inset-0 z-100 overflow-y-auto flex items-center justify-center select-none bg-primary/40 backdrop-blur-sm p-4">
      <div className="relative bg-white border border-border-standard rounded-xl w-full max-w-xl shadow-2xl overflow-hidden flex flex-col">
        
        {/* Modal Header */}
        <div className="px-xl py-lg border-b border-border-standard flex justify-between items-center bg-surface-muted">
          <div className="flex items-center gap-sm">
            <span className="material-symbols-outlined text-primary text-[24px]">upload_file</span>
            <h3 className="text-h2 font-semibold text-primary">Wissenspaket hochladen</h3>
          </div>
          <button
            onClick={onClose}
            disabled={isSimulating}
            className="text-on-surface-variant hover:text-primary p-1 rounded-full hover:bg-surface-container disabled:opacity-40 cursor-pointer"
            title="Schließen"
          >
            <span className="material-symbols-outlined text-[20px]">close</span>
          </button>
        </div>

        {isSimulating ? (
          /* Indexing progress display */
          <div className="p-xl flex flex-col items-center justify-center space-y-lg min-h-[320px]">
            <div className="relative w-24 h-24 flex items-center justify-center">
              <span className="material-symbols-outlined text-[48px] text-primary animate-pulse">
                cloud_sync
              </span>
              <div className="absolute inset-0 rounded-full border-4 border-surface-container-high border-t-primary animate-spin" />
            </div>
            <div className="text-center space-y-xs">
              <h4 className="font-semibold text-primary">Dokumente werden analysiert...</h4>
              <p className="text-caption text-on-surface-variant">
                Vektorisierung und Chunk-Zuweisung in Qdrant Vektordatenbank ({simulatedProgress}%)
              </p>
            </div>
            <div className="w-full bg-surface-muted h-3 rounded-full overflow-hidden border border-border-standard/50 max-w-md">
              <div
                className="bg-primary h-full transition-all duration-200"
                style={{ width: `${simulatedProgress}%` }}
              />
            </div>
          </div>
        ) : (
          /* Input Form */
          <form onSubmit={handleSubmit} className="p-xl space-y-md">
            
            {/* Package Name */}
            <div className="flex flex-col gap-base">
              <label className="text-body-semibold text-primary">Paketname *</label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="z.B. Bauordnung NRW 2024, Hundesteuersatzung Köln"
                className="border border-border-standard rounded-lg px-md h-[38px] text-body-base focus:ring-2 focus:ring-focus-ring-outer focus:border-primary outline-none bg-white text-on-surface"
              />
            </div>

            <div className="grid grid-cols-2 gap-md">
              {/* Version */}
              <div className="flex flex-col gap-base">
                <label className="text-body-semibold text-primary">Version</label>
                <input
                  type="text"
                  value={version}
                  onChange={(e) => setVersion(e.target.value)}
                  placeholder="z.B. v1.0.0"
                  className="border border-border-standard rounded-lg px-md h-[38px] text-body-base focus:ring-2 focus:ring-focus-ring-outer focus:border-primary outline-none bg-white text-on-surface"
                />
              </div>

              {/* Document Count Estimate */}
              <div className="flex flex-col gap-base">
                <label className="text-body-semibold text-primary">Dokumentenanzahl</label>
                <input
                  type="number"
                  min={1}
                  value={docsCount}
                  onChange={(e) => setDocsCount(Number(e.target.value))}
                  className="border border-border-standard rounded-lg px-md h-[38px] text-body-base focus:ring-2 focus:ring-focus-ring-outer focus:border-primary outline-none bg-white text-on-surface"
                />
              </div>
            </div>

            {/* Jurisdiction / Description */}
            <div className="flex flex-col gap-base">
              <label className="text-body-semibold text-primary">Klassifizierung / Geltungsbereich</label>
              <select
                value={jurisdiction}
                onChange={(e) => setJurisdiction(e.target.value)}
                className="border border-border-standard rounded-lg px-md h-[38px] text-body-base focus:ring-2 focus:ring-focus-ring-outer focus:border-primary outline-none bg-white text-on-surface"
              >
                <option value="Landesrecht Nordrhein-Westfalen">Landesrecht Nordrhein-Westfalen</option>
                <option value="Landeshaushaltsordnung (LHO)">Landeshaushaltsordnung (LHO)</option>
                <option value="Bundesrecht (GWB, VgV, UVgO)">Bundesrecht (GWB, VgV, UVgO)</option>
                <option value="Baden-Württemberg Archiv">Baden-Württemberg Archiv</option>
                <option value="Kommunales Ortsrecht / Stadtverordnung">Kommunales Ortsrecht / Stadtverordnung</option>
                <option value="Musterrichtlinien Städte und Gemeinden">Musterrichtlinien Städte und Gemeinden</option>
              </select>
            </div>

            {/* Drag & Drop File Container */}
            <div className="flex flex-col gap-base">
              <label className="text-body-semibold text-primary">Quelldokumente (PDF, CSV, TXT) *</label>
              <div
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                className={`border-2 border-dashed rounded-lg p-xl text-center cursor-pointer transition-all flex flex-col items-center justify-center space-y-sm ${
                  isDragging 
                    ? 'border-secondary bg-secondary-container/10' 
                    : uploadedFile 
                      ? 'border-success bg-success/5' 
                      : 'border-border-standard bg-surface-muted hover:bg-surface-container-low'
                }`}
              >
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  accept=".pdf,.csv,.txt,.json,.xml"
                  className="hidden"
                />
                
                {uploadedFile ? (
                  <>
                    <span className="material-symbols-outlined text-success text-[40px]">check_circle</span>
                    <div className="space-y-xs">
                      <p className="text-body-semibold text-success">{uploadedFile.name}</p>
                      <p className="text-caption text-on-surface-variant">
                        {(uploadedFile.size / 1024 / 1024).toFixed(2)} MB • Bereit für Indexierung
                      </p>
                    </div>
                  </>
                ) : (
                  <>
                    <span className="material-symbols-outlined text-on-surface-variant text-[40px]">
                      cloud_upload
                    </span>
                    <div className="space-y-xs">
                      <p className="text-body-base text-on-surface font-medium">
                        Datei per Drag & Drop hier ablegen oder anklicken
                      </p>
                      <p className="text-caption text-on-surface-variant">
                        PDFs, Satzungstexte, Haushaltspläne (max. 50MB)
                      </p>
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* Form Actions */}
            <div className="flex justify-end gap-sm pt-md border-t border-border-standard">
              <button
                type="button"
                onClick={onClose}
                className="px-lg py-sm border border-border-standard text-primary hover:bg-surface-muted font-semibold rounded-lg transition-colors cursor-pointer text-caption"
              >
                Abbrechen
              </button>
              <button
                type="submit"
                disabled={!uploadedFile || !name.trim()}
                className="px-lg py-sm bg-primary text-white font-semibold rounded-lg hover:bg-primary/90 disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer text-caption flex items-center gap-1"
              >
                <span className="material-symbols-outlined text-[16px]">sync</span>
                Indexierung starten
              </button>
            </div>

          </form>
        )}
      </div>
    </div>
  );
};
