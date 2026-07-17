import React, { useRef, useState } from 'react';
import { FileText, MoreVertical, Upload } from 'lucide-react';
import { DocumentItem } from '../types';

interface DocumentsCardProps {
  documents: DocumentItem[];
  onUploadDocument?: (name: string, type: string) => void;
}

export const DocumentsCard: React.FC<DocumentsCardProps> = ({
  documents,
  onUploadDocument,
}) => {
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [docName, setDocName] = useState('');
  const [docType, setDocType] = useState('Planzeichnung');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleUploadSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (docName.trim() && onUploadDocument) {
      const fileName = docName.toLowerCase().endsWith('.pdf') ? docName : `${docName}.pdf`;
      onUploadDocument(fileName, docType);
      setDocName('');
      setShowUploadModal(false);
    }
  };

  return (
    <div className="workspace-card" id="documents-workspace-card">
      <div className="card-header" id="documents-card-header">
        <h3 className="card-title">Eingereichte Unterlagen</h3>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <span className="card-header-meta">{documents.length} Dokumente</span>
          {onUploadDocument && (
            <button
              className="card-action-link"
              onClick={() => setShowUploadModal(!showUploadModal)}
              style={{ display: 'flex', alignItems: 'center', gap: '4px' }}
              id="documents-upload-trigger"
            >
              <Upload size={14} /> Hochladen
            </button>
          )}
        </div>
      </div>

      {showUploadModal && (
        <form onSubmit={handleUploadSubmit} style={{ padding: '16px', borderBottom: '1px solid var(--color-border-default)' }} id="upload-doc-form">
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <input
              type="text"
              placeholder="Dokumentenname (z.B. Brandschutznachweis)..."
              className="question-input"
              value={docName}
              onChange={(e) => setDocName(e.target.value)}
              required
              id="upload-doc-name-input"
            />
            <select
              className="question-input"
              value={docType}
              onChange={(e) => setDocType(e.target.value)}
              style={{ backgroundColor: 'var(--color-surface-container-lowest)' }}
              id="upload-doc-type-select"
            >
              <option value="Planzeichnung">Planzeichnung</option>
              <option value="Lageplan">Lageplan</option>
              <option value="Brandschutznachweis">Brandschutznachweis</option>
              <option value="Nachbarschaftszustimmung">Nachbarschaftszustimmung</option>
              <option value="Sonstiges">Sonstiges</option>
            </select>
            <button type="submit" className="btn btn-primary" style={{ alignSelf: 'flex-start', padding: '4px 12px' }} id="upload-doc-submit-btn">
              Hochladen bestätigen
            </button>
          </div>
        </form>
      )}

      <table className="documents-table" id="documents-table">
        <thead>
          <tr>
            <th>Dokumentenname</th>
            <th>Typ</th>
            <th>Datum</th>
            <th>Status</th>
            <th style={{ textAlign: 'right' }}>Aktion</th>
          </tr>
        </thead>
        <tbody>
          {documents.map((doc) => (
            <tr key={doc.id} id={`document-row-${doc.id}`}>
              <td>
                <div className="doc-name-cell">
                  <span className="doc-icon"><FileText size={16} /></span>
                  <span>{doc.name}</span>
                </div>
              </td>
              <td>{doc.type}</td>
              <td className="font-mono-val">{doc.date}</td>
              <td>
                <span className={`doc-badge checked`}>
                  {doc.status}
                </span>
              </td>
              <td style={{ textAlign: 'right' }}>
                <button className="doc-action-btn" title="Mehr Optionen">
                  <MoreVertical size={16} />
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};
