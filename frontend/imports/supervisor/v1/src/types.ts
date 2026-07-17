export interface ProtocolStep {
  id: string;
  title: string;
  description: string;
  status: 'completed' | 'pending' | 'failed';
}

export interface Attachment {
  id: string;
  name: string;
  size?: string;
  url?: string;
}

export interface VerificationItem {
  id: string;
  title: string;
  description: string;
  status: 'success' | 'warning' | 'error';
}

export interface PrecedentCase {
  caseId: string;
  date: string;
  title: string;
  description: string;
  relevance: string;
}

export interface CaseDocument {
  caseId: string;
  statusLabel: string;
  title: string;
  submittedAt: string;
  submittedBy: string;
  protocolSteps: ProtocolStep[];
  attachments: Attachment[];
  draftTitle: string;
  draftContentHtml: string;
  draftVersion: string;
  verifications: VerificationItem[];
  riskRating: 'GERING' | 'MITTEL' | 'HOCH';
  riskTitle: string;
  riskDescription: string;
  precedents: PrecedentCase[];
  recommendation: string;
}
