import React from 'react';
import { 
  AlertCircle, 
  Shield, 
  Hourglass, 
  Calendar, 
  FileText, 
  StickyNote, 
  CheckSquare, 
  History 
} from 'lucide-react';

interface MetadataSidebarProps {
  documentCount: number;
  noteCount: number;
  checklistProgress: number;
  onNavigateToSection?: (sectionId: string) => void;
}

export const MetadataSidebar: React.FC<MetadataSidebarProps> = ({
  documentCount,
  noteCount,
  checklistProgress,
  onNavigateToSection
}) => {
  return (
    <aside className="left-sidebar" id="case-metadata-sidebar">
      {/* Upper info panel */}
      <div className="sidebar-section-padding sidebar-border-bottom" id="sidebar-meta-panel">
        <div>
          <h2 className="sidebar-case-title">Vorgang BAU-2026-0147</h2>
          <p className="sidebar-case-subtitle">Bauantrag Carport</p>
        </div>

        <div className="metadata-list" id="sidebar-meta-list">
          <div className="metadata-row">
            <span className="metadata-label">Antragsteller:</span>
            <span className="metadata-val-bold">Thomas Becker</span>
          </div>
          <div className="metadata-row">
            <span className="metadata-label">Abteilung:</span>
            <span>Bauamt</span>
          </div>
          <div className="metadata-row">
            <span className="metadata-label">Bearbeiter:</span>
            <span className="metadata-val-primary">Sabine Müller</span>
          </div>
        </div>

        {/* Action/State indicators */}
        <div className="status-pills-stack" id="sidebar-status-pills">
          <div className="status-pill pill-error-bg" id="status-pill-priority">
            <AlertCircle size={15} className="pill-red" />
            <span>Priorität: <span className="pill-red">Hoch</span></span>
          </div>
          
          <div className="status-pill" id="status-pill-risk">
            <Shield size={15} className="pill-green" />
            <span>Risiko: <span className="pill-green">Gering</span></span>
          </div>
          
          <div className="status-pill pill-blue" id="status-pill-status">
            <Hourglass size={15} />
            <span>Status: <span>Prüfung</span></span>
          </div>
          
          <div className="status-pill pill-error-bg" id="status-pill-duedate">
            <Calendar size={15} className="pill-red" />
            <span>Fällig: <span className="pill-red font-bold">Heute</span></span>
          </div>
        </div>
      </div>

      {/* Sidebar navigation links */}
      <div className="left-sidebar-navigation" id="sidebar-nav-container">
        <button 
          className="sidebar-nav-button" 
          onClick={() => onNavigateToSection?.('documents')}
          id="sidebar-nav-docs"
        >
          <span className="sidebar-nav-left">
            <span className="sidebar-nav-icon"><FileText size={16} /></span>
            <span>Dokumente</span>
          </span>
          <span className="sidebar-count-label">({documentCount})</span>
        </button>

        <button 
          className="sidebar-nav-button" 
          onClick={() => onNavigateToSection?.('notes')}
          id="sidebar-nav-notes"
        >
          <span className="sidebar-nav-left">
            <span className="sidebar-nav-icon"><StickyNote size={16} /></span>
            <span>Interne Notizen</span>
          </span>
          <span className="sidebar-count-label">({noteCount})</span>
        </button>

        <div className="sidebar-progress-container" id="sidebar-checklist-progress">
          <div className="sidebar-progress-header">
            <span className="sidebar-nav-left" style={{ fontSize: '12px', fontWeight: 600 }}>
              <span className="sidebar-nav-icon"><CheckSquare size={16} /></span>
              <span>Checkliste</span>
            </span>
            <span className="metadata-val-primary" style={{ fontSize: '12px' }}>
              {checklistProgress}%
            </span>
          </div>
          <div className="sidebar-progress-bar-bg">
            <div 
              className="sidebar-progress-bar-fill" 
              style={{ width: `${checklistProgress}%` }}
              id="sidebar-progress-bar-indicator"
            ></div>
          </div>
        </div>

        <button 
          className="sidebar-nav-button" 
          style={{ marginTop: '8px' }}
          onClick={() => onNavigateToSection?.('timeline')}
          id="sidebar-nav-activity"
        >
          <span className="sidebar-nav-left">
            <span className="sidebar-nav-icon"><History size={16} /></span>
            <span>Aktivität</span>
          </span>
          <span className="italic-indicator">vor 2 Std.</span>
        </button>
      </div>
    </aside>
  );
};
