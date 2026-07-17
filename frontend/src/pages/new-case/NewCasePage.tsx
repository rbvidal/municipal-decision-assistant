import React, { useState, useCallback, useMemo } from "react";
import { AppShell } from "../../layouts/AppShell";
import {
  TopNavigation,
  Breadcrumb,
  type NavModule,
  type BreadcrumbItem,
} from "../../components/navigation";
import { Wizard } from "../../components/interaction";
import { Panel, Icon, PropertyGrid } from "../../components/common";
import { CASE_TYPES, DEPARTMENTS, DOCUMENT_OPTIONS, initialFormData } from "../../mocks/new-case";
import type { CaseFormData } from "../../mocks/new-case";
import styles from "./NewCasePage.module.css";

const NAV_MODULES: NavModule[] = [
  { id: "home", label: "Startseite", href: "/home" },
  { id: "work", label: "Meine Arbeit", href: "/work", active: true },
  { id: "knowledge", label: "Wissen", href: "/knowledge" },
  { id: "documents", label: "Dokumente", href: "/documents" },
  { id: "admin", label: "Verwaltung", href: "/admin" },
];

const BREADCRUMBS: BreadcrumbItem[] = [
  { label: "Startseite", href: "/home" },
  { label: "Meine Arbeit", href: "/work" },
  { label: "Neuer Vorgang", href: "/work/new" },
];

