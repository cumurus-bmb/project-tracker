# Tailwind CSS v3 設定ガイド（Laravel + Vite + React）

## 概要

Tailwind CSS v3 を Laravel + Vite + React（Inertia.js）環境で使用する設定。
設定ファイル（`tailwind.config.js`）ベースの方式。

---

## ファイル構成

```
tailwind.config.js          # Tailwind 設定（content, theme, plugins）
resources/css/app.css       # @tailwind ディレクティブ
vite.config.js              # Vite ビルド設定
```

---

## 設定ファイル

### tailwind.config.js

```js
import defaultTheme from 'tailwindcss/defaultTheme';
import forms from '@tailwindcss/forms';

/** @type {import('tailwindcss').Config} */
export default {
    content: [
        './vendor/laravel/framework/src/Illuminate/Pagination/resources/views/*.blade.php',
        './storage/framework/views/*.php',
        './resources/views/**/*.blade.php',
        './resources/js/**/*.{tsx,ts,jsx,js}',  // TSX/JSX 両方を対象
    ],

    theme: {
        extend: {
            fontFamily: {
                sans: ['Figtree', ...defaultTheme.fontFamily.sans],
            },
        },
    },

    plugins: [forms],
};
```

> **注意**: TypeScript に移行した場合は `content` の glob に `*.tsx` と `*.ts` が含まれていることを確認する。

---

### resources/css/app.css

```css
@tailwind base;
@tailwind components;
@tailwind utilities;
```

v3 では `@import "tailwindcss"` ではなく、この 3 行のディレクティブを使用する。

---

### vite.config.js（参考）

```js
import { defineConfig } from 'vite';
import laravel from 'laravel-vite-plugin';
import react from '@vitejs/plugin-react';

export default defineConfig({
    plugins: [
        laravel({
            input: 'resources/js/app.tsx',  // TypeScript の場合は .tsx
            refresh: true,
        }),
        react(),
    ],
    server: {
        host: '0.0.0.0',
        port: 5173,
        hmr: {
            host: 'localhost',
        },
    },
});
```

---

## shadcn/ui との統合

shadcn/ui は Tailwind CSS v3 に対応している。`components.json` の設定例：

```json
{
  "$schema": "https://ui.shadcn.com/schema.json",
  "style": "default",
  "rsc": false,
  "tsx": true,
  "tailwind": {
    "config": "tailwind.config.js",
    "css": "resources/css/app.css",
    "baseColor": "slate",
    "cssVariables": true,
    "prefix": ""
  },
  "aliases": {
    "components": "@/Components",
    "utils": "@/lib/utils"
  }
}
```

shadcn/ui を導入すると `resources/css/app.css` に CSS 変数が追加される：

```css
@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  :root {
    --background: 0 0% 100%;
    --foreground: 222.2 84% 4.9%;
    --primary: 217.2 91.2% 59.8%;
    /* その他のCSS変数 */
  }
  .dark {
    --background: 222.2 84% 4.9%;
    /* ... */
  }
}
```

shadcn/ui の追加コマンド：

```bash
docker compose exec node npx shadcn@latest add <component-name>
# 例
docker compose exec node npx shadcn@latest add button
docker compose exec node npx shadcn@latest add card
```

---

## テーマのカスタマイズ

`tailwind.config.js` の `theme.extend` で追加・上書きする：

```js
theme: {
    extend: {
        colors: {
            brand: {
                50:  '#eff6ff',
                500: '#3b82f6',
                900: '#1e3a5f',
            },
        },
        fontFamily: {
            sans: ['Figtree', ...defaultTheme.fontFamily.sans],
        },
        borderRadius: {
            'xl': '1rem',
        },
    },
},
```

---

## パッケージ管理

```bash
# Docker 環境でのパッケージ追加
docker compose exec node npm install -D <package>

# よく使う Tailwind 関連パッケージ
docker compose exec node npm install -D @tailwindcss/forms
docker compose exec node npm install -D @tailwindcss/typography
docker compose exec node npm install -D tailwind-merge
docker compose exec node npm install -D clsx
```

---

## トラブルシューティング

### Tailwind クラスが適用されない

1. `tailwind.config.js` の `content` にファイルパスが含まれているか確認
2. `resources/css/app.css` に `@tailwind` ディレクティブ 3 行があるか確認
3. Vite 開発サーバーを再起動

```bash
docker compose exec node npm run dev
```

### shadcn/ui のカラーが反映されない

- `resources/css/app.css` に CSS 変数（`--background` 等）が定義されているか確認
- `tailwind.config.js` の `content` に対象ファイルが含まれているか確認

### ビルドエラー: Cannot find module

```bash
docker compose exec node npm install
```

---

## 注意事項

- デフォルトの Tailwind CSS ユーティリティクラスを優先して使用し、独自 CSS は最小限にする
- `tailwind.config.js` を削除してはいけない（v3 では必須）
- v4 への移行は行わない（`@tailwindcss/vite` が混在しているが、コアは v3 を使用）
