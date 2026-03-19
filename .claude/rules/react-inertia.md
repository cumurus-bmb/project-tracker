# React + Inertia.js 規約

## ディレクトリ構成

```
resources/js/
├── Pages/           # Inertia ページコンポーネント（ルートと 1:1 対応）
│   ├── Auth/        # 認証ページ（Breeze 生成）
│   ├── Posts/       # リソースごとにサブフォルダ
│   └── Dashboard.jsx
├── Components/      # 共通 UI コンポーネント
│   └── ui/          # shadcn/ui コンポーネント（自動生成）
├── Layouts/         # レイアウトコンポーネント
└── hooks/           # カスタム React フック
```

## ページコンポーネント

- `Pages/` 配下に配置し、コントローラーの `Inertia::render('Posts/Index')` と対応
- デフォルトエクスポートが必須

```jsx
// resources/js/Pages/Posts/Index.jsx
import { Head, Link } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';

export default function Index({ posts, auth }) {
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

```jsx
import { useForm } from '@inertiajs/react';

export default function Create() {
    const { data, setData, post, processing, errors, reset } = useForm({
        title: '',
        body: '',
    });

    const handleSubmit = (e) => {
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

```jsx
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

```jsx
import { usePage } from '@inertiajs/react';

// ページ内どこでも
const { auth, flash } = usePage().props;
```

## shadcn/ui コンポーネント

- インストール済みコンポーネントは `resources/js/Components/ui/` に自動配置される
- 新規追加: `npx shadcn@latest add <component-name>`
- デザインシステム（`.claude/design_system.md`）と競合する場合はデザインシステムを優先

```jsx
import { Button } from '@/Components/ui/button';
import { Input } from '@/Components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/Components/ui/card';
```

## カスタムフック

頻出パターンはカスタムフックに切り出す。

```jsx
// resources/js/hooks/useFlash.js
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
- ESLint + Prettier 準拠
