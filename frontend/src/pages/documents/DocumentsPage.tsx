import React, { useState, useCallback, useMemo } from 'react';
import { AppShell } from '../../layouts/AppShell';
import { TopNavigation, TabBar, type NavModule, type TabItem } from '../../components/navigation';
import { SearchBar, FilterPanel } from '../../components/search';
import { DataTable, type DataTableColumn } from '../../components/data';
import { DocumentVersionHistory } from '../../components/documents';
import {
  Panel, Badge, Button, Icon, PropertyGrid, ActionToolbar,
} from '../../components/common';
import {
  mockDocuments, DOCUMENT_CATEGORIES, DOCUMENT_STATUS_COLORS,
} from '../../mocks/documents';
import type { DocumentItem } from '../../mocks/documents';
import styles from './DocumentsPage.module.css';

const NAV_MODULES: NavModule[] = [
  { id: 'home', label: 'Startseite', href: '/home' },
  { id: 'work', label: 'Meine Arbeit', href: '/work' },
  { id: 'knowledge', label: 'Wissen', href: '/knowledge' },
  { id: 'documents', label: 'Dokumente', href: '/documents', active: true },
  { id: 'admin', label: 'Verwaltung', href: '/admin' },
];

const SUB_TABS: TabItem[] = [
  { id: 'all', label: 'Alle Dokumente' },
  { id: 'upload', label: 'Hochladen' },
  { id: 'index_status', label: 'Index-Status' },
];

const TYPE_OPTIONS = [
  'Alle Dokumenttypen', 'Antrag', 'Lageplan', 'Nachweis', 'Beilage', 'Vorlage', 'Formular', 'Sonstiges',
];

const STATUS_OPTIONS = [
  'Status: Alle', 'Aktiv', 'In Prüfung', 'Fehlend', 'Archiviert',
];

const FILTER_GROUPS = [
  {
    id: 'category',
    label: 'Kategorien',
    options: DOCUMENT_CATEGORIES.map((c) => ({
      value: c.id,
      label: c.label,
      count: c.count,
    })),
  },
];

