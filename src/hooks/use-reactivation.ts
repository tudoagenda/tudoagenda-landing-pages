import { useMutation } from "@tanstack/react-query";
import {
  reactivationService,
  ReactivationLookupResponse,
  ReactivationStartPayload,
  ReactivationStartResponse,
  ReactivationApiError,
} from "@/services/reactivation";

export type { ReactivationLookupResponse, ReactivationApiError };

export function useReactivationLookup() {
  return useMutation<ReactivationLookupResponse, ReactivationApiError, string>({
    mutationFn: (identifier: string) =>
      reactivationService.lookup(identifier) as Promise<ReactivationLookupResponse>,
  });
}

export function useReactivationStart() {
  return useMutation<
    ReactivationStartResponse,
    ReactivationApiError,
    ReactivationStartPayload
  >({
    mutationFn: (payload) =>
      reactivationService.start(payload) as Promise<ReactivationStartResponse>,
  });
}
