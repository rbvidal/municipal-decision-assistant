/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { StatCard } from '../types';

interface StatsGridProps {
  stats: StatCard[];
  onStatClick?: (statId: string) => void;
}

export default function StatsGrid({ stats, onStatClick }: StatsGridProps) {
  return (
    <div className="mt-3xl grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-sm">
      {stats.map((card) => {
        // Map percentage to actual CSS inline width or specific Tailwind style
        const widthPercent = `${card.percentage}%`;

        return (
          <div
            key={card.id}
            id={`stat-card-${card.id}`}
            onClick={() => onStatClick && onStatClick(card.id)}
            className={`bg-surface-container-lowest border border-border-default p-md flex flex-col rounded shadow-xs hover:shadow-sm transition-all ${
              onStatClick ? 'cursor-pointer hover:border-slate-300' : ''
            }`}
          >
            <span className="font-caption text-caption text-outline text-xs text-slate-500 truncate">
              {card.label}
            </span>
            <span className={`font-stat text-stat text-2xl font-bold mt-1 ${card.colorClass}`}>
              {card.value}
            </span>
            <div className="h-1 w-full bg-surface-container mt-sm overflow-hidden rounded-full">
              {card.percentage > 0 && (
                <div
                  className={`h-full ${card.barColorClass} rounded-full`}
                  style={{ width: widthPercent }}
                />
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