export const NewCasePage: React.FC = React.memo(() => {
  const [formData, setFormData] = useState<CaseFormData>(initialFormData);
  const [completed, setCompleted] = useState(false);

  const update = useCallback(<K extends keyof CaseFormData>(key: K, value: CaseFormData[K]) => {
    setFormData((prev) => ({ ...prev, [key]: value }));
  }, []);

  const toggleDocument = useCallback((doc: string) => {
    setFormData((prev) => ({
      ...prev,
      documents: prev.documents.includes(doc)
        ? prev.documents.filter((d) => d !== doc)
        : [...prev.documents, doc],
    }));
  }, []);

  const handleFinish = useCallback(() => setCompleted(true), []);

  const steps = useMemo(
    () => [
      {
        id: "type",
        label: "Vorgangstyp",
        validate: () => formData.caseType !== "",
        content: (
          <div className={styles.stepContent}>
            <div>
              <h3 className={styles.stepTitle}>Vorgangstyp wählen</h3>
              <p className={styles.stepDesc}>Wählen Sie die Art des neuen Vorgangs aus.</p>
            </div>
            <div className={styles.formGroup}>
              <div>
                <label className={styles.formLabel}>Vorgangstyp</label>
                <select
                  className={styles.formSelect}
                  value={formData.caseType}
                  onChange={(e) => update("caseType", e.target.value)}
                  aria-label="Vorgangstyp"
                >
                  <option value="">— Bitte wählen —</option>
                  {CASE_TYPES.map((t) => (
                    <option key={t} value={t}>
                      {t}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className={styles.formLabel}>Dezernat</label>
                <select
                  className={styles.formSelect}
                  value={formData.department}
                  onChange={(e) => update("department", e.target.value)}
                  aria-label="Dezernat"
                >
                  <option value="">— Bitte wählen —</option>
                  {DEPARTMENTS.map((d) => (
                    <option key={d} value={d}>
                      {d}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        ),
      },
      {
        id: "applicant",
        label: "Antragsteller",
        validate: () => formData.applicantName !== "" && formData.applicantEmail !== "",
        content: (
          <div className={styles.stepContent}>
            <div>
              <h3 className={styles.stepTitle}>Antragsteller erfassen</h3>
              <p className={styles.stepDesc}>Geben Sie die Kontaktdaten des Antragstellers ein.</p>
            </div>
            <div className={styles.formGroup}>
              <div className={styles.formRow}>
                <div>
                  <label className={styles.formLabel}>Name *</label>
                  <input
                    className={styles.formInput}
                    value={formData.applicantName}
                    onChange={(e) => update("applicantName", e.target.value)}
                    placeholder="Vor- und Nachname"
                    aria-label="Name des Antragstellers"
                  />
                </div>
                <div>
                  <label className={styles.formLabel}>E-Mail *</label>
                  <input
                    className={styles.formInput}
                    type="email"
                    value={formData.applicantEmail}
                    onChange={(e) => update("applicantEmail", e.target.value)}
                    placeholder="E-Mail-Adresse"
                    aria-label="E-Mail des Antragstellers"
                  />
                </div>
              </div>
              <div>
                <label className={styles.formLabel}>Anschrift</label>
                <input
                  className={styles.formInput}
                  value={formData.applicantAddress}
                  onChange={(e) => update("applicantAddress", e.target.value)}
                  placeholder="Straße, PLZ, Ort"
                  aria-label="Anschrift"
                />
              </div>
            </div>
          </div>
        ),
      },
      {
        id: "documents",
        label: "Dokumente",
        content: (
          <div className={styles.stepContent}>
            <div>
              <h3 className={styles.stepTitle}>Erforderliche Dokumente</h3>
              <p className={styles.stepDesc}>Wählen Sie die einzureichenden Dokumente aus.</p>
            </div>
            <div className={styles.docCheckGrid}>
              {DOCUMENT_OPTIONS.map((doc) => (
                <label key={doc} className={styles.docCheckItem}>
                  <input
                    type="checkbox"
                    checked={formData.documents.includes(doc)}
                    onChange={() => toggleDocument(doc)}
                  />
                  {doc}
                </label>
              ))}
            </div>
            {formData.documents.length > 0 && (
              <Panel title={`Ausgewählt (${formData.documents.length})`}>
                <PropertyGrid
                  items={formData.documents.map((d) => ({ label: d, value: "Erforderlich" }))}
                />
              </Panel>
            )}
          </div>
        ),
      },
      {
        id: "classification",
        label: "Klassifikation",
        content: (
          <div className={styles.stepContent}>
            <div>
              <h3 className={styles.stepTitle}>Klassifikation & Priorität</h3>
              <p className={styles.stepDesc}>Legen Sie Priorität und Risikoeinschätzung fest.</p>
            </div>
            <div className={styles.formGroup}>
              <div className={styles.formRow}>
                <div>
                  <label className={styles.formLabel}>Priorität</label>
                  <select
                    className={styles.formSelect}
                    value={formData.priority}
                    onChange={(e) => update("priority", e.target.value)}
                    aria-label="Priorität"
                  >
                    <option value="">— Wählen —</option>
                    <option value="high">Hoch</option>
                    <option value="medium">Mittel</option>
                    <option value="low">Niedrig</option>
                  </select>
                </div>
                <div>
                  <label className={styles.formLabel}>Risiko</label>
                  <select
                    className={styles.formSelect}
                    value={formData.risk}
                    onChange={(e) => update("risk", e.target.value)}
                    aria-label="Risiko"
                  >
                    <option value="">— Wählen —</option>
                    <option value="hoch">Hoch</option>
                    <option value="mittel">Mittel</option>
                    <option value="gering">Gering</option>
                  </select>
                </div>
              </div>
              <div>
                <label className={styles.formLabel}>Beschreibung</label>
                <textarea
                  className={styles.formTextarea}
                  value={formData.description}
                  onChange={(e) => update("description", e.target.value)}
                  placeholder="Kurze Beschreibung des Vorgangs..."
                  aria-label="Beschreibung"
                />
              </div>
            </div>
          </div>
        ),
      },
      {
        id: "review",
        label: "Prüfung",
        content: (
          <div className={styles.stepContent}>
            <div>
              <h3 className={styles.stepTitle}>Zusammenfassung prüfen</h3>
              <p className={styles.stepDesc}>
                Überprüfen Sie alle Angaben vor dem Anlegen des Vorgangs.
              </p>
            </div>
            <div className={styles.summaryGrid}>
              <div className={styles.summaryItem}>
                <span className={styles.summaryLabel}>Vorgangstyp</span>
                <span className={styles.summaryValue}>{formData.caseType || "—"}</span>
              </div>
              <div className={styles.summaryItem}>
                <span className={styles.summaryLabel}>Dezernat</span>
                <span className={styles.summaryValue}>{formData.department || "—"}</span>
              </div>
              <div className={styles.summaryItem}>
                <span className={styles.summaryLabel}>Antragsteller</span>
                <span className={styles.summaryValue}>{formData.applicantName || "—"}</span>
              </div>
              <div className={styles.summaryItem}>
                <span className={styles.summaryLabel}>E-Mail</span>
                <span className={styles.summaryValue}>{formData.applicantEmail || "—"}</span>
              </div>
              <div className={styles.summaryItem}>
                <span className={styles.summaryLabel}>Priorität</span>
                <span className={styles.summaryValue}>
                  {formData.priority === "high"
                    ? "Hoch"
                    : formData.priority === "medium"
                      ? "Mittel"
                      : formData.priority === "low"
                        ? "Niedrig"
                        : "—"}
                </span>
              </div>
              <div className={styles.summaryItem}>
                <span className={styles.summaryLabel}>Risiko</span>
                <span className={styles.summaryValue}>
                  {formData.risk === "hoch"
                    ? "Hoch"
                    : formData.risk === "mittel"
                      ? "Mittel"
                      : formData.risk === "gering"
                        ? "Gering"
                        : "—"}
                </span>
              </div>
            </div>
            {formData.documents.length > 0 && (
              <div className={styles.summaryItem}>
                <span className={styles.summaryLabel}>Dokumente ({formData.documents.length})</span>
                <span className={styles.summaryValue}>{formData.documents.join(", ")}</span>
              </div>
            )}
          </div>
        ),
      },
      {
        id: "confirmation",
        label: "Bestätigung",
        content: completed ? (
          <div className={styles.successBanner}>
            <Icon name="check-circle" size={48} className={styles.successIcon} />
            <h3 className={styles.successTitle}>Vorgang erfolgreich angelegt</h3>
            <p className={styles.successText}>
              Der Vorgang {formData.caseType} für {formData.applicantName} wurde erstellt und an das
              Dezernat {formData.department} zugewiesen.
            </p>
          </div>
        ) : (
          <div className={styles.stepContent}>
            <div>
              <h3 className={styles.stepTitle}>Vorgang anlegen</h3>
              <p className={styles.stepDesc}>
                Klicken Sie auf &bdquo;Abschließen&rdquo;, um den Vorgang zu erstellen.
              </p>
            </div>
          </div>
        ),
      },
    ],
    [formData, completed, update, toggleDocument],
  );

  return (
    <AppShell
      topNavigation={
        <TopNavigation
          modules={NAV_MODULES}
          activeModule="work"
          onNavigate={() => {}}
          userName="Sabine Müller"
          userEmail="s.mueller@verwaltung.de"
          userDepartment="Bauaufsicht"
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
      breadcrumb={<Breadcrumb items={BREADCRUMBS} onNavigate={() => {}} />}
    >
      <div className={styles.page}>
        <div className={styles.wizardWrap}>
          <Wizard
            steps={steps}
            onFinish={handleFinish}
            onCancel={() => {}}
            finishLabel="Vorgang anlegen"
          />
        </div>
      </div>
    </AppShell>
  );
});

NewCasePage.displayName = "NewCasePage";
