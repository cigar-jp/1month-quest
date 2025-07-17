import { type NextRequest, NextResponse } from "next/server";
import { createTask, getTasks, getTasksByDate } from "@/lib/api/tasks";
import { createClient } from "@/lib/supabase/server";
import type { Database } from "@/types/database";

type Task = Database["public"]["Tables"]["tasks"]["Row"];

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const questSessionId = searchParams.get("quest_session_id");
    const date = searchParams.get("date");

    let tasks: Task[];
    if (date) {
      tasks = await getTasksByDate(user.id, date);
    } else {
      tasks = await getTasks(user.id, questSessionId || undefined);
    }

    return NextResponse.json(tasks || []);
  } catch (error) {
    console.error("Error fetching tasks:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const {
      title,
      description,
      date,
      priority,
      quest_session_id,
      estimated_time,
    } = body;

    if (!title || !date) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 },
      );
    }

    const task = await createTask({
      user_id: user.id,
      quest_session_id,
      title,
      description,
      date,
      priority: priority || 2,
      estimated_time,
      completed: false,
    });

    return NextResponse.json(task);
  } catch (error) {
    console.error("Error creating task:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
