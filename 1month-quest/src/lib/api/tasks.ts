import { createClient } from "@/lib/supabase/server";
import type { Database } from "@/types/database";

type Task = Database["public"]["Tables"]["tasks"]["Row"];
type TaskInsert = Database["public"]["Tables"]["tasks"]["Insert"];
type TaskUpdate = Database["public"]["Tables"]["tasks"]["Update"];

export async function createTask(data: TaskInsert) {
  const supabase = await createClient();

  const { data: task, error } = await supabase
    .from("tasks")
    .insert(data)
    .select()
    .single();

  if (error) throw error;
  return task;
}

export async function getTasks(userId: string, questSessionId?: string) {
  const supabase = await createClient();

  let query = supabase
    .from("tasks")
    .select("*")
    .eq("user_id", userId)
    .order("date", { ascending: true });

  if (questSessionId) {
    query = query.eq("quest_session_id", questSessionId);
  }

  const { data, error } = await query;

  if (error) throw error;
  return data;
}

export async function getTasksByDate(userId: string, date: string) {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("tasks")
    .select("*")
    .eq("user_id", userId)
    .eq("date", date)
    .order("priority", { ascending: false });

  if (error) throw error;
  return data;
}

export async function updateTask(id: string, data: TaskUpdate) {
  const supabase = await createClient();

  const { data: task, error } = await supabase
    .from("tasks")
    .update(data)
    .eq("id", id)
    .select()
    .single();

  if (error) throw error;
  return task;
}

export async function deleteTask(id: string) {
  const supabase = await createClient();

  const { error } = await supabase.from("tasks").delete().eq("id", id);

  if (error) throw error;
}

export async function toggleTaskCompletion(id: string, completed: boolean) {
  const supabase = await createClient();

  const { data: task, error } = await supabase
    .from("tasks")
    .update({ completed })
    .eq("id", id)
    .select()
    .single();

  if (error) throw error;
  return task;
}

export async function generateQuestTasks(
  userId: string,
  questSessionId: string,
  startDate: string,
  endDate: string,
) {
  const start = new Date(startDate);
  const end = new Date(endDate);
  const tasks: TaskInsert[] = [];

  for (
    let date = new Date(start);
    date <= end;
    date.setDate(date.getDate() + 1)
  ) {
    const dateString = date.toISOString().split("T")[0];

    tasks.push({
      user_id: userId,
      quest_session_id: questSessionId,
      title: `Day ${Math.floor((date.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1} タスク`,
      description: "今日の目標を設定してください",
      date: dateString,
      priority: 2,
      completed: false,
    });
  }

  const supabase = await createClient();
  const { data, error } = await supabase.from("tasks").insert(tasks).select();

  if (error) throw error;
  return data;
}
