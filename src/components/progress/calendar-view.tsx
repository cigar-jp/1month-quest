"use client";

import { useMemo } from "react";
import { useTasks } from "@/hooks/useTasks";
import type { Database } from "@/types/database";

type Task = Database["public"]["Tables"]["tasks"]["Row"];

interface CalendarViewProps {
  questSessionId: string;
  startDate: string;
  endDate: string;
  onDateSelect?: (date: string) => void;
  selectedDate?: string;
}

interface DayData {
  date: string;
  dayOfMonth: number;
  isToday: boolean;
  isInRange: boolean;
  tasks: Task[];
  completedTasks: number;
  totalTasks: number;
  completionRate: number;
}

export default function CalendarView({
  questSessionId,
  startDate,
  endDate,
  onDateSelect,
  selectedDate,
}: CalendarViewProps) {
  const { tasks } = useTasks(questSessionId);

  const calendarData = useMemo(() => {
    const start = new Date(startDate);
    const end = new Date(endDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Get first day of the month and calculate calendar grid
    const firstDay = new Date(start.getFullYear(), start.getMonth(), 1);
    const lastDay = new Date(end.getFullYear(), end.getMonth() + 1, 0);

    // Calculate days to show (including padding for week alignment)
    const startDay = new Date(firstDay);
    startDay.setDate(startDay.getDate() - firstDay.getDay()); // Start from Sunday

    const endDay = new Date(lastDay);
    endDay.setDate(endDay.getDate() + (6 - lastDay.getDay())); // End on Saturday

    const days: DayData[] = [];
    const current = new Date(startDay);

    while (current <= endDay) {
      const dateString = current.toISOString().split("T")[0];
      const dayTasks = tasks.filter((task) => task.date === dateString);
      const completedTasks = dayTasks.filter((task) => task.completed).length;
      const totalTasks = dayTasks.length;

      days.push({
        date: dateString,
        dayOfMonth: current.getDate(),
        isToday: current.getTime() === today.getTime(),
        isInRange: current >= start && current <= end,
        tasks: dayTasks,
        completedTasks,
        totalTasks,
        completionRate:
          totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0,
      });

      current.setDate(current.getDate() + 1);
    }

    return days;
  }, [tasks, startDate, endDate]);

  const getDayClassName = (day: DayData) => {
    const baseClasses =
      "relative w-10 h-10 rounded-lg text-sm font-medium transition-all duration-200 cursor-pointer";

    if (!day.isInRange) {
      return `${baseClasses} text-gray-300 bg-gray-50 cursor-not-allowed`;
    }

    if (selectedDate === day.date) {
      return `${baseClasses} bg-blue-600 text-white ring-2 ring-blue-300`;
    }

    if (day.isToday) {
      return `${baseClasses} bg-blue-100 text-blue-900 ring-2 ring-blue-400`;
    }

    if (day.totalTasks === 0) {
      return `${baseClasses} text-gray-400 bg-gray-100 hover:bg-gray-200`;
    }

    // Color based on completion rate
    if (day.completionRate === 100) {
      return `${baseClasses} bg-green-500 text-white hover:bg-green-600`;
    } else if (day.completionRate >= 80) {
      return `${baseClasses} bg-green-300 text-green-900 hover:bg-green-400`;
    } else if (day.completionRate >= 60) {
      return `${baseClasses} bg-yellow-300 text-yellow-900 hover:bg-yellow-400`;
    } else if (day.completionRate >= 40) {
      return `${baseClasses} bg-orange-300 text-orange-900 hover:bg-orange-400`;
    } else if (day.completionRate > 0) {
      return `${baseClasses} bg-red-300 text-red-900 hover:bg-red-400`;
    } else {
      return `${baseClasses} bg-gray-200 text-gray-600 hover:bg-gray-300`;
    }
  };

  const handleDayClick = (day: DayData) => {
    if (!day.isInRange || !onDateSelect) return;
    onDateSelect(day.date);
  };

  const weekDays = ["日", "月", "火", "水", "木", "金", "土"];

  return (
    <div className="bg-white rounded-lg p-3 sm:p-4 shadow-sm">
      <div className="mb-3 sm:mb-4">
        <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-2">
          クエストカレンダー
        </h3>
        <div className="grid grid-cols-2 sm:flex sm:items-center gap-2 sm:gap-4 text-xs">
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 bg-green-500 rounded-full flex-shrink-0" />
            <span className="truncate">完了 (100%)</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 bg-yellow-300 rounded-full flex-shrink-0" />
            <span className="truncate">進行中 (60-99%)</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 bg-red-300 rounded-full flex-shrink-0" />
            <span className="truncate">未完了 (1-59%)</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 bg-gray-200 rounded-full flex-shrink-0" />
            <span className="truncate">タスクなし</span>
          </div>
        </div>
      </div>

      {/* Calendar Header */}
      <div className="grid grid-cols-7 gap-1 mb-2">
        {weekDays.map((day) => (
          <div
            key={day}
            className="h-6 sm:h-8 flex items-center justify-center text-xs font-medium text-gray-500"
          >
            {day}
          </div>
        ))}
      </div>

      {/* Calendar Grid */}
      <div className="grid grid-cols-7 gap-1">
        {calendarData.map((day) => (
          <button
            key={day.date}
            type="button"
            className={getDayClassName(day).replace(
              "w-10 h-10",
              "w-8 h-8 sm:w-10 sm:h-10",
            )}
            onClick={() => handleDayClick(day)}
            disabled={!day.isInRange}
            title={`${day.date}: ${day.completedTasks}/${day.totalTasks} タスク完了`}
            aria-label={`${day.date}: ${day.completedTasks}/${day.totalTasks} タスク完了`}
          >
            <span className="flex items-center justify-center w-full h-full text-xs sm:text-sm">
              {day.dayOfMonth}
            </span>

            {/* Task indicator dots */}
            {day.totalTasks > 0 && (
              <div className="absolute bottom-0 right-0 w-1.5 h-1.5 sm:w-2 sm:h-2 bg-white rounded-full opacity-80" />
            )}
          </button>
        ))}
      </div>

      {/* Selected date info */}
      {selectedDate && (
        <div className="mt-3 sm:mt-4 p-2 sm:p-3 bg-gray-50 rounded-lg">
          <h4 className="font-medium text-gray-900 mb-1 text-sm">
            {selectedDate}
          </h4>
          {(() => {
            const selectedDay = calendarData.find(
              (day) => day.date === selectedDate,
            );
            if (!selectedDay || selectedDay.totalTasks === 0) {
              return (
                <p className="text-xs sm:text-sm text-gray-600">
                  この日にはタスクがありません
                </p>
              );
            }
            return (
              <p className="text-xs sm:text-sm text-gray-600">
                {selectedDay.completedTasks}/{selectedDay.totalTasks} タスク完了
                ({Math.round(selectedDay.completionRate)}%)
              </p>
            );
          })()}
        </div>
      )}
    </div>
  );
}
