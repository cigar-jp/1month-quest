import useSWR from 'swr'
import useSWRMutation from 'swr/mutation'
import { fetcher, mutationFetcher, updateFetcher } from '@/lib/swr/fetcher'
import { Database } from '@/types/database'

type QuestSession = Database['public']['Tables']['quest_sessions']['Row']
type QuestSessionInsert = Database['public']['Tables']['quest_sessions']['Insert']
type QuestSessionUpdate = Database['public']['Tables']['quest_sessions']['Update']

export function useActiveQuest() {
  const { data, error, isLoading, mutate } = useSWR<QuestSession | null>(
    '/api/quest-sessions',
    fetcher
  )

  return {
    quest: data,
    isLoading,
    isError: error,
    mutate,
  }
}

export function useCreateQuest() {
  const { trigger, isMutating, error } = useSWRMutation(
    '/api/quest-sessions',
    mutationFetcher
  )

  const createQuest = async (questData: Omit<QuestSessionInsert, 'user_id'>) => {
    try {
      const result = await trigger(questData)
      return result
    } catch (error) {
      throw error
    }
  }

  return {
    createQuest,
    isCreating: isMutating,
    error,
  }
}

export function useUpdateQuest(questId: string) {
  const { trigger, isMutating, error } = useSWRMutation(
    `/api/quest-sessions/${questId}`,
    updateFetcher
  )

  const updateQuest = async (questData: QuestSessionUpdate) => {
    try {
      const result = await trigger(questData)
      return result
    } catch (error) {
      throw error
    }
  }

  return {
    updateQuest,
    isUpdating: isMutating,
    error,
  }
}