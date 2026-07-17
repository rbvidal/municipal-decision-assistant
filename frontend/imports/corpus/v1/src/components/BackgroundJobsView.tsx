/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { BackgroundJob } from '../types';
import { MOCK_BACKGROUND_JOBS } from '../data';

export const BackgroundJobsView: React.FC = () => {
  const [jobs, setJobs] = useState<BackgroundJob[]>(MOCK_BACKGROUND_JOBS);

  const handleStopJob = (id: string) => {
    setJobs(prev => prev.map(job => {
      if (job.id === id) {
        return {
          ...job,
          status: 'Failed',
          progress: job.progress
        };
      }
      return job;
    }));
  };

  return (
    <div className="bg-white border border-border-standard rounded-lg overflow-hidden shadow-sm select-none">
      <div className="px-xl py-lg border-b border-border-standard">
        <h3 className="text-h3 font-semibold text-primary">Hintergrund-Indizierungsjobs</h3>
        <p className="text-caption text-on-surface-variant">Aktive und historische Aufgaben zur semantischen Aufbereitung von Gesetzestexten.</p>
      </div>

      <div className="p-xl space-y-md">
        {jobs.length === 0 ? (
          <p className="text-center text-caption text-on-surface-variant py-8">Keine Jobs in der Warteschlange.</p>
        ) : (
          jobs.map((job) => (
            <div key={job.id} className="p-lg border border-border-standard rounded-lg space-y-sm transition-all hover:border-primary/20">
              <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-sm">
                <div>
                  <h4 className="font-semibold text-primary text-[15px]">{job.name}</h4>
                  <p className="text-caption text-on-surface-variant">Job-ID: {job.id} • Gestartet: {job.startedAt}</p>
                </div>
                <div>
                  {job.status === 'Running' && (
                    <span className="bg-secondary-container/20 text-secondary px-sm py-1 rounded text-caption font-semibold flex items-center gap-1.5 w-fit">
                      <span className="w-2 h-2 rounded-full bg-secondary animate-ping"></span>
                      Wird verarbeitet
                    </span>
                  )}
                  {job.status === 'Completed' && (
                    <span className="bg-success/10 text-success px-sm py-1 rounded text-caption font-semibold flex items-center gap-1.5 w-fit">
                      <span className="w-2 h-2 rounded-full bg-success"></span>
                      Abgeschlossen
                    </span>
                  )}
                  {job.status === 'Failed' && (
                    <span className="bg-error-container text-on-error-container px-sm py-1 rounded text-caption font-semibold flex items-center gap-1.5 w-fit">
                      <span className="w-2 h-2 rounded-full bg-error"></span>
                      Fehler / Abgebrochen
                    </span>
                  )}
                </div>
              </div>

              {/* Progress Bar */}
              <div className="space-y-1">
                <div className="flex justify-between text-caption font-semibold">
                  <span className="text-on-surface-variant">Fortschritt</span>
                  <span>{job.progress}%</span>
                </div>
                <div className="h-2 w-full bg-surface-muted rounded-full overflow-hidden border border-border-standard/30">
                  <div
                    className={`h-full transition-all duration-300 ${
                      job.status === 'Completed'
                        ? 'bg-success'
                        : job.status === 'Failed'
                          ? 'bg-error'
                          : 'bg-secondary'
                    }`}
                    style={{ width: `${job.progress}%` }}
                  />
                </div>
              </div>

              {job.status === 'Running' && (
                <div className="flex justify-end pt-1">
                  <button
                    onClick={() => handleStopJob(job.id)}
                    className="text-caption text-danger hover:underline font-semibold flex items-center gap-1 cursor-pointer"
                  >
                    <span className="material-symbols-outlined text-[16px]">cancel</span>
                    Abbrechen
                  </button>
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
};
