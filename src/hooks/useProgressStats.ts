import { useMemo } from "react";
import type { Database } from "@/types/database";
import { useTasks } from "./useTasks";

type Task = Database["public"]["Tables"]["tasks"]["Row"];

interface ProgressStats {
  totalTasks: number;
  completedTasks: number;
  completionRate: number;
  streakDays: number;
  currentStreak: number;
  bestStreak: number;
  dailyStats: {
    date: string;
    completed: number;
    total: number;
    rate: number;
  }[];
}

export function useProgressStats(questSessionId?: string): ProgressStats {
  const { tasks } = useTasks(questSessionId);

  return useMemo(() => {
    if (!tasks || tasks.length === 0) {
      return {
        totalTasks: 0,
        completedTasks: 0,
        completionRate: 0,
        streakDays: 0,
        currentStreak: 0,
        bestStreak: 0,
        dailyStats: [],
      };
    }

    // Basic stats
    const totalTasks = tasks.length;
    const completedTasks = tasks.filter((task) => task.completed).length;
    const completionRate =
      totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;

    // Group tasks by date
    const tasksByDate = tasks.reduce(
      (acc, task) => {
        if (!acc[task.date]) {
          acc[task.date] = [];
        }
        acc[task.date].push(task);
        return acc;
      },
      {} as Record<string, Task[]>,
    );

    // Calculate daily stats
    const dailyStats = Object.entries(tasksByDate)
      .map(([date, dayTasks]) => {
        const completed = dayTasks.filter((task) => task.completed).length;
        const total = dayTasks.length;
        return {
          date,
          completed,
          total,
          rate: total > 0 ? (completed / total) * 100 : 0,
        };
      })
      .sort((a, b) => a.date.localeCompare(b.date));

    // Calculate streaks (days with 100% completion)
    const perfectDays = dailyStats
      .filter((day) => day.rate === 100)
      .map((day) => day.date);
    const today = new Date().toISOString().split("T")[0];

    let currentStreak = 0;
    let bestStreak = 0;
    let tempStreak = 0;

    // Calculate current streak (backwards from today)
    const sortedDates = dailyStats.map((d) => d.date).sort();
    const todayIndex = sortedDates.indexOf(today);

    if (todayIndex >= 0) {
      for (let i = todayIndex; i >= 0; i--) {
        const date = sortedDates[i];
        const dayStats = dailyStats.find((d) => d.date === date);
        if (dayStats && dayStats.rate === 100) {
          currentStreak++;
        } else {
          break;
        }
      }
    }

    // Calculate best streak
    for (const date of sortedDates) {
      const dayStats = dailyStats.find((d) => d.date === date);
      if (dayStats && dayStats.rate === 100) {
        tempStreak++;
        bestStreak = Math.max(bestStreak, tempStreak);
      } else {
        tempStreak = 0;
      }
    }

    return {
      totalTasks,
      completedTasks,
      completionRate,
      streakDays: perfectDays.length,
      currentStreak,
      bestStreak,
      dailyStats,
    };
  }, [tasks]);
}
