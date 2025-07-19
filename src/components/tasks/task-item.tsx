"use client";

import { useState } from "react";
import { useDeleteTask, useToggleTask, useUpdateTask } from "@/hooks/useTasks";
import type { Database } from "@/types/database";

type Task = Database["public"]["Tables"]["tasks"]["Row"];

interface TaskItemProps {
  task: Task;
  onOptimisticUpdate: (task: Task) => void;
  onOptimisticDelete: (taskId: string) => void;
}

export default function TaskItem({
  task,
  onOptimisticUpdate,
  onOptimisticDelete,
}: TaskItemProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState(task.title);
  const [editDescription, setEditDescription] = useState(
    task.description || "",
  );
  const [editPriority, setEditPriority] = useState(task.priority);

  const { toggleTask, isToggling } = useToggleTask(task.id);
  const { updateTask, isUpdating } = useUpdateTask(task.id);
  const { deleteTask, isDeleting } = useDeleteTask(task.id);

  const handleToggle = async (completed: boolean) => {
    const optimisticTask = { ...task, completed };
    onOptimisticUpdate(optimisticTask);

    try {
      await toggleTask(completed);
    } catch (_error) {
      // Revert on error
      onOptimisticUpdate(task);
    }
  };

  const handleSave = async () => {
    const optimisticTask = {
      ...task,
      title: editTitle,
      description: editDescription,
      priority: editPriority,
    };
    onOptimisticUpdate(optimisticTask);

    try {
      await updateTask({
        title: editTitle,
        description: editDescription,
        priority: editPriority,
      });
      setIsEditing(false);
    } catch (_error) {
      // Revert on error
      onOptimisticUpdate(task);
    }
  };

  const handleDelete = async () => {
    if (window.confirm("このタスクを削除してもよろしいですか？")) {
      onOptimisticDelete(task.id);

      try {
        await deleteTask();
      } catch (error) {
        // Revert on error - would need more complex state management
        console.error("Delete failed:", error);
      }
    }
  };

  const handleCancel = () => {
    setEditTitle(task.title);
    setEditDescription(task.description || "");
    setEditPriority(task.priority);
    setIsEditing(false);
  };

  const getPriorityColor = (priority: number) => {
    switch (priority) {
      case 1:
        return "bg-red-100 text-red-800";
      case 2:
        return "bg-yellow-100 text-yellow-800";
      case 3:
        return "bg-green-100 text-green-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getPriorityText = (priority: number) => {
    switch (priority) {
      case 1:
        return "高";
      case 2:
        return "中";
      case 3:
        return "低";
      default:
        return "-";
    }
  };

  if (isEditing) {
    return (
      <div className="bg-white p-3 sm:p-4 rounded-lg border border-gray-200 shadow-sm">
        <div className="space-y-3">
          <input
            type="text"
            value={editTitle}
            onChange={(e) => setEditTitle(e.target.value)}
            className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="タスクタイトル"
          />

          <textarea
            value={editDescription}
            onChange={(e) => setEditDescription(e.target.value)}
            className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="説明（任意）"
            rows={2}
          />

          <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
            <label
              htmlFor="priority-select"
              className="text-xs sm:text-sm font-medium text-gray-700"
            >
              優先度:
            </label>
            <select
              id="priority-select"
              value={editPriority}
              onChange={(e) => setEditPriority(Number(e.target.value))}
              className="px-3 py-1 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value={1}>高</option>
              <option value={2}>中</option>
              <option value={3}>低</option>
            </select>
          </div>

          <div className="flex gap-2">
            <button
              type="button"
              onClick={handleSave}
              className="flex-1 sm:flex-none px-3 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-sm"
            >
              保存
            </button>
            <button
              type="button"
              onClick={handleCancel}
              className="flex-1 sm:flex-none px-3 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400 text-sm"
            >
              キャンセル
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`bg-white p-3 sm:p-4 rounded-lg border border-gray-200 shadow-sm ${task.completed ? "opacity-75" : ""}`}
    >
      <div className="flex items-start gap-3">
        <input
          type="checkbox"
          checked={task.completed}
          onChange={(e) => handleToggle(e.target.checked)}
          disabled={isToggling}
          className="mt-1 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded disabled:opacity-50 flex-shrink-0"
        />

        <div className="flex-1 min-w-0">
          <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2 mb-1">
            <h3
              className={`text-sm font-medium ${task.completed ? "line-through text-gray-500" : "text-gray-900"} break-words`}
            >
              {task.title}
            </h3>
            <span
              className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(task.priority)} w-fit`}
            >
              {getPriorityText(task.priority)}
            </span>
          </div>

          {task.description && (
            <p
              className={`text-xs sm:text-sm ${task.completed ? "line-through text-gray-400" : "text-gray-600"} break-words`}
            >
              {task.description}
            </p>
          )}

          <div className="flex flex-wrap gap-2 sm:gap-4 mt-2 text-xs text-gray-500">
            <span>作成: {new Date(task.created_at).toLocaleDateString()}</span>
            {task.estimated_time && <span>予定: {task.estimated_time}分</span>}
            {task.actual_time && <span>実績: {task.actual_time}分</span>}
            {task.completed_at && (
              <span>
                完了: {new Date(task.completed_at).toLocaleDateString()}
              </span>
            )}
          </div>
        </div>

        <div className="flex gap-1 flex-shrink-0">
          <button
            type="button"
            onClick={() => setIsEditing(true)}
            disabled={isUpdating}
            className="p-2 text-gray-400 hover:text-blue-600 transition-colors disabled:opacity-50 touch-manipulation"
            title="編集"
          >
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              role="img"
              aria-label="編集"
            >
              <title>編集</title>
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"
              />
            </svg>
          </button>

          <button
            type="button"
            onClick={handleDelete}
            disabled={isDeleting}
            className="p-2 text-gray-400 hover:text-red-600 transition-colors disabled:opacity-50 touch-manipulation"
            title="削除"
          >
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              role="img"
              aria-label="削除"
            >
              <title>削除</title>
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
              />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}
