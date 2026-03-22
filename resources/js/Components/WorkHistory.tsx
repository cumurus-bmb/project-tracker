import { type Category } from '@/types';
import { router } from '@inertiajs/react';
import { Pencil, Trash2, X } from 'lucide-react';
import { useState } from 'react';

// ---- 型定義 ----

export interface WorkLogItem {
    id:               number;
    category_id:      number;
    category:         { id: number; name: string; color: string } | null;
    started_at:       string;  // ISO8601 with timezone offset from server
    ended_at:         string;
    duration_seconds: number;
    memo:             string | null;
}

export interface GroupedLog {
    date:          string;
    total_seconds: number;
    logs:          WorkLogItem[];
}

// ---- ユーティリティ ----

export function formatDuration(seconds: number): string {
    if (seconds === 0) return '0分';
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    if (h === 0) return `${m}分`;
    if (m === 0) return `${h}時間`;
    return `${h}時間${m}分`;
}

export function formatDateLabel(dateStr: string): string {
    const d = new Date(`${dateStr}T00:00:00`);
    const weekdays = ['日', '月', '火', '水', '木', '金', '土'];
    return `${d.getMonth() + 1}月${d.getDate()}日（${weekdays[d.getDay()]}）`;
}

/** ISO8601文字列から "HH:MM" を取得（オフセット付き文字列から直接抽出） */
export function toHHMM(iso: string): string {
    const match = iso.match(/T(\d{2}:\d{2})/);
    return match ? match[1] : '';
}

/** ISO8601文字列から日付部分 "YYYY-MM-DD" を取得 */
export function toDatePart(iso: string): string {
    return iso.slice(0, 10);
}

/** 日付・時刻文字列（JST入力）を Date に変換 */
function jstToDate(date: string, time: string): Date {
    return new Date(`${date}T${time}:00+09:00`);
}

// ---- 編集モーダル ----

