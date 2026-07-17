/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, FormEvent } from 'react';
import { X, Mail, Send, ExternalLink, HelpCircle } from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';
import { Vorgang } from '../types';

// Modal overlay transition
const overlayVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1 },
};

// Modal container transition
const modalVariants = {
  hidden: { opacity: 0, scale: 0.95, y: 10 },
  visible: { opacity: 1, scale: 1, y: 0 },
};

// Slide-over container transition (for email/legal lookups)
const drawerVariants = {
  hidden: { x: '100%' },
  visible: { x: 0 },
};

// --- NEW CASE MODAL ---
interface NewCaseModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (newCase: Omit<Vorgang, 'actionText'>) => void;
}

export function NewCaseModal({ isOpen, onClose, onSubmit }: NewCaseModalProps) {
  const [id, setId] = useState('');
  const [title, setTitle] = useState('');
  const [status, setStatus] = useState<Vorgang['status']>('Erfasst');
  const [dueDate, setDueDate] = useState('');

  // Auto generate a mock ID when modal opens
  useEffect(() => {
    if (isOpen) {
      const year = new Date().getFullYear();
      const rand = Math.floor(1000 + Math.random() * 9000);
      setId(`BAU-${year}-${rand}`);
      setTitle('');
      setStatus('Erfasst');
      setDueDate('30. Okt.');
    }
  }, [isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    onSubmit({
      id,
      title: title.trim(),
      status,
      dueDate: dueDate || 'Sofort',
    });
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-100 overflow-y-auto">
          <div className="flex min-h-screen items-center justify-center p-4">
            {/* Background Backdrop */}
            <motion.div
              className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs"
              initial="hidden"
              animate="visible"
              exit="hidden"
              variants={overlayVariants}
              onClick={onClose}
            />

            {/* Modal Body */}
            <motion.div
              className="relative w-full max-w-md rounded bg-surface-container-lowest p-lg shadow-xl border border-border-default z-10"
              initial="hidden"
              animate="visible"
              exit="hidden"
              variants={modalVariants}
            >
              <div className="flex items-center justify-between border-b border-border-default pb-md mb-md">
                <h4 className="font-headline-sm text-headline-sm text-text-primary text-base font-semibold">
                  Neuen Vorgang erfassen
                </h4>
                <button
                  onClick={onClose}
                  className="rounded-full p-1 text-on-surface-variant hover:bg-surface-container-low transition-colors"
                >
                  <X size={18} />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-md">
                <div>
                  <label className="block text-xs font-semibold text-outline mb-1 uppercase tracking-wider">
                    Aktenzeichen / ID
                  </label>
                  <input
                    type="text"
                    required
                    readOnly
                    className="w-full h-9 bg-surface-container border border-border-default rounded px-sm font-mono text-xs focus:outline-none text-on-surface-variant"
                    value={id}
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-outline mb-1 uppercase tracking-wider">
                    Titel / Vorgangsbezeichnung
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="z.B. Errichtung Gartenhaus"
                    className="w-full h-9 bg-surface-container-low border border-border-default rounded px-sm font-body-md text-sm focus:ring-2 focus:ring-focus-ring focus:border-transparent outline-none text-on-background"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                  />
                </div>

                <div className="grid grid-cols-2 gap-sm">
                  <div>
                    <label className="block text-xs font-semibold text-outline mb-1 uppercase tracking-wider">
                      Status
                    </label>
                    <select
                      className="w-full h-9 bg-surface-container-low border border-border-default rounded px-sm font-body-md text-sm focus:ring-2 focus:ring-focus-ring outline-none text-on-background"
                      value={status}
                      onChange={(e) => setStatus(e.target.value as Vorgang['status'])}
                    >
                      <option value="Erfasst">Erfasst</option>
                      <option value="In Bearbeitung">In Bearbeitung</option>
                      <option value="In Prüfung">In Prüfung</option>
                      <option value="Wartet Bürger">Wartet Bürger</option>
                      <option value="Überfällig">Überfällig</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-outline mb-1 uppercase tracking-wider">
                      Fälligkeit
                    </label>
                    <input
                      type="text"
                      placeholder="z.B. 12. Nov."
                      className="w-full h-9 bg-surface-container-low border border-border-default rounded px-sm font-body-md text-sm focus:ring-2 focus:ring-focus-ring outline-none text-on-background"
                      value={dueDate}
                      onChange={(e) => setDueDate(e.target.value)}
                    />
                  </div>
                </div>

                <div className="flex justify-end gap-sm pt-md border-t border-border-default mt-lg">
                  <button
                    type="button"
                    onClick={onClose}
                    className="px-lg py-2 border border-border-default text-on-surface-variant rounded text-xs font-semibold hover:bg-surface-container-low transition-colors"
                  >
                    Abbrechen
                  </button>
                  <button
                    type="submit"
                    className="px-lg py-2 bg-primary text-on-primary rounded text-xs font-semibold hover:bg-[#1A365D] transition-colors"
                  >
                    Vorgang anlegen
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        </div>
      )}
    </AnimatePresence>
  );
}

