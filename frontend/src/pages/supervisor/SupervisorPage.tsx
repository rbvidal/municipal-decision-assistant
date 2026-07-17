import React, { useState, useCallback, useMemo } from "react";
import { AppShell } from "../../layouts/AppShell";
import { TopNavigation, type NavModule } from "../../components/navigation";
import { Panel, Badge, Button, Icon } from "../../components/common";
import {
  ApprovalTimeline,
  ApprovalRecommendation,
  ApprovalComments,
  ApprovalRiskCard,
  PrecedentCard,
} from "../../components/approval";
import { supervisorCases } from "../../mocks/supervisor";
import styles from "./SupervisorPage.module.css";

const NAV_MODULES: NavModule[] = [
  { id: "home", label: "Startseite", href: "/home" },
  { id: "work", label: "Meine Arbeit", href: "/work", active: true },
  { id: "knowledge", label: "Wissen", href: "/knowledge" },
  { id: "documents", label: "Dokumente", href: "/documents" },
  { id: "admin", label: "Verwaltung", href: "/admin" },
];

const VERIFICATION_ICONS = {
  success: { icon: "check-circle", className: styles.verificationSuccess },
  warning: { icon: "alert-triangle", className: styles.verificationWarning },
  error: { icon: "alert-circle", className: styles.verificationError },
} as const;

function getConsistency(rating: string) {
  switch (rating) {
    case "GERING":
      return { value: "100 %", label: "Match", color: styles.consistencySuccess };
    case "MITTEL":
      return { value: "85 %", label: "Abgleich", color: styles.consistencyWarning };
    case "HOCH":
      return { value: "45 %", label: "Abweichung", color: styles.consistencyError };
    default:
      return { value: "—", label: "", color: "" };
  }
}

