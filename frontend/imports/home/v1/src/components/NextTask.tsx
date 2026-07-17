/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Zap, Wrench } from 'lucide-react';
import { NextTask as NextTaskType } from '../types';

interface NextTaskProps {
  task: NextTaskType;
  onOpenTask: (taskId: string) => void;
}

export default function NextTask({ task, onOpenTask }: NextTaskProps) {
  return (
    <section id="suggested-task-card" className="bg-surface-container-lowest border border-border-default p-lg rounded shadow-sm">
      <div className="flex items-center justify-between mb-md">
        <span className="font-label-sm text-primary flex items-center gap-xs font-semibold">
          <Zap size={18} className="fill-primary" /> Vorgeschlagene nächste Aufgabe
        </span>
        <span id="task-priority-tag" className="text-caption font-caption bg-status-success/10 text-status-success px-sm py-xs rounded font-semibold text-xs">
          Priorität: {task.priority}
        </span>
      </div>
      
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-lg">
        <div className="flex items-center gap-lg">
          <div id="task-icon-container" className="bg-surface-container w-12 h-12 flex items-center justify-center rounded shrink-0">
            <Wrench size={24} className="text-primary" />
          </div>
          <div>
            <h2 id="task-title-heading" className="font-headline-sm text-headline-sm text-text-primary text-base">
              {task.id} {task.title}
            </h2>
            <p className="font-case-id text-case-id text-on-surface-variant text-xs mt-0.5">
              Risiko:{' '}
              <span id="task-risk-indicator" className="text-status-dot-green font-bold">
                {task.risk}
              </span>{' '}
              • Letzte Änderung: {task.lastModified}
            </p>
          </div>
        </div>
        
        <button
          id="btn-open-suggested-task"
          onClick={() => onOpenTask(task.id)}
          className="bg-primary text-on-primary px-lg py-sm rounded font-label-sm font-semibold hover:bg-[#1A365D] transition-all cursor-pointer whitespace-nowrap active:scale-[0.98] shadow-sm"
        >
          Vorgang öffnen
        </button>
      </div>
    </section>
  );
}
