# テスト戦略 - t_wada氏のTDD戦略に基づく

## TDDの基本原則

t_wada氏のTDD戦略に基づき、以下の原則を採用します：

### 1. テストファースト
- 実装前にテストを書く
- 失敗するテストから始める
- 最小限の実装でテストを通す

### 2. リファクタリング
- テストが通った後にコードを改善
- テストが常に緑の状態を保つ

### 3. 小さなサイクル
- Red → Green → Refactor のサイクルを短時間で回す

## テスト構成

### ユニットテスト
- **対象**: 単一のコンポーネント・関数・Hook
- **ツール**: Vitest + React Testing Library
- **モック**: 外部依存関係をモック
- **例**: `ProgressBar`, `useProgressStats`, `TaskItem`

### 統合テスト
- **対象**: 複数のコンポーネントの組み合わせ
- **ツール**: Vitest + React Testing Library
- **例**: `TaskList` + `TaskItem`の組み合わせ

### APIテスト
- **対象**: Next.js API Routes
- **ツール**: Vitest + Node.js fetch
- **モック**: Supabaseクライアント

## テストの品質基準

### 1. AAA（Arrange-Act-Assert）パターン
```typescript
it("should calculate percentage correctly", () => {
  // Arrange
  const completed = 3;
  const total = 10;
  
  // Act
  render(<ProgressBar completed={completed} total={total} />);
  
  // Assert
  expect(screen.getByText("3/10 (30%)")).toBeInTheDocument();
});
```

### 2. テスト名の規則
- 何をテストしているかを明確に
- 日本語で記述してOK
- 期待する動作を具体的に表現

### 3. モックの使用指針
- 外部依存（API、Supabase）はモック
- Propsやコールバックは実際の関数を使用
- コンポーネント内部のロジックはモックしない

## テストファイル構成

```
src/
├── components/
│   ├── progress/
│   │   ├── progress-bar.tsx
│   │   └── progress-bar.test.tsx
├── hooks/
│   ├── useProgressStats.ts
│   └── useProgressStats.test.ts
├── app/api/
│   ├── tasks/
│   │   ├── route.ts
│   │   └── route.test.ts
└── test/
    ├── setup.ts
    └── utils.tsx
```

## セットアップ

### 1. テスト環境設定
- `vitest.config.ts`: Vitestの設定
- `src/test/setup.ts`: グローバルセットアップ
- `src/test/utils.tsx`: カスタムレンダー関数

### 2. モック設定
- Supabaseクライアント: 完全モック
- Next.js Router: 最小限モック
- SWR: データフェッチモック

### 3. テスト実行コマンド
```bash
npm run test           # 一回実行
npm run test:watch     # ウォッチモード
npm run test:coverage  # カバレッジ測定
npm run test:ui        # UIモード
```

## TDD実践例

### Step 1: 失敗するテストを書く
```typescript
it("should display task completion percentage", () => {
  render(<ProgressBar completed={3} total={10} />);
  expect(screen.getByText("30%")).toBeInTheDocument();
});
```

### Step 2: 最小限の実装
```typescript
export default function ProgressBar({ completed, total }) {
  const percentage = Math.round((completed / total) * 100);
  return <div>{percentage}%</div>;
}
```

### Step 3: テストを通す
緑色になるまで実装を調整

### Step 4: リファクタリング
- 型安全性の追加
- エッジケースの対応
- UIの改善

## テストの優先順位

1. **ビジネスロジック**: 進捗計算、連続記録算出
2. **ユーザー操作**: クリック、入力、フォーム送信
3. **状態管理**: SWRのデータフェッチ、楽観的更新
4. **API**: 認証、CRUD操作、エラーハンドリング
5. **UI表示**: レンダリング、スタイル、レスポンシブ

## カバレッジ目標

- **ステートメント**: 80%以上
- **ブランチ**: 75%以上
- **関数**: 85%以上
- **ライン**: 80%以上

## CI/CD統合

- プルリクエスト時に自動テスト実行
- テスト失敗時はマージを阻止
- カバレッジレポートの生成
- E2Eテストは別途設定（Playwright等）

## 参考資料

- [t_wada氏のTDD講演](https://www.youtube.com/watch?v=Q-FJ3XmFlT8)
- [Kent C. Dodds - Testing Trophy](https://kentcdodds.com/blog/the-testing-trophy-and-testing-classifications)
- [React Testing Library公式ドキュメント](https://testing-library.com/docs/react-testing-library/intro/)