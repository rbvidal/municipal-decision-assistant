/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Header } from './components/Header';
import { Sidebar } from './components/Sidebar';
import { KnowledgeTable } from './components/KnowledgeTable';
import { StatusSidebar } from './components/StatusSidebar';
import { UploadModal } from './components/UploadModal';
import { DetailDrawer } from './components/DetailDrawer';
import { OverviewDashboard } from './components/OverviewDashboard';
import { UsersView } from './components/UsersView';
import { BackgroundJobsView } from './components/BackgroundJobsView';
import { AuditLogsView } from './components/AuditLogsView';

import { Wissenspaket, QdrantMetrics, AppNotification } from './types';
import { INITIAL_WISSENSPAKETE, INITIAL_METRICS, INITIAL_NOTIFICATIONS } from './data';

export default function App() {
  // Sidebar view state: 'dashboard' | 'analysen' | 'korpus' | 'protokolle' | 'einstellungen'
  const [activeSidebarView, setActiveSidebarView] = useState('korpus');
  
  // Tab state within 'korpus' view: 'Übersicht' | 'Benutzer' | 'Korpus' | 'Hintergrundjobs' | 'Benchmarks' | 'Audit'
  const [activeSubTab, setActiveSubTab] = useState('Korpus');

  // Core municipal database states
  const [packages, setPackages] = useState<Wissenspaket[]>(INITIAL_WISSENSPAKETE);
  const [metrics, setMetrics] = useState<QdrantMetrics>(INITIAL_METRICS);
  const [notifications, setNotifications] = useState<AppNotification[]>(INITIAL_NOTIFICATIONS);

  // Interaction controls
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [selectedDetailPackage, setSelectedDetailPackage] = useState<Wissenspaket | null>(null);
  const [isSyncing, setIsSyncing] = useState(false);

  // Semantic query simulation state for 'Analysen' section
  const [semanticQuery, setSemanticQuery] = useState('');
  const [semanticResults, setSemanticResults] = useState<Array<{
    title: string;
    text: string;
    score: number;
    source: string;
  }>>([]);
  const [isSearching, setIsSearching] = useState(false);

  // Settings states
  const [vectorDistance, setVectorDistance] = useState('Cosine');
  const [hnswM, setHnswM] = useState(16);
  const [efConstruct, setEfConstruct] = useState(128);

  // Benchmark query simulation
  const [benchmarkQueryCount, setBenchmarkQueryCount] = useState(100);
  const [benchmarkResult, setBenchmarkResult] = useState<{
    throughput: number;
    avgLatency: number;
    p95Latency: number;
    accuracy: number;
  } | null>(null);
  const [isBenchmarking, setIsBenchmarking] = useState(false);

  // ----------------------------------------------------
  // HANDLERS & ACTIONS
  // ----------------------------------------------------

  const handleMarkAllNotificationsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, unread: false })));
  };

  const handleClearNotification = (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  const handleSyncAll = () => {
    if (isSyncing) return;
    setIsSyncing(true);

    // Create a sync pending notification
    const startNotification: AppNotification = {
      id: `sync-${Date.now()}`,
      title: 'Synchronisation gestartet',
      message: 'Der Abgleich aller Wissenspakete mit der Vektordatenbank wurde initiiert.',
      time: 'Gerade eben',
      unread: true
    };
    setNotifications(prev => [startNotification, ...prev]);

    setTimeout(() => {
      // Complete sync simulation
      setPackages(prev =>
        prev.map(p => {
          if (p.status === 'Indiziert...') {
            return {
              ...p,
              status: 'Bereit',
              lastSync: 'Gerade eben'
            };
          }
          if (p.status === 'Bereit') {
            return {
              ...p,
              lastSync: 'Gerade eben',
              chunks: p.chunks + Math.floor(Math.random() * 50)
            };
          }
          return p;
        })
      );

      setMetrics(prev => ({
        ...prev,
        cpuUsagePercent: 24.2,
        latencyP95: 11.8,
        indexSizeGB: +(prev.indexSizeGB + 0.12).toFixed(2),
        vectorsGB: +(prev.vectorsGB + 0.08).toFixed(2),
        metadataGB: +(prev.metadataGB + 0.04).toFixed(2)
      }));

      const completeNotification: AppNotification = {
        id: `sync-end-${Date.now()}`,
        title: 'Datenbank synchronisiert',
        message: 'Alle aktiven Wissenspakete wurden erfolgreich neu indiziert und geladen.',
        time: 'Gerade eben',
        unread: true
      };
      setNotifications(prev => [completeNotification, ...prev]);
      setIsSyncing(false);
    }, 2000);
  };

  const handleVerifyPackage = (id: string) => {
    setPackages(prev =>
      prev.map(p => {
        if (p.id === id) {
          return {
            ...p,
            status: 'Bereit',
            lastSync: 'Gerade eben',
            chunks: p.chunks + 5 // simulated small optimization
          };
        }
        return p;
      })
    );
    
    // Add success notification
    const verifyNotif: AppNotification = {
      id: `verify-${Date.now()}`,
      title: 'Verifizierung abgeschlossen',
      message: `Das Paket ID ${id} wurde erfolgreich mathematisch verifiziert.`,
      time: 'Gerade eben',
      unread: true
    };
    setNotifications(prev => [verifyNotif, ...prev]);
  };

  const handleUpdatePackage = (id: string) => {
    setPackages(prev =>
      prev.map(p => {
        if (p.id === id) {
          const nextStatus = p.status === 'Indiziert...' ? 'Bereit' : 'Indiziert...';
          return {
            ...p,
            status: nextStatus,
            lastSync: 'Vor 1 Min.'
          };
        }
        return p;
      })
    );
  };

  const handleDeletePackage = (id: string) => {
    const deletedPkg = packages.find(p => p.id === id);
    setPackages(prev => prev.filter(p => p.id !== id));
    
    if (deletedPkg) {
      const deleteNotif: AppNotification = {
        id: `delete-${Date.now()}`,
        title: 'Paket gelöscht',
        message: `Das Wissenspaket "${deletedPkg.name}" wurde aus der Datenbank entfernt.`,
        time: 'Gerade eben',
        unread: true
      };
      setNotifications(prev => [deleteNotif, ...prev]);
    }
  };

  const handleUploadComplete = (newPkg: Wissenspaket) => {
    setPackages(prev => [newPkg, ...prev]);
    setMetrics(prev => ({
      ...prev,
      indexSizeGB: +(prev.indexSizeGB + 0.15).toFixed(2),
      vectorsGB: +(prev.vectorsGB + 0.11).toFixed(2)
    }));

    const uploadNotif: AppNotification = {
      id: `upload-${Date.now()}`,
      title: 'Neues Paket indiziert',
      message: `"${newPkg.name}" (${newPkg.version}) wurde erfolgreich mit ${newPkg.chunks} Vektoren indiziert.`,
      time: 'Gerade eben',
      unread: true
    };
    setNotifications(prev => [uploadNotif, ...prev]);
  };

  // ----------------------------------------------------
  // SEMANTIC SANDBOX SIMULATION (Analysen view)
  // ----------------------------------------------------
  const handleSemanticSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!semanticQuery.trim()) return;

    setIsSearching(true);
    setSemanticResults([]);

    setTimeout(() => {
      const mockDatabaseChunks = [
        {
          title: 'Bauordnung NRW 2024 - § 3 (Prävention)',
          text: 'Anlagen sind so anzuordnen, zu errichten, zu ändern und instand zu halten, dass die öffentliche Sicherheit und Ordnung, insbesondere Leben, Gesundheit und die natürlichen Lebensgrundlagen, nicht gefährdet werden. Abstandsflächen müssen eingehalten werden.',
          score: 0.9412,
          source: 'Bauordnung NRW 2024'
        },
        {
          title: 'Kommunalrecht BW - § 4 Gemeindeordnung',
          text: 'Die Gemeinden regeln ihre Angelegenheiten durch Satzung, soweit Gesetze nicht anderes bestimmen. Satzungen bedürfen der Genehmigung der Rechtsaufsichtsbehörde, wenn dies gesetzlich vorgeschrieben ist. Sie sind öffentlich bekanntzugeben.',
          score: 0.8875,
          source: 'Kommunalrecht BW'
        },
        {
          title: 'Vergaberecht Bund - § 97 GWB (Grundsätze)',
          text: 'Mittelständische Interessen sind bei der Vergabe von öffentlichen Aufträgen vorrangig zu berücksichtigen. Aufträge sind in der Regel in Fachlose und Teillose aufzuteilen, um den fairen Wettbewerb kommunaler und regionaler Akteure abzusichern.',
          score: 0.8241,
          source: 'Vergaberecht Bund'
        },
        {
          title: 'LHO Grundwerk - § 7 Wirtschaftlichkeit',
          text: 'Bei Aufstellung und Ausführung des Haushaltsplans sind die Grundsätze der Wirtschaftlichkeit und Sparsamkeit zu beachten. Dies gilt auch für alle städtischen oder kommunalen Sondervermögen und Eigenbetriebe im Kreisgebiet.',
          score: 0.7654,
          source: 'LHO Grundwerk'
        }
      ];

      // Filter or sort results slightly based on words to make it look responsive
      const queryLower = semanticQuery.toLowerCase();
      const results = mockDatabaseChunks.map(chunk => {
        // Boost score slightly if keyword matches
        let finalScore = chunk.score;
        if (queryLower.includes('bau') || queryLower.includes('abstand')) {
          if (chunk.source.includes('Bauordnung')) finalScore = 0.9852;
        }
        if (queryLower.includes('haushalt') || queryLower.includes('geld')) {
          if (chunk.source.includes('LHO')) finalScore = 0.9610;
        }
        if (queryLower.includes('vergabe') || queryLower.includes('wettbewerb')) {
          if (chunk.source.includes('Vergaberecht')) finalScore = 0.9734;
        }
        return { ...chunk, score: finalScore };
      }).sort((a, b) => b.score - a.score);

      setSemanticResults(results);
      setIsSearching(false);
    }, 800);
  };

  // ----------------------------------------------------
  // BENCHMARK SIMULATION (Benchmarks Sub-Tab)
  // ----------------------------------------------------
  const handleRunBenchmark = () => {
    setIsBenchmarking(true);
    setBenchmarkResult(null);

    setTimeout(() => {
      // Simulate performance outcome based on query count
      const latencyMultiplier = vectorDistance === 'Cosine' ? 1.0 : 0.85;
      const baseLatency = 4.2;
      
      setBenchmarkResult({
        throughput: Math.floor((benchmarkQueryCount / (baseLatency * latencyMultiplier)) * 100),
        avgLatency: +(baseLatency * latencyMultiplier).toFixed(2),
        p95Latency: +((baseLatency * 2.4) * latencyMultiplier).toFixed(2),
        accuracy: vectorDistance === 'Cosine' ? 99.4 : 97.8
      });
      setIsBenchmarking(false);
    }, 1200);
  };

  return (
    <div className="bg-surface-background text-on-surface font-sans min-h-screen flex flex-col antialiased">
      
      {/* HEADER WIDGET */}
      <Header
        notifications={notifications}
        onMarkAllRead={handleMarkAllNotificationsRead}
        onClearNotification={handleClearNotification}
      />

      {/* DUAL COLUMN SYSTEM SIDEBAR + CONTENT */}
      <div className="flex flex-1 max-w-max-width mx-auto w-full">
        
        {/* SIDE NAV BAR */}
        <Sidebar
          activeView={activeSidebarView}
          onViewChange={(view) => {
            setActiveSidebarView(view);
            // Default sub-tab when returning to Korpus
            if (view === 'korpus') setActiveSubTab('Korpus');
          }}
          onNewTransaction={() => {
            setShowUploadModal(true);
          }}
        />

        {/* MAIN BODY AREA */}
        <main className="flex-1 min-w-0 p-huge flex flex-col gap-lg">
          
          {/* Breadcrumbs */}
          <nav className="flex items-center gap-xs text-caption font-medium text-on-surface-variant select-none">
            <span className="hover:underline cursor-pointer" onClick={() => setActiveSidebarView('korpus')}>Startseite</span>
            <span className="material-symbols-outlined text-[14px]">chevron_right</span>
            <span className="hover:underline cursor-pointer" onClick={() => setActiveSidebarView('korpus')}>Verwaltung</span>
            <span className="material-symbols-outlined text-[14px]">chevron_right</span>
            <span className="text-primary font-semibold capitalize">
              {activeSidebarView === 'korpus' ? `Korpus / ${activeSubTab}` : activeSidebarView}
            </span>
          </nav>

          {/* SIDEBAR VIEW ROUTER */}
          {activeSidebarView === 'korpus' && (
            <>
              {/* Primary Headings */}
              <div className="flex flex-col sm:flex-row justify-between sm:items-end gap-md select-none">
                <div className="space-y-1">
                  <h1 className="text-h1 font-bold text-on-surface tracking-tight">Korpus & Wissenspakete</h1>
                  <p className="text-body-base text-on-surface-variant max-w-xl">
                    Zentrale Verwaltung der semantischen Wissensbasis und Vektordatenbank für KI-gestützten Entscheidungs-Support.
                  </p>
                </div>
                
                {/* Visual Action buttons */}
                <div className="flex gap-sm shrink-0">
                  <button
                    onClick={handleSyncAll}
                    disabled={isSyncing}
                    className={`px-lg py-sm border border-border-standard text-primary font-semibold rounded-lg transition-all flex items-center gap-sm cursor-pointer hover:bg-surface-muted active:scale-95 text-caption ${
                      isSyncing ? 'opacity-50 cursor-not-allowed' : ''
                    }`}
                    id="btn-sync-all"
                  >
                    <span className={`material-symbols-outlined text-[18px] ${isSyncing ? 'animate-spin' : ''}`}>sync</span>
                    {isSyncing ? 'Synchronisiere...' : 'Alles synchronisieren'}
                  </button>
                  <button
                    onClick={() => setShowUploadModal(true)}
                    className="px-lg py-sm bg-primary text-white font-semibold rounded-lg hover:bg-primary/90 transition-all flex items-center gap-sm cursor-pointer shadow-sm active:scale-95 text-caption"
                    id="btn-upload-paket"
                  >
                    <span className="material-symbols-outlined text-[18px]">upload_file</span>
                    Paket hochladen
                  </button>
                </div>
              </div>

              {/* Sub-Nav Header Tabs */}
              <div className="flex border-b border-border-standard overflow-x-auto select-none gap-xs scrollbar-none">
                {['Übersicht', 'Benutzer', 'Korpus', 'Hintergrundjobs', 'Benchmarks', 'Audit'].map((tab) => {
                  const isActive = activeSubTab === tab;
                  return (
                    <button
                      key={tab}
                      onClick={() => setActiveSubTab(tab)}
                      className={`px-xl py-md text-caption font-semibold transition-all border-b-2 cursor-pointer whitespace-nowrap ${
                        isActive
                          ? 'text-primary border-primary font-bold'
                          : 'text-on-surface-variant border-transparent hover:text-primary hover:border-border-standard'
                      }`}
                    >
                      {tab}
                    </button>
                  );
                })}
              </div>

              {/* SUB TAB VIEW ROUTER */}
              {activeSubTab === 'Übersicht' && (
                <OverviewDashboard
                  packages={packages}
                  onNavigateToTab={(tab) => setActiveSubTab(tab)}
                  onOpenUpload={() => setShowUploadModal(true)}
                />
              )}

              {activeSubTab === 'Benutzer' && (
                <UsersView />
              )}

              {activeSubTab === 'Korpus' && (
                <div className="grid grid-cols-12 gap-lg">
                  {/* Grid Main Left Table */}
                  <div className="col-span-12 xl:col-span-9 flex flex-col gap-lg">
                    <KnowledgeTable
                      packages={packages}
                      onVerify={handleVerifyPackage}
                      onUpdate={handleUpdatePackage}
                      onDelete={handleDeletePackage}
                      onSelectDetails={(pkg) => setSelectedDetailPackage(pkg)}
                    />
                  </div>

                  {/* Grid Right Sidebar Widgets */}
                  <StatusSidebar
                    metrics={metrics}
                    isSyncing={isSyncing}
                    onOpenManagement={() => {
                      alert('Speicher-Verschlüsselung & Volumes entsprechen ISO 27001 Richtlinien. Keine manuelle Bereinigung erforderlich.');
                    }}
                  />
                </div>
              )}

              {activeSubTab === 'Hintergrundjobs' && (
                <BackgroundJobsView />
              )}

              {activeSubTab === 'Benchmarks' && (
                <div className="bg-white border border-border-standard rounded-lg p-xl space-y-lg shadow-sm select-none">
                  <div className="border-b border-border-standard pb-md">
                    <h3 className="text-h3 font-semibold text-primary">In-Memory Benchmarking</h3>
                    <p className="text-caption text-on-surface-variant">Testen Sie die Abfrage-Durchsatz-Kapazitäten der Qdrant-Vektordatenbank unter Last.</p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-lg">
                    <div className="flex flex-col gap-base">
                      <label className="text-body-semibold text-primary">Vektordistanz Metrik</label>
                      <select
                        value={vectorDistance}
                        onChange={(e) => setVectorDistance(e.target.value)}
                        className="border border-border-standard rounded-lg px-md h-[38px] text-body-base focus:ring-2 focus:ring-focus-ring-outer focus:border-primary outline-none bg-white text-on-surface"
                      >
                        <option value="Cosine">Kosinus-Ähnlichkeit (Cosine)</option>
                        <option value="Dot">Skalarprodukt (Dot Product)</option>
                        <option value="Euclidean">Euklidische Distanz (L2)</option>
                      </select>
                    </div>

                    <div className="flex flex-col gap-base">
                      <label className="text-body-semibold text-primary">Parallele Suchanfragen</label>
                      <input
                        type="number"
                        min={10}
                        max={1000}
                        value={benchmarkQueryCount}
                        onChange={(e) => setBenchmarkQueryCount(Number(e.target.value))}
                        className="border border-border-standard rounded-lg px-md h-[38px] text-body-base focus:ring-2 focus:ring-focus-ring-outer focus:border-primary outline-none bg-white text-on-surface"
                      />
                    </div>

                    <div className="flex flex-col justify-end">
                      <button
                        onClick={handleRunBenchmark}
                        disabled={isBenchmarking}
                        className="h-[38px] bg-primary text-white font-semibold rounded-lg hover:bg-primary/90 transition-all flex items-center justify-center gap-sm cursor-pointer shadow-sm disabled:opacity-40"
                      >
                        <span className="material-symbols-outlined text-[18px]">speed</span>
                        {isBenchmarking ? 'Lade-Szenario läuft...' : 'Belastungstest starten'}
                      </button>
                    </div>
                  </div>

                  {benchmarkResult && (
                    <div className="bg-surface-muted p-lg rounded-lg border border-border-standard grid grid-cols-2 md:grid-cols-4 gap-md animate-fade-in text-center">
                      <div className="space-y-1">
                        <span className="text-[11px] text-on-surface-variant font-semibold uppercase block">Abfragen / Sek.</span>
                        <span className="text-display-stat font-bold text-success">{benchmarkResult.throughput.toLocaleString('de-DE')}</span>
                      </div>
                      <div className="space-y-1">
                        <span className="text-[11px] text-on-surface-variant font-semibold uppercase block">Mittlere Latenz</span>
                        <span className="text-display-stat font-bold text-primary">{benchmarkResult.avgLatency} ms</span>
                      </div>
                      <div className="space-y-1">
                        <span className="text-[11px] text-on-surface-variant font-semibold uppercase block">Latenz (p95)</span>
                        <span className="text-display-stat font-bold text-primary">{benchmarkResult.p95Latency} ms</span>
                      </div>
                      <div className="space-y-1">
                        <span className="text-[11px] text-on-surface-variant font-semibold uppercase block">Suchpräzision</span>
                        <span className="text-display-stat font-bold text-secondary">{benchmarkResult.accuracy}%</span>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {activeSubTab === 'Audit' && (
                <AuditLogsView />
              )}
            </>
          )}

          {/* SIDEBAR: DASHBOARD EXECUTIVE MODULE */}
          {activeSidebarView === 'dashboard' && (
            <div className="bg-white border border-border-standard rounded-lg p-xl space-y-xl shadow-sm select-none">
              <div>
                <h1 className="text-h1 font-bold text-primary tracking-tight">Executive Dashboard</h1>
                <p className="text-body-base text-on-surface-variant">Detaillierte Übersicht über die Digitalisierungsprozesse aller Kommunalämter.</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-lg">
                <div className="p-lg border border-border-standard rounded-lg bg-surface-muted/20">
                  <span className="material-symbols-outlined text-primary text-[36px]">group</span>
                  <h3 className="font-semibold text-primary mt-sm">Aktive Anfragen</h3>
                  <p className="text-display-stat font-bold text-primary">14.812</p>
                  <p className="text-caption text-on-surface-variant">Suchvorgänge in dieser Woche (+14.2%)</p>
                </div>
                <div className="p-lg border border-border-standard rounded-lg bg-surface-muted/20">
                  <span className="material-symbols-outlined text-secondary text-[36px]">folder_special</span>
                  <h3 className="font-semibold text-secondary mt-sm">Erschlossene Ämter</h3>
                  <p className="text-display-stat font-bold text-secondary">18 / 24</p>
                  <p className="text-caption text-on-surface-variant">Bürgermeisteramt, Bauamt, Jugendamt, etc.</p>
                </div>
                <div className="p-lg border border-border-standard rounded-lg bg-surface-muted/20">
                  <span className="material-symbols-outlined text-success text-[36px]">cloud_done</span>
                  <h3 className="font-semibold text-success mt-sm">Speicher-Effizienz</h3>
                  <p className="text-display-stat font-bold text-success">99.98%</p>
                  <p className="text-caption text-on-surface-variant">Index-Uptime ohne Datenkorruption</p>
                </div>
              </div>
            </div>
          )}

          {/* SIDEBAR: SEMANTIC SANDBOX 'ANALYSEN' */}
          {activeSidebarView === 'analysen' && (
            <div className="bg-white border border-border-standard rounded-lg p-xl space-y-lg shadow-sm select-none">
              <div>
                <h1 className="text-h1 font-bold text-primary tracking-tight">Semantisches Such-Labor (Analysen)</h1>
                <p className="text-body-base text-on-surface-variant">Prüfen Sie, wie die Vektordatenbank Anfragen auswertet, indem Sie juristische Fragestellungen eingeben.</p>
              </div>

              <form onSubmit={handleSemanticSearch} className="flex gap-md">
                <input
                  type="text"
                  required
                  value={semanticQuery}
                  onChange={(e) => setSemanticQuery(e.target.value)}
                  placeholder="Geben Sie eine Frage ein, z.B. 'Dürfen Abstandsflächen bebaut werden?'"
                  className="flex-1 border border-border-standard rounded-lg px-md h-[42px] text-body-base focus:ring-2 focus:ring-focus-ring-outer focus:border-primary outline-none bg-white text-on-surface"
                />
                <button
                  type="submit"
                  disabled={isSearching}
                  className="px-xl bg-primary text-white font-semibold rounded-lg hover:bg-primary/90 transition-all flex items-center justify-center gap-sm cursor-pointer shadow-sm h-[42px] shrink-0 disabled:opacity-40"
                >
                  <span className="material-symbols-outlined text-[20px]">{isSearching ? 'autorenew' : 'search'}</span>
                  {isSearching ? 'Wird gesucht...' : 'Analysieren'}
                </button>
              </form>

              {semanticResults.length > 0 ? (
                <div className="space-y-md animate-fade-in">
                  <h4 className="text-caption font-bold text-primary uppercase tracking-wider">Top Vektor-Übereinstimmungen (Cosine Similarity)</h4>
                  <div className="divide-y divide-border-standard">
                    {semanticResults.map((res, idx) => (
                      <div key={idx} className="py-md space-y-sm">
                        <div className="flex justify-between items-start gap-sm">
                          <div>
                            <span className="text-caption font-bold text-secondary uppercase block">{res.source}</span>
                            <span className="font-semibold text-primary text-[15px]">{res.title}</span>
                          </div>
                          <span className="bg-success/10 text-success px-sm py-0.5 rounded text-caption font-mono font-bold shrink-0">
                            Score: {(res.score * 100).toFixed(2)}%
                          </span>
                        </div>
                        <p className="text-body-base text-on-surface-variant leading-relaxed bg-surface-muted/50 p-md rounded border border-border-standard/30 italic">
                          "{res.text}"
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                !isSearching && (
                  <div className="p-xl text-center border border-dashed border-border-standard rounded-lg bg-surface-muted/30">
                    <span className="material-symbols-outlined text-on-surface-variant text-[36px] block mb-sm">manage_search</span>
                    <p className="text-caption text-on-surface-variant font-medium">Geben Sie oben eine Suchanfrage ein, um die mathematische Kosinus-Ähnlichkeit der Chunks zu ermitteln.</p>
                  </div>
                )
              )}
            </div>
          )}

          {/* SIDEBAR: PROTOKOLLE VIEW */}
          {activeSidebarView === 'protokolle' && (
            <div className="bg-white border border-border-standard rounded-lg p-xl space-y-lg shadow-sm select-none">
              <div>
                <h1 className="text-h1 font-bold text-primary tracking-tight">Sitzungsprotokolle</h1>
                <p className="text-body-base text-on-surface-variant">Archiv aller Stadtratssitzungen, Bebauungsbeschlüsse und amtlichen Bekanntmachungen im PDF/A Standard.</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-md">
                {[
                  { name: 'Ratssitzung_12_04_2026.pdf', date: '12.04.2026', size: '2.4 MB', chunks: '412 Chunks' },
                  { name: 'Bebauungsplan_Kommune_Nord.pdf', date: '04.03.2026', size: '15.8 MB', chunks: '1.890 Chunks' },
                  { name: 'Abwasser_Satzungsentwurf_v3.pdf', date: '21.02.2026', size: '1.1 MB', chunks: '190 Chunks' },
                  { name: 'Finanzausschuss_Protokoll_Q1.pdf', date: '15.01.2026', size: '4.7 MB', chunks: '850 Chunks' }
                ].map((proto, idx) => (
                  <div key={idx} className="p-md border border-border-standard rounded-lg flex items-center justify-between hover:border-primary/20 transition-all">
                    <div className="flex items-center gap-sm">
                      <span className="material-symbols-outlined text-red-700 text-[28px]">picture_as_pdf</span>
                      <div>
                        <p className="text-caption font-semibold text-primary">{proto.name}</p>
                        <p className="text-[11px] text-on-surface-variant">Erstellt: {proto.date} • {proto.size} • {proto.chunks}</p>
                      </div>
                    </div>
                    <button
                      onClick={() => alert('PDF-Download ist in der Demoversion deaktiviert.')}
                      className="p-sm text-on-surface-variant hover:text-primary hover:bg-surface-muted rounded-full cursor-pointer"
                      title="Herunterladen"
                    >
                      <span className="material-symbols-outlined text-[18px]">download</span>
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* SIDEBAR: EINSTELLUNGEN MODULE */}
          {activeSidebarView === 'einstellungen' && (
            <div className="bg-white border border-border-standard rounded-lg p-xl space-y-lg shadow-sm select-none max-w-3xl">
              <div>
                <h1 className="text-h1 font-bold text-primary tracking-tight">Index-Konfiguration</h1>
                <p className="text-body-base text-on-surface-variant">Feinabstimmung der hierarchischen Navigations-Graphen (HNSW) und Indexierungs-Parameter.</p>
              </div>

              <div className="space-y-md">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-md">
                  <div className="flex flex-col gap-base">
                    <label className="text-body-semibold text-primary">HNSW Parameter M</label>
                    <input
                      type="number"
                      min={4}
                      max={64}
                      value={hnswM}
                      onChange={(e) => setHnswM(Number(e.target.value))}
                      className="border border-border-standard rounded-lg px-md h-[38px] text-body-base focus:ring-2 focus:ring-focus-ring-outer focus:border-primary outline-none bg-white text-on-surface"
                    />
                    <span className="text-[10px] text-on-surface-variant">Anzahl der Verbindungen pro Graphknoten (Standard: 16)</span>
                  </div>

                  <div className="flex flex-col gap-base">
                    <label className="text-body-semibold text-primary">ef_construct Parameter</label>
                    <input
                      type="number"
                      min={32}
                      max={512}
                      value={efConstruct}
                      onChange={(e) => setEfConstruct(Number(e.target.value))}
                      className="border border-border-standard rounded-lg px-md h-[38px] text-body-base focus:ring-2 focus:ring-focus-ring-outer focus:border-primary outline-none bg-white text-on-surface"
                    />
                    <span className="text-[10px] text-on-surface-variant">Tiefe der Nachbarschaftssuche beim Indexaufbau (Standard: 128)</span>
                  </div>
                </div>

                <div className="pt-md border-t border-border-standard flex justify-end">
                  <button
                    onClick={() => alert('Indexierungs-Parameter wurden temporär für diese Sitzung gespeichert.')}
                    className="px-lg py-sm bg-primary text-white font-semibold rounded-lg hover:bg-primary/90 transition-colors text-caption cursor-pointer"
                  >
                    Konfiguration speichern
                  </button>
                </div>
              </div>
            </div>
          )}

        </main>
      </div>

      {/* FOOTER BAR */}
      <footer className="w-full py-md px-huge flex flex-col sm:flex-row gap-xs justify-between items-center bg-surface-muted border-t border-border-standard select-none text-caption text-on-surface-variant">
        <p>© 2026 Kommunale Entscheidungsplattform - Bundesrepublik Deutschland</p>
        <div className="flex gap-lg">
          <a
            href="#"
            onClick={(e) => { e.preventDefault(); alert('Impressum gemäß § 5 TMG schreibgeschützt.'); }}
            className="hover:text-primary transition-colors"
          >
            Impressum
          </a>
          <a
            href="#"
            onClick={(e) => { e.preventDefault(); alert('Datenschutz-Satzung entspricht DSGVO.'); }}
            className="hover:text-primary transition-colors"
          >
            Datenschutz
          </a>
          <a
            href="#"
            onClick={(e) => { e.preventDefault(); alert('Barrierefreie IT-Erklärung nach BITV 2.0.'); }}
            className="hover:text-primary transition-colors"
          >
            Barrierefreiheit
          </a>
          <a
            href="#"
            onClick={(e) => { e.preventDefault(); alert('Kontakt: support@digital-kommune.de'); }}
            className="hover:text-primary transition-colors"
          >
            Kontakt
          </a>
        </div>
      </footer>

      {/* UPLOAD FILE MODAL TRIGGER */}
      {showUploadModal && (
        <UploadModal
          onClose={() => setShowUploadModal(false)}
          onUploadComplete={handleUploadComplete}
        />
      )}

      {/* DETAILS SLIDE OUT DRAWER */}
      {selectedDetailPackage && (
        <DetailDrawer
          pkg={selectedDetailPackage}
          onClose={() => setSelectedDetailPackage(null)}
          onVerify={(id) => {
            handleVerifyPackage(id);
            // Refresh detailed view attributes
            setSelectedDetailPackage(prev => prev ? { ...prev, lastSync: 'Gerade eben', status: 'Bereit' } : null);
          }}
          onDelete={(id) => {
            handleDeletePackage(id);
            setSelectedDetailPackage(null);
          }}
        />
      )}

    </div>
  );
}
