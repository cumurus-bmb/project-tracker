import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { type Category, type PageProps } from '@/types';
import { Head, router, useForm } from '@inertiajs/react';
import { Pencil, Star, Trash2, X } from 'lucide-react';
import { useState } from 'react';

// ---- 色プリセット ----
const COLOR_PRESETS = [
    '#EF4444', '#F97316', '#EAB308', '#22C55E',
    '#14B8A6', '#3B82F6', '#8B5CF6', '#EC4899',
    '#6B7280', '#1D4ED8', '#059669', '#D97706',
];

// ---- 小コンポーネント ----

function ColorPicker({
    value,
    onChange,
}: {
    value: string;
    onChange: (color: string) => void;
}) {
    return (
        <div className="flex flex-wrap gap-2">
            {COLOR_PRESETS.map((c) => (
                <button
                    key={c}
                    type="button"
                    onClick={() => onChange(c)}
                    className={`h-7 w-7 rounded-full border-2 transition-transform hover:scale-110 ${
                        value === c ? 'border-gray-900 scale-110' : 'border-transparent'
                    }`}
                    style={{ backgroundColor: c }}
                    aria-label={c}
                />
            ))}
        </div>
    );
}

// ---- カテゴリ作成フォーム ----

function CreateCategoryForm() {
    const { data, setData, post, processing, errors, reset } = useForm({
        name: '',
        color: COLOR_PRESETS[5],
        is_favorite: false as boolean,
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post(route('categories.store'), { onSuccess: () => reset() });
    };

    return (
        <form onSubmit={handleSubmit} className="rounded-2xl border border-gray-300 bg-white p-6 shadow-md">
            <h2 className="mb-4 text-base font-semibold text-gray-900">カテゴリを追加</h2>

            <div className="mb-4">
                <label className="mb-1 block text-sm font-medium text-gray-700">
                    カテゴリ名 <span className="text-red-600">*</span>
                </label>
                <input
                    type="text"
                    value={data.name}
                    onChange={(e) => setData('name', e.target.value)}
                    placeholder="例：仕事、勉強、運動"
                    maxLength={50}
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 placeholder-gray-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
                {errors.name && (
                    <p className="mt-1 text-xs text-red-600">{errors.name}</p>
                )}
            </div>

            <div className="mb-4">
                <label className="mb-2 block text-sm font-medium text-gray-700">カラー</label>
                <div className="flex items-center gap-3">
                    <div
                        className="h-8 w-8 flex-shrink-0 rounded-full border border-gray-200"
                        style={{ backgroundColor: data.color }}
                    />
                    <ColorPicker value={data.color} onChange={(c) => setData('color', c)} />
                </div>
                {errors.color && (
                    <p className="mt-1 text-xs text-red-600">{errors.color}</p>
                )}
            </div>

            <div className="mb-5 flex items-center gap-2">
                <input
                    id="is_favorite_create"
                    type="checkbox"
                    checked={data.is_favorite}
                    onChange={(e) => setData('is_favorite', e.target.checked)}
                    className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <label htmlFor="is_favorite_create" className="text-sm text-gray-700">
                    お気に入りに追加
                </label>
            </div>

            <button
                type="submit"
                disabled={processing}
                className="rounded-xl bg-blue-500 px-6 py-3 text-sm font-medium text-white hover:bg-blue-600 disabled:opacity-50"
            >
                追加する
            </button>
        </form>
    );
}

// ---- 編集モーダル ----

function EditModal({
    category,
    onClose,
}: {
    category: Category;
    onClose: () => void;
}) {
    const { data, setData, patch, processing, errors } = useForm({
        name: category.name,
        color: category.color,
        is_favorite: category.is_favorite,
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        patch(route('categories.update', category.id), { onSuccess: onClose });
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
            <div className="w-full max-w-md rounded-3xl bg-white p-6 shadow-xl">
                <div className="mb-4 flex items-center justify-between">
                    <h2 className="text-base font-semibold text-gray-900">カテゴリを編集</h2>
                    <button
                        type="button"
                        onClick={onClose}
                        className="rounded-full p-2 text-gray-500 hover:bg-gray-100"
                    >
                        <X className="h-5 w-5" />
                    </button>
                </div>

                <form onSubmit={handleSubmit}>
                    <div className="mb-4">
                        <label className="mb-1 block text-sm font-medium text-gray-700">
                            カテゴリ名 <span className="text-red-600">*</span>
                        </label>
                        <input
                            type="text"
                            value={data.name}
                            onChange={(e) => setData('name', e.target.value)}
                            maxLength={50}
                            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                        />
                        {errors.name && (
                            <p className="mt-1 text-xs text-red-600">{errors.name}</p>
                        )}
                    </div>

                    <div className="mb-4">
                        <label className="mb-2 block text-sm font-medium text-gray-700">カラー</label>
                        <div className="flex items-center gap-3">
                            <div
                                className="h-8 w-8 flex-shrink-0 rounded-full border border-gray-200"
                                style={{ backgroundColor: data.color }}
                            />
                            <ColorPicker value={data.color} onChange={(c) => setData('color', c)} />
                        </div>
                        {errors.color && (
                            <p className="mt-1 text-xs text-red-600">{errors.color}</p>
                        )}
                    </div>

                    <div className="mb-5 flex items-center gap-2">
                        <input
                            id="is_favorite_edit"
                            type="checkbox"
                            checked={data.is_favorite}
                            onChange={(e) => setData('is_favorite', e.target.checked)}
                            className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        />
                        <label htmlFor="is_favorite_edit" className="text-sm text-gray-700">
                            お気に入り
                        </label>
                    </div>

                    <div className="flex justify-end gap-3">
                        <button
                            type="button"
                            onClick={onClose}
                            className="rounded-xl border border-gray-300 px-5 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50"
                        >
                            キャンセル
                        </button>
                        <button
                            type="submit"
                            disabled={processing}
                            className="rounded-xl bg-blue-500 px-5 py-2.5 text-sm font-medium text-white hover:bg-blue-600 disabled:opacity-50"
                        >
                            保存する
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

// ---- 削除確認ダイアログ ----

function DeleteDialog({
    category,
    onClose,
}: {
    category: Category;
    onClose: () => void;
}) {
    const [processing, setProcessing] = useState(false);

    const handleDelete = () => {
        setProcessing(true);
        router.delete(route('categories.destroy', category.id), {
            onFinish: () => setProcessing(false),
            onSuccess: onClose,
        });
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
            <div className="w-full max-w-sm rounded-3xl bg-white p-6 shadow-xl">
                <h2 className="mb-2 text-base font-semibold text-gray-900">カテゴリを削除</h2>
                <p className="mb-6 text-sm text-gray-600">
                    「<span className="font-medium text-gray-900">{category.name}</span>」を削除しますか？
                    <br />
                    関連する作業記録のカテゴリ情報も失われます。
                </p>
                <div className="flex justify-end gap-3">
                    <button
                        type="button"
                        onClick={onClose}
                        className="rounded-xl border border-gray-300 px-5 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50"
                    >
                        キャンセル
                    </button>
                    <button
                        type="button"
                        onClick={handleDelete}
                        disabled={processing}
                        className="rounded-xl bg-red-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-red-700 disabled:opacity-50"
                    >
                        削除する
                    </button>
                </div>
            </div>
        </div>
    );
}

// ---- カテゴリ行 ----

function CategoryRow({
    category,
    onEdit,
    onDelete,
}: {
    category: Category;
    onEdit: (c: Category) => void;
    onDelete: (c: Category) => void;
}) {
    return (
        <div className="flex items-center gap-4 rounded-xl border border-gray-200 bg-white px-4 py-3 shadow-sm">
            <div
                className="h-4 w-4 flex-shrink-0 rounded-full"
                style={{ backgroundColor: category.color }}
            />
            <span className="flex-1 text-sm font-medium text-gray-900">{category.name}</span>
            {category.is_favorite && (
                <Star className="h-4 w-4 flex-shrink-0 fill-amber-400 text-amber-400" />
            )}
            <div className="flex gap-1">
                <button
                    type="button"
                    onClick={() => onEdit(category)}
                    className="rounded-full p-2 text-gray-500 hover:bg-gray-100 hover:text-gray-700"
                    aria-label="編集"
                >
                    <Pencil className="h-4 w-4" />
                </button>
                <button
                    type="button"
                    onClick={() => onDelete(category)}
                    className="rounded-full p-2 text-gray-500 hover:bg-red-50 hover:text-red-600"
                    aria-label="削除"
                >
                    <Trash2 className="h-4 w-4" />
                </button>
            </div>
        </div>
    );
}

// ---- メインページ ----

interface Props extends PageProps {
    categories: Category[];
}

export default function Index({ categories }: Props) {
    const [editTarget, setEditTarget] = useState<Category | null>(null);
    const [deleteTarget, setDeleteTarget] = useState<Category | null>(null);

    return (
        <AuthenticatedLayout>
            <Head title="カテゴリ管理" />

            <div className="mx-auto max-w-2xl px-4 py-8 sm:px-6 lg:px-8">
                <h1 className="mb-6 text-xl font-bold text-gray-900">カテゴリ管理</h1>

                {/* 作成フォーム */}
                <div className="mb-8">
                    <CreateCategoryForm />
                </div>

                {/* カテゴリ一覧 */}
                <section>
                    <h2 className="mb-3 text-base font-semibold text-gray-900">
                        カテゴリ一覧
                        <span className="ml-2 text-sm font-normal text-gray-500">
                            ({categories.length}件)
                        </span>
                    </h2>

                    {categories.length === 0 ? (
                        <div className="flex flex-col items-center justify-center rounded-2xl border border-gray-200 bg-white py-12 text-center">
                            <p className="text-sm text-gray-500">
                                カテゴリがまだありません。上のフォームから追加しましょう。
                            </p>
                        </div>
                    ) : (
                        <div className="space-y-2">
                            {categories.map((cat) => (
                                <CategoryRow
                                    key={cat.id}
                                    category={cat}
                                    onEdit={setEditTarget}
                                    onDelete={setDeleteTarget}
                                />
                            ))}
                        </div>
                    )}
                </section>
            </div>

            {editTarget && (
                <EditModal
                    category={editTarget}
                    onClose={() => setEditTarget(null)}
                />
            )}

            {deleteTarget && (
                <DeleteDialog
                    category={deleteTarget}
                    onClose={() => setDeleteTarget(null)}
                />
            )}
        </AuthenticatedLayout>
    );
}
