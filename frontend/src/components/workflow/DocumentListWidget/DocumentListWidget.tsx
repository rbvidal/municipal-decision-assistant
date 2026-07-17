import React, { useState, useCallback } from "react";
import { Panel } from "../../common/Panel";
import { Button } from "../../common/Button";
import { Icon } from "../../common/Icon";
import { Badge } from "../../common/Badge";
import { DataTable, type DataTableColumn } from "../../data/DataTable";
import styles from "./DocumentListWidget.module.css";

interface DocumentItem {
  id: string;
  name: string;
  type: string;
  date: string;
  status: "Geprüft" | "Offen" | "Fehlend";
}

interface DocumentListWidgetProps {
  title?: string;
  documents: DocumentItem[];
  documentTypes: readonly string[];
  onUploadDocument: (name: string, type: string) => void;
  className?: string;
}

export const DocumentListWidget: React.FC<DocumentListWidgetProps> = React.memo(
  ({
    title = "Eingereichte Unterlagen",
    documents,
    documentTypes,
    onUploadDocument,
    className,
  }) => {
    const [showUpload, setShowUpload] = useState(false);
    const [docName, setDocName] = useState("");
    const [docType, setDocType] = useState(documentTypes[0]);

    const handleUpload = useCallback(() => {
      if (docName.trim()) {
        onUploadDocument(docName.trim(), docType);
        setDocName("");
        setShowUpload(false);
      }
    }, [docName, docType, onUploadDocument]);

    const columns: DataTableColumn<DocumentItem>[] = [
      {
        key: "name",
        header: "Dokumentenname",
        render: (doc) => (
          <span className={styles.docName}>
            <Icon name="file-text" size={14} />
            {doc.name}
          </span>
        ),
      },
      {
        key: "type",
        header: "Typ",
        render: (doc) => <span className={styles.cell}>{doc.type}</span>,
      },
      {
        key: "date",
        header: "Datum",
        render: (doc) => <span className={styles.monoCell}>{doc.date}</span>,
      },
      {
        key: "status",
        header: "Status",
        render: (doc) => (
          <Badge status={doc.status === "Geprüft" ? "success" : "warning"} variant="pill">
            {doc.status}
          </Badge>
        ),
      },
    ];

    const headerAction = (
      <Button variant="primary" size="sm" onClick={() => setShowUpload((v) => !v)}>
        <Icon name="upload" size={14} />
        Hochladen
      </Button>
    );

    return (
      <Panel
        title={title}
        icon={<Icon name="folder" size={16} />}
        headerAction={headerAction}
        className={className}
      >
        {showUpload && (
          <div className={styles.uploadForm}>
            <input
              type="text"
              className={styles.input}
              placeholder="Dokumentenname (z.B. Brandschutznachweis)..."
              value={docName}
              onChange={(e) => setDocName(e.target.value)}
              aria-label="Dokumentenname"
            />
            <select
              className={styles.select}
              value={docType}
              onChange={(e) => setDocType(e.target.value)}
              aria-label="Dokumententyp"
            >
              {documentTypes.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
            <Button variant="primary" size="sm" onClick={handleUpload}>
              Hochladen bestätigen
            </Button>
          </div>
        )}

        <DataTable
          columns={columns}
          data={documents}
          keyField="id"
          emptyState="Keine Dokumente vorhanden"
        />
      </Panel>
    );
  },
);

DocumentListWidget.displayName = "DocumentListWidget";
