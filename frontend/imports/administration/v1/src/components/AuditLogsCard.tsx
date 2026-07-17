/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState } from "react";
import { 
  Lock, 
  Settings as SettingsIcon, 
  FileText, 
  AlertTriangle, 
  CloudUpload, 
  Search, 
  X,
  SlidersHorizontal,
  CheckCircle2,
  Trash2,
  RotateCcw
} from "lucide-react";
import { AuditLog } from "../types";

interface AuditLogsCardProps {
  logs: AuditLog[];
  onClearLogs: () => void;
  onRestoreLogs: () => void;
}

export default function AuditLogsCard({ logs, onClearLogs, onRestoreLogs }: AuditLogsCardProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeFilter, setActiveFilter] = useState<"all" | "success" | "warning" | "danger">("all");

  // Icon mapper for lucide-react mapping Material Symbols 1:1
  const renderIcon = (iconName: string, type: string) => {
    let colorClass = "text-primary";
    if (type === "warning") colorClass = "text-warning";
    if (type === "danger") colorClass = "text-danger";

    const baseClass = `w-5 h-5 mt-1 shrink-0 ${colorClass}`;

    switch (iconName) {
      case "lock":
        return <Lock className={baseClass} />;
      case "settings_applications":
      case "sliders":
        return <SettingsIcon className={baseClass} />;
      case "description":
      case "file-text":
        return <FileText className={baseClass} />;
      case "error":
      case "alert-triangle":
        return <AlertTriangle className={baseClass} />;
      case "cloud_upload":
      case "cloud-upload":
        return <CloudUpload className={baseClass} />;
      default:
        return <CheckCircle2 className={baseClass} />;
    }
  };

  // Filter & Search logic
  const filteredLogs = logs.filter((log) => {
    const matchesSearch = 
      log.event.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.details.toLowerCase().includes(searchQuery.toLowerCase());
    
    if (activeFilter === "all") return matchesSearch;
    return log.type === activeFilter && matchesSearch;
  });

  return (
    <div className="bg-white border border-standard rounded-lg shadow-polish-sm overflow-hidden flex flex-col h-full">
      
      {/* Header */}
      <div className="px-xl py-md border-b border-standard bg-surface-muted flex justify-between items-center select-none">
        <h3 className="font-h3 text-h3 text-brand-dark">Letzte Audit-Ereignisse</h3>
        <div className="flex space-x-1">
          {logs.length > 0 ? (
            <button 
              onClick={onClearLogs}
              className="p-1.5 hover:bg-red-50 text-on-surface-variant hover:text-danger rounded transition-colors"
              title="Audit-Protokoll leeren"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          ) : (
            <button 
              onClick={onRestoreLogs}
              className="p-1.5 hover:bg-blue-50 text-secondary hover:text-primary rounded transition-colors"
              title="Standardprotokoll wiederherstellen"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Filter and Search controls */}
      <div className="p-sm bg-surface-background border-b border-standard flex flex-col space-y-2">
        {/* Search Input */}
        <div className="relative flex items-center">
          <Search className="w-4 h-4 text-on-surface-variant absolute left-3 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Protokolle durchsuchen..."
            className="w-full text-caption pl-9 pr-8 py-1.5 bg-white border border-standard rounded-md focus:outline-none focus:border-secondary focus:ring-3 focus:ring-focus-ring-outer font-body-base"
          />
          {searchQuery && (
            <button 
              onClick={() => setSearchQuery("")}
              className="absolute right-2.5 p-1 hover:bg-surface-muted rounded-full text-on-surface-variant hover:text-on-surface"
            >
              <X className="w-3 h-3" />
            </button>
          )}
        </div>

        {/* Category Filter Tabs */}
        <div className="flex items-center justify-between text-caption font-caption pt-1">
          <div className="flex space-x-1 overflow-x-auto">
            <button
              onClick={() => setActiveFilter("all")}
              className={`px-sm py-1 rounded transition-colors cursor-pointer select-none ${
                activeFilter === "all"
                  ? "bg-primary text-white font-body-semibold"
                  : "bg-white border border-standard hover:bg-surface-muted text-on-surface-variant"
              }`}
            >
              Alle
            </button>
            <button
              onClick={() => setActiveFilter("success")}
              className={`px-sm py-1 rounded transition-colors cursor-pointer select-none ${
                activeFilter === "success"
                  ? "bg-success text-white font-body-semibold"
                  : "bg-white border border-standard hover:bg-surface-muted text-on-surface-variant"
              }`}
            >
              Erfolg
            </button>
            <button
              onClick={() => setActiveFilter("warning")}
              className={`px-sm py-1 rounded transition-colors cursor-pointer select-none ${
                activeFilter === "warning"
                  ? "bg-warning text-white font-body-semibold"
                  : "bg-white border border-standard hover:bg-surface-muted text-on-surface-variant"
              }`}
            >
              Warnung
            </button>
            <button
              onClick={() => setActiveFilter("danger")}
              className={`px-sm py-1 rounded transition-colors cursor-pointer select-none ${
                activeFilter === "danger"
                  ? "bg-error text-white font-body-semibold"
                  : "bg-white border border-standard hover:bg-surface-muted text-on-surface-variant"
              }`}
            >
              Fehler
            </button>
          </div>
          <span className="text-[11px] font-mono text-on-surface-variant whitespace-nowrap pl-2 select-none">
            {filteredLogs.length} gefiltert
          </span>
        </div>
      </div>

      {/* Audit Log Timeline list */}
      <div className="divide-y divide-standard overflow-y-auto max-h-[384px] md:max-h-[500px] flex-1">
        {filteredLogs.length > 0 ? (
          filteredLogs.map((log) => (
            <div 
              key={log.id} 
              className="flex items-start space-x-md p-xl hover:bg-surface-background transition-colors duration-150 relative group"
            >
              {renderIcon(log.icon, log.type)}
              <div className="flex-1 min-w-0">
                <div className="flex justify-between items-start">
                  <span className={`text-body-semibold font-body-semibold truncate pr-2 ${
                    log.type === "danger" ? "text-danger" : "text-on-surface"
                  }`}>
                    {log.event}
                  </span>
                  <span className="text-technical-id font-technical-id text-on-surface-variant shrink-0 select-none">
                    {log.timestamp}
                  </span>
                </div>
                <p className="text-caption font-caption text-on-surface-variant mt-0.5 line-clamp-2">
                  {log.details}
                </p>
              </div>
            </div>
          ))
        ) : (
          <div className="p-huge text-center text-caption text-on-surface-variant flex flex-col items-center justify-center space-y-sm">
            <SlidersHorizontal className="w-8 h-8 text-outline-variant stroke-1" />
            <span>Keine Audit-Ereignisse gefunden</span>
          </div>
        )}
      </div>

    </div>
  );
}
