/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';

interface SidebarProps {
  activeView: string;
  onViewChange: (view: string) => void;
  onNewTransaction: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeView,
  onViewChange,
  onNewTransaction
}) => {
  const menuItems = [
    { id: 'dashboard', name: 'Dashboard', icon: 'dashboard' },
    { id: 'analysen', name: 'Analysen', icon: 'analytics' },
    { id: 'korpus', name: 'Korpus', icon: 'database' },
    { id: 'protokolle', name: 'Protokolle', icon: 'description' },
    { id: 'einstellungen', name: 'Einstellungen', icon: 'settings' }
  ];

  return (
    <aside className="hidden lg:flex flex-col p-lg space-y-md bg-surface-container-low border-r border-border-standard w-sidebar-width shrink-0 min-h-[calc(100vh-56px)] select-none">
      
      {/* Sidebar Header */}
      <div className="mb-lg px-md">
        <h3 className="text-h3 text-primary font-bold">Entscheidungs-Support</h3>
        <p className="text-caption text-on-surface-variant font-medium">Digitale Verwaltung</p>
      </div>

      {/* Sidebar Links */}
      <div className="flex flex-col gap-xs flex-1">
        {menuItems.map((item) => {
          const isActive = activeView === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onViewChange(item.id)}
              className={`flex items-center gap-sm px-md py-sm text-left font-body-base transition-all cursor-pointer rounded-lg ${
                isActive
                  ? 'bg-secondary-container text-on-secondary-container font-semibold translate-x-1 shadow-sm'
                  : 'text-on-surface-variant hover:bg-surface-container-highest'
              }`}
              id={`sidebar-link-${item.id}`}
            >
              <span className="material-symbols-outlined text-[20px]">{item.icon}</span>
              <span>{item.name}</span>
            </button>
          );
        })}
      </div>

      {/* Create New Case Button */}
      <div className="pt-lg border-t border-border-standard/50">
        <button
          onClick={onNewTransaction}
          className="w-full bg-primary text-on-primary py-md rounded-lg font-semibold hover:bg-primary/90 transition-all flex items-center justify-center gap-sm cursor-pointer shadow-sm active:scale-95"
          id="btn-new-transaction"
        >
          <span className="material-symbols-outlined text-[20px]">add</span>
          Neuer Vorgang
        </button>
      </div>
    </aside>
  );
};
