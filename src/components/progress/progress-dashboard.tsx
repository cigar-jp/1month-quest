"use client";

import { useState } from "react";
import { useProgressStats } from "@/hooks/useProgressStats";
import type { Database } from "@/types/database";
import CalendarView from "./calendar-view";
import ProgressBar from "./progress-bar";

type QuestSession = Database["public"]["Tables"]["quest_sessions"]["Row"];

interface ProgressDashboardProps {
  quest: QuestSession;
}

export default function ProgressDashboard({ quest }: ProgressDashboardProps) {
  const [selectedDate, setSelectedDate] = useState<string>();
  const stats = useProgressStats(quest.id);

  const getStreakIcon = (streak: number) => {
    if (streak >= 7) return "🔥";
    if (streak >= 3) return "⭐";
    if (streak >= 1) return "✨";
    return "💪";
  };

  return (
    <div className="space-y-6">
      {/* Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-lg shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">総合進捗</p>
              <p className="text-2xl font-bold text-gray-900">
                {Math.round(stats.completionRate)}%
              </p>
            </div>
            <div className="text-2xl">📊</div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">完了タスク</p>
              <p className="text-2xl font-bold text-gray-900">
                {stats.completedTasks}
              </p>
              <p className="text-xs text-gray-500">/ {stats.totalTasks}</p>
            </div>
            <div className="text-2xl">✅</div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">現在の連続記録</p>
              <p className="text-2xl font-bold text-gray-900">
                {stats.currentStreak}日
              </p>
            </div>
            <div className="text-2xl">{getStreakIcon(stats.currentStreak)}</div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">最高連続記録</p>
              <p className="text-2xl font-bold text-gray-900">
                {stats.bestStreak}日
              </p>
            </div>
            <div className="text-2xl">🏆</div>
          </div>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="bg-white p-6 rounded-lg shadow-sm">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">全体進捗</h3>
        <ProgressBar
          completed={stats.completedTasks}
          total={stats.totalTasks}
          label="タスク完了"
        />

        {stats.completionRate === 100 && (
          <div className="mt-4 p-4 bg-green-50 rounded-lg">
            <div className="flex items-center gap-2 text-green-800">
              <span className="text-2xl">🎉</span>
              <div>
                <p className="font-medium">おめでとうございます！</p>
                <p className="text-sm">すべてのタスクが完了しました！</p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Calendar View */}
      <CalendarView
        questSessionId={quest.id}
        startDate={quest.start_date}
        endDate={quest.end_date}
        selectedDate={selectedDate}
        onDateSelect={setSelectedDate}
      />

      {/* Daily Progress Chart */}
      <div className="bg-white p-6 rounded-lg shadow-sm">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          日別進捗チャート
        </h3>
        <div className="space-y-2">
          {stats.dailyStats.slice(-7).map((day) => (
            <div key={day.date} className="flex items-center gap-3">
              <div className="w-20 text-sm text-gray-600">
                {new Date(day.date).toLocaleDateString("ja-JP", {
                  month: "short",
                  day: "numeric",
                })}
              </div>
              <div className="flex-1">
                <ProgressBar
                  completed={day.completed}
                  total={day.total}
                  label=""
                  className="text-xs"
                />
              </div>
              <div className="w-12 text-xs text-gray-500 text-right">
                {Math.round(day.rate)}%
              </div>
            </div>
          ))}
        </div>

        {stats.dailyStats.length === 0 && (
          <p className="text-gray-500 text-center py-4">
            まだデータがありません
          </p>
        )}
      </div>
    </div>
  );
}
