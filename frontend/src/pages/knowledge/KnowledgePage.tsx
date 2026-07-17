import React, { useState, useCallback, useMemo } from 'react';
import { AppShell } from '../../layouts/AppShell';
import { TopNavigation, type NavModule } from '../../components/navigation';
import {
  SearchBar,
  FilterPanel,
  ResultCard,
  PreviewPane,
  SearchSummary,
} from '../../components/search';
import { EmptyState } from '../../components/common';
import { initialDocuments } from '../../mocks/knowledge';
import {
  categories,
  fachbereichOptions,
  bundeslandOptions,
} from '../../mocks/knowledge';
import type {
  KnowledgeDocument,
  DocType,
  Fachbereich,
  Bundesland,
  Zeitraum,
} from '../../mocks/knowledge';
import styles from './KnowledgePage.module.css';

const NAV_MODULES: NavModule[] = [
  { id: 'home', label: 'Startseite', href: '/home' },
  { id: 'work', label: 'Meine Arbeit', href: '/work' },
  { id: 'knowledge', label: 'Wissen', href: '/knowledge', active: true },
  { id: 'documents', label: 'Dokumente', href: '/documents' },
  { id: 'admin', label: 'Verwaltung', href: '/admin' },
];

const FILTER_GROUPS = [
  {
    id: 'type',
    label: 'Dokumenttyp',
    options: categories.map((c) => ({ value: c.id, label: c.label, count: c.count })),
  },
  {
    id: 'fachbereich',
    label: 'Fachbereich',
    options: fachbereichOptions.map((o) => ({ value: o.value, label: o.label })),
  },
  {
    id: 'bundesland',
    label: 'Bundesland',
    options: bundeslandOptions.map((o) => ({ value: o.value, label: o.label })),
  },
  {
    id: 'zeitraum',
    label: 'Zeitraum',
    options: [
      { value: 'Alle', label: 'Alle' },
      { value: 'Aktuell', label: 'Aktuell' },
      { value: 'Archiv', label: 'Archiv' },
    ],
  },
];

export const KnowledgePage: React.FC = React.memo(() => {
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState<Record<string, string>>({
    type: 'Alle',
    fachbereich: 'Alle',
    bundesland: 'Alle',
    zeitraum: 'Alle',
  });
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [favorites, setFavorites] = useState<Set<string>>(
    new Set(initialDocuments.filter((d) => d.isFavorite).map((d) => d.id)),
  );

  const handleFilterChange = useCallback((groupId: string, value: string) => {
    setFilters((prev) => ({ ...prev, [groupId]: value }));
  }, []);

  const handleClearFilters = useCallback(() => {
    setFilters({ type: 'Alle', fachbereich: 'Alle', bundesland: 'Alle', zeitraum: 'Alle' });
    setSearchQuery('');
  }, []);

  const handleToggleFavorite = useCallback((id: string) => {
    setFavorites((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  const filteredDocuments = useMemo(() => {
    const query = searchQuery.toLowerCase().trim();

    return initialDocuments
      .filter((doc) => {
        if (filters.type !== 'Alle' && doc.type !== filters.type) return false;
        if (filters.fachbereich !== 'Alle' && doc.fachbereich !== filters.fachbereich) return false;
        if (filters.bundesland !== 'Alle' && doc.bundesland !== filters.bundesland) return false;
        if (filters.zeitraum !== 'Alle' && doc.zeitraum !== filters.zeitraum) return false;
        return true;
      })
      .filter((doc) => {
        if (!query) return true;
        return (
          doc.title.toLowerCase().includes(query) ||
          doc.snippet.toLowerCase().includes(query) ||
          doc.fullText.toLowerCase().includes(query) ||
          doc.authority.toLowerCase().includes(query) ||
          doc.legalArea.toLowerCase().includes(query) ||
          doc.referencedLaws.some((l) => l.toLowerCase().includes(query))
        );
      })
      .sort((a, b) => b.relevance - a.relevance);
  }, [searchQuery, filters]);

  const selectedDoc = useMemo(
    () => initialDocuments.find((d) => d.id === selectedId) ?? null,
    [selectedId],
  );

  const hasActiveFilters =
    filters.type !== 'Alle' ||
    filters.fachbereich !== 'Alle' ||
    filters.bundesland !== 'Alle' ||
    filters.zeitraum !== 'Alle' ||
    searchQuery.trim() !== '';

  const isPreviewVisible = selectedDoc !== null;

  return (
    <AppShell
      topNavigation={
        <TopNavigation
          modules={NAV_MODULES}
          activeModule="knowledge"
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
        <div className={styles.toolbar}>
          <div className={styles.searchBar}>
            <SearchBar
              value={searchQuery}
              onChange={setSearchQuery}
              placeholder="Vorschriften, Verfahren, Vorlagen durchsuchen..."
            />
          </div>
          <SearchSummary
            total={initialDocuments.length}
            filtered={filteredDocuments.length}
            query={searchQuery || undefined}
          />
          {hasActiveFilters && (
            <button
              type="button"
              className={styles.clearFiltersBtn}
              onClick={handleClearFilters}
            >
              Filter zurücksetzen
            </button>
          )}
        </div>

        <div
          className={`${styles.layout} ${isPreviewVisible ? styles.layoutThreeCol : styles.layoutTwoCol}`}
        >
          <div className={styles.filterColumn}>
            <FilterPanel
              groups={FILTER_GROUPS}
              activeFilters={filters}
              onFilterChange={handleFilterChange}
            />
          </div>

          <div className={styles.resultsColumn}>
            {filteredDocuments.length === 0 ? (
              <div className={styles.emptyResults}>
                <EmptyState
                  title="Keine Ergebnisse gefunden"
                  description={
                    hasActiveFilters
                      ? 'Keine Dokumente entsprechen den gewählten Filtern. Versuchen Sie, die Filter anzupassen.'
                      : 'Es sind keine Dokumente in der Wissensdatenbank vorhanden.'
                  }
                />
              </div>
            ) : (
              <div className={styles.resultsList} role="list" aria-label="Suchergebnisse">
                {filteredDocuments.map((doc) => (
                  <ResultCard
                    key={doc.id}
                    id={doc.id}
                    title={doc.title}
                    type={doc.type}
                    relevance={doc.relevance}
                    isFavorite={favorites.has(doc.id)}
                    authority={doc.authority}
                    date={doc.date}
                    legalArea={doc.legalArea}
                    snippet={doc.snippet}
                    searchQuery={searchQuery}
                    isSelected={doc.id === selectedId}
                    onClick={setSelectedId}
                    onToggleFavorite={handleToggleFavorite}
                  />
                ))}
              </div>
            )}
          </div>

          {isPreviewVisible && (
            <div className={styles.previewColumn}>
              <PreviewPane
                title={selectedDoc.title}
                type={selectedDoc.type}
                authority={selectedDoc.authority}
                date={selectedDoc.date}
                legalArea={selectedDoc.legalArea}
                fachbereich={selectedDoc.fachbereich}
                bundesland={selectedDoc.bundesland}
                fullText={selectedDoc.fullText}
                toc={selectedDoc.toc}
                relatedProcedures={selectedDoc.relatedProcedures}
                downloads={selectedDoc.downloads}
                referencedLaws={selectedDoc.referencedLaws}
                isFavorite={favorites.has(selectedDoc.id)}
                searchQuery={searchQuery}
                onToggleFavorite={() => handleToggleFavorite(selectedDoc.id)}
                onClose={() => setSelectedId(null)}
              />
            </div>
          )}
        </div>
      </div>
    </AppShell>
  );
});

KnowledgePage.displayName = 'KnowledgePage';
