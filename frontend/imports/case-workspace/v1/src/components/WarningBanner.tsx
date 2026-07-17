import React from 'react';
import { AlertCircle } from 'lucide-react';

interface WarningBannerProps {
  onRequest?: () => void;
}

export const WarningBanner: React.FC<WarningBannerProps> = ({ onRequest }) => {
  return (
    <div className="warning-banner" id="warning-missing-info-banner">
      <div className="warning-icon" id="warning-banner-icon">
        <AlertCircle size={24} fill="var(--color-error)" stroke="white" />
      </div>
      <div className="warning-body">
        <p className="warning-title">Fehlende Informationen festgestellt</p>
        <p className="warning-desc">
          Ein Brandschutznachweis wurde für dieses Vorhaben noch nicht eingereicht.
        </p>
      </div>
      <button 
        className="warning-btn" 
        onClick={onRequest}
        id="warning-action-anfordern"
      >
        Anfordern
      </button>
    </div>
  );
};
