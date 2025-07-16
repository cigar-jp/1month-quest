# Project Structure

## ディレクトリ構造

```
1month-quest/
├── docs/                    # プロジェクトドキュメント
│   ├── product.md          # プロダクト概要
│   ├── tech.md             # 技術スタック
│   ├── structure.md        # プロジェクト構造
│   ├── requirements.md     # 要件定義
│   └── todos.md            # タスク管理
├── src/
│   ├── app/                # Next.js App Router
│   │   ├── api/           # API Routes
│   │   ├── auth/          # 認証関連ページ
│   │   ├── globals.css    # グローバルスタイル
│   │   ├── layout.tsx     # ルートレイアウト
│   │   └── page.tsx       # ホームページ
│   ├── components/         # React コンポーネント
│   │   ├── auth/          # 認証コンポーネント
│   │   ├── layout/        # レイアウトコンポーネント
│   │   ├── quest/         # クエストコンポーネント
│   │   └── tasks/         # タスクコンポーネント
│   ├── contexts/          # React Context
│   ├── hooks/             # カスタムフック
│   ├── lib/               # ユーティリティ
│   │   ├── api/           # API関連
│   │   ├── supabase/      # Supabase設定
│   │   └── swr/           # SWR設定
│   ├── providers/         # プロバイダー
│   └── types/             # TypeScript型定義
├── public/                # 静的ファイル
├── .env.local             # 環境変数
├── middleware.ts          # Next.js ミドルウェア
├── tailwind.config.ts     # Tailwind設定
├── tsconfig.json          # TypeScript設定
├── biome.json             # Biome設定
└── package.json           # 依存関係
```

## 命名規則

### ファイル・ディレクトリ
- **コンポーネント**: `kebab-case` (例: `task-list.tsx`)
- **フック**: `camelCase` (例: `useTasks.ts`)
- **ユーティリティ**: `kebab-case` (例: `date-utils.ts`)
- **型定義**: `kebab-case` (例: `database.ts`)

### 変数・関数
- **変数**: `camelCase` (例: `activeQuest`)
- **関数**: `camelCase` (例: `handleSubmit`)
- **定数**: `SCREAMING_SNAKE_CASE` (例: `API_BASE_URL`)
- **コンポーネント**: `PascalCase` (例: `TaskList`)

## インポート規則

### インポート順序
1. React/Next.js関連
2. 外部ライブラリ
3. 内部ユーティリティ
4. 型定義
5. 相対パス

```typescript
// 例
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import useSWR from 'swr'

import { supabase } from '@/lib/supabase/client'
import { Database } from '@/types/database'

import './component.css'
```

### パスエイリアス
- `@/` - `src/` ディレクトリ
- `@/components/` - コンポーネント
- `@/hooks/` - カスタムフック
- `@/lib/` - ユーティリティ
- `@/types/` - 型定義

## コンポーネント設計

### ディレクトリ構造
```
components/
├── auth/
│   ├── auth-form.tsx
│   └── protected-route.tsx
├── layout/
│   └── header.tsx
├── quest/
│   └── quest-create-form.tsx
└── tasks/
    ├── task-list.tsx
    ├── task-item.tsx
    └── task-create-form.tsx
```

### コンポーネント規則
- **1ファイル1コンポーネント**
- **propsインターface必須**
- **デフォルトエクスポート使用**
- **'use client'ディレクティブ明示**

```typescript
// 例: task-item.tsx
'use client'

import { useState } from 'react'
import { Database } from '@/types/database'

type Task = Database['public']['Tables']['tasks']['Row']

interface TaskItemProps {
  task: Task
  onUpdate: (task: Task) => void
}

export default function TaskItem({ task, onUpdate }: TaskItemProps) {
  // 実装
}
```

## フック設計

### カスタムフック
```typescript
// 例: useTasks.ts
import useSWR from 'swr'
import { Database } from '@/types/database'

type Task = Database['public']['Tables']['tasks']['Row']

export function useTasks(questSessionId?: string) {
  const { data, error, isLoading, mutate } = useSWR<Task[]>(
    questSessionId ? `/api/tasks?quest_session_id=${questSessionId}` : null,
    fetcher
  )

  return {
    tasks: data || [],
    isLoading,
    isError: error,
    mutate,
  }
}
```

## API設計

### ルート構造
```
api/
├── quest-sessions/
│   └── route.ts           # GET, POST
├── tasks/
│   ├── route.ts           # GET, POST
│   └── [id]/
│       └── route.ts       # PUT, DELETE, PATCH
```

### レスポンス形式
```typescript
// 成功時
{
  data: T,
  message?: string
}

// エラー時
{
  error: string,
  details?: any
}
```

## 型定義

### データベース型
```typescript
// types/database.ts
export interface Database {
  public: {
    Tables: {
      tasks: {
        Row: { /* 実際の型 */ }
        Insert: { /* 挿入用型 */ }
        Update: { /* 更新用型 */ }
      }
    }
  }
}
```

### コンポーネント型
```typescript
// 型エイリアス使用
type Task = Database['public']['Tables']['tasks']['Row']

// Props型定義
interface TaskListProps {
  tasks: Task[]
  onTaskUpdate: (task: Task) => void
}
```

## 状態管理

### SWR使用パターン
```typescript
// データフェッチ
const { data, error, isLoading } = useSWR(key, fetcher)

// ミューテーション
const { trigger, isMutating } = useSWRMutation(key, mutationFetcher)

// 楽観的更新
mutate(optimisticData, false)
```

## エラーハンドリング

### 階層化されたエラー処理
1. **APIレベル** - HTTP ステータスコード
2. **フックレベル** - SWR エラーハンドリング
3. **コンポーネントレベル** - UI エラー表示
4. **グローバルレベル** - SWR プロバイダー

## スタイリング

### Tailwind CSS規則
- **ユーティリティファースト**
- **レスポンシブ接頭辞使用**
- **カスタムクラスは最小限**
- **スマホファーストデザイン**

```jsx
// 例
<div className="bg-white p-4 rounded-lg shadow-sm sm:p-6 md:p-8">
  <h2 className="text-lg font-semibold text-gray-900 mb-4">
    タイトル
  </h2>
</div>
```