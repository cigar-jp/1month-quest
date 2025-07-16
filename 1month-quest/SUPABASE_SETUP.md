# Supabase セットアップガイド

## 1. Supabase プロジェクトの作成

1. [Supabase Dashboard](https://supabase.com/dashboard) にアクセス
2. 「New Project」をクリック
3. プロジェクト名: `1month-quest`
4. データベースパスワードを設定
5. リージョンを選択（推奨: Tokyo）
6. 「Create new project」をクリック

## 2. 環境変数の設定

プロジェクト作成後、以下の手順で環境変数を取得・設定してください：

1. Supabase Dashboard の「Settings」→「API」に移動
2. 以下の値をコピー：
   - Project URL
   - API Keys の anon public key
   - API Keys の service_role key（秘密鍵）

3. `.env.local` ファイルを更新：

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here
```

## 3. データベーススキーマの作成

Supabase Dashboard の「SQL Editor」で以下のSQLを実行してください：

```sql
-- RLS は既にSupabaseで有効なので削除
-- ALTER DATABASE postgres SET row_security = on;

-- Create quest_sessions table
CREATE TABLE quest_sessions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  status TEXT CHECK (status IN ('active', 'completed', 'abandoned')) DEFAULT 'active',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- 開始日は終了日より前である必要がある
  CONSTRAINT valid_date_range CHECK (start_date <= end_date),
  -- 1つのユーザーは同時に1つのアクティブセッションのみ
  CONSTRAINT one_active_session_per_user UNIQUE (user_id, status) DEFERRABLE INITIALLY DEFERRED
);

-- Create tasks table
CREATE TABLE tasks (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  quest_session_id UUID REFERENCES quest_sessions(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  completed BOOLEAN DEFAULT FALSE,
  date DATE NOT NULL,
  priority INTEGER CHECK (priority IN (1, 2, 3)) DEFAULT 2,
  estimated_time INTEGER, -- 分単位
  actual_time INTEGER, -- 分単位
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  completed_at TIMESTAMP WITH TIME ZONE
);

-- Enable RLS on tables
ALTER TABLE quest_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for quest_sessions (より詳細なポリシー)
CREATE POLICY "Users can view their own quest sessions" ON quest_sessions
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own quest sessions" ON quest_sessions
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own quest sessions" ON quest_sessions
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own quest sessions" ON quest_sessions
  FOR DELETE USING (auth.uid() = user_id);

-- Create RLS policies for tasks (より詳細なポリシー)
CREATE POLICY "Users can view their own tasks" ON tasks
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own tasks" ON tasks
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own tasks" ON tasks
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own tasks" ON tasks
  FOR DELETE USING (auth.uid() = user_id);

-- Create indexes for performance
CREATE INDEX idx_tasks_user_id ON tasks(user_id);
CREATE INDEX idx_tasks_date ON tasks(date);
CREATE INDEX idx_tasks_quest_session_id ON tasks(quest_session_id);
CREATE INDEX idx_tasks_completed ON tasks(completed);
CREATE INDEX idx_quest_sessions_user_id ON quest_sessions(user_id);
CREATE INDEX idx_quest_sessions_status ON quest_sessions(status);
CREATE INDEX idx_quest_sessions_date_range ON quest_sessions(start_date, end_date);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Create function to update completed_at when task is completed
CREATE OR REPLACE FUNCTION update_completed_at()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.completed = TRUE AND OLD.completed = FALSE THEN
    NEW.completed_at = NOW();
  ELSIF NEW.completed = FALSE THEN
    NEW.completed_at = NULL;
  END IF;
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers
CREATE TRIGGER update_quest_sessions_updated_at
  BEFORE UPDATE ON quest_sessions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_tasks_updated_at
  BEFORE UPDATE ON tasks
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_tasks_completed_at
  BEFORE UPDATE ON tasks
  FOR EACH ROW EXECUTE FUNCTION update_completed_at();

-- Create view for quest session statistics
CREATE VIEW quest_session_stats AS
SELECT 
  qs.id,
  qs.user_id,
  qs.title,
  qs.start_date,
  qs.end_date,
  qs.status,
  COUNT(t.id) as total_tasks,
  COUNT(CASE WHEN t.completed = TRUE THEN 1 END) as completed_tasks,
  ROUND(
    COUNT(CASE WHEN t.completed = TRUE THEN 1 END)::numeric / 
    NULLIF(COUNT(t.id), 0) * 100, 2
  ) as completion_percentage,
  SUM(t.actual_time) as total_time_spent
FROM quest_sessions qs
LEFT JOIN tasks t ON qs.id = t.quest_session_id
GROUP BY qs.id, qs.user_id, qs.title, qs.start_date, qs.end_date, qs.status;

-- RLS for view
ALTER VIEW quest_session_stats SET (security_invoker = true);

-- Insert sample data (optional - for testing)
-- INSERT INTO quest_sessions (user_id, title, description, start_date, end_date) 
-- VALUES (auth.uid(), '英語学習30日チャレンジ', '毎日30分英語を勉強する', CURRENT_DATE, CURRENT_DATE + INTERVAL '29 days');
```

## 4. 認証設定

1. Supabase Dashboard の「Authentication」→「Settings」に移動
2. 「Site URL」に `http://localhost:3000` を設定
3. 「Redirect URLs」に以下を追加：
   - `http://localhost:3000/auth/callback`
   - 本番環境のURL（後で設定）

## 5. 確認事項

- [ ] Supabase プロジェクトが作成されている
- [ ] 環境変数が正しく設定されている
- [ ] データベーススキーマが作成されている
- [ ] RLS ポリシーが設定されている
- [ ] 認証設定が完了している

## 次のステップ

環境変数の設定が完了したら、開発サーバーを起動してSupabaseとの接続を確認してください：

```bash
npm run dev
```