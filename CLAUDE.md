# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

このファイルは Claude Code へのプロジェクト全体ガイダンスを提供します。
詳細ルールは `.claude/rules/` の各ファイルを参照してください。

## コマンド

```bash
# 開発サーバー（Docker）
docker compose up -d              # コンテナ起動（Laravelは自動起動）
docker compose exec node npm run dev  # Vite開発サーバー（port 5173）

# アーティザン
docker compose exec app php artisan migrate              # マイグレーション実行
docker compose exec app php artisan migrate:fresh --seed # DB初期化＋シーダー
docker compose exec app php artisan optimize:clear       # 全キャッシュクリア
docker compose exec app php artisan make:model ModelName -mrc

# テスト・フォーマット
docker compose exec app php artisan test                 # PHPUnit テスト実行
docker compose exec app ./vendor/bin/pint                # PHP コードフォーマット（PSR-12）

# フロントエンドビルド（本番用）
docker compose exec node npm run build  # public/build を生成してサーバーへアップ

# Stripe Webhook ローカルテスト（WSL2 ターミナルで実行・Docker 内ではない）
stripe listen --forward-to localhost:8000/stripe/webhook
```

## プロジェクト概要

**Project Tracker** — （プロジェクトの説明）

- 機能要件・画面構成 → `.claude/requirements.md`
- 開発ロードマップ → `.claude/development_roadmap.md`

## スタック

| レイヤー | 技術 |
|----------|------|
| バックエンド | Laravel 12 / PHP 8.3 |
| フロントエンド | React 18 + TypeScript + Inertia.js v2（※現エントリーポイントは `app.jsx`、TypeScript移行中） |
| UI | Tailwind CSS v3 + shadcn/ui（未インストール） |
| DB | MySQL 8.0 |
| 認証 | Laravel Breeze（Inertia + React） |
| 決済 | Stripe（Laravel Cashier v16.5） |
| 開発環境 | Docker（app / db / node の3サービス） |
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

## 開発フロー

実装は `.claude/development_roadmap.md` のタスク順に進める。1タスクごとに以下のサイクルを繰り返す。

1. **Claude が実装**：ロードマップの次のタスクを実装する
2. **Claude がテスト方針を提示**：実装後、Kazunari が何をどう確認すべきか手順を示す
3. **Kazunari がテスト**：ブラウザ・ターミナルで実際に動作確認を行う
4. **Kazunari が結果を報告**：OK / NG・エラー内容を Claude に伝える
5. **次のタスクへ**：問題なければロードマップのチェックを更新して次へ進む

> ロードマップを飛ばしたり、まとめて複数タスクを実装しない。
> テスト結果を受け取るまで次のタスクに着手しない。

## 詳細ルール

| ファイル | 内容 |
|----------|------|
| `.claude/rules/laravel.md` | Laravel規約・コントローラー・認証・セキュリティ |
| `.claude/rules/react-inertia.md` | React・Inertia・TypeScript・shadcn/ui |
| `.claude/rules/database.md` | MySQL・Eloquent・マイグレーション規約 |
| `.claude/rules/stripe.md` | Stripe決済統合・Webhook処理 |
| `.claude/rules/deployment.md` | Docker開発環境・ConoHa Wingsデプロイ |
| `.claude/rules/knowlege.md` | 環境設定・キュー・Viteに関する運用上の注意（.env / docker-compose 編集時に自動ロード） |
