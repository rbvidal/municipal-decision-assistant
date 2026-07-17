import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  CheckCircle, 
  AlertTriangle, 
  X, 
  Info, 
  User, 
  Mail, 
  Phone, 
  Building, 
  FileText, 
  Search, 
  ExternalLink, 
  BookOpen,
  ArrowRight,
  TrendingUp,
  Clock,
  CheckSquare,
  AlertCircle
} from 'lucide-react';

import Header from './components/Header';
import SidebarLeft from './components/SidebarLeft';
import SidebarRight from './components/SidebarRight';
import ComparisonWorkspace from './components/ComparisonWorkspace';
import Footer from './components/Footer';

import { mockCases } from './data';
import { CaseDocument, Attachment, PrecedentCase } from './types';

export default function App() {
  const [activeTab, setActiveTab] = useState('meine-arbeit');
  const [cases, setCases] = useState<CaseDocument[]>(mockCases);
  const [activeCaseId, setActiveCaseId] = useState('BAU-2026-0147');
  
  // Keep comments state separate per case ID so state isn't lost on switcher
  const [caseComments, setCaseComments] = useState<{ [caseId: string]: string }>({
    'BAU-2026-0147': '',
    'BAU-2026-0158': '',
    'BAU-2026-0099': '',
  });

  const [unreadNotifications, setUnreadNotifications] = useState(true);
  const [showNotificationCenter, setShowNotificationCenter] = useState(false);
  
  // Modal states
  const [selectedPrecedent, setSelectedPrecedent] = useState<PrecedentCase | null>(null);
  const [selectedContact, setSelectedContact] = useState<string | null>(null);
  const [infoModalContent, setInfoModalContent] = useState<{ title: string; text: string } | null>(null);

  // Search filter for knowledge base and cases table
  const [knowledgeSearchQuery, setKnowledgeSearchQuery] = useState('');
  
  // Toast Alert state
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'info' | 'error' } | null>(null);

  // Find currently active case document
  const activeCase = cases.find((c) => c.caseId === activeCaseId) || cases[0];

  const triggerToast = (message: string, type: 'success' | 'info' | 'error' = 'success') => {
    setToast({ message, type });
  };

  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => setToast(null), 4000);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  // Actions handlers
  const handleApprove = (comments: string) => {
    triggerToast(`Genehmigung für Verfahren ${activeCase.caseId} wurde erfolgreich erteilt und versandt!`, 'success');
    // Set status to approved or change feedback
    setCases((prev) => 
      prev.map((c) => c.caseId === activeCase.caseId ? { ...c, statusLabel: 'Genehmigt' } : c)
    );
  };

  const handleReject = (comments: string) => {
    triggerToast(`Verfahren ${activeCase.caseId} wurde abgelehnt. Der Versagungsbescheid wird vorbereitet.`, 'error');
    setCases((prev) => 
      prev.map((c) => c.caseId === activeCase.caseId ? { ...c, statusLabel: 'Abgelehnt' } : c)
    );
  };

  const handleRevise = (comments: string) => {
    if (!comments.trim()) {
      triggerToast('Fehler: Bitte geben Sie im Textfeld unten Korrekturwünsche ein, bevor Sie den Vorgang zurücksenden!', 'error');
      return;
    }
    triggerToast(`Verfahren ${activeCase.caseId} wurde zwecks Überarbeitung an ${activeCase.submittedBy} zurückgewiesen.`, 'info');
    setCases((prev) => 
      prev.map((c) => c.caseId === activeCase.caseId ? { ...c, statusLabel: 'Zur Revision' } : c)
    );
  };

  const handleAddAttachment = (newAttach: Attachment) => {
    setCases((prev) =>
      prev.map((c) => {
        if (c.caseId === activeCase.caseId) {
          return {
            ...c,
            attachments: [...c.attachments, newAttach],
          };
        }
        return c;
      })
    );
    triggerToast(`Anhang "${newAttach.name}" wurde dem Verfahren ${activeCase.caseId} erfolgreich hinzugefügt.`, 'success');
  };

  const handleCaseSelectFromTable = (caseId: string) => {
    setActiveCaseId(caseId);
    setActiveTab('meine-arbeit');
  };

  // Precedent detail view trigger
  const handleSelectPrecedent = (precedent: PrecedentCase) => {
    setSelectedPrecedent(precedent);
  };

  // Submitter details trigger
  const handleUserClick = (name: string) => {
    setSelectedContact(name);
  };

  // Footer / legal dialog links trigger
  const handleFooterLinkClick = (title: string) => {
    let text = '';
    switch (title) {
      case 'Impressum':
        text = 'Herausgeber: Bundesministerium für Wohnen, Stadtentwicklung und Bauwesen. Vertreten durch die Kommunale Entscheidungsplattform IT-Dienststelle Berlin. Kontakt: support@entscheidung-kommunal.de.';
        break;
      case 'Datenschutz':
        text = 'Die Verarbeitung personenbezogener Daten erfolgt streng nach DSGVO und landesrechtlichen Bestimmungen des Bauordnungsrechts. Ihre Daten werden verschlüsselt gespeichert und nur für gesetzliche Genehmigungsverfahren herangezogen.';
        break;
      case 'Barrierefreiheit':
        text = 'Diese Plattform erfüllt die Anforderungen der Barrierefreien-Informationstechnik-Verordnung (BITV 2.0) auf Basis des Standards WCAG 2.1 AA. Tastaturbedienung und Screenreader-Unterstützung sind vollständig aktiv.';
        break;
      case 'Kontakt':
        text = 'Technischer Support: support@entscheidung-kommunal.de | Hotline: +49 (0) 30 18123-4567 (Mo-Fr 08:00 - 16:00 Uhr).';
        break;
      default:
        text = 'Informationen zur Kommunalen Entscheidungsplattform.';
    }
    setInfoModalContent({ title, text });
  };

  return (
    <div className="flex flex-col h-screen overflow-hidden bg-background">
      
      {/* Header component */}
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        unreadNotifications={unreadNotifications}
        setUnreadNotifications={setUnreadNotifications}
        onNotificationClick={() => {
          setShowNotificationCenter(!showNotificationCenter);
          setUnreadNotifications(false);
        }}
      />

      {/* Main container with animation context */}
      <main className="flex flex-1 overflow-hidden relative">
        
        {/* Unread notification dropdown center */}
        <AnimatePresence>
          {showNotificationCenter && (
            <>
              <div 
                className="fixed inset-0 z-45"
                onClick={() => setShowNotificationCenter(false)}
              ></div>
              <motion.div 
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.15 }}
                className="absolute right-8 top-2 w-80 bg-white border border-border-default rounded-xl shadow-xl z-50 p-4"
              >
                <div className="flex justify-between items-center border-b border-border-default pb-2 mb-2">
                  <h4 className="font-bold text-body-md text-text-primary">Mitteilungszentrale</h4>
                  <button 
                    onClick={() => setShowNotificationCenter(false)}
                    className="p-1 rounded-full hover:bg-surface-container transition-colors cursor-pointer text-on-surface-variant"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
                <div className="space-y-3">
                  <div className="flex gap-2.5 items-start p-2 rounded-lg bg-primary/5 border border-primary/10">
                    <CheckCircle className="w-4 h-4 text-status-success mt-0.5 shrink-0" />
                    <div className="space-y-0.5">
                      <p className="text-xs font-bold text-text-primary">Prüfung Abgeschlossen</p>
                      <p className="text-[11px] text-on-surface-variant">
                        Das Umweltamt hat die fachliche Stellungnahme für BAU-2026-0147 übermittelt.
                      </p>
                      <span className="text-[9px] text-text-secondary">Vor 15 Min</span>
                    </div>
                  </div>
                  <div className="flex gap-2.5 items-start p-2 rounded-lg hover:bg-surface-container-low">
                    <Info className="w-4 h-4 text-primary mt-0.5 shrink-0" />
                    <div className="space-y-0.5">
                      <p className="text-xs font-bold text-text-primary">Neuer Entwurf hochgeladen</p>
                      <p className="text-[11px] text-on-surface-variant">
                        Sabine Müller hat den Entwurf v2.1 freigegeben.
                      </p>
                      <span className="text-[9px] text-text-secondary">Heute, 09:42 Uhr</span>
                    </div>
                  </div>
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>

        {/* Tab view switching */}
        {activeTab === 'meine-arbeit' ? (
          <div className="flex flex-1 overflow-hidden w-full">
            {/* LEFT SIDEBAR: Case Metadata */}
            <SidebarLeft
              activeCase={activeCase}
              onAddAttachment={handleAddAttachment}
              onUserClick={handleUserClick}
            />

            {/* CENTER CONTENT: Comparison View / Workspace */}
            <ComparisonWorkspace
              activeCase={activeCase}
              cases={cases}
              onSelectCase={setActiveCaseId}
              onApprove={handleApprove}
              onReject={handleReject}
              onRevise={handleRevise}
              comments={caseComments[activeCase.caseId]}
              setComments={(text) => 
                setCaseComments((prev) => ({ ...prev, [activeCase.caseId]: text }))
              }
            />

            {/* RIGHT SIDEBAR: Decision Support / AI */}
            <SidebarRight
              activeCase={activeCase}
              onSelectPrecedent={handleSelectPrecedent}
            />
          </div>
        ) : activeTab === 'startseite' ? (
          /* STARTSEITE VIEW */
          <div className="flex-1 overflow-y-auto p-10 max-w-7xl mx-auto space-y-8 w-full">
            <div className="space-y-2">
              <span className="text-caption font-bold text-primary uppercase tracking-wider">Dashboard</span>
              <h2 className="text-headline-lg font-bold text-text-primary">Willkommen im Supervisor Workspace</h2>
              <p className="text-body-md text-text-secondary max-w-3xl">
                Hier ist die Übersicht Ihrer aktuellen Bauanträge und Freigabeverfahren. Wählen Sie ein Dokument aus der Liste aus, um die automatische Verifikation und den Entscheidungsentwurf direkt zu vergleichen.
              </p>
            </div>

            {/* Core Metrics Bento Grid */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="bg-white border border-border-default p-5 rounded-xl shadow-xs">
                <div className="flex justify-between items-start mb-2">
                  <span className="text-caption font-bold text-text-secondary uppercase">Offene Anträge</span>
                  <span className="p-1 rounded bg-primary/10 text-primary"><Building className="w-4 h-4" /></span>
                </div>
                <div className="text-stat text-text-primary">3</div>
                <p className="text-caption text-text-secondary mt-1">Zur Freigabe ausstehend</p>
              </div>

              <div className="bg-white border border-border-default p-5 rounded-xl shadow-xs">
                <div className="flex justify-between items-start mb-2">
                  <span className="text-caption font-bold text-text-secondary uppercase">Durchschnittliche Bearbeitungszeit</span>
                  <span className="p-1 rounded bg-status-dot-green/10 text-status-success"><Clock className="w-4 h-4" /></span>
                </div>
                <div className="text-stat text-text-primary">62 Tage</div>
                <p className="text-caption text-text-secondary mt-1">Sollwert-Frist: max. 90 Tage</p>
              </div>

              <div className="bg-white border border-border-default p-5 rounded-xl shadow-xs">
                <div className="flex justify-between items-start mb-2">
                  <span className="text-caption font-bold text-text-secondary uppercase">Erfolgsquote Verifikation</span>
                  <span className="p-1 rounded bg-status-dot-amber/10 text-status-warning"><CheckSquare className="w-4 h-4" /></span>
                </div>
                <div className="text-stat text-text-primary">100%</div>
                <p className="text-caption text-text-secondary mt-1">Konsistenz im Text-Metadaten Abgleich</p>
              </div>

              <div className="bg-white border border-border-default p-5 rounded-xl shadow-xs">
                <div className="flex justify-between items-start mb-2">
                  <span className="text-caption font-bold text-text-secondary uppercase">Entwicklungs-Tendenz</span>
                  <span className="p-1 rounded bg-primary-fixed text-primary"><TrendingUp className="w-4 h-4" /></span>
                </div>
                <div className="text-stat text-text-primary">+12%</div>
                <p className="text-caption text-text-secondary mt-1">Zuwachs ggü. Vorjahr</p>
              </div>
            </div>

            {/* Master Table of active Case Documents */}
            <div className="bg-white border border-border-default rounded-xl overflow-hidden shadow-xs">
              <div className="px-6 py-4 border-b border-border-default flex justify-between items-center">
                <h3 className="text-headline-sm font-bold text-text-primary">Aktive Bauantragsverfahren zur Prüfung</h3>
                <span className="text-caption text-text-secondary font-medium">3 verbleibende Verfahren</span>
              </div>
              
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-surface-container-low border-b border-border-default text-caption text-on-surface-variant font-bold uppercase tracking-wider">
                      <th className="px-6 py-3">Verfahrens-ID</th>
                      <th className="px-6 py-3">Bauvorhaben / Bezeichnung</th>
                      <th className="px-6 py-3">Eingereicht von</th>
                      <th className="px-6 py-3">Eingereicht am</th>
                      <th className="px-6 py-3">Risiko</th>
                      <th className="px-6 py-3 text-right">Aktion</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border-default text-body-md text-text-primary">
                    {cases.map((c) => {
                      const isSelected = c.caseId === activeCaseId;
                      return (
                        <tr 
                          key={c.caseId} 
                          className={`hover:bg-surface-container-low transition-colors cursor-pointer ${
                            isSelected ? 'bg-primary/5' : ''
                          }`}
                          onClick={() => handleCaseSelectFromTable(c.caseId)}
                        >
                          <td className="px-6 py-4 font-mono text-xs font-bold text-primary">{c.caseId}</td>
                          <td className="px-6 py-4">
                            <div className="font-semibold text-text-primary">{c.title}</div>
                            <div className="text-caption text-text-secondary">{c.statusLabel} ({c.draftVersion})</div>
                          </td>
                          <td className="px-6 py-4 text-text-secondary font-medium">{c.submittedBy}</td>
                          <td className="px-6 py-4 text-text-secondary">{c.submittedAt}</td>
                          <td className="px-6 py-4">
                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                              c.riskRating === 'HOCH' 
                                ? 'text-status-error bg-error/10' 
                                : c.riskRating === 'MITTEL' 
                                ? 'text-status-warning bg-status-warning/10' 
                                : 'text-status-success bg-status-success/10'
                            }`}>
                              {c.riskRating}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-right">
                            <button className="text-primary hover:text-on-primary-fixed-variant text-caption font-semibold flex items-center gap-1 justify-end ml-auto group">
                              Öffnen
                              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        ) : activeTab === 'wissen' ? (
          /* WISSEN (KNOWLEDGE BASE) VIEW */
          <div className="flex-1 overflow-y-auto p-10 max-w-5xl mx-auto space-y-8 w-full">
            <div className="space-y-2">
              <span className="text-caption font-bold text-primary uppercase tracking-wider">Wissensdatenbank</span>
              <h2 className="text-headline-lg font-bold text-text-primary">Baugesetzgebung &amp; Richtlinien</h2>
              <p className="text-body-md text-text-secondary">
                Schnellzugriff auf relevante Auszüge des Baugesetzbuchs (BauGB), der Landesbauordnungen (BauO) und regionaler Gestaltungspläne zur qualitativen Entscheidungsfindung.
              </p>
            </div>

            {/* Search Box */}
            <div className="relative w-full max-w-xl">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-surface-dim" />
              <input
                type="text"
                value={knowledgeSearchQuery}
                onChange={(e) => setKnowledgeSearchQuery(e.target.value)}
                placeholder="Gesetzestext, Richtlinie oder Paragraph suchen (z.B. § 34 BauGB, Dachbegrünung)..."
                className="w-full border border-border-default rounded-xl pl-10 pr-4 py-3 text-body-md bg-white shadow-xs focus:ring-2 focus:ring-primary focus:outline-none placeholder:text-surface-dim"
              />
            </div>

            {/* Knowledge Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {[
                {
                  code: '§ 34 BauGB',
                  category: 'Baugesetzbuch',
                  title: 'Zulässigkeit von Vorhaben innerhalb der bebauten Ortsteile',
                  text: 'Ein Vorhaben ist zulässig, wenn es sich nach Art und Maß der baulichen Nutzung, der Bauweise und der Grundstücksfläche, die überbaut werden soll, in die Eigenart der näheren Umgebung einfügt.',
                },
                {
                  code: '§ 12 BauO NRW',
                  category: 'Landesbauordnung',
                  title: 'Stellplatzverpflichtung & Ablösevereinbarungen',
                  text: 'Soweit Stellplätze für Kraftfahrzeuge nicht auf dem Baugrundstück oder in ausreichender Nähe hergestellt werden können, kann die Bauaufsichtsbehörde den Nachweis durch Ablösezahlungen gestatten.',
                },
                {
                  code: 'Bebauungsplan Nr. 45',
                  category: 'Regionale Vorgaben',
                  title: 'Entwicklungsgebiet "Stadtpark West"',
                  text: 'Festgesetztes Mischgebiet. Flachdachbauten sind zwingend mit extensiver Dachbegrünung auszuführen. Einhalten des Schallschutzgutachtens vom 01.09.2024 ist zwingende Genehmigungsvoraussetzung.',
                },
                {
                  code: 'DIN 14090',
                  category: 'Brandschutz-Verordnung',
                  title: 'Flächen für die Feuerwehr auf Grundstücken',
                  text: 'Zufahrten, Durchfahrten, Aufstellflächen und Bewegungsflächen für Hubrettungsfahrzeuge müssen dauerhaft tragfähig für Achslasten bis 10t und Gesamtgewicht bis 16t ausgelegt sein.',
                },
              ]
                .filter(
                  (item) =>
                    item.code.toLowerCase().includes(knowledgeSearchQuery.toLowerCase()) ||
                    item.title.toLowerCase().includes(knowledgeSearchQuery.toLowerCase()) ||
                    item.text.toLowerCase().includes(knowledgeSearchQuery.toLowerCase())
                )
                .map((item) => (
                  <div key={item.code} className="bg-white border border-border-default rounded-xl p-5 shadow-xs flex flex-col justify-between">
                    <div>
                      <div className="flex justify-between items-start mb-2">
                        <span className="text-caption font-bold text-primary font-mono bg-primary/5 px-2 py-0.5 rounded">
                          {item.code}
                        </span>
                        <span className="text-[11px] text-text-secondary uppercase tracking-wider">
                          {item.category}
                        </span>
                      </div>
                      <h4 className="text-body-md font-bold text-text-primary mb-2">
                        {item.title}
                      </h4>
                      <p className="text-caption text-on-surface-variant leading-relaxed mb-4">
                        {item.text}
                      </p>
                    </div>
                    <button 
                      onClick={() => triggerToast(`Auszug für ${item.code} in die Zwischenablage kopiert!`, 'info')}
                      className="text-primary hover:text-on-primary-fixed-variant text-caption font-bold flex items-center gap-1 group mt-auto cursor-pointer"
                    >
                      Auszug kopieren
                      <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                    </button>
                  </div>
                ))}
            </div>
          </div>
        ) : (
          /* DOKUMENTE (DOCK LIBRARY) VIEW */
          <div className="flex-1 overflow-y-auto p-10 max-w-4xl mx-auto space-y-8 w-full">
            <div className="space-y-2">
              <span className="text-caption font-bold text-primary uppercase tracking-wider">Dokumentenarchiv</span>
              <h2 className="text-headline-lg font-bold text-text-primary">Regionale Standardformulare &amp; Vorlagen</h2>
              <p className="text-body-md text-text-secondary">
                Laden Sie rechtssichere Bescheidvorlagen, behördliche Formulare und Prüfchecklisten für die Genehmigungsverfahren direkt herunter.
              </p>
            </div>

            <div className="bg-white border border-border-default rounded-xl overflow-hidden shadow-xs divide-y divide-border-default">
              {[
                { title: 'Standardbescheid Baugenehmigung NRW 2024', format: 'PDF', size: '1.2 MB' },
                { title: 'Merkblatt Ablösevereinbarungen Stellplatzpflicht', format: 'PDF', size: '840 KB' },
                { title: 'Checkliste Formelle Vorprüfung § 34 BauGB', format: 'DOCX', size: '450 KB' },
                { title: 'Musterbescheid Ablehnung / Brandschutzmängel', format: 'PDF', size: '2.1 MB' },
                { title: 'Richtlinie Extensivbegrünung Dachflächen', format: 'PDF', size: '3.4 MB' },
              ].map((doc, idx) => (
                <div key={idx} className="p-4 flex justify-between items-center hover:bg-surface-container-low transition-colors">
                  <div className="flex items-center gap-3">
                    <FileText className="w-5 h-5 text-on-surface-variant shrink-0" />
                    <div>
                      <h4 className="text-body-md font-bold text-text-primary">{doc.title}</h4>
                      <p className="text-caption text-text-secondary">{doc.format} • {doc.size}</p>
                    </div>
                  </div>
                  <button 
                    onClick={() => triggerToast(`Lade "${doc.title}" herunter...`, 'success')}
                    className="p-2 hover:bg-white rounded-lg border border-transparent hover:border-border-default transition-all text-on-surface-variant hover:text-primary cursor-pointer"
                  >
                    <Mail className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>

      {/* Footer Component */}
      <Footer onLinkClick={handleFooterLinkClick} />

      {/* Dynamic Toast Alert Notification */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="fixed bottom-16 right-8 z-50 flex items-center gap-3 px-4 py-3 rounded-xl shadow-xl border bg-white max-w-md"
            style={{
              borderColor: 
                toast.type === 'error' 
                  ? '#ba1a1a' 
                  : toast.type === 'info' 
                  ? '#005394' 
                  : '#276749'
            }}
          >
            {toast.type === 'error' && <AlertTriangle className="w-5 h-5 text-error shrink-0" />}
            {toast.type === 'info' && <Info className="w-5 h-5 text-primary shrink-0" />}
            {toast.type === 'success' && <CheckCircle className="w-5 h-5 text-status-success shrink-0" />}
            
            <span className="text-body-md font-semibold text-text-primary leading-tight">
              {toast.message}
            </span>

            <button 
              onClick={() => setToast(null)}
              className="p-1 rounded-full hover:bg-surface-container-low transition-colors cursor-pointer text-text-secondary shrink-0"
            >
              <X className="w-4 h-4" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* MODAL 1: Precedent Case Detail Popover */}
      <AnimatePresence>
        {selectedPrecedent && (
          <div className="fixed inset-0 bg-black/40 flex justify-center items-center z-50 p-4">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white border border-border-default rounded-xl shadow-xl w-full max-w-xl overflow-hidden"
            >
              <div className="bg-surface-container-low px-6 py-4 border-b border-border-default flex justify-between items-center">
                <div className="space-y-0.5">
                  <span className="font-mono text-xs font-bold text-primary bg-primary/5 px-2 py-0.5 rounded">
                    Prezedenzfall {selectedPrecedent.caseId}
                  </span>
                  <span className="text-[11px] text-text-secondary ml-3">{selectedPrecedent.date}</span>
                </div>
                <button 
                  onClick={() => setSelectedPrecedent(null)}
                  className="p-1 rounded-full hover:bg-surface-container transition-colors cursor-pointer text-on-surface-variant"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="p-6 space-y-4">
                <div>
                  <h3 className="text-headline-sm font-bold text-text-primary mb-1">
                    {selectedPrecedent.title}
                  </h3>
                  <p className="text-body-md text-on-surface-variant leading-relaxed">
                    {selectedPrecedent.description}
                  </p>
                </div>

                <div className="bg-primary/5 rounded-lg border border-primary/10 p-4">
                  <h4 className="text-caption font-bold text-primary mb-1 uppercase tracking-wider">
                    Anwendbarkeit auf das Verfahren
                  </h4>
                  <p className="text-caption text-text-primary italic leading-relaxed">
                    "Dieses abgeschlossene Verfahren dient als rechtssicherer Referenzfall. Die hierin getroffenen Auflagen zur Stellplatzablösung und Dachbegrünung können identisch für {activeCase.caseId} herangezogen werden."
                  </p>
                </div>
              </div>

              <div className="bg-surface-container-low px-6 py-3 border-t border-border-default flex justify-end">
                <button 
                  onClick={() => setSelectedPrecedent(null)}
                  className="px-4 py-1.5 bg-primary text-white text-body-md font-semibold rounded hover:bg-on-primary-fixed-variant transition-colors cursor-pointer"
                >
                  Schließen
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* MODAL 2: User Contact Detail popover */}
      <AnimatePresence>
        {selectedContact && (
          <div className="fixed inset-0 bg-black/40 flex justify-center items-center z-50 p-4">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white border border-border-default rounded-xl shadow-xl w-full max-w-sm overflow-hidden"
            >
              <div className="bg-primary px-6 py-5 text-white flex flex-col items-center relative">
                <button 
                  onClick={() => setSelectedContact(null)}
                  className="absolute right-4 top-4 p-1 rounded-full bg-white/10 hover:bg-white/20 transition-colors cursor-pointer text-white"
                >
                  <X className="w-4 h-4" />
                </button>
                <div className="w-16 h-16 rounded-full bg-white/20 border-2 border-white flex items-center justify-center mb-2">
                  <User className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-headline-sm font-bold text-center leading-tight">
                  {selectedContact}
                </h3>
                <span className="text-xs text-white/85 bg-white/10 px-2 py-0.5 rounded-full mt-1 font-medium">
                  Baubehörde - Sachbearbeiterin
                </span>
              </div>

              <div className="p-6 space-y-4 text-body-md text-text-primary">
                <div className="flex gap-3 items-center">
                  <Building className="w-5 h-5 text-on-surface-variant" />
                  <div>
                    <p className="text-[11px] text-text-secondary uppercase tracking-wider">Abteilung</p>
                    <p className="font-semibold text-text-primary">Referat II A - Bauaufsicht</p>
                  </div>
                </div>

                <div className="flex gap-3 items-center">
                  <Mail className="w-5 h-5 text-on-surface-variant" />
                  <div>
                    <p className="text-[11px] text-text-secondary uppercase tracking-wider">Email-Adresse</p>
                    <a href={`mailto:s.mueller@bauaufsicht-amt.de`} className="font-semibold text-primary underline">
                      s.mueller@bauaufsicht-amt.de
                    </a>
                  </div>
                </div>

                <div className="flex gap-3 items-center">
                  <Phone className="w-5 h-5 text-on-surface-variant" />
                  <div>
                    <p className="text-[11px] text-text-secondary uppercase tracking-wider">Telefonnummer</p>
                    <p className="font-semibold text-text-primary">+49 (0) 30 18123-9482</p>
                  </div>
                </div>
              </div>

              <div className="bg-surface-container-low px-6 py-3 border-t border-border-default flex justify-end gap-2">
                <a
                  href={`mailto:s.mueller@bauaufsicht-amt.de?subject=Nachfrage zu Verfahren ${activeCase.caseId}`}
                  className="px-4 py-1.5 bg-primary text-white text-body-md font-semibold rounded hover:bg-on-primary-fixed-variant transition-colors cursor-pointer text-center"
                >
                  Nachricht Senden
                </a>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* MODAL 3: Legal & Information Center popup */}
      <AnimatePresence>
        {infoModalContent && (
          <div className="fixed inset-0 bg-black/40 flex justify-center items-center z-50 p-4">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white border border-border-default rounded-xl shadow-xl w-full max-w-md overflow-hidden"
            >
              <div className="px-6 py-4 border-b border-border-default flex justify-between items-center bg-surface-container-low">
                <h3 className="text-body-md font-bold text-text-primary flex items-center gap-2">
                  <Info className="w-4 h-4 text-primary" />
                  {infoModalContent.title}
                </h3>
                <button 
                  onClick={() => setInfoModalContent(null)}
                  className="p-1 rounded-full hover:bg-surface-container transition-colors cursor-pointer text-on-surface-variant"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="p-6 text-body-md leading-relaxed text-on-surface-variant">
                {infoModalContent.text}
              </div>
              <div className="px-6 py-3 border-t border-border-default flex justify-end bg-surface-container-low">
                <button 
                  onClick={() => setInfoModalContent(null)}
                  className="px-4 py-1.5 bg-primary text-white text-body-md font-semibold rounded hover:bg-on-primary-fixed-variant transition-colors cursor-pointer"
                >
                  Verstanden
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
