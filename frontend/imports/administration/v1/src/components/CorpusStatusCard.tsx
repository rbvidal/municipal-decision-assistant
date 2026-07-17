/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState } from "react";
import { RefreshCw } from "lucide-react";
import { CorpusStatusItem } from "../types";

interface CorpusStatusCardProps {
  corpora: CorpusStatusItem[];
  onCheckUpdates: (onComplete: () => void) => void;
}

export default function CorpusStatusCard({ corpora, onCheckUpdates }: CorpusStatusCardProps) {
  const [isChecking, setIsChecking] = useState(false);

  const handleCheck = () => {
    if (isChecking) return;
    setIsChecking(true);
    onCheckUpdates(() => {
      setIsChecking(false);
    });
  };

  return (
    <div className="bg-white border border-standard rounded-lg shadow-polish-sm overflow-hidden flex flex-col justify-between">
      
      {/* Header */}
      <div className="px-xl py-md border-b border-standard bg-surface-muted flex justify-between items-center select-none">
        <h3 className="font-h3 text-h3 text-brand-dark">Korpus-Status</h3>
        <button 
          onClick={handleCheck}
          disabled={isChecking}
          className="text-primary hover:underline text-caption font-caption flex items-center space-x-xs transition-opacity cursor-pointer disabled:opacity-60"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isChecking ? "animate-spin" : ""}`} />
          <span>{isChecking ? "Prüfung..." : "Paket-Update prüfen"}</span>
        </button>
      </div>

      {/* Corpora Lists */}
      <div className="p-xl space-y-md">
        {corpora.map((corpus, index) => (
          <div key={corpus.id} className={index > 0 ? "pt-md border-t border-standard" : ""}>
            <div className="flex justify-between items-start mb-2">
              <div>
                <div className="text-body-semibold font-body-semibold text-on-surface">
                  {corpus.name}
                </div>
                <div className="text-caption font-caption text-on-surface-variant font-mono">
                  Version: {corpus.version}
                </div>
              </div>
              <div className="text-right">
                <div className="text-display-stat font-display-stat text-brand-dark">
                  {corpus.countText}
                </div>
                <div className="text-caption font-caption text-on-surface-variant">
                  Dokumente
                </div>
              </div>
            </div>

            {/* Single full progress bar for primary corpus as seen in design */}
            {corpus.hasProgressBar && (
              <div className="h-1 bg-surface-background w-full rounded-full overflow-hidden mt-2">
                <div className="bg-primary h-full w-full rounded-full" />
              </div>
            )}
          </div>
        ))}
      </div>

    </div>
  );
}
