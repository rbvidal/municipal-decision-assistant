import React, { useState, useCallback, useMemo } from "react";
import { AppShell } from "../../layouts/AppShell";
import { AppTopNavigation, type NavModule } from "../../components/navigation";
import {
  SearchBar,
  FilterPanel,
  ResultCard,
  PreviewPane,
  SearchSummary,
} from "../../components/search";
import { EmptyState, Button } from "../../components/common";
import { useKnowledgeSearch } from "../../hooks/useKnowledge";
import type { KnowledgeDocument } from "../../types/domain";
import styles from "./KnowledgePage.module.css";

const categories = ["Alle", "Vergaberecht", "Bauplanungsrecht", "Umweltrecht", "Kommunalrecht"] as const;
const fachbereichOptions = ["Alle", "Bauamt", "Ordnungsamt", "Umweltamt", "Rechtsamt"] as const;
const bundeslandOptions = ["Alle", "Baden-Württemberg", "Bayern", "Berlin", "Brandenburg"] as const;

const NAV_MODULES: NavModule[] = [
  { id: "home", label: "Startseite", href: "/home" },
  { id: "work", label: "Meine Arbeit", href: "/work" },
  { id: "knowledge", label: "Wissen", href: "/knowledge", active: true },
  { id: "documents", label: "Dokumente", href: "/documents" },
  { id: "admin", label: "Verwaltung", href: "/admin" },
];

const FILTER_GROUPS = [
  { id: "category", label: "Kategorie", options: categories.map((c) => ({ value: c, label: c })) },
  { id: "fachbereich", label: "Fachbereich", options: fachbereichOptions.map((o) => ({ value: o, label: o })) },
  { id: "bundesland", label: "Bundesland", options: bundeslandOptions.map((o) => ({ value: o, label: o })) },
  { id: "zeitraum", label: "Zeitraum", options: [
    { value: "Alle", label: "Alle" }, { value: "Aktuell", label: "Aktuell" }, { value: "Archiv", label: "Archiv" },
  ]},
];

export const KnowledgePage: React.FC = React.memo(() => {
  const [searchQuery, setSearchQuery] = useState("");
  const [filters, setFilters] = useState<Record<string, string>>({
    category: "Alle", fachbereich: "Alle", bundesland: "Alle", zeitraum: "Alle",
  });
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [favorites, setFavorites] = useState<Set<string>>(new Set());

  const { data: documents = [], isLoading, isError } = useKnowledgeSearch(searchQuery, filters);

  const handleFilterChange = useCallback((groupId: string, value: string) => {
    setFilters((prev) => ({ ...prev, [groupId]: value }));
  }, []);

  const handleClearFilters = useCallback(() => {
    setFilters({ category: "Alle", fachbereich: "Alle", bundesland: "Alle", zeitraum: "Alle" });
    setSearchQuery("");
  }, []);

  const handleToggleFavorite = useCallback((id: string) => {
    setFavorites((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  }, []);

  const selectedDoc = useMemo(
    () => documents.find((d) => d.id === selectedId) ?? null,
    [selectedId, documents],
  );

  const hasActiveFilters =
    filters.category !== "Alle" || filters.fachbereich !== "Alle" ||
    filters.bundesland !== "Alle" || filters.zeitraum !== "Alle" ||
    searchQuery.trim() !== "";

  const isPreviewVisible = selectedDoc !== null;

  return (
    <AppShell topNavigation={<AppTopNavigation modules={NAV_MODULES} activeModule="knowledge" />}>
      <div className={styles.page}>
        <div className={styles.aiSearchHero}>
          <h2 className={styles.aiSearchTitle}>Wissensdatenbank</h2>
          <p className={styles.aiSearchSubtitle}>
            Durchsuchen Sie Vorschriften, Verfahren und Vorlagen mit KI-gestützter semantischer Suche
          </p>
          <div className={styles.aiSearchBar}>
            <SearchBar
              value={searchQuery}
              onChange={setSearchQuery}
              placeholder="Stellen Sie eine Frage zu Vorschriften, Verfahren oder Vorlagen..."
            />
          </div>
          <div className={styles.toolbar}>
            <SearchSummary
              total={documents.length}
              filtered={documents.length}
              query={searchQuery || undefined}
            />
            {hasActiveFilters && (
              <button type="button" className={styles.clearFiltersBtn} onClick={handleClearFilters}>
                Filter zurücksetzen
              </button>
            )}
          </div>
        </div>

        <div className={`${styles.layout} ${isPreviewVisible ? styles.layoutThreeCol : styles.layoutTwoCol}`}>
          <div className={styles.filterColumn}>
            <FilterPanel groups={FILTER_GROUPS} activeFilters={filters} onFilterChange={handleFilterChange} />
          </div>

          <div className={styles.resultsColumn}>
            {isLoading ? (
              <div className={styles.emptyResults}>
                <p>Dokumente werden geladen...</p>
              </div>
            ) : isError ? (
              <div className={styles.emptyResults}>
                <EmptyState
                  title="Fehler beim Laden"
                  description="Die Wissensdatenbank ist derzeit nicht verfügbar."
                />
              </div>
            ) : documents.length === 0 ? (
              <div className={styles.emptyResults}>
                <EmptyState
                  title="Keine Ergebnisse gefunden"
                  description={
                    hasActiveFilters
                      ? "Keine Dokumente entsprechen den gewählten Filtern."
                      : "Es sind keine Dokumente in der Wissensdatenbank vorhanden."
                  }
                />
              </div>
            ) : (
              <div className={styles.resultsList} role="list" aria-label="Suchergebnisse">
                {documents.map((doc) => (
                  <ResultCard
                    key={doc.id}
                    id={doc.id}
                    title={doc.title}
                    type={doc.type}
                    relevance={0}
                    isFavorite={favorites.has(doc.id)}
                    authority={doc.fachbereich}
                    date={doc.lastUpdated}
                    legalArea={doc.category}
                    snippet={doc.excerpt}
                    searchQuery={searchQuery}
                    isSelected={doc.id === selectedId}
                    onClick={setSelectedId}
                    onToggleFavorite={handleToggleFavorite}
                  />
                ))}
              </div>
            )}
          </div>

          {isPreviewVisible && selectedDoc && (
            <div className={styles.previewColumn}>
              <PreviewPane
                title={selectedDoc.title}
                type={selectedDoc.type}
                authority={selectedDoc.fachbereich}
                date={selectedDoc.lastUpdated}
                legalArea={selectedDoc.category}
                fachbereich={selectedDoc.fachbereich}
                bundesland={selectedDoc.bundesland}
                fullText={selectedDoc.fullText || selectedDoc.excerpt}
                toc={selectedDoc.toc ?? []}
                relatedProcedures={selectedDoc.relatedProcedures ?? []}
                downloads={selectedDoc.downloads ?? []}
                referencedLaws={[]}
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

KnowledgePage.displayName = "KnowledgePage";
