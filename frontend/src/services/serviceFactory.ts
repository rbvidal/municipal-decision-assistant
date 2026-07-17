import type { CaseService } from "./CaseService";
import type { KnowledgeService } from "./KnowledgeService";
import type { DocumentService } from "./DocumentService";
import type { UserService } from "./UserService";
import type { SupervisorService } from "./SupervisorService";
import type { CorpusService } from "./CorpusService";
import type { AdminService } from "./AdminService";

import { mockCaseService } from "./CaseService";
import { mockKnowledgeService } from "./KnowledgeService";
import { mockDocumentService } from "./DocumentService";
import { mockUserService } from "./UserService";
import { mockSupervisorService } from "./SupervisorService";
import { mockCorpusService } from "./CorpusService";
import { mockAdminService } from "./AdminService";

import { restCaseService } from "./RestCaseService";
import { restKnowledgeService } from "./RestKnowledgeService";
import { restDocumentService } from "./RestDocumentService";
import { restUserService } from "./RestUserService";
import { restSupervisorService } from "./RestSupervisorService";
import { restCorpusService } from "./RestCorpusService";
import { restAdminService } from "./RestAdminService";
import type { DecisionService } from "./DecisionService";
import { mockDecisionService } from "./DecisionService";
import { restDecisionService } from "./DecisionService";

const useMock = import.meta.env.VITE_USE_MOCK_SERVICES !== "false";

export const caseService: CaseService = useMock ? mockCaseService : restCaseService;
export const knowledgeService: KnowledgeService = useMock
  ? mockKnowledgeService
  : restKnowledgeService;
export const documentService: DocumentService = useMock ? mockDocumentService : restDocumentService;
export const userService: UserService = useMock ? mockUserService : restUserService;
export const supervisorService: SupervisorService = useMock
  ? mockSupervisorService
  : restSupervisorService;
export const corpusService: CorpusService = useMock ? mockCorpusService : restCorpusService;
export const adminService: AdminService = useMock ? mockAdminService : restAdminService;
export const decisionService: DecisionService = useMock ? mockDecisionService : restDecisionService;

export function isMockMode(): boolean {
  return useMock;
}
