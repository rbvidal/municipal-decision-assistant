import type { SupervisorService } from './SupervisorService';
import { apiClient } from '../api';
import type { SupervisorCase } from '../mocks/supervisor';

export const restSupervisorService: SupervisorService = {
  getAll: () => apiClient.get<SupervisorCase[]>('/api/supervisor/cases'),
  getById: (id) => apiClient.get<SupervisorCase>(`/api/supervisor/cases/${id}`),
};
