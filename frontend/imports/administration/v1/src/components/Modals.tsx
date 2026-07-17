/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { X, Play, UserPlus, CheckCircle2 } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

interface NewVorgangModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (type: string, details: string, eta: string) => void;
}

export function NewVorgangModal({ isOpen, onClose, onSubmit }: NewVorgangModalProps) {
  const [jobType, setJobType] = useState("Volltext-Indexierung");
  const [scope, setScope] = useState("Klimaschutzgesetz 2026");
  const [eta, setEta] = useState("05:30m");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(jobType, scope, eta);
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-lg select-none">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.5 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black"
          />

          {/* Dialog Container */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="relative bg-white border border-standard rounded-lg shadow-2xl w-full max-w-md overflow-hidden z-10"
          >
            {/* Header */}
            <div className="px-xl py-md bg-surface-muted border-b border-standard flex justify-between items-center">
              <h3 className="font-h3 text-h3 text-primary flex items-center space-x-2">
                <Play className="w-4 h-4" />
                <span>Neuen Vorgang starten</span>
              </h3>
              <button 
                onClick={onClose} 
                className="p-1 hover:bg-surface-variant/40 rounded text-on-surface-variant hover:text-on-surface transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="p-xl space-y-md">
              <div className="space-y-1">
                <label className="text-caption font-body-semibold text-on-surface-variant">Vorgangs-Typ</label>
                <select
                  value={jobType}
                  onChange={(e) => setJobType(e.target.value)}
                  className="w-full text-body-base px-md py-sm bg-white border border-standard rounded-md focus:outline-none focus:border-primary focus:ring-3 focus:ring-focus-ring-outer"
                >
                  <option value="Volltext-Indexierung">Volltext-Indexierung</option>
                  <option value="CSV Daten-Import">CSV Daten-Import</option>
                  <option value="Vektor-Segmentierung">Vektor-Segmentierung</option>
                  <option value="Datenbereinigung">Datenbereinigung & Archivierung</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-caption font-body-semibold text-on-surface-variant">Dokumenten-Geltungsbereich</label>
                <input
                  type="text"
                  required
                  value={scope}
                  onChange={(e) => setScope(e.target.value)}
                  placeholder="z.B. Baugesetzbuch Ergänzung, Klima-NRW"
                  className="w-full text-body-base px-md py-sm border border-standard rounded-md focus:outline-none focus:border-primary focus:ring-3 focus:ring-focus-ring-outer"
                />
              </div>

              <div className="space-y-1">
                <label className="text-caption font-body-semibold text-on-surface-variant">Schätzzeit (ETA)</label>
                <input
                  type="text"
                  required
                  value={eta}
                  onChange={(e) => setEta(e.target.value)}
                  placeholder="z.B. 04:15m"
                  className="w-full text-body-base px-md py-sm border border-standard rounded-md focus:outline-none focus:border-primary focus:ring-3 focus:ring-focus-ring-outer font-mono"
                />
              </div>

              <div className="flex justify-end space-x-sm pt-md border-t border-standard">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-lg py-sm text-body-semibold text-on-surface-variant hover:bg-surface-muted border border-standard rounded-md transition-colors cursor-pointer"
                >
                  Abbrechen
                </button>
                <button
                  type="submit"
                  className="px-lg py-sm text-body-semibold text-white bg-primary hover:opacity-90 rounded-md transition-all flex items-center space-x-1 cursor-pointer"
                >
                  <Play className="w-4 h-4" />
                  <span>Vorgang starten</span>
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

interface NewUserModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (username: string, role: string) => void;
}

export function NewUserModal({ isOpen, onClose, onSubmit }: NewUserModalProps) {
  const [username, setUsername] = useState("");
  const [role, setRole] = useState("Administrator");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim()) return;
    onSubmit(username, role);
    setUsername("");
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-lg select-none">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.5 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black"
          />

          {/* Dialog Container */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="relative bg-white border border-standard rounded-lg shadow-2xl w-full max-w-md overflow-hidden z-10"
          >
            {/* Header */}
            <div className="px-xl py-md bg-surface-muted border-b border-standard flex justify-between items-center">
              <h3 className="font-h3 text-h3 text-primary flex items-center space-x-2">
                <UserPlus className="w-4 h-4" />
                <span>Neuen Benutzer anlegen</span>
              </h3>
              <button 
                onClick={onClose} 
                className="p-1 hover:bg-surface-variant/40 rounded text-on-surface-variant hover:text-on-surface transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="p-xl space-y-md">
              <div className="space-y-1">
                <label className="text-caption font-body-semibold text-on-surface-variant">Benutzerkennung (User ID)</label>
                <input
                  type="text"
                  required
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="z.B. m.schmidt"
                  className="w-full text-body-base px-md py-sm border border-standard rounded-md focus:outline-none focus:border-primary focus:ring-3 focus:ring-focus-ring-outer font-mono"
                />
              </div>

              <div className="space-y-1">
                <label className="text-caption font-body-semibold text-on-surface-variant">Rolle / Berechtigungsgruppe</label>
                <select
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  className="w-full text-body-base px-md py-sm bg-white border border-standard rounded-md focus:outline-none focus:border-primary focus:ring-3 focus:ring-focus-ring-outer"
                >
                  <option value="Administrator">Administrator (Vollzugriff)</option>
                  <option value="Sachbearbeiter">Sachbearbeiter (Eingeschränkt)</option>
                  <option value="Prüfer">Kanal-Prüfer (Nur Lesen)</option>
                </select>
              </div>

              <div className="flex justify-end space-x-sm pt-md border-t border-standard">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-lg py-sm text-body-semibold text-on-surface-variant hover:bg-surface-muted border border-standard rounded-md transition-colors cursor-pointer"
                >
                  Abbrechen
                </button>
                <button
                  type="submit"
                  className="px-lg py-sm text-body-semibold text-white bg-primary hover:opacity-90 rounded-md transition-all flex items-center space-x-1 cursor-pointer"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Benutzer erstellen</span>
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
