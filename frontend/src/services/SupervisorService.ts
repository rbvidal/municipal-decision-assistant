import type { SupervisorCase } from '../mocks/supervisor';
import { supervisorCases } from '../mocks/supervisor';

export interface SupervisorService {
  getAll(): Promise<SupervisorCase[]>;
  getById(id: string): Promise<SupervisorCase | null>;
}

export const mockSupervisorService: SupervisorService = {
  getAll: async () => supervisorCases,
  getById: async (id) => supervisorCases.find((c) => c.caseId === id) ?? null,
};
