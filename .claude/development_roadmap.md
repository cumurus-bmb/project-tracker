# Project Tracker 開発ロードマップ

## 概要
このドキュメントは、Project Trackerの段階的な開発を進めるためのロードマップです。
基盤やコア機能から作成し、ユーザーが画面上で動作確認しながら開発を進められるように構成されています。

## 前提条件
- [x] Docker 環境構築済み（app / db / node の3サービス起動確認）
- [x] Laravel 12 + React 18 + Inertia.js v2 + Tailwind CSS v3 インストール済み
- [x] Laravel Breeze（Inertia + React）インストール済み
- [x] `.env` の DB 接続設定済み（DB_HOST=db）
- [x] 要件定義書（`.claude/requirements.md`）確認済み

## フェーズ1: 基盤構築

### 1.1 プロジェクト基本設定
- [x] Tailwind CSS のデザインシステム適用
  - [x] `resources/css/app.css` の CSS 変数・スタイル設定
  - [x] カラーシステムの実装（`design_system.md` 参照）
  - [x] shadcn/ui のインストールと初期設定
- [x] TypeScript の型定義ファイル作成
  - [x] `resources/js/types/index.d.ts`（User, Category, WorkLog, PaginationLink 等）
  - [x] Inertia 共有 Props の型拡張（auth, flash, subscription）

### 1.2 データベース設計とマイグレーション
- [x] データベーススキーマの設計
  - [x] `users` テーブル拡張（timezone, week_start カラム追加）
  - [x] `categories` テーブル（カテゴリ管理）
  - [x] `work_logs` テーブル（作業時間記録）
- [x] マイグレーションファイルの作成
  ```bash
  docker compose exec app php artisan make:migration add_settings_to_users_table
  docker compose exec app php artisan make:migration create_categories_table
  docker compose exec app php artisan make:migration create_work_logs_table
  ```
- [x] マイグレーション実行
  ```bash
  docker compose exec app php artisan migrate
  ```
- [x] Eloquent モデルの作成（`$fillable`, リレーション, スコープ定義）
  ```bash
  docker compose exec app php artisan make:model Category -mrc
  docker compose exec app php artisan make:model WorkLog -mrc
  ```

### 1.3 認証システムの確認・カスタマイズ
- [x] Laravel Breeze（Inertia + React）の動作確認
  - [x] `/login` ログインページ
  - [x] `/register` 新規登録ページ
  - [x] `/forgot-password` パスワードリセットページ
- [x] `HandleInertiaRequests` ミドルウェアで共有 Props を設定
  - [x] `auth.user`
  - [x] `flash`（フラッシュメッセージ）
  - [x] `subscription`（プレミアム状態）
- [x] `AuthenticatedLayout` のカスタマイズ（ヘッダー・ナビゲーション）
- [x] 認証状態の動作確認

## フェーズ2: 基本機能の実装

### 2.1 レイアウトとナビゲーション
- [x] `AuthenticatedLayout.tsx` のカスタマイズ
  - [x] ロゴ
  - [x] ナビゲーションメニュー（ダッシュボード・カテゴリ・レポート）
  - [x] ユーザードロップダウン（プロフィール・請求管理・ログアウト）
- [x] `GuestLayout.tsx` のカスタマイズ
- [x] トップページの作成（`/`）
  - [x] サービス紹介
  - [x] 機能説明
  - [x] CTA ボタン（ログイン・新規登録）
  - [x] 料金プランセクション

### 2.2 ダッシュボード基本構造
- [x] `DashboardController@index` の作成
- [x] `Pages/Dashboard.tsx` の作成
  - [x] 今日の作業時間
  - [x] 今週の作業時間
  - [x] 今月の作業時間
  - [x] 直近の作業履歴（最新10件）

### 2.3 カテゴリ管理機能
- [x] `CategoryController` の実装（index / store / update / destroy）
- [x] FormRequest の作成（`StoreCategoryRequest`, `UpdateCategoryRequest`）
- [x] `Pages/Categories/Index.tsx` の作成
  - [x] カテゴリ一覧表示
  - [x] カテゴリ作成フォーム（カテゴリ名・色選択・バリデーション）
  - [x] カテゴリ編集機能
  - [x] カテゴリ削除機能（確認ダイアログ付き）
