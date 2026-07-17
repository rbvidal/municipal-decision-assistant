import { useQuery } from '@tanstack/react-query';
import { corpusService } from '../services';

export function useCorpusPackages() {
  return useQuery({
    queryKey: ['corpus', 'packages'],
    queryFn: () => corpusService.getPackages(),
    staleTime: 30_000,
  });
}

export function useCorpusMetrics() {
  return useQuery({
    queryKey: ['corpus', 'metrics'],
    queryFn: () => corpusService.getMetrics(),
    staleTime: 15_000,
  });
}

export function useCorpusJobs() {
  return useQuery({
    queryKey: ['corpus', 'jobs'],
    queryFn: () => corpusService.getJobs(),
    staleTime: 15_000,
  });
}

export function useCorpusAuditLogs() {
  return useQuery({
    queryKey: ['corpus', 'audit'],
    queryFn: () => corpusService.getAuditLogs(),
    staleTime: 30_000,
  });
}
