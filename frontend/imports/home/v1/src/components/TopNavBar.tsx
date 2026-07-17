/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Bell } from 'lucide-react';

interface TopNavBarProps {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  notificationCount?: number;
}

export default function TopNavBar({ searchQuery, setSearchQuery, notificationCount = 3 }: TopNavBarProps) {
  return (
    <header className="fixed top-0 left-0 w-full z-50 flex items-center px-lg h-[56px] bg-surface-container-lowest border-b border-border-default">
      <div className="flex items-center gap-xl w-full max-w-[1400px] mx-auto">
        <span id="nav-logo" className="font-headline-sm text-headline-sm font-bold text-primary">VerwaltungsPortal</span>
        
        <nav className="hidden md:flex items-center h-[56px] gap-lg ml-xl">
          <a id="nav-item-startseite" className="h-[56px] flex items-center px-sm text-primary border-b-2 border-primary font-label-sm text-label-sm font-semibold" href="#">
            Startseite
          </a>
          <a id="nav-item-arbeit" className="h-[56px] flex items-center px-sm text-on-surface-variant font-label-sm text-label-sm hover:bg-surface-container-low transition-colors" href="#">
            Meine Arbeit
          </a>
          <a id="nav-item-wissen" className="h-[56px] flex items-center px-sm text-on-surface-variant font-label-sm text-label-sm hover:bg-surface-container-low transition-colors" href="#">
            Wissen
          </a>
          <a id="nav-item-dokumente" className="h-[56px] flex items-center px-sm text-on-surface-variant font-label-sm text-label-sm hover:bg-surface-container-low transition-colors" href="#">
            Dokumente
          </a>
          <a id="nav-item-verwaltung" className="h-[56px] flex items-center px-sm text-on-surface-variant font-label-sm text-label-sm hover:bg-surface-container-low transition-colors" href="#">
            Verwaltung
          </a>
        </nav>

        <div className="flex-grow"></div>

        <div className="flex items-center gap-md">
          <div className="relative hidden lg:block">
            <input
              id="global-search-input"
              className="w-64 h-8 bg-surface-container-low border border-border-default rounded px-sm font-body-md focus:ring-2 focus:ring-focus-ring outline-none text-on-background text-sm"
              placeholder="Suche..."
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <button id="notification-button" className="relative w-8 h-8 flex items-center justify-center hover:bg-surface-container-low transition-colors rounded-full">
            <Bell size={20} className="text-on-surface-variant" />
            {notificationCount > 0 && (
              <span className="absolute top-1 right-1 w-2 h-2 bg-status-dot-red rounded-full" />
            )}
          </button>

          <div id="user-profile-avatar" className="w-8 h-8 rounded-full overflow-hidden border border-border-default">
            <img
              className="w-full h-full object-cover"
              alt="Frau Müller civil servant portrait"
              referrerPolicy="no-referrer"
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuBY8OhcmJ68uAOyoJcQa5HTJqJyNGxrsQxz7REeho8rdICIDoSLoPe-jHbwuNlOGV35Cq7jC8EWK43LvSIAf1zAyxEir_szFvgOsTw84qlG1uxhH3CVSh9vSle12FO7lQu4wK8GlnNQv4kaayYnJB5HBy-bsocSzEyrul3zyUK0zBWSaVkLzQIO-4TodqoGSLoXZLHOm3S8a2lnGUCCHkhlQx0IpRjlJz3dDOi8UQUcaSwSS4e0pJXHLgRmDdMx4C9L5Is553b9lQ8P"
            />
          </div>
        </div>
      </div>
    </header>
  );
}
