# Technology Stack

## フロントエンド

### コアフレームワーク
- **Next.js 15** - React フレームワーク
  - App Router を使用
  - SSR/SSG による高速化
  - API Routes でサーバーサイド処理
  - Turbopack による高速開発

### 言語
- **TypeScript** - 型安全性とDX向上
  - strict モード使用
  - 完全型定義必須

### スタイリング
- **Tailwind CSS v4** - ユーティリティファーストCSS
  - レスポンシブ対応
  - ダークモード対応準備済み
  - カスタムテーマ設定

### 状態管理・データフェッチ
- **SWR** - サーバー状態管理
  - キャッシュ機能
  - 楽観的更新
  - エラーハンドリング
  - 自動リバリデーション

## バックエンド

### データベース
- **Supabase (PostgreSQL)** - BaaS
  - RLS (Row Level Security) によるセキュリティ
  - リアルタイム機能
  - 自動バックアップ
  - 無料プランで運用

### 認証
- **Supabase Auth** - 認証サービス
  - メール/パスワード認証
  - セッション管理
  - セキュアなCookie管理

### API設計
- **REST API** - Next.js API Routes
  - `/api/quest-sessions` - クエスト管理
  - `/api/tasks` - タスク管理
  - `/api/tasks/[id]` - 個別タスク操作

## 開発ツール

### 品質管理
- **Biome** - リンター・フォーマッター
  - ESLint + Prettier の代替
  - 高速動作
  - 統一されたコードスタイル

### 型システム
- **TypeScript** - 型チェック
  - データベース型定義生成
  - コンポーネント型定義
  - API レスポンス型定義

### パッケージマネージャー
- **npm** - 依存関係管理
  - package-lock.json でバージョン固定
  - セキュリティ監査

## デプロイ・インフラ

### ホスティング
- **Vercel** - フロントエンドホスティング
  - 自動デプロイ
  - Edge Functions
  - 高速CDN
  - プレビュー環境

### データベース
- **Supabase** - クラウドPostgreSQL
  - 自動スケーリング
  - 定期バックアップ
  - 監視・ログ

### CI/CD
- **GitHub Actions** - 自動化
  - テスト実行
  - ビルド検証
  - デプロイ自動化

## セキュリティ

### 認証・認可
- **Supabase Auth** - JWT ベース認証
- **RLS** - データベースレベルでの認可
- **Middleware** - リクエスト認証チェック

### データ保護
- **HTTPS** - 通信暗号化
- **Environment Variables** - 機密情報管理
- **Input Validation** - 入力値検証

## パフォーマンス

### 最適化
- **SWR** - データキャッシュ
- **Next.js** - 画像最適化
- **Tailwind CSS** - CSS最適化
- **TypeScript** - バンドルサイズ最適化

### 目標指標
- **初回ロード**: 1.5秒以内
- **Lighthouse Score**: 95点以上
- **Core Web Vitals**: 良好評価

## 開発環境

### 必須ツール
- **Node.js** - 実行環境
- **npm** - パッケージマネージャー
- **Git** - バージョン管理
- **VS Code** - 推奨エディター

### 推奨拡張
- **TypeScript** - 型チェック
- **Tailwind CSS IntelliSense** - CSS補完
- **Biome** - リンター・フォーマッター