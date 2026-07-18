import React, { useState, useMemo, useCallback, useEffect } from "react";
import { AppShell } from "../../layouts/AppShell";
import { AppTopNavigation, type NavModule } from "../../components/navigation";
import { DataTable, type DataTableColumn } from "../../components/data";
import { Panel, Badge, Button, Icon, EmptyState } from "../../components/common";
import { corpusService } from "../../services";
import type { AuditLog } from "../../mocks/corpus";
import styles from "./AuditPage.module.css";

const NAV_MODULES: NavModule[] = [
  { id: "home", label: "Startseite", href: "/home" },
  { id: "work", label: "Meine Arbeit", href: "/work" },
  { id: "admin", label: "Verwaltung", href: "/admin", active: true },
];

type FilterType = "all" | "LOGIN" | "LOGOUT" | "INGESTION" | "ERROR";

export const AuditPage: React.FC = React.memo(() => {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState<FilterType>("all");
  const [userFilter, setUserFilter] = useState("");
  const [selectedLog, setSelectedLog] = useState<AuditLog | null>(null);

  const load = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await corpusService.getAuditLogs();
      setLogs(data);
    } catch {
      // use empty list
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const filtered = useMemo(() => {
    let result = logs;
    if (activeFilter !== "all") {
      result = result.filter((l) => l.action.toUpperCase().includes(activeFilter));
    }
    if (userFilter.trim()) {
      result = result.filter((l) =>
        l.user.toLowerCase().includes(userFilter.toLowerCase()));
    }
    return result;
  }, [logs, activeFilter, userFilter]);

  function badgeForAction(action: string): "success" | "error" | "warning" | "info" {
    const a = action.toUpperCase();
    if (a.includes("LOGIN") || a.includes("LOGIN")) return "success";
    if (a.includes("ERROR") || a.includes("FAIL")) return "error";
    if (a.includes("DELETE") || a.includes("WARN")) return "warning";
    return "info";
  }

  const columns: DataTableColumn<AuditLog>[] = [
    { key: "timestamp", header: "Zeitstempel", render: (l) => <span className={styles.mono}>{l.timestamp}</span> },
    { key: "user", header: "Benutzer", render: (l) => <span>{l.user}</span> },
    {
      key: "action", header: "Aktion",
      render: (l) => <Badge status={badgeForAction(l.action)}>{l.action}</Badge>,
    },
    { key: "target", header: "Ziel", render: (l) => <span>{l.target}</span> },
    {
      key: "details",
      header: "",
      render: (l) => (
        <Button variant="secondary" size="sm" onClick={() => setSelectedLog(l)}>
          <Icon name="eye" size={12} /> Details
        </Button>
      ),
    },
  ];

  const FILTERS: { key: FilterType; label: string }[] = [
    { key: "all", label: "Alle" },
    { key: "LOGIN", label: "Login" },
    { key: "LOGOUT", label: "Logout" },
    { key: "INGESTION", label: "Ingestion" },
    { key: "ERROR", label: "Fehler" },
  ];

  return (
    <AppShell topNavigation={<AppTopNavigation modules={NAV_MODULES} activeModule="admin" />}>
      <h1 style={{ fontSize: "1.3rem", fontWeight: 600, marginBottom: "var(--space-4)" }}>
        Audit-Log
      </h1>

      <div className={styles.filterBar}>
        {FILTERS.map((f) => (
          <button key={f.key} type="button"
            className={`${styles.filterBtn} ${activeFilter === f.key ? styles.filterActive : ""}`}
            onClick={() => setActiveFilter(f.key)}>{f.label}</button>
        ))}
        <input type="text" className={styles.searchInput} placeholder="Benutzer filtern..."
          value={userFilter} onChange={(e) => setUserFilter(e.target.value)} />
      </div>

      <Panel title={`Einträge (${filtered.length})`}>
        {isLoading ? (
          <p className={styles.loading}>Lade Audit-Daten...</p>
        ) : filtered.length === 0 ? (
          <EmptyState title="Keine Einträge" description="Keine Audit-Einträge gefunden." />
        ) : (
          <DataTable columns={columns} data={filtered} keyField="id" />
        )}
        <div style={{ marginTop: "var(--space-3)" }}>
          <Button variant="secondary" size="sm" onClick={load} disabled={isLoading}>
            Aktualisieren
          </Button>
        </div>
      </Panel>

      {/* Detail view */}
      {selectedLog && (
        <Panel title={`Details — ${selectedLog.action}`}>
          <div className={styles.detailGrid}>
            <span className={styles.detailLabel}>Zeitstempel:</span>
            <span>{selectedLog.timestamp}</span>
            <span className={styles.detailLabel}>Benutzer:</span>
            <span>{selectedLog.user}</span>
            <span className={styles.detailLabel}>Aktion:</span>
            <span>{selectedLog.action}</span>
            <span className={styles.detailLabel}>Ziel:</span>
            <span>{selectedLog.target}</span>
            <span className={styles.detailLabel}>Typ:</span>
            <Badge status={badgeForAction(selectedLog.action)}>{selectedLog.action}</Badge>
          </div>
          <Button variant="secondary" size="sm" onClick={() => setSelectedLog(null)}>Schließen</Button>
        </Panel>
      )}
    </AppShell>
  );
});

AuditPage.displayName = "AuditPage";
