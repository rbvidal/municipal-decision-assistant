import React, { useState, useMemo, useCallback } from 'react';
import { AppShell } from '../../layouts/AppShell';
import { TopNavigation, PageTitleBar, TabBar, type NavModule, type TabItem } from '../../components/navigation';
import { Panel, StatCard, Badge, StatusDot, Button, SuggestionCard, Icon } from '../../components/common';
import { DataTable, type DataTableColumn } from '../../components/data';
import { mockStats, mockVorgaenge, mockNextTask, mockSuggestions, getGreeting } from '../../mocks';

import type { MockVorgang } from '../../mocks';
import type { VorgangStatus } from '../../types';
import styles from './HomePage.module.css';

const STATUS_MAP: Record<VorgangStatus, { status: 'error' | 'warning' | 'info' | 'neutral'; label: string }> = {
  NEW: { status: 'neutral', label: 'Erfasst' },
  IN_REVIEW: { status: 'warning', label: 'In Prüfung' },
  DECISION_SUPPORT: { status: 'info', label: 'In Bearbeitung' },
  DRAFTING: { status: 'info', label: 'Entwurf' },
  PENDING_APPROVAL: { status: 'warning', label: 'Genehmigung' },
  READY_TO_SEND: { status: 'info', label: 'Versandbereit' },
  ARCHIVED: { status: 'neutral', label: 'Archiviert' },
  WAITING_FOR_CITIZEN: { status: 'neutral', label: 'Wartet Bürger' },
  WAITING_FOR_AUTHORITY: { status: 'neutral', label: 'Wartet Behörde' },
  WAITING_INTERNAL: { status: 'neutral', label: 'Wartet intern' },
};

const STATUS_TEXT_CLASS: Record<string, string> = {
  error: styles.statusOverdue,
  warning: styles.statusWarning,
  info: styles.statusInfo,
  neutral: styles.statusNeutral,
};

const OVERDUE_CASE_IDS = new Set(['BAU-2026-0092']);
const TODAY_CASE_IDS = new Set(['ORD-2024-8812']);

const NAV_MODULES: NavModule[] = [
  { id: 'home', label: 'Startseite', href: '/home', active: true },
  { id: 'work', label: 'Meine Arbeit', href: '/work' },
  { id: 'knowledge', label: 'Wissen', href: '/knowledge' },
  { id: 'documents', label: 'Dokumente', href: '/documents' },
  { id: 'admin', label: 'Verwaltung', href: '/admin', visible: true },
];

