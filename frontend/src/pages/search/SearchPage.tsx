import React, { useState, useCallback, useMemo } from "react";
import { AppShell } from "../../layouts/AppShell";
import { TopNavigation, type NavModule } from "../../components/navigation";
import { SearchBar } from "../../components/search";
import { ResultCard } from "../../components/search";
import { FilterPanel } from "../../components/search";
import { SearchSummary } from "../../components/search";
import { EmptyState } from "../../components/common";
import { searchService, type SearchResult, type SearchResponse } from "../../services/SearchService";
import styles from "./SearchPage.module.css";

const NAV_MODULES: NavModule[] = [
  { id: "home", label: "Startseite", href: "/home" },
  { id: "work", label: "Meine Arbeit", href: "/work" },
  { id: "knowledge", label: "Wissen", href: "/knowledge" },
  { id: "documents", label: "Dokumente", href: "/documents" },
  { id: "admin", label: "Verwaltung", href: "/admin" },
];

export const SearchPage: React.FC = React.memo(() => {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [totalElements, setTotalElements] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasSearched, setHasSearched] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [favorites, setFavorites] = useState<Set<string>>(new Set());

  const handleSearch = useCallback(
    async (searchQuery: string) => {
      const q = searchQuery.trim();
      if (!q) return;
      setIsLoading(true);
      setError(null);
      try {
        const response: SearchResponse = await searchService.search(q);
        setResults(response.results);
        setTotalElements(response.totalElements);
        setHasSearched(true);
      } catch (err) {
        setError((err as Error).message ?? "Suche fehlgeschlagen");
      } finally {
        setIsLoading(false);
      }
    },
    [],
  );

  const handleToggleFavorite = useCallback((id: string) => {
    setFavorites((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  const filterGroups = useMemo(
    () => [
      {
        id: "type",
        label: "Dokumenttyp",
        options: [
          { value: "all", label: "Alle", count: results.length },
          { value: "PDF", label: "PDF", count: 0 },
          { value: "DOCX", label: "DOCX", count: 0 },
        ],
      },
    ],
    [results.length],
  );

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
            { id: "profile", label: "Profil", onClick: () => {} },
            { id: "logout", label: "Abmelden", onClick: () => {} },
          ]}
          notifications={[]}
          onNotificationClick={() => {}}
          onMarkAllNotificationsRead={() => {}}
          onViewAllNotifications={() => {}}
        />
      }
    >
      <div className={styles.page}>
        <div className={styles.searchHeader}>
          <SearchBar
            value={query}
            onChange={setQuery}
            onSubmit={handleSearch}
            placeholder="Dokumente und Vorschriften durchsuchen..."
          />
        </div>

        {isLoading && <p className={styles.status}>Suche läuft...</p>}
        {error && (
          <p className={styles.error} role="alert">
            {error}
          </p>
        )}

        {hasSearched && !isLoading && !error && (
          <>
            <SearchSummary
              total={totalElements}
              filtered={results.length}
              query={query}
            />

            {results.length === 0 ? (
              <EmptyState
                title="Keine Ergebnisse"
                description="Keine Dokumente entsprechen Ihrer Suchanfrage."
                icon="search"
              />
            ) : (
              <div className={styles.resultsGrid}>
                {results.map((r) => (
                  <ResultCard
                    key={r.chunk.chunkId}
                    id={r.chunk.chunkId}
                    title={r.chunk.title}
                    type={r.provider === "hybrid" ? "Hybrid" : "Keyword"}
                    relevance={Math.round(r.score * 100)}
                    isFavorite={favorites.has(r.chunk.chunkId)}
                    authority={r.citation?.title ?? ""}
                    date=""
                    legalArea=""
                    snippet={r.text}
                    searchQuery={query}
                    isSelected={selectedId === r.chunk.chunkId}
                    onClick={setSelectedId}
                    onToggleFavorite={handleToggleFavorite}
                  />
                ))}
              </div>
            )}
          </>
        )}

        {!hasSearched && !isLoading && (
          <EmptyState
            title="Dokumentensuche"
            description="Geben Sie einen Suchbegriff ein, um Dokumente und Vorschriften zu durchsuchen."
            icon="search"
          />
        )}
      </div>
    </AppShell>
  );
});

SearchPage.displayName = "SearchPage";
