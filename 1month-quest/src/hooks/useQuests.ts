import useSWR from "swr";
import useSWRMutation from "swr/mutation";
import { useAuth } from "@/contexts/auth-context";
import { fetcher, mutationFetcher, updateFetcher } from "@/lib/swr/fetcher";
import type { Database } from "@/types/database";

type QuestSession = Database["public"]["Tables"]["quest_sessions"]["Row"];
type QuestSessionInsert =
  Database["public"]["Tables"]["quest_sessions"]["Insert"];
type QuestSessionUpdate =
  Database["public"]["Tables"]["quest_sessions"]["Update"];

export function useActiveQuest() {
  const { user } = useAuth();

  const { data, error, isLoading, mutate } = useSWR<QuestSession | null>(
    user ? "/api/quest-sessions" : null,
    fetcher,
    {
      // Handle 404 as no active quest (not an error)
      onError: (error) => {
        if (error.status !== 404) {
          console.error("Error fetching active quest:", error);
        }
      },
    },
  );

  return {
    quest: error?.status === 404 ? null : data,
    isLoading,
    isError: error?.status !== 404 ? error : null,
    mutate,
  };
}

export function useCreateQuest() {
  const { trigger, isMutating, error } = useSWRMutation(
    "/api/quest-sessions",
    mutationFetcher,
  );

  const createQuest = async (
    questData: Omit<QuestSessionInsert, "user_id">,
  ) => {
    const result = await trigger(questData);
    return result;
  };

  return {
    createQuest,
    isCreating: isMutating,
    error,
  };
}

export function useUpdateQuest(questId: string) {
  const { trigger, isMutating, error } = useSWRMutation(
    `/api/quest-sessions/${questId}`,
    updateFetcher,
  );

  const updateQuest = async (questData: QuestSessionUpdate) => {
    const result = await trigger(questData);
    return result;
  };

  return {
    updateQuest,
    isUpdating: isMutating,
    error,
  };
}
