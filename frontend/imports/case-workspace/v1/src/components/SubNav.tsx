import React, { useState } from 'react';
import { Save, Share2 } from 'lucide-react';
import { TabItem } from '../types';
import { subnavTabs } from '../mockData';

interface SubNavProps {
  onSave?: () => void;
  onShare?: () => void;
}

export const SubNav: React.FC<SubNavProps> = ({ onSave, onShare }) => {
  const [activeTab, setActiveTab] = useState<string>('offene');

  const getBadgeClass = (type?: string) => {
    switch (type) {
      case 'secondary':
        return 'badge badge-secondary';
      case 'primary':
        return 'badge badge-primary';
      case 'warning':
        return 'badge badge-warning';
      default:
        return 'badge badge-default';
    }
  };

  return (
    <div className="sub-nav-container" id="sub-navigation-section">
      {/* Breadcrumb row */}
      <div className="breadcrumb-bar" id="breadcrumb-row">
        <nav className="breadcrumbs" id="breadcrumb-navigation">
          <a href="#">Startseite</a>
          <span>›</span>
          <a href="#">Meine Arbeit</a>
          <span>›</span>
          <span className="active-crumb">Vorgang BAU-2026-0147</span>
        </nav>

        <div className="breadcrumb-actions">
          <button 
            className="btn btn-primary" 
            onClick={onSave}
            id="action-btn-speichern"
          >
            <Save size={14} /> Speichern
          </button>
          <button 
            className="btn btn-outline" 
            onClick={onShare}
            id="action-btn-teilen"
          >
            <Share2 size={14} /> Teilen
          </button>
        </div>
      </div>

      {/* Tabs row */}
      <div className="status-tabs-row" id="status-tabs-row">
        {subnavTabs.map((tab) => (
          <button
            key={tab.id}
            className={`status-tab ${activeTab === tab.id ? 'active' : ''}`}
            onClick={() => setActiveTab(tab.id)}
            id={`status-tab-${tab.id}`}
          >
            {tab.label}{' '}
            <span className={getBadgeClass(tab.type)}>
              {tab.count}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
};
