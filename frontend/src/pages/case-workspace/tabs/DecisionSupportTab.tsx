import React from 'react';
import { Workspace, WorkspaceSection } from '../../../components/layout';
import { Panel, CitationCard, EmptyState, Spinner } from '../../../components/common';
import { DecisionWorkspace } from '../../../components/decision-support';
import { useDecisionWorkspace, useRequestAnalysis, useGenerateDraft } from '../../../hooks/useDecisionWorkspace';
import type { RegulationItemData } from '../../../mocks/case-workspace';

interface DecisionSupportTabProps {
  regulations: RegulationItemData[];
  caseId: string;
}

export const DecisionSupportTab: React.FC<DecisionSupportTabProps> = React.memo(({ regulations, caseId }) => {
  const { data, isLoading, error } = useDecisionWorkspace(caseId);
  const analyzeMutation = useRequestAnalysis(caseId);
  const draftMutation = useGenerateDraft(caseId);

  if (isLoading) {
    return (
      <Workspace>
        <Panel>
          <div style={{ display: 'flex', justifyContent: 'center', padding: 'var(--space-8)' }}>
            <Spinner size="lg" />
          </div>
        </Panel>
      </Workspace>
    );
  }

  if (error || !data) {
    return (
      <Workspace>
        <EmptyState
          title="Entscheidungsunterstützung"
          description="Die KI-gestützte Entscheidungsunterstützung wird geladen. Starten Sie eine Analyse über die Aktionsleiste."
        />
        <WorkspaceSection title="Anwendbare Vorschriften">
          <Panel>
            {regulations.map((reg) => (
              <CitationCard key={reg.id} code={reg.code} title={reg.title} />
            ))}
          </Panel>
        </WorkspaceSection>
      </Workspace>
    );
  }

  return (
    <DecisionWorkspace
      data={data}
      isLoading={analyzeMutation.isPending || draftMutation.isPending}
      onRequestAnalysis={() => analyzeMutation.mutate()}
      onGenerateDraft={() => draftMutation.mutate()}
    />
  );
});

DecisionSupportTab.displayName = 'DecisionSupportTab';
