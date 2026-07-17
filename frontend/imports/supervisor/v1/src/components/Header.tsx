import { useState } from 'react';
import { Bell } from 'lucide-react';

interface HeaderProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  unreadNotifications: boolean;
  setUnreadNotifications: (unread: boolean) => void;
  onNotificationClick: () => void;
}

export default function Header({
  activeTab,
  setActiveTab,
  unreadNotifications,
  setUnreadNotifications,
  onNotificationClick,
}: HeaderProps) {
  const tabs = [
    { id: 'startseite', label: 'Startseite' },
    { id: 'meine-arbeit', label: 'Meine Arbeit' },
    { id: 'wissen', label: 'Wissen' },
    { id: 'dokumente', label: 'Dokumente' },
  ];

  return (
    <header className="bg-white border-b border-border-default flex justify-between items-center w-full px-huge h-topbar shrink-0 z-50">
      <div className="flex items-center gap-xl h-full">
        <span className="text-headline-sm font-bold text-primary mr-2 cursor-pointer select-none">
          Kommunale Entscheidungsplattform
        </span>
        <nav className="hidden md:flex gap-4 items-center h-full">
          {tabs.map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`h-full px-md flex items-center text-body-md transition-all border-b-2 relative -bottom-[1px] font-medium cursor-pointer ${
                  isActive
                    ? 'text-primary border-primary font-semibold'
                    : 'text-on-surface-variant border-transparent hover:text-primary'
                }`}
              >
                {tab.label}
              </button>
            );
          })}
        </nav>
      </div>
      
      <div className="flex items-center gap-md">
        <button
          onClick={onNotificationClick}
          className="relative p-2 rounded-full text-on-surface-variant hover:bg-surface-container transition-all cursor-pointer"
          title="Mitteilungen"
        >
          <Bell className="w-5 h-5" />
          {unreadNotifications && (
            <span className="absolute top-2 right-2 w-2.5 h-2.5 bg-error rounded-full ring-2 ring-white"></span>
          )}
        </button>
        <img
          className="w-8 h-8 rounded-full border border-outline-variant object-cover cursor-pointer hover:opacity-90"
          alt="Benutzerprofil"
          src="https://lh3.googleusercontent.com/aida-public/AB6AXuDZ-mlC_aYLTpegGl7TDAVYfnyWbhmhKtxOHBhGejaSzaU-2u2ScgjwQPQD0fsjnGo5EBT6mDoXEHeQ8kuV0nzlMKaDCWnDd3_0Qier1LEkc4c6SBV6U4VzLrD9I19FQc99dnsm3fRFbe4NtgvKjCOrh-iVdMxEPUCLOKwZij6MNdirk3757a4kMHdPirOSLVG2tfkIZO_EaR8pMFtQl2n4pJ_91pMLPjLY1lw0IfHbiyRBWflmYLz49f1M_5fvYmh8nuLknSILXRlA"
        />
      </div>
    </header>
  );
}
