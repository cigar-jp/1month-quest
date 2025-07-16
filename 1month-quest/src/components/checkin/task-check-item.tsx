'use client'

import { useState } from 'react'
import { Database } from '@/types/database'
import { useToggleTask } from '@/hooks/useTasks'
import { useTaskMutations } from '@/hooks/useTasks'

type Task = Database['public']['Tables']['tasks']['Row']

interface TaskCheckItemProps {
  task: Task
  disabled?: boolean
  isToday?: boolean
}

export default function TaskCheckItem({ task, disabled = false, isToday = false }: TaskCheckItemProps) {
  const [actualTime, setActualTime] = useState(task.actual_time?.toString() || '')
  const [isTimeEditing, setIsTimeEditing] = useState(false)
  
  const { toggleTask, isToggling } = useToggleTask(task.id)
  const { optimisticUpdate } = useTaskMutations(task.quest_session_id, task.date)

  const handleToggle = async (completed: boolean) => {
    const optimisticTask = { ...task, completed }
    optimisticUpdate(optimisticTask)
    
    try {
      await toggleTask(completed)
    } catch (error) {
      // Revert on error
      optimisticUpdate(task)
      console.error('Failed to toggle task:', error)
    }
  }

  const handleTimeSubmit = async () => {
    const timeValue = actualTime ? parseInt(actualTime) : null
    const optimisticTask = { ...task, actual_time: timeValue }
    optimisticUpdate(optimisticTask)
    
    try {
      const response = await fetch(`/api/tasks/${task.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          actual_time: timeValue,
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to update task time')
      }

      setIsTimeEditing(false)
    } catch (error) {
      // Revert on error
      optimisticUpdate(task)
      console.error('Failed to update task time:', error)
    }
  }

  const getPriorityColor = (priority: number) => {
    switch (priority) {
      case 1: return 'border-red-200 bg-red-50'
      case 2: return 'border-yellow-200 bg-yellow-50'
      case 3: return 'border-green-200 bg-green-50'
      default: return 'border-gray-200 bg-gray-50'
    }
  }

  const getPriorityText = (priority: number) => {
    switch (priority) {
      case 1: return { text: '高', color: 'text-red-600' }
      case 2: return { text: '中', color: 'text-yellow-600' }
      case 3: return { text: '低', color: 'text-green-600' }
      default: return { text: '-', color: 'text-gray-600' }
    }
  }

  const priorityInfo = getPriorityText(task.priority)

  return (
    <div className={`border rounded-lg p-4 transition-all duration-200 ${
      task.completed 
        ? 'border-green-200 bg-green-50' 
        : getPriorityColor(task.priority)
    } ${disabled ? 'opacity-50' : ''}`}>
      <div className="flex items-start gap-3">
        {/* Checkbox */}
        <div className="flex items-center pt-1">
          <input
            type="checkbox"
            checked={task.completed}
            onChange={(e) => handleToggle(e.target.checked)}
            disabled={disabled || isToggling}
            className="h-5 w-5 text-blue-600 focus:ring-blue-500 border-gray-300 rounded disabled:opacity-50"
          />
        </div>

        {/* Task Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <h3 className={`text-sm font-medium ${
              task.completed 
                ? 'line-through text-green-700' 
                : 'text-gray-900'
            }`}>
              {task.title}
            </h3>
            <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
              task.completed 
                ? 'bg-green-100 text-green-800' 
                : `bg-gray-100 ${priorityInfo.color}`
            }`}>
              {priorityInfo.text}
            </span>
          </div>

          {task.description && (
            <p className={`text-sm mb-2 ${
              task.completed 
                ? 'line-through text-green-600' 
                : 'text-gray-600'
            }`}>
              {task.description}
            </p>
          )}

          {/* Time Tracking */}
          <div className="flex items-center gap-4 text-xs text-gray-500">
            {task.estimated_time && (
              <span>予定: {task.estimated_time}分</span>
            )}
            
            {isTimeEditing ? (
              <div className="flex items-center gap-2">
                <span>実績:</span>
                <input
                  type="number"
                  value={actualTime}
                  onChange={(e) => setActualTime(e.target.value)}
                  className="w-16 px-2 py-1 text-xs border border-gray-300 rounded"
                  placeholder="分"
                  min="0"
                />
                <button
                  onClick={handleTimeSubmit}
                  className="px-2 py-1 text-xs bg-blue-600 text-white rounded hover:bg-blue-700"
                >
                  保存
                </button>
                <button
                  onClick={() => {
                    setIsTimeEditing(false)
                    setActualTime(task.actual_time?.toString() || '')
                  }}
                  className="px-2 py-1 text-xs bg-gray-300 text-gray-700 rounded hover:bg-gray-400"
                >
                  キャンセル
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <span>
                  実績: {task.actual_time ? `${task.actual_time}分` : '未記録'}
                </span>
                {isToday && task.completed && (
                  <button
                    onClick={() => setIsTimeEditing(true)}
                    className="text-blue-600 hover:text-blue-800"
                  >
                    編集
                  </button>
                )}
              </div>
            )}

            {task.completed_at && (
              <span>
                完了: {new Date(task.completed_at).toLocaleString('ja-JP', {
                  month: 'short',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit'
                })}
              </span>
            )}
          </div>
        </div>

        {/* Status Icon */}
        <div className="flex items-center pt-1">
          {task.completed ? (
            <div className="flex items-center justify-center w-6 h-6 bg-green-100 rounded-full">
              <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
          ) : (
            <div className="flex items-center justify-center w-6 h-6 bg-gray-100 rounded-full">
              <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}