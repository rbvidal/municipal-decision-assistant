/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { AuditLog } from '../types';
import { MOCK_AUDIT_LOGS } from '../data';

export const AuditLogsView: React.FC = () => {
  const [logs, setLogs] = useState<AuditLog[]>(MOCK_AUDIT_LOGS);

  const handleClearLogs = () => {
    if (confirm('Möchten Sie das administrative Audit-Log wirklich löschen?')) {
      setLogs([]);
    }
  };

  return (
    <div className="bg-white border border-border-standard rounded-lg overflow-hidden shadow-sm select-none">
      <div className="px-xl py-lg border-b border-border-standard flex flex-col sm:flex-row gap-sm justify-between sm:items-center">
        <div>
          <h3 className="text-h3 font-semibold text-primary">Sicherheits- & Revisionsprotokoll</h3>
          <p className="text-caption text-on-surface-variant">Lückenlose Erfassung aller administrativen Handlungen an der Vektordatenbank gemäß DSGVO.</p>
        </div>
        {logs.length > 0 && (
          <button
            onClick={handleClearLogs}
            className="px-lg py-sm border border-danger/30 text-danger hover:bg-red-50 font-semibold rounded-lg transition-colors text-caption flex items-center gap-sm cursor-pointer"
          >
            <span className="material-symbols-outlined text-[16px]">delete_sweep</span>
            Protokoll leeren
          </button>
        )}
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-surface-muted text-on-surface-variant border-b border-border-standard">
              <th className="px-xl py-md font-semibold text-table-cell">Zeitstempel</th>
              <th className="px-xl py-md font-semibold text-table-cell">Benutzer</th>
              <th className="px-xl py-md font-semibold text-table-cell">Aktion</th>
              <th className="px-xl py-md font-semibold text-table-cell">Zielobjekt</th>
              <th className="px-xl py-md font-semibold text-table-cell text-right">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border-standard font-mono text-[12px]">
            {logs.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-xl py-8 text-center text-on-surface-variant">
                  Keine Revisionsdaten vorhanden.
                </td>
              </tr>
            ) : (
              logs.map((log) => (
                <tr key={log.id} className="zebra-row hover:bg-surface-muted transition-colors">
                  <td className="px-xl py-md text-on-surface font-semibold whitespace-nowrap">
                    {log.timestamp}
                  </td>
                  <td className="px-xl py-md text-primary font-medium">
                    {log.user}
                  </td>
                  <td className="px-xl py-md text-on-surface">
                    {log.action}
                  </td>
                  <td className="px-xl py-md text-on-surface-variant font-semibold">
                    {log.target}
                  </td>
                  <td className="px-xl py-md text-right whitespace-nowrap">
                    <span className="bg-success/10 text-success px-2 py-0.5 rounded text-[10px] font-bold">
                      ERFOLGREICH
                    </span>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
