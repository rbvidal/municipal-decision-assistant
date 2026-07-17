import React, { useState } from 'react';
import { Search, Bell } from 'lucide-react';

interface HeaderProps {
  onSearch?: (query: string) => void;
}

export const Header: React.FC<HeaderProps> = ({ onSearch }) => {
  const [searchVal, setSearchVal] = useState('');

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setSearchVal(val);
    if (onSearch) {
      onSearch(val);
    }
  };

  return (
    <header className="top-header" id="app-top-header">
      <div className="top-header-left">
        <a href="#" className="brand-logo" id="brand-logo-link">
          Kommunale Entscheidungsplattform
        </a>
        <nav className="main-navigation" id="main-navigation-menu">
          <a href="#" className="nav-link" id="nav-link-home">
            Startseite
          </a>
          <a href="#" className="nav-link active" id="nav-link-mywork">
            Meine Arbeit
          </a>
          <a href="#" className="nav-link" id="nav-link-knowledge">
            Wissen
          </a>
          <a href="#" className="nav-link" id="nav-link-docs">
            Dokumente
          </a>
          <a href="#" className="nav-link" id="nav-link-regulations">
            Verhaltung
          </a>
        </nav>
      </div>

      <div className="top-header-right">
        <div className="search-box-container" id="header-search-container">
          <input
            type="text"
            className="search-input"
            placeholder="Suchen..."
            value={searchVal}
            onChange={handleSearchChange}
            id="header-search-input"
          />
          <span className="search-icon-wrapper">
            <Search size={16} />
          </span>
        </div>

        <button className="bell-button" title="Benachrichtigungen" id="header-notification-bell">
          <Bell size={20} />
          <span className="notification-badge" id="header-notification-dot"></span>
        </button>

        <div className="user-profile" id="user-profile-widget">
          <div className="profile-info">
            <p className="profile-name">Sabine Müller</p>
            <p className="profile-role">Bauamt | Sachbearbeiterin</p>
          </div>
          <div className="avatar-badge" id="user-avatar-badge">
            SM
          </div>
        </div>
      </div>
    </header>
  );
};
