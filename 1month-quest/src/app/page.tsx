'use client'

import { useState, useEffect } from 'react'
import ProtectedRoute from '@/components/auth/protected-route'
import Header from '@/components/layout/header'
import QuestCreateForm from '@/components/quest/quest-create-form'
import TaskList from '@/components/tasks/task-list'
import { useAuth } from '@/contexts/auth-context'
import { Database } from '@/types/database'

type QuestSession = Database['public']['Tables']['quest_sessions']['Row']
type Task = Database['public']['Tables']['tasks']['Row']

export default function Home() {
  const [showQuestForm, setShowQuestForm] = useState(false)
  const [activeQuest, setActiveQuest] = useState<QuestSession | null>(null)
  const [todayTasks, setTodayTasks] = useState<Task[]>([])
  const [loading, setLoading] = useState(true)
  const { user } = useAuth()

  const today = new Date().toISOString().split('T')[0]

  useEffect(() => {
    if (user) {
      fetchActiveQuest()
      fetchTodayTasks()
    }
  }, [user])

  const fetchActiveQuest = async () => {
    try {
      const response = await fetch('/api/quest-sessions')
      if (response.ok) {
        const quest = await response.json()
        setActiveQuest(quest)
      }
    } catch (error) {
      console.error('Error fetching active quest:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchTodayTasks = async () => {
    try {
      const response = await fetch(`/api/tasks?date=${today}`)
      if (response.ok) {
        const tasks = await response.json()
        setTodayTasks(tasks)
      }
    } catch (error) {
      console.error('Error fetching today tasks:', error)
    }
  }

  const handleQuestCreated = () => {
    setShowQuestForm(false)
    fetchActiveQuest()
    fetchTodayTasks()
  }

  const handleTaskUpdate = (updatedTask: Task) => {
    setTodayTasks(prev => prev.map(task => 
      task.id === updatedTask.id ? updatedTask : task
    ))
  }

  const handleTaskDelete = (taskId: string) => {
    setTodayTasks(prev => prev.filter(task => task.id !== taskId))
  }

  const handleTaskCreate = (newTask: Task) => {
    if (newTask.date === today) {
      setTodayTasks(prev => [...prev, newTask])
    }
  }

  if (loading) {
    return (
      <ProtectedRoute>
        <div className="min-h-screen bg-gray-50">
          <Header />
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        </div>
      </ProtectedRoute>
    )
  }

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-50">
        <Header />
        <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
          <div className="px-4 py-6 sm:px-0">
            <div className="bg-white overflow-hidden shadow rounded-lg mb-6">
              <div className="px-4 py-5 sm:p-6">
                <h1 className="text-2xl font-bold text-gray-900 mb-4">
                  1ヶ月クエスト型成長ToDoアプリ
                </h1>
                
                {activeQuest ? (
                  <div className="bg-blue-50 p-4 rounded-lg mb-6">
                    <h3 className="text-lg font-semibold text-blue-900 mb-2">
                      現在のクエスト: {activeQuest.title}
                    </h3>
                    <p className="text-blue-700 text-sm mb-2">
                      {activeQuest.description}
                    </p>
                    <div className="text-blue-600 text-sm">
                      期間: {activeQuest.start_date} ～ {activeQuest.end_date}
                    </div>
                  </div>
                ) : (
                  <div className="bg-yellow-50 p-4 rounded-lg mb-6">
                    <h3 className="text-lg font-semibold text-yellow-900 mb-2">
                      クエストを開始しましょう
                    </h3>
                    <p className="text-yellow-700 text-sm mb-4">
                      30日間の目標を設定して、新しいクエストを始めましょう。
                    </p>
                    <button
                      onClick={() => setShowQuestForm(true)}
                      className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
                    >
                      クエストを作成
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Today's Tasks */}
            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="px-4 py-5 sm:p-6">
                <TaskList
                  tasks={todayTasks}
                  onTaskUpdate={handleTaskUpdate}
                  onTaskDelete={handleTaskDelete}
                  onTaskCreate={handleTaskCreate}
                  questSessionId={activeQuest?.id}
                  selectedDate={today}
                />
              </div>
            </div>
          </div>
        </main>
      </div>

      {showQuestForm && (
        <QuestCreateForm
          onSuccess={handleQuestCreated}
          onCancel={() => setShowQuestForm(false)}
        />
      )}
    </ProtectedRoute>
  );
}
