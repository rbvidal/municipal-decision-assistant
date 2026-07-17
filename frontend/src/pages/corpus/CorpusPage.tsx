import React, { useState, useMemo, useCallback } from "react";
import { AppShell } from "../../layouts/AppShell";
import { TopNavigation, TabBar, type NavModule } from "../../components/navigation";
import { SearchBar } from "../../components/search";
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
import {
  mockPackages,
  mockMetrics,
  mockBackgroundJobs,
  mockAuditLogs,
  CORPUS_TABS,
} from "../../mocks/corpus";
import type { Wissenspaket, BackgroundJob, AuditLog } from "../../mocks/corpus";
import styles from "./CorpusPage.module.css";

const NAV_MODULES: NavModule[] = [
  { id: "home", label: "Startseite", href: "/home" },
  { id: "work", label: "Meine Arbeit", href: "/work" },
  { id: "knowledge", label: "Wissen", href: "/knowledge" },
  { id: "documents", label: "Dokumente", href: "/documents" },
  { id: "admin", label: "Verwaltung", href: "/admin", active: true },
];

const STATUS_CONFIG: Record<string, "success" | "info" | "error"> = {
  Bereit: "success",
  "Indiziert...": "info",
  Fehler: "error",
};

const JOB_STATUS_CONFIG: Record<string, "success" | "info" | "error"> = {
  Completed: "success",
  Running: "info",
  Failed: "error",
};

