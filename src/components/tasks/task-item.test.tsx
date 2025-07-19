import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import TaskItem from "./task-item";
import type { Database } from "@/types/database";

type Task = Database["public"]["Tables"]["tasks"]["Row"];

// TaskItemで使用するhooksをモック
const mockToggleTask = vi.fn();
const mockUpdateTask = vi.fn();
const mockDeleteTask = vi.fn();

vi.mock("@/hooks/useTasks", () => ({
  useToggleTask: vi.fn(() => ({
    toggleTask: mockToggleTask,
    isToggling: false,
  })),
  useUpdateTask: vi.fn(() => ({
    updateTask: mockUpdateTask,
    isUpdating: false,
  })),
  useDeleteTask: vi.fn(() => ({
    deleteTask: mockDeleteTask,
    isDeleting: false,
  })),
}));

describe("TaskItem", () => {
  const mockTask: Task = {
    id: "task-1",
    title: "テストタスク",
    description: "テストの説明",
    completed: false,
    date: "2024-01-01",
    priority: 2,
    quest_session_id: "quest-1",
    user_id: "user-1",
    created_at: "2024-01-01T00:00:00Z",
    updated_at: "2024-01-01T00:00:00Z",
    completed_at: null,
    estimated_time: 30,
    actual_time: null,
  };

  const mockCallbacks = {
    onOptimisticUpdate: vi.fn(),
    onOptimisticDelete: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
    mockToggleTask.mockClear();
    mockUpdateTask.mockClear();
    mockDeleteTask.mockClear();
  });

  it("タスク情報を正しく表示する", () => {
    render(<TaskItem task={mockTask} {...mockCallbacks} />);

    expect(screen.getByText("テストタスク")).toBeInTheDocument();
    expect(screen.getByText("テストの説明")).toBeInTheDocument();
    expect(screen.getByText("中")).toBeInTheDocument(); // priority 2
    expect(screen.getByText(/予定: 30分/)).toBeInTheDocument();
  });

  it("完了済みタスクは適切なスタイルで表示される", () => {
    const completedTask = { ...mockTask, completed: true };
    render(<TaskItem task={completedTask} {...mockCallbacks} />);

    const checkbox = screen.getByRole("checkbox");
    expect(checkbox).toBeChecked();
    
    const title = screen.getByText("テストタスク");
    expect(title).toHaveClass("line-through");
  });

  it("チェックボックスをクリックするとタスクの完了状態を切り替える", async () => {
    const user = userEvent.setup();
    render(<TaskItem task={mockTask} {...mockCallbacks} />);

    const checkbox = screen.getByRole("checkbox");
    await user.click(checkbox);

    expect(mockCallbacks.onOptimisticUpdate).toHaveBeenCalledWith({
      ...mockTask,
      completed: true,
    });
    expect(mockToggleTask).toHaveBeenCalledWith(true);
  });

  it("編集ボタンをクリックすると編集モードになる", async () => {
    const user = userEvent.setup();
    render(<TaskItem task={mockTask} {...mockCallbacks} />);

    const editButton = screen.getByRole("button", { name: "編集" });
    await user.click(editButton);

    expect(screen.getByDisplayValue("テストタスク")).toBeInTheDocument();
    expect(screen.getByDisplayValue("テストの説明")).toBeInTheDocument();
    expect(screen.getByText("保存")).toBeInTheDocument();
    expect(screen.getByText("キャンセル")).toBeInTheDocument();
  });

  it("編集モードでタスクを更新できる", async () => {
    const user = userEvent.setup();
    render(<TaskItem task={mockTask} {...mockCallbacks} />);

    // 編集モードに入る
    const editButton = screen.getByRole("button", { name: "編集" });
    await user.click(editButton);

    // タイトルを変更
    const titleInput = screen.getByDisplayValue("テストタスク");
    await user.clear(titleInput);
    await user.type(titleInput, "更新されたタスク");

    // 保存
    const saveButton = screen.getByText("保存");
    await user.click(saveButton);

    expect(mockCallbacks.onOptimisticUpdate).toHaveBeenCalledWith({
      ...mockTask,
      title: "更新されたタスク",
      description: "テストの説明",
      priority: 2,
    });
    expect(mockUpdateTask).toHaveBeenCalledWith({
      title: "更新されたタスク",
      description: "テストの説明",
      priority: 2,
    });
  });

  it("編集をキャンセルできる", async () => {
    const user = userEvent.setup();
    render(<TaskItem task={mockTask} {...mockCallbacks} />);

    // 編集モードに入る
    const editButton = screen.getByRole("button", { name: "編集" });
    await user.click(editButton);

    // タイトルを変更
    const titleInput = screen.getByDisplayValue("テストタスク");
    await user.clear(titleInput);
    await user.type(titleInput, "変更されたタスク");

    // キャンセル
    const cancelButton = screen.getByText("キャンセル");
    await user.click(cancelButton);

    // 元のタイトルが表示される（編集モードが終了している）
    expect(screen.getByText("テストタスク")).toBeInTheDocument();
    expect(screen.queryByText("保存")).not.toBeInTheDocument();
    expect(screen.queryByText("キャンセル")).not.toBeInTheDocument();
  });

  it("削除ボタンをクリックすると確認ダイアログが表示される", async () => {
    // window.confirm をモック
    const mockConfirm = vi.spyOn(window, "confirm").mockReturnValue(true);

    const user = userEvent.setup();
    render(<TaskItem task={mockTask} {...mockCallbacks} />);

    const deleteButton = screen.getByRole("button", { name: "削除" });
    await user.click(deleteButton);

    expect(mockConfirm).toHaveBeenCalledWith("このタスクを削除してもよろしいですか？");
    expect(mockCallbacks.onOptimisticDelete).toHaveBeenCalledWith("task-1");
    expect(mockDeleteTask).toHaveBeenCalled();

    mockConfirm.mockRestore();
  });

  it("削除確認をキャンセルした場合、削除されない", async () => {
    // window.confirm をモック（false を返す）
    const mockConfirm = vi.spyOn(window, "confirm").mockReturnValue(false);

    const user = userEvent.setup();
    render(<TaskItem task={mockTask} {...mockCallbacks} />);

    const deleteButton = screen.getByRole("button", { name: "削除" });
    await user.click(deleteButton);

    expect(mockConfirm).toHaveBeenCalled();
    expect(mockCallbacks.onOptimisticDelete).not.toHaveBeenCalled();
    expect(mockDeleteTask).not.toHaveBeenCalled();

    mockConfirm.mockRestore();
  });

  it("優先度に応じて適切な色クラスが適用される", () => {
    const highPriorityTask = { ...mockTask, priority: 1 };
    const { rerender } = render(<TaskItem task={highPriorityTask} {...mockCallbacks} />);

    expect(screen.getByText("高")).toHaveClass("bg-red-100", "text-red-800");

    const lowPriorityTask = { ...mockTask, priority: 3 };
    rerender(<TaskItem task={lowPriorityTask} {...mockCallbacks} />);

    expect(screen.getByText("低")).toHaveClass("bg-green-100", "text-green-800");
  });
});