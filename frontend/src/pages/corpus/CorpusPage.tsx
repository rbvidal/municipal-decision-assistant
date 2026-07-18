import React, { useState, useEffect, useCallback } from "react";
import { AppShell } from "../../layouts/AppShell";
import { AppTopNavigation, type NavModule } from "../../components/navigation";
import { DataTable, type DataTableColumn } from "../../components/data";
import { Panel, StatCard, Badge, Button, Alert } from "../../components/common";
import { corpusService, type CorpusHealthResponse } from "../../services";
import styles from "./CorpusPage.module.css";

const NAV_MODULES: NavModule[] = [
  { id: "home", label: "Startseite", href: "/home" },
  { id: "work", label: "Meine Arbeit", href: "/work" },
  { id: "knowledge", label: "Wissen", href: "/knowledge" },
  { id: "documents", label: "Dokumente", href: "/documents" },
  { id: "admin", label: "Verwaltung", href: "/admin", active: true },
];

export const CorpusPage: React.FC = React.memo(() => {
  const [data, setData] = useState<CorpusHealthResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const health = await corpusService.getHealth();
      setData(health);
    } catch (e) {
      setError((e as Error).message ?? "Fehler beim Laden der Corpus-Daten");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const columns: DataTableColumn<DocumentHealth>[] = [
    { key: "title", header: "Dokument", render: (d) => <strong>{d.title}</strong> },
    { key: "legalDomain", header: "Rechtsbereich", render: (d) => <span>{d.legalDomain}</span> },
    { key: "authority", header: "Behörde", render: (d) => <span>{d.authority}</span> },
    { key: "language", header: "Sprache", render: (d) => <span>{d.language}</span> },
    { key: "pageCount", header: "Seiten", render: (d) => <span>{d.pageCount}</span> },
    { key: "chunkCount", header: "Chunks", render: (d) => <span>{d.chunkCount}</span> },
    { key: "chunksWithEmbeddings", header: "Embeddings", render: (d) => <span>{d.chunksWithEmbeddings}</span> },
    { key: "chunksWithoutEmbeddings", header: "Ohne Embed.", render: (d) => <Badge status={d.chunksWithoutEmbeddings > 0 ? "warning" : "success"}>{d.chunksWithoutEmbeddings}</Badge> },
    { key: "indexedInQdrant", header: "Qdrant", render: (d) => <Badge status={d.indexedInQdrant ? "success" : "error"}>{d.indexedInQdrant ? "Ja" : "Nein"}</Badge> },
    { key: "vectorCount", header: "Vektoren", render: (d) => <span>{d.vectorCount}</span> },
    { key: "metadataCompleteness", header: "Metadaten %", render: (d) => <span>{Math.round(d.metadataCompleteness * 100)}%</span> },
    { key: "lastIndexingTime", header: "Letzte Indexierung", render: (d) => <span>{d.lastIndexingTime}</span> },
  ];

  interface DocumentHealth {
    title: string; legalDomain: string; authority: string; language: string;
    pageCount: number; chunkCount: number; chunksWithEmbeddings: number;
    chunksWithoutEmbeddings: number; indexedInQdrant: boolean; vectorCount: number;
    metadataCompleteness: number; lastIndexingTime: string; status: string;
  }

  if (error) {
    return (
      <AppShell topNavigation={<AppTopNavigation modules={NAV_MODULES} activeModule="admin" />}>
        <Panel><Alert type="error" title={error} /><Button variant="secondary" size="sm" onClick={load}>Erneut versuchen</Button></Panel>
      </AppShell>
    );
  }

  return (
    <AppShell topNavigation={<AppTopNavigation modules={NAV_MODULES} activeModule="admin" />}>
      <h1 style={{ fontSize: "1.3rem", fontWeight: 600, marginBottom: "var(--space-4)" }}>
        Corpus-Verwaltung
      </h1>

      {/* Stat cards */}
      {data && (
        <div className={styles.statsGrid}>
          <StatCard label="Dokumente" value={data.summary.documentCount} icon="folder" />
          <StatCard label="Chunks" value={data.summary.chunkCount} icon="file-text" />
          <StatCard label="Embeddings" value={data.summary.embeddedChunks} icon="layers" />
          <StatCard label="Qdrant Vektoren" value={data.summary.qdrantVectors} icon="database" />
          <StatCard
            label="Abdeckung"
            value={Math.round(data.summary.embeddingCoveragePct)}
            icon="check-circle"
          />
          <StatCard label="Ø Chunks/Dok." value={Math.round(data.summary.avgChunksPerDocument)} icon="bar-chart" />
          <StatCard label="Vektor-Dim." value={data.summary.qdrantVectorDimension} icon="code" />
          <StatCard label="Fehlende Embed." value={data.summary.missingEmbeddings} icon="alert-triangle" />
        </div>
      )}

      {/* Warnings */}
      {data && data.warnings.length > 0 && (
        <div style={{ marginBottom: "var(--space-4)" }}>
          {data.warnings.map((w, i) => <Alert key={i} type="warning" title={w} />)}
        </div>
      )}

      {/* Health categories */}
      {data && data.categories.length > 0 && (
        <div className={styles.categoriesGrid}>
          {data.categories.map((cat) => (
            <Panel key={cat.key} title={cat.label}>
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <span style={{
                  fontSize: "1.5rem", fontWeight: 700,
                  color: cat.statusClass === "green" ? "#22b07d" : cat.statusClass === "red" ? "#e54545" : "#f5a623"
                }}>{cat.count}</span>
                <span style={{ fontSize: "0.8rem", color: "var(--color-gray-500)" }}>
                  {cat.statusClass === "green" ? "OK" : cat.statusClass === "red" ? "Kritisch" : "Warnung"}
                </span>
              </div>
            </Panel>
          ))}
        </div>
      )}

      {/* Document health table */}
      <Panel title="Dokumente">
        {isLoading ? (
          <p style={{ padding: "var(--space-8)", textAlign: "center", color: "var(--color-gray-500)" }}>
            Lade Corpus-Daten...
          </p>
        ) : data ? (
          <DataTable columns={columns} data={data.documents} keyField="title" />
        ) : null}
        <div style={{ marginTop: "var(--space-3)" }}>
          <Button variant="secondary" size="sm" onClick={load} disabled={isLoading}>
            {isLoading ? "Aktualisiere..." : "Aktualisieren"}
          </Button>
        </div>
      </Panel>
    </AppShell>
  );
});

CorpusPage.displayName = "CorpusPage";
