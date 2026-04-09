---
paths:
  - ".env"
  - "docker-compose.yml"
  - "app/Mail/**"
  - "app/Notifications/**"
  - "app/Jobs/**"
---

# 実装ナレッジ（運用上の注意）

## .env と docker-compose.yml の優先順位

Laravel は `.env` を最優先で読み込む。`docker-compose.yml` の `environment:` に同じキーがあっても `.env` の値が使われる。

## QUEUE_CONNECTION とメール送信

`QUEUE_CONNECTION=database` の場合、`php artisan queue:work` が停止するとメール・通知が一切送信されない。開発中に動作確認する場合は `.env` で `QUEUE_CONNECTION=sync` に変更する。

## env() 関数を使わない

`config/*.php` 以外のコード（コントローラー・サービス・モデルなど）で `env()` を直接呼び出してはいけない。
`php artisan config:cache` を実行するとキャッシュが有効になり、`.env` は直接読まれなくなるため、`env()` は常に `null` を返す。

必ず `config()` 経由で参照する。

```php
// NG
env('STRIPE_PRICE_MONTHLY')

// OK: config/services.php に 'stripe' => ['price_monthly' => env('STRIPE_PRICE_MONTHLY')] を定義したうえで
config('services.stripe.price_monthly')
```

---

## ConoHa WING 固有の問題と対処法

> **注意**: このセクションは ConoHa WING（共有ホスティング）特有の問題です。
> VPS・AWS・Renderなど他のサーバーにデプロイする際はこれらの対処は不要です。

### 問題：マイグレーションで TIMESTAMP 型がエラーになる

**症状**: `migrate` 実行時にエラー  
**原因**: ConoHa WING の MySQL は `sql_mode` / `explicit_defaults_for_timestamp` の設定が Docker と異なるため、`TIMESTAMP` 型の定義がエラーになる  
**対処**: カスタムの日時カラムは `DATETIME` 型を使う

```php
// NG
$table->timestamp('published_at')->nullable();

// OK
$table->dateTime('published_at')->nullable();
```

> `$table->timestamps()` が生成する `created_at` / `updated_at` はそのままでよい（外部パッケージが依存するため変更しない）。

---


## VITE_APP_NAME の反映

`.env` の `APP_NAME` や `VITE_APP_NAME` を変更した後は Vite の再起動が必要。

```bash
docker compose restart node
docker compose exec node npm run dev
```
