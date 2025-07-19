"use client";

import Link from "next/link";
import { useState } from "react";
import ProtectedRoute from "@/components/auth/protected-route";
import Header from "@/components/layout/header";
import ProgressDashboard from "@/components/progress/progress-dashboard";
import QuestCreateForm from "@/components/quest/quest-create-form";
import TaskList from "@/components/tasks/task-list";
import { useActiveQuest } from "@/hooks/useQuests";
import { useTasks } from "@/hooks/useTasks";

export default function Home() {
  const [showQuestForm, setShowQuestForm] = useState(false);
  const today = new Date().toISOString().split("T")[0];

  const {
    quest: activeQuest,
    isLoading: questLoading,
    mutate: mutateQuest,
  } = useActiveQuest();
  const {
    tasks: todayTasks,
    isLoading: tasksLoading,
    mutate: mutateTasks,
  } = useTasks(activeQuest?.id, today);

  const handleQuestCreated = () => {
    setShowQuestForm(false);
    mutateQuest(); // Revalidate quest data
    mutateTasks(); // Revalidate tasks data
  };

  const isLoading = questLoading || tasksLoading;

  if (isLoading) {
    return (
      <ProtectedRoute>
        <div className="min-h-screen bg-gray-50">
          <Header />
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        </div>
      </ProtectedRoute>
    );
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
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                    <div className="bg-blue-50 p-4 rounded-lg">
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

                    <div className="bg-green-50 p-4 rounded-lg">
                      <h3 className="text-lg font-semibold text-green-900 mb-2">
                        今日のタスク
                      </h3>
                      <p className="text-green-700 text-sm mb-4">
                        今日やるべきタスクを確認し、進捗を更新しましょう。
                      </p>
                      <Link
                        href="/checkin"
                        className="inline-block bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 transition-colors"
                      >
                        チェックインする
                      </Link>
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
                      type="button"
                      onClick={() => setShowQuestForm(true)}
                      className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
                    >
                      クエストを作成
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Progress Dashboard */}
            {activeQuest && (
              <div className="mb-6">
                <ProgressDashboard quest={activeQuest} />
              </div>
            )}

            {/* Today's Tasks */}
            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="px-4 py-5 sm:p-6">
                <TaskList
                  tasks={todayTasks}
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
