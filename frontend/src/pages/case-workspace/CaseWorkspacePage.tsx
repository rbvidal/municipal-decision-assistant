import React, { useState, useCallback, useMemo } from "react";
import { CaseWorkspaceLayout } from "../../layouts/CaseWorkspaceLayout";
import {
  TopNavigation,
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
import {
  mockCase,
  mockWorkflowSteps,
  mockChecklistItems,
  mockDocuments,
  mockTimelineEvents,
  mockRegulations,
  mockChecklistProposals,
  mockCaseNotes,
  DOCUMENT_TYPES,
} from "../../mocks/case-workspace";
import type { ChecklistItemData, DocumentItemData, CaseNoteData } from "../../mocks/case-workspace";
import { VORGANG_STATUS_LABELS } from "../../types";
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

const BREADCRUMB_ITEMS: BreadcrumbItem[] = [
  { label: "Startseite", href: "/home" },
  { label: "Meine Arbeit", href: "/work" },
  { label: `Vorgang ${mockCase.id}`, href: `/work/${mockCase.id}` },
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

export const CaseWorkspacePage: React.FC = React.memo(() => {
  const [activeTab, setActiveTab] = useState("overview");
  const [checklistItems, setChecklistItems] = useState<ChecklistItemData[]>(mockChecklistItems);
  const [documents, setDocuments] = useState<DocumentItemData[]>(mockDocuments);
  const [timelineEvents, _setTimelineEvents] = useState<TimelineEvent[]>(
    mockTimelineEvents.map((e) => ({ ...e })),
  );
  const [caseNotes, setCaseNotes] = useState<CaseNoteData[]>(mockCaseNotes);

  const handleToggleChecklistItem = useCallback((id: string) => {
    setChecklistItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, checked: !item.checked } : item)),
    );
  }, []);

  const handleAddChecklistItem = useCallback((title: string, description?: string) => {
    const newItem: ChecklistItemData = {
      id: `c${Date.now()}`,
      title,
      description: description ?? "",
      checked: false,
      statusLabel: "Offen",
    };
    setChecklistItems((prev) => [...prev, newItem]);
  }, []);

  const handleUploadDocument = useCallback((name: string, type: string) => {
    const newDoc: DocumentItemData = {
      id: `d${Date.now()}`,
      name,
      type,
      date: new Date().toLocaleDateString("de-DE"),
      status: "Offen",
    };
    setDocuments((prev) => [...prev, newDoc]);
  }, []);

  const handleAddCaseNote = useCallback((content: string) => {
    const newNote: CaseNoteData = {
      id: `n${Date.now()}`,
      author: "Sabine Müller",
      time: "Jetzt",
      content,
    };
    setCaseNotes((prev) => [newNote, ...prev]);
  }, []);

  const handleAddChecklistProposal = useCallback(
    (text: string) => {
      const exists = checklistItems.some((item) => item.title === text);
      if (!exists) {
        handleAddChecklistItem(text);
      }
    },
    [checklistItems, handleAddChecklistItem],
  );

  const statusLabel = useMemo(() => VORGANG_STATUS_LABELS[mockCase.status], []);

  const renderActiveTab = useCallback(() => {
    switch (activeTab) {
      case "overview":
        return <OverviewTab caseData={mockCase} workflowSteps={mockWorkflowSteps} />;
      case "checklist":
        return (
          <ChecklistTab
            items={checklistItems}
            onToggleItem={handleToggleChecklistItem}
            onAddItem={handleAddChecklistItem}
          />
        );
      case "documents":
        return (
          <DocumentsTab
            documents={documents}
            documentTypes={DOCUMENT_TYPES}
            onUploadDocument={handleUploadDocument}
          />
        );
      case "notes":
        return <InternalNotesTab notes={caseNotes} onAddNote={handleAddCaseNote} />;
      case "activity":
        return <ActivityTab events={timelineEvents} />;
      case "decision-support":
        return <DecisionSupportTab regulations={mockRegulations} caseId={mockCase.id} />;
      case "draft":
        return <DraftTab />;
      case "send":
        return <SendTab />;
      default:
        return <OverviewTab caseData={mockCase} workflowSteps={mockWorkflowSteps} />;
    }
  }, [
    activeTab,
    checklistItems,
    documents,
    caseNotes,
    timelineEvents,
    handleToggleChecklistItem,
    handleAddChecklistItem,
    handleUploadDocument,
    handleAddCaseNote,
  ]);

  const sidebarContent = useMemo(
    () => (
      <div className={styles.sidebarContent}>
        <Panel title="Zusammenfassung">
          <p className={styles.sidebarSummary}>
            Bauantrag für einen Carport auf Flurstück 102/5. Antragsteller Thomas Becker. Erste
            Prüfung zeigt Konformität mit Bebauungsplan, jedoch fehlt der Brandschutznachweis (§ 65
            BauO NRW). Keine nachbarschaftlichen Einwände dokumentiert.
          </p>
        </Panel>

        <Panel title="Anwendbare Vorschriften">
          {mockRegulations.map((reg) => (
            <CitationCard key={reg.id} code={reg.code} title={reg.title} />
          ))}
        </Panel>

        <Panel title="Vorschläge für Checkliste">
          {mockChecklistProposals.map((proposal) => (
            <div key={proposal.id} className={styles.proposalItem}>
              <p className={styles.proposalText}>{proposal.text}</p>
              <button
                type="button"
                className={styles.proposalBtn}
                onClick={() => handleAddChecklistProposal(proposal.text)}
                aria-label={`Vorschlag "${proposal.text}" zur Checkliste hinzufügen`}
              >
                <Icon name="plus-circle" size={16} />
              </button>
            </div>
          ))}
        </Panel>

        <hr className={styles.sidebarDivider} />
        <p className={styles.disclaimer}>
          Dies sind automatisierte Vorschläge zur Entscheidungsunterstützung. Die abschließende
          Prüfung obliegt der Sachbearbeitung.
        </p>
      </div>
    ),
    [handleAddChecklistProposal],
  );

  return (
    <CaseWorkspaceLayout
      topNavigation={
        <TopNavigation
          modules={NAV_MODULES}
          activeModule="work"
          onNavigate={() => {}}
          userName="Sabine Müller"
          userEmail="s.mueller@verwaltung.de"
          userDepartment="Bauamt"
          userInitials="SM"
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
      breadcrumb={<Breadcrumb items={BREADCRUMB_ITEMS} onNavigate={() => {}} />}
      caseHeader={
        <CaseHeader
          caseId={mockCase.id}
          title={mockCase.title}
          applicant={mockCase.applicant}
          department={mockCase.department}
          assignee={mockCase.assignee}
          priority={mockCase.priority}
          risk={mockCase.risk}
          statusLabel={statusLabel}
          deadline={mockCase.deadline}
        />
      }
      tabBar={<TabBar tabs={WORKSPACE_TABS} activeTab={activeTab} onTabChange={setActiveTab} />}
      sidebar={sidebarContent}
    >
      {renderActiveTab()}
    </CaseWorkspaceLayout>
  );
});

CaseWorkspacePage.displayName = "CaseWorkspacePage";
