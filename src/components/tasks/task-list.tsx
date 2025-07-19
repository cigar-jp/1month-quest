"use client";

import { useState } from "react";
import { useTaskMutations } from "@/hooks/useTasks";
import type { Database } from "@/types/database";
import TaskCreateForm from "./task-create-form";
import TaskItem from "./task-item";

type Task = Database["public"]["Tables"]["tasks"]["Row"];

interface TaskListProps {
  tasks: Task[];
  questSessionId?: string;
  selectedDate?: string;
}

export default function TaskList({
  tasks,
  questSessionId,
  selectedDate,
}: TaskListProps) {
  const [showCreateForm, setShowCreateForm] = useState(false);
  const { optimisticUpdate, optimisticAdd, optimisticDelete, revalidate } =
    useTaskMutations(questSessionId, selectedDate);

  const handleTaskCreate = (newTask: Task) => {
    optimisticAdd(newTask);
    setShowCreateForm(false);
    revalidate();
  };

  const completedTasks = tasks.filter((task) => task.completed);
  const incompleteTasks = tasks.filter((task) => !task.completed);

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3">
        <h2 className="text-base sm:text-lg font-semibold text-gray-900">
          {selectedDate ? `${selectedDate} のタスク` : "すべてのタスク"}
        </h2>
        <button
          type="button"
          onClick={() => setShowCreateForm(true)}
          className="bg-blue-600 text-white px-3 sm:px-4 py-2 rounded-md hover:bg-blue-700 transition-colors text-sm w-full sm:w-auto"
        >
          新しいタスクを追加
        </button>
      </div>

      {/* Progress bar */}
      {tasks.length > 0 && (
        <div className="bg-gray-200 rounded-full h-2">
          <div
            className="bg-blue-600 h-2 rounded-full transition-all duration-300"
            style={{
              width: `${(completedTasks.length / tasks.length) * 100}%`,
            }}
          />
        </div>
      )}

      {/* Task sections */}
      <div className="space-y-3 sm:space-y-4">
        {incompleteTasks.length > 0 && (
          <div>
            <h3 className="text-xs sm:text-sm font-medium text-gray-700 mb-2">
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
            <h3 className="text-xs sm:text-sm font-medium text-gray-700 mb-2">
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
          <div className="text-center py-6 sm:py-8 text-gray-500">
            <p className="text-sm">まだタスクがありません</p>
            <p className="text-xs sm:text-sm">新しいタスクを追加してください</p>
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
  );
}
