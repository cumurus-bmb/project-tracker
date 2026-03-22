import { type Category } from '@/types';
import { router } from '@inertiajs/react';
import { Pause, Play, RotateCcw, Square } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';

type Status = 'idle' | 'running' | 'paused';

/** 秒数を HH:MM:SS 形式に変換 */
function formatTime(seconds: number): string {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    return [h, m, s].map((v) => String(v).padStart(2, '0')).join(':');
}

interface Props {
    categories: Category[];
}

export default function Timer({ categories }: Props) {
    const [status, setStatus]           = useState<Status>('idle');
    const [categoryId, setCategoryId]   = useState<number | ''>('');
    const [displaySeconds, setDisplaySeconds] = useState(0);
    const [submitting, setSubmitting]   = useState(false);

    // タイマー計測用 ref（React state に依存しない正確な計測）
    const startedAtRef      = useRef<string | null>(null);   // 作業開始時刻（ISO）
    const runStartedAtRef   = useRef<number | null>(null);   // 現在の連続計測開始時刻（ms）
    const accumulatedRef    = useRef(0);                     // 一時停止前までの累積秒数

    /** 現在の合計経過秒数を計算 */
    const getTotalSeconds = (): number => {
        const running = runStartedAtRef.current
            ? Math.floor((Date.now() - runStartedAtRef.current) / 1000)
            : 0;
        return accumulatedRef.current + running;
    };

    // 200ms ごとに表示を更新（running 時のみ）
    useEffect(() => {
        if (status !== 'running') return;
        const id = setInterval(() => {
            setDisplaySeconds(getTotalSeconds());
        }, 200);
        return () => clearInterval(id);
    }, [status]);

    /** スタート */
    const handleStart = () => {
        if (!categoryId) return;
        startedAtRef.current    = new Date().toISOString();
        runStartedAtRef.current = Date.now();
        accumulatedRef.current  = 0;
        setDisplaySeconds(0);
        setStatus('running');
    };

    /** 一時停止 */
    const handlePause = () => {
        accumulatedRef.current = getTotalSeconds();
        runStartedAtRef.current = null;
        setDisplaySeconds(accumulatedRef.current);
        setStatus('paused');
    };

    /** 再開 */
    const handleResume = () => {
        runStartedAtRef.current = Date.now();
        setStatus('running');
    };

    /** ストップ（作業ログ保存） */
    const handleStop = () => {
        const totalSeconds = getTotalSeconds();
        if (totalSeconds === 0 || !startedAtRef.current) return;

        // インターバル停止のため一時的に paused 状態にする
        runStartedAtRef.current = null;
        setDisplaySeconds(totalSeconds);
        setStatus('paused');
        setSubmitting(true);

        router.post(
            route('work-logs.store'),
            {
                category_id:      categoryId,
                started_at:       startedAtRef.current,
                ended_at:         new Date().toISOString(),
                duration_seconds: totalSeconds,
            },
            {
                onSuccess: () => reset(),
                onError:   () => setSubmitting(false),
            },
        );
    };

    /** リセット（計測を破棄） */
    const reset = () => {
        startedAtRef.current    = null;
        runStartedAtRef.current = null;
        accumulatedRef.current  = 0;
        setDisplaySeconds(0);
        setCategoryId('');
        setSubmitting(false);
        setStatus('idle');
    };

    return (
        <div className="rounded-2xl border border-gray-300 bg-white p-6 shadow-md">
            <h2 className="mb-5 text-base font-semibold text-gray-900">タイマー</h2>

            {/* 経過時間表示 */}
            <div className="mb-6 text-center">
                <span
                    className={`font-mono text-5xl font-bold tabular-nums tracking-tight ${
                        status === 'running' ? 'text-blue-600' : 'text-gray-900'
                    }`}
                >
                    {formatTime(displaySeconds)}
                </span>
                {status === 'paused' && displaySeconds > 0 && (
                    <p className="mt-2 text-sm font-medium text-amber-600">一時停止中</p>
                )}
            </div>

            {/* カテゴリ選択 */}
            <div className="mb-5">
                <label className="mb-1 block text-sm font-medium text-gray-700">
                    カテゴリ <span className="text-red-600">*</span>
                </label>
                <select
                    value={categoryId}
                    onChange={(e) =>
                        setCategoryId(e.target.value ? Number(e.target.value) : '')
                    }
                    disabled={status !== 'idle'}
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 disabled:bg-gray-50 disabled:text-gray-500"
                >
                    <option value="">カテゴリを選択...</option>
                    {categories.map((cat) => (
                        <option key={cat.id} value={cat.id}>
                            {cat.name}
                        </option>
                    ))}
                </select>
                {status === 'idle' && !categoryId && (
                    <p className="mt-1 text-xs text-gray-400">
                        カテゴリを選択するとスタートできます
                    </p>
                )}
            </div>

            {/* コントロールボタン */}
            <div className="flex items-center justify-center gap-3">

                {/* idle: スタートのみ */}
                {status === 'idle' && (
                    <button
                        type="button"
                        onClick={handleStart}
                        disabled={!categoryId}
                        className="flex items-center gap-2 rounded-xl bg-blue-500 px-8 py-3 text-sm font-semibold text-white shadow-md hover:bg-blue-600 disabled:cursor-not-allowed disabled:opacity-40"
                    >
                        <Play className="h-4 w-4" />
                        スタート
                    </button>
                )}

                {/* running: 一時停止 + ストップ */}
                {status === 'running' && (
                    <>
                        <button
                            type="button"
                            onClick={handlePause}
                            className="flex items-center gap-2 rounded-xl border border-gray-300 px-6 py-3 text-sm font-semibold text-gray-700 shadow-sm hover:bg-gray-50"
                        >
                            <Pause className="h-4 w-4" />
                            一時停止
                        </button>
                        <button
                            type="button"
                            onClick={handleStop}
                            disabled={submitting}
                            className="flex items-center gap-2 rounded-xl bg-red-600 px-6 py-3 text-sm font-semibold text-white shadow-md hover:bg-red-700 disabled:opacity-50"
                        >
                            <Square className="h-4 w-4 fill-white" />
                            ストップ
                        </button>
                    </>
                )}

                {/* paused: 再開 + ストップ + リセット */}
                {status === 'paused' && (
                    <>
                        <button
                            type="button"
                            onClick={handleResume}
                            disabled={submitting}
                            className="flex items-center gap-2 rounded-xl bg-blue-500 px-6 py-3 text-sm font-semibold text-white shadow-md hover:bg-blue-600 disabled:opacity-50"
                        >
                            <Play className="h-4 w-4" />
                            再開
                        </button>
                        <button
                            type="button"
                            onClick={handleStop}
                            disabled={submitting}
                            className="flex items-center gap-2 rounded-xl bg-red-600 px-6 py-3 text-sm font-semibold text-white shadow-md hover:bg-red-700 disabled:opacity-50"
                        >
                            <Square className="h-4 w-4 fill-white" />
                            {submitting ? '保存中...' : 'ストップ'}
                        </button>
                        <button
                            type="button"
                            onClick={reset}
                            disabled={submitting}
                            className="rounded-full p-3 text-gray-400 hover:bg-gray-100 hover:text-gray-600 disabled:opacity-50"
                            aria-label="リセット"
                        >
                            <RotateCcw className="h-4 w-4" />
                        </button>
                    </>
                )}
            </div>
        </div>
    );
}
