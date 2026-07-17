/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Landmark, LayoutDashboard, BarChart3, AlertTriangle, FileText, Settings } from "lucide-react";

interface SidebarProps {
  onNewVorgang: () => void;
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

export default function Sidebar({ onNewVorgang, activeTab, setActiveTab }: SidebarProps) {
  const menuItems = [
    { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
    { id: "analysen", label: "Analysen", icon: BarChart3 },
    { id: "risiken", label: "Risiken", icon: AlertTriangle },
    { id: "protokolle", label: "Protokolle", icon: FileText },
    { id: "einstellungen", label: "Einstellungen", icon: Settings },
  ];

  return (
    <aside className="hidden lg:flex flex-col p-lg space-y-md border-r border-standard bg-surface-container-low fixed left-0 h-[calc(100vh-var(--spacing-header-height))] w-sidebar-width overflow-y-auto select-none">
      
      {/* Brand Identity Section */}
      <div className="flex items-center space-x-sm mb-xl">
        <Landmark className="w-6 h-6 text-primary shrink-0" />
        <div>
          <div className="text-body-semibold font-body-semibold text-brand-dark">
            Entscheidungs-Support
          </div>
          <div className="text-caption font-caption text-on-surface-variant">
            Digitale Verwaltung
          </div>
        </div>
      </div>

      {/* Main Call to Action Button */}
      <button 
        onClick={onNewVorgang}
        className="bg-primary text-white py-sm px-lg rounded-lg font-body-semibold text-center mb-lg hover:opacity-90 active:scale-98 transition-all cursor-pointer"
      >
        Neuer Vorgang
      </button>

      {/* Navigation Options */}
      <nav className="space-y-base flex-1">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center space-x-sm px-md py-sm rounded-lg transition-all cursor-pointer text-left ${
                isActive
                  ? "bg-secondary-container text-on-secondary-container font-body-semibold translate-x-1"
                  : "text-on-surface-variant font-body-base hover:bg-surface-variant/50"
              }`}
            >
              <Icon className="w-5 h-5 shrink-0" />
              <span>{item.label}</span>
            </button>
          );
        })}
      </nav>

    </aside>
  );
}
