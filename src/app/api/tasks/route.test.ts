import { describe, it, expect, vi, beforeEach } from "vitest";
import { GET, POST } from "./route";
import { NextRequest } from "next/server";

// Supabase client のモック
const mockQuery = {
  select: vi.fn().mockReturnThis(),
  insert: vi.fn().mockReturnThis(),
  eq: vi.fn().mockReturnThis(),
  order: vi.fn().mockReturnThis(),
  single: vi.fn().mockResolvedValue({ data: null, error: null }),
};

const mockSupabaseClient = {
  from: vi.fn(() => mockQuery),
  auth: {
    getUser: vi.fn(),
  },
};

vi.mock("@/lib/supabase/server", () => ({
  createClient: () => mockSupabaseClient,
}));

describe("/api/tasks", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("GET", () => {
    it("認証されたユーザーのタスクを取得する", async () => {
      // 認証されたユーザーをモック
      mockSupabaseClient.auth.getUser.mockResolvedValue({
        data: { user: { id: "user-1" } },
        error: null,
      });

      // タスクデータをモック
      const mockTasks = [
        {
          id: "task-1",
          title: "テストタスク1",
          completed: false,
          date: "2024-01-01",
        },
        {
          id: "task-2",
          title: "テストタスク2",
          completed: true,
          date: "2024-01-01",
        },
      ];

      mockQuery.order.mockResolvedValue({
        data: mockTasks,
        error: null,
      });

      const request = new NextRequest("http://localhost:3000/api/tasks?date=2024-01-01");
      const response = await GET(request);

      expect(response.status).toBe(200);
      
      const data = await response.json();
      expect(data).toEqual(mockTasks);

      expect(mockSupabaseClient.from).toHaveBeenCalledWith("tasks");
      expect(mockQuery.select).toHaveBeenCalledWith("*");
      expect(mockQuery.eq).toHaveBeenCalledWith("user_id", "user-1");
      expect(mockQuery.eq).toHaveBeenCalledWith("date", "2024-01-01");
    });

    it("未認証の場合、401エラーを返す", async () => {
      mockSupabaseClient.auth.getUser.mockResolvedValue({
        data: { user: null },
        error: null,
      });

      const request = new NextRequest("http://localhost:3000/api/tasks");
      const response = await GET(request);

      expect(response.status).toBe(401);
      
      const data = await response.json();
      expect(data).toEqual({ error: "Unauthorized" });
    });

    it("quest_session_idが指定されていない場合、全てのタスクを返す", async () => {
      mockSupabaseClient.auth.getUser.mockResolvedValue({
        data: { user: { id: "user-1" } },
        error: null,
      });

      const mockTasks = [
        {
          id: "task-1",
          title: "テストタスク1",
          completed: false,
          date: "2024-01-01",
        },
      ];

      mockQuery.order.mockResolvedValue({
        data: mockTasks,
        error: null,
      });

      const request = new NextRequest("http://localhost:3000/api/tasks");
      const response = await GET(request);

      expect(response.status).toBe(200);
      
      const data = await response.json();
      expect(data).toEqual(mockTasks);
    });

    it("Supabaseエラーの場合、500エラーを返す", async () => {
      mockSupabaseClient.auth.getUser.mockResolvedValue({
        data: { user: { id: "user-1" } },
        error: null,
      });

      mockQuery.order.mockResolvedValue({
        data: null,
        error: { message: "Database error" },
      });

      const request = new NextRequest("http://localhost:3000/api/tasks?quest_session_id=quest-1");
      const response = await GET(request);

      expect(response.status).toBe(500);
      
      const data = await response.json();
      expect(data).toEqual({ error: "Internal server error" });
    });
  });

  describe("POST", () => {
    it("新しいタスクを作成する", async () => {
      mockSupabaseClient.auth.getUser.mockResolvedValue({
        data: { user: { id: "user-1" } },
        error: null,
      });

      const newTask = {
        id: "task-new",
        title: "新しいタスク",
        description: "説明",
        completed: false,
        date: "2024-01-01",
        priority: 2,
        quest_session_id: "quest-1",
        user_id: "user-1",
        estimated_time: 30,
      };

      mockQuery.single.mockResolvedValue({
        data: newTask,
        error: null,
      });

      const request = new NextRequest("http://localhost:3000/api/tasks", {
        method: "POST",
        body: JSON.stringify({
          title: "新しいタスク",
          description: "説明",
          quest_session_id: "quest-1",
          date: "2024-01-01",
          priority: 2,
          estimated_time: 30,
        }),
        headers: {
          "Content-Type": "application/json",
        },
      });

      const response = await POST(request);

      expect(response.status).toBe(200);
      
      const data = await response.json();
      expect(data).toEqual(newTask);

      expect(mockSupabaseClient.from).toHaveBeenCalledWith("tasks");
      expect(mockQuery.insert).toHaveBeenCalledWith({
        title: "新しいタスク",
        description: "説明",
        quest_session_id: "quest-1",
        date: "2024-01-01",
        priority: 2,
        estimated_time: 30,
        user_id: "user-1",
        completed: false,
      });
    });

    it("必須フィールドが不足している場合、400エラーを返す", async () => {
      mockSupabaseClient.auth.getUser.mockResolvedValue({
        data: { user: { id: "user-1" } },
        error: null,
      });

      const request = new NextRequest("http://localhost:3000/api/tasks", {
        method: "POST",
        body: JSON.stringify({
          title: "新しいタスク",
          // date が不足
        }),
        headers: {
          "Content-Type": "application/json",
        },
      });

      const response = await POST(request);

      expect(response.status).toBe(400);
      
      const data = await response.json();
      expect(data.error).toContain("Missing required fields");
    });

    it("未認証の場合、401エラーを返す", async () => {
      mockSupabaseClient.auth.getUser.mockResolvedValue({
        data: { user: null },
        error: null,
      });

      const request = new NextRequest("http://localhost:3000/api/tasks", {
        method: "POST",
        body: JSON.stringify({
          title: "新しいタスク",
          quest_session_id: "quest-1",
          date: "2024-01-01",
        }),
        headers: {
          "Content-Type": "application/json",
        },
      });

      const response = await POST(request);

      expect(response.status).toBe(401);
    });
  });
});