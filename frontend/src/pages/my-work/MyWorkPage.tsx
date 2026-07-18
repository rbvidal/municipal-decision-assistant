import React, { useState, useMemo, useCallback, useEffect } from "react";
import { AppShell } from "../../layouts/AppShell";
import { AppTopNavigation, PageTitleBar, type NavModule } from "../../components/navigation";
import { DataTable, type DataTableColumn } from "../../components/data";
import { Badge, Icon, EmptyState, Panel, Button } from "../../components/common";
import { caseService } from "../../services/serviceFactory";
import type { CaseDetails } from "../../mocks/case-workspace";
import { VORGANG_STATUS_LABELS } from "../../types";
import { useNavigate } from "react-router-dom";
import styles from "./MyWorkPage.module.css";

const NAV_MODULES: NavModule[] = [
  { id: "home", label: "Startseite", href: "/home" },
  { id: "work", label: "Meine Arbeit", href: "/work", active: true },
  { id: "knowledge", label: "Wissen", href: "/knowledge" },
  { id: "documents", label: "Dokumente", href: "/documents" },
  { id: "admin", label: "Verwaltung", href: "/admin" },
];

type FilterKey = "all" | "overdue" | "high" | "active";

const FILTERS: { key: FilterKey; label: string }[] = [
  { key: "all", label: "Alle" },
  { key: "overdue", label: "Überfällig" },
  { key: "high", label: "Hohe Priorität" },
  { key: "active", label: "Aktiv" },
];

export const MyWorkPage: React.FC = React.memo(() => {
  const navigate = useNavigate();
  const [cases, setCases] = useState<CaseDetails[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState<FilterKey>("all");
  const [error, setError] = useState<string | null>(null);

  const loadCases = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      // Load a fixed set of cases (in production, would use ownerId filter)
      const all = await Promise.all([
        caseService.getCase("BAU-2026-0147"),
        caseService.getCase("BAU-2026-0147").then((c) => ({
          ...c,
          id: "BAU-2026-0152",
          title: "Nutzungsänderung Ladeneinheit",
          applicant: "Maria Schmidt",
          status: "NEW" as const,
          priority: "high" as const,
          deadline: "2026-07-25",
        })),
        caseService.getCase("BAU-2026-0147").then((c) => ({
          ...c,
          id: "FEU-2026-0089",
          title: "Brandschutzkonzept Bürogebäude",
          applicant: "Johannes Weber",
          status: "IN_REVIEW" as const,
          priority: "medium" as const,
          deadline: "2026-08-01",
        })),
        caseService.getCase("BAU-2026-0147").then((c) => ({
          ...c,
          id: "BPL-2026-0034",
          title: "Bebauungsplanänderung Nordstadt",
          applicant: "Stadtplanungsamt",
          status: "DRAFTING" as const,
          priority: "low" as const,
          deadline: "2026-09-15",
        })),
      ]);
      setCases(all);
    } catch {
      setError("Vorgänge konnten nicht geladen werden.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadCases();
  }, [loadCases]);

  const filteredCases = useMemo(() => {
    switch (activeFilter) {
      case "overdue":
        return cases.filter((c) => c.deadline === "Heute" || c.deadline < "2026-08-01");
      case "high":
        return cases.filter((c) => c.priority === "high");
      case "active":
        return cases.filter((c) => c.status === "NEW" || c.status === "IN_REVIEW");
      default:
        return cases;
    }
  }, [cases, activeFilter]);

  const columns: DataTableColumn<CaseDetails>[] = useMemo(
    () => [
      {
        key: "id",
        header: "Aktenzeichen",
        render: (c) => (
          <button
            type="button"
            className={styles.caseLink}
            onClick={() => navigate(`/work/${c.id}`)}
          >
            <Icon name="folder" size={14} />
            {c.id}
          </button>
        ),
      },
      { key: "title", header: "Titel", render: (c) => <span>{c.title}</span> },
      { key: "applicant", header: "Antragsteller", render: (c) => <span>{c.applicant}</span> },
      { key: "assignee", header: "Bearbeiter", render: (c) => <span>{c.assignee}</span> },
      {
        key: "status",
        header: "Status",
        render: (c) => (
          <Badge
            status={
              c.status === "NEW" ? "info"
              : c.status === "IN_REVIEW" ? "warning"
              : c.status === "ARCHIVED" ? "error"
              : "neutral"
            }
          >
            {VORGANG_STATUS_LABELS[c.status] ?? c.status}
          </Badge>
        ),
      },
      {
        key: "priority",
        header: "Priorität",
        render: (c) => (
          <Badge status={c.priority === "high" ? "error" : c.priority === "medium" ? "warning" : "neutral"}>
            {c.priority === "high" ? "Hoch" : c.priority === "medium" ? "Mittel" : "Niedrig"}
          </Badge>
        ),
      },
      { key: "deadline", header: "Fälligkeit", render: (c) => <span>{c.deadline}</span> },
    ],
    [navigate],
  );

  return (
    <AppShell
      topNavigation={<AppTopNavigation modules={NAV_MODULES} activeModule="work" />}
      subNavigation={null}
    >
      <PageTitleBar
        title="Meine Arbeit"
        subtitle={`${filteredCases.length} Vorgänge`}
        actions={
          <Button variant="primary" size="sm" onClick={() => navigate("/work/new")}>
            <Icon name="plus" size={14} />
            Neuer Vorgang
          </Button>
        }
      />

      {/* Filter bar */}
      <div className={styles.filterBar}>
        {FILTERS.map((f) => (
          <button
            key={f.key}
            type="button"
            className={`${styles.filterBtn} ${activeFilter === f.key ? styles.filterActive : ""}`}
            onClick={() => setActiveFilter(f.key)}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* Content */}
      <Panel>
        {isLoading ? (
          <div className={styles.loadingArea}>
            <p>Vorgänge werden geladen...</p>
          </div>
        ) : error ? (
          <div className={styles.errorArea}>
            <p>{error}</p>
            <Button variant="secondary" size="sm" onClick={loadCases}>
              Erneut versuchen
            </Button>
          </div>
        ) : filteredCases.length === 0 ? (
          <EmptyState
            title="Keine Vorgänge"
            description={
              activeFilter !== "all"
                ? "Keine Vorgänge entsprechen dem ausgewählten Filter."
                : "Sie haben derzeit keine zugewiesenen Vorgänge."
            }
          />
        ) : (
          <DataTable columns={columns} data={filteredCases} keyField="id" />
        )}
      </Panel>
    </AppShell>
  );
});

MyWorkPage.displayName = "MyWorkPage";
