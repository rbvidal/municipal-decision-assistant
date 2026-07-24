import React, { useState, useCallback } from "react";
import { AppShell } from "../../layouts/AppShell";
import { AppTopNavigation, type NavModule } from "../../components/navigation";
import { Panel, Button, Spinner, EmptyState, Badge, ConfidenceBar } from "../../components/common";
import { Workspace, WorkspaceSection } from "../../components/layout";
import { decisionService } from "../../services";
import styles from "./AIAssistantPage.module.css";

const NAV_MODULES: NavModule[] = [
  { id: "home", label: "Startseite", href: "/home" },
  { id: "work", label: "Meine Arbeit", href: "/work" },
  { id: "knowledge", label: "Wissen", href: "/knowledge" },
  { id: "documents", label: "Dokumente", href: "/documents" },
  { id: "assistant", label: "KI-Assistent", href: "/assistant", active: true },
  { id: "admin", label: "Verwaltung", href: "/admin" },
];

interface AnalysisResult {
  caseId?: string;
  status?: "READY" | "ANSWER_READY" | "NO_EVIDENCE" | "FAILED";
  summary?: string;
  answer?: string;
  evidence?: Array<{ id: string; title: string; source: string; excerpt: string; relevanceScore: number; confidence: number }>;
  reasoning?: Array<{ id: string; label: string; status: string; timestamp: string; detail?: string }>;
  citations?: Array<{ id: string; law: string; paragraph: string; section?: string; excerpt?: string; verificationStatus: string }>;
  confidence?: { overall: number; coverage: number; ruleCompleteness: number; missingEvidence: string[] };
  recommendation?: { action: string; summary: string; warnings: string[]; missingDocuments: string[] };
  workflow?: { phase: string; step: number; totalSteps: number };
  strategy?: string;
  explanation?: string;
}

