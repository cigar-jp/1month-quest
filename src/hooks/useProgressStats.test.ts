import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { renderHook } from "@testing-library/react";
import { useProgressStats } from "./useProgressStats";
import type { Database } from "@/types/database";

type Task = Database["public"]["Tables"]["tasks"]["Row"];

// useTasks hookのモック
vi.mock("./useTasks", () => ({
  useTasks: vi.fn(),
}));

const { useTasks } = await import("./useTasks");

describe("useProgressStats", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("タスクがない場合、初期値を返す", () => {
    vi.mocked(useTasks).mockReturnValue({
      tasks: [],
      isLoading: false,
      isError: false,
      mutate: vi.fn(),
    });

    const { result } = renderHook(() => useProgressStats("quest-1"));

    expect(result.current).toEqual({
      totalTasks: 0,
      completedTasks: 0,
      completionRate: 0,
      streakDays: 0,
      currentStreak: 0,
      bestStreak: 0,
      dailyStats: [],
    });
  });

  it("基本的な進捗統計を正しく計算する", () => {
    const mockTasks: Task[] = [
      {
        id: "1",
        title: "Task 1",
        description: null,
        completed: true,
        date: "2024-01-01",
        priority: 2,
        quest_session_id: "quest-1",
        user_id: "user-1",
        created_at: "2024-01-01T00:00:00Z",
        updated_at: "2024-01-01T00:00:00Z",
        completed_at: "2024-01-01T10:00:00Z",
        estimated_time: null,
        actual_time: null,
      },
      {
        id: "2",
        title: "Task 2",
        description: null,
        completed: false,
        date: "2024-01-01",
        priority: 2,
        quest_session_id: "quest-1",
        user_id: "user-1",
        created_at: "2024-01-01T00:00:00Z",
        updated_at: "2024-01-01T00:00:00Z",
        completed_at: null,
        estimated_time: null,
        actual_time: null,
      },
      {
        id: "3",
        title: "Task 3",
        description: null,
        completed: true,
        date: "2024-01-02",
        priority: 2,
        quest_session_id: "quest-1",
        user_id: "user-1",
        created_at: "2024-01-02T00:00:00Z",
        updated_at: "2024-01-02T00:00:00Z",
        completed_at: "2024-01-02T10:00:00Z",
        estimated_time: null,
        actual_time: null,
      },
    ];

    vi.mocked(useTasks).mockReturnValue({
      tasks: mockTasks,
      isLoading: false,
      isError: false,
      mutate: vi.fn(),
    });

    const { result } = renderHook(() => useProgressStats("quest-1"));

    expect(result.current.totalTasks).toBe(3);
    expect(result.current.completedTasks).toBe(2);
    expect(result.current.completionRate).toBeCloseTo(66.67, 2);
  });

  it("日別統計を正しく生成する", () => {
    const mockTasks: Task[] = [
      {
        id: "1",
        title: "Task 1",
        description: null,
        completed: true,
        date: "2024-01-01",
        priority: 2,
        quest_session_id: "quest-1",
        user_id: "user-1",
        created_at: "2024-01-01T00:00:00Z",
        updated_at: "2024-01-01T00:00:00Z",
        completed_at: "2024-01-01T10:00:00Z",
        estimated_time: null,
        actual_time: null,
      },
      {
        id: "2",
        title: "Task 2",
        description: null,
        completed: true,
        date: "2024-01-01",
        priority: 2,
        quest_session_id: "quest-1",
        user_id: "user-1",
        created_at: "2024-01-01T00:00:00Z",
        updated_at: "2024-01-01T00:00:00Z",
        completed_at: "2024-01-01T11:00:00Z",
        estimated_time: null,
        actual_time: null,
      },
      {
        id: "3",
        title: "Task 3",
        description: null,
        completed: false,
        date: "2024-01-02",
        priority: 2,
        quest_session_id: "quest-1",
        user_id: "user-1",
        created_at: "2024-01-02T00:00:00Z",
        updated_at: "2024-01-02T00:00:00Z",
        completed_at: null,
        estimated_time: null,
        actual_time: null,
      },
    ];

    vi.mocked(useTasks).mockReturnValue({
      tasks: mockTasks,
      isLoading: false,
      isError: false,
      mutate: vi.fn(),
    });

    const { result } = renderHook(() => useProgressStats("quest-1"));

    expect(result.current.dailyStats).toHaveLength(2);
    
    const day1 = result.current.dailyStats.find(d => d.date === "2024-01-01");
    expect(day1).toEqual({
      date: "2024-01-01",
      completed: 2,
      total: 2,
      rate: 100,
    });

    const day2 = result.current.dailyStats.find(d => d.date === "2024-01-02");
    expect(day2).toEqual({
      date: "2024-01-02",
      completed: 0,
      total: 1,
      rate: 0,
    });
  });

  it("連続記録を正しく計算する", () => {
    // 今日を2024-01-05とする
    const mockToday = new Date("2024-01-05");
    vi.setSystemTime(mockToday);

    const mockTasks: Task[] = [
      // 2024-01-03: 100%完了
      {
        id: "1",
        title: "Task 1",
        description: null,
        completed: true,
        date: "2024-01-03",
        priority: 2,
        quest_session_id: "quest-1",
        user_id: "user-1",
        created_at: "2024-01-03T00:00:00Z",
        updated_at: "2024-01-03T00:00:00Z",
        completed_at: "2024-01-03T10:00:00Z",
        estimated_time: null,
        actual_time: null,
      },
      // 2024-01-04: 100%完了
      {
        id: "2",
        title: "Task 2",
        description: null,
        completed: true,
        date: "2024-01-04",
        priority: 2,
        quest_session_id: "quest-1",
        user_id: "user-1",
        created_at: "2024-01-04T00:00:00Z",
        updated_at: "2024-01-04T00:00:00Z",
        completed_at: "2024-01-04T10:00:00Z",
        estimated_time: null,
        actual_time: null,
      },
      // 2024-01-05: 100%完了（今日）
      {
        id: "3",
        title: "Task 3",
        description: null,
        completed: true,
        date: "2024-01-05",
        priority: 2,
        quest_session_id: "quest-1",
        user_id: "user-1",
        created_at: "2024-01-05T00:00:00Z",
        updated_at: "2024-01-05T00:00:00Z",
        completed_at: "2024-01-05T10:00:00Z",
        estimated_time: null,
        actual_time: null,
      },
    ];

    vi.mocked(useTasks).mockReturnValue({
      tasks: mockTasks,
      isLoading: false,
      isError: false,
      mutate: vi.fn(),
    });

    const { result } = renderHook(() => useProgressStats("quest-1"));

    expect(result.current.currentStreak).toBe(3);
    expect(result.current.bestStreak).toBe(3);
    expect(result.current.streakDays).toBe(3); // 100%完了の日数
  });

  it("連続記録が途切れている場合を正しく計算する", () => {
    // 今日を2024-01-05とする
    const mockToday = new Date("2024-01-05");
    vi.setSystemTime(mockToday);

    const mockTasks: Task[] = [
      // 2024-01-01: 100%完了
      {
        id: "1",
        title: "Task 1",
        description: null,
        completed: true,
        date: "2024-01-01",
        priority: 2,
        quest_session_id: "quest-1",
        user_id: "user-1",
        created_at: "2024-01-01T00:00:00Z",
        updated_at: "2024-01-01T00:00:00Z",
        completed_at: "2024-01-01T10:00:00Z",
        estimated_time: null,
        actual_time: null,
      },
      // 2024-01-02: 50%完了（途切れる）
      {
        id: "2",
        title: "Task 2",
        description: null,
        completed: true,
        date: "2024-01-02",
        priority: 2,
        quest_session_id: "quest-1",
        user_id: "user-1",
        created_at: "2024-01-02T00:00:00Z",
        updated_at: "2024-01-02T00:00:00Z",
        completed_at: "2024-01-02T10:00:00Z",
        estimated_time: null,
        actual_time: null,
      },
      {
        id: "3",
        title: "Task 3",
        description: null,
        completed: false,
        date: "2024-01-02",
        priority: 2,
        quest_session_id: "quest-1",
        user_id: "user-1",
        created_at: "2024-01-02T00:00:00Z",
        updated_at: "2024-01-02T00:00:00Z",
        completed_at: null,
        estimated_time: null,
        actual_time: null,
      },
      // 2024-01-04: 100%完了
      {
        id: "4",
        title: "Task 4",
        description: null,
        completed: true,
        date: "2024-01-04",
        priority: 2,
        quest_session_id: "quest-1",
        user_id: "user-1",
        created_at: "2024-01-04T00:00:00Z",
        updated_at: "2024-01-04T00:00:00Z",
        completed_at: "2024-01-04T10:00:00Z",
        estimated_time: null,
        actual_time: null,
      },
      // 2024-01-05: 100%完了（今日）
      {
        id: "5",
        title: "Task 5",
        description: null,
        completed: true,
        date: "2024-01-05",
        priority: 2,
        quest_session_id: "quest-1",
        user_id: "user-1",
        created_at: "2024-01-05T00:00:00Z",
        updated_at: "2024-01-05T00:00:00Z",
        completed_at: "2024-01-05T10:00:00Z",
        estimated_time: null,
        actual_time: null,
      },
    ];

    vi.mocked(useTasks).mockReturnValue({
      tasks: mockTasks,
      isLoading: false,
      isError: false,
      mutate: vi.fn(),
    });

    const { result } = renderHook(() => useProgressStats("quest-1"));

    // 現在の連続記録: 2024-01-04と2024-01-05（2日間）
    expect(result.current.currentStreak).toBe(2);
    // 最高連続記録: 2024-01-04と2024-01-05（2日間）
    expect(result.current.bestStreak).toBe(2);
    // 100%完了の日数: 2024-01-01, 2024-01-04, 2024-01-05（3日間）
    expect(result.current.streakDays).toBe(3);
  });

  it("タスクがあるがすべて未完了の場合", () => {
    const mockTasks: Task[] = [
      {
        id: "1",
        title: "Task 1",
        description: null,
        completed: false,
        date: "2024-01-01",
        priority: 2,
        quest_session_id: "quest-1",
        user_id: "user-1",
        created_at: "2024-01-01T00:00:00Z",
        updated_at: "2024-01-01T00:00:00Z",
        completed_at: null,
        estimated_time: null,
        actual_time: null,
      },
      {
        id: "2",
        title: "Task 2",
        description: null,
        completed: false,
        date: "2024-01-02",
        priority: 1,
        quest_session_id: "quest-1",
        user_id: "user-1",
        created_at: "2024-01-02T00:00:00Z",
        updated_at: "2024-01-02T00:00:00Z",
        completed_at: null,
        estimated_time: null,
        actual_time: null,
      },
    ];

    vi.mocked(useTasks).mockReturnValue({
      tasks: mockTasks,
      isLoading: false,
      isError: false,
      mutate: vi.fn(),
    });

    const { result } = renderHook(() => useProgressStats("quest-1"));

    expect(result.current.totalTasks).toBe(2);
    expect(result.current.completedTasks).toBe(0);
    expect(result.current.completionRate).toBe(0);
    expect(result.current.currentStreak).toBe(0);
    expect(result.current.bestStreak).toBe(0);
    expect(result.current.streakDays).toBe(0);
    expect(result.current.dailyStats).toHaveLength(2);
    expect(result.current.dailyStats[0].rate).toBe(0);
    expect(result.current.dailyStats[1].rate).toBe(0);
  });

  it("undefinedのquestSessionIdを渡した場合", () => {
    vi.mocked(useTasks).mockReturnValue({
      tasks: [],
      isLoading: false,
      isError: false,
      mutate: vi.fn(),
    });

    const { result } = renderHook(() => useProgressStats(undefined));

    expect(result.current).toEqual({
      totalTasks: 0,
      completedTasks: 0,
      completionRate: 0,
      streakDays: 0,
      currentStreak: 0,
      bestStreak: 0,
      dailyStats: [],
    });
  });
});