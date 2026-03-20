# CLAUDE.md

このファイルは Claude Code へのプロジェクト全体ガイダンスを提供します。
詳細ルールは `.claude/rules/` の各ファイルを参照してください。

## コマンド

```bash
# 開発サーバー（Docker）
docker compose up -d              # コンテナ起動（Laravelは自動起動）
# ※ docker-compose.yml の node サービスに ports: "5173:5173" が必要
# ※ vite.config.js に server.host: '0.0.0.0' の設定が必要
docker compose exec node npm run dev  # Vite開発サーバー（port 5173）

# アーティザン
docker compose exec app php artisan migrate # マイグレーション実行
docker compose exec app php artisan migrate:fresh --seed    # DB初期化＋シーダー
docker compose exec app php artisan optimize:clear  # 全キャッシュクリア
docker compose exec app php artisan make:model ModelName -mrc

# フロントエンドビルド（ローカルPCのみ・本番用）
docker compose exec node npm run build  # public/build を生成してサーバーへアップ
```

## プロジェクト概要

**（プロジェクト名）** — （プロジェクトの説明）

- 機能要件・画面構成 → `.claude/requirements.md`
- 開発ロードマップ → `.claude/development_roadmap.md`

## スタック

| レイヤー | 技術 |
|----------|------|
| バックエンド | Laravel 12 / PHP 8.3 |
| フロントエンド | React 18 + TypeScript + Inertia.js v2 |
| UI | Tailwind CSS v3 + shadcn/ui |
| DB | MySQL 8.0 |
| 認証 | Laravel Breeze（Inertia + React） |
| 決済 | Stripe |
| 開発環境 | Docker |
| 本番環境 | ConoHa WING |

## MCPツール構成

| MCP | 用途 |
|-----|------|
| **Laravel Boost 2.0** | DBスキーマ・ルート・Eloquent・Artisanコマンド・Laravelドキュメント |
| **Context7** | React / Inertia.js / TypeScript / Stripe の最新ドキュメント |
| **shadcn/ui MCP** | UIコンポーネント情報 |
| **Stripe MCP** | Stripe API・Webhook・決済フローのドキュメント |
| **GitHub MCP** | Gitオペレーション・デプロイ連携 |

### Context7 の使い方

最新APIが必要な際はプロンプトに `use context7` を追記してください。

```
Inertia v2のuseFormを使ってフォームを実装して。use context7
```

## デザインシステム・Tailwind

- デザインシステム → `.claude/design_system.md`
- Tailwind CSS v3 設定 → `.claude/tailwind_document.md`

## 詳細ルール

| ファイル | 内容 |
|----------|------|
| `.claude/rules/laravel.md` | Laravel規約・コントローラー・認証・セキュリティ |
| `.claude/rules/react-inertia.md` | React・Inertia・TypeScript・shadcn/ui |
| `.claude/rules/database.md` | MySQL・Eloquent・マイグレーション規約 |
| `.claude/rules/stripe.md` | Stripe決済統合・Webhook処理 |
| `.claude/rules/deployment.md` | Docker開発環境・ConoHa Wingsデプロイ |
