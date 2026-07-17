import React, { useState, useMemo, useCallback } from "react";
import { AppShell } from "../../layouts/AppShell";
import { TopNavigation, TabBar, type NavModule } from "../../components/navigation";
import { DataTable, type DataTableColumn } from "../../components/data";
import {
  Panel,
  StatCard,
  Badge,
  Button,
  ProgressIndicator,
  PropertyGrid,
  ActionToolbar,
  EmptyState,
} from "../../components/common";
import { ConfirmDialog } from "../../components/interaction";
import {
  mockSystemHealth,
  mockBackgroundJobs,
  mockAuditLogs,
  mockDepartments,
  ADMIN_TABS,
} from "../../mocks/administration";
import type { BackgroundJob, AuditLogEntry, DepartmentConfig } from "../../mocks/administration";
import styles from "./AdministrationPage.module.css";

const NAV_MODULES: NavModule[] = [
  { id: "home", label: "Startseite", href: "/home" },
  { id: "work", label: "Meine Arbeit", href: "/work" },
  { id: "knowledge", label: "Wissen", href: "/knowledge" },
  { id: "documents", label: "Dokumente", href: "/documents" },
  { id: "admin", label: "Verwaltung", href: "/admin", active: true },
];

const JOB_STATUS: Record<string, "success" | "info" | "error" | "neutral"> = {
  Completed: "success",
  Running: "info",
  Failed: "error",
  Queued: "neutral",
};