export const SupervisorPage: React.FC = React.memo(() => {
  const [selectedCaseId, setSelectedCaseId] = useState(supervisorCases[0].caseId);
  const [comments, setComments] = useState("");
  const [statusOverrides, setStatusOverrides] = useState<Record<string, string>>({});

  const activeCase = useMemo(
    () => supervisorCases.find((c) => c.caseId === selectedCaseId) ?? supervisorCases[0],
    [selectedCaseId],
  );

  const caseStatus = statusOverrides[activeCase.caseId] ?? activeCase.statusLabel;

  const handleApprove = useCallback(() => {
    setStatusOverrides((prev) => ({ ...prev, [activeCase.caseId]: "Genehmigt" }));
    setComments("");
  }, [activeCase.caseId]);

  const handleReject = useCallback(() => {
    setStatusOverrides((prev) => ({ ...prev, [activeCase.caseId]: "Abgelehnt" }));
    setComments("");
  }, [activeCase.caseId]);

  const handleRevise = useCallback(() => {
    setStatusOverrides((prev) => ({ ...prev, [activeCase.caseId]: "Zur Revision" }));
    setComments("");
  }, [activeCase.caseId]);

  const canRevise = comments.trim().length > 0;
  const isResolved = caseStatus === "Genehmigt" || caseStatus === "Abgelehnt";

  const consistency = getConsistency(activeCase.riskRating);

  return (
    <AppShell
      topNavigation={
        <TopNavigation
          modules={NAV_MODULES}
          activeModule="work"
          onNavigate={() => {}}
          userName="Dr. Klaus Weber"
          userEmail="k.weber@verwaltung.de"
          userDepartment="Bauaufsicht"
          userInitials="KW"
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
        <div className={styles.toolbar}>
          <div className={styles.caseSelector}>
            <span className={styles.caseSelectorLabel}>Vorgang:</span>
            <select
              className={styles.caseSelectorSelect}
              value={selectedCaseId}
              onChange={(e) => {
                setSelectedCaseId(e.target.value);
                setComments("");
              }}
              aria-label="Vorgang auswählen"
            >
              {supervisorCases.map((c) => (
                <option key={c.caseId} value={c.caseId}>
                  {c.caseId} — {c.title}
                </option>
              ))}
            </select>
            <Badge
              status={
                caseStatus === "Genehmigt"
                  ? "success"
                  : caseStatus === "Abgelehnt"
                    ? "error"
                    : "warning"
              }
            >
              {caseStatus}
            </Badge>
          </div>

          <div className={styles.toolbarActions}>
            <Button
              variant="secondary"
              size="sm"
              onClick={handleRevise}
              disabled={!canRevise || isResolved}
            >
              Zurück zur Überarbeitung
            </Button>
            <Button variant="danger" size="sm" onClick={handleReject} disabled={isResolved}>
              Ablehnen
            </Button>
            <Button variant="primary" size="sm" onClick={handleApprove} disabled={isResolved}>
              Genehmigen
            </Button>
          </div>
        </div>

        <div className={styles.layout}>
          <aside className={styles.left} aria-label="Vorgangsdetails">
            <div className={styles.caseIdentity}>
              <span className={styles.caseId}>{activeCase.caseId}</span>
              <h2 className={styles.caseTitle}>{activeCase.title}</h2>
              <div className={styles.caseSubmit}>
                <Icon name="calendar" size={14} />
                <span>Eingereicht {activeCase.submittedAt} von </span>
                <button type="button" className={styles.submitterLink}>
                  {activeCase.submittedBy}
                </button>
              </div>
            </div>

            <Panel title="Prüfprotokoll">
              <ApprovalTimeline steps={activeCase.protocolSteps} title="" />
            </Panel>

            <Panel title="Anhänge">
              {activeCase.attachments.map((att) => (
                <div key={att.id} className={styles.attachmentItem}>
                  <Icon name="file-text" size={14} />
                  <span className={styles.attachmentName}>{att.name}</span>
                  {att.size && <span className={styles.attachmentSize}>{att.size}</span>}
                </div>
              ))}
            </Panel>
          </aside>

          <main className={styles.center}>
            <div className={styles.comparisonGrid}>
              <div className={styles.draftColumn}>
                <Panel
                  title="Entscheidungsentwurf"
                  headerAction={
                    <Badge status="info" variant="pill">
                      {activeCase.draftVersion}
                    </Badge>
                  }
                >
                  {activeCase.draftConditions.map((condition, idx) => (
                    <div key={idx} className={styles.draftCondition}>
                      <span className={styles.conditionNum}>{idx + 1}.</span>
                      {condition}
                    </div>
                  ))}
                </Panel>
              </div>

              <div className={styles.verificationColumn}>
                <Panel
                  title="Automatische Verifikation"
                  headerAction={
                    <Badge status="success" variant="pill">
                      Prüfung aktiv
                    </Badge>
                  }
                >
                  {activeCase.verifications.map((v) => {
                    const vi = VERIFICATION_ICONS[v.status];
                    return (
                      <div key={v.id} className={styles.verificationCard}>
                        <div className={`${styles.verificationIcon} ${vi.className}`}>
                          <Icon name={vi.icon} size={18} />
                        </div>
                        <div className={styles.verificationContent}>
                          <span className={styles.verificationTitle}>{v.title}</span>
                          <span className={styles.verificationDesc}>{v.description}</span>
                        </div>
                      </div>
                    );
                  })}
                  <div className={styles.consistencyMeter}>
                    <span className={styles.consistencyLabel}>
                      Text-Metadaten {consistency.label}
                    </span>
                    <span className={styles.consistencyValue}>{consistency.value}</span>
                    <div className={`${styles.consistencyBar} ${consistency.color}`} />
                  </div>
                </Panel>
              </div>
            </div>

            <ApprovalComments
              value={comments}
              onChange={setComments}
              label={`Korrekturwünsche / Anmerkungen für ${activeCase.submittedBy}`}
            />
          </main>

          <aside className={styles.right} aria-label="Entscheidungsunterstützung">
            <div className={styles.sidebarSection}>
              <ApprovalRiskCard
                riskRating={activeCase.riskRating}
                title={activeCase.riskTitle}
                description={activeCase.riskDescription}
              />
            </div>

            <div className={styles.sidebarSection}>
              <h3 className={styles.sidebarHeading}>Präzedenzfälle</h3>
              <div className={styles.precedentList}>
                {activeCase.precedents.map((p) => (
                  <PrecedentCard
                    key={p.caseId}
                    caseId={p.caseId}
                    date={p.date}
                    title={p.title}
                    description={p.description}
                    relevance={p.relevance}
                  />
                ))}
              </div>
            </div>

            <div className={styles.sidebarSection}>
              <ApprovalRecommendation text={activeCase.recommendation} />
            </div>
          </aside>
        </div>
      </div>
    </AppShell>
  );
});

SupervisorPage.displayName = "SupervisorPage";
