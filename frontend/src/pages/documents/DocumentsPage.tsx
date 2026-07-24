import React, { useState, useCallback, useMemo, useRef, useEffect } from "react";
import { AppShell } from "../../layouts/AppShell";
import { AppTopNavigation, TabBar, type NavModule, type TabItem } from "../../components/navigation";
import { SearchBar, FilterPanel } from "../../components/search";
import { DataTable, type DataTableColumn } from "../../components/data";
import { DocumentVersionHistory } from "../../components/documents";
import { Badge, Icon, PropertyGrid, ActionToolbar, Button } from "../../components/common";
import { documentService } from "../../services/serviceFactory";
import type { DocumentItem } from "../../types/domain";

const DOCUMENT_CATEGORIES: { key: string; label: string; count: number }[] = [
  { key: "vorgangsdokumente", label: "Vorgangsdokumente", count: 0 },
  { key: "vorlagen", label: "Vorlagen", count: 0 },
  { key: "bescheide", label: "Bescheide", count: 0 },
  { key: "rechtsgrundlagen", label: "Rechtsgrundlagen", count: 0 },
];
const toDocStatus = (s: string): "success" | "warning" | "error" | "neutral" | "info" => {
  if (s === "Bereit" || s === "Aktiv") return "success";
  if (s === "In_Bearbeitung" || s === "In Prüfung") return "warning";
  if (s === "Fehler" || s === "Fehlend") return "error";
  if (s === "Archiviert") return "neutral";
  return "info";
};
import styles from "./DocumentsPage.module.css";

const NAV_MODULES: NavModule[] = [
  { id: "home", label: "Startseite", href: "/home" },
  { id: "work", label: "Meine Arbeit", href: "/work" },
  { id: "knowledge", label: "Wissen", href: "/knowledge" },
  { id: "documents", label: "Dokumente", href: "/documents", active: true },
  { id: "admin", label: "Verwaltung", href: "/admin" },
];

const SUB_TABS: TabItem[] = [
  { id: "all", label: "Alle Dokumente" },
  { id: "upload", label: "Hochladen" },
  { id: "index_status", label: "Index-Status" },
];

const TYPE_OPTIONS = [
  "Alle Dokumenttypen",
  "Antrag",
  "Lageplan",
  "Nachweis",
  "Beilage",
  "Vorlage",
  "Formular",
  "Sonstiges",
];

const STATUS_OPTIONS = ["Status: Alle", "Aktiv", "In Prüfung", "Fehlend", "Archiviert"];

const FILTER_GROUPS = [
  {
    id: "category",
    label: "Kategorien",
    options: DOCUMENT_CATEGORIES.map((c) => ({
      value: c.key,
      label: c.label,
      count: c.count,
    })),
  },
];

