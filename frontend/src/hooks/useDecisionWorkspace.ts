import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState, useCallback, useRef } from "react";
import { decisionService } from "../services";
import type { DecisionPackage } from "../types/decision";

export function useDecisionWorkspace(caseId: string) {
  return useQuery({
    queryKey: ["decision", caseId],
    queryFn: () => decisionService.getDecision(caseId),
    staleTime: 30_000,
    enabled: caseId !== "",
  });
}

export function useRequestAnalysis(caseId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (question: string) => decisionService.requestAnalysis(caseId, question),
    onSuccess: (data) => {
      queryClient.setQueryData(["decision", caseId], data);
    },
  });
}

export function useGenerateDraft(caseId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => decisionService.generateDraft(caseId) as Promise<DecisionPackage["draft"]>,
    onSuccess: (draft) => {
      queryClient.setQueryData(["decision", caseId], (prev: DecisionPackage | undefined) =>
        prev ? { ...prev, draft } : prev,
      );
    },
  });
}

export function useStreamingDecision(caseId: string) {
  const [streaming, setStreaming] = useState(false);
  const [partial, setPartial] = useState<Partial<DecisionPackage>>({});
  const abortRef = useRef<AbortController | null>(null);

  const startStream = useCallback(async () => {
    setStreaming(true);
    setPartial({});
    abortRef.current = new AbortController();
    try {
      await decisionService.streamDecision(
        caseId,
        (chunk) => {
          setPartial((prev) => ({ ...prev, ...chunk }));
        },
        abortRef.current.signal,
      );
    } catch {
      /* aborted or error */
    }
    setStreaming(false);
  }, [caseId]);

  const stopStream = useCallback(() => {
    abortRef.current?.abort();
    setStreaming(false);
  }, []);

  return { streaming, partial, startStream, stopStream };
}
