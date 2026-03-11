import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { ScoreEntry } from "../backend.d";
import { useActor } from "./useActor";

export function useGetTopScores() {
  const { actor, isFetching } = useActor();
  return useQuery<ScoreEntry[]>({
    queryKey: ["topScores"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getTopScores();
    },
    enabled: !!actor && !isFetching,
    staleTime: 30_000,
  });
}

export function useSubmitScore() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ name, score }: { name: string; score: number }) => {
      if (!actor) throw new Error("No actor");
      await actor.submitScore(name, BigInt(score));
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["topScores"] });
    },
  });
}

export function useGetDailyChallengeSeed() {
  const { actor, isFetching } = useActor();
  const today = BigInt(Math.floor(Date.now() / 86400000));
  return useQuery<bigint>({
    queryKey: ["dailySeed", today.toString()],
    queryFn: async () => {
      if (!actor) return 0n;
      return actor.getDailyChallengeSeed(today);
    },
    enabled: !!actor && !isFetching,
    staleTime: 86_400_000,
  });
}
