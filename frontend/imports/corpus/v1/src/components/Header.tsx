/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { AppNotification } from '../types';

interface HeaderProps {
  notifications: AppNotification[];
  onMarkAllRead: () => void;
  onClearNotification: (id: string) => void;
}

export const Header: React.FC<HeaderProps> = ({
  notifications,
  onMarkAllRead,
  onClearNotification
}) => {
  const [showNotifications, setShowNotifications] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [activeNavLink, setActiveNavLink] = useState('Verhaltung');

  const unreadCount = notifications.filter(n => n.unread).length;

  const navLinks = [
    { name: 'Startseite', href: '#' },
    { name: 'Meine Arbeit', href: '#' },
    { name: 'Wissen', href: '#' },
    { name: 'Dokumente', href: '#' },
    { name: 'Verhaltung', href: '#' }
  ];

  return (
    <header className="bg-surface border-b border-border-standard docked full-width top-0 z-50 relative">
      <div className="flex justify-between items-center w-full px-huge h-header-height max-w-max-width mx-auto">
        
        {/* Brand Logo */}
        <div className="flex items-center gap-lg">
          <span className="text-h2 font-bold text-primary tracking-tight">
            Kommunale Entscheidungsplattform
          </span>
        </div>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center space-x-xl h-full">
          {navLinks.map((link) => {
            const isActive = activeNavLink === link.name;
            return (
              <a
                key={link.name}
                href={link.href}
                onClick={(e) => {
                  e.preventDefault();
                  setActiveNavLink(link.name);
                }}
                className={`h-full flex items-center px-sm transition-all duration-150 text-body-base ${
                  isActive
                    ? 'text-primary border-b-2 border-primary font-semibold'
                    : 'text-on-surface-variant hover:bg-surface-muted'
                }`}
                id={`nav-link-${link.name.toLowerCase().replace(/\s+/g, '-')}`}
              >
                {link.name}
              </a>
            );
          })}
        </nav>

        {/* User Actions Widget */}
        <div className="flex items-center gap-md relative">
          
          {/* Notification Button & Popover */}
          <div className="relative">
            <button
              onClick={() => {
                setShowNotifications(!showNotifications);
                setShowUserMenu(false);
              }}
              className="p-sm text-on-surface-variant hover:bg-surface-muted rounded-full transition-colors relative flex items-center justify-center cursor-pointer"
              id="notification-bell-btn"
              title="Benachrichtigungen"
            >
              <span className="material-symbols-outlined text-[24px]">notifications</span>
              {unreadCount > 0 && (
                <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 bg-danger rounded-full ring-2 ring-surface animate-pulse" />
              )}
            </button>

            {showNotifications && (
              <div 
                className="absolute right-0 mt-2 w-80 bg-white border border-border-standard rounded-lg shadow-lg z-50 overflow-hidden"
                id="notification-dropdown"
              >
                <div className="px-md py-sm bg-surface-muted border-b border-border-standard flex justify-between items-center">
                  <span className="font-semibold text-caption text-primary">Benachrichtigungen</span>
                  {unreadCount > 0 && (
                    <button
                      onClick={onMarkAllRead}
                      className="text-[11px] text-secondary hover:underline font-medium cursor-pointer"
                    >
                      Alle lesen
                    </button>
                  )}
                </div>
                <div className="max-h-72 overflow-y-auto divide-y divide-border-standard">
                  {notifications.length === 0 ? (
                    <div className="px-md py-lg text-center text-caption text-on-surface-variant">
                      Keine Benachrichtigungen vorhanden
                    </div>
                  ) : (
                    notifications.map((notif) => (
                      <div
                        key={notif.id}
                        className={`p-md transition-colors hover:bg-surface-muted ${
                          notif.unread ? 'bg-secondary-container/5' : ''
                        }`}
                      >
                        <div className="flex justify-between items-start gap-sm">
                          <span className={`text-[13px] font-semibold ${notif.unread ? 'text-primary' : 'text-on-surface'}`}>
                            {notif.title}
                          </span>
                          <button
                            onClick={() => onClearNotification(notif.id)}
                            className="text-on-surface-variant hover:text-danger text-[16px] cursor-pointer"
                            title="Löschen"
                          >
                            <span className="material-symbols-outlined text-[16px]">close</span>
                          </button>
                        </div>
                        <p className="text-caption text-on-surface-variant mt-1">
                          {notif.message}
                        </p>
                        <span className="text-[10px] text-on-surface-variant mt-2 block">
                          {notif.time}
                        </span>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>

          {/* User Profile Bubble & Menu */}
          <div className="relative">
            <button
              onClick={() => {
                setShowUserMenu(!showUserMenu);
                setShowNotifications(false);
              }}
              className="w-8 h-8 rounded-full bg-primary-container hover:bg-primary-container/80 transition-colors flex items-center justify-center text-on-primary-container text-caption font-bold cursor-pointer border border-primary/10"
              id="user-profile-btn"
              title="Benutzerprofil"
            >
              JD
            </button>

            {showUserMenu && (
              <div 
                className="absolute right-0 mt-2 w-56 bg-white border border-border-standard rounded-lg shadow-lg z-50 overflow-hidden"
                id="user-profile-dropdown"
              >
                <div className="p-md border-b border-border-standard bg-surface-muted">
                  <p className="font-semibold text-caption text-primary">Joachim Dehmel</p>
                  <p className="text-[11px] text-on-surface-variant">Systemadministrator</p>
                  <p className="text-[10px] text-on-surface-variant italic mt-1">Amt für Digitalisierung</p>
                </div>
                <div className="py-1">
                  <a
                    href="#"
                    onClick={(e) => { e.preventDefault(); alert('Profilverwaltung ist in dieser Demoversion deaktiviert.'); }}
                    className="block px-md py-2 text-caption text-on-surface hover:bg-surface-muted transition-colors flex items-center gap-2"
                  >
                    <span className="material-symbols-outlined text-[16px]">account_circle</span>
                    Mein Profil
                  </a>
                  <a
                    href="#"
                    onClick={(e) => { e.preventDefault(); alert('Sicherheits-Credentials sind schreibgeschützt.'); }}
                    className="block px-md py-2 text-caption text-on-surface hover:bg-surface-muted transition-colors flex items-center gap-2"
                  >
                    <span className="material-symbols-outlined text-[16px]">key</span>
                    API-Schlüssel
                  </a>
                  <div className="border-t border-border-standard my-1"></div>
                  <a
                    href="#"
                    onClick={(e) => { e.preventDefault(); alert('Simulation zurückgesetzt!'); window.location.reload(); }}
                    className="block px-md py-2 text-caption text-danger hover:bg-red-50 transition-colors flex items-center gap-2"
                  >
                    <span className="material-symbols-outlined text-[16px]">logout</span>
                    Simulation zurücksetzen
                  </a>
                </div>
              </div>
            )}
          </div>

        </div>
      </div>
    </header>
  );
};
