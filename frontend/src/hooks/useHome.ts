import { useQuery } from '@tanstack/react-query';
import { mockStats, mockVorgaenge, mockNextTask, mockSuggestions } from '../mocks/home';
import type { MockVorgang, MockStat, MockNextTask, MockSuggestion } from '../mocks/home';

interface HomeData {
  stats: MockStat[];
  vorgaenge: MockVorgang[];
  nextTask: MockNextTask;
  suggestions: MockSuggestion[];
}

export function useHomeDashboard() {
  return useQuery<HomeData>({
    queryKey: ['home', 'dashboard'],
    queryFn: async () => ({
      stats: mockStats,
      vorgaenge: mockVorgaenge,
      nextTask: mockNextTask,
      suggestions: mockSuggestions,
    }),
    staleTime: 30_000,
  });
}
