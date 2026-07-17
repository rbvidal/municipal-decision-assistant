/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Check, AlertCircle, Plus } from "lucide-react";
import { BackgroundJob } from "../types";

interface BackgroundJobsCardProps {
  jobs: BackgroundJob[];
  onAddJob: () => void;
}

export default function BackgroundJobsCard({ jobs, onAddJob }: BackgroundJobsCardProps) {
  const activeJobsCount = jobs.filter(j => j.status === "active").length;

  return (
    <div className="bg-white border border-standard rounded-lg shadow-polish-sm overflow-hidden flex flex-col h-full">
      
      {/* Header */}
      <div className="px-xl py-md border-b border-standard bg-surface-muted flex justify-between items-center select-none">
        <div className="flex items-center space-x-2">
          <h3 className="font-h3 text-h3 text-brand-dark">Hintergrundjobs</h3>
          <button 
            onClick={onAddJob}
            className="p-1 hover:bg-surface-variant/40 rounded transition-colors"
            title="Neuen Job simulieren"
          >
            <Plus className="w-4 h-4 text-primary" />
          </button>
        </div>
        
        {activeJobsCount > 0 && (
          <span className="bg-secondary-container text-on-secondary-container px-sm py-0.5 rounded text-caption font-body-semibold">
            {activeJobsCount} Aktiv
          </span>
        )}
      </div>

      {/* Table List */}
      <div className="overflow-x-auto flex-1">
        <table className="w-full text-left border-collapse min-w-[320px]">
          <thead>
            <tr className="bg-surface-muted border-b border-standard select-none">
              <th className="px-xl py-sm text-table-cell font-table-cell text-on-surface-variant">Job-Typ</th>
              <th className="px-xl py-sm text-table-cell font-table-cell text-on-surface-variant">Fortschritt</th>
              <th className="px-xl py-sm text-table-cell font-table-cell text-on-surface-variant text-right">ETA</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-standard">
            {jobs.map((job, index) => {
              const isEven = index % 2 === 1;
              return (
                <tr 
                  key={job.id} 
                  className={`transition-colors duration-150 ${isEven ? "bg-surface-background" : "bg-white"}`}
                >
                  {/* Job Name & Description */}
                  <td className="px-xl py-md select-none">
                    <div className="text-body-base font-body-semibold text-on-surface">
                      {job.type}
                    </div>
                    <div className="text-caption font-caption text-on-surface-variant">
                      {job.details}
                    </div>
                  </td>

                  {/* Progress Indicators */}
                  <td className="px-xl py-md">
                    {job.status === "active" ? (
                      <div>
                        <div className="w-full bg-surface-background h-2 rounded-full overflow-hidden">
                          <div 
                            className={`h-full transition-all duration-300 rounded-full ${
                              job.isWarningColor ? "bg-warning" : "bg-primary"
                            }`}
                            style={{ width: `${job.progress}%` }}
                          />
                        </div>
                        <div className="text-caption font-caption mt-1 font-mono text-on-surface-variant">
                          {Math.round(job.progress)}%
                        </div>
                      </div>
                    ) : job.status === "completed" ? (
                      <div className="flex items-center space-x-sm text-success select-none">
                        <Check className="w-4 h-4" />
                        <span className="text-caption font-body-semibold">Abgeschlossen</span>
                      </div>
                    ) : (
                      <div className="flex items-center space-x-sm text-error select-none">
                        <AlertCircle className="w-4 h-4" />
                        <span className="text-caption font-body-semibold">Fehlgeschlagen</span>
                      </div>
                    )}
                  </td>

                  {/* Estimated Time of Arrival */}
                  <td className="px-xl py-md text-right text-technical-id font-technical-id text-on-surface select-none">
                    {job.eta}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

    </div>
  );
}
