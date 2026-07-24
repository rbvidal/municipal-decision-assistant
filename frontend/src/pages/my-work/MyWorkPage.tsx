import React, { useState, useMemo, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { AppShell } from "../../layouts/AppShell";
import { AppTopNavigation, PageTitleBar, type NavModule } from "../../components/navigation";
import { DataTable, type DataTableColumn } from "../../components/data";
import { Badge, Icon, EmptyState, Panel, Button } from "../../components/common";
import { useCases } from "../../hooks/useCases";
import type { CaseDetails } from "../../types/domain";
import { VORGANG_STATUS_LABELS } from "../../types";
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
  const { data: cases = [], isLoading, isError } = useCases();
  const [activeFilter, setActiveFilter] = useState<FilterKey>("all");

  const filteredCases = useMemo(() => {
    switch (activeFilter) {
      case "overdue":
        return cases.filter((c) => c.dueDate && c.dueDate < new Date().toISOString().split("T")[0]);
      case "high":
        return cases.filter((c) => c.risk === "high" || c.priority === "high");
      case "active":
        return cases.filter((c) => c.status === "NEW" || c.status === "IN_REVIEW" || c.status === "DRAFTING");
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
          <button type="button" className={styles.caseLink} onClick={() => navigate(`/work/${c.id}`)}>
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
            {VORGANG_STATUS_LABELS[c.status as keyof typeof VORGANG_STATUS_LABELS] ?? c.status}
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
      { key: "dueDate", header: "Fälligkeit", render: (c) => <span>{c.dueDate}</span> },
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

      <div className={styles.filterBar}>
        {FILTERS.map((f) => (
          <button
            key={f.key} type="button"
            className={`${styles.filterBtn} ${activeFilter === f.key ? styles.filterActive : ""}`}
            onClick={() => setActiveFilter(f.key)}
          >
            {f.label}
          </button>
        ))}
      </div>

      <Panel>
        {isLoading ? (
          <div className={styles.loadingArea}>
            <p>Vorgänge werden geladen...</p>
          </div>
        ) : isError ? (
          <div className={styles.errorArea}>
            <p>Vorgänge konnten nicht geladen werden.</p>
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
