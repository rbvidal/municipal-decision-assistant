import React from 'react';
import { Workspace, WorkspaceSection } from '../../layout';
import { Panel, Alert, Badge, Button, Icon, ConfidenceBar, ProgressIndicator } from '../../common';
import type { DecisionPackage } from '../../../types/decision';
import styles from './DecisionWorkspace.module.css';

interface DecisionWorkspaceProps {
  data: DecisionPackage;
  isLoading?: boolean;
  onRequestAnalysis?: () => void;
  onGenerateDraft?: () => void;
  className?: string;
}

export const DecisionWorkspace: React.FC<DecisionWorkspaceProps> = React.memo(({
  data, isLoading, onRequestAnalysis, onGenerateDraft, className,
}) => (
  <Workspace className={className}>
    <WorkspaceSection title="Zusammenfassung">
      <Panel>
        <p className={styles.summary}>{data.summary}</p>
        <div className={styles.metaRow}>
          <span className={styles.metaItem}>Generiert: {data.generatedAt}</span>
          <span className={styles.metaItem}>Dauer: {data.duration}</span>
          <Badge status="info">Phase: {data.workflow.step}/{data.workflow.totalSteps}</Badge>
        </div>
      </Panel>
    </WorkspaceSection>

    <WorkspaceSection title="Evidenz">
      {data.evidence.map((item) => (
        <Panel key={item.id} title={item.title} headerAction={
          <Badge status="success">{Math.round(item.relevanceScore * 100)}% relevant</Badge>
        }>
          <p className={styles.excerpt}>{item.excerpt}</p>
          <div className={styles.metaRow}>
            <span className={styles.metaItem}>Quelle: {item.source}</span>
            <span className={styles.metaItem}>Vorschrift: {item.matchedRegulation}</span>
          </div>
          <div className={styles.highlights}>
            {item.highlightedPassages.map((p, i) => (
              <span key={i} className={styles.highlight}>{p}</span>
            ))}
          </div>
          <ConfidenceBar value={Math.round(item.confidence * 100)} ariaLabel={`Konfidenz: ${Math.round(item.confidence * 100)}%`} />
        </Panel>
      ))}
    </WorkspaceSection>

    <WorkspaceSection title="Reasoning">
      <div className={styles.reasoningList}>
        {data.reasoning.map((step) => (
          <div key={step.id} className={styles.reasoningStep}>
            <div className={`${styles.stepDot} ${styles[`step-${step.status}`]}`}>
              {step.status === 'completed' ? <Icon name="check" size={10} /> : step.status === 'running' ? <Icon name="loader" size={10} /> : step.status === 'failed' ? <Icon name="x" size={10} /> : <span className={styles.dotBlank} />}
            </div>
            <div className={styles.stepContent}>
              <span className={styles.stepLabel}>{step.label}</span>
              {step.detail && <span className={styles.stepDetail}>{step.detail}</span>}
              <span className={styles.stepTime}>{step.timestamp} {step.duration ? `· ${step.duration}` : ''}</span>
            </div>
          </div>
        ))}
      </div>
    </WorkspaceSection>

    <WorkspaceSection title="Zitate & Validierung">
      {data.citations.map((c) => (
        <div key={c.id} className={styles.citationRow}>
          <div className={styles.citationInfo}>
            <span className={styles.citationLaw}>{c.law} {c.paragraph}{c.section ? ` ${c.section}` : ''}</span>
            {c.excerpt && <span className={styles.citationExcerpt}>{c.excerpt}</span>}
          </div>
          <Badge status={c.verificationStatus === 'verified' ? 'success' : c.verificationStatus === 'failed' ? 'error' : 'warning'}>
            {c.verificationStatus === 'verified' ? 'Verifiziert' : c.verificationStatus === 'failed' ? 'Fehlgeschlagen' : 'Ungeprüft'}
          </Badge>
        </div>
      ))}

      <div className={styles.mt3}>
        {data.validations.map((v) => (
          <div key={v.id} className={styles.validationRow}>
            <Icon name={v.status === 'success' ? 'check-circle' : v.status === 'warning' ? 'alert-triangle' : 'alert-circle'} size={14}
              className={v.status === 'success' ? styles.valSuccess : v.status === 'warning' ? styles.valWarning : styles.valError} />
            <span className={styles.valCheck}>{v.check}</span>
            <span className={styles.valDetail}>{v.detail}</span>
          </div>
        ))}
      </div>
    </WorkspaceSection>

    <WorkspaceSection title="Konfidenz">
      <Panel>
        <div className={styles.confidenceGrid}>
          <div className={styles.confItem}>
            <span className={styles.confLabel}>Gesamt</span>
            <span className={styles.confValue}>{Math.round(data.confidence.overall * 100)}%</span>
            <ProgressIndicator value={Math.round(data.confidence.overall * 100)} size="sm" />
          </div>
          <div className={styles.confItem}>
            <span className={styles.confLabel}>Abdeckung</span>
            <span className={styles.confValue}>{Math.round(data.confidence.coverage * 100)}%</span>
            <ProgressIndicator value={Math.round(data.confidence.coverage * 100)} size="sm" />
          </div>
          <div className={styles.confItem}>
            <span className={styles.confLabel}>Regelvollständigkeit</span>
            <span className={styles.confValue}>{Math.round(data.confidence.ruleCompleteness * 100)}%</span>
            <ProgressIndicator value={Math.round(data.confidence.ruleCompleteness * 100)} size="sm" />
          </div>
        </div>
        {data.confidence.missingEvidence.length > 0 && (
          <Alert type="warning" title="Fehlende Evidenz" description={data.confidence.missingEvidence.join(', ')} />
        )}
      </Panel>
    </WorkspaceSection>

    <WorkspaceSection title="Empfehlung">
      <Panel>
        <div className={styles.recommendationHeader}>
          <Badge status={data.recommendation.action === 'APPROVE' ? 'success' : data.recommendation.action === 'REJECT' ? 'error' : 'warning'}>
            {data.recommendation.action === 'APPROVE' ? 'GENEHMIGEN' : data.recommendation.action === 'REJECT' ? 'ABLEHNEN' : data.recommendation.action === 'REVISE' ? 'ÜBERARBEITEN' : 'INFO ANFORDERN'}
          </Badge>
        </div>
        <p className={styles.recommendationText}>{data.recommendation.summary}</p>
        {data.recommendation.warnings.map((w, i) => (
          <Alert key={i} type="warning" title={w} />
        ))}
        {data.recommendation.missingDocuments.map((d, i) => (
          <Alert key={i} type="error" title={`Fehlend: ${d}`} />
        ))}
        {data.recommendation.manualReviewRequired && (
          <Alert type="info" title="Manuelle Prüfung erforderlich" description="Dieser Vorgang erfordert eine manuelle Prüfung durch den Sachbearbeiter." />
        )}
        <div className={styles.mt3}>
          <Button variant="primary" size="sm" onClick={onRequestAnalysis} disabled={isLoading}>
            {isLoading ? 'Analysiere...' : 'Analyse starten'}
          </Button>
        </div>
      </Panel>
    </WorkspaceSection>

    <WorkspaceSection title="Entwurf">
      <Panel title={`${data.draft.title} (${data.draft.version})`}>
        <pre className={styles.draftContent}>{data.draft.content}</pre>
        <Button variant="secondary" size="sm" onClick={onGenerateDraft}>Entwurf neu generieren</Button>
      </Panel>
    </WorkspaceSection>
  </Workspace>
));

DecisionWorkspace.displayName = 'DecisionWorkspace';
