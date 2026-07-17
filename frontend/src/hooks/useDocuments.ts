import { useQuery } from '@tanstack/react-query';
import { documentService } from '../services';

export function useDocuments() {
  return useQuery({
    queryKey: ['documents'],
    queryFn: () => documentService.getAll(),
    staleTime: 30_000,
  });
}
