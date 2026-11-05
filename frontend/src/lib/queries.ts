import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { apiGet, apiPost } from "@/lib/api";
import type { Program, ProgramsSummary, Workforce } from "@/lib/types";

export const usePrograms = () =>
  useQuery({ queryKey: ["programs"], queryFn: () => apiGet<Program[]>("/programs"), staleTime: Infinity });

export const useProgramsSummary = () =>
  useQuery({
    queryKey: ["programs", "summary"],
    queryFn: () => apiGet<ProgramsSummary>("/programs/summary"),
    staleTime: Infinity,
  });

export const useWorkforce = () =>
  useQuery({ queryKey: ["workforce"], queryFn: () => apiGet<Workforce>("/workforce"), staleTime: 60_000 });

export function useRefreshWorkforce() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: () => apiPost<Workforce>("/workforce/refresh"),
    onSuccess: (data) => {
      qc.setQueryData(["workforce"], data);
      toast.success(data.message ?? "BLS data refreshed");
    },
    onError: () => toast.error("Could not reach the BLS API — showing saved data."),
  });
}
