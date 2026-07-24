import React, { useState, useCallback, useMemo } from "react";
import { Workspace, WorkspaceSection } from "../../../components/layout";
import { DocumentListWidget } from "../../../components/workflow";
import { Panel, Badge } from "../../../components/common";
import type { DocumentItemData } from "../../../types/domain";

interface DocumentsTabProps {
  documents: DocumentItemData[];
  documentTypes: readonly string[];
  onUploadDocument: (name: string, type: string) => void;
}

type SortKey = "name" | "date";

export const DocumentsTab: React.FC<DocumentsTabProps> = React.memo(
  ({ documents, documentTypes, onUploadDocument }) => {
    const [selectedDocId, setSelectedDocId] = useState<string | null>(null);
    const [sortKey, setSortKey] = useState<SortKey>("name");

    const sorted = useMemo(() => {
      const copy = [...documents];
      copy.sort((a, b) => {
        if (sortKey === "name") {
          return (a.name ?? "").localeCompare(b.name ?? "", "de");
        }
        // sort by date descending (newest first)
        const da = a.date ?? a.uploadedAt ?? "";
        const db = b.date ?? b.uploadedAt ?? "";
        return db.localeCompare(da);
      });
      return copy;
    }, [documents, sortKey]);

    const selectedDoc = useMemo(
      () => sorted.find((d) => d.id === selectedDocId),
      [sorted, selectedDocId],
    );

    const handleRowClick = useCallback((doc: DocumentItemData) => {
      setSelectedDocId((prev) => (prev === doc.id ? null : doc.id));
      window.open(`/api/documents/${(doc as any).documentId || doc.id}/file`, "_blank");
    }, []);

    return (
      <Workspace>
        <div style={{ display: "flex", justifyContent: "flex-end", gap: "var(--space-2)", marginBottom: "var(--space-3)" }}>
          <span style={{ fontSize: "0.8rem", color: "var(--color-gray-500)", alignSelf: "center" }}>
            Sortieren:
          </span>
          <button
            type="button"
            onClick={() => setSortKey("name")}
            style={{
              padding: "4px 10px",
              fontSize: "0.8rem",
              fontWeight: sortKey === "name" ? 600 : 400,
              border: `1px solid ${sortKey === "name" ? "var(--color-blue-500)" : "var(--color-gray-300)"}`,
              borderRadius: "var(--radius-sm)",
              background: sortKey === "name" ? "var(--color-blue-50)" : "transparent",
              cursor: "pointer",
            }}
          >
            Name
          </button>
          <button
            type="button"
            onClick={() => setSortKey("date")}
            style={{
              padding: "4px 10px",
              fontSize: "0.8rem",
              fontWeight: sortKey === "date" ? 600 : 400,
              border: `1px solid ${sortKey === "date" ? "var(--color-blue-500)" : "var(--color-gray-300)"}`,
              borderRadius: "var(--radius-sm)",
              background: sortKey === "date" ? "var(--color-blue-50)" : "transparent",
              cursor: "pointer",
            }}
          >
            Datum
          </button>
        </div>

        <DocumentListWidget
          documents={sorted as any}
          documentTypes={documentTypes as any}
          onUploadDocument={onUploadDocument}
          onRowClick={handleRowClick}
        />

        {selectedDoc && (
          <WorkspaceSection title={`Versionen — ${selectedDoc.name}`}>
            <Panel>
              <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <span style={{ fontWeight: 600, fontSize: "0.85rem" }}>
                    Aktuelle Version — {selectedDoc.date}
                  </span>
                  <Badge status={selectedDoc.status === "Geprüft" ? "success" : "warning"}>
                    {selectedDoc.status}
                  </Badge>
                </div>
                <p style={{ fontSize: "0.8rem", color: "var(--color-gray-500)", margin: 0 }}>
                  Versionsverlauf wird angezeigt, sobald mehrere Versionen dieses Dokuments vorliegen.
                </p>
              </div>
            </Panel>
          </WorkspaceSection>
        )}
      </Workspace>
    );
  },
);

DocumentsTab.displayName = "DocumentsTab";
