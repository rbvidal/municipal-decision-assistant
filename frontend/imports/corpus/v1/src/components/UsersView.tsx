/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  department: string;
  status: 'Aktiv' | 'Inaktiv';
  lastActive: string;
}

export const UsersView: React.FC = () => {
  const [users, setUsers] = useState<User[]>([
    {
      id: 'u1',
      name: 'Joachim Dehmel',
      email: 'joachim.dehmel@digital-kommune.de',
      role: 'Systemadministrator',
      department: 'Amt für Digitalisierung',
      status: 'Aktiv',
      lastActive: 'Online'
    },
    {
      id: 'u2',
      name: 'Sarah Lindner',
      email: 's.lindner@stadtplanung-amt.de',
      role: 'Redakteur / Planer',
      department: 'Stadtplanungsamt',
      status: 'Aktiv',
      lastActive: 'Gestern, 18:45'
    },
    {
      id: 'u3',
      name: 'Dr. Michael Schmitt',
      email: 'm.schmitt@rechtsdezernat.de',
      role: 'Sicherheits-Analyst',
      department: 'Rechtsamt',
      status: 'Aktiv',
      lastActive: '14.07.2026'
    },
    {
      id: 'u4',
      name: 'Elena Rostova',
      email: 'e.rostova@hauptamt-kreis.de',
      role: 'Archivar',
      department: 'Kreisarchiv',
      status: 'Inaktiv',
      lastActive: '11.04.2026'
    }
  ]);

  const handleToggleStatus = (id: string) => {
    setUsers(prev => prev.map(u => {
      if (u.id === id) {
        return {
          ...u,
          status: u.status === 'Aktiv' ? 'Inaktiv' : 'Aktiv',
          lastActive: u.status === 'Aktiv' ? 'Gerade eben deaktiviert' : 'Gerade eben aktiviert'
        };
      }
      return u;
    }));
  };

  return (
    <div className="bg-white border border-border-standard rounded-lg overflow-hidden shadow-sm select-none">
      <div className="px-xl py-lg border-b border-border-standard flex justify-between items-center">
        <div>
          <h3 className="text-h3 font-semibold text-primary">Systembenutzer & Berechtigungen</h3>
          <p className="text-caption text-on-surface-variant">Verwaltung der Curatoren und Sachbearbeiter für diese Wissensdatenbank.</p>
        </div>
        <button
          onClick={() => alert('Das Hinzufügen von Benutzern ist für diese Demo schreibgeschützt.')}
          className="px-lg py-sm bg-primary text-white font-semibold rounded-lg hover:bg-primary/90 transition-colors text-caption flex items-center gap-sm cursor-pointer"
        >
          <span className="material-symbols-outlined text-[16px]">person_add</span>
          Benutzer hinzufügen
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-surface-muted text-on-surface-variant border-b border-border-standard">
              <th className="px-xl py-md font-semibold text-table-cell">Name / E-Mail</th>
              <th className="px-xl py-md font-semibold text-table-cell">Rolle</th>
              <th className="px-xl py-md font-semibold text-table-cell">Dezernat / Amt</th>
              <th className="px-xl py-md font-semibold text-table-cell">Status</th>
              <th className="px-xl py-md font-semibold text-table-cell">Letzter Zugriff</th>
              <th className="px-xl py-md font-semibold text-table-cell text-right">Aktionen</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border-standard">
            {users.map((user) => (
              <tr key={user.id} className="zebra-row hover:bg-surface-muted transition-colors">
                <td className="px-xl py-md">
                  <div className="flex flex-col">
                    <span className="font-semibold text-primary">{user.name}</span>
                    <span className="text-caption text-on-surface-variant">{user.email}</span>
                  </div>
                </td>
                <td className="px-xl py-md text-table-cell font-medium text-on-surface">
                  {user.role}
                </td>
                <td className="px-xl py-md text-table-cell text-on-surface-variant">
                  {user.department}
                </td>
                <td className="px-xl py-md">
                  {user.status === 'Aktiv' ? (
                    <span className="bg-success/10 text-success px-sm py-1 rounded text-caption font-semibold inline-flex items-center gap-1">
                      <span className="w-2 h-2 rounded-full bg-success"></span>
                      Aktiv
                    </span>
                  ) : (
                    <span className="bg-surface-muted text-on-surface-variant border border-border-standard/50 px-sm py-1 rounded text-caption font-semibold inline-flex items-center gap-1">
                      <span className="w-2 h-2 rounded-full bg-outline"></span>
                      Inaktiv
                    </span>
                  )}
                </td>
                <td className="px-xl py-md text-table-cell text-on-surface-variant">
                  {user.lastActive}
                </td>
                <td className="px-xl py-md text-right">
                  <button
                    onClick={() => handleToggleStatus(user.id)}
                    className={`px-sm py-1 border rounded text-[11px] font-semibold transition-colors cursor-pointer ${
                      user.status === 'Aktiv'
                        ? 'border-danger/30 text-danger hover:bg-red-50'
                        : 'border-success/30 text-success hover:bg-green-50'
                    }`}
                  >
                    {user.status === 'Aktiv' ? 'Deaktivieren' : 'Aktivieren'}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