export const AIAssistantPage: React.FC = React.memo(() => {
  const [question, setQuestion] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleAnalyze = useCallback(async () => {
    if (!question.trim()) return;
    setIsLoading(true);
    setError(null);
    try {
      const data = await decisionService.requestAnalysis("assistant", question.trim()) as AnalysisResult;
      setResult(data);
    } catch (err) {
      setError((err as Error).message ?? "Analyse fehlgeschlagen");
    } finally {
      setIsLoading(false);
    }
  }, [question]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        handleAnalyze();
      }
    },
    [handleAnalyze],
  );

  return (
    <AppShell
      topNavigation={<AppTopNavigation modules={NAV_MODULES} activeModule="assistant" />}
    >
      <div className={styles.page}>
        <div className={styles.header}>
          <h1 className={styles.title}>KI-Assistent</h1>
          <p className={styles.subtitle}>
            Stellen Sie entscheidungsrelevante Fragen zu kommunalen Vorschriften, Vergaberecht,
            Bauplanung und anderen Verwaltungsthemen. Die KI analysiert Ihre Frage und liefert
            eine fundierte Antwort mit Quellennachweisen.
          </p>
        </div>

        <Workspace>
          <WorkspaceSection title="Fragestellung">
            <Panel>
              <div className={styles.questionArea}>
                <textarea
                  className={styles.questionInput}
                  value={question}
                  onChange={(e) => setQuestion(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Stellen Sie eine entscheidungsrelevante Frage an die KI..."
                  rows={3}
                  disabled={isLoading}
                />
                <div className={styles.questionActions}>
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={handleAnalyze}
                    disabled={isLoading || !question.trim()}
                  >
                    {isLoading ? "Analysiere..." : "Frage absenden"}
                  </Button>
                </div>
              </div>
            </Panel>
          </WorkspaceSection>

          {isLoading && (
            <WorkspaceSection title="Analyse">
              <Panel>
                <div className={styles.loadingArea}>
                  <Spinner size="lg" />
                  <p className={styles.loadingText}>
                    Die KI analysiert Ihre Fragestellung — Recherche, Reasoning und Validierung...
                  </p>
                </div>
              </Panel>
            </WorkspaceSection>
          )}

          {error && (
            <WorkspaceSection title="Fehler">
              <Panel>
                <p className={styles.errorText}>{error}</p>
              </Panel>
            </WorkspaceSection>
          )}

          {!isLoading && !result && !error && (
            <EmptyState
              title="KI-gestützte Entscheidungsunterstützung"
              description="Das System nutzt hybrides Retrieval (Keyword, Vektor, Graph), Reranking und eine Rule Engine, um Ihre Fragen zu beantworten. Alle Antworten werden mit Quellenzitaten belegt."
            />
          )}

          {result && !isLoading && (
            <>
              {result.status === "FAILED" && (
                <WorkspaceSection title="Fehler">
                  <Panel>
                    <p className={styles.errorText}>{result.answer || result.summary || "Reasoning failed — an unexpected error occurred."}</p>
                  </Panel>
                </WorkspaceSection>
              )}

              {result.status === "NO_EVIDENCE" && (
                <WorkspaceSection title="Keine Nachweise">
                  <Panel>
                    <p className={styles.answer}>{result.answer || "No relevant evidence found. Please try rephrasing your question."}</p>
                  </Panel>
                </WorkspaceSection>
              )}

              {result.strategy && (
                <WorkspaceSection title="Strategie">
                  <Panel>
                    <div className={styles.strategyRow}>
                      <Badge status="info">{result.strategy}</Badge>
                      {result.explanation && (
                        <span className={styles.explanation}>{result.explanation}</span>
                      )}
                    </div>
                  </Panel>
                </WorkspaceSection>
              )}

              {result.status !== "FAILED" && result.status !== "NO_EVIDENCE" && (
                <WorkspaceSection title="Antwort">
                  <Panel>
                    <p className={styles.answer}>{result.answer || result.summary}</p>
                  </Panel>
                </WorkspaceSection>
              )}

              {(result.evidence ?? []).length > 0 && (
                <WorkspaceSection title="Evidenz">
                  {(result.evidence ?? []).map((item) => (
                    <Panel
                      key={item.id}
                      title={item.title}
                      headerAction={
                        <Badge status="success">{Math.round(item.relevanceScore * 100)}% relevant</Badge>
                      }
                    >
                      <p className={styles.excerpt}>{item.excerpt}</p>
                      <div className={styles.metaRow}>
                        <span>Quelle: {item.source}</span>
                      </div>
                      <ConfidenceBar
                        value={Math.round(item.confidence * 100)}
                        ariaLabel={`Konfidenz: ${Math.round(item.confidence * 100)}%`}
                      />
                    </Panel>
                  ))}
                </WorkspaceSection>
              )}

              {(result.citations ?? []).length > 0 && (
                <WorkspaceSection title="Zitate & Validierung">
                  {(result.citations ?? []).map((c) => (
                    <div key={c.id} className={styles.citationRow}>
                      <div>
                        <span className={styles.citationLaw}>
                          {c.law} {c.paragraph}{c.section ? ` ${c.section}` : ""}
                        </span>
                        {c.excerpt && <span className={styles.citationExcerpt}> — {c.excerpt}</span>}
                      </div>
                      <Badge
                        status={
                          c.verificationStatus === "verified" ? "success"
                          : c.verificationStatus === "failed" ? "error"
                          : "warning"
                        }
                      >
                        {c.verificationStatus === "verified" ? "Verifiziert"
                        : c.verificationStatus === "failed" ? "Fehlgeschlagen"
                        : "Ungeprüft"}
                      </Badge>
                    </div>
                  ))}
                </WorkspaceSection>
              )}

              {result.confidence && (
                <WorkspaceSection title="Konfidenz">
                  <Panel>
                    <div className={styles.confidenceGrid}>
                      <div>
                        <span className={styles.confLabel}>Gesamt</span>
                        <ConfidenceBar value={Math.round(result.confidence.overall * 100)} />
                      </div>
                      <div>
                        <span className={styles.confLabel}>Abdeckung</span>
                        <ConfidenceBar value={Math.round(result.confidence.coverage * 100)} />
                      </div>
                      <div>
                        <span className={styles.confLabel}>Regelvollständigkeit</span>
                        <ConfidenceBar value={Math.round(result.confidence.ruleCompleteness * 100)} />
                      </div>
                    </div>
                    {(result.confidence.missingEvidence ?? []).length > 0 && (
                      <div className={styles.mt2}>
                        <span className={styles.warningLabel}>Fehlende Evidenz: </span>
                        {result.confidence.missingEvidence.join(", ")}
                      </div>
                    )}
                  </Panel>
                </WorkspaceSection>
              )}

              {result.recommendation && (
                <WorkspaceSection title="Empfehlung">
                  <Panel>
                    <Badge
                      status={
                        result.recommendation.action === "APPROVE" ? "success"
                        : result.recommendation.action === "REJECT" ? "error"
                        : "warning"
                      }
                    >
                      {result.recommendation.action === "APPROVE" ? "GENEHMIGEN"
                      : result.recommendation.action === "REJECT" ? "ABLEHNEN"
                      : result.recommendation.action === "REVISE" ? "ÜBERARBEITEN"
                      : "INFO ANFORDERN"}
                    </Badge>
                    <p className={styles.answer}>{result.recommendation.summary}</p>
                    {(result.recommendation.warnings ?? []).map((w, i) => (
                      <p key={i} className={styles.warningText}>Warnung: {w}</p>
                    ))}
                  </Panel>
                </WorkspaceSection>
              )}
            </>
          )}
        </Workspace>
      </div>
    </AppShell>
  );
});

AIAssistantPage.displayName = "AIAssistantPage";
