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

## VITE_APP_NAME の反映

`.env` の `APP_NAME` や `VITE_APP_NAME` を変更した後は Vite の再起動が必要。

```bash
docker compose restart node
docker compose exec node npm run dev
```
