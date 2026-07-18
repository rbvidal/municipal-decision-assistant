import React, { useState, useCallback } from "react";
import { AppShell } from "../../layouts/AppShell";
import { AppTopNavigation, type NavModule } from "../../components/navigation";
import { SearchBar, ResultCard, SearchSummary } from "../../components/search";
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
  const [documentType, setDocumentType] = useState("all");
  const [domain, setDomain] = useState("all");

  const handleSearch = useCallback(
    async (searchQuery?: string) => {
      const q = (searchQuery ?? query).trim();
      if (!q) return;
      setIsLoading(true);
      setError(null);
      try {
        const typeParam = documentType !== "all" ? documentType : undefined;
        const response: SearchResponse = await searchService.search(q, typeParam);
        setResults(response.results);
        setTotalElements(response.totalElements);
        setHasSearched(true);
      } catch (err) {
        setError((err as Error).message ?? "Suche fehlgeschlagen");
      } finally {
        setIsLoading(false);
      }
    },
    [query, documentType],
  );

  const handleToggleFavorite = useCallback((id: string) => {
    setFavorites((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  return (
    <AppShell
      topNavigation={
        <AppTopNavigation modules={NAV_MODULES} activeModule="documents" />
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
          <div className={styles.filterRow}>
            <select
              className={styles.filterSelect}
              value={documentType}
              onChange={(e) => setDocumentType(e.target.value)}
              aria-label="Dokumenttyp filtern"
            >
              <option value="all">Alle Dokumenttypen</option>
              <option value="PDF">PDF</option>
              <option value="DOCX">DOCX</option>
              <option value="TXT">TXT</option>
              <option value="HTML">HTML</option>
            </select>
            <select
              className={styles.filterSelect}
              value={domain}
              onChange={(e) => setDomain(e.target.value)}
              aria-label="Fachbereich filtern"
            >
              <option value="all">Alle Fachbereiche</option>
              <option value="building">Bauen & Stadtplanung</option>
              <option value="procurement">Öffentliche Beschaffung</option>
              <option value="hr">Personal & Verwaltung</option>
            </select>
          </div>
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
