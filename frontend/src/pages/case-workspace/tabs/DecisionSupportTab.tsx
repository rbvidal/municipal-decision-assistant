import React, { useState, useCallback } from "react";
import { Workspace, WorkspaceSection } from "../../../components/layout";
import { Panel, CitationCard, EmptyState, Spinner, Button } from "../../../components/common";
import { DecisionWorkspace } from "../../../components/decision-support";
import {
  useDecisionWorkspace,
  useRequestAnalysis,
  useGenerateDraft,
  useStreamingDecision,
} from "../../../hooks/useDecisionWorkspace";
import type { DecisionPackage } from "../../../types/decision";
import styles from "./DecisionSupportTab.module.css";

interface DecisionSupportTabProps {
  regulations: { id: string; code: string; title: string }[];
  caseId: string;
}

export const DecisionSupportTab: React.FC<DecisionSupportTabProps> = React.memo(
  ({ regulations, caseId }) => {
    const { data, isLoading, error } = useDecisionWorkspace(caseId);
    const analyzeMutation = useRequestAnalysis(caseId);
    const draftMutation = useGenerateDraft(caseId);
    const { streaming, partial, startStream, stopStream } = useStreamingDecision(caseId);

    const [question, setQuestion] = useState("");
    const [activeStream, setActiveStream] = useState(false);

    const handleAnalyze = useCallback(() => {
      if (!question.trim()) return;
      if (activeStream) {
        startStream();
      } else {
        analyzeMutation.mutate(question.trim());
      }
    }, [question, activeStream, analyzeMutation, startStream]);

    const handleKeyDown = useCallback(
      (e: React.KeyboardEvent) => {
        if (e.key === "Enter" && !e.shiftKey) {
          e.preventDefault();
          handleAnalyze();
        }
      },
      [handleAnalyze],
    );

    const isProcessing = analyzeMutation.isPending || streaming;

    // Merge streaming partial data with existing data
    const displayData: DecisionPackage | undefined =
      streaming && partial && data
        ? ({ ...data, ...partial } as unknown as DecisionPackage)
        : (data as unknown as DecisionPackage | undefined);

    return (
      <Workspace>
        {/* Question Input */}
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
                disabled={isProcessing}
              />
              <div className={styles.questionActions}>
                <label className={styles.streamToggle}>
                  <input
                    type="checkbox"
                    checked={activeStream}
                    onChange={(e) => setActiveStream(e.target.checked)}
                  />
                  <span>SSE Streaming</span>
                </label>
                <Button
                  variant="primary"
                  size="sm"
                  onClick={handleAnalyze}
                  disabled={isProcessing || !question.trim()}
                >
                  {isProcessing ? "Analysiere..." : "Frage absenden"}
                </Button>
                {streaming && (
                  <Button variant="secondary" size="sm" onClick={stopStream}>
                    Abbrechen
                  </Button>
                )}
              </div>
            </div>
          </Panel>
        </WorkspaceSection>

        {/* Loading State */}
        {isProcessing && !displayData && (
          <WorkspaceSection title="Analyse">
            <Panel>
              <div className={styles.loadingArea}>
                <Spinner size="lg" />
                <p className={styles.loadingText}>
                  {streaming
                    ? "SSE-Stream läuft — Daten werden empfangen..."
                    : "Die KI analysiert Ihre Fragestellung..."}
                </p>
              </div>
            </Panel>
          </WorkspaceSection>
        )}

        {/* Error / Empty State */}
        {!isProcessing && (error || (!data && !isLoading)) && (
          <>
            <EmptyState
              title="Entscheidungsunterstützung"
              description="Stellen Sie eine Frage, um eine KI-gestützte Entscheidungsunterstützung mit Evidenzquellen, Reasoning-Schritten und Konfidenzanalyse zu erhalten."
            />
            {regulations.length > 0 && (
              <WorkspaceSection title="Anwendbare Vorschriften">
                <Panel>
                  {regulations.map((reg) => (
                    <CitationCard key={reg.id} code={reg.code} title={reg.title} />
                  ))}
                </Panel>
              </WorkspaceSection>
            )}
          </>
        )}

        {/* Loading spinner for initial load */}
        {isLoading && !isProcessing && (
          <Workspace>
            <Panel>
              <div className={styles.loadingArea}>
                <Spinner size="lg" />
              </div>
            </Panel>
          </Workspace>
        )}

        {/* Decision Workspace */}
        {displayData && !isLoading && (
          <DecisionWorkspace
            data={displayData}
            isLoading={isProcessing}
            isStreaming={streaming}
            onRequestAnalysis={handleAnalyze}
            onGenerateDraft={() => draftMutation.mutate()}
          />
        )}
      </Workspace>
    );
  },
);

DecisionSupportTab.displayName = "DecisionSupportTab";
