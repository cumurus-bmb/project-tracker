import { formatDuration } from '@/Components/WorkHistory';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { type PageProps } from '@/types';
import { Head, router } from '@inertiajs/react';
import { Minus, TrendingDown, TrendingUp } from 'lucide-react';

// ──────────────────────────────────────────────────────────
// 型定義
// ──────────────────────────────────────────────────────────

type Tab = 'daily' | 'weekly' | 'monthly' | 'yearly';

interface CategoryStat {
    name: string;
    color: string;
    seconds: number;
    percentage: number;
}

interface Stats {
    currentSeconds: number;
    previousSeconds: number;
    diffSeconds: number;
    diffPercentage: number | null;
    dailyAverage: number | null;
    days: number;
}

interface Props extends PageProps {
    tab: Tab;
    period: string;
    customFrom: string | null;
    periodLabel: string;
    stats: Stats;
    categoryStats: CategoryStat[];
}

// ──────────────────────────────────────────────────────────
// 定数
// ──────────────────────────────────────────────────────────

const TABS: { key: Tab; label: string }[] = [
    { key: 'daily',   label: '日次' },
    { key: 'weekly',  label: '週次' },
    { key: 'monthly', label: '月次' },
    { key: 'yearly',  label: '年次' },
];

const DEFAULT_PERIODS: Record<Tab, string> = {
    daily:   'today',
    weekly:  'this_week',
    monthly: 'this_month',
    yearly:  'this_year',
};

const PERIOD_OPTIONS: Record<Tab, { key: string; label: string }[]> = {
    daily:   [{ key: 'today', label: '今日' }, { key: 'yesterday', label: '昨日' }, { key: 'custom', label: 'カスタム' }],
    weekly:  [{ key: 'this_week', label: '今週' }, { key: 'last_week', label: '先週' }, { key: 'custom', label: 'カスタム' }],
    monthly: [{ key: 'this_month', label: '今月' }, { key: 'last_month', label: '先月' }, { key: 'custom', label: 'カスタム' }],
    yearly:  [{ key: 'this_year', label: '今年' }, { key: 'last_year', label: '去年' }],
};

const COMPARISON_LABELS: Record<Tab, string> = {
    daily:   '前日比',
    weekly:  '前週比',
    monthly: '前月比',
    yearly:  '前年比',
};

// ──────────────────────────────────────────────────────────
// ナビゲーションヘルパー
// ──────────────────────────────────────────────────────────

function navigate(tab: Tab, period: string, from?: string) {
    const params: Record<string, string> = { tab, period };
    if (from) params.from = from;
    router.get(route('reports.index'), params, { preserveState: false });
}

// ──────────────────────────────────────────────────────────
// コンポーネント
// ──────────────────────────────────────────────────────────

