import React from "react";
import { Workspace } from "../../../components/layout";
import { DocumentListWidget } from "../../../components/workflow";
import type { DocumentItemData } from "../../../mocks/case-workspace";

interface DocumentsTabProps {
  documents: DocumentItemData[];
  documentTypes: readonly string[];
  onUploadDocument: (name: string, type: string) => void;
}

export const DocumentsTab: React.FC<DocumentsTabProps> = React.memo(
  ({ documents, documentTypes, onUploadDocument }) => (
    <Workspace>
      <DocumentListWidget
        documents={documents}
        documentTypes={documentTypes}
        onUploadDocument={onUploadDocument}
      />
    </Workspace>
  ),
);

DocumentsTab.displayName = "DocumentsTab";
