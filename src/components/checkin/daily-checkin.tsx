"use client";

import { format } from "date-fns";
import { ja } from "date-fns/locale";
import { useState } from "react";
import { useAuth } from "@/contexts/auth-context";
import { useActiveQuest } from "@/hooks/useQuests";
import { useTasks } from "@/hooks/useTasks";
import TaskCheckItem from "./task-check-item";

export default function DailyCheckin() {
  const [selectedDate, setSelectedDate] = useState(
    new Date().toISOString().split("T")[0],
  );
  const { user } = useAuth();
  const { quest } = useActiveQuest();
  const { tasks, isLoading } = useTasks(quest?.id, selectedDate);

  // Don't render until user is authenticated
  if (!user) {
    return (
      <div className="bg-white rounded-lg shadow-sm p-6 text-center">
        <p className="text-gray-500">認証が必要です</p>
      </div>
    );
  }

  const completedTasks = tasks.filter((task) => task.completed);
  const completionRate =
    tasks.length > 0
      ? Math.round((completedTasks.length / tasks.length) * 100)
      : 0;

  const today = new Date().toISOString().split("T")[0];
  const isToday = selectedDate === today;
  const isPast = selectedDate < today;
  const isFuture = selectedDate > today;

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return format(date, "M月d日(E)", { locale: ja });
  };

  const getDateStatus = () => {
    if (isToday) return { color: "text-blue-600", label: "今日" };
    if (isPast) return { color: "text-gray-500", label: "過去" };
    return { color: "text-orange-500", label: "未来" };
  };

  const dateStatus = getDateStatus();

  if (!quest) {
    return (
      <div className="bg-white rounded-lg shadow-sm p-6 text-center">
        <p className="text-gray-500">クエストを開始してください</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm">
      {/* Header */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-gray-900">
            日次チェックイン
          </h2>
          <div className="flex items-center gap-2">
            <span className={`text-sm font-medium ${dateStatus.color}`}>
              {dateStatus.label}
            </span>
          </div>
        </div>

        {/* Date Selector */}
        <div className="flex items-center gap-4 mb-4">
          <label htmlFor="date" className="text-sm font-medium text-gray-700">
            日付を選択:
          </label>
          <input
            id="date"
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            min={quest.start_date}
            max={quest.end_date}
            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <span className="text-sm text-gray-600">
            {formatDate(selectedDate)}
          </span>
        </div>

        {/* Progress Summary */}
        <div className="bg-gray-50 rounded-lg p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-700">進捗状況</span>
            <span className="text-sm font-semibold text-gray-900">
              {completedTasks.length} / {tasks.length} 完了
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${completionRate}%` }}
            />
          </div>
          <div className="flex justify-between text-xs text-gray-500 mt-1">
            <span>0%</span>
            <span className="font-medium">{completionRate}%</span>
            <span>100%</span>
          </div>
        </div>
      </div>

      {/* Task List */}
      <div className="p-6">
        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        ) : tasks.length > 0 ? (
          <div className="space-y-3">
            {tasks.map((task) => (
              <TaskCheckItem
                key={task.id}
                task={task}
                disabled={isFuture}
                isToday={isToday}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-gray-500">
            <p>この日にはタスクがありません</p>
            {isToday && (
              <p className="text-sm mt-2">新しいタスクを追加してください</p>
            )}
          </div>
        )}
      </div>

      {/* Footer Info */}
      <div className="px-6 py-4 bg-gray-50 border-t border-gray-200">
        <div className="flex items-center justify-between text-sm text-gray-600">
          <span>
            クエスト期間: {formatDate(quest.start_date)} 〜{" "}
            {formatDate(quest.end_date)}
          </span>
          {isToday && (
            <span className="text-blue-600 font-medium">
              今日の目標を達成しましょう！
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