- [x] ルート定義（`routes/web.php`）
  ```php
  Route::resource('categories', CategoryController::class)->except(['show']);
  ```

## フェーズ3: 作業時間記録機能

### 3.1 タイマー機能の実装
- [x] `Components/Timer.tsx` の作成
  - [x] スタート/ストップボタン
  - [x] 一時停止/再開機能
  - [x] 経過時間表示（00:00:00 形式）
  - [x] タイマー状態の管理（React state）
  - [x] カテゴリ選択（必須）

### 3.2 手動入力機能
- [x] `Components/WorkLogForm.tsx` の作成
  - [x] 日付選択
  - [x] 作業時間直接入力（時間・分単位）
  - [x] カテゴリ選択（必須）
  - [x] メモ入力（オプション）
- [x] Inertia `useForm()` によるフォーム処理・バリデーション表示

### 3.3 作業記録 Controller と Route
- [x] `WorkLogController` の実装（index / store / update / destroy）
- [x] `StoreWorkLogRequest` / `UpdateWorkLogRequest` の作成
- [x] ルート定義
  ```php
  Route::resource('work-logs', WorkLogController::class)->except(['show', 'create', 'edit']);
  ```
- [x] `Pages/WorkLogs/` コンポーネントの作成
  - [x] 作業履歴一覧（日付グルーピング・タイムゾーン対応）
  - [x] 編集ダイアログ
  - [x] 削除確認

## フェーズ4: データ表示と基本分析

### 4.1 作業履歴表示
- [ ] `Components/WorkHistory.tsx` の作成
  - [ ] 日付ごとのグルーピング（ユーザーのタイムゾーン対応）
  - [ ] カテゴリ表示（色付きドット）
  - [ ] 作業時間の表示（開始〜終了時刻 + 合計時間）
  - [ ] 編集・削除機能（Inertia router 使用）
  - [ ] メモの表示
  - [ ] Inertia の `router.reload()` で自動リフレッシュ

### 4.2 基本的な統計表示（無料版）
- [ ] `Components/StatCards.tsx` の作成
  - [ ] 今日の合計
  - [ ] 今週の合計（週の開始曜日設定対応）
  - [ ] 今月の合計
- [ ] `DashboardController` で統計データを集計して Inertia に渡す
- [ ] カテゴリ別統計（今月）
  - [ ] カテゴリごとの作業時間とパーセンテージ
  - [ ] プログレスバーでの視覚化

### 4.3 データエクスポート機能
- [ ] `ExportController@export` の作成（CSV 生成・BOM 付き UTF-8）
- [ ] エクスポート範囲の選択（全期間・今月・先月・今週・期間指定）
- [ ] `Components/ExportButton.tsx` の作成

## フェーズ5: プレミアム機能の実装

### 5.1 Stripe + Laravel Cashier のセットアップ
- [x] Laravel Cashier のインストール
  ```bash
  docker compose exec app composer require laravel/cashier
  docker compose exec app php artisan vendor:publish --tag="cashier-migrations"
  docker compose exec app php artisan migrate
  ```
- [x] `User` モデルに `Billable` トレイトを追加
- [x] `.env` に Stripe キーを設定
  ```
  STRIPE_KEY=pk_test_xxx
  STRIPE_SECRET=sk_test_xxx
  STRIPE_WEBHOOK_SECRET=whsec_xxx
  STRIPE_PRICE_MONTHLY=price_1TCgAOGhzxAsAPQYdB7Fnyhl
  CASHIER_CURRENCY=jpy
  ```
- [x] **【手動作業】** Stripe ダッシュボードでサブスクリプションプランを作成し、Price ID を取得
- [ ] `routes/web.php` の CSRF 除外設定（`stripe/webhook`）

### 5.2 料金ページ・Checkout 実装
- [ ] `SubscriptionController` の作成（pricing / checkout / billingPortal）
- [ ] `Pages/Pricing.tsx` の作成
  - [ ] 料金プラン一覧（無料 vs プレミアム）
  - [ ] Stripe Checkout へのリダイレクトボタン
