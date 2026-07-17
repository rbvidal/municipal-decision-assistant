export type VorgangStatus =
  | 'NEW'
  | 'IN_REVIEW'
  | 'DECISION_SUPPORT'
  | 'DRAFTING'
  | 'PENDING_APPROVAL'
  | 'READY_TO_SEND'
  | 'ARCHIVED'
  | 'WAITING_FOR_CITIZEN'
  | 'WAITING_FOR_AUTHORITY'
  | 'WAITING_INTERNAL';

export type DocumentStatus =
  | 'UPLOADED'
  | 'INDEXING'
  | 'READY'
  | 'FAILED';

export type DecisionSupportState =
  | 'IDLE'
  | 'ANALYZING'
  | 'ANSWER_READY'
  | 'LOW_CONFIDENCE'
  | 'FAILED';

export type NotificationState =
  | 'UNREAD'
  | 'READ'
  | 'ARCHIVED';

export type WorkflowPhase =
  | 'POSTEINGANG'
  | 'PRUEFUNG'
  | 'ENTSCHEIDUNGSUNTERSTUETZUNG'
  | 'ENTWURF'
  | 'GENEHMIGUNG'
  | 'VERSAND'
  | 'ARCHIV';

export const VORGANG_STATUS_LABELS: Record<VorgangStatus, string> = {
  NEW: 'Neu',
  IN_REVIEW: 'In Prüfung',
  DECISION_SUPPORT: 'Entscheidungsunterstützung',
  DRAFTING: 'Entwurf',
  PENDING_APPROVAL: 'Genehmigung ausstehend',
  READY_TO_SEND: 'Versandbereit',
  ARCHIVED: 'Archiviert',
  WAITING_FOR_CITIZEN: 'Wartet auf Bürger',
  WAITING_FOR_AUTHORITY: 'Wartet auf Behörde',
  WAITING_INTERNAL: 'Wartet intern',
};

export const DOCUMENT_STATUS_LABELS: Record<DocumentStatus, string> = {
  UPLOADED: 'Hochgeladen',
  INDEXING: 'Indizierung läuft',
  READY: 'Bereit',
  FAILED: 'Fehlgeschlagen',
};

export const WORKFLOW_PHASE_LABELS: Record<WorkflowPhase, string> = {
  POSTEINGANG: 'Posteingang',
  PRUEFUNG: 'Prüfung',
  ENTSCHEIDUNGSUNTERSTUETZUNG: 'Entscheidungsunterstützung',
  ENTWURF: 'Entwurf',
  GENEHMIGUNG: 'Genehmigung',
  VERSAND: 'Versand',
  ARCHIV: 'Archiv',
};
