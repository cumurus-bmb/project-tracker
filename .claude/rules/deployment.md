# 開発環境・デプロイ規約

## 開発環境（Docker）

### docker-compose.yml 基本構成

```yaml
services:
  app:
    build: .                          # ルートの Dockerfile を使用
    volumes:
      - .:/var/www/html
    ports:
      - "8000:8000"
    depends_on:
      - db
    environment:
      - DB_HOST=db
      - DB_DATABASE=your_db
      - DB_USERNAME=user
      - DB_PASSWORD=pass
    command: php artisan serve --host=0.0.0.0 --port=8000

  db:
    image: mysql:8.0
    environment:
      - MYSQL_DATABASE=your_db
      - MYSQL_USER=user
      - MYSQL_PASSWORD=pass
      - MYSQL_ROOT_PASSWORD=root_pass
    volumes:
      - db-data:/var/lib/mysql

  node:
    image: node:20-alpine
    volumes:
      - .:/var/www/html
    working_dir: /var/www/html
    ports:
      - "5173:5173"
    command: tail -f /dev/null        # 起動後に手動で npm run dev

volumes:
  db-data:
```

### Dockerfile（ルートに配置）

```dockerfile
FROM php:8.3-fpm-alpine

RUN apk add --no-cache icu-dev libzip-dev oniguruma-dev \
    && docker-php-ext-install intl pdo pdo_mysql zip

COPY --from=composer:latest /usr/bin/composer /usr/bin/composer
```

### よく使うコマンド

```bash
docker compose up -d                              # 起動（Laravel は自動起動）
docker compose exec node npm run dev              # Vite 開発サーバー（port 5173）
docker compose exec app bash                      # PHP コンテナに入る
docker compose exec app php artisan migrate
docker compose exec app composer install
docker compose exec db mysql -u root -p           # MySQL 接続

# .env の DB_HOST は "db"（サービス名）を指定
```

---

## 本番環境（ConoHa WING）

### 前提

- ConoHa WING の Web 公開ディレクトリは `public_html`（Laravelの `public` と異なる）
- 本番サーバーに **Node.js はインストールしない**
- `npm run build` は**ローカルPCで実行**し、生成された `public/build/` をアップロードする
- PHP・MySQL は WING のデフォルトバージョンを使用

### ディレクトリ配置方針

```
# ConoHa WING のホームディレクトリ構成
~/
├── public_html/           ← Web公開ディレクトリ（= Laravelの public/ の中身）
│   ├── index.php          ← パス修正済み
│   ├── .htaccess
│   └── build/             ← npm run build で生成したフォルダをそのままアップ
├── app/                   ← Laravelアプリ本体
├── bootstrap/
├── config/
├── database/
├── resources/
├── routes/
├── storage/
├── vendor/
└── .env                   ← 本番用環境変数
```

### index.php のパス修正

WING にアップした `public_html/index.php` の冒頭パスを以下のように修正する。

```php
<?php

// 変更前（デフォルト）
require __DIR__.'/../vendor/autoload.php';
$app = require_once __DIR__.'/../bootstrap/app.php';

// 変更後（WING用）
require __DIR__.'/../vendor/autoload.php';  // 変更なし
$app = require_once __DIR__.'/../bootstrap/app.php';  // 変更なし
// ※ public_html の親ディレクトリ（ホームディレクトリ）に
//    vendor/ と bootstrap/ があれば __DIR__/../ で正しく参照される
```

> **注意**: ホームディレクトリに Laravel 本体を置き、`public_html` が `public/` の代替になる構成なので、
> 相対パス `__DIR__/../` で vendor/ や bootstrap/ を参照できる。

### デプロイ手順

#### 初回デプロイ

```bash
# 1. ローカルでフロントエンドをビルド
npm run build
# → public/build/ が生成される

# 2. Git でリポジトリをプッシュ（public/build/ を .gitignore から外す or FTPで別途アップ）

# 3. WING の SSH または FTP でアップロード
#    - Laravel本体 → ホームディレクトリ（~/）
#    - public/ の中身 → ~/public_html/

# 4. WING の SSH で初期設定
cd ~
composer install --optimize-autoloader --no-dev
cp .env.example .env
php artisan key:generate
php artisan migrate --force
php artisan config:cache
php artisan route:cache
php artisan view:cache
chmod -R 775 storage bootstrap/cache
```

#### 2回目以降のデプロイ（更新）

```bash
# ローカル：ビルド & プッシュ
npm run build
git add public/build
git commit -m "build: update frontend assets"
git push

# WING側（SSH）
cd ~
git pull
composer install --optimize-autoloader --no-dev
php artisan migrate --force
php artisan optimize:clear
php artisan config:cache
php artisan route:cache
php artisan view:cache
```

### .env（本番用）

```env
APP_ENV=production
APP_DEBUG=false
APP_URL=https://あなたのドメイン.com

DB_CONNECTION=mysql
DB_HOST=127.0.0.1       # WINGのMySQLはlocalhost
DB_PORT=3306
DB_DATABASE=本番DB名
DB_USERNAME=本番DBユーザー
DB_PASSWORD=本番DBパスワード

STRIPE_KEY=pk_live_xxx
STRIPE_SECRET=sk_live_xxx
STRIPE_WEBHOOK_SECRET=whsec_xxx
```

### .htaccess（public_html/.htaccess）

ConoHa WING はApacheなので `.htaccess` でリライトが必要。Laravel標準の `public/.htaccess` をそのままコピーすればOK。

```apache
<IfModule mod_rewrite.c>
    <IfModule mod_negotiation.c>
        Options -MultiViews -Indexes
    </IfModule>

    RewriteEngine On
    RewriteCond %{HTTP:Authorization} .
    RewriteRule .* - [E=HTTP_AUTHORIZATION:%{HTTP:Authorization}]
    RewriteCond %{REQUEST_FILENAME} !-d
    RewriteCond %{REQUEST_FILENAME} !-f
    RewriteRule ^ index.php [L]
</IfModule>
```

### storage リンク

WINGにSSHで接続して以下を実行する（初回のみ）。

```bash
php artisan storage:link
# public_html/storage → ../storage/app/public のシンボリックリンクが作成される
```

### 注意事項

- 本番で `php artisan migrate:fresh` は**絶対禁止**（データが消える）
- `APP_DEBUG=false` を必ず確認してからデプロイする
- `vendor/` は `.gitignore` に含め、`composer install` でサーバー側に生成する
- `public/build/` は Git に含める（サーバーでビルドしないため）