export const DocumentsPage: React.FC = React.memo(() => {
  const [subTab, setSubTab] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState('Alle Dokumenttypen');
  const [statusFilter, setStatusFilter] = useState('Status: Alle');
  const [activeCategory, setActiveCategory] = useState('vorgangsdokumente');
  const [selectedId, setSelectedId] = useState<string | null>('doc-1');
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  const filteredDocuments = useMemo(() => {
    const query = searchQuery.toLowerCase().trim();
    return mockDocuments.filter((doc) => {
      if (typeFilter !== 'Alle Dokumenttypen' && doc.typ !== typeFilter) return false;
      if (statusFilter !== 'Status: Alle' && doc.status !== statusFilter) return false;
      if (query) {
        return (
          doc.name.toLowerCase().includes(query) ||
          doc.vorgangId.toLowerCase().includes(query) ||
          doc.buerger.toLowerCase().includes(query) ||
          doc.typ.toLowerCase().includes(query)
        );
      }
      return true;
    });
  }, [searchQuery, typeFilter, statusFilter]);

  const selectedDoc = useMemo(
    () => mockDocuments.find((d) => d.id === selectedId) ?? null,
    [selectedId],
  );

  const handleSelectionChange = useCallback((ids: Set<string>) => {
    setSelectedIds(ids);
  }, []);

  const columns: DataTableColumn<DocumentItem>[] = useMemo(
    () => [
      {
        key: 'name',
        header: 'Dokument',
        render: (doc) => (
          <span
            className={styles.docName}
            onClick={() => setSelectedId(doc.id)}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => { if (e.key === 'Enter') setSelectedId(doc.id); }}
          >
            <Icon name={doc.name.endsWith('.pdf') ? 'file-text' : 'image'} size={14} />
            {doc.name}
          </span>
        ),
      },
      {
        key: 'vorgangId',
        header: 'Vorgang',
        render: (doc) => <span className={styles.monoCell}>{doc.vorgangId}</span>,
      },
      {
        key: 'buerger',
        header: 'Bürger',
        render: (doc) => <span className={styles.monoCell}>{doc.buerger}</span>,
      },
      {
        key: 'typ',
        header: 'Typ',
        render: (doc) => <span className={styles.monoCell}>{doc.typ}</span>,
      },
      {
        key: 'version',
        header: 'Vers.',
        render: (doc) => <span className={styles.monoCell}>{doc.version}</span>,
      },
      {
        key: 'status',
        header: 'Status',
        render: (doc) => (
          <Badge status={DOCUMENT_STATUS_COLORS[doc.status]} variant="pill">
            {doc.status}
          </Badge>
        ),
      },
      {
        key: 'geaendert',
        header: 'Geändert',
        render: (doc) => <span className={styles.monoCell}>{doc.geaendert}</span>,
      },
    ],
    [],
  );

  const bulkCount = selectedIds.size;

  return (
    <AppShell
      topNavigation={
        <TopNavigation
          modules={NAV_MODULES}
          activeModule="documents"
          onNavigate={() => {}}
          userName="Sabine Müller"
          userEmail="s.mueller@verwaltung.de"
          userDepartment="Bauamt"
          userInitials="SM"
          userActions={[
            { id: 'profile', label: 'Profil', onClick: () => {} },
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
        <div className={styles.subNav}>
          <TabBar tabs={SUB_TABS} activeTab={subTab} onTabChange={setSubTab} />
        </div>

        <div className={styles.toolbarRow}>
          <div className={styles.searchWrap}>
            <SearchBar
              value={searchQuery}
              onChange={setSearchQuery}
              placeholder="Dokumente durchsuchen..."
            />
          </div>
          <div className={styles.filterRow}>
            <select
              className={styles.filterSelect}
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              aria-label="Dokumenttyp filtern"
            >
              {TYPE_OPTIONS.map((o) => (
                <option key={o} value={o}>{o}</option>
              ))}
            </select>
            <select
              className={styles.filterSelect}
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              aria-label="Status filtern"
            >
              {STATUS_OPTIONS.map((o) => (
                <option key={o} value={o}>{o}</option>
              ))}
            </select>
          </div>
          <ActionToolbar
            actions={[
              { id: 'upload', label: 'Hochladen', onClick: () => {}, variant: 'primary' },
              { id: 'new', label: 'Neues Dokument', onClick: () => {}, variant: 'secondary' },
            ]}
          />
        </div>

        {bulkCount > 0 && (
          <div className={styles.bulkBar}>
            <span className={styles.bulkCount}>{bulkCount} ausgewählt</span>
            <ActionToolbar
              actions={[
                { id: 'compare', label: 'Vergleichen', onClick: () => {}, variant: 'secondary' },
                { id: 'export', label: 'Exportieren', onClick: () => {}, variant: 'secondary' },
                { id: 'archive', label: 'Archivieren', onClick: () => {}, variant: 'secondary' },
              ]}
            />
          </div>
        )}

        <div className={`${styles.layout} ${selectedDoc ? styles.layoutThreeCol : styles.layoutTwoCol}`}>
          <div className={styles.filterCol}>
            <FilterPanel
              groups={FILTER_GROUPS}
              activeFilters={{ category: activeCategory }}
              onFilterChange={(_, value) => setActiveCategory(value)}
            />
          </div>

          <div className={styles.tableCol}>
            <DataTable
              columns={columns}
              data={filteredDocuments}
              keyField="id"
              emptyState="Keine Dokumente gefunden"
              selectable
              selectedIds={selectedIds}
              onSelectionChange={handleSelectionChange}
              onRowClick={(doc) => setSelectedId(doc.id)}
            />
          </div>

          {selectedDoc && (
            <div className={styles.previewCol}>
              <div className={styles.previewHeader}>
                <span className={styles.previewCaption}>Vorschau</span>
                <h2 className={styles.previewTitle}>{selectedDoc.name}</h2>
                <div className={styles.previewActions}>
                  <Badge status={DOCUMENT_STATUS_COLORS[selectedDoc.status]} variant="pill">
                    {selectedDoc.status}
                  </Badge>
                  <button type="button" className={styles.previewActionBtn} aria-label="Herunterladen">
                    <Icon name="download" size={16} />
                  </button>
                  <button type="button" className={styles.previewActionBtn} aria-label="Drucken">
                    <Icon name="printer" size={16} />
                  </button>
                  <button
                    type="button"
                    className={styles.previewActionBtn}
                    onClick={() => setSelectedId(null)}
                    aria-label="Vorschau schließen"
                  >
                    <Icon name="x" size={16} />
                  </button>
                </div>
              </div>

              <div className={styles.previewContent}>
                <div className={styles.previewSection}>
                  <h3 className={styles.previewSectionTitle}>Metadaten</h3>
                  <PropertyGrid
                    items={[
                      { label: 'Dokumenten-ID', value: selectedDoc.dokumentId, valueMono: true },
                      { label: 'Typ', value: selectedDoc.detailedTyp },
                      { label: 'Dateigröße', value: selectedDoc.dateigroesse },
                      { label: 'Hochgeladen', value: selectedDoc.hochgeladenAm },
                    ]}
                  />
                </div>

                <div className={styles.previewSection}>
                  <h3 className={styles.previewSectionTitle}>Vorgangskontext</h3>
                  <div className={styles.contextCard}>
                    <div className={styles.contextCardLeft}>
                      <span className={styles.contextCardLabel}>Vorgang</span>
                      <span className={styles.contextCardValue}>{selectedDoc.vorgangId}</span>
                    </div>
                    <Icon name="chevron-right" size={14} />
                  </div>
                  <div className={styles.contextCard}>
                    <div className={styles.contextCardLeft}>
                      <span className={styles.contextCardLabel}>Bürger</span>
                      <span className={styles.contextCardValue}>{selectedDoc.buerger}</span>
                    </div>
                    <Icon name="chevron-right" size={14} />
                  </div>
                </div>

                <div className={styles.previewSection}>
                  <h3 className={styles.previewSectionTitle}>Versionen</h3>
                  <DocumentVersionHistory versions={selectedDoc.versions} />
                </div>

                {selectedDoc.references.length > 0 && (
                  <div className={styles.previewSection}>
                    <h3 className={styles.previewSectionTitle}>Referenzen & Rechtsgrundlagen</h3>
                    {selectedDoc.references.map((ref) => (
                      <div key={ref.id} className={styles.referenceItem}>
                        <Icon name={ref.type === 'gavel' ? 'scale' : 'file-text'} size={14} />
                        <span>{ref.title}</span>
                      </div>
                    ))}
                  </div>
                )}

                {selectedDoc.history.length > 0 && (
                  <div className={styles.previewSection}>
                    <h3 className={styles.previewSectionTitle}>Historie</h3>
                    {selectedDoc.history.map((event) => (
                      <div key={event.id} className={styles.referenceItem}>
                        <Icon
                          name={event.status === 'completed' ? 'check-circle' : event.status === 'info' ? 'info' : 'settings'}
                          size={14}
                        />
                        <div>
                          <div className={styles.historyTitle}>{event.title}</div>
                          <div className={styles.historyMeta}>
                            {event.timestamp} · {event.author}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </AppShell>
  );
});

DocumentsPage.displayName = 'DocumentsPage';
