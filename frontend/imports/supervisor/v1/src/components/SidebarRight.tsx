import { useState } from 'react';
import { Bot, Shield, FileText, CheckCircle, HelpCircle, ArrowUpRight } from 'lucide-react';
import { CaseDocument, PrecedentCase } from '../types';

interface SidebarRightProps {
  activeCase: CaseDocument;
  onSelectPrecedent: (precedent: PrecedentCase) => void;
}

export default function SidebarRight({
  activeCase,
  onSelectPrecedent,
}: SidebarRightProps) {
  // Map risk level to styling class
  const getRiskBadgeStyles = (rating: string) => {
    switch (rating) {
      case 'HOCH':
        return 'text-status-error bg-error/10 border border-status-error/20';
      case 'MITTEL':
        return 'text-status-warning bg-status-warning/10 border border-status-warning/20';
      case 'GERING':
      default:
        return 'text-status-success bg-status-success/10 border border-status-success/20';
    }
  };

  const getRiskIconColor = (rating: string) => {
    switch (rating) {
      case 'HOCH':
        return 'text-status-error';
      case 'MITTEL':
        return 'text-status-warning';
      case 'GERING':
      default:
        return 'text-status-success';
    }
  };

  return (
    <aside className="w-support-width bg-surface border-l border-border-default flex flex-col overflow-y-auto shrink-0">
      {/* Sidebar Header */}
      <div className="p-lg border-b border-border-default bg-surface-container-high shrink-0">
        <div className="flex items-center gap-2 mb-1">
          <Bot className="w-5 h-5 text-primary" />
          <span className="text-body-md font-bold text-primary">
            Entscheidungsunterstützung
          </span>
        </div>
        <p className="text-caption text-on-surface-variant">
          Analyse der Risiken &amp; Präzedenzfälle
        </p>
      </div>

      <div className="p-lg space-y-lg flex-1 flex flex-col justify-between">
        <div className="space-y-lg">
          {/* Risikobewertung */}
          <section>
            <div className="flex justify-between items-center mb-2">
              <h3 className="text-caption font-bold text-on-surface-variant uppercase tracking-wider">
                Risikobewertung
              </h3>
              <span className={`text-[11px] font-bold px-2 py-0.5 rounded uppercase tracking-wide ${getRiskBadgeStyles(activeCase.riskRating)}`}>
                {activeCase.riskRating}
              </span>
            </div>
            
            <div className="bg-white border border-border-default rounded p-3 shadow-xs">
              <div className="flex items-center gap-2 mb-1">
                <Shield className={`w-[18px] h-[18px] ${getRiskIconColor(activeCase.riskRating)}`} />
                <span className="text-body-md font-semibold text-text-primary">
                  {activeCase.riskTitle}
                </span>
              </div>
              <p className="text-caption text-on-surface-variant leading-normal">
                {activeCase.riskDescription}
              </p>
            </div>
          </section>

          {/* Präzedenzfälle */}
          <section>
            <h3 className="text-caption font-bold text-on-surface-variant uppercase tracking-wider mb-2">
              Präzedenzfälle
            </h3>
            <div className="space-y-2">
              {activeCase.precedents.map((prec) => (
                <div
                  key={prec.caseId}
                  onClick={() => onSelectPrecedent(prec)}
                  className="bg-white border border-border-default rounded p-3 hover:border-primary hover:shadow-xs cursor-pointer transition-all group"
                  title="Präzedenzfall Details anzeigen"
                >
                  <div className="flex justify-between items-center mb-1">
                    <span className="font-mono text-caption text-primary font-semibold flex items-center gap-1">
                      {prec.caseId}
                      <ArrowUpRight className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                    </span>
                    <span className="text-[11px] text-text-secondary">
                      {prec.date}
                    </span>
                  </div>
                  <p className="text-body-md font-semibold text-text-primary mb-1 group-hover:text-primary transition-colors">
                    {prec.title}
                  </p>
                  <p className="text-caption text-on-surface-variant line-clamp-2">
                    {prec.description}
                  </p>
                  {prec.relevance && (
                    <div className="mt-2 flex justify-end">
                      <span className="text-[10px] font-medium px-1.5 py-0.5 rounded bg-primary-fixed text-on-primary-fixed-variant">
                        {prec.relevance}
                      </span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </section>
        </div>

        {/* Suggested Recommendation Box */}
        <section className="pt-4">
          <div className="p-3.5 rounded border border-primary/20 bg-primary/5 shadow-xs">
            <h4 className="text-caption font-bold text-primary mb-1 uppercase tracking-wider">
              Empfehlung
            </h4>
            <p className="text-caption text-text-primary italic leading-normal">
              "{activeCase.recommendation}"
            </p>
          </div>
        </section>
      </div>
    </aside>
  );
}
