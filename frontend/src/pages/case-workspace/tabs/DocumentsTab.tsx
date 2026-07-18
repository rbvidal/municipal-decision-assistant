import React, { useState, useCallback, useMemo } from "react";
import { Workspace, WorkspaceSection } from "../../../components/layout";
import { DocumentListWidget } from "../../../components/workflow";
import { Panel, Badge } from "../../../components/common";
import type { DocumentItemData } from "../../../mocks/case-workspace";

interface DocumentsTabProps {
  documents: DocumentItemData[];
  documentTypes: readonly string[];
  onUploadDocument: (name: string, type: string) => void;
}

export const DocumentsTab: React.FC<DocumentsTabProps> = React.memo(
  ({ documents, documentTypes, onUploadDocument }) => {
    const [selectedDocId, setSelectedDocId] = useState<string | null>(null);

    const selectedDoc = useMemo(
      () => documents.find((d) => d.id === selectedDocId),
      [documents, selectedDocId],
    );

    const handleRowClick = useCallback((doc: DocumentItemData) => {
      setSelectedDocId((prev) => (prev === doc.id ? null : doc.id));
    }, []);

    return (
      <Workspace>
        <DocumentListWidget
          documents={documents}
          documentTypes={documentTypes}
          onUploadDocument={onUploadDocument}
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
