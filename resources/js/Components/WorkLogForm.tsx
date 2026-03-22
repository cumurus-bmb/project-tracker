import { type Category } from '@/types';
import { router } from '@inertiajs/react';
import { useState } from 'react';

interface Props {
    categories: Category[];
}

/** JST で今日の日付を YYYY-MM-DD で返す */
function todayJST(): string {
    const jst = new Date(Date.now() + 9 * 60 * 60 * 1000);
    return jst.toISOString().slice(0, 10);
}

/** JST で現在時刻を HH:MM で返す */
function nowTimeJST(): string {
    const jst = new Date(Date.now() + 9 * 60 * 60 * 1000);
    return jst.toISOString().slice(11, 16);
}

/** 日付・時刻文字列（JST入力）を Date に変換 */
function jstToDate(date: string, time: string): Date {
    return new Date(`${date}T${time}:00+09:00`);
}

export default function WorkLogForm({ categories }: Props) {
    const [categoryId, setCategoryId] = useState<number | ''>('');
    const [startDate, setStartDate]   = useState(todayJST());
    const [startTime, setStartTime]   = useState(nowTimeJST());
    const [endDate, setEndDate]       = useState(todayJST());
    const [endTime, setEndTime]       = useState(nowTimeJST());
    const [memo, setMemo]             = useState('');
    const [submitting, setSubmitting] = useState(false);
    const [errors, setErrors]         = useState<Record<string, string>>({});

    const startedAt       = jstToDate(startDate, startTime);
    const endedAt         = jstToDate(endDate, endTime);
    const durationSeconds = Math.floor((endedAt.getTime() - startedAt.getTime()) / 1000);
    const durationInvalid = durationSeconds <= 0;
    const durationNegative = durationSeconds < 0;

    const durationLabel = (() => {
        if (durationSeconds <= 0) return null;
        const h = Math.floor(durationSeconds / 3600);
        const m = Math.floor((durationSeconds % 3600) / 60);
        return [h > 0 ? `${h}時間` : '', m > 0 ? `${m}分` : ''].join('') || null;
    })();

    const reset = () => {
        setCategoryId('');
        const t = todayJST();
        const n = nowTimeJST();
        setStartDate(t); setStartTime(n);
        setEndDate(t);   setEndTime(n);
        setMemo('');
        setErrors({});
    };

    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (durationInvalid || !categoryId) return;

        setSubmitting(true);
        router.post(route('work-logs.store'), {
            category_id:      categoryId,
            started_at:       startedAt.toISOString(),
            ended_at:         endedAt.toISOString(),
            duration_seconds: durationSeconds,
            memo,
        }, {
            onSuccess: () => { reset(); setSubmitting(false); },
            onError:   (e) => { setErrors(e); setSubmitting(false); },
        });
    };

    return (
        <form
            onSubmit={handleSubmit}
            className="rounded-2xl border border-gray-300 bg-white p-6 shadow-md"
        >
            <h2 className="mb-5 text-base font-semibold text-gray-900">手動入力</h2>

            <div className="space-y-4">
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
                    {errors.category_id && (
                        <p className="mt-1 text-xs text-red-600">{errors.category_id}</p>
                    )}
                </div>

                {/* 開始：日付 + 時刻 */}
                <div>
                    <label className="mb-1 block text-sm font-medium text-gray-700">
                        開始 <span className="text-red-600">*</span>
                    </label>
                    <div className="grid grid-cols-2 gap-3">
                        <input
                            type="date"
                            value={startDate}
                            onChange={(e) => setStartDate(e.target.value)}
                            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                        />
                        <input
                            type="time"
                            value={startTime}
                            onChange={(e) => setStartTime(e.target.value)}
                            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                        />
                    </div>
                </div>

                {/* 終了：日付 + 時刻 */}
                <div>
                    <label className="mb-1 block text-sm font-medium text-gray-700">
                        終了 <span className="text-red-600">*</span>
                    </label>
                    <div className="grid grid-cols-2 gap-3">
                        <input
                            type="date"
                            value={endDate}
                            onChange={(e) => setEndDate(e.target.value)}
                            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                        />
                        <input
                            type="time"
                            value={endTime}
                            onChange={(e) => setEndTime(e.target.value)}
                            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                        />
                    </div>
                    {durationNegative ? (
                        <p className="mt-1 text-xs text-red-600">終了は開始より後の時刻を指定してください</p>
                    ) : durationLabel ? (
                        <p className="mt-1 text-xs text-gray-500">作業時間: {durationLabel}</p>
                    ) : null}
                </div>

                {/* メモ */}
                <div>
                    <label className="mb-1 block text-sm font-medium text-gray-700">
                        メモ
                        <span className="ml-1 text-xs font-normal text-gray-400">（任意）</span>
                    </label>
                    <textarea
                        value={memo}
                        onChange={(e) => setMemo(e.target.value)}
                        placeholder="作業内容のメモ..."
                        rows={2}
                        maxLength={500}
                        className="w-full resize-none rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 placeholder-gray-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                    />
                    {errors.memo && (
                        <p className="mt-1 text-xs text-red-600">{errors.memo}</p>
                    )}
                </div>
            </div>

            <div className="mt-5">
                <button
                    type="submit"
                    disabled={submitting || !categoryId || durationInvalid}
                    className="w-full rounded-xl bg-blue-500 py-3 text-sm font-semibold text-white shadow-md hover:bg-blue-600 disabled:cursor-not-allowed disabled:opacity-40"
                >
                    {submitting ? '保存中...' : '記録を追加'}
                </button>
                {!categoryId && (
                    <p className="mt-2 text-center text-xs text-gray-400">カテゴリを選択してください</p>
                )}
            </div>
        </form>
    );
}
