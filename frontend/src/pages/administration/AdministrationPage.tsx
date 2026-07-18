import React from "react";
import { useNavigate } from "react-router-dom";
import { AppShell } from "../../layouts/AppShell";
import { AppTopNavigation, type NavModule } from "../../components/navigation";
import { Panel, StatCard, Icon } from "../../components/common";
import styles from "./AdministrationPage.module.css";

const NAV_MODULES: NavModule[] = [
  { id: "home", label: "Startseite", href: "/home" },
  { id: "work", label: "Meine Arbeit", href: "/work" },
  { id: "knowledge", label: "Wissen", href: "/knowledge" },
  { id: "documents", label: "Dokumente", href: "/documents" },
  { id: "admin", label: "Verwaltung", href: "/admin", active: true },
];

interface ToolCard {
  id: string;
  title: string;
  description: string;
  icon: string;
  href: string;
  color: string;
}

const TOOLS: ToolCard[] = [
  {
    id: "corpus", title: "Corpus-Verwaltung", icon: "database",
    description: "Dokumenten-Health, Embedding-Abdeckung, Qdrant-Status und Corpus-Inventar.",
    href: "/admin/corpus", color: "#1a4cd4",
  },
  {
    id: "audit", title: "Audit-Log", icon: "shield",
    description: "Sicherheitsrelevante Ereignisse, Benutzeraktionen und System-Logs durchsuchen.",
    href: "/admin/audit", color: "#22b07d",
  },
  {
    id: "users", title: "Benutzerverwaltung", icon: "users",
    description: "Benutzerkonten verwalten, Rollen zuweisen, Account-Status ändern.",
    href: "/admin/users", color: "#7c5ce7",
  },
  {
    id: "knowledge", title: "Wissensbasis", icon: "book-open",
    description: "Regulationen nach Rechtsbereich durchsuchen, Dokumente und Vorschriften einsehen.",
    href: "/knowledge", color: "#f5a623",
  },
  {
    id: "jobs", title: "Hintergrundjobs", icon: "refresh-cw",
    description: "Ingestion-Jobs, Indexierung und Embedding-Generierung überwachen.",
    href: "/admin/jobs", color: "#e54545",
  },
  {
    id: "documents", title: "Dokumentenverwaltung", icon: "file-text",
    description: "Dokumente hochladen, versionieren, archivieren und durchsuchen.",
    href: "/documents", color: "#0ea5e9",
  },
];

export const AdministrationPage: React.FC = React.memo(() => {
  const navigate = useNavigate();

  return (
    <AppShell topNavigation={<AppTopNavigation modules={NAV_MODULES} activeModule="admin" />}>
      <h1 style={{ fontSize: "1.3rem", fontWeight: 600, marginBottom: "var(--space-2)" }}>
        Verwaltung
      </h1>
      <p style={{ fontSize: "0.85rem", color: "var(--color-gray-500)", marginBottom: "var(--space-5)" }}>
        Administrationswerkzeuge für die Kommunale Entscheidungsplattform.
      </p>

      {/* System status */}
      <div className={styles.statsGrid} style={{ marginBottom: "var(--space-5)" }}>
        <StatCard label="API Status" value={1} icon="check-circle" />
        <StatCard label="Datenbank" value={1} icon="database" />
        <StatCard label="Qdrant" value={1} icon="server" />
        <StatCard label="Uptime (Tage)" value={14} icon="clock" />
      </div>

      {/* Tool grid */}
      <div className={styles.toolGrid}>
        {TOOLS.map((tool) => (
          <button
            key={tool.id}
            type="button"
            className={styles.toolCard}
            onClick={() => navigate(tool.href)}
            style={{ borderTopColor: tool.color }}
          >
            <div className={styles.toolIcon} style={{ color: tool.color }}>
              <Icon name={tool.icon} size={28} />
            </div>
            <h3 className={styles.toolTitle}>{tool.title}</h3>
            <p className={styles.toolDesc}>{tool.description}</p>
          </button>
        ))}
      </div>

      <Panel title="System-Informationen">
        <div style={{ display: "flex", gap: "var(--space-6)", flexWrap: "wrap", fontSize: "0.85rem" }}>
          <div>
            <strong>Version:</strong> 2.4.1
          </div>
          <div>
            <strong>Letzter Health-Check:</strong> Vor 47 Minuten
          </div>
          <div>
            <strong>Embedding-Modell:</strong> multilingual-e5-large
          </div>
          <div>
            <strong>Java:</strong> 21
          </div>
        </div>
      </Panel>
    </AppShell>
  );
});

AdministrationPage.displayName = "AdministrationPage";
