export {
  caseService,
  knowledgeService,
  documentService,
  corpusService,
  adminService,
  decisionService,
} from "./serviceFactory";

export { default as dashboardService } from "./RestDashboardService";
export type { DashboardData, DashboardStat, DashboardCase, DashboardNextTask, DashboardSuggestion } from "./RestDashboardService";

export type { CaseService, TimelineEntryData } from "./RestCaseService";
export type { KnowledgeService } from "./RestKnowledgeService";
export type { DocumentService, DocumentUploadResult } from "./RestDocumentService";
export type { CorpusService, CorpusHealthResponse, CorpusHealthSummary, ManifestSummary } from "./RestCorpusService";
export type { AdminService, SystemHealth } from "./RestAdminService";
export type { DecisionService } from "./RestDecisionService";
