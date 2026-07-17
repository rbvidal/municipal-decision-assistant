import React, { useState } from 'react';
import { ArrowLeft, CheckCircle, ShieldCheck, AlertCircle, AlertTriangle, FileText, ChevronDown } from 'lucide-react';
import { CaseDocument, VerificationItem } from '../types';

interface ComparisonWorkspaceProps {
  activeCase: CaseDocument;
  cases: CaseDocument[];
  onSelectCase: (caseId: string) => void;
  onApprove: (comments: string) => void;
  onReject: (comments: string) => void;
  onRevise: (comments: string) => void;
  comments: string;
  setComments: (text: string) => void;
}

export default function ComparisonWorkspace({
  activeCase,
  cases,
  onSelectCase,
  onApprove,
  onReject,
  onRevise,
  comments,
  setComments,
}: ComparisonWorkspaceProps) {
  const [hoveredTerm, setHoveredTerm] = useState<string | null>(null);
  const [isCaseDropdownOpen, setIsCaseDropdownOpen] = useState(false);

  // Match score based on case rating
  const getMatchScore = (rating: string) => {
    switch (rating) {
      case 'HOCH':
        return { percent: 45, text: '45% Abweichung', colorClass: 'bg-error' };
      case 'MITTEL':
        return { percent: 85, text: '85% Abgleich', colorClass: 'bg-status-dot-amber' };
      case 'GERING':
      default:
        return { percent: 100, text: '100% Match', colorClass: 'bg-status-success' };
    }
  };

  const score = getMatchScore(activeCase.riskRating);

  const getVerificationIcon = (status: string) => {
    switch (status) {
      case 'error':
        return <AlertCircle className="w-5 h-5 text-error shrink-0" />;
      case 'warning':
        return <AlertTriangle className="w-5 h-5 text-status-dot-amber shrink-0" />;
      case 'success':
      default:
        return <CheckCircle className="w-5 h-5 text-status-success shrink-0" />;
    }
  };

  const getVerificationCardStyles = (status: string) => {
    switch (status) {
      case 'error':
        return 'border-error/30 bg-error/5 text-error';
      case 'warning':
        return 'border-status-dot-amber/30 bg-status-dot-amber/5 text-status-warning';
      case 'success':
      default:
        return 'border-status-success/30 bg-status-success/5 text-status-success';
    }
  };

  const handleTextareaChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setComments(e.target.value);
  };

  return (
    <div className="flex-1 flex flex-col bg-background overflow-hidden">
      {/* Subnav Action Bar */}
      <div className="h-subnav px-lg border-b border-border-default bg-white flex justify-between items-center shrink-0 z-20">
        <div className="flex items-center gap-md relative">
          <button className="p-1 rounded-full hover:bg-surface-container transition-all cursor-pointer text-on-surface-variant">
            <ArrowLeft className="w-5 h-5" />
          </button>
          
          <div className="h-5 w-[1px] bg-border-default"></div>

          {/* Case Dropdown Switcher */}
          <div className="relative">
            <button
              onClick={() => setIsCaseDropdownOpen(!isCaseDropdownOpen)}
              className="flex items-center gap-1 px-3 py-1 rounded text-body-md font-semibold hover:bg-surface-container-low cursor-pointer select-none text-text-primary transition-all"
            >
              Vorgangsbearbeitung: {activeCase.caseId}
              <ChevronDown className="w-4 h-4 text-on-surface-variant transition-transform duration-200" style={{ transform: isCaseDropdownOpen ? 'rotate(180deg)' : 'none' }} />
            </button>

            {isCaseDropdownOpen && (
              <>
                <div 
                  className="fixed inset-0 z-30" 
                  onClick={() => setIsCaseDropdownOpen(false)}
                ></div>
                <div className="absolute left-0 mt-1 w-72 bg-white border border-border-default rounded-lg shadow-lg z-40 py-2 animate-in fade-in-50 duration-100">
                  <div className="px-3 py-1.5 text-[11px] font-bold text-on-surface-variant uppercase tracking-wider border-b border-border-default/50 mb-1">
                    Verfahren auswählen
                  </div>
                  {cases.map((c) => (
                    <button
                      key={c.caseId}
                      onClick={() => {
                        onSelectCase(c.caseId);
                        setIsCaseDropdownOpen(false);
                      }}
                      className={`w-full text-left px-4 py-2.5 hover:bg-surface-container-low flex flex-col gap-0.5 cursor-pointer transition-colors ${
                        c.caseId === activeCase.caseId ? 'bg-primary/5 border-l-4 border-primary' : 'border-l-4 border-transparent'
                      }`}
                    >
                      <div className="flex justify-between items-center">
                        <span className="font-mono text-xs font-bold text-primary">{c.caseId}</span>
                        <span className="text-[10px] px-1.5 py-0.2 rounded bg-surface-container-high text-on-surface-variant uppercase font-medium">{c.statusLabel}</span>
                      </div>
                      <span className="text-body-md font-medium text-text-primary truncate">{c.title}</span>
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2">
          <button
            onClick={() => onRevise(comments)}
            className="px-4 py-1.5 border border-outline-variant text-text-secondary text-body-md font-medium rounded hover:bg-surface-container-low active:opacity-85 transition-all cursor-pointer"
          >
            Zurück zur Überarbeitung
          </button>
          <button
            onClick={() => onReject(comments)}
            className="px-4 py-1.5 border border-status-error text-status-error text-body-md font-medium rounded hover:bg-error-container active:opacity-85 transition-all cursor-pointer"
          >
            Ablehnen
          </button>
          <button
            onClick={() => onApprove(comments)}
            className="px-4 py-1.5 bg-primary text-white text-body-md font-semibold rounded hover:bg-on-primary-fixed-variant active:opacity-85 transition-all flex items-center gap-1.5 cursor-pointer"
          >
            <CheckCircle className="w-[18px] h-[18px] text-white" />
            Genehmigen
          </button>
        </div>
      </div>

      {/* Workspace Body */}
      <div className="flex-1 overflow-y-auto p-lg flex flex-col gap-lg">
        {/* Comparison View Grid */}
        <div className="grid grid-cols-2 gap-lg flex-1 min-h-[480px]">
          
          {/* Draft Column */}
          <div className="flex flex-col bg-white border border-border-default rounded-xl overflow-hidden shadow-xs">
            <div className="px-md py-3 bg-surface-container-low border-b border-border-default flex justify-between items-center">
              <span className="text-caption font-bold uppercase tracking-wider text-on-surface-variant flex items-center gap-1">
                <FileText className="w-4 h-4" />
                Entscheidungsentwurf
              </span>
              <span className="text-caption text-text-secondary font-mono bg-white px-2 py-0.5 rounded border border-border-default">
                {activeCase.draftVersion}
              </span>
            </div>

            <div className="p-lg prose max-w-none text-body-md leading-relaxed text-text-primary h-full overflow-y-auto select-text">
              <h2 className="text-headline-sm font-bold mb-md text-text-primary border-b border-border-default/50 pb-2">
                {activeCase.draftTitle}
              </h2>
              
              {/* Draft content with interactive hover effect */}
              <div 
                className="draft-text-container"
                onMouseOver={(e) => {
                  const target = e.target as HTMLElement;
                  if (target.tagName === 'STRONG') {
                    setHoveredTerm(target.textContent);
                    target.style.backgroundColor = '#d3e4ff';
                    target.style.transition = 'background-color 0.15s ease';
                    target.style.borderRadius = '3px';
                    target.style.paddingLeft = '3px';
                    target.style.paddingRight = '3px';
                  }
                }}
                onMouseOut={(e) => {
                  const target = e.target as HTMLElement;
                  if (target.tagName === 'STRONG') {
                    setHoveredTerm(null);
                    target.style.backgroundColor = 'transparent';
                    target.style.paddingLeft = '0px';
                    target.style.paddingRight = '0px';
                  }
                }}
                dangerouslySetInnerHTML={{ __html: activeCase.draftContentHtml }}
              />
              
              {hoveredTerm && (
                <div className="mt-4 p-2 bg-primary/5 rounded border border-primary/20 text-[11px] text-primary flex items-center gap-2 animate-in slide-in-from-bottom-1 duration-150">
                  <span className="font-bold">Prüffunktion:</span> 
                  <span>Definition für "{hoveredTerm}" wird im Systemabgleich ausgewertet.</span>
                </div>
              )}

              <p className="italic text-text-secondary mt-6 border-t border-border-default/30 pt-4 text-center">
                -- Ende des Entwurfs --
              </p>
            </div>
          </div>

          {/* Verification Column */}
          <div className="flex flex-col bg-white border border-border-default rounded-xl overflow-hidden shadow-xs">
            <div className="px-md py-3 bg-surface-container-low border-b border-border-default flex justify-between items-center">
              <span className="text-caption font-bold uppercase tracking-wider text-on-surface-variant flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-status-success" />
                Automatische Verifikation
              </span>
              <span className="flex items-center gap-1 text-[11px] font-bold text-status-success bg-status-success/10 px-2.5 py-0.5 rounded-full">
                Prüfung Aktiv
              </span>
            </div>

            <div className="p-lg space-y-4 overflow-y-auto flex-1">
              {activeCase.verifications.map((ver) => (
                <div
                  key={ver.id}
                  className={`p-4 rounded-lg border flex gap-md items-start transition-all ${getVerificationCardStyles(
                    ver.status
                  )}`}
                >
                  {getVerificationIcon(ver.status)}
                  <div className="space-y-0.5">
                    <h4 className="text-body-md font-bold leading-tight">
                      {ver.title}
                    </h4>
                    <p className="text-caption leading-relaxed text-on-surface-variant">
                      {ver.description}
                    </p>
                  </div>
                </div>
              ))}

              {/* Consistency Meter */}
              <div className="mt-8 border-t border-border-default pt-6">
                <h4 className="text-caption font-bold text-on-surface-variant uppercase tracking-wider mb-2">
                  Interne Konsistenz
                </h4>
                <div className="space-y-2 bg-surface-container-low p-4 rounded-lg border border-border-default/50">
                  <div className="flex justify-between items-center text-body-md">
                    <span className="text-text-secondary font-medium">Text-Metadaten Abgleich</span>
                    <span className="text-status-success font-bold flex items-center gap-1">
                      {score.text}
                    </span>
                  </div>
                  <div className="w-full bg-surface-container rounded-full h-2">
                    <div
                      className={`${score.colorClass} h-2 rounded-full transition-all duration-500`}
                      style={{ width: `${score.percent}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Feedback / Comments Area */}
        <div className="bg-white border border-border-default rounded-xl p-lg shrink-0 shadow-xs">
          <label
            className="text-caption font-bold uppercase text-on-surface-variant mb-2 block tracking-wider"
            htmlFor="comments"
          >
            Korrekturwünsche / Anmerkungen für Sabine Müller
          </label>
          <textarea
            className="w-full border border-border-default rounded-lg p-md text-body-md focus:ring-2 focus:ring-primary focus:border-primary focus:outline-none placeholder:text-surface-dim transition-all bg-surface-bright"
            id="comments"
            value={comments}
            onChange={handleTextareaChange}
            placeholder="Geben Sie hier Feedback ein, falls Sie den Vorgang zur Überarbeitung zurücksenden..."
            rows={3}
          ></textarea>
        </div>
      </div>
    </div>
  );
}
