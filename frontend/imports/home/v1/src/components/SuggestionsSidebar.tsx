/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Lightbulb } from 'lucide-react';
import { Suggestion } from '../types';

interface SuggestionsSidebarProps {
  suggestions: Suggestion[];
  onOpenLegalText: (caseId: string) => void;
  onOpenEmailDraft: (caseId: string) => void;
}

export default function SuggestionsSidebar({
  suggestions,
  onOpenLegalText,
  onOpenEmailDraft,
}: SuggestionsSidebarProps) {
  return (
    <div className="bg-surface-container border border-border-default h-full flex flex-col rounded shadow-sm">
      <div className="p-lg border-b border-border-default flex items-center gap-sm">
        <Lightbulb className="text-primary fill-primary/10" size={20} />
        <h3 id="sidebar-heading-title" className="font-headline-sm text-headline-sm text-text-primary text-base font-semibold">
          Vorschläge für Ihre Vorgänge
        </h3>
      </div>
      
      <div className="p-lg flex flex-col gap-md overflow-y-auto max-h-[600px] flex-grow">
        {suggestions.map((item) => {
          const isSummary = item.type === 'Zusammenfassung';
          return (
            <div
              key={item.id}
              className={`bg-surface-container-lowest border border-border-default p-md rounded shadow-xs hover:shadow-sm transition-shadow ${
                isSummary ? 'opacity-75' : ''
              }`}
            >
              <div className="flex items-center justify-between mb-xs">
                <span className="text-caption font-case-id text-on-surface-variant text-xs font-mono">
                  {item.caseId}
                </span>
                <span
                  className={`text-[10px] px-sm py-[2px] rounded uppercase font-bold tracking-wider ${
                    isSummary
                      ? 'bg-secondary-container text-on-secondary-container'
                      : 'bg-primary/10 text-primary'
                  }`}
                >
                  {item.type}
                </span>
              </div>
              
              <p className="font-label-sm text-label-sm mb-sm text-on-background font-semibold text-sm">
                {item.title}
              </p>
              
              <p className="font-caption text-caption text-on-surface-variant mb-md text-xs leading-relaxed">
                {item.description}
              </p>
              
              {item.actionLabel && (
                <button
                  onClick={() => {
                    if (item.actionLabel === 'Rechtstext öffnen') {
                      onOpenLegalText(item.caseId);
                    } else if (item.actionLabel === 'E-Mail Entwurf') {
                      onOpenEmailDraft(item.caseId);
                    }
                  }}
                  className="w-full py-1.5 border border-primary text-primary font-label-sm text-xs font-semibold hover:bg-primary hover:text-on-primary transition-all rounded cursor-pointer active:scale-[0.99]"
                >
                  {item.actionLabel}
                </button>
              )}
            </div>
          );
        })}

        <div className="mt-auto pt-lg">
          <div className="p-md bg-surface-container-low rounded border border-outline-variant/30 italic font-caption text-caption text-on-surface-variant text-xs leading-relaxed text-slate-500">
            Dies sind automatisierte Vorschläge zur Entscheidungsunterstützung. Die abschließende Prüfung obliegt der Sachbearbeitung.
          </div>
        </div>
      </div>
    </div>
  );
}
