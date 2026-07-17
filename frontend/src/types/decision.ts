export interface EvidenceItem {
  id: string;
  documentId: string;
  title: string;
  source: string;
  excerpt: string;
  matchedRegulation: string;
  relevanceScore: number;
  highlightedPassages: string[];
  confidence: number;
}

export interface ReasoningStep {
  id: string;
  label: string;
  status: 'pending' | 'running' | 'completed' | 'failed';
  timestamp: string;
  duration?: string;
  detail?: string;
}

export interface Citation {
  id: string;
  law: string;
  paragraph: string;
  section?: string;
  document: string;
  page?: string;
  anchor?: string;
  excerpt?: string;
  verificationStatus: 'verified' | 'unverified' | 'failed';
}

export interface ConfidenceMetrics {
  overall: number;
  coverage: number;
  ruleCompleteness: number;
  missingEvidence: string[];
  conflictingEvidence: string[];
}

export interface Recommendation {
  action: 'APPROVE' | 'REJECT' | 'REVISE' | 'REQUEST_INFO';
  summary: string;
  requiredActions: string[];
  warnings: string[];
  exceptions: string[];
  missingDocuments: string[];
  manualReviewRequired: boolean;
}

export interface DraftDocument {
  id: string;
  title: string;
  version: string;
  content: string;
  citations: Citation[];
  createdAt: string;
  previousVersionId?: string;
}

export interface ValidationResult {
  id: string;
  check: string;
  status: 'success' | 'warning' | 'error';
  detail: string;
}

export interface WorkflowState {
  phase: string;
  step: number;
  totalSteps: number;
  canProceed: boolean;
  canRegress: boolean;
}

export interface DecisionPackage {
  caseId: string;
  summary: string;
  evidence: EvidenceItem[];
  reasoning: ReasoningStep[];
  citations: Citation[];
  confidence: ConfidenceMetrics;
  recommendation: Recommendation;
  draft: DraftDocument;
  validations: ValidationResult[];
  workflow: WorkflowState;
  generatedAt: string;
  duration: string;
}