export function EditModal({
    log,
    categories,
    onClose,
}: {
    log:        WorkLogItem;
    categories: Category[];
    onClose:    () => void;
}) {
    const [categoryId, setCategoryId] = useState<number | ''>(log.category_id);
    const [startDate, setStartDate]   = useState(toDatePart(log.started_at));
    const [startTime, setStartTime]   = useState(toHHMM(log.started_at));
    const [endDate, setEndDate]       = useState(toDatePart(log.ended_at));
    const [endTime, setEndTime]       = useState(toHHMM(log.ended_at));
    const [memo, setMemo]             = useState(log.memo ?? '');
    const [submitting, setSubmitting] = useState(false);
    const [errors, setErrors]         = useState<Record<string, string>>({});

    const startedAt       = jstToDate(startDate, startTime);
    const endedAt         = jstToDate(endDate, endTime);
    const durationSeconds = Math.floor((endedAt.getTime() - startedAt.getTime()) / 1000);
    const durationInvalid = durationSeconds <= 0;

    const durationLabel = (() => {
        if (durationSeconds <= 0) return null;
        const h = Math.floor(durationSeconds / 3600);
        const m = Math.floor((durationSeconds % 3600) / 60);
        return [h > 0 ? `${h}時間` : '', m > 0 ? `${m}分` : ''].join('') || null;
    })();

    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (durationInvalid || !categoryId) return;

        setSubmitting(true);
        router.patch(route('work-logs.update', log.id), {
            category_id:      categoryId,
            started_at:       startedAt.toISOString(),
            ended_at:         endedAt.toISOString(),
            duration_seconds: durationSeconds,
            memo,
        }, {
            onSuccess: () => {
                setSubmitting(false);
                onClose();
                router.reload();
            },
            onError: (e) => { setErrors(e); setSubmitting(false); },
        });
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
            <div className="w-full max-w-md rounded-3xl bg-white p-6 shadow-xl">
                <div className="mb-4 flex items-center justify-between">
                    <h2 className="text-base font-semibold text-gray-900">作業記録を編集</h2>
                    <button type="button" onClick={onClose} className="rounded-full p-2 text-gray-500 hover:bg-gray-100">
                        <X className="h-5 w-5" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    {/* カテゴリ */}
                    <div>
                        <label className="mb-1 block text-sm font-medium text-gray-700">
                            カテゴリ <span className="text-red-600">*</span>
                        </label>
                        <select
                            value={categoryId}
                            onChange={(e) => setCategoryId(e.target.value ? Number(e.target.value) : '')}
                            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                        >
                            <option value="">カテゴリを選択...</option>
                            {categories.map((cat) => (
                                <option key={cat.id} value={cat.id}>{cat.name}</option>
                            ))}
                        </select>
                        {errors.category_id && <p className="mt-1 text-xs text-red-600">{errors.category_id}</p>}
                    </div>

                    {/* 開始 */}
                    <div>
                        <label className="mb-1 block text-sm font-medium text-gray-700">開始</label>
                        <div className="grid grid-cols-2 gap-3">
                            <input type="date" value={startDate}
                                onChange={(e) => setStartDate(e.target.value)}
                                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                            />
                            <input type="time" value={startTime}
                                onChange={(e) => setStartTime(e.target.value)}
                                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                            />
                        </div>
                    </div>

                    {/* 終了 */}
                    <div>
                        <label className="mb-1 block text-sm font-medium text-gray-700">終了</label>
                        <div className="grid grid-cols-2 gap-3">
                            <input type="date" value={endDate}
                                onChange={(e) => setEndDate(e.target.value)}
                                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                            />
                            <input type="time" value={endTime}
                                onChange={(e) => setEndTime(e.target.value)}
                                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                            />
                        </div>
                        {durationInvalid ? (
                            <p className="mt-1 text-xs text-red-600">終了は開始より後の時刻を指定してください</p>
                        ) : durationLabel ? (
                            <p className="mt-1 text-xs text-gray-500">作業時間: {durationLabel}</p>
                        ) : null}
                    </div>

                    {/* メモ */}
                    <div>
                        <label className="mb-1 block text-sm font-medium text-gray-700">
                            メモ <span className="ml-1 text-xs font-normal text-gray-400">（任意）</span>
                        </label>
                        <textarea
                            value={memo}
                            onChange={(e) => setMemo(e.target.value)}
                            rows={2}
                            maxLength={500}
                            className="w-full resize-none rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                        />
                        {errors.memo && <p className="mt-1 text-xs text-red-600">{errors.memo}</p>}
                    </div>

                    <div className="flex justify-end gap-3 pt-1">
                        <button type="button" onClick={onClose}
                            className="rounded-xl border border-gray-300 px-5 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50"
                        >
                            キャンセル
                        </button>
                        <button type="submit"
                            disabled={submitting || !categoryId || durationInvalid}
                            className="rounded-xl bg-blue-500 px-5 py-2.5 text-sm font-medium text-white hover:bg-blue-600 disabled:opacity-50"
                        >
                            {submitting ? '保存中...' : '保存する'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

// ---- 削除確認ダイアログ ----

export function DeleteDialog({
    log,
    onClose,
}: {
    log:     WorkLogItem;
    onClose: () => void;
}) {
    const [processing, setProcessing] = useState(false);

    const handleDelete = () => {
        setProcessing(true);
        router.delete(route('work-logs.destroy', log.id), {
            onFinish:  () => setProcessing(false),
            onSuccess: () => {
                onClose();
                router.reload();
            },
        });
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
            <div className="w-full max-w-sm rounded-3xl bg-white p-6 shadow-xl">
                <h2 className="mb-2 text-base font-semibold text-gray-900">作業記録を削除</h2>
                <p className="mb-6 text-sm text-gray-600">
                    {toDatePart(log.started_at)} {toHHMM(log.started_at)} の
                    <span className="font-medium text-gray-900">「{log.category?.name ?? '未分類'}」</span>
                    （{formatDuration(log.duration_seconds)}）を削除しますか？
                </p>
                <div className="flex justify-end gap-3">
                    <button type="button" onClick={onClose}
                        className="rounded-xl border border-gray-300 px-5 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50"
                    >
                        キャンセル
                    </button>
                    <button type="button" onClick={handleDelete} disabled={processing}
                        className="rounded-xl bg-red-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-red-700 disabled:opacity-50"
                    >
                        削除する
                    </button>
                </div>
            </div>
        </div>
    );
}

// ---- 作業ログ行 ----

function WorkLogRow({
    log,
    onEdit,
    onDelete,
}: {
    log:      WorkLogItem;
    onEdit:   (l: WorkLogItem) => void;
    onDelete: (l: WorkLogItem) => void;
}) {
    return (
        <div className="flex items-center gap-3 rounded-xl border border-gray-200 bg-white px-4 py-3 shadow-sm">
            <div
                className="h-3 w-3 flex-shrink-0 rounded-full"
                style={{ backgroundColor: log.category?.color ?? '#9CA3AF' }}
            />
            <span className="w-20 flex-shrink-0 truncate text-sm font-medium text-gray-700">
                {log.category?.name ?? '未分類'}
            </span>
            <span className="text-sm text-gray-500">
                {toHHMM(log.started_at)} 〜 {toHHMM(log.ended_at)}
            </span>
            <span className="flex-1 text-sm font-semibold text-gray-900">
                {formatDuration(log.duration_seconds)}
            </span>
            {log.memo && (
                <span className="hidden max-w-[140px] truncate text-xs text-gray-400 sm:inline">
                    {log.memo}
                </span>
            )}
            <div className="ml-auto flex gap-1">
                <button type="button" onClick={() => onEdit(log)}
                    className="rounded-full p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-700"
                    aria-label="編集"
                >
                    <Pencil className="h-4 w-4" />
                </button>
                <button type="button" onClick={() => onDelete(log)}
                    className="rounded-full p-2 text-gray-400 hover:bg-red-50 hover:text-red-600"
                    aria-label="削除"
                >
                    <Trash2 className="h-4 w-4" />
                </button>
            </div>
        </div>
    );
}

// ---- WorkHistory メインコンポーネント ----

interface WorkHistoryProps {
    grouped:    GroupedLog[];
    categories: Category[];
    /** 空状態のメッセージ（省略時はデフォルト文言） */
    emptyMessage?: string;
}

export default function WorkHistory({ grouped, categories, emptyMessage }: WorkHistoryProps) {
    const [editTarget, setEditTarget]     = useState<WorkLogItem | null>(null);
    const [deleteTarget, setDeleteTarget] = useState<WorkLogItem | null>(null);

    if (grouped.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center rounded-2xl border border-gray-200 bg-white py-16 text-center">
                <p className="text-sm text-gray-500">
                    {emptyMessage ?? '作業記録がまだありません'}
                </p>
            </div>
        );
    }

    return (
        <>
            <div className="space-y-6">
                {grouped.map((group) => (
                    <div key={group.date}>
                        <div className="mb-2 flex items-center justify-between">
                            <h2 className="text-sm font-semibold text-gray-700">
                                {formatDateLabel(group.date)}
                            </h2>
                            <span className="text-sm text-gray-500">
                                合計 {formatDuration(group.total_seconds)}
                            </span>
                        </div>
                        <div className="space-y-2">
                            {group.logs.map((log) => (
                                <WorkLogRow
                                    key={log.id}
                                    log={log}
                                    onEdit={setEditTarget}
                                    onDelete={setDeleteTarget}
                                />
                            ))}
                        </div>
                    </div>
                ))}
            </div>

            {editTarget && (
                <EditModal
                    log={editTarget}
                    categories={categories}
                    onClose={() => setEditTarget(null)}
                />
            )}
            {deleteTarget && (
                <DeleteDialog
                    log={deleteTarget}
                    onClose={() => setDeleteTarget(null)}
                />
            )}
        </>
    );
}