export const HomePage: React.FC = React.memo(() => {
  const [caseFilter, setCaseFilter] = useState('alle');
  const [showAllCases, setShowAllCases] = useState(false);

  const greeting = useMemo(() => getGreeting(), []);
  const today = useMemo(
    () =>
      new Date().toLocaleDateString('de-DE', {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      }),
    [],
  );

  const filteredCases = useMemo(() => {
    switch (caseFilter) {
      case 'ueberfaellig':
        return mockVorgaenge.filter((c) => OVERDUE_CASE_IDS.has(c.id));
      case 'heute':
        return mockVorgaenge.filter((c) => TODAY_CASE_IDS.has(c.id));
      default:
        return mockVorgaenge;
    }
  }, [caseFilter]);

  const displayedCases = showAllCases ? filteredCases : filteredCases.slice(0, 5);

  const isOverdue = useCallback((v: MockVorgang) => OVERDUE_CASE_IDS.has(v.id), []);

  const overdueCount = useMemo(() => mockVorgaenge.filter((c) => OVERDUE_CASE_IDS.has(c.id)).length, []);
  const todayCount = useMemo(() => mockVorgaenge.filter((c) => TODAY_CASE_IDS.has(c.id)).length, []);

  const filterTabs: TabItem[] = useMemo(
    () => [
      { id: 'alle', label: 'Alle' },
      { id: 'ueberfaellig', label: `Überfällig (${overdueCount})` },
      { id: 'heute', label: `Heute (${todayCount})` },
    ],
    [overdueCount, todayCount],
  );

  const columns: DataTableColumn<MockVorgang>[] = useMemo(
    () => [
      {
        key: 'id',
        header: 'ID / Aktenzeichen',
        render: (v) => <span className={styles.caseId}>{v.id}</span>,
      },
      {
        key: 'title',
        header: 'Titel / Art',
        render: (v) => <span className={styles.caseTitle}>{v.title}</span>,
      },
      {
        key: 'status',
        header: 'Status',
        render: (v) => {
          const { status, label } = STATUS_MAP[v.status];
          return (
            <span className={styles.statusCell}>
              <StatusDot status={status} size="sm" />
              <span className={STATUS_TEXT_CLASS[status]}>{label}</span>
            </span>
          );
        },
      },
      {
        key: 'dueDate',
        header: 'Fälligkeit',
        align: 'left',
        render: (v) => (
          <span className={isOverdue(v) ? styles.dueOverdue : styles.dueNormal}>
            {v.dueDate}
          </span>
        ),
      },
      {
        key: 'actionText',
        header: 'Aktion',
        align: 'left',
        render: () => (
          <button type="button" className={styles.actionBtn}>
            Bearbeiten
          </button>
        ),
      },
    ],
    [isOverdue],
  );

  const handleNavigate = useCallback((_href: string) => {
    /* placeholder — routing not yet implemented */
  }, []);

  const handleCreateCase = useCallback(() => {
    /* placeholder — dialog not yet implemented */
  }, []);

  const handleOpenTask = useCallback(() => {
    /* placeholder — case workspace routing not yet implemented */
  }, []);

  const handleSuggestionAction = useCallback((_suggestionId: string) => {
    /* placeholder — dialog not yet implemented */
  }, []);

  return (
    <AppShell
      topNavigation={
        <TopNavigation
          modules={NAV_MODULES}
          activeModule="home"
          onNavigate={handleNavigate}
          userName="Frau Müller"
          userEmail="k.mueller@verwaltung.de"
          userDepartment="Bauaufsicht"
          userInitials="KM"
          userActions={[
            { id: 'profile', label: 'Profil', onClick: () => {} },
            { id: 'settings', label: 'Einstellungen', onClick: () => {} },
            { id: 'logout', label: 'Abmelden', onClick: () => {} },
          ]}
          notifications={[]}
          onNotificationClick={() => {}}
          onMarkAllNotificationsRead={() => {}}
          onViewAllNotifications={() => {}}
        />
      }
    >
      <div className={styles.page}>
        <PageTitleBar
          title={`${greeting}, Frau Müller.`}
          subtitle={today}
          actions={
            <Button variant="primary" size="sm" onClick={handleCreateCase}>
              + Neuer Vorgang
            </Button>
          }
        />

        <div className={styles.twoColumn}>
          <div className={styles.leftColumn}>
            <Panel
              title="Vorgeschlagene nächste Aufgabe"
              icon={<Icon name="zap" size={16} />}
              headerAction={
                <Badge status="success">Priorität: Hoch</Badge>
              }
            >
              <div className={styles.nextTaskBody}>
                <div className={styles.nextTaskIcon} aria-hidden="true">
                  <Icon name="wrench" size={20} />
                </div>
                <div className={styles.nextTaskInfo}>
                  <span className={styles.nextTaskCaseId}>{mockNextTask.id}</span>
                  <span className={styles.nextTaskTitle}>{mockNextTask.title}</span>
                  <div className={styles.nextTaskMeta}>
                    <span>Risiko: {mockNextTask.risk === 'gering' ? 'Gering' : mockNextTask.risk === 'mittel' ? 'Mittel' : 'Hoch'}</span>
                    <span>Letzte Änderung: {mockNextTask.lastModified}</span>
                  </div>
                </div>
              </div>
              <div className={styles.nextTaskFooter}>
                <Button variant="primary" size="sm" onClick={handleOpenTask}>
                  Vorgang öffnen
                </Button>
              </div>
            </Panel>

            <Panel
              title="Meine Vorgänge"
              headerAction={
                <TabBar
                  tabs={filterTabs}
                  activeTab={caseFilter}
                  onTabChange={setCaseFilter}
                />
              }
            >
              <DataTable
                columns={columns}
                data={displayedCases}
                keyField="id"
                emptyState="Keine Vorgänge gefunden"
              />
              {filteredCases.length > 5 && (
                <button
                  type="button"
                  className={styles.showAllBtn}
                  onClick={() => setShowAllCases((s) => !s)}
                >
                  {showAllCases
                    ? 'Weniger anzeigen'
                    : `Vollständige Liste anzeigen (${filteredCases.length - 5} weitere)`}
                </button>
              )}
            </Panel>
          </div>

          <aside className={styles.rightColumn}>
            <Panel
              variant="subtle"
              title="Vorschläge für Ihre Vorgänge"
              icon={<Icon name="lightbulb" size={16} />}
            >
              <div className={styles.suggestionsList}>
                {mockSuggestions.map((s) => (
                  <SuggestionCard
                    key={s.id}
                    caseId={s.caseId}
                    type={s.type}
                    title={s.title}
                    description={s.description}
                    actionLabel={s.actionLabel}
                    onAction={s.actionLabel ? () => handleSuggestionAction(s.id) : undefined}
                  />
                ))}
              </div>
              <p className={styles.disclaimer}>
                Dies sind automatisierte Vorschläge zur Entscheidungsunterstützung.
                Die abschließende Prüfung obliegt der Sachbearbeitung.
              </p>
            </Panel>
          </aside>
        </div>

        <div className={styles.statsGrid}>
          {mockStats.map((stat) => (
            <StatCard
              key={stat.id}
              label={stat.label}
              value={stat.value}
              status={stat.status}
              percentage={stat.percentage}
            />
          ))}
        </div>

        <footer className={styles.footer}>
          <div>
            <span className={styles.footerBrand}>VerwaltungsPortal</span>
            {' (c) 2026 Deutsche Kommunalverwaltung'}
          </div>
          <nav className={styles.footerLinks} aria-label="Rechtliche Links">
            <button type="button" className={styles.footerLink}>Impressum</button>
            <button type="button" className={styles.footerLink}>Datenschutz</button>
            <button type="button" className={styles.footerLink}>Kontakt</button>
          </nav>
        </footer>
      </div>
    </AppShell>
  );
});

HomePage.displayName = 'HomePage';
