export interface Database {
  public: {
    Tables: {
      tasks: {
        Row: {
          id: string;
          user_id: string;
          quest_session_id: string | null;
          title: string;
          description: string | null;
          completed: boolean;
          date: string;
          priority: number;
          estimated_time: number | null;
          actual_time: number | null;
          created_at: string;
          updated_at: string;
          completed_at: string | null;
        };
        Insert: {
          id?: string;
          user_id: string;
          quest_session_id?: string | null;
          title: string;
          description?: string | null;
          completed?: boolean;
          date: string;
          priority?: number;
          estimated_time?: number | null;
          actual_time?: number | null;
          created_at?: string;
          updated_at?: string;
          completed_at?: string | null;
        };
        Update: {
          id?: string;
          user_id?: string;
          quest_session_id?: string | null;
          title?: string;
          description?: string | null;
          completed?: boolean;
          date?: string;
          priority?: number;
          estimated_time?: number | null;
          actual_time?: number | null;
          created_at?: string;
          updated_at?: string;
          completed_at?: string | null;
        };
      };
      quest_sessions: {
        Row: {
          id: string;
          user_id: string;
          title: string;
          description: string | null;
          start_date: string;
          end_date: string;
          status: "active" | "completed" | "abandoned";
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          title: string;
          description?: string | null;
          start_date: string;
          end_date: string;
          status?: "active" | "completed" | "abandoned";
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          title?: string;
          description?: string | null;
          start_date?: string;
          end_date?: string;
          status?: "active" | "completed" | "abandoned";
          created_at?: string;
          updated_at?: string;
        };
      };
    };
    Views: {
      quest_session_stats: {
        Row: {
          id: string;
          user_id: string;
          title: string;
          start_date: string;
          end_date: string;
          status: "active" | "completed" | "abandoned";
          total_tasks: number;
          completed_tasks: number;
          completion_percentage: number;
          total_time_spent: number | null;
        };
      };
    };
    Functions: {
      [_ in never]: never;
    };
    Enums: {
      [_ in never]: never;
    };
  };
}
