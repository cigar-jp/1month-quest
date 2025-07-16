import useSWR from 'swr'
import useSWRMutation from 'swr/mutation'
import { fetcher, mutationFetcher, updateFetcher, deleteFetcher, patchFetcher } from '@/lib/swr/fetcher'
import { Database } from '@/types/database'
import { useAuth } from '@/contexts/auth-context'

type Task = Database['public']['Tables']['tasks']['Row']
type TaskInsert = Database['public']['Tables']['tasks']['Insert']
type TaskUpdate = Database['public']['Tables']['tasks']['Update']

export function useTasks(questSessionId?: string, date?: string) {
  const { user } = useAuth()
  
  const params = new URLSearchParams()
  if (questSessionId) params.append('quest_session_id', questSessionId)
  if (date) params.append('date', date)
  
  const queryString = params.toString()
  const key = user ? (queryString ? `/api/tasks?${queryString}` : '/api/tasks') : null

  const { data, error, isLoading, mutate } = useSWR<Task[]>(key, fetcher)

  return {
    tasks: data || [],
    isLoading,
    isError: error,
    mutate,
  }
}

export function useCreateTask() {
  const { trigger, isMutating, error } = useSWRMutation(
    '/api/tasks',
    mutationFetcher
  )

  const createTask = async (taskData: Omit<TaskInsert, 'user_id'>) => {
    try {
      const result = await trigger(taskData)
      return result
    } catch (error) {
      throw error
    }
  }

  return {
    createTask,
    isCreating: isMutating,
    error,
  }
}

export function useUpdateTask(taskId: string) {
  const { trigger, isMutating, error } = useSWRMutation(
    `/api/tasks/${taskId}`,
    updateFetcher
  )

  const updateTask = async (taskData: TaskUpdate) => {
    try {
      const result = await trigger(taskData)
      return result
    } catch (error) {
      throw error
    }
  }

  return {
    updateTask,
    isUpdating: isMutating,
    error,
  }
}

export function useDeleteTask(taskId: string) {
  const { trigger, isMutating, error } = useSWRMutation(
    `/api/tasks/${taskId}`,
    deleteFetcher
  )

  const deleteTask = async () => {
    try {
      const result = await trigger()
      return result
    } catch (error) {
      throw error
    }
  }

  return {
    deleteTask,
    isDeleting: isMutating,
    error,
  }
}

export function useToggleTask(taskId: string) {
  const { trigger, isMutating, error } = useSWRMutation(
    `/api/tasks/${taskId}`,
    patchFetcher
  )

  const toggleTask = async (completed: boolean) => {
    try {
      const result = await trigger({ completed })
      return result
    } catch (error) {
      throw error
    }
  }

  return {
    toggleTask,
    isToggling: isMutating,
    error,
  }
}

// Optimistic update helper
export function useTaskMutations(questSessionId?: string, date?: string) {
  const { user } = useAuth()
  const { mutate } = useTasks(questSessionId, date)

  const optimisticUpdate = (updatedTask: Task) => {
    if (!user) return
    
    mutate(
      (currentTasks) => {
        if (!currentTasks) return currentTasks
        return currentTasks.map(task => 
          task.id === updatedTask.id ? updatedTask : task
        )
      },
      false
    )
  }

  const optimisticAdd = (newTask: Task) => {
    if (!user) return
    
    mutate(
      (currentTasks) => {
        if (!currentTasks) return [newTask]
        return [...currentTasks, newTask]
      },
      false
    )
  }

  const optimisticDelete = (taskId: string) => {
    if (!user) return
    
    mutate(
      (currentTasks) => {
        if (!currentTasks) return currentTasks
        return currentTasks.filter(task => task.id !== taskId)
      },
      false
    )
  }

  return {
    optimisticUpdate,
    optimisticAdd,
    optimisticDelete,
    revalidate: () => mutate(),
  }
}