# PHP 8.3 の FPM (FastCGI Process Manager) 版を使用
FROM php:8.3-fpm-alpine

# Linux環境のパッケージマネージャ(apk)で必要なライブラリをインストール
RUN apk add --no-cache icu-dev libzip-dev oniguruma-dev \
    && docker-php-ext-install intl pdo pdo_mysql zip bcmath

# Composer を公式イメージからコピー
COPY --from=composer:latest /usr/bin/composer /usr/bin/composer