export const DocumentsPage: React.FC = React.memo(() => {
  const [subTab, setSubTab] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState("Alle Dokumenttypen");
  const [statusFilter, setStatusFilter] = useState("Status: Alle");
  const [activeCategory, setActiveCategory] = useState("vorgangsdokumente");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [fullText, setFullText] = useState<string | null>(null);
  const [fullTextLoading, setFullTextLoading] = useState(false);

  // Upload state
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [uploadTitle, setUploadTitle] = useState("");
  const [uploadProgress, setUploadProgress] = useState<number | null>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [uploadSuccess, setUploadSuccess] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Document list from API
  const [documents, setDocuments] = useState<DocumentItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);

  const loadDocuments = useCallback(async () => {
    setIsLoading(true);
    setLoadError(null);
    try {
      const data = await documentService.getAll();
      // Backend returns {documents:[...], page, size, totalElements, totalPages}
      const list = Array.isArray(data) ? data : (data as any).documents ?? [];
      setDocuments(list);
    } catch (err) {
      setLoadError((err as Error).message ?? "Fehler beim Laden der Dokumente");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadDocuments();
  }, [loadDocuments]);

  useEffect(() => {
    if (!selectedId) { setFullText(null); return; }
    let cancelled = false;
    setFullTextLoading(true);
    setFullText(null);
    documentService.getContent(selectedId)
      .then((data) => { if (!cancelled) setFullText(data.text); })
      .catch(() => { if (!cancelled) setFullText(null); })
      .finally(() => { if (!cancelled) setFullTextLoading(false); });
    return () => { cancelled = true; };
  }, [selectedId]);

  const handleUpload = useCallback(async () => {
    if (!uploadFile) return;
    setIsUploading(true);
    setUploadError(null);
    setUploadSuccess(null);
    setUploadProgress(0);
    try {
      const title = uploadTitle.trim() || undefined;
      const result = await documentService.upload(uploadFile, title, setUploadProgress);
      setUploadSuccess(`"${result.title}" hochgeladen (${result.status})`);
      setUploadFile(null);
      setUploadTitle("");
      if (fileInputRef.current) fileInputRef.current.value = "";
      loadDocuments();
    } catch (err) {
      setUploadError((err as Error).message ?? "Upload fehlgeschlagen");
    } finally {
      setIsUploading(false);
    }
  }, [uploadFile, uploadTitle, loadDocuments]);

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] ?? null;
    setUploadFile(file);
    setUploadError(null);
    setUploadSuccess(null);
    setUploadProgress(null);
  }, []);

  const filteredDocuments = useMemo(() => {
    const query = searchQuery.toLowerCase().trim();
    return documents.filter((doc) => {
      if (typeFilter !== "Alle Dokumenttypen" && doc.typ !== typeFilter) return false;
      if (statusFilter !== "Status: Alle" && doc.status !== statusFilter) return false;
      if (query) {
        return (
          (doc.name ?? "").toLowerCase().includes(query) ||
          (doc.vorgangId ?? "").toLowerCase().includes(query) ||
          (doc.buerger ?? "").toLowerCase().includes(query) ||
          (doc.typ ?? "").toLowerCase().includes(query)
        );
      }
      return true;
    });
  }, [documents, searchQuery, typeFilter, statusFilter]);

  const selectedDoc = useMemo(
    () => documents.find((d) => d.id === selectedId) ?? null,
    [documents, selectedId],
  );

  const handleSelectionChange = useCallback((ids: Set<string>) => {
    setSelectedIds(ids);
  }, []);

  const columns: DataTableColumn<DocumentItem>[] = useMemo(
    () => [
      {
        key: "name",
        header: "Dokument",
        render: (doc) => (
          <span
            className={styles.docName}
            onClick={() => setSelectedId(doc.id)}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === "Enter") setSelectedId(doc.id);
            }}
          >
            <Icon name={doc.name.endsWith(".pdf") ? "file-text" : "image"} size={14} />
            {doc.name}
          </span>
        ),
      },
      {
        key: "vorgangId",
        header: "Vorgang",
        render: (doc) => <span className={styles.monoCell}>{doc.vorgangId ?? "-"}</span>,
      },
      {
        key: "buerger",
        header: "Bürger",
        render: (doc) => <span className={styles.monoCell}>{doc.buerger ?? "-"}</span>,
      },
      {
        key: "typ",
        header: "Typ",
        render: (doc) => <span className={styles.monoCell}>{doc.typ}</span>,
      },
      {
        key: "version",
        header: "Vers.",
        render: (doc) => <span className={styles.monoCell}>{doc.version}</span>,
      },
      {
        key: "status",
        header: "Status",
        render: (doc) => (
          <Badge status={toDocStatus(doc.status)} variant="pill">
            {doc.status}
          </Badge>
        ),
      },
      {
        key: "geaendert",
        header: "Geändert",
        render: (doc) => <span className={styles.monoCell}>{doc.geaendert}</span>,
      },
    ],
    [],
  );

  const bulkCount = selectedIds.size;

  return (
    <AppShell
      topNavigation={
        <AppTopNavigation modules={NAV_MODULES} activeModule="documents" />
      }
    >
      <div className={styles.page}>
        <div className={styles.subNav}>
          <TabBar tabs={SUB_TABS} activeTab={subTab} onTabChange={setSubTab} />
        </div>

        {subTab === "upload" && (
          <div className={styles.uploadSection}>
            <h2 className={styles.uploadTitle}>Dokument hochladen</h2>
            <div className={styles.uploadForm}>
              <input
                ref={fileInputRef}
                type="file"
                accept=".pdf,.docx,.txt,.html,.htm"
                onChange={handleFileSelect}
                className={styles.uploadFileInput}
                aria-label="Datei auswählen"
              />
              <input
                type="text"
                value={uploadTitle}
                onChange={(e) => setUploadTitle(e.target.value)}
                placeholder="Titel (optional — Dateiname wird verwendet)"
                className={styles.uploadTitleInput}
                aria-label="Dokumenttitel"
              />
              <Button
                onClick={handleUpload}
                disabled={!uploadFile || isUploading}
                variant="primary"
              >
                {isUploading ? "Lädt..." : "Hochladen"}
              </Button>
            </div>
            {uploadProgress != null && isUploading && (
              <div className={styles.uploadProgress}>
                <div
                  className={styles.uploadProgressBar}
                  style={{ width: `${uploadProgress}%` }}
                />
                <span className={styles.uploadProgressText}>{uploadProgress}%</span>
              </div>
            )}
            {uploadSuccess && (
              <div className={styles.uploadSuccess} role="status">
                {uploadSuccess}
              </div>
            )}
            {uploadError && (
              <div className={styles.uploadError} role="alert">
                {uploadError}
              </div>
            )}
          </div>
        )}

        <div className={styles.toolbarRow}>
          <div className={styles.searchWrap}>
            <SearchBar
              value={searchQuery}
              onChange={setSearchQuery}
              placeholder="Dokumente durchsuchen..."
            />
          </div>
          <div className={styles.filterRow}>
            <select
              className={styles.filterSelect}
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              aria-label="Dokumenttyp filtern"
            >
              {TYPE_OPTIONS.map((o) => (
                <option key={o} value={o}>
                  {o}
                </option>
              ))}
            </select>
            <select
              className={styles.filterSelect}
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              aria-label="Status filtern"
            >
              {STATUS_OPTIONS.map((o) => (
                <option key={o} value={o}>
                  {o}
                </option>
              ))}
            </select>
          </div>
          <ActionToolbar
            actions={[
              {
                id: "upload",
                label: "Hochladen",
                onClick: () => setSubTab("upload"),
                variant: "primary",
              },
              {
                id: "refresh",
                label: "Aktualisieren",
                onClick: loadDocuments,
                variant: "secondary",
              },
            ]}
          />
        </div>

        {loadError && (
          <div className={styles.uploadError} role="alert">
            {loadError}
          </div>
        )}

        {bulkCount > 0 && (
          <div className={styles.bulkBar}>
            <span className={styles.bulkCount}>{bulkCount} ausgewählt</span>
            <ActionToolbar
              actions={[
                { id: "compare", label: "Vergleichen", onClick: () => window.alert("Vergleichsfunktion in Entwicklung."), variant: "secondary" },
                { id: "export", label: "Exportieren", onClick: () => window.print(), variant: "secondary" },
                { id: "archive", label: "Archivieren", onClick: () => window.alert("Archivierungsfunktion in Entwicklung."), variant: "secondary" },
              ]}
            />
          </div>
        )}

        <div
          className={`${styles.layout} ${selectedDoc ? styles.layoutThreeCol : styles.layoutTwoCol}`}
        >
          <div className={styles.filterCol}>
            <FilterPanel
              groups={FILTER_GROUPS}
              activeFilters={{ category: activeCategory }}
              onFilterChange={(_, value) => setActiveCategory(value)}
            />
          </div>

          <div className={styles.tableCol}>
            {isLoading ? (
              <p className={styles.loadingText}>Dokumente werden geladen...</p>
            ) : (
              <DataTable
                columns={columns}
                data={filteredDocuments}
                keyField="id"
                emptyState="Keine Dokumente gefunden"
                selectable
                selectedIds={selectedIds}
                onSelectionChange={handleSelectionChange}
                onRowClick={(doc) => setSelectedId(doc.id)}
              />
            )}
          </div>

          {selectedDoc && (
            <div className={styles.previewCol}>
              <div className={styles.previewHeader}>
                <span className={styles.previewCaption}>Vorschau</span>
                <h2 className={styles.previewTitle}>{selectedDoc.name}</h2>
                <div className={styles.previewActions}>
                  <Badge status={toDocStatus(selectedDoc.status)} variant="pill">
                    {selectedDoc.status ?? "-"}
                  </Badge>
                  <button
                    type="button"
                    className={styles.previewActionBtn}
                    aria-label="Herunterladen"
                    onClick={() => window.print()}
                  >
                    <Icon name="download" size={16} />
                  </button>
                  <button type="button" className={styles.previewActionBtn} aria-label="Drucken" onClick={() => window.print()}>
                    <Icon name="printer" size={16} />
                  </button>
                  <button
                    type="button"
                    className={styles.previewActionBtn}
                    onClick={() => setSelectedId(null)}
                    aria-label="Vorschau schließen"
                  >
                    <Icon name="x" size={16} />
                  </button>
                </div>
              </div>

              <div className={styles.previewContent}>
                <div className={styles.previewSection}>
                  <h3 className={styles.previewSectionTitle}>Metadaten</h3>
                  <PropertyGrid
                    items={[
                      { label: "Dokumenten-ID", value: selectedDoc.dokumentId ?? "-", valueMono: true },
                      { label: "Typ", value: selectedDoc.detailedTyp ?? "-" },
                      { label: "Dateigröße", value: selectedDoc.dateigroesse ?? "-" },
                      { label: "Hochgeladen", value: selectedDoc.hochgeladenAm ?? "-" },
                    ]}
                  />
                </div>

                {(fullText || fullTextLoading) && (
                  <div className={styles.previewSection}>
                    <h3 className={styles.previewSectionTitle}>Volltext</h3>
                    {fullTextLoading ? (
                      <p style={{ color: "var(--color-gray-400)", fontSize: "0.85rem" }}>Lade Volltext...</p>
                    ) : fullText ? (
                      <p style={{ fontSize: "0.85rem", lineHeight: 1.6, whiteSpace: "pre-wrap", color: "var(--color-gray-800)", maxHeight: 400, overflowY: "auto" }}>
                        {fullText.length > 2000 ? fullText.substring(0, 2000) + "..." : fullText}
                      </p>
                    ) : null}
                  </div>
                )}

                <div className={styles.previewSection}>
                  <h3 className={styles.previewSectionTitle}>Vorgangskontext</h3>
                  <div className={styles.contextCard}>
                    <div className={styles.contextCardLeft}>
                      <span className={styles.contextCardLabel}>Vorgang</span>
                      <span className={styles.contextCardValue}>{selectedDoc.vorgangId}</span>
                    </div>
                    <Icon name="chevron-right" size={14} />
                  </div>
                  <div className={styles.contextCard}>
                    <div className={styles.contextCardLeft}>
                      <span className={styles.contextCardLabel}>Bürger</span>
                      <span className={styles.contextCardValue}>{selectedDoc.buerger}</span>
                    </div>
                    <Icon name="chevron-right" size={14} />
                  </div>
                </div>

                <div className={styles.previewSection}>
                  <h3 className={styles.previewSectionTitle}>Versionen</h3>
                  <DocumentVersionHistory versions={selectedDoc.versions ?? []} />
                </div>

                {(selectedDoc.references ?? []).length > 0 && (
                  <div className={styles.previewSection}>
                    <h3 className={styles.previewSectionTitle}>Referenzen & Rechtsgrundlagen</h3>
                    {(selectedDoc.references ?? []).map((ref) => (
                      <div key={ref.id} className={styles.referenceItem}>
                        <Icon name={ref.type === "gavel" ? "scale" : "file-text"} size={14} />
                        <span>{ref.title}</span>
                      </div>
                    ))}
                  </div>
                )}

                {(selectedDoc.history ?? []).length > 0 && (
                  <div className={styles.previewSection}>
                    <h3 className={styles.previewSectionTitle}>Historie</h3>
                    {(selectedDoc.history ?? []).map((event) => (
                      <div key={event.id} className={styles.referenceItem}>
                        <Icon
                          name={
                            event.status === "completed"
                              ? "check-circle"
                              : event.status === "info"
                                ? "info"
                                : "settings"
                          }
                          size={14}
                        />
                        <div>
                          <div className={styles.historyTitle}>{event.title}</div>
                          <div className={styles.historyMeta}>
                            {event.timestamp} · {event.author}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </AppShell>
  );
});

DocumentsPage.displayName = "DocumentsPage";
