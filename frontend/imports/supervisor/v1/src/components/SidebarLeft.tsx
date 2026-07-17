import React, { useRef, useState } from 'react';
import { FileText, Download, CheckCircle, Clock, AlertTriangle, Upload, User, Mail, Calendar } from 'lucide-react';
import { CaseDocument, Attachment } from '../types';

interface SidebarLeftProps {
  activeCase: CaseDocument;
  onAddAttachment: (attachment: Attachment) => void;
  onUserClick: (name: string) => void;
}

export default function SidebarLeft({
  activeCase,
  onAddAttachment,
  onUserClick,
}: SidebarLeftProps) {
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

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
      const file = e.dataTransfer.files[0];
      addNewAttachment(file);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      addNewAttachment(file);
    }
  };

  const addNewAttachment = (file: File) => {
    const sizeInMB = (file.size / (1024 * 1024)).toFixed(1) + ' MB';
    const newAttach: Attachment = {
      id: `attach-uploaded-${Date.now()}`,
      name: file.name,
      size: sizeInMB,
    };
    onAddAttachment(newAttach);
  };

  const triggerFileSelect = () => {
    fileInputRef.current?.click();
  };

  return (
    <aside className="w-sidebar-width border-r border-border-default bg-surface-container-low flex flex-col overflow-y-auto scrollbar-hide shrink-0">
      {/* Case Header */}
      <div className="p-lg border-b border-border-default bg-white">
        <div className="flex justify-between items-start mb-sm">
          <span className="font-mono text-case-id text-on-surface-variant uppercase tracking-wider">
            {activeCase.caseId}
          </span>
          <span className="bg-secondary-container text-on-secondary-container text-[11px] font-semibold px-2 py-0.5 rounded uppercase tracking-wide">
            {activeCase.statusLabel}
          </span>
        </div>
        <h1 className="text-headline-sm font-bold text-text-primary leading-tight">
          {activeCase.title}
        </h1>
      </div>

      <div className="p-lg space-y-lg">
        {/* Genehmigungsprozess */}
        <section className="bg-white p-4 rounded-lg border border-border-default/40 shadow-xs">
          <h3 className="text-caption font-bold text-on-surface-variant uppercase tracking-wider mb-sm">
            Genehmigungsprozess
          </h3>
          <div className="space-y-md">
            <div className="flex flex-col gap-0.5">
              <span className="text-[11px] font-medium text-text-secondary uppercase tracking-wider flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5 text-on-surface-variant" />
                Eingereicht am
              </span>
              <span className="text-body-md font-semibold text-text-primary">
                {activeCase.submittedAt}
              </span>
            </div>
            <div className="flex flex-col gap-0.5">
              <span className="text-[11px] font-medium text-text-secondary uppercase tracking-wider flex items-center gap-1">
                <User className="w-3.5 h-3.5 text-on-surface-variant" />
                Eingereicht von
              </span>
              <button
                onClick={() => onUserClick(activeCase.submittedBy)}
                className="text-body-md font-semibold underline decoration-primary text-primary text-left hover:text-on-primary-fixed-variant transition-all cursor-pointer"
              >
                {activeCase.submittedBy}
              </button>
            </div>
          </div>
        </section>

        {/* Prüfprotokoll */}
        <section className="bg-white p-4 rounded-lg border border-border-default/40 shadow-xs">
          <h3 className="text-caption font-bold text-on-surface-variant uppercase tracking-wider mb-md">
            Prüfprotokoll
          </h3>
          <div className="space-y-4">
            {activeCase.protocolSteps.map((step) => (
              <div key={step.id} className="flex gap-sm items-start">
                {step.status === 'completed' && (
                  <CheckCircle className="w-[18px] h-[18px] text-status-dot-green shrink-0 mt-0.5" />
                )}
                {step.status === 'pending' && (
                  <Clock className="w-[18px] h-[18px] text-status-dot-amber shrink-0 mt-0.5" />
                )}
                {step.status === 'failed' && (
                  <AlertTriangle className="w-[18px] h-[18px] text-error shrink-0 mt-0.5" />
                )}
                <div className="flex-1 min-w-0">
                  <p className="text-body-md font-medium text-text-primary leading-tight">
                    {step.title}
                  </p>
                  <p className="text-caption text-text-secondary mt-0.5 truncate">
                    {step.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Anhänge */}
        <section className="bg-white p-4 rounded-lg border border-border-default/40 shadow-xs">
          <h3 className="text-caption font-bold text-on-surface-variant uppercase tracking-wider mb-sm">
            Anhänge
          </h3>
          <div className="space-y-2">
            {activeCase.attachments.map((attach) => (
              <div
                key={attach.id}
                className="border border-outline-variant rounded bg-white p-2 flex items-center justify-between hover:bg-surface-container-low cursor-pointer transition-all group"
                title={`Datei ansehen: ${attach.name}`}
              >
                <div className="flex items-center gap-2 min-w-0">
                  <FileText className="w-4 h-4 text-on-surface-variant shrink-0" />
                  <span className="text-caption font-medium truncate text-text-primary group-hover:text-primary">
                    {attach.name}
                  </span>
                </div>
                <div className="flex items-center gap-1 shrink-0 text-on-surface-variant">
                  {attach.size && <span className="text-[10px] text-text-secondary">{attach.size}</span>}
                  <Download className="w-3.5 h-3.5 group-hover:text-primary transition-colors ml-1" />
                </div>
              </div>
            ))}

            {/* Drag & Drop Zone */}
            <div
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              onClick={triggerFileSelect}
              className={`border-2 border-dashed rounded p-3 text-center flex flex-col items-center justify-center cursor-pointer transition-all mt-3 ${
                isDragging
                  ? 'border-primary bg-primary/5'
                  : 'border-outline-variant hover:border-primary hover:bg-surface-container-low'
              }`}
            >
              <Upload className="w-5 h-5 text-on-surface-variant mb-1" />
              <p className="text-[11px] font-medium text-text-secondary">
                Drag-and-Drop oder Klicken
              </p>
              <p className="text-[9px] text-text-secondary mt-0.5">
                PDF oder Bild (max. 10 MB)
              </p>
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                className="hidden"
                accept=".pdf,.png,.jpg,.jpeg"
              />
            </div>
          </div>
        </section>
      </div>
    </aside>
  );
}
