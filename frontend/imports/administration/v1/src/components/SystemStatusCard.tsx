/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { CheckCircle2, AlertTriangle, AlertCircle, RefreshCw } from "lucide-react";
import { SystemService } from "../types";

interface SystemStatusCardProps {
  services: SystemService[];
  onToggleService: (id: string) => void;
  onResetServices: () => void;
}

export default function SystemStatusCard({ services, onToggleService, onResetServices }: SystemStatusCardProps) {
  // Determine overall system state
  const hasError = services.some(s => s.status === "danger");
  const hasWarning = services.some(s => s.status === "warning");

  const getStatusColorClass = (status: string) => {
    switch (status) {
      case "success":
        return "bg-success";
      case "warning":
        return "bg-warning";
      case "danger":
        return "bg-error";
      default:
        return "bg-on-surface-variant";
    }
  };

  return (
    <div className="bg-white border border-standard rounded-lg shadow-polish-sm overflow-hidden flex flex-col h-full">
      
      {/* Header */}
      <div className="px-xl py-md border-b border-standard bg-surface-muted flex justify-between items-center select-none">
        <div className="flex items-center space-x-2">
          <h3 className="font-h3 text-h3 text-brand-dark">Systemzustand</h3>
          <button 
            onClick={onResetServices} 
            className="p-1 hover:bg-surface-variant/40 rounded transition-colors"
            title="Dienste zurücksetzen"
          >
            <RefreshCw className="w-3.5 h-3.5 text-on-surface-variant hover:text-primary transition-all" />
          </button>
        </div>
        
        {hasError ? (
          <AlertCircle className="w-5 h-5 text-error animate-bounce" />
        ) : hasWarning ? (
          <AlertTriangle className="w-5 h-5 text-warning" />
        ) : (
          <CheckCircle2 className="w-5 h-5 text-success" />
        )}
      </div>

      {/* Services List */}
      <div className="p-xl space-y-md flex-1">
        <p className="text-caption text-on-surface-variant mb-2 select-none">
          Klicken Sie auf einen Dienst, um dessen Status zu simulieren.
        </p>

        {services.map((service) => (
          <div 
            key={service.id}
            onClick={() => onToggleService(service.id)}
            className="flex items-center justify-between p-sm -mx-sm rounded-md hover:bg-surface-background transition-all duration-150 cursor-pointer group"
          >
            <div className="flex items-center space-x-sm">
              <span className={`w-3 h-3 rounded-full shrink-0 transition-colors ${getStatusColorClass(service.status)}`} />
              <span className="text-body-base text-on-surface group-hover:text-primary transition-colors select-none">
                {service.name}
              </span>
            </div>

            <span className="text-technical-id font-technical-id bg-surface-background px-sm py-1 border border-standard rounded select-none group-hover:border-primary transition-colors">
              {service.versionOrStatusText}
            </span>
          </div>
        ))}
      </div>

    </div>
  );
}
