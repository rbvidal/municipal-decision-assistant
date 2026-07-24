import React, { useState, useMemo, useCallback, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../auth";
import { AppShell } from "../../layouts/AppShell";
import {
  AppTopNavigation,
  PageTitleBar,
  TabBar,
  type NavModule,
  type TabItem,
} from "../../components/navigation";
import {
  Panel,
  StatCard,
  Badge,
  StatusDot,
  Button,
  SuggestionCard,
  Icon,
  EmptyState,
} from "../../components/common";
import { DataTable, type DataTableColumn } from "../../components/data";
import DashboardService, {
  type DashboardData,
} from "../../services/RestDashboardService";
import type { VorgangStatus } from "../../types";
import styles from "./HomePage.module.css";

const getGreeting = () => {
  const h = new Date().getHours();
  if (h < 11) return "Guten Morgen";
  if (h < 18) return "Guten Tag";
  return "Guten Abend";
};

const STATUS_MAP: Record<
  VorgangStatus,
  { status: "error" | "warning" | "info" | "neutral"; label: string }
> = {
  NEW: { status: "neutral", label: "Erfasst" },
  IN_REVIEW: { status: "warning", label: "In Prüfung" },
  DECISION_SUPPORT: { status: "info", label: "In Bearbeitung" },
  DRAFTING: { status: "info", label: "Entwurf" },
  PENDING_APPROVAL: { status: "warning", label: "Genehmigung" },
  READY_TO_SEND: { status: "info", label: "Versandbereit" },
  ARCHIVED: { status: "neutral", label: "Archiviert" },
  WAITING_FOR_CITIZEN: { status: "neutral", label: "Wartet Bürger" },
  WAITING_FOR_AUTHORITY: { status: "neutral", label: "Wartet Behörde" },
  WAITING_INTERNAL: { status: "neutral", label: "Wartet intern" },
};

const STATUS_TEXT_CLASS: Record<string, string> = {
  error: styles.statusOverdue,
  warning: styles.statusWarning,
  info: styles.statusInfo,
  neutral: styles.statusNeutral,
};

const normalizeStatus = (s: string): VorgangStatus => {
  return (STATUS_MAP[s as VorgangStatus] ? s : "NEW") as VorgangStatus;
};

const NAV_MODULES: NavModule[] = [
  { id: "home", label: "Startseite", href: "/home", active: true },
  { id: "work", label: "Meine Arbeit", href: "/work" },
  { id: "knowledge", label: "Wissen", href: "/knowledge" },
  { id: "documents", label: "Dokumente", href: "/documents" },
  { id: "admin", label: "Verwaltung", href: "/admin", visible: true },
];

export const HomePage: React.FC = React.memo(() => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [caseFilter, setCaseFilter] = useState("alle");
  const [showAllCases, setShowAllCases] = useState(false);

  const [dashboard, setDashboard] = useState<DashboardData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isError, setIsError] = useState(false);

  const loadDashboard = useCallback(async () => {
    setIsLoading(true);
    setIsError(false);
    try {
      const data = await DashboardService.getDashboard();
      setDashboard(data);
    } catch {
      setIsError(true);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadDashboard();
  }, [loadDashboard]);

  const greeting = useMemo(() => getGreeting(), []);
  const today = useMemo(
    () =>
      new Date().toLocaleDateString("de-DE", {
        weekday: "long",
        day: "numeric",
        month: "long",
        year: "numeric",
      }),
    [],
  );

  const mappedCases = useMemo(() => {
    if (!dashboard) return [];
    return dashboard.cases.map((c) => ({
      id: c.id,
      title: c.title,
      status: normalizeStatus(c.status),
      dueDate: c.dueDate,
      actionText: c.actionText,
    }));
  }, [dashboard]);

  const filteredCases = useMemo(() => {
    switch (caseFilter) {
      case "ueberfaellig":
        return mappedCases.filter((c) => c.dueDate === "Heute");
      case "heute":
        return mappedCases.filter((c) => c.dueDate === "Heute");
      default:
        return mappedCases;
    }
  }, [caseFilter, mappedCases]);

  const displayedCases = showAllCases ? filteredCases : filteredCases.slice(0, 5);

  const columns: DataTableColumn<typeof mappedCases[number]>[] = useMemo(
    () => [
      { key: "id", header: "ID / Aktenzeichen", render: (v) => <span className={styles.caseId}>{v.id}</span> },
      { key: "title", header: "Titel / Art", render: (v) => <span className={styles.caseTitle}>{v.title}</span> },
      {
        key: "status", header: "Status",
        render: (v) => {
          const { status, label } = STATUS_MAP[v.status];
          return (
            <span className={styles.statusCell}>
              <StatusDot status={status} size="sm" />
              <span className={STATUS_TEXT_CLASS[status]}>{label}</span>
            </span>
          );
        },
      },
      { key: "dueDate", header: "Fälligkeit", align: "left" as const, render: (v) => <span>{v.dueDate}</span> },
      {
        key: "actionText", header: "Aktion", align: "left" as const,
        render: (v) => (
          <button type="button" className={styles.actionBtn} onClick={() => navigate(`/work/${v.id}`)}>
            Bearbeiten
          </button>
        ),
      },
    ],
    [navigate],
  );

  const handleCreateCase = useCallback(() => navigate("/work/new"), [navigate]);
  const handleOpenTask = useCallback(() => {
    if (dashboard?.nextTask) navigate(`/work/${dashboard.nextTask.id}`);
  }, [navigate, dashboard]);

  const handleSuggestionAction = useCallback(
    (suggestionId: string) => {
      const s = dashboard?.suggestions.find((x) => x.id === suggestionId);
      if (s?.caseId) navigate(`/work/${s.caseId}`);
    },
    [navigate, dashboard],
  );

  const userName = user?.name ?? "Benutzer";

  // Error state
  if (isError && !dashboard) {
    return (
      <AppShell topNavigation={<AppTopNavigation modules={NAV_MODULES} activeModule="home" />}>
        <div className={styles.page}>
          <PageTitleBar title={`${greeting}, ${userName}.`} subtitle={today} />
          <EmptyState
            title="Dashboard nicht verfügbar"
            description="Die Dashboard-Daten konnten nicht vom Server geladen werden."
          />
          <div style={{ marginTop: "var(--space-4)", textAlign: "center" }}>
            <Button variant="secondary" onClick={loadDashboard}>Erneut versuchen</Button>
          </div>
        </div>
      </AppShell>
    );
  }

  const stats = dashboard?.stats ?? [];
  const suggestions = dashboard?.suggestions ?? [];
  const nextTask = dashboard?.nextTask;

  return (
    <AppShell topNavigation={<AppTopNavigation modules={NAV_MODULES} activeModule="home" />}>
      <div className={styles.page}>
        <PageTitleBar
          title={`${greeting}, ${userName}.`}
          subtitle={today}
          actions={
            <Button variant="primary" size="sm" onClick={handleCreateCase}>
              + Neuer Vorgang
            </Button>
          }
        />

        {isLoading ? (
          <p style={{ padding: "var(--space-6)" }}>Dashboard wird geladen...</p>
        ) : (
          <>
            <div className={styles.twoColumn}>
              <div className={styles.leftColumn}>
                {nextTask && (
                  <Panel
                    title="Vorgeschlagene nächste Aufgabe"
                    icon={<Icon name="zap" size={16} />}
                    headerAction={<Badge status="success">Priorität: Hoch</Badge>}
                  >
                    <div className={styles.nextTaskBody}>
                      <div className={styles.nextTaskIcon} aria-hidden="true">
                        <Icon name="wrench" size={20} />
                      </div>
                      <div className={styles.nextTaskInfo}>
                        <span className={styles.nextTaskCaseId}>{nextTask.id}</span>
                        <span className={styles.nextTaskTitle}>{nextTask.title}</span>
                        <div className={styles.nextTaskMeta}>
                          <span>Risiko: {nextTask.risk === "gering" ? "Gering" : nextTask.risk === "mittel" ? "Mittel" : "Hoch"}</span>
                          <span>Letzte Änderung: {nextTask.lastModified}</span>
                        </div>
                      </div>
                    </div>
                    <div className={styles.nextTaskFooter}>
                      <Button variant="primary" size="sm" onClick={handleOpenTask}>
                        Vorgang öffnen
                      </Button>
                    </div>
                  </Panel>
                )}

                <Panel
                  title="Meine Vorgänge"
                  headerAction={
                    <TabBar
                      tabs={[
                        { id: "alle", label: "Alle" },
                        { id: "ueberfaellig", label: "Überfällig" },
                        { id: "heute", label: "Heute" },
                      ]}
                      activeTab={caseFilter}
                      onTabChange={setCaseFilter}
                    />
                  }
                >
                  <DataTable
                    columns={columns}
                    data={displayedCases}
                    keyField="id"
                    emptyState="Keine Vorgänge gefunden"
                  />
                </Panel>
              </div>

              <aside className={styles.rightColumn}>
                <Panel
                  variant="subtle"
                  title="Vorschläge für Ihre Vorgänge"
                  icon={<Icon name="lightbulb" size={16} />}
                >
                  <div className={styles.suggestionsList}>
                    {suggestions.map((s) => (
                      <SuggestionCard
                        key={s.id}
                        caseId={s.caseId}
                        type={s.type === "warning" || s.type === "error" ? "Vorschlag" : "Zusammenfassung"}
                        title={s.title}
                        description={s.description}
                        actionLabel={s.actionLabel}
                        onAction={s.actionLabel ? () => handleSuggestionAction(s.id) : undefined}
                      />
                    ))}
                  </div>
                  <p className={styles.disclaimer}>
                    Dies sind automatisierte Vorschläge zur Entscheidungsunterstützung. Die
                    abschließende Prüfung obliegt der Sachbearbeitung.
                  </p>
                </Panel>
              </aside>
            </div>

            <div className={styles.statsGrid}>
              {stats.map((stat) => (
                <StatCard
                  key={stat.id}
                  label={stat.label}
                  value={stat.value}
                  status={stat.status}
                  percentage={stat.percentage}
                />
              ))}
            </div>
          </>
        )}
      </div>
    </AppShell>
  );
});

HomePage.displayName = "HomePage";
