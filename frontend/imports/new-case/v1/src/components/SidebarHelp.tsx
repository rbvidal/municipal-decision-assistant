/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Info } from 'lucide-react';
import { FormState } from '../types';

interface SidebarHelpProps {
  formState: FormState;
}

export default function SidebarHelp({ formState }: SidebarHelpProps) {
  // Dynamic department text based on selection
  const getDepartmentHelpText = () => {
    switch (formState.fachbereich) {
      case 'vergabestelle':
        return {
          title: 'Fachbereich: Vergabestelle',
          content: 'Zuständig für öffentliche Ausschreibungen und Vergabeverfahren. Bitte beachten Sie die landesrechtlichen Vergaberichtlinien und Schwellenwerte.'
        };
      case 'personal':
        return {
          title: 'Fachbereich: Personal',
          content: 'Zuständig für interne Personalangelegenheiten und Verträge. Sämtliche Daten unterliegen der strengen Geheimhaltungspflicht der DSGVO.'
        };
      case 'buergeramt':
        return {
          title: 'Fachbereich: Bürgeramt',
          content: 'Zuständig für Dienstleistungen der Bürgerverwaltung. Bitte prüfen Sie, ob eine persönliche Identifizierung der antragstellenden Person vorliegt.'
        };
      case 'bauamt':
      default:
        return {
          title: 'Fachbereich: Bauamt',
          content: 'Zuständig für alle baurechtlichen Anfragen innerhalb des Stadtgebiets. Bitte stellen Sie sicher, dass Lagepläne im nächsten Schritt bereitgehalten werden.'
        };
    }
  };

  const deptHelp = getDepartmentHelpText();
  const isHighPriority = formState.priority === 'high';

  return (
    <aside className="help-sidebar" id="help-sidebar">
      <div className="sidebar-sticky-wrap">
        
        {/* Header Section */}
        <div className="sidebar-heading-section">
          <Info size={20} />
          <h2 className="sidebar-heading">Hilfe &amp; Hinweise</h2>
        </div>

        {/* List of help cards */}
        <div className="help-cards-list">
          
          {/* Card 1: Department Info */}
          <div 
            className="help-card" 
            style={{
              borderColor: formState.fachbereich ? 'var(--color-primary)' : 'var(--color-standard)',
              boxShadow: formState.fachbereich ? '0 2px 8px rgba(0, 83, 148, 0.08)' : 'none'
            }}
            id="help-card-dept"
          >
            <h3 className="help-card-title">{deptHelp.title}</h3>
            <p className="help-card-text">{deptHelp.content}</p>
          </div>

          {/* Card 2: Prioritisation Help */}
          <div 
            className="help-card"
            style={{
              borderColor: isHighPriority ? 'var(--color-status-error)' : 'var(--color-standard)',
              boxShadow: isHighPriority ? '0 2px 8px rgba(155, 44, 44, 0.08)' : 'none',
              backgroundColor: isHighPriority ? 'rgba(155, 44, 44, 0.01)' : 'var(--color-surface-container-lowest)'
            }}
            id="help-card-priority"
          >
            <h3 
              className="help-card-title"
              style={{ color: isHighPriority ? 'var(--color-status-error)' : 'var(--color-primary)' }}
            >
              Priorisierung
            </h3>
            <p className="help-card-text">
              Wählen Sie "Hoch" nur bei unmittelbarer Gefahr im Verzug oder gesetzlich festgeschriebenen Fristabläufen innerhalb von 48 Stunden.
            </p>
          </div>

          {/* Card 3: System Suggestions */}
          <div className="help-card" id="help-card-system">
            <h3 className="help-card-title">Vorschlag (System)</h3>
            <p className="help-card-text help-card-text-italic">
              Basierend auf dem Aktenzeichen schlägt das System eine Zuordnung zum "Baurechts-Team West" vor.
            </p>
          </div>

        </div>

        {/* Administrative Metadata */}
        <div className="meta-section" id="meta-section">
          <div className="meta-row">
            <span className="meta-label">Ersteller:</span>
            <span className="meta-value-bold">J. Schmidt (ID: 442)</span>
          </div>
          <div className="meta-row" style={{ marginTop: '4px' }}>
            <span className="meta-label">Sicherheitsstufe:</span>
            <span className="security-badge">Standard (L1)</span>
          </div>
        </div>

      </div>
    </aside>
  );
}
