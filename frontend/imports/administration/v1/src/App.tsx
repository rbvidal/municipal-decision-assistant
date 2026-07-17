/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from "react";
import { 
  ChevronRight, 
  UserPlus, 
  Play, 
  Building2, 
  CheckCircle,
  FileCheck2,
  Cpu,
  RefreshCw
} from "lucide-react";
import Header from "./components/Header";
import Sidebar from "./components/Sidebar";
import SystemStatusCard from "./components/SystemStatusCard";
import CorpusStatusCard from "./components/CorpusStatusCard";
import BackgroundJobsCard from "./components/BackgroundJobsCard";
import AuditLogsCard from "./components/AuditLogsCard";
import { NewVorgangModal, NewUserModal } from "./components/Modals";
import { SystemService, CorpusStatusItem, BackgroundJob, AuditLog, ServiceStatus } from "./types";

export default function App() {
  // State for Navigation and Tabs
  const [activeTab, setActiveTab] = useState("dashboard");

  // Modals visibility state
  const [isVorgangModalOpen, setIsVorgangModalOpen] = useState(false);
  const [isUserModalOpen, setIsUserModalOpen] = useState(false);

  // Benchmarking trigger state
  const [isBenchmarking, setIsBenchmarking] = useState(false);

  // Helper: Get formatted local system time (HH:MM:SS)
  const getFormattedTime = () => {
    const d = new Date();
    return d.toTimeString().split(" ")[0];
  };

  // Initial mock services
  const initialServices: SystemService[] = [
    { id: "postgres", name: "PostgreSQL Cluster", status: "success", versionOrStatusText: "v15.4 Active" },
    { id: "qdrant", name: "Qdrant Vector DB", status: "success", versionOrStatusText: "0.16.2 Stable" },
    { id: "embedding", name: "Embedding Service", status: "warning", versionOrStatusText: "Queue: 124 ms" },
    { id: "search", name: "Search Service", status: "success", versionOrStatusText: "99.9% Uptime" }
  ];

  // Initial mock corpus status
  const initialCorpora: CorpusStatusItem[] = [
    { id: "baugb", name: "Baugesetzbuch (BauGB)", version: "2024-v2-alpha", countText: "12.4k", countValue: 12400, hasProgressBar: true },
    { id: "nrw", name: "Kommunalrecht NRW", version: "2023-Final", countText: "8.2k", countValue: 8200 }
  ];

  // Initial mock background jobs
  const initialJobs: BackgroundJob[] = [
    { id: "job-1", type: "Indexierung (V3)", details: "BauGB Update", progress: 75, eta: "08:45m", status: "active" },
    { id: "job-2", type: "CSV Import", details: "Benutzerdaten", progress: 92, eta: "01:20m", status: "active" },
    { id: "job-3", type: "Vektor-Optimierung", details: "Qdrant Segmentierung", progress: 15, eta: "42:10m", status: "active", isWarningColor: true },
    { id: "job-4", type: "Archivierung", details: "Sitzungsprotokolle 2022", progress: 100, eta: "-", status: "completed" }
  ];

  // Initial mock audit logs
  const initialLogs: AuditLog[] = [
    { id: "log-1", event: "Login Erfolg", timestamp: "14:22:10", details: "User ID: admin-01 | IP: 192.168.1.1", type: "success", icon: "lock" },
    { id: "log-2", event: "Konfiguration Geändert", timestamp: "13:45:02", details: "System-Prompt 'Legal-Advisor' aktualisiert.", type: "warning", icon: "settings_applications" },
    { id: "log-3", event: "Export Erzeugt", timestamp: "12:30:15", details: "Audit-Bericht Q3 generiert durch 'K. Müller'.", type: "success", icon: "description" },
    { id: "log-4", event: "Anmeldefehler (401)", timestamp: "11:15:44", details: "Falsches Passwort für 'j.doe'.", type: "danger", icon: "error" },
    { id: "log-5", event: "Datenimport", timestamp: "10:02:11", details: "Neuer Wissensstand für 'Abfallrecht' eingespielt.", type: "success", icon: "cloud_upload" }
  ];

  // Reactive state hooks
  const [services, setServices] = useState<SystemService[]>(initialServices);
  const [corpora, setCorpora] = useState<CorpusStatusItem[]>(initialCorpora);
  const [jobs, setJobs] = useState<BackgroundJob[]>(initialJobs);
  const [logs, setLogs] = useState<AuditLog[]>(initialLogs);

  // Custom log adder helper
  const addAuditLog = (event: string, details: string, type: "success" | "warning" | "danger" | "info") => {
    const newLog: AuditLog = {
      id: `custom-${Date.now()}`,
      event,
      timestamp: getFormattedTime(),
      details,
      type,
      icon: type === "danger" ? "error" : type === "warning" ? "sliders" : "check_circle"
    };
    setLogs(prev => [newLog, ...prev]);
  };

  // Interval hook to simulate progression of active background jobs
  useEffect(() => {
    const interval = setInterval(() => {
      setJobs((prevJobs) => {
        let stateChanged = false;
        const updated = prevJobs.map((job) => {
          if (job.status === "active") {
            stateChanged = true;
            const step = Math.random() * 2 + 1; // Increment by 1-3%
            const nextProgress = Math.min(job.progress + step, 100);
            
            if (nextProgress >= 100) {
              // Mark completed
              addAuditLog(
                `${job.type} Abgeschlossen`,
                `Hintergrundjob '${job.details}' erfolgreich verarbeitet.`,
                "success"
              );
              return {
                ...job,
                progress: 100,
                eta: "-",
                status: "completed" as const
              };
            }

            // Estimate new ETA loosely based on remaining progress
            const remainingSecs = Math.round(((100 - nextProgress) / step) * 3);
            const minutes = Math.floor(remainingSecs / 60);
            const seconds = remainingSecs % 60;
            const formatEta = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}m`;

            return {
              ...job,
              progress: nextProgress,
              eta: formatEta
            };
          }
          return job;
        });

        return stateChanged ? updated : prevJobs;
      });
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  // Handler: Toggle single service status to simulate system failures or maintenance
  const handleToggleService = (id: string) => {
    setServices(prev => prev.map(service => {
      if (service.id === id) {
        let nextStatus: ServiceStatus = "success";
        let text = "Active";

        if (service.status === "success") {
          nextStatus = "warning";
          text = "Queue: 250 ms";
        } else if (service.status === "warning") {
          nextStatus = "danger";
          text = "Down / Critical";
        } else {
          nextStatus = "success";
          text = id === "postgres" ? "v15.4 Active" : id === "qdrant" ? "0.16.2 Stable" : id === "search" ? "99.9% Uptime" : "Active";
        }

        // Add transaction log for simulation
        addAuditLog(
          "Service Status geändert",
          `Status für '${service.name}' manuell geändert auf: ${nextStatus.toUpperCase()} (${text}).`,
          nextStatus === "danger" ? "danger" : nextStatus === "warning" ? "warning" : "success"
        );

        return {
          ...service,
          status: nextStatus,
          versionOrStatusText: text
        };
      }
      return service;
    }));
  };

  // Reset all simulated service states
  const handleResetServices = () => {
    setServices(initialServices);
    addAuditLog("Dienste zurückgesetzt", "Sämtliche Systemdienste auf Soll-Zustände zurückgesetzt.", "success");
  };

  // Check for updates simulation (spins sync on click, increments corpus counts)
  const handleCheckUpdates = (onComplete: () => void) => {
    setTimeout(() => {
      // Simulate incrementing documents slightly representing discovery
      setCorpora(prev => prev.map(c => {
        if (c.id === "baugb") {
          return { ...c, countText: "12.6k", countValue: 12600 };
        }
        if (c.id === "nrw") {
          return { ...c, countText: "8.4k", countValue: 8400 };
        }
        return c;
      }));

      addAuditLog(
        "Paket-Update geprüft",
        "Dokumenten-Korpus synchronisiert. Neue Gesetzesfassungen (BauGB/NRW) identifiziert und bereitgestellt.",
        "success"
      );

      onComplete();
    }, 1500);
  };

  // Create new Case / Process
  const handleNewVorgangSubmit = (type: string, scope: string, eta: string) => {
    const newJob: BackgroundJob = {
      id: `job-${Date.now()}`,
      type,
      details: scope,
      progress: 0,
      eta,
      status: "active"
    };

    setJobs(prev => [newJob, ...prev]);
    addAuditLog(
      "Vorgang Eingeleitet",
      `Neuer Job '${type}' für '${scope}' erfolgreich in die Queue eingereiht.`,
      "info"
    );
  };

  // Create new administrative user
  const handleNewUserSubmit = (username: string, role: string) => {
    addAuditLog(
      "Benutzer Angelegt",
      `Benutzer '${username}' erfolgreich als '${role}' provisioniert und lizenziert.`,
      "success"
    );
  };

  // Start Benchmark simulation
  const handleStartBenchmark = () => {
    if (isBenchmarking) return;
    setIsBenchmarking(true);

    // Alter embedding status momentarily to busy
    setServices(prev => prev.map(s => {
      if (s.id === "embedding") {
        return { ...s, status: "danger", versionOrStatusText: "Busy (Benchmark)" };
      }
      return s;
    }));

    addAuditLog(
      "System-Benchmark gestartet",
      "Leistungstest gestartet. CPU & I/O Last-Simulation läuft.",
      "warning"
    );

    // Create benchmark background job
    const benchmarkJob: BackgroundJob = {
      id: `benchmark-${Date.now()}`,
      type: "System-Benchmark",
      details: "CPU/Memory Belastungsanalyse",
      progress: 5,
      eta: "00:10m",
      status: "active"
    };
    setJobs(prev => [benchmarkJob, ...prev]);

    // Finish benchmark shortly
    setTimeout(() => {
      setServices(prev => prev.map(s => {
        if (s.id === "embedding") {
          return { ...s, status: "warning", versionOrStatusText: "Queue: 92 ms" };
        }
        return s;
      }));

      // Update benchmark job to complete
      setJobs(prev => prev.map(j => {
        if (j.id.startsWith("benchmark-")) {
          return { ...j, progress: 100, status: "completed", eta: "-" };
        }
        return j;
      }));

      addAuditLog(
        "Benchmark abgeschlossen",
        "Benchmark erfolgreich beendet. Systemleistung: 94.2 Gigaflops | Latenz stabilisiert.",
        "success"
      );
      setIsBenchmarking(false);
    }, 8000);
  };

  return (
    <div className="bg-surface-background text-on-surface flex flex-col min-h-screen font-sans">
      
      {/* Top Navigation Bar */}
      <Header onAddAuditLog={addAuditLog} />

      {/* Main Structural Layout */}
      <div className="flex pt-header-height min-h-[calc(100vh-var(--spacing-header-height))]">
        
        {/* Left Side Navigation Menu */}
        <Sidebar 
          onNewVorgang={() => setIsVorgangModalOpen(true)} 
          activeTab={activeTab} 
          setActiveTab={setActiveTab} 
        />

        {/* Content Container Area */}
        <main className="flex-1 lg:ml-sidebar-width p-huge max-w-max-width mx-auto w-full flex flex-col">
          
          {/* Breadcrumb Path navigation */}
          <nav className="flex items-center space-x-base mb-md text-caption font-caption text-on-surface-variant select-none">
            <a className="hover:text-primary transition-colors" href="#" onClick={(e) => e.preventDefault()}>Startseite</a>
            <ChevronRight className="w-3.5 h-3.5 text-on-surface-variant" />
            <a className="hover:text-primary transition-colors" href="#" onClick={(e) => e.preventDefault()}>Verwaltung</a>
            <ChevronRight className="w-3.5 h-3.5 text-on-surface-variant" />
            <span className="text-on-surface font-body-semibold">Übersicht</span>
          </nav>

          {/* Page Headers & Control Toolbar */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-md mb-xl select-none">
            <div>
              <h1 className="font-h1 text-h1 text-brand-dark tracking-tight">Operations Center</h1>
              <p className="text-body-base text-on-surface-variant mt-0.5">
                Systemstatus und operative Verwaltung der Plattform.
              </p>
            </div>
            
            {/* Action Buttons Group */}
            <div className="flex flex-wrap gap-sm">
              <button 
                id="btn-add-user"
                onClick={() => setIsUserModalOpen(true)}
                className="bg-white border border-standard px-lg py-sm rounded-lg text-body-semibold text-primary hover:bg-surface-muted transition-colors flex items-center space-x-sm cursor-pointer active:scale-98"
              >
                <UserPlus className="w-4 h-4" />
                <span>Neuer Benutzer</span>
              </button>

              <button 
                id="btn-run-benchmark"
                disabled={isBenchmarking}
                onClick={handleStartBenchmark}
                className={`bg-white border border-standard px-lg py-sm rounded-lg text-body-semibold text-primary hover:bg-surface-muted transition-colors flex items-center space-x-sm cursor-pointer active:scale-98 disabled:opacity-60 disabled:pointer-events-none`}
              >
                {isBenchmarking ? (
                  <RefreshCw className="w-4 h-4 animate-spin" />
                ) : (
                  <Cpu className="w-4 h-4 text-secondary" />
                )}
                <span>{isBenchmarking ? "Wird getestet..." : "Benchmark starten"}</span>
              </button>
            </div>
          </div>

          {/* Conditional View Router based on Left Menu state */}
          {activeTab === "dashboard" ? (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-lg flex-1">
              
              {/* Column 1: System Health + Corpus Data Status */}
              <section className="space-y-lg xl:col-span-1 flex flex-col justify-between">
                <SystemStatusCard 
                  services={services} 
                  onToggleService={handleToggleService}
                  onResetServices={handleResetServices}
                />
                
                <CorpusStatusCard 
                  corpora={corpora} 
                  onCheckUpdates={handleCheckUpdates} 
                />
              </section>

              {/* Column 2: Live Ingest Background Jobs */}
              <section className="xl:col-span-1">
                <BackgroundJobsCard 
                  jobs={jobs} 
                  onAddJob={() => setIsVorgangModalOpen(true)}
                />
              </section>

              {/* Column 3: Live Audit Activity stream */}
              <section className="xl:col-span-1">
                <AuditLogsCard 
                  logs={logs} 
                  onClearLogs={() => setLogs([])}
                  onRestoreLogs={() => setLogs(initialLogs)}
                />
              </section>

            </div>
          ) : (
            /* Sub-Page placeholders styled elegantly using the layout specifications */
            <div className="bg-white border border-standard rounded-lg p-huge text-center flex-1 flex flex-col items-center justify-center space-y-md min-h-[400px]">
              <Building2 className="w-16 h-16 text-outline-variant stroke-1" />
              <div>
                <h2 className="text-h2 text-primary font-h2 font-semibold">
                  Schnittstelle "{activeTab.toUpperCase()}"
                </h2>
                <p className="text-body-base text-on-surface-variant mt-1 max-w-md mx-auto">
                  Diese Steuerungsseite ist für das übergeordnete Portal reserviert. Alle zugehörigen System-Ressourcen des Operations Centers verbleiben im Dashboard-Modus betriebsbereit.
                </p>
              </div>
              <button 
                onClick={() => setActiveTab("dashboard")}
                className="bg-primary text-white text-body-semibold px-lg py-sm rounded-lg hover:opacity-90 transition-opacity cursor-pointer"
              >
                Zurück zum Dashboard
              </button>
            </div>
          )}

        </main>
      </div>

      {/* Global Interactive Dialog Modals */}
      <NewVorgangModal
        isOpen={isVorgangModalOpen}
        onClose={() => setIsVorgangModalOpen(false)}
        onSubmit={handleNewVorgangSubmit}
      />

      <NewUserModal
        isOpen={isUserModalOpen}
        onClose={() => setIsUserModalOpen(false)}
        onSubmit={handleNewUserSubmit}
      />

      {/* Footer Branding Banner */}
      <footer className="w-full py-md px-huge flex flex-col sm:flex-row justify-between items-center gap-sm mt-auto border-t border-standard bg-surface-muted select-none">
        <div className="text-caption font-caption text-on-surface-variant">
          © 2024 Kommunale Entscheidungsplattform - Bundesrepublik Deutschland
        </div>
        <div className="flex space-x-lg text-caption font-caption">
          <a className="text-on-surface-variant hover:text-primary transition-colors" href="#" onClick={(e) => e.preventDefault()}>Impressum</a>
          <a className="text-on-surface-variant hover:text-primary transition-colors" href="#" onClick={(e) => e.preventDefault()}>Datenschutz</a>
          <a className="text-on-surface-variant hover:text-primary transition-colors" href="#" onClick={(e) => e.preventDefault()}>Barrierefreiheit</a>
          <a className="text-on-surface-variant hover:text-primary transition-colors" href="#" onClick={(e) => e.preventDefault()}>Kontakt</a>
        </div>
      </footer>

    </div>
  );
}
