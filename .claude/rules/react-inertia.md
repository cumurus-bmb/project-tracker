# React + Inertia.js 規約

## ディレクトリ構成

```
resources/js/
├── Pages/           # Inertia ページコンポーネント（ルートと 1:1 対応）
│   ├── Auth/        # 認証ページ（Breeze 生成）
│   ├── Posts/       # リソースごとにサブフォルダ
│   └── Dashboard.tsx
├── Components/      # 共通 UI コンポーネント
│   └── ui/          # shadcn/ui コンポーネント（自動生成）
├── Layouts/         # レイアウトコンポーネント
├── hooks/           # カスタム React フック
├── types/           # TypeScript 型定義
└── lib/             # ユーティリティ関数（cn() など）
```

## ページコンポーネント

- `Pages/` 配下に配置し、コントローラーの `Inertia::render('Posts/Index')` と対応
- Props の型は各ファイル内で `interface Props` として定義
- デフォルトエクスポートが必須

```tsx
// resources/js/Pages/Posts/Index.tsx
import { Head, Link } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { type PageProps } from '@/types';

interface Props extends PageProps {
    posts: {
        data: Post[];
        links: PaginationLink[];
    };
}

export default function Index({ posts, auth }: Props) {
    return (
        <AuthenticatedLayout user={auth.user}>
            <Head title="投稿一覧" />
            {/* コンテンツ */}
        </AuthenticatedLayout>
    );
}
```

## フォーム処理

フォームには必ず `useForm()` を使用する。`axios` や `fetch` で独自 API を叩かない。

```tsx
import { useForm } from '@inertiajs/react';

export default function Create() {
    const { data, setData, post, processing, errors, reset } = useForm({
        title: '',
        body: '',
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post(route('posts.store'), {
            onSuccess: () => reset(),
        });
    };

    return (
        <form onSubmit={handleSubmit}>
            <input
                value={data.title}
                onChange={(e) => setData('title', e.target.value)}
            />
            {errors.title && <p className="text-red-600 text-sm">{errors.title}</p>}
            <button type="submit" disabled={processing}>送信</button>
        </form>
    );
}
```

## ページ遷移

```tsx
// Link コンポーネント（推奨）
import { Link } from '@inertiajs/react';
<Link href={route('posts.index')}>一覧へ</Link>

// router（プログラム的遷移）
import { router } from '@inertiajs/react';
router.visit(route('posts.show', post.id));
router.delete(route('posts.destroy', post.id), {
    onBefore: () => confirm('削除しますか？'),
});
```

## 共有 Props の取得

```tsx
import { usePage } from '@inertiajs/react';
import { type PageProps } from '@/types';

// ページ内どこでも
const { auth, flash } = usePage<PageProps>().props;
```

## TypeScript 型定義

```typescript
// resources/js/types/index.d.ts
export interface User {
    id: number;
    name: string;
    email: string;
    email_verified_at: string | null;
}

export interface Post {
    id: number;
    user_id: number;
    title: string;
    body: string;
    created_at: string;
    updated_at: string;
}

export interface PaginationLink {
    url: string | null;
    label: string;
    active: boolean;
}

// Inertia の共有 Props を拡張
declare module '@inertiajs/core' {
    interface PageProps {
        auth: {
            user: User;
        };
        flash: {
            message?: string;
            error?: string;
        };
    }
}
```

## shadcn/ui コンポーネント

- インストール済みコンポーネントは `resources/js/Components/ui/` に自動配置される
- 新規追加: `npx shadcn@latest add <component-name>`
- デザインシステム（`.claude/design_system.md`）と競合する場合はデザインシステムを優先

```tsx
import { Button } from '@/Components/ui/button';
import { Input } from '@/Components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/Components/ui/card';
```

## カスタムフック

頻出パターンはカスタムフックに切り出す。

```tsx
// resources/js/hooks/useFlash.ts
import { usePage } from '@inertiajs/react';
import { useEffect } from 'react';
import { toast } from 'sonner';

export function useFlash() {
    const { flash } = usePage().props;

    useEffect(() => {
        if (flash.message) toast.success(flash.message);
        if (flash.error) toast.error(flash.error);
    }, [flash]);
}
```

## コーディング規約

- コンポーネント名: PascalCase
- フック名: camelCase（`use` プレフィックス必須）
- Props インターフェース: `interface Props` または `interface XxxProps`
- 型のみの import は `import { type Xxx }` を使用
- `any` 型は禁止。不明な場合は `unknown` を使用
- ESLint + Prettier 準拠