export const AdministrationPage: React.FC = React.memo(() => {
  const [activeTab, setActiveTab] = useState("overview");
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);
  const [auditLogs, setAuditLogs] = useState(mockAuditLogs);

  const handleClearAudit = useCallback(() => setAuditLogs([]), []);

  const jobColumns: DataTableColumn<BackgroundJob>[] = useMemo(
    () => [
      {
        key: "name",
        header: "Auftrag",
        render: (j) => <span className={styles.jobName}>{j.name}</span>,
      },
      {
        key: "status",
        header: "Status",
        render: (j) => <Badge status={JOB_STATUS[j.status] ?? "neutral"}>{j.status}</Badge>,
      },
      {
        key: "progress",
        header: "Fortschritt",
        render: (j) => (
          <ProgressIndicator
            value={j.progress}
            max={100}
            size="sm"
            status={j.status === "Failed" ? "error" : j.status === "Completed" ? "success" : "info"}
          />
        ),
      },
      {
        key: "startedAt",
        header: "Gestartet",
        render: (j) => <span className={styles.monoCell}>{j.startedAt}</span>,
      },
      {
        key: "duration",
        header: "Dauer",
        render: (j) => <span className={styles.monoCell}>{j.duration}</span>,
      },
    ],
    [],
  );

  const auditColumns: DataTableColumn<AuditLogEntry>[] = useMemo(
    () => [
      {
        key: "timestamp",
        header: "Zeitstempel",
        render: (l) => <span className={styles.monoCell}>{l.timestamp}</span>,
      },
      {
        key: "user",
        header: "Benutzer",
        render: (l) => <span className={styles.monoCell}>{l.user}</span>,
      },
      {
        key: "action",
        header: "Aktion",
        render: (l) => <span className={styles.monoCell}>{l.action}</span>,
      },
      {
        key: "target",
        header: "Zielobjekt",
        render: (l) => <span className={styles.monoCell}>{l.target}</span>,
      },
      { key: "ip", header: "IP", render: (l) => <span className={styles.monoCell}>{l.ip}</span> },
    ],
    [],
  );

  const deptColumns: DataTableColumn<DepartmentConfig>[] = useMemo(
    () => [
      {
        key: "name",
        header: "Dezernat",
        render: (d) => <span className={styles.jobName}>{d.name}</span>,
      },
      {
        key: "shortCode",
        header: "Kürzel",
        render: (d) => (
          <Badge status="info" variant="pill">
            {d.shortCode}
          </Badge>
        ),
      },
      {
        key: "activeUsers",
        header: "Aktive Benutzer",
        render: (d) => <span className={styles.monoCell}>{String(d.activeUsers)}</span>,
      },
      {
        key: "totalCases",
        header: "Vorgänge",
        render: (d) => <span className={styles.monoCell}>{String(d.totalCases)}</span>,
      },
    ],
    [],
  );

  return (
    <AppShell
      topNavigation={
        <TopNavigation
          modules={NAV_MODULES}
          activeModule="admin"
          onNavigate={() => {}}
          userName="Joachim Dehmel"
          userEmail="j.dehmel@verwaltung.de"
          userDepartment="Amt für Digitalisierung"
          userInitials="JD"
          userActions={[
            { id: "profile", label: "Profil", onClick: () => {} },
            { id: "logout", label: "Abmelden", onClick: () => {} },
          ]}
          notifications={[]}
          onNotificationClick={() => {}}
          onMarkAllNotificationsRead={() => {}}
          onViewAllNotifications={() => {}}
        />
      }
    >
      <div className={styles.page}>
        <div className={styles.header}>
          <h1 className={styles.headerTitle}>Verwaltung</h1>
          <ActionToolbar
            actions={[
              { id: "sync", label: "Sync starten", onClick: () => {}, variant: "primary" },
              { id: "export", label: "Export", onClick: () => {}, variant: "secondary" },
            ]}
          />
        </div>
        <TabBar tabs={ADMIN_TABS} activeTab={activeTab} onTabChange={setActiveTab} />

        {activeTab === "overview" && (
          <>
            <div className={styles.statsGrid}>
              <StatCard
                label="CPU"
                value={mockSystemHealth.cpuPercent}
                percentage={mockSystemHealth.cpuPercent}
                status="info"
              />
              <StatCard
                label="Speicher"
                value={mockSystemHealth.memoryPercent}
                percentage={mockSystemHealth.memoryPercent}
                status="warning"
              />
              <StatCard
                label="Festplatte"
                value={mockSystemHealth.diskPercent}
                percentage={mockSystemHealth.diskPercent}
                status="success"
              />
              <StatCard label="Uptime" value={14} status="neutral" />
            </div>
            <div className={styles.overviewGrid}>
              <Panel title="System-Status">
                <PropertyGrid
                  items={[
                    { label: "API", value: mockSystemHealth.apiStatus, valueHighlight: true },
                    { label: "Datenbank", value: mockSystemHealth.dbStatus, valueHighlight: true },
                    { label: "Qdrant", value: mockSystemHealth.qdrantStatus, valueHighlight: true },
                    { label: "Version", value: mockSystemHealth.version, valueMono: true },
                    { label: "Uptime", value: mockSystemHealth.uptime, valueMono: true },
                  ]}
                />
              </Panel>
              <Panel title="Schnellaktionen">
                <ActionToolbar
                  actions={[
                    {
                      id: "reindex",
                      label: "Re-Indizierung starten",
                      onClick: () => {},
                      variant: "primary",
                    },
                    {
                      id: "clearcache",
                      label: "Cache leeren",
                      onClick: () => {},
                      variant: "secondary",
                    },
                    {
                      id: "restart",
                      label: "Dienst neustarten",
                      onClick: () => {},
                      variant: "danger",
                    },
                  ]}
                />
              </Panel>
            </div>
          </>
        )}

        {activeTab === "jobs" && (
          <Panel title="Hintergrundaufträge">
            <DataTable columns={jobColumns} data={mockBackgroundJobs} keyField="id" />
          </Panel>
        )}

        {activeTab === "audit" && (
          <Panel
            title="Audit-Protokoll"
            headerAction={
              <Button variant="ghost" size="sm" onClick={() => setConfirmDelete("audit")}>
                Protokoll löschen
              </Button>
            }
          >
            {auditLogs.length === 0 ? (
              <EmptyState title="Keine Audit-Einträge" />
            ) : (
              <DataTable columns={auditColumns} data={auditLogs} keyField="id" />
            )}
          </Panel>
        )}

        {activeTab === "departments" && (
          <Panel title="Dezernate & Fachbereiche">
            <DataTable columns={deptColumns} data={mockDepartments} keyField="id" />
          </Panel>
        )}

        {activeTab === "settings" && (
          <Panel title="System-Einstellungen">
            <div className={styles.settingsForm}>
              <div>
                <div className={styles.settingsRow}>
                  <div>
                    <span className={styles.settingsLabel}>Automatische Indizierung</span>
                    <p className={styles.settingsDesc}>
                      Neue Dokumente werden automatisch indiziert.
                    </p>
                  </div>
                  <input
                    type="checkbox"
                    defaultChecked
                    className={styles.settingsInput}
                    style={{ width: "auto" }}
                  />
                </div>
                <hr className={styles.settingsDivider} />
                <div className={styles.settingsRow}>
                  <div>
                    <span className={styles.settingsLabel}>Embedding-Modell</span>
                    <p className={styles.settingsDesc}>
                      Verwendetes Modell für Vektoreinbettungen.
                    </p>
                  </div>
                  <select className={styles.settingsInput} defaultValue="text-embedding-004">
                    <option>text-embedding-004</option>
                    <option>text-embedding-003</option>
                    <option>text-multilingual-embedding-002</option>
                  </select>
                </div>
                <hr className={styles.settingsDivider} />
                <div className={styles.settingsRow}>
                  <div>
                    <span className={styles.settingsLabel}>Chunk-Größe (Tokens)</span>
                    <p className={styles.settingsDesc}>Maximale Tokens pro Text-Chunk.</p>
                  </div>
                  <input type="number" className={styles.settingsInput} defaultValue={512} />
                </div>
                <hr className={styles.settingsDivider} />
                <Button variant="primary" size="sm">
                  Einstellungen speichern
                </Button>
              </div>
            </div>
          </Panel>
        )}
      </div>

      <ConfirmDialog
        open={confirmDelete === "audit"}
        onClose={() => setConfirmDelete(null)}
        onConfirm={handleClearAudit}
        title="Audit-Protokoll löschen"
        description="Möchten Sie wirklich das gesamte Audit-Protokoll löschen? Diese Aktion kann nicht rückgängig gemacht werden."
        confirmLabel="Löschen"
        mode="danger"
      />
    </AppShell>
  );
});

AdministrationPage.displayName = "AdministrationPage";