// --- EDIT/VIEW CASE DETAILS MODAL ---
interface EditCaseModalProps {
  isOpen: boolean;
  caseItem: Vorgang | null;
  onClose: () => void;
  onSave: (updatedCase: Vorgang) => void;
  onDelete?: (caseId: string) => void;
}

export function EditCaseModal({ isOpen, caseItem, onClose, onSave, onDelete }: EditCaseModalProps) {
  const [title, setTitle] = useState('');
  const [status, setStatus] = useState<Vorgang['status']>('Erfasst');
  const [dueDate, setDueDate] = useState('');

  useEffect(() => {
    if (caseItem) {
      setTitle(caseItem.title);
      setStatus(caseItem.status);
      setDueDate(caseItem.dueDate);
    }
  }, [caseItem, isOpen]);

  if (!caseItem) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      ...caseItem,
      title: title.trim(),
      status,
      dueDate,
    });
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-100 overflow-y-auto">
          <div className="flex min-h-screen items-center justify-center p-4">
            <motion.div
              className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs"
              initial="hidden"
              animate="visible"
              exit="hidden"
              variants={overlayVariants}
              onClick={onClose}
            />

            <motion.div
              className="relative w-full max-w-md rounded bg-surface-container-lowest p-lg shadow-xl border border-border-default z-10"
              initial="hidden"
              animate="visible"
              exit="hidden"
              variants={modalVariants}
            >
              <div className="flex items-center justify-between border-b border-border-default pb-md mb-md">
                <div>
                  <span className="font-mono text-xs text-outline">{caseItem.id}</span>
                  <h4 className="font-headline-sm text-headline-sm text-text-primary text-base font-semibold">
                    Vorgangsdetails bearbeiten
                  </h4>
                </div>
                <button
                  onClick={onClose}
                  className="rounded-full p-1 text-on-surface-variant hover:bg-surface-container-low transition-colors"
                >
                  <X size={18} />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-md">
                <div>
                  <label className="block text-xs font-semibold text-outline mb-1 uppercase tracking-wider">
                    Titel / Vorgangsbezeichnung
                  </label>
                  <input
                    type="text"
                    required
                    className="w-full h-9 bg-surface-container-low border border-border-default rounded px-sm font-body-md text-sm focus:ring-2 focus:ring-focus-ring outline-none text-on-background"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                  />
                </div>

                <div className="grid grid-cols-2 gap-sm">
                  <div>
                    <label className="block text-xs font-semibold text-outline mb-1 uppercase tracking-wider">
                      Status
                    </label>
                    <select
                      className="w-full h-9 bg-surface-container-low border border-border-default rounded px-sm font-body-md text-sm focus:ring-2 focus:ring-focus-ring outline-none text-on-background"
                      value={status}
                      onChange={(e) => setStatus(e.target.value as Vorgang['status'])}
                    >
                      <option value="Erfasst">Erfasst</option>
                      <option value="In Bearbeitung">In Bearbeitung</option>
                      <option value="In Prüfung">In Prüfung</option>
                      <option value="Wartet Bürger">Wartet Bürger</option>
                      <option value="Überfällig">Überfällig</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-outline mb-1 uppercase tracking-wider">
                      Fälligkeit
                    </label>
                    <input
                      type="text"
                      required
                      className="w-full h-9 bg-surface-container-low border border-border-default rounded px-sm font-body-md text-sm focus:ring-2 focus:ring-focus-ring outline-none text-on-background"
                      value={dueDate}
                      onChange={(e) => setDueDate(e.target.value)}
                    />
                  </div>
                </div>

                <div className="flex justify-between items-center pt-md border-t border-border-default mt-lg">
                  {onDelete ? (
                    <button
                      type="button"
                      onClick={() => {
                        onDelete(caseItem.id);
                        onClose();
                      }}
                      className="text-status-error text-xs font-semibold hover:underline bg-transparent border-none p-0 cursor-pointer"
                    >
                      Vorgang löschen
                    </button>
                  ) : (
                    <div />
                  )}
                  <div className="flex gap-sm">
                    <button
                      type="button"
                      onClick={onClose}
                      className="px-lg py-2 border border-border-default text-on-surface-variant rounded text-xs font-semibold hover:bg-surface-container-low transition-colors"
                    >
                      Abbrechen
                    </button>
                    <button
                      type="submit"
                      className="px-lg py-2 bg-primary text-on-primary rounded text-xs font-semibold hover:bg-[#1A365D] transition-colors"
                    >
                      Speichern
                    </button>
                  </div>
                </div>
              </form>
            </motion.div>
          </div>
        </div>
      )}
    </AnimatePresence>
  );
}

