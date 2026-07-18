import React, { useState, useCallback, useMemo } from "react";
import { useParams } from "react-router-dom";
import { CaseWorkspaceLayout } from "../../layouts/CaseWorkspaceLayout";
import {
  AppTopNavigation,
  Breadcrumb,
  TabBar,
  type NavModule,
  type BreadcrumbItem,
  type TabItem,
} from "../../components/navigation";
import {
  CaseHeader,
  Panel,
  CitationCard,
  Icon,
  type TimelineEvent,
} from "../../components/common";
import { useCaseWorkspace } from "../../hooks/useCaseWorkspace";
import { VORGANG_STATUS_LABELS } from "../../types";
import type { ChecklistItemData, DocumentItemData, CaseNoteData } from "../../mocks/case-workspace";
import {
  OverviewTab,
  ChecklistTab,
  DocumentsTab,
  InternalNotesTab,
  ActivityTab,
  DecisionSupportTab,
  DraftTab,
  SendTab,
} from "./tabs";
import styles from "./CaseWorkspacePage.module.css";

const NAV_MODULES: NavModule[] = [
  { id: "home", label: "Startseite", href: "/home" },
  { id: "work", label: "Meine Arbeit", href: "/work", active: true },
  { id: "knowledge", label: "Wissen", href: "/knowledge" },
  { id: "documents", label: "Dokumente", href: "/documents" },
  { id: "admin", label: "Verwaltung", href: "/admin" },
];

const WORKSPACE_TABS: TabItem[] = [
  { id: "overview", label: "Übersicht" },
  { id: "checklist", label: "Checkliste" },
  { id: "documents", label: "Dokumente" },
  { id: "notes", label: "Interne Notizen" },
  { id: "activity", label: "Aktivität" },
  { id: "decision-support", label: "Entscheidungshilfe" },
  { id: "draft", label: "Entwurf" },
  { id: "send", label: "Versand" },
];

const DOCUMENT_TYPES = [
  "Planzeichnung", "Lageplan", "Brandschutznachweis",
  "Nachbarschaftszustimmung", "Sonstiges",
] as const;

export const CaseWorkspacePage: React.FC = React.memo(() => {
  const { caseId } = useParams<{ caseId: string }>();
  const {
    caseData,
    workflowSteps,
    checklistItems,
    documents,
    timelineEvents,
    caseNotes,
    regulations,
    isLoading,
    toggleChecklistItem,
    addChecklistItem,
    uploadDocument,
    addNote,
  } = useCaseWorkspace(caseId ?? "unknown");

  const [activeTab, setActiveTab] = useState("overview");

  const breadcrumbItems: BreadcrumbItem[] = useMemo(() => [
    { label: "Startseite", href: "/home" },
    { label: "Meine Arbeit", href: "/work" },
    { label: `Vorgang ${caseData?.id ?? caseId}`, href: `/work/${caseId}` },
  ], [caseData, caseId]);

  const statusLabel = useMemo(
    () => (caseData ? VORGANG_STATUS_LABELS[caseData.status] : ""),
    [caseData],
  );

  const renderActiveTab = useCallback(() => {
    switch (activeTab) {
      case "overview":
        return caseData && <OverviewTab caseData={caseData} workflowSteps={workflowSteps} />;
      case "checklist":
        return <ChecklistTab items={checklistItems} onToggleItem={toggleChecklistItem} onAddItem={addChecklistItem} />;
      case "documents":
        return <DocumentsTab documents={documents} documentTypes={DOCUMENT_TYPES} onUploadDocument={uploadDocument} />;
      case "notes":
        return <InternalNotesTab notes={caseNotes} onAddNote={addNote} />;
      case "activity":
        return <ActivityTab events={timelineEvents.map((e) => ({ ...e }))} />;
      case "decision-support":
        return <DecisionSupportTab regulations={regulations} caseId={caseId ?? "unknown"} />;
      case "draft":
        return <DraftTab />;
      case "send":
        return <SendTab />;
      default:
        return caseData && <OverviewTab caseData={caseData} workflowSteps={workflowSteps} />;
    }
  }, [activeTab, caseData, workflowSteps, checklistItems, documents, caseNotes, timelineEvents, regulations, caseId, toggleChecklistItem, addChecklistItem, uploadDocument, addNote]);

  if (isLoading) {
    return (
      <CaseWorkspaceLayout
        topNavigation={<AppTopNavigation modules={NAV_MODULES} activeModule="work" />}
        breadcrumb={<Breadcrumb items={[{ label: "Startseite", href: "/home" }, { label: "Lädt...", href: "#" }]} onNavigate={() => {}} />}
        caseHeader={<div />}
        tabBar={<TabBar tabs={WORKSPACE_TABS} activeTab="overview" onTabChange={() => {}} />}
      >
        <Panel><p>Vorgang wird geladen...</p></Panel>
      </CaseWorkspaceLayout>
    );
  }

  if (!caseData) {
    return (
      <CaseWorkspaceLayout
        topNavigation={<AppTopNavigation modules={NAV_MODULES} activeModule="work" />}
        breadcrumb={<Breadcrumb items={breadcrumbItems} onNavigate={() => {}} />}
        caseHeader={<div />}
        tabBar={<TabBar tabs={WORKSPACE_TABS} activeTab="overview" onTabChange={() => {}} />}
      >
        <Panel><p>Vorgang nicht gefunden.</p></Panel>
      </CaseWorkspaceLayout>
    );
  }

  return (
    <CaseWorkspaceLayout
      topNavigation={<AppTopNavigation modules={NAV_MODULES} activeModule="work" />}
      breadcrumb={<Breadcrumb items={breadcrumbItems} onNavigate={() => {}} />}
      caseHeader={
        <CaseHeader
          caseId={caseData.id}
          title={caseData.title}
          applicant={caseData.applicant}
          department={caseData.department}
          assignee={caseData.assignee}
          priority={caseData.priority}
          risk={caseData.risk}
          statusLabel={statusLabel}
          deadline={caseData.deadline}
        />
      }
      tabBar={<TabBar tabs={WORKSPACE_TABS} activeTab={activeTab} onTabChange={setActiveTab} />}
      sidebar={
        <div className={styles.sidebarContent}>
          <Panel title="Zusammenfassung">
            <p className={styles.sidebarSummary}>
              Vorgang {caseData.id}: {caseData.title}. Antragsteller: {caseData.applicant}.
              Bearbeiter: {caseData.assignee}. Status: {statusLabel}.
            </p>
          </Panel>

          {regulations.length > 0 && (
            <Panel title="Anwendbare Vorschriften">
              {regulations.map((reg) => (
                <CitationCard key={reg.id} code={reg.code} title={reg.title} />
              ))}
            </Panel>
          )}

          <hr className={styles.sidebarDivider} />
          <p className={styles.disclaimer}>
            Dies sind automatisierte Vorschläge zur Entscheidungsunterstützung. Die abschließende
            Prüfung obliegt der Sachbearbeitung.
          </p>
        </div>
      }
    >
      {renderActiveTab()}
    </CaseWorkspaceLayout>
  );
});

CaseWorkspacePage.displayName = "CaseWorkspacePage";
