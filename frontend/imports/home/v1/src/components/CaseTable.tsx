/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useMemo } from 'react';
import { Vorgang } from '../types';

interface CaseTableProps {
  cases: Vorgang[];
  searchQuery: string;
  onEditCase: (caseItem: Vorgang) => void;
  onShowFullListToggle?: () => void;
}

type FilterType = 'All' | 'Overdue' | 'Today';

export default function CaseTable({ cases, searchQuery, onEditCase, onShowFullListToggle }: CaseTableProps) {
  const [filter, setFilter] = useState<FilterType>('All');
  const [showAllRows, setShowAllRows] = useState(false);

  // Filter cases based on the selected tab and the search query
  const filteredCases = useMemo(() => {
    let result = cases;

    // Apply tab filter
    if (filter === 'Overdue') {
      result = result.filter((item) => item.status === 'Überfällig');
    } else if (filter === 'Today') {
      result = result.filter((item) => item.status === 'In Prüfung');
    }

    // Apply search query
    if (searchQuery.trim() !== '') {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (item) =>
          item.id.toLowerCase().includes(q) ||
          item.title.toLowerCase().includes(q) ||
          item.status.toLowerCase().includes(q)
      );
    }

    return result;
  }, [cases, filter, searchQuery]);

  const visibleCases = showAllRows ? filteredCases : filteredCases.slice(0, 5);

  const getStatusBulletColor = (status: string) => {
    switch (status) {
      case 'Überfällig':
        return 'bg-status-dot-red';
      case 'In Prüfung':
        return 'bg-status-dot-amber';
      case 'In Bearbeitung':
        return 'bg-primary';
      case 'Wartet Bürger':
      case 'Erfasst':
      default:
        return 'bg-outline-variant';
    }
  };

  const getStatusTextColor = (status: string) => {
    switch (status) {
      case 'Überfällig':
        return 'text-status-error font-semibold';
      case 'In Prüfung':
        return 'text-status-warning font-semibold';
      case 'In Bearbeitung':
        return 'text-on-surface-variant font-semibold';
      default:
        return 'text-on-surface-variant';
    }
  };

  const getDueDateTextColor = (status: string) => {
    if (status === 'Überfällig') {
      return 'text-status-error font-semibold';
    }
    return '';
  };

  return (
    <section id="cases-table-section" className="bg-surface-container-lowest border border-border-default overflow-hidden rounded shadow-sm">
      <div className="px-lg py-md border-b border-border-default flex flex-col sm:flex-row sm:items-center justify-between gap-sm">
        <h3 id="cases-heading-title" className="font-headline-sm text-headline-sm text-text-primary text-base">
          Meine Vorgänge
        </h3>
        <div className="flex gap-xs">
          <button
            id="filter-btn-all"
            onClick={() => setFilter('All')}
            className={`px-sm py-xs text-xs font-label-sm rounded transition-all cursor-pointer ${
              filter === 'All'
                ? 'border border-border-default bg-surface-container-low text-text-primary font-semibold'
                : 'text-on-surface-variant hover:bg-surface-container-low'
            }`}
          >
            Alle
          </button>
          <button
            id="filter-btn-overdue"
            onClick={() => setFilter('Overdue')}
            className={`px-sm py-xs text-xs font-label-sm rounded transition-all cursor-pointer ${
              filter === 'Overdue'
                ? 'border border-border-default bg-surface-container-low text-text-primary font-semibold'
                : 'text-on-surface-variant hover:bg-surface-container-low'
            }`}
          >
            Überfällig (2)
          </button>
          <button
            id="filter-btn-today"
            onClick={() => setFilter('Today')}
            className={`px-sm py-xs text-xs font-label-sm rounded transition-all cursor-pointer ${
              filter === 'Today'
                ? 'border border-border-default bg-surface-container-low text-text-primary font-semibold'
                : 'text-on-surface-variant hover:bg-surface-container-low'
            }`}
          >
            Heute (5)
          </button>
        </div>
      </div>
      
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-surface-container-low h-10 border-b border-border-default">
              <th className="px-lg font-caption text-caption text-outline uppercase tracking-wider text-xs font-semibold">
                ID / Aktenzeichen
              </th>
              <th className="px-lg font-caption text-caption text-outline uppercase tracking-wider text-xs font-semibold">
                Titel / Art
              </th>
              <th className="px-lg font-caption text-caption text-outline uppercase tracking-wider text-xs font-semibold">
                Status
              </th>
              <th className="px-lg font-caption text-caption text-outline uppercase tracking-wider text-xs font-semibold">
                Fälligkeit
              </th>
              <th className="px-lg font-caption text-caption text-outline uppercase tracking-wider text-xs font-semibold">
                Aktion
              </th>
            </tr>
          </thead>
          <tbody className="font-table-row text-table-row text-sm">
            {visibleCases.length === 0 ? (
              <tr className="h-[40px] border-b border-border-default bg-surface-container-lowest">
                <td colSpan={5} className="px-lg py-4 text-center text-on-surface-variant italic">
                  Keine Vorgänge gefunden
                </td>
              </tr>
            ) : (
              visibleCases.map((item, idx) => {
                const bgClass = idx % 2 === 1 ? 'bg-[#FAFBFC]' : 'bg-surface-container-lowest';
                return (
                  <tr
                    key={item.id + idx}
                    className={`h-[40px] border-b border-border-default hover:bg-surface-container-low transition-colors ${bgClass}`}
                  >
                    <td className="px-lg font-case-id font-mono text-xs">{item.id}</td>
                    <td className="px-lg text-on-background">{item.title}</td>
                    <td className="px-lg">
                      <span className={`flex items-center gap-xs ${getStatusTextColor(item.status)}`}>
                        <span className={`w-2 h-2 rounded-full ${getStatusBulletColor(item.status)}`} />
                        {item.status}
                      </span>
                    </td>
                    <td className={`px-lg ${getDueDateTextColor(item.status)}`}>{item.dueDate}</td>
                    <td className="px-lg">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onEditCase(item);
                        }}
                        className="text-primary cursor-pointer hover:underline font-semibold bg-transparent border-none p-0"
                      >
                        {item.actionText}
                      </button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      <div className="px-lg py-sm border-t border-border-default flex justify-center">
        <button
          id="btn-toggle-full-list"
          onClick={() => {
            setShowAllRows(!showAllRows);
            if (onShowFullListToggle) onShowFullListToggle();
          }}
          className="text-caption font-label-sm text-primary hover:underline font-semibold cursor-pointer text-xs"
        >
          {showAllRows
            ? 'Weniger anzeigen'
            : 'Vollständige Liste anzeigen (42 weitere)'}
        </button>
      </div>
    </section>
  );
}
