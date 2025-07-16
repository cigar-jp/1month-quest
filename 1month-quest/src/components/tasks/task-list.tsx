'use client'

import { useState } from 'react'
import { Database } from '@/types/database'
import TaskItem from './task-item'
import TaskCreateForm from './task-create-form'
import { useTaskMutations } from '@/hooks/useTasks'

type Task = Database['public']['Tables']['tasks']['Row']

interface TaskListProps {
  tasks: Task[]
  questSessionId?: string
  selectedDate?: string
}

export default function TaskList({
  tasks,
  questSessionId,
  selectedDate
}: TaskListProps) {
  const [showCreateForm, setShowCreateForm] = useState(false)
  const { optimisticUpdate, optimisticAdd, optimisticDelete, revalidate } = useTaskMutations(questSessionId, selectedDate)

  const handleTaskCreate = (newTask: Task) => {
    optimisticAdd(newTask)
    setShowCreateForm(false)
    revalidate()
  }

  const completedTasks = tasks.filter(task => task.completed)
  const incompleteTasks = tasks.filter(task => !task.completed)

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-lg font-semibold text-gray-900">
          {selectedDate ? `${selectedDate} のタスク` : 'すべてのタスク'}
        </h2>
        <button
          onClick={() => setShowCreateForm(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
        >
          新しいタスクを追加
        </button>
      </div>

      {/* Progress bar */}
      {tasks.length > 0 && (
        <div className="bg-gray-200 rounded-full h-2">
          <div
            className="bg-blue-600 h-2 rounded-full transition-all duration-300"
            style={{ width: `${(completedTasks.length / tasks.length) * 100}%` }}
          />
        </div>
      )}

      {/* Task sections */}
      <div className="space-y-4">
        {incompleteTasks.length > 0 && (
          <div>
            <h3 className="text-sm font-medium text-gray-700 mb-2">
              未完了のタスク ({incompleteTasks.length})
            </h3>
            <div className="space-y-2">
              {incompleteTasks.map((task) => (
                <TaskItem
                  key={task.id}
                  task={task}
                  onOptimisticUpdate={optimisticUpdate}
                  onOptimisticDelete={optimisticDelete}
                />
              ))}
            </div>
          </div>
        )}

        {completedTasks.length > 0 && (
          <div>
            <h3 className="text-sm font-medium text-gray-700 mb-2">
              完了したタスク ({completedTasks.length})
            </h3>
            <div className="space-y-2">
              {completedTasks.map((task) => (
                <TaskItem
                  key={task.id}
                  task={task}
                  onOptimisticUpdate={optimisticUpdate}
                  onOptimisticDelete={optimisticDelete}
                />
              ))}
            </div>
          </div>
        )}

        {tasks.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            <p>まだタスクがありません</p>
            <p className="text-sm">新しいタスクを追加してください</p>
          </div>
        )}
      </div>

      {showCreateForm && (
        <TaskCreateForm
          onSuccess={handleTaskCreate}
          onCancel={() => setShowCreateForm(false)}
          questSessionId={questSessionId}
          defaultDate={selectedDate}
        />
      )}
    </div>
  )
}