- [ ] Stripe Checkout Session の作成（`newSubscription()->checkout()`）
- [ ] 決済成功・キャンセル後のリダイレクト先設定
- [ ] Stripe カスタマーポータル（`/billing`）の実装
- [ ] サイドバーにアップグレード CTA 追加（未加入ユーザー向け）

### 5.3 アクセス制御
- [ ] `HandleInertiaRequests` で `subscription.isSubscribed` を共有 Props に追加
- [ ] フロントエンドでのアクセス制限（`usePage().props.subscription.isSubscribed`）
- [ ] バックエンドでのアクセス制限（`$user->subscribed('default')`）
- [ ] アップグレード促進 UI（プレミアム未加入ユーザー向けオーバーレイ）

### 5.4 高度な分析機能：期間切り替え UI（プレミアム）
- [ ] `ReportController@index` の作成
- [ ] `Pages/Reports/Index.tsx` の作成
  - [ ] 日次/週次/月次/年次タブ
  - [ ] 期間セレクター（今日/昨日/カスタム・今週/先週・今月/先月・今年/去年）
  - [ ] サマリーカード（合計時間・前期間比・1日平均）
  - [ ] カテゴリ別内訳

### 5.5 グラフ表示機能（プレミアム）
- [ ] Recharts のインストール
  ```bash
  docker compose exec node npm install recharts
  ```
- [ ] グラフコンポーネントの作成
  - [ ] 棒グラフ（時間帯別/曜日別/日別/月別）
  - [ ] 円グラフ（カテゴリ別時間配分 + 凡例）
  - [ ] ヒートマップ（月次：カレンダー形式 / 年次：GitHub 形式）
  - [ ] カテゴリ別内訳（プログレスバー付き）

### 5.6 生産性指標（プレミアム）
- [ ] 平均作業時間の算出と表示
- [ ] 最も集中した時間帯の分析
- [ ] カテゴリごとの推移グラフ

### 5.7 レポート機能（プレミアム）
- [ ] PDF レポート生成（html2canvas + jsPDF、日本語対応）

## フェーズ6: 本番デプロイ（ConoHa WING）

### 6.1 デプロイ準備
- [ ] `npm run build` でフロントエンドビルド（ローカル PC で実行）
- [ ] `public/build/` を Git に含める
- [ ] 本番用 `.env` の作成（`APP_DEBUG=false`, `APP_ENV=production`）

### 6.2 ConoHa WING へのアップロード
- [ ] Laravel 本体をホームディレクトリ（`~/`）にアップロード
- [ ] `public/` の中身を `~/public_html/` にアップロード
- [ ] `public_html/index.php` のパス確認

### 6.3 本番環境の初期設定（SSH）
- [ ] `composer install --optimize-autoloader --no-dev`
- [ ] `php artisan key:generate`
- [ ] `php artisan migrate --force`
- [ ] `php artisan config:cache && php artisan route:cache && php artisan view:cache`
- [ ] `chmod -R 775 storage bootstrap/cache`
- [ ] `php artisan storage:link`
- [ ] **【手動作業】** Stripe ダッシュボードで本番用 Webhook エンドポイントを登録

---

## 開発の進め方

1. **各タスクの開始前**
   - 関連するドキュメント（`.claude/` 内）を確認
   - 必要な設計を検討
   - デザインシステムの該当部分を確認

2. **実装時**
   - デザインシステムに準拠した UI を作成
   - TypeScript の型安全性を確保
   - フォームは必ず Inertia の `useForm()` を使用
   - エラーハンドリングを適切に実装

3. **タスク完了時**
   - 動作確認を実施
   - チェックマークを付ける
   - 次のタスクに必要な情報を整理

4. **フェーズ完了時**
   - 統合テストを実施
   - ユーザー視点での動作確認
   - 必要に応じてリファクタリング

## 備考

- 各フェーズは順番に進めることを推奨しますが、依存関係がないタスクは並行して進めることも可能です
- プレミアム機能の実装は、基本機能が安定してから着手することを推奨します
- 定期的にコミットを行い、進捗を記録してください
- 不明な点は要件定義書や各種ドキュメントを参照してください
- 本番環境（ConoHa WING）では `php artisan migrate:fresh` は絶対禁止