export default function Index({ tab, period, customFrom, periodLabel, stats, categoryStats }: Props) {
    const handleTabChange = (newTab: Tab) => {
        navigate(newTab, DEFAULT_PERIODS[newTab]);
    };

    const handlePeriodChange = (newPeriod: string) => {
        if (newPeriod !== 'custom') {
            navigate(tab, newPeriod);
        } else {
            navigate(tab, 'custom');
        }
    };

    const handleCustomFrom = (value: string) => {
        if (value) navigate(tab, 'custom', value);
    };

    const isUp   = stats.diffSeconds > 0;
    const isDown = stats.diffSeconds < 0;
    const isFlat = stats.diffSeconds === 0;

    const diffColor  = isUp ? 'text-green-600' : isDown ? 'text-red-600' : 'text-gray-400';
    const hasPrevData = stats.previousSeconds > 0 || stats.currentSeconds > 0;

    return (
        <AuthenticatedLayout>
            <Head title="詳細統計" />

            <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
                <h1 className="mb-6 text-xl font-bold text-gray-900">詳細統計</h1>

                {/* タブ */}
                <div className="mb-4 flex rounded-xl border border-gray-200 bg-gray-100 p-1">
                    {TABS.map(({ key, label }) => (
                        <button
                            key={key}
                            type="button"
                            onClick={() => handleTabChange(key)}
                            className={`flex-1 rounded-lg py-2 text-sm font-medium transition-colors ${
                                tab === key
                                    ? 'bg-white text-gray-900 shadow-sm'
                                    : 'text-gray-500 hover:text-gray-700'
                            }`}
                        >
                            {label}
                        </button>
                    ))}
                </div>

                {/* 期間セレクター */}
                <div className="mb-6 flex flex-wrap items-center gap-2">
                    {PERIOD_OPTIONS[tab].map(({ key, label }) => (
                        <button
                            key={key}
                            type="button"
                            onClick={() => handlePeriodChange(key)}
                            className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
                                period === key
                                    ? 'bg-blue-500 text-white shadow-sm'
                                    : 'border border-gray-300 bg-white text-gray-700 hover:border-gray-400'
                            }`}
                        >
                            {label}
                        </button>
                    ))}

                    {/* カスタム日付入力 */}
                    {period === 'custom' && (
                        <input
                            type={tab === 'monthly' ? 'month' : 'date'}
                            defaultValue={customFrom ?? ''}
                            onChange={(e) => handleCustomFrom(e.target.value)}
                            className="rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-20"
                        />
                    )}
                </div>

                {/* 期間ラベル */}
                <p className="mb-6 text-base font-semibold text-gray-700">{periodLabel}</p>

                {/* サマリーカード */}
                <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">

                    {/* 合計時間 */}
                    <div className="rounded-2xl border border-gray-300 bg-white p-5 shadow-md">
                        <p className="mb-1 text-sm text-gray-500">合計時間</p>
                        <p className="text-2xl font-bold text-gray-900">
                            {formatDuration(stats.currentSeconds)}
                        </p>
                        {stats.days > 1 && (
                            <p className="mt-1 text-xs text-gray-400">{stats.days}日間</p>
                        )}
                    </div>

                    {/* 前期間比 */}
                    <div className="rounded-2xl border border-gray-300 bg-white p-5 shadow-md">
                        <p className="mb-1 text-sm text-gray-500">{COMPARISON_LABELS[tab]}</p>
                        {!hasPrevData ? (
                            <p className="text-2xl font-bold text-gray-400">データなし</p>
                        ) : (
                            <>
                                <div className="flex items-center gap-2">
                                    {isUp   && <TrendingUp   className="h-5 w-5 text-green-600" />}
                                    {isDown && <TrendingDown className="h-5 w-5 text-red-600" />}
                                    {isFlat && <Minus        className="h-5 w-5 text-gray-400" />}
                                    <p className={`text-2xl font-bold ${diffColor}`}>
                                        {isUp ? '+' : isDown ? '-' : ''}
                                        {formatDuration(Math.abs(stats.diffSeconds))}
                                    </p>
                                </div>
                                {stats.diffPercentage !== null && (
                                    <p className={`mt-1 text-xs ${diffColor}`}>
                                        {isUp ? '+' : isDown ? '' : ''}{stats.diffPercentage}%
                                    </p>
                                )}
                                {stats.diffPercentage === null && stats.previousSeconds === 0 && (
                                    <p className="mt-1 text-xs text-gray-400">前期間の記録なし</p>
                                )}
                            </>
                        )}
                    </div>

                    {/* 1日平均（日次以外） */}
                    {stats.dailyAverage !== null && (
                        <div className="rounded-2xl border border-gray-300 bg-white p-5 shadow-md">
                            <p className="mb-1 text-sm text-gray-500">1日平均</p>
                            <p className="text-2xl font-bold text-gray-900">
                                {formatDuration(stats.dailyAverage)}
                            </p>
                            <p className="mt-1 text-xs text-gray-400">{stats.days}日間の平均</p>
                        </div>
                    )}
                </div>

                {/* カテゴリ別内訳 */}
                <section>
                    <h2 className="mb-4 text-lg font-semibold text-gray-900">カテゴリ別内訳</h2>

                    {categoryStats.length === 0 ? (
                        <div className="flex flex-col items-center justify-center rounded-2xl border border-gray-200 bg-white py-12 text-center shadow-sm">
                            <p className="text-sm text-gray-500">この期間の作業記録はありません</p>
                        </div>
                    ) : (
                        <div className="rounded-2xl border border-gray-300 bg-white p-5 shadow-md">
                            <div className="space-y-4">
                                {categoryStats.map((stat) => (
                                    <div key={stat.name}>
                                        <div className="mb-1.5 flex items-center justify-between">
                                            <div className="flex items-center gap-2">
                                                <div
                                                    className="h-3 w-3 flex-shrink-0 rounded-full"
                                                    style={{ backgroundColor: stat.color }}
                                                />
                                                <span className="text-sm font-medium text-gray-700">
                                                    {stat.name}
                                                </span>
                                            </div>
                                            <div className="flex items-center gap-3">
                                                <span className="text-sm font-semibold text-gray-900">
                                                    {formatDuration(stat.seconds)}
                                                </span>
                                                <span className="w-9 text-right text-xs text-gray-500">
                                                    {stat.percentage}%
                                                </span>
                                            </div>
                                        </div>
                                        <div className="h-2 w-full overflow-hidden rounded-full bg-gray-100">
                                            <div
                                                className="h-full rounded-full transition-all duration-300"
                                                style={{
                                                    width: `${stat.percentage}%`,
                                                    backgroundColor: stat.color,
                                                }}
                                            />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </section>
            </div>
        </AuthenticatedLayout>
    );
}
