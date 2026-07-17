import React, { useState } from "react";
import {
  Download,
  Printer,
  Folder,
  User,
  ChevronRight,
  CheckCircle,
  Scale,
  FileText,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { Document, DocumentStatus } from "../types";
import styles from "./DetailPreview.module.css";

interface DetailPreviewProps {
  document: Document | null | undefined;
}

export const DetailPreview: React.FC<DetailPreviewProps> = ({ document }) => {
  const [isTechExpanded, setIsTechExpanded] = useState(false);

  if (!document) {
    return (
      <aside className={styles.preview}>
        <div style={{ padding: "32px", textAlign: "center", color: "var(--outline)" }}>
          <span className={styles.captionLabel}>Vorschau</span>
          <p style={{ marginTop: "16px" }}>Wählen Sie ein Dokument aus, um Details anzuzeigen.</p>
        </div>
      </aside>
    );
  }

  const getBadgeClass = (status: DocumentStatus) => {
    switch (status) {
      case DocumentStatus.Aktiv:
        return styles.badgeAktiv;
      case DocumentStatus.InPruefung:
        return styles.badgeInPruefung;
      case DocumentStatus.Fehlend:
        return styles.badgeFehlend;
      case DocumentStatus.Archiviert:
        return styles.badgeArchiviert;
      default:
        return "";
    }
  };

  return (
    <aside className={`${styles.preview} custom-scrollbar`}>
      {/* Preview Header */}
      <div className={styles.previewHeader}>
        <div className={styles.headerTop}>
          <div>
            <span className={styles.captionLabel}>Vorschau</span>
            <h2 className={styles.title}>{document.name}</h2>
            <span className={`${styles.badge} ${getBadgeClass(document.status)}`}>
              {document.status}
            </span>
          </div>
          <div className={styles.actionButtons}>
            <button className={styles.actionButton} title="Herunterladen">
              <Download size={18} />
            </button>
            <button className={styles.actionButton} title="Drucken">
              <Printer size={18} />
            </button>
          </div>
        </div>
      </div>

      {/* Metadata */}
      <div className={styles.section}>
        <h3 className={styles.sectionTitle}>Metadaten</h3>
        <dl className={styles.metadataList}>
          <dt className={styles.metaLabel}>Dokumenten-ID</dt>
          <dd className={`${styles.metaValue} ${styles.mono}`}>{document.dokumentId}</dd>
          
          <dt className={styles.metaLabel}>Typ</dt>
          <dd className={styles.metaValue}>{document.detailedTyp}</dd>
          
          <dt className={styles.metaLabel}>Dateigröße</dt>
          <dd className={styles.metaValue}>{document.dateigroesse}</dd>
          
          <dt className={styles.metaLabel}>Hochgeladen</dt>
          <dd className={styles.metaValue}>{document.hochgeladenAm}</dd>
        </dl>
      </div>

      {/* Context */}
      <div className={styles.section}>
        <h3 className={styles.sectionTitle}>Vorgangskontext</h3>
        <div className={styles.contextList}>
          <a href="#" className={styles.contextCard}>
            <div className={styles.contextLeft}>
              <Folder className={styles.contextIcon} />
              <span className={styles.contextText}>{document.vorgangId}</span>
            </div>
            <ChevronRight className={styles.chevronIcon} />
          </a>
          <a href="#" className={styles.contextCard}>
            <div className={styles.contextLeft}>
              <User className={styles.contextIcon} />
              <span className={styles.contextText}>{document.buerger}</span>
            </div>
            <ChevronRight className={styles.chevronIcon} />
          </a>
        </div>
      </div>

      {/* Versions */}
      <div className={styles.section}>
        <div className={styles.versionHeader}>
          <h3 className={styles.sectionTitle} style={{ marginBottom: 0 }}>Versionen</h3>
          <button className={styles.compareLink}>Vergleichen</button>
        </div>
        <div className={styles.versionList} style={{ marginTop: "12px" }}>
          {document.versions.map((ver, idx) => (
            ver.isCurrent ? (
              <div key={idx} className={styles.versionItemCurrent}>
                <div>
                  <div className={styles.versionTitle}>{ver.version}</div>
                  <div className={styles.versionSubtitle}>
                    {ver.date} von {ver.author}
                  </div>
                </div>
                <CheckCircle className={styles.checkIcon} />
              </div>
            ) : (
              <div key={idx} className={styles.versionItem}>
                <div>
                  <div className={styles.versionTitleRegular}>{ver.version}</div>
                  <div className={styles.versionSubtitle}>
                    {ver.date} von {ver.author}
                  </div>
                </div>
                <button className={styles.diffButton}>Diff</button>
              </div>
            )
          ))}
          {document.versions.length === 0 && (
            <div style={{ fontSize: "12px", color: "var(--outline)", fontStyle: "italic" }}>
              Keine Vorgängerversionen
            </div>
          )}
        </div>
      </div>

      {/* References & Legal Base */}
      <div className={styles.section}>
        <h3 className={styles.sectionTitle}>Referenzen &amp; Rechtsgrundlagen</h3>
        <ul className={styles.referenceList}>
          {document.references.map((ref) => (
            <li key={ref.id} className={styles.referenceItem}>
              {ref.type === "gavel" ? (
                <Scale className={`${styles.referenceIcon} ${styles.referenceIconSpecial}`} />
              ) : (
                <FileText className={styles.referenceIcon} />
              )}
              <span className={styles.referenceText}>{ref.title}</span>
            </li>
          ))}
          {document.references.length === 0 && (
            <div style={{ fontSize: "12px", color: "var(--outline)", fontStyle: "italic" }}>
              Keine Referenzen hinterlegt
            </div>
          )}
        </ul>
      </div>

      {/* Audit History */}
      <div className={styles.section}>
        <h3 className={styles.sectionTitle}>Historie</h3>
        <div className={styles.timeline}>
          {document.history.map((evt, idx) => (
            <div key={evt.id} className={styles.timelineItem}>
              <div
                className={`${styles.timelineDot} ${
                  idx === 0 ? styles.timelineDotActive : ""
                }`}
              ></div>
              <div className={idx === 0 ? styles.timelineTitle : styles.timelineTitleRegular}>
                {evt.title}
              </div>
              <div className={styles.timelineSubtitle}>
                {evt.timestamp} • {evt.author}
              </div>
            </div>
          ))}
          {document.history.length === 0 && (
            <div style={{ fontSize: "12px", color: "var(--outline)", fontStyle: "italic" }}>
              Keine Historie vorhanden
            </div>
          )}
        </div>
      </div>

      {/* Expanded Technical Details */}
      <div style={{ borderBottom: "1px solid var(--border-standard)" }}>
        <button
          className={styles.accordionButton}
          onClick={() => setIsTechExpanded(!isTechExpanded)}
        >
          <span className={styles.sectionTitle} style={{ marginBottom: 0 }}>Erweiterte Daten</span>
          {isTechExpanded ? <ChevronUp className={styles.chevronIcon} /> : <ChevronDown className={styles.chevronIcon} />}
        </button>
        {isTechExpanded && (
          <div className={styles.accordionContent}>
            <div className={styles.techRow}>
              <span className={styles.techLabel}>OCR Status</span>
              <span className={`${styles.mono} ${styles.techValueSuccess}`}>{document.ocrStatus}</span>
            </div>
            <div className={styles.techRow}>
              <span className={styles.techLabel}>Vektorisierung</span>
              <span className={`${styles.mono} ${styles.techValueSuccess}`}>{document.vektorisierung}</span>
            </div>
            <div className={styles.techRow}>
              <span className={styles.techLabel}>Chunk Count</span>
              <span className={`${styles.mono} ${styles.techValueText}`}>{document.chunkCount}</span>
            </div>
            <div className={styles.techRow}>
              <span className={styles.techLabel}>Vector ID</span>
              <span className={`${styles.mono} ${styles.techValueMuted}`} title={document.vectorId}>
                {document.vectorId}
              </span>
            </div>
          </div>
        )}
      </div>
    </aside>
  );
};
