import React, { useState, useMemo } from "react";
import {
  Plus,
  GitCompare,
  Download,
  Package,
  Search,
  SlidersHorizontal,
  FileText,
  Image as ImageIcon,
  MoreVertical,
} from "lucide-react";
import { Document, DocumentStatus } from "../types";
import styles from "./DocumentTable.module.css";

interface DocumentTableProps {
  documents: Document[];
  selectedDocumentId: string;
  onSelectDocument: (docId: string) => void;
  onUploadClick?: () => void;
  onNewDocClick?: () => void;
}

export const DocumentTable: React.FC<DocumentTableProps> = ({
  documents,
  selectedDocumentId,
  onSelectDocument,
  onUploadClick,
  onNewDocClick,
}) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [typeFilter, setTypeFilter] = useState("Alle Dokumenttypen");
  const [statusFilter, setStatusFilter] = useState("Status: Alle");
  
  // Track checkmarks
  const [checkedIds, setCheckedIds] = useState<Record<string, boolean>>({
    "doc-1": true, // Pre-select first document checkbox like the image
  });

  const handleCheckboxChange = (id: string, e: React.MouseEvent) => {
    e.stopPropagation(); // Don't trigger row selection when clicking checkbox
    setCheckedIds((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  const handleSelectAll = () => {
    const allChecked = filteredDocuments.every((doc) => checkedIds[doc.id]);
    const nextChecked: Record<string, boolean> = { ...checkedIds };
    filteredDocuments.forEach((doc) => {
      nextChecked[doc.id] = !allChecked;
    });
    setCheckedIds(nextChecked);
  };

  const filteredDocuments = useMemo(() => {
    return documents.filter((doc) => {
      // Search
      const matchesSearch =
        doc.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        doc.buerger.toLowerCase().includes(searchTerm.toLowerCase()) ||
        doc.vorgangId.toLowerCase().includes(searchTerm.toLowerCase());

      // Type Filter
      const matchesType =
        typeFilter === "Alle Dokumenttypen" || doc.typ === typeFilter;

      // Status Filter
      const matchesStatus =
        statusFilter === "Status: Alle" ||
        (statusFilter === "Aktiv" && doc.status === DocumentStatus.Aktiv) ||
        (statusFilter === "In Prüfung" && doc.status === DocumentStatus.InPruefung) ||
        (statusFilter === "Fehlend" && doc.status === DocumentStatus.Fehlend) ||
        (statusFilter === "Archiviert" && doc.status === DocumentStatus.Archiviert);

      return matchesSearch && matchesType && matchesStatus;
    });
  }, [documents, searchTerm, typeFilter, statusFilter]);

  const getStatusClass = (status: DocumentStatus) => {
    switch (status) {
      case DocumentStatus.Aktiv:
        return styles.statusAktiv;
      case DocumentStatus.InPruefung:
        return styles.statusInPruefung;
      case DocumentStatus.Fehlend:
        return styles.statusFehlend;
      case DocumentStatus.Archiviert:
        return styles.statusArchiviert;
      default:
        return "";
    }
  };

  return (
    <section className={styles.container}>
      {/* Toolbar */}
      <div className={styles.toolbar}>
        <div className={styles.buttonGroup}>
          <button className={styles.primaryButton} onClick={onUploadClick}>
            <Plus size={18} />
            Hochladen
          </button>
          <button className={styles.secondaryButton} onClick={onNewDocClick}>
            Neues Dokument
          </button>
        </div>
        <div className={styles.iconButtonGroup}>
          <button className={styles.iconButton} title="Version vergleichen">
            <GitCompare size={20} />
          </button>
          <button className={styles.iconButton} title="Export">
            <Download size={20} />
          </button>
          <button className={styles.iconButton} title="Massenvorgänge">
            <Package size={20} />
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className={styles.filtersBar}>
        <div className={styles.searchWrapper}>
          <Search size={18} className={styles.searchIcon} />
          <input
            type="text"
            className={styles.searchInput}
            placeholder="Dokumente durchsuchen..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <select
          className={styles.selectInput}
          value={typeFilter}
          onChange={(e) => setTypeFilter(e.target.value)}
        >
          <option value="Alle Dokumenttypen">Alle Dokumenttypen</option>
          <option value="Antrag">Antrag</option>
          <option value="Lageplan">Lageplan</option>
          <option value="Nachweis">Nachweis</option>
          <option value="Beilage">Beilage</option>
        </select>
        <select
          className={styles.selectInput}
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
        >
          <option value="Status: Alle">Status: Alle</option>
          <option value="Aktiv">Aktiv</option>
          <option value="In Prüfung">In Prüfung</option>
          <option value="Fehlend">Fehlend</option>
          <option value="Archiviert">Archiviert</option>
        </select>
        <button className={styles.iconButton} title="Filterliste">
          <SlidersHorizontal size={18} />
        </button>
      </div>

      {/* Table */}
      <div className={`${styles.tableContainer} custom-scrollbar`}>
        <table className={styles.table}>
          <thead>
            <tr className={styles.theadRow}>
              <th className={`${styles.th} ${styles.checkboxTh}`}>
                <input
                  type="checkbox"
                  className={styles.checkboxInput}
                  checked={
                    filteredDocuments.length > 0 &&
                    filteredDocuments.every((doc) => checkedIds[doc.id])
                  }
                  onChange={handleSelectAll}
                />
              </th>
              <th className={styles.th}>Dokument</th>
              <th className={styles.th}>Vorgang</th>
              <th className={styles.th}>Bürger</th>
              <th className={styles.th}>Typ</th>
              <th className={styles.th}>Vers.</th>
              <th className={styles.th}>Status</th>
              <th className={styles.th}>Geändert</th>
              <th className={`${styles.th} ${styles.checkboxTh}`}></th>
            </tr>
          </thead>
          <tbody>
            {filteredDocuments.map((doc) => {
              const isSelected = doc.id === selectedDocumentId;
              const isChecked = !!checkedIds[doc.id];
              const isPdf = doc.name.endsWith(".pdf");
              const isImage = doc.name.endsWith(".png") || doc.name.endsWith(".jpg") || doc.name.endsWith(".jpeg");

              return (
                <tr
                  key={doc.id}
                  className={`${styles.tr} ${isSelected ? styles.trSelected : ""}`}
                  onClick={() => onSelectDocument(doc.id)}
                >
                  <td className={styles.td}>
                    <input
                      type="checkbox"
                      className={styles.checkboxInput}
                      checked={isChecked}
                      onChange={(e) => handleCheckboxChange(doc.id, e as any)}
                    />
                  </td>
                  <td className={styles.td}>
                    <div className={styles.documentCell}>
                      {isPdf ? (
                        <FileText size={18} className={`${styles.docIcon} ${styles.docIconPdf}`} />
                      ) : isImage ? (
                        <ImageIcon size={18} className={`${styles.docIcon} ${styles.docIconImage}`} />
                      ) : (
                        <FileText size={18} className={`${styles.docIcon} ${styles.docIconDefault}`} />
                      )}
                      <span className={isSelected ? styles.docName : styles.docNameRegular}>
                        {doc.name}
                      </span>
                    </div>
                  </td>
                  <td className={styles.td}>
                    <span className={styles.technicalId}>{doc.vorgangId}</span>
                  </td>
                  <td className={styles.td}>{doc.buerger}</td>
                  <td className={styles.td}>{doc.typ}</td>
                  <td className={`${styles.td} ${styles.textOutline}`}>{doc.version}</td>
                  <td className={styles.td}>
                    <span className={`${styles.statusBadge} ${getStatusClass(doc.status)}`}>
                      {doc.status}
                    </span>
                  </td>
                  <td className={`${styles.td} ${styles.textOutline}`}>{doc.geaendert}</td>
                  <td className={styles.td}>
                    <button
                      className={styles.moreButton}
                      onClick={(e) => {
                        e.stopPropagation();
                        alert(`Aktionen für ${doc.name}`);
                      }}
                    >
                      <MoreVertical size={16} />
                    </button>
                  </td>
                </tr>
              );
            })}
            {filteredDocuments.length === 0 && (
              <tr>
                <td colSpan={9} className={styles.td} style={{ textAlign: "center", padding: "32px", color: "var(--outline)" }}>
                  Keine Dokumente gefunden
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
};