export const CorpusPage: React.FC = React.memo(() => {
  const [activeTab, setActiveTab] = useState("overview");
  const [searchQuery, setSearchQuery] = useState("");
  const [packages] = useState<Wissenspaket[]>(mockPackages);
  const [metrics] = useState(mockMetrics);
  const [jobs] = useState<BackgroundJob[]>(mockBackgroundJobs);
  const [logs, setLogs] = useState<AuditLog[]>(mockAuditLogs);

  const filteredPackages = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) return packages;
    return packages.filter(
      (p) => p.name.toLowerCase().includes(q) || p.description.toLowerCase().includes(q),
    );
  }, [packages, searchQuery]);

  const totalChunks = useMemo(() => packages.reduce((s, p) => s + p.chunks, 0), [packages]);
  const totalDocs = useMemo(() => packages.reduce((s, p) => s + p.documents, 0), [packages]);
  const healthyCount = useMemo(
    () => packages.filter((p) => p.status === "Bereit").length,
    [packages],
  );
  const healthPct = packages.length > 0 ? Math.round((healthyCount / packages.length) * 100) : 0;

  const pkgColumns: DataTableColumn<Wissenspaket>[] = useMemo(
    () => [
      {
        key: "name",
        header: "Paketname",
        render: (p) => <span className={styles.packageName}>{p.name}</span>,
      },
      {
        key: "version",
        header: "Version",
        render: (p) => <span className={styles.metricValueMono}>{p.version}</span>,
      },
      {
        key: "documents",
        header: "Dokumente",
        align: "right",
        render: (p) => <span className={styles.metricValueMono}>{String(p.documents)}</span>,
      },
      {
        key: "chunks",
        header: "Chunks",
        align: "right",
        render: (p) => <span className={styles.metricValueMono}>{String(p.chunks)}</span>,
      },
      {
        key: "status",
        header: "Status",
        render: (p) => <Badge status={STATUS_CONFIG[p.status] ?? "neutral"}>{p.status}</Badge>,
      },
      {
        key: "lastSync",
        header: "Letzte Synch.",
        render: (p) => <span className={styles.metricValueMono}>{p.lastSync}</span>,
      },
    ],
    [],
  );

  const auditColumns: DataTableColumn<AuditLog>[] = useMemo(
    () => [
      {
        key: "timestamp",
        header: "Zeitstempel",
        render: (l) => <span className={styles.metricValueMono}>{l.timestamp}</span>,
      },
      {
        key: "user",
        header: "Benutzer",
        render: (l) => <span className={styles.metricValueMono}>{l.user}</span>,
      },
      {
        key: "action",
        header: "Aktion",
        render: (l) => <span className={styles.metricValueMono}>{l.action}</span>,
      },
      {
        key: "target",
        header: "Zielobjekt",
        render: (l) => <span className={styles.metricValueMono}>{l.target}</span>,
      },
    ],
    [],
  );

  const handleClearLogs = useCallback(() => setLogs([]), []);

  const renderActiveTab = () => {
    switch (activeTab) {
      case "overview":
        return (
          <div className={styles.mainCol}>
            <div className={styles.statsGrid}>
              <StatCard label="Vektoren gesamt" value={totalChunks} status="info" />
              <StatCard label="Quell-Dokumente" value={totalDocs} status="info" />
              <StatCard
                label="Datenkonsistenz"
                value={healthPct}
                percentage={healthPct}
                status="success"
              />
              <StatCard label="Wissenspakete" value={packages.length} status="neutral" />
            </div>
            <div className={styles.overviewGrid}>
              <Panel title="Willkommen im Korpus-Management">
                <div className={styles.stackCol}>
                  <Button variant="primary" size="sm">
                    Daten einpflegen
                  </Button>
                  <Button variant="secondary" size="sm">
                    Vektor-Index prüfen
                  </Button>
                  <Button variant="secondary" size="sm">
                    Audit & Sicherheit
                  </Button>
                </div>
              </Panel>
              <Panel title="System-Status">
                <PropertyGrid
                  items={[
                    { label: "API-Status", value: "Online", valueHighlight: true },
                    { label: "Qdrant Node 1", value: "Aktiv", valueHighlight: true },
                    { label: "Index Schema", value: "v4-dense-768" },
                    { label: "Letzte Synch.", value: "Heute, 08:15" },
                  ]}
                />
              </Panel>
            </div>
          </div>
        );

      case "users":
        return (
          <Panel title="Systembenutzer & Berechtigungen">
            <DataTable
              columns={[
                {
                  key: "name",
                  header: "Name / E-Mail",
                  render: () => <span className={styles.packageName}>Joachim Dehmel</span>,
                },
                {
                  key: "role",
                  header: "Rolle",
                  render: () => <span className={styles.metricValueMono}>Systemadministrator</span>,
                },
                {
                  key: "dept",
                  header: "Dezernat / Amt",
                  render: () => (
                    <span className={styles.metricValueMono}>Amt für Digitalisierung</span>
                  ),
                },
                {
                  key: "status",
                  header: "Status",
                  render: () => <Badge status="success">Aktiv</Badge>,
                },
                {
                  key: "last",
                  header: "Letzter Zugriff",
                  render: () => <span className={styles.metricValueMono}>Heute, 09:30</span>,
                },
              ]}
              data={[
                {
                  name: "Joachim Dehmel",
                  role: "Systemadministrator",
                  dept: "Amt für Digitalisierung",
                  status: "Aktiv",
                  last: "Heute, 09:30",
                },
                {
                  name: "Sarah Lindner",
                  role: "Korpus-Managerin",
                  dept: "Bauaufsicht",
                  status: "Aktiv",
                  last: "Gestern, 17:15",
                },
                {
                  name: "Dr. Michael Schmitt",
                  role: "Fachbereichsleiter",
                  dept: "Rechtsamt",
                  status: "Aktiv",
                  last: "Heute, 08:00",
                },
                {
                  name: "Elena Rostova",
                  role: "IT-Sicherheit",
                  dept: "Amt für Digitalisierung",
                  status: "Aktiv",
                  last: "Vor 2 Tagen",
                },
              ]}
              keyField="name"
            />
          </Panel>
        );

      case "corpus":
        return (
          <div className={styles.layout}>
            <div className={styles.mainCol}>
              <Panel
                title="Wissenspakete"
                headerAction={
                  <ActionToolbar
                    actions={[
                      {
                        id: "sync",
                        label: "Alle synchronisieren",
                        onClick: () => {},
                        variant: "primary",
                      },
                      { id: "upload", label: "Hochladen", onClick: () => {}, variant: "secondary" },
                    ]}
                  />
                }
              >
                <SearchBar
                  value={searchQuery}
                  onChange={setSearchQuery}
                  placeholder="Pakete durchsuchen..."
                />
                <div className={styles.mt3}>
                  <DataTable
                    columns={pkgColumns}
                    data={filteredPackages}
                    keyField="id"
                    emptyState="Keine Pakete gefunden"
                  />
                </div>
              </Panel>
            </div>
            <div className={styles.sideCol}>
              <Panel title="Qdrant Status">
                <div className={styles.metricsList}>
                  <div className={styles.metricRow}>
                    <span className={styles.metricLabel}>Status</span>
                    <Badge status={metrics.status === "Online" ? "success" : "warning"}>
                      {metrics.status}
                    </Badge>
                  </div>
                  <div className={styles.metricRow}>
                    <span className={styles.metricLabel}>Latenz (p95)</span>
                    <span className={styles.metricValueMono}>{metrics.latencyP95} ms</span>
                  </div>
                  <div className={styles.metricRow}>
                    <span className={styles.metricLabel}>Index-Größe</span>
                    <span className={styles.metricValueMono}>{metrics.indexSizeGB} GB</span>
                  </div>
                  <div className={styles.metricRow}>
                    <span className={styles.metricLabel}>CPU</span>
                    <span className={styles.metricValueMono}>{metrics.cpuUsagePercent}%</span>
                  </div>
                  <ProgressIndicator value={metrics.cpuUsagePercent} max={100} size="sm" />
                </div>
              </Panel>

              <Panel title="Speicher-Allokation">
                <div className={styles.metricsList}>
                  <div className={styles.metricRow}>
                    <span className={styles.metricLabel}>Vektoren</span>
                    <span className={styles.metricValueMono}>{metrics.vectorsGB} GB</span>
                  </div>
                  <div className={styles.storageBar}>
                    <div
                      className={styles.storageFill}
                      style={{
                        width: `${(metrics.vectorsGB / metrics.indexSizeGB) * 100}%`,
                        background: "var(--color-primary-500)",
                      }}
                    />
                  </div>
                  <div className={styles.metricRow}>
                    <span className={styles.metricLabel}>Metadaten</span>
                    <span className={styles.metricValueMono}>{metrics.metadataGB} GB</span>
                  </div>
                  <div className={styles.metricRow}>
                    <span className={styles.metricLabel}>Logs & Cache</span>
                    <span className={styles.metricValueMono}>{metrics.logsCacheGB} GB</span>
                  </div>
                </div>
              </Panel>
            </div>
          </div>
        );

      case "jobs":
        return (
          <div className={styles.mainCol}>
            <Panel title="Hintergrund-Indizierungsjobs">
              {jobs.length === 0 ? (
                <EmptyState title="Keine aktiven Jobs" />
              ) : (
                <div className={styles.stackCol}>
                  {jobs.map((job) => (
                    <div key={job.id} className={styles.jobCard}>
                      <div className={styles.jobHeader}>
                        <span className={styles.jobName}>{job.name}</span>
                        <Badge status={JOB_STATUS_CONFIG[job.status] ?? "neutral"}>
                          {job.status}
                        </Badge>
                      </div>
                      <ProgressIndicator
                        value={job.progress}
                        max={100}
                        size="sm"
                        status={
                          job.status === "Failed"
                            ? "error"
                            : job.status === "Completed"
                              ? "success"
                              : "info"
                        }
                      />
                      <div className={styles.jobMeta}>Gestartet: {job.startedAt}</div>
                    </div>
                  ))}
                </div>
              )}
            </Panel>
          </div>
        );

      case "benchmarks":
        return (
          <div className={styles.mainCol}>
            <Panel title="In-Memory Benchmarking">
              <div className={styles.benchForm}>
                <select className={styles.benchSelect} aria-label="Vektor-Distanzmetrik">
                  <option>Cosine</option>
                  <option>Dot</option>
                  <option>Euclidean</option>
                </select>
                <input
                  type="number"
                  className={styles.benchInput}
                  defaultValue={100}
                  min={10}
                  max={1000}
                  aria-label="Parallele Queries"
                />
                <Button variant="primary" size="sm">
                  Belastungstest starten
                </Button>
              </div>
              <div className={styles.benchResults}>
                <div className={styles.benchResult}>
                  <div className={styles.benchResultValue}>247</div>
                  <div className={styles.benchResultLabel}>Queries / Sek.</div>
                </div>
                <div className={styles.benchResult}>
                  <div className={styles.benchResultValue}>11.2 ms</div>
                  <div className={styles.benchResultLabel}>Durchschn. Latenz</div>
                </div>
                <div className={styles.benchResult}>
                  <div className={styles.benchResultValue}>14.8 ms</div>
                  <div className={styles.benchResultLabel}>p95 Latenz</div>
                </div>
                <div className={styles.benchResult}>
                  <div className={styles.benchResultValue}>98.4%</div>
                  <div className={styles.benchResultLabel}>Suchpräzision</div>
                </div>
              </div>
            </Panel>
          </div>
        );

      case "audit":
        return (
          <div className={styles.mainCol}>
            <Panel
              title="Sicherheits- & Revisionsprotokoll"
              headerAction={
                <Button variant="ghost" size="sm" onClick={handleClearLogs}>
                  Protokoll löschen
                </Button>
              }
            >
              {logs.length === 0 ? (
                <EmptyState title="Keine Audit-Einträge" />
              ) : (
                <DataTable
                  columns={auditColumns}
                  data={logs}
                  keyField="id"
                  emptyState="Keine Audit-Einträge"
                />
              )}
            </Panel>
          </div>
        );

      default:
        return null;
    }
  };

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
          <h1 className={styles.headerTitle}>Korpus-Verwaltung</h1>
          <ActionToolbar
            actions={[
              { id: "sync", label: "Alle synchronisieren", onClick: () => {}, variant: "primary" },
              { id: "upload", label: "Hochladen", onClick: () => {}, variant: "secondary" },
            ]}
          />
        </div>

        <TabBar tabs={CORPUS_TABS} activeTab={activeTab} onTabChange={setActiveTab} />
        {renderActiveTab()}
      </div>
    </AppShell>
  );
});

CorpusPage.displayName = "CorpusPage";