// --- LEGAL TEXT LOOKUP MODAL ---
interface LegalTextModalProps {
  isOpen: boolean;
  caseId: string;
  onClose: () => void;
}

export function LegalTextModal({ isOpen, caseId, onClose }: LegalTextModalProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-100 overflow-hidden flex justify-end">
          {/* Backdrop */}
          <motion.div
            className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs"
            initial="hidden"
            animate="visible"
            exit="hidden"
            variants={overlayVariants}
            onClick={onClose}
          />

          {/* Drawer Panel */}
          <motion.div
            className="relative w-full max-w-lg h-full bg-surface-container-lowest shadow-2xl border-l border-border-default z-10 flex flex-col"
            initial="hidden"
            animate="visible"
            exit="hidden"
            variants={drawerVariants}
            transition={{ type: 'spring', damping: 25, stiffness: 220 }}
          >
            <div className="p-lg border-b border-border-default flex items-center justify-between bg-surface-container-low">
              <div>
                <span className="font-mono text-[10px] bg-primary/10 text-primary px-sm py-[2px] rounded uppercase font-bold tracking-wider">
                  Rechtstext-Assistent
                </span>
                <h4 className="font-headline-sm text-headline-sm text-text-primary text-base font-semibold mt-1">
                  § 65 BauO NRW 2018 (Bauordnungsrecht)
                </h4>
              </div>
              <button
                onClick={onClose}
                className="rounded-full p-1.5 text-on-surface-variant hover:bg-surface-container-high transition-colors"
              >
                <X size={18} />
              </button>
            </div>

            <div className="p-lg overflow-y-auto space-y-md flex-grow">
              <div className="bg-slate-50 border-l-4 border-primary p-md rounded-r text-xs leading-relaxed text-slate-700 font-sans">
                <span className="font-bold block text-text-primary mb-1">§ 65 Genehmigungsfreie Vorhaben</span>
                (1) Die Errichtung oder Änderung folgender baulicher Anlagen sowie anderer Anlagen und Einrichtungen im Sinne des § 1 Absatz 1 Satz 2 bedarf keiner Baugenehmigung...
                <br />
                <br />
                <strong className="text-primary font-bold">Nummer 1: Gebäude bis zu 30 m³ Brutto-Rauminhalt</strong>, im Außenbereich bis zu 10 m³, ohne Aufenthaltsräume, Aborte oder Feuerstätten, als freistehende Gebäude...
                <br />
                <br />
                <strong className="text-primary font-bold">Nummer 2: Garagen einschließlich überdachter Stellplätze (Carports)</strong> mit einer mittleren Wandhöhe bis zu 3 m und einer Brutto-Grundfläche bis zu 30 m², außer im Außenbereich...
              </div>

              <div className="space-y-sm text-xs text-on-surface-variant leading-relaxed">
                <h5 className="font-semibold text-text-primary flex items-center gap-xs">
                  <HelpCircle size={14} className="text-primary" /> Systemanalyse für {caseId}
                </h5>
                <p>
                  Das angemeldete Vorhaben <strong>Bauantrag Carport</strong> sieht eine Grundfläche von <strong>18 m²</strong> und eine mittlere Wandhöhe von <strong>2,85 m</strong> vor.
                </p>
                <p>
                  Gemäß <strong>§ 65 Abs. 1 Nr. 2 BauO NRW</strong> sind Garagen und Carports bis zu einer Grundfläche von <strong>30 m²</strong> genehmigungsfrei gestellt, sofern sie den bauplanungsrechtlichen Vorgaben (z.B. Abstandsflächen, Bebauungsplan) nicht widersprechen.
                </p>
                <p className="font-semibold text-status-success bg-status-success/10 p-sm rounded border border-status-success/20">
                  ✓ Fazit: Das vereinfachte Verfahren ist hier vollkommen ausreichend. Ein formeller Baugenehmigungsprozess ist rechtlich nicht erforderlich.
                </p>
              </div>
            </div>

            <div className="p-lg border-t border-border-default bg-surface-container-low flex justify-between items-center">
              <a
                href="https://recht.nrw.de/"
                target="_blank"
                rel="noreferrer"
                className="text-xs text-primary hover:underline flex items-center gap-xs font-semibold"
              >
                Im Justizportal NRW öffnen <ExternalLink size={12} />
              </a>
              <button
                onClick={onClose}
                className="px-lg py-2 bg-primary text-on-primary rounded text-xs font-semibold hover:bg-[#1A365D] transition-colors"
              >
                Analyse übernehmen
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

// --- EMAIL DRAFT COMPOSER DRAWER ---
interface EmailDraftModalProps {
  isOpen: boolean;
  caseId: string;
  onClose: () => void;
  onSendSuccess: (message: string) => void;
}

export function EmailDraftModal({ isOpen, caseId, onClose, onSendSuccess }: EmailDraftModalProps) {
  const [to, setTo] = useState('buergerservice@kommune.de');
  const [subject, setSubject] = useState(`Fehlende Unterlagen zum Vorgang ${caseId}`);
  const [body, setBody] = useState('');

  useEffect(() => {
    if (isOpen) {
      setTo('antragsteller.mueller@web.de');
      setSubject(`Nachforderung von Unterlagen - Aktenzeichen ${caseId}`);
      setBody(
        `Sehr geehrte Familie Müller,\n\nfür die abschließende Bearbeitung Ihres Bauantrags zum Carport (Az: ${caseId}) benötigen wir noch einen aktuellen, beglaubigten Auszug aus der Flurkarte sowie einen detaillierten Lageplan im Maßstab 1:500.\n\nBitte reichen Sie diese Unterlagen innerhalb der nächsten 14 Tage über das Bürgerportal ein.\n\nMit freundlichen Grüßen\nIm Auftrag\nK. Müller\nBauaufsichtsbehörde`
      );
    }
  }, [isOpen, caseId]);

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    onSendSuccess(`E-Mail für ${caseId} erfolgreich an ${to} versendet!`);
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-100 overflow-hidden flex justify-end">
          <motion.div
            className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs"
            initial="hidden"
            animate="visible"
            exit="hidden"
            variants={overlayVariants}
            onClick={onClose}
          />

          <motion.div
            className="relative w-full max-w-lg h-full bg-surface-container-lowest shadow-2xl border-l border-border-default z-10 flex flex-col"
            initial="hidden"
            animate="visible"
            exit="hidden"
            variants={drawerVariants}
            transition={{ type: 'spring', damping: 25, stiffness: 220 }}
          >
            <div className="p-lg border-b border-border-default flex items-center justify-between bg-surface-container-low">
              <div className="flex items-center gap-sm">
                <Mail className="text-primary" size={18} />
                <div>
                  <span className="font-mono text-[10px] bg-primary/10 text-primary px-sm py-[2px] rounded uppercase font-bold tracking-wider">
                    E-Mail Entwurfs-Assistent
                  </span>
                  <h4 className="font-headline-sm text-headline-sm text-text-primary text-base font-semibold mt-0.5">
                    Nachforderung verfassen ({caseId})
                  </h4>
                </div>
              </div>
              <button
                onClick={onClose}
                className="rounded-full p-1.5 text-on-surface-variant hover:bg-surface-container-high transition-colors"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSend} className="flex-grow flex flex-col">
              <div className="p-lg space-y-sm flex-grow overflow-y-auto">
                <div>
                  <label className="block text-[10px] font-bold text-outline uppercase tracking-wider mb-0.5">
                    Empfänger (Antragsteller)
                  </label>
                  <input
                    type="email"
                    required
                    className="w-full h-9 bg-surface-container-low border border-border-default rounded px-sm font-body-md text-xs focus:ring-2 focus:ring-focus-ring outline-none text-on-background"
                    value={to}
                    onChange={(e) => setTo(e.target.value)}
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-outline uppercase tracking-wider mb-0.5">
                    Betreffzeile
                  </label>
                  <input
                    type="text"
                    required
                    className="w-full h-9 bg-surface-container-low border border-border-default rounded px-sm font-body-md text-xs focus:ring-2 focus:ring-focus-ring outline-none text-on-background font-semibold"
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                  />
                </div>

                <div className="flex flex-col flex-grow h-[350px]">
                  <label className="block text-[10px] font-bold text-outline uppercase tracking-wider mb-0.5">
                    Nachrichtenentwurf (Vorschlag)
                  </label>
                  <textarea
                    required
                    className="w-full flex-grow p-sm bg-surface-container-low border border-border-default rounded font-body-md text-xs focus:ring-2 focus:ring-focus-ring outline-none text-on-background resize-none leading-relaxed font-sans"
                    value={body}
                    onChange={(e) => setBody(e.target.value)}
                  />
                </div>
              </div>

              <div className="p-lg border-t border-border-default bg-surface-container-low flex justify-end gap-sm">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-lg py-2 border border-border-default text-on-surface-variant rounded text-xs font-semibold hover:bg-surface-container-low transition-colors"
                >
                  Verwerfen
                </button>
                <button
                  type="submit"
                  className="px-lg py-2 bg-primary text-on-primary rounded text-xs font-semibold hover:bg-[#1A365D] transition-colors flex items-center gap-sm cursor-pointer shadow-sm active:scale-[0.98]"
                >
                  <Send size={14} /> Entwurf senden
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
