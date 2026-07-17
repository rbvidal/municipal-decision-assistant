/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from 'react';
import { Wissenspaket } from '../types';

interface KnowledgeTableProps {
  packages: Wissenspaket[];
  onVerify: (id: string) => void;
  onUpdate: (id: string) => void;
  onDelete: (id: string) => void;
  onSelectDetails: (pkg: Wissenspaket) => void;
}

export const KnowledgeTable: React.FC<KnowledgeTableProps> = ({
  packages,
  onVerify,
  onUpdate,
  onDelete,
  onSelectDetails
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  // Filter packages based on search
  const filteredPackages = useMemo(() => {
    return packages.filter(pkg => {
      const matchName = pkg.name.toLowerCase().includes(searchTerm.toLowerCase());
      const matchDesc = pkg.description.toLowerCase().includes(searchTerm.toLowerCase());
      return matchName || matchDesc;
    });
  }, [packages, searchTerm]);

  // Reset page to 1 when search changes
  React.useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm]);

  // Pagination calculation
  const totalItems = filteredPackages.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage) || 1;
  
  const paginatedPackages = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredPackages.slice(start, start + itemsPerPage);
  }, [filteredPackages, currentPage]);

  const startRange = totalItems === 0 ? 0 : (currentPage - 1) * itemsPerPage + 1;
  const endRange = Math.min(currentPage * itemsPerPage, totalItems);

  // Helper to format number to German locale (e.g. 1240 -> 1.240)
  const formatGermanNumber = (num: number) => {
    return num.toLocaleString('de-DE');
  };

  return (
    <div className="bg-surface-container-lowest border border-border-standard rounded-lg overflow-hidden flex flex-col shadow-sm">
      
      {/* Table Header Controls */}
      <div className="px-xl py-lg border-b border-border-standard flex flex-col sm:flex-row gap-sm justify-between sm:items-center bg-white">
        <h3 className="text-h3 font-semibold text-primary">Installierte Wissenspakete</h3>
        <div className="relative">
          <span className="material-symbols-outlined absolute left-md top-1/2 -translate-y-1/2 text-on-surface-variant text-[20px]">
            search
          </span>
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 pr-md py-xs border border-border-standard rounded-lg text-body-base focus:ring-2 focus:ring-focus-ring-outer focus:border-primary outline-none h-[36px] min-w-[260px] bg-white text-on-surface"
            placeholder="Pakete filtern..."
            id="table-filter-input"
          />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-on-surface-variant hover:text-primary text-[16px] cursor-pointer"
            >
              <span className="material-symbols-outlined text-[16px]">close</span>
            </button>
          )}
        </div>
      </div>

      {/* Table Wrapper */}
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-surface-muted text-on-surface-variant border-b border-border-standard">
              <th className="px-xl py-md font-semibold text-table-cell min-w-[240px]">Paketname</th>
              <th className="px-xl py-md font-semibold text-table-cell">Version</th>
              <th className="px-xl py-md font-semibold text-table-cell">Dokumente</th>
              <th className="px-xl py-md font-semibold text-table-cell">Chunks</th>
              <th className="px-xl py-md font-semibold text-table-cell">Einbettungsstatus</th>
              <th className="px-xl py-md font-semibold text-table-cell">Letzte Synch.</th>
              <th className="px-xl py-md font-semibold text-table-cell text-right">Aktionen</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border-standard">
            {paginatedPackages.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-xl py-8 text-center text-on-surface-variant">
                  Keine Wissenspakete gefunden für "{searchTerm}"
                </td>
              </tr>
            ) : (
              paginatedPackages.map((pkg) => (
                <tr
                  key={pkg.id}
                  className="zebra-row hover:bg-surface-muted transition-colors group"
                >
                  {/* Paketname */}
                  <td className="px-xl py-md">
                    <div className="flex flex-col">
                      <span className="font-semibold text-primary hover:underline cursor-pointer" onClick={() => onSelectDetails(pkg)}>
                        {pkg.name}
                      </span>
                      <span className="text-caption text-on-surface-variant">
                        {pkg.description}
                      </span>
                    </div>
                  </td>

                  {/* Version */}
                  <td className="px-xl py-md whitespace-nowrap">
                    <span className="font-mono text-technical-id bg-surface-muted px-xs py-1 rounded border border-border-standard/30">
                      {pkg.version}
                    </span>
                  </td>

                  {/* Dokumente */}
                  <td className="px-xl py-md text-table-cell font-medium text-on-surface">
                    {formatGermanNumber(pkg.documents)}
                  </td>

                  {/* Chunks */}
                  <td className="px-xl py-md text-table-cell font-mono text-on-surface-variant">
                    {formatGermanNumber(pkg.chunks)}
                  </td>

                  {/* Status */}
                  <td className="px-xl py-md whitespace-nowrap">
                    {pkg.status === 'Bereit' && (
                      <span className="bg-success/10 text-success px-sm py-1 rounded text-caption font-semibold inline-flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-success"></span>
                        Bereit
                      </span>
                    )}
                    {pkg.status === 'Indiziert...' && (
                      <span className="bg-secondary-container/20 text-secondary px-sm py-1 rounded text-caption font-semibold inline-flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-secondary animate-pulse"></span>
                        Indiziert...
                      </span>
                    )}
                    {pkg.status === 'Fehler' && (
                      <span className="bg-error-container text-on-error-container px-sm py-1 rounded text-caption font-semibold inline-flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-error"></span>
                        Fehler
                      </span>
                    )}
                  </td>

                  {/* Letzte Synch */}
                  <td className="px-xl py-md text-table-cell text-on-surface-variant whitespace-nowrap">
                    {pkg.lastSync}
                  </td>

                  {/* Aktionen */}
                  <td className="px-xl py-md text-right">
                    <div className="flex justify-end gap-sm">
                      {pkg.status === 'Fehler' ? (
                        <button
                          onClick={() => onVerify(pkg.id)}
                          className="p-xs text-on-surface-variant hover:text-primary hover:bg-surface-container rounded transition-all cursor-pointer"
                          title="Neu verifizieren"
                        >
                          <span className="material-symbols-outlined text-[20px]">refresh</span>
                        </button>
                      ) : (
                        <button
                          onClick={() => onVerify(pkg.id)}
                          className="p-xs text-on-surface-variant hover:text-primary hover:bg-surface-container rounded transition-all cursor-pointer"
                          title="Verifizieren"
                        >
                          <span className="material-symbols-outlined text-[20px]">verified_user</span>
                        </button>
                      )}

                      <button
                        onClick={() => onUpdate(pkg.id)}
                        className="p-xs text-on-surface-variant hover:text-primary hover:bg-surface-container rounded transition-all cursor-pointer"
                        title={pkg.status === 'Indiziert...' ? 'Rollback' : 'Update'}
                      >
                        <span className="material-symbols-outlined text-[20px]">
                          {pkg.status === 'Indiziert...' ? 'history' : 'upgrade'}
                        </span>
                      </button>

                      <button
                        onClick={() => onSelectDetails(pkg)}
                        className="p-xs text-on-surface-variant hover:text-primary hover:bg-surface-container rounded transition-all cursor-pointer"
                        title="Details"
                      >
                        <span className="material-symbols-outlined text-[20px]">info</span>
                      </button>

                      <button
                        onClick={() => {
                          if (confirm(`Möchten Sie das Wissenspaket "${pkg.name}" wirklich aus der Vektordatenbank löschen?`)) {
                            onDelete(pkg.id);
                          }
                        }}
                        className="p-xs text-on-surface-variant hover:text-danger hover:bg-red-50 rounded transition-all cursor-pointer"
                        title="Löschen"
                      >
                        <span className="material-symbols-outlined text-[20px]">delete</span>
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Controls */}
      <div className="px-xl py-md border-t border-border-standard bg-surface-muted flex flex-col sm:flex-row gap-md justify-between items-center select-none">
        <span className="text-caption text-on-surface-variant font-medium">
          Zeige {startRange} bis {endRange} von {totalItems} Wissenspaketen
        </span>
        <div className="flex gap-base">
          {/* Previous Page */}
          <button
            onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
            disabled={currentPage === 1}
            className="p-xs border border-border-standard rounded bg-white hover:bg-surface-muted disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer flex items-center justify-center"
            title="Vorherige Seite"
          >
            <span className="material-symbols-outlined text-[18px]">chevron_left</span>
          </button>

          {/* Page numbers */}
          {Array.from({ length: totalPages }, (_, idx) => idx + 1).map((pageNum) => {
            const isCurrent = pageNum === currentPage;
            return (
              <button
                key={pageNum}
                onClick={() => setCurrentPage(pageNum)}
                className={`px-sm py-xs border text-caption rounded font-semibold transition-all cursor-pointer ${
                  isCurrent
                    ? 'border-primary bg-primary text-white shadow-sm'
                    : 'border-border-standard bg-white text-on-surface hover:bg-surface-muted'
                }`}
              >
                {pageNum}
              </button>
            );
          })}

          {/* Next Page */}
          <button
            onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
            disabled={currentPage === totalPages}
            className="p-xs border border-border-standard rounded bg-white hover:bg-surface-muted disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer flex items-center justify-center"
            title="Nächste Seite"
          >
            <span className="material-symbols-outlined text-[18px]">chevron_right</span>
          </button>
        </div>
      </div>

    </div>
  );
};
