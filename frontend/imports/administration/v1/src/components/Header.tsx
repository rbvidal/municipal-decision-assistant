/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState } from "react";
import { Bell, ShieldAlert, CheckCircle, User, LogOut, Settings } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

interface HeaderProps {
  onAddAuditLog: (event: string, details: string, type: "success" | "warning" | "danger" | "info") => void;
}

export default function Header({ onAddAuditLog }: HeaderProps) {
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [notifications, setNotifications] = useState([
    { id: 1, text: "Systemzustand stabil: Alle Dienste online", type: "success", time: "Vor 5 Min" },
    { id: 2, text: "Embedding Service Latenz erhöht (124ms)", type: "warning", time: "Vor 15 Min" },
  ]);

  const clearNotifications = () => {
    setNotifications([]);
    onAddAuditLog("Benachrichtigungen geleert", "Der Benutzer hat das Benachrichtigungscenter geleert.", "info");
  };

  return (
    <header className="bg-surface border-b border-standard fixed top-0 w-full z-50 h-header-height shadow-polish-sm">
      <div className="flex justify-between items-center w-full px-huge h-full max-w-max-width mx-auto">
        
        {/* Branding Title */}
        <div className="text-h2 font-h2 font-bold text-brand-dark tracking-tight select-none">
          Kommunale Entscheidungsplattform
        </div>

        {/* Navigation Tabs */}
        <nav className="hidden md:flex items-center space-x-lg h-full">
          <a 
            className="text-on-surface-variant font-body-base hover:bg-surface-muted transition-colors duration-150 px-sm py-1 rounded" 
            href="#"
            onClick={(e) => e.preventDefault()}
          >
            Startseite
          </a>
          <a 
            className="text-on-surface-variant font-body-base hover:bg-surface-muted transition-colors duration-150 px-sm py-1 rounded" 
            href="#"
            onClick={(e) => e.preventDefault()}
          >
            Meine Arbeit
          </a>
          <a 
            className="text-on-surface-variant font-body-base hover:bg-surface-muted transition-colors duration-150 px-sm py-1 rounded" 
            href="#"
            onClick={(e) => e.preventDefault()}
          >
            Wissen
          </a>
          <a 
            className="text-on-surface-variant font-body-base hover:bg-surface-muted transition-colors duration-150 px-sm py-1 rounded" 
            href="#"
            onClick={(e) => e.preventDefault()}
          >
            Dokumente
          </a>
          <a 
            className="text-primary border-b-2 border-primary font-body-semibold px-sm py-1" 
            href="#"
            onClick={(e) => e.preventDefault()}
          >
            Verhaltung
          </a>
        </nav>

        {/* Action Controls & User Identity */}
        <div className="flex items-center space-x-md">
          {/* Notifications Button */}
          <div className="relative">
            <button 
              id="notifications-bell"
              onClick={() => {
                setShowNotifications(!showNotifications);
                setShowProfile(false);
              }}
              className="p-sm hover:bg-surface-muted rounded-full text-on-surface-variant hover:text-primary transition-all relative flex items-center justify-center cursor-pointer"
              title="Benachrichtigungen"
            >
              <Bell className="w-5 h-5" />
              {notifications.length > 0 && (
                <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-error rounded-full ring-2 ring-surface animate-pulse" />
              )}
            </button>

            {/* Notifications Dropdown */}
            <AnimatePresence>
              {showNotifications && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  className="absolute right-0 mt-2 w-80 bg-white border border-standard rounded-lg shadow-xl z-50 overflow-hidden"
                >
                  <div className="px-xl py-md bg-surface-muted border-b border-standard flex justify-between items-center">
                    <span className="font-body-semibold text-primary">System-Meldungen</span>
                    {notifications.length > 0 && (
                      <button 
                        onClick={clearNotifications}
                        className="text-caption text-secondary hover:underline"
                      >
                        Alle leeren
                      </button>
                    )}
                  </div>
                  <div className="max-h-64 overflow-y-auto divide-y divide-standard">
                    {notifications.length > 0 ? (
                      notifications.map((n) => (
                        <div key={n.id} className="p-md hover:bg-surface-background transition-colors flex space-x-sm items-start">
                          {n.type === "success" ? (
                            <CheckCircle className="w-4 h-4 text-success shrink-0 mt-0.5" />
                          ) : (
                            <ShieldAlert className="w-4 h-4 text-warning shrink-0 mt-0.5" />
                          )}
                          <div className="flex-1">
                            <p className="text-table-cell text-on-surface font-body-base leading-snug">{n.text}</p>
                            <span className="text-[10px] text-on-surface-variant font-mono">{n.time}</span>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="p-huge text-center text-caption text-on-surface-variant">
                        Keine neuen Benachrichtigungen
                      </div>
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Profile Dropdown */}
          <div className="relative">
            <button
              id="user-profile-button"
              onClick={() => {
                setShowProfile(!showProfile);
                setShowNotifications(false);
              }}
              className="flex items-center space-x-2 p-1 rounded-full hover:bg-surface-muted transition-colors cursor-pointer"
            >
              <img 
                alt="Benutzerprofil" 
                className="w-8 h-8 rounded-full border border-standard object-cover hover:brightness-95 transition-all" 
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuBT4wEoui0Flm6r-aEtb5EfdoPa3M7ielrihkCEVeJlDx2VmSMpifpmMvHqJcU4L2IypDjApy25fCaatg-Y94_gPw1O5Akq0RLN91r1cTAlb6o2VoTfQZ4DpA57VWSAE2GWQfhpMcZiwwXCDw0JkKs21HPteAqx2p-p5ct61sFqPGjUrt_ast-SITS-2SthEQdmQ_63xniLCNxOYzHfZ06GLZryBw2VG1OyzyRnBpZginwaXCVttob0ao9b737WV-B2Ysgd7UFEvte-" 
              />
            </button>

            <AnimatePresence>
              {showProfile && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  className="absolute right-0 mt-2 w-64 bg-white border border-standard rounded-lg shadow-xl z-50 overflow-hidden"
                >
                  <div className="p-xl border-b border-standard bg-surface-muted flex items-center space-x-md">
                    <img 
                      alt="Benutzerprofil groß" 
                      className="w-12 h-12 rounded-full border border-standard object-cover" 
                      src="https://lh3.googleusercontent.com/aida-public/AB6AXuBT4wEoui0Flm6r-aEtb5EfdoPa3M7ielrihkCEVeJlDx2VmSMpifpmMvHqJcU4L2IypDjApy25fCaatg-Y94_gPw1O5Akq0RLN91r1cTAlb6o2VoTfQZ4DpA57VWSAE2GWQfhpMcZiwwXCDw0JkKs21HPteAqx2p-p5ct61sFqPGjUrt_ast-SITS-2SthEQdmQ_63xniLCNxOYzHfZ06GLZryBw2VG1OyzyRnBpZginwaXCVttob0ao9b737WV-B2Ysgd7UFEvte-" 
                    />
                    <div>
                      <h4 className="font-body-semibold text-primary">Dr. Brandão Vidal</h4>
                      <p className="text-caption text-on-surface-variant font-mono">admin-01</p>
                    </div>
                  </div>
                  <div className="p-sm divide-y divide-standard">
                    <div className="py-1">
                      <button 
                        onClick={() => {
                          setShowProfile(false);
                          onAddAuditLog("Profil geöffnet", "Dr. Brandão Vidal hat seine Profileinstellungen aufgerufen.", "info");
                        }}
                        className="w-full flex items-center space-x-sm px-md py-sm hover:bg-surface-background text-body-base text-on-surface-variant hover:text-primary rounded-md transition-colors"
                      >
                        <User className="w-4 h-4" />
                        <span>Konto verwalten</span>
                      </button>
                      <button 
                        onClick={() => {
                          setShowProfile(false);
                          onAddAuditLog("Systemsteuerung aufgerufen", "Systemverwaltung aufgerufen.", "info");
                        }}
                        className="w-full flex items-center space-x-sm px-md py-sm hover:bg-surface-background text-body-base text-on-surface-variant hover:text-primary rounded-md transition-colors"
                      >
                        <Settings className="w-4 h-4" />
                        <span>Sicherheit & Logs</span>
                      </button>
                    </div>
                    <div className="py-1">
                      <button 
                        onClick={() => {
                          setShowProfile(false);
                          onAddAuditLog("Benutzer abgemeldet", "Aktive Administrator-Sitzung beendet.", "warning");
                        }}
                        className="w-full flex items-center space-x-sm px-md py-sm hover:bg-surface-background text-body-base text-danger hover:bg-red-50 rounded-md transition-colors"
                      >
                        <LogOut className="w-4 h-4" />
                        <span>Abmelden</span>
                      </button>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

      </div>
    </header>
  );
}
