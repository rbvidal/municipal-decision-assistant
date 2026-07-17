/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Bell, Check, User } from 'lucide-react';

interface HeaderProps {
  onShowNotification: (message: string) => void;
}

export default function Header({ onShowNotification }: HeaderProps) {
  const [showNotifications, setShowNotifications] = useState(false);
  const [unreadCount, setUnreadCount] = useState(2);

  const notificationsList = [
    { id: 1, text: 'Vorgang BAU-2026-X941 wurde genehmigt.', time: 'Vor 10 Min.' },
    { id: 2, text: 'Neue Nachricht zu Vorgang PERS-2026-P012.', time: 'Vor 1 Std.' }
  ];

  const handleBellClick = () => {
    setShowNotifications(!showNotifications);
    if (unreadCount > 0) {
      setUnreadCount(0);
      onShowNotification('Benachrichtigungen als gelesen markiert.');
    }
  };

  return (
    <header className="app-header" id="app-header">
      <div className="header-content">
        <div className="brand-section">
          <a href="#" className="brand-title">Kommunale Entscheidungsplattform</a>
          <div className="brand-divider"></div>
          <span className="brand-subtitle">Stadt Essen</span>
        </div>

        <nav className="nav-menu">
          <a href="#" className="nav-item">Startseite</a>
          <a href="#" className="nav-item nav-item-active">Meine Arbeit</a>
          <a href="#" className="nav-item">Wissen</a>
        </nav>

        <div className="user-actions">
          <div style={{ position: 'relative' }}>
            <button 
              className="icon-btn" 
              onClick={handleBellClick}
              title="Benachrichtigungen"
              style={{ position: 'relative' }}
              id="notification-bell-btn"
            >
              <Bell size={20} />
              {unreadCount > 0 && (
                <span style={{
                  position: 'absolute',
                  top: '2px',
                  right: '2px',
                  backgroundColor: 'var(--color-error)',
                  color: 'white',
                  borderRadius: '50%',
                  width: '8px',
                  height: '8px',
                  display: 'block'
                }}></span>
              )}
            </button>

            {showNotifications && (
              <div style={{
                position: 'absolute',
                top: '40px',
                right: '0',
                backgroundColor: 'white',
                border: '1px solid var(--color-standard)',
                borderRadius: '4px',
                boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                width: '280px',
                zIndex: 200,
                padding: '12px'
              }} id="notification-dropdown">
                <h4 style={{ fontSize: '13px', fontWeight: 600, marginBottom: '8px', display: 'flex', justifyContent: 'space-between' }}>
                  <span>Benachrichtigungen</span>
                  <span style={{ fontSize: '11px', color: 'var(--color-status-success)', fontWeight: 'normal' }}>Aktuell</span>
                </h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {notificationsList.map(item => (
                    <div key={item.id} style={{ fontSize: '12px', borderBottom: '1px solid var(--color-surface-container-low)', paddingBottom: '6px' }}>
                      <p style={{ color: 'var(--color-on-surface)' }}>{item.text}</p>
                      <span style={{ color: 'var(--color-text-secondary)', fontSize: '10px' }}>{item.time}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div 
            className="user-avatar" 
            title="Profil: J. Schmidt"
            onClick={() => onShowNotification('Benutzerprofil von J. Schmidt geladen.')}
            id="user-avatar-btn"
          >
            JS
          </div>
        </div>
      </div>
    </header>
  );
}
