import { formatDuration } from '@/Components/WorkHistory';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { type PageProps } from '@/types';
import { Head, router } from '@inertiajs/react';
import { Minus, TrendingDown, TrendingUp } from 'lucide-react';
import {
    Bar,
    BarChart,
    CartesianGrid,
    Cell,
    Pie,
    PieChart,
    ResponsiveContainer,
    Tooltip,
    XAxis,
    YAxis,
} from 'recharts';

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

interface BarChartItem {
    label: string;
    seconds: number;
}

interface HeatmapDay {
    date: string;
    seconds: number;
}

interface ProductivityStats {
    sessionCount: number;
    avgSessionSeconds: number;
    peakHours: number[];
}

interface CategoryTrend {
    categories: { name: string; color: string }[];
    data: Array<Record<string, string | number>>;
}

interface Props extends PageProps {
    tab: Tab;
    period: string;
    customFrom: string | null;
    periodLabel: string;
    stats: Stats;
    categoryStats: CategoryStat[];
    barChartData: BarChartItem[];
    heatmapData: HeatmapDay[];
    productivityStats: ProductivityStats;
    categoryTrend: CategoryTrend;
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

const HEATMAP_COLORS = [
    'bg-gray-100',
    'bg-blue-100',
    'bg-blue-300',
    'bg-blue-500',
    'bg-blue-700',
] as const;

// ──────────────────────────────────────────────────────────
// ナビゲーション
// ──────────────────────────────────────────────────────────

function navigate(tab: Tab, period: string, from?: string) {
    const params: Record<string, string> = { tab, period };
    if (from) params.from = from;
    router.get(route('reports.index'), params, { preserveState: false });
}

// ──────────────────────────────────────────────────────────
// グラフ用ヘルパー
// ──────────────────────────────────────────────────────────

function heatmapLevel(seconds: number, maxSeconds: number): number {
    if (seconds === 0 || maxSeconds === 0) return 0;
    const r = seconds / maxSeconds;
    if (r <= 0.25) return 1;
    if (r <= 0.5)  return 2;
    if (r <= 0.75) return 3;
    return 4;
}

function formatYTick(value: number): string {
    if (value === 0) return '0';
    if (value < 3600) return `${Math.round(value / 60)}m`;
    return `${(value / 3600).toFixed(1)}h`;
}

// ──────────────────────────────────────────────────────────
// Tooltip コンポーネント
// ──────────────────────────────────────────────────────────

function BarTooltip({ active, payload, label }: {
    active?: boolean;
    payload?: Array<{ value: number }>;
    label?: string;
}) {
    if (!active || !payload?.length) return null;
    return (
        <div className="rounded-lg border border-gray-200 bg-white px-3 py-2 shadow-md">
            <p className="text-xs text-gray-500">{label}</p>
            <p className="text-sm font-semibold text-gray-900">{formatDuration(payload[0].value)}</p>
        </div>
    );
}

function PieTooltip({ active, payload }: {
    active?: boolean;
    payload?: Array<{ payload: CategoryStat }>;
}) {
    if (!active || !payload?.length) return null;
    const stat = payload[0].payload;
    return (
        <div className="rounded-lg border border-gray-200 bg-white px-3 py-2 shadow-md">
            <p className="text-xs text-gray-500">{stat.name}</p>
            <p className="text-sm font-semibold text-gray-900">{formatDuration(stat.seconds)}</p>
            <p className="text-xs text-gray-500">{stat.percentage}%</p>
        </div>
    );
}

function TrendTooltip({ active, payload, label }: {
    active?: boolean;
    payload?: Array<{ dataKey: string; value: number; fill: string }>;
    label?: string;
}) {
    if (!active || !payload?.length) return null;
    const items = payload.filter(p => p.value > 0).reverse();
    return (
        <div className="rounded-lg border border-gray-200 bg-white px-3 py-2 shadow-md">
            <p className="mb-1.5 text-xs font-medium text-gray-700">{label}</p>
            {items.map(p => (
                <div key={p.dataKey} className="flex items-center gap-2">
                    <div className="h-2 w-2 flex-shrink-0 rounded-full" style={{ backgroundColor: p.fill }} />
                    <span className="text-xs text-gray-600">{p.dataKey}</span>
                    <span className="ml-2 text-xs font-medium text-gray-900">{formatDuration(p.value)}</span>
                </div>
            ))}
        </div>
    );
}

// ──────────────────────────────────────────────────────────
// ヒートマップ：月次カレンダー形式
// ──────────────────────────────────────────────────────────

function MonthlyHeatmap({ data }: { data: HeatmapDay[] }) {
    const maxSeconds = Math.max(1, ...data.map(d => d.seconds));
    const firstDow   = new Date(data[0].date + 'T00:00:00').getDay();
    const offset     = firstDow === 0 ? 6 : firstDow - 1;
    const WEEKDAYS   = ['月', '火', '水', '木', '金', '土', '日'];

    return (
        <div>
            <div className="mb-1.5 grid grid-cols-7 gap-1">
                {WEEKDAYS.map(d => (
                    <div key={d} className="text-center text-xs text-gray-500">{d}</div>
                ))}
            </div>
            <div className="grid grid-cols-7 gap-1">
                {Array.from({ length: offset }).map((_, i) => (
                    <div key={`e${i}`} className="aspect-square" />
                ))}
                {data.map(day => (
                    <div
                        key={day.date}
                        title={`${day.date.slice(5).replace('-', '/')} ${formatDuration(day.seconds)}`}
                        className={`aspect-square rounded-sm ${HEATMAP_COLORS[heatmapLevel(day.seconds, maxSeconds)]}`}
                    />
                ))}
            </div>
        </div>
    );
}

// ──────────────────────────────────────────────────────────
// ヒートマップ：年次 GitHub 形式
// ──────────────────────────────────────────────────────────

function YearlyHeatmap({ data }: { data: HeatmapDay[] }) {
    const maxSeconds = Math.max(1, ...data.map(d => d.seconds));
    const CELL = 12;
    const GAP  = 2;
    const STEP = CELL + GAP;

    const firstDow = new Date(data[0].date + 'T00:00:00').getDay();
    const offset   = firstDow === 0 ? 6 : firstDow - 1;

    type Cell = HeatmapDay | null;
    const padded: Cell[] = [...Array(offset).fill(null), ...data];

    const weeks: Cell[][] = [];
    for (let i = 0; i < padded.length; i += 7) {
        const w = padded.slice(i, i + 7);
        while (w.length < 7) w.push(null);
        weeks.push(w);
    }

    const monthLabels: { label: string; col: number }[] = [];
    let lastMonth = -1;
    padded.forEach((cell, idx) => {
        if (!cell) return;
        const m = new Date(cell.date + 'T00:00:00').getMonth();
        if (m !== lastMonth) {
            lastMonth = m;
            monthLabels.push({ label: `${m + 1}月`, col: Math.floor(idx / 7) });
        }
    });

    const DAY_LABELS = ['月', '', '水', '', '金', '', '日'];

    return (
        <div className="overflow-x-auto">
            <div style={{ minWidth: `${weeks.length * STEP + 28}px` }}>
                <div className="relative mb-1.5" style={{ paddingLeft: '28px', height: '16px' }}>
                    {monthLabels.map(({ label, col }) => (
                        <span
                            key={label}
                            className="absolute text-xs text-gray-500"
                            style={{ left: `${col * STEP + 28}px` }}
                        >
                            {label}
                        </span>
                    ))}
                </div>
                <div className="flex" style={{ gap: `${GAP}px` }}>
                    <div className="flex flex-col" style={{ gap: `${GAP}px`, width: '20px' }}>
                        {DAY_LABELS.map((d, i) => (
                            <div
                                key={i}
                                className="text-right text-xs text-gray-500"
                                style={{ height: `${CELL}px`, lineHeight: `${CELL}px` }}
                            >
                                {d}
                            </div>
                        ))}
                    </div>
                    {weeks.map((week, wi) => (
                        <div key={wi} className="flex flex-col" style={{ gap: `${GAP}px` }}>
                            {week.map((cell, di) => (
                                <div
                                    key={di}
                                    title={cell ? `${cell.date}: ${formatDuration(cell.seconds)}` : undefined}
                                    className={`rounded-sm ${cell ? HEATMAP_COLORS[heatmapLevel(cell.seconds, maxSeconds)] : ''}`}
                                    style={{ width: `${CELL}px`, height: `${CELL}px` }}
                                />
                            ))}
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}

// ──────────────────────────────────────────────────────────
// メインコンポーネント
// ──────────────────────────────────────────────────────────

export default function Index({
    tab, period, customFrom, periodLabel,
    stats, categoryStats, barChartData, heatmapData,
    productivityStats, categoryTrend,
}: Props) {
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

    const diffColor   = isUp ? 'text-green-600' : isDown ? 'text-red-600' : 'text-gray-400';
    const hasPrevData = stats.previousSeconds > 0 || stats.currentSeconds > 0;
    const hasData     = stats.currentSeconds > 0;

    const xTickInterval = tab === 'daily' ? 3 : tab === 'monthly' ? 4 : 0;

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
                    <div className="rounded-2xl border border-gray-300 bg-white p-5 shadow-md">
                        <p className="mb-1 text-sm text-gray-500">合計時間</p>
                        <p className="text-2xl font-bold text-gray-900">
                            {formatDuration(stats.currentSeconds)}
                        </p>
                        {stats.days > 1 && (
                            <p className="mt-1 text-xs text-gray-400">{stats.days}日間</p>
                        )}
                    </div>

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
                                        {isUp ? '+' : ''}{stats.diffPercentage}%
                                    </p>
                                )}
                                {stats.diffPercentage === null && stats.previousSeconds === 0 && (
                                    <p className="mt-1 text-xs text-gray-400">前期間の記録なし</p>
                                )}
                            </>
                        )}
                    </div>

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

                {/* 生産性指標 */}
                {hasData && (
                    <section className="mb-8">
                        <h2 className="mb-4 text-lg font-semibold text-gray-900">生産性指標</h2>
                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                            {/* セッション数 */}
                            <div className="rounded-2xl border border-gray-300 bg-white p-5 shadow-md">
                                <p className="mb-1 text-sm text-gray-500">セッション数</p>
                                <p className="text-2xl font-bold text-gray-900">
                                    {productivityStats.sessionCount}
                                    <span className="ml-1 text-base font-normal text-gray-500">回</span>
                                </p>
                            </div>

                            {/* 平均セッション時間 */}
                            <div className="rounded-2xl border border-gray-300 bg-white p-5 shadow-md">
                                <p className="mb-1 text-sm text-gray-500">平均セッション時間</p>
                                <p className="text-2xl font-bold text-gray-900">
                                    {formatDuration(productivityStats.avgSessionSeconds)}
                                </p>
                                <p className="mt-1 text-xs text-gray-400">1回あたり</p>
                            </div>

                            {/* 集中ピーク時間帯 */}
                            <div className="rounded-2xl border border-gray-300 bg-white p-5 shadow-md">
                                <p className="mb-2 text-sm text-gray-500">集中ピーク時間帯</p>
                                {productivityStats.peakHours.length === 0 ? (
                                    <p className="text-sm text-gray-400">データなし</p>
                                ) : (
                                    <div className="flex flex-wrap gap-2">
                                        {productivityStats.peakHours.map((hour, i) => (
                                            <span
                                                key={hour}
                                                className={`rounded-lg px-2.5 py-1 text-sm font-semibold ${
                                                    i === 0
                                                        ? 'bg-blue-500 text-white'
                                                        : 'border border-blue-200 bg-blue-50 text-blue-700'
                                                }`}
                                            >
                                                {hour}時台
                                            </span>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                    </section>
                )}

                {/* 棒グラフ：作業時間の推移 */}
                {hasData && (
                    <section className="mb-8">
                        <h2 className="mb-4 text-lg font-semibold text-gray-900">作業時間の推移</h2>
                        <div className="rounded-2xl border border-gray-300 bg-white p-5 shadow-md">
                            <ResponsiveContainer width="100%" height={220}>
                                <BarChart
                                    data={barChartData}
                                    margin={{ top: 4, right: 8, left: 0, bottom: 4 }}
                                >
                                    <CartesianGrid
                                        strokeDasharray="3 3"
                                        stroke="#E5E7EB"
                                        vertical={false}
                                    />
                                    <XAxis
                                        dataKey="label"
                                        tick={{ fontSize: 11, fill: '#6B7280' }}
                                        tickLine={false}
                                        axisLine={false}
                                        interval={xTickInterval}
                                    />
                                    <YAxis
                                        tickFormatter={formatYTick}
                                        tick={{ fontSize: 11, fill: '#6B7280' }}
                                        tickLine={false}
                                        axisLine={false}
                                        width={40}
                                    />
                                    <Tooltip
                                        content={<BarTooltip />}
                                        cursor={{ fill: '#F3F4F6' }}
                                    />
                                    <Bar
                                        dataKey="seconds"
                                        fill="#3B82F6"
                                        radius={[4, 4, 0, 0]}
                                        maxBarSize={40}
                                    />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </section>
                )}

                {/* カテゴリ別推移グラフ */}
                {hasData && categoryTrend.categories.length > 0 && (
                    <section className="mb-8">
                        <h2 className="mb-4 text-lg font-semibold text-gray-900">カテゴリ別推移</h2>
                        <div className="rounded-2xl border border-gray-300 bg-white p-5 shadow-md">
                            <ResponsiveContainer width="100%" height={220}>
                                <BarChart
                                    data={categoryTrend.data}
                                    margin={{ top: 4, right: 8, left: 0, bottom: 4 }}
                                >
                                    <CartesianGrid
                                        strokeDasharray="3 3"
                                        stroke="#E5E7EB"
                                        vertical={false}
                                    />
                                    <XAxis
                                        dataKey="label"
                                        tick={{ fontSize: 11, fill: '#6B7280' }}
                                        tickLine={false}
                                        axisLine={false}
                                        interval={xTickInterval}
                                    />
                                    <YAxis
                                        tickFormatter={formatYTick}
                                        tick={{ fontSize: 11, fill: '#6B7280' }}
                                        tickLine={false}
                                        axisLine={false}
                                        width={40}
                                    />
                                    <Tooltip
                                        content={<TrendTooltip />}
                                        cursor={{ fill: '#F3F4F6' }}
                                    />
                                    {categoryTrend.categories.map(cat => (
                                        <Bar
                                            key={cat.name}
                                            dataKey={cat.name}
                                            stackId="stack"
                                            fill={cat.color}
                                            maxBarSize={40}
                                        />
                                    ))}
                                </BarChart>
                            </ResponsiveContainer>
                            {/* 凡例 */}
                            <div className="mt-3 flex flex-wrap gap-3">
                                {categoryTrend.categories.map(cat => (
                                    <div key={cat.name} className="flex items-center gap-1.5">
                                        <div
                                            className="h-2.5 w-2.5 flex-shrink-0 rounded-sm"
                                            style={{ backgroundColor: cat.color }}
                                        />
                                        <span className="text-xs text-gray-600">{cat.name}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </section>
                )}

                {/* カテゴリ別分析 */}
                <section className="mb-8">
                    <h2 className="mb-4 text-lg font-semibold text-gray-900">カテゴリ別分析</h2>

                    {categoryStats.length === 0 ? (
                        <div className="flex flex-col items-center justify-center rounded-2xl border border-gray-200 bg-white py-12 text-center shadow-sm">
                            <p className="text-sm text-gray-500">この期間の作業記録はありません</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
                            {/* 円グラフ */}
                            <div className="rounded-2xl border border-gray-300 bg-white p-5 shadow-md">
                                <p className="mb-2 text-sm font-medium text-gray-700">時間配分</p>
                                <ResponsiveContainer width="100%" height={200}>
                                    <PieChart>
                                        <Pie
                                            data={categoryStats}
                                            dataKey="seconds"
                                            cx="50%"
                                            cy="50%"
                                            innerRadius={55}
                                            outerRadius={85}
                                            paddingAngle={2}
                                        >
                                            {categoryStats.map((entry, i) => (
                                                <Cell key={i} fill={entry.color} />
                                            ))}
                                        </Pie>
                                        <Tooltip content={<PieTooltip />} />
                                    </PieChart>
                                </ResponsiveContainer>
                                {/* 凡例 */}
                                <div className="mt-2 space-y-1.5">
                                    {categoryStats.map(stat => (
                                        <div key={stat.name} className="flex items-center gap-2">
                                            <div
                                                className="h-2.5 w-2.5 flex-shrink-0 rounded-full"
                                                style={{ backgroundColor: stat.color }}
                                            />
                                            <span className="flex-1 truncate text-xs text-gray-700">
                                                {stat.name}
                                            </span>
                                            <span className="text-xs font-medium text-gray-900">
                                                {formatDuration(stat.seconds)}
                                            </span>
                                            <span className="w-8 text-right text-xs text-gray-500">
                                                {stat.percentage}%
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* プログレスバー内訳 */}
                            <div className="rounded-2xl border border-gray-300 bg-white p-5 shadow-md">
                                <p className="mb-3 text-sm font-medium text-gray-700">詳細内訳</p>
                                <div className="space-y-4">
                                    {categoryStats.map(stat => (
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
                        </div>
                    )}
                </section>

                {/* ヒートマップ（月次・年次のみ） */}
                {heatmapData.length > 0 && hasData && (
                    <section className="mb-8">
                        <h2 className="mb-4 text-lg font-semibold text-gray-900">作業カレンダー</h2>
                        <div className="rounded-2xl border border-gray-300 bg-white p-5 shadow-md">
                            {tab === 'monthly' ? (
                                <MonthlyHeatmap data={heatmapData} />
                            ) : (
                                <YearlyHeatmap data={heatmapData} />
                            )}
                            {/* カラーレジェンド */}
                            <div className="mt-4 flex items-center gap-1.5">
                                <span className="text-xs text-gray-500">少ない</span>
                                {HEATMAP_COLORS.map((c, i) => (
                                    <div key={i} className={`h-3 w-3 rounded-sm ${c}`} />
                                ))}
                                <span className="text-xs text-gray-500">多い</span>
                            </div>
                        </div>
                    </section>
                )}
            </div>
        </AuthenticatedLayout>
    );
}
