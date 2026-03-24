import { formatDuration } from '@/Components/WorkHistory';

// ---- 型定義 ----

export interface Stats {
    todaySeconds:  number;
    weekSeconds:   number;
    monthSeconds:  number;
}

export interface CategoryStat {
    category_id: number;
    name:        string;
    color:       string;
    seconds:     number;
    percentage:  number;
}

// ---- StatCard（1枚） ----

function StatCard({ label, seconds }: { label: string; seconds: number }) {
    return (
        <div className="rounded-2xl border border-gray-300 bg-white p-6 shadow-md">
            <p className="mb-1 text-sm font-medium text-gray-500">{label}</p>
            <p className="text-3xl font-bold text-gray-900">
                {formatDuration(seconds)}
            </p>
        </div>
    );
}

// ---- StatCards（3枚セット） ----

interface StatCardsProps {
    stats: Stats;
}

export default function StatCards({ stats }: StatCardsProps) {
    return (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <StatCard label="今日"  seconds={stats.todaySeconds} />
            <StatCard label="今週"  seconds={stats.weekSeconds} />
            <StatCard label="今月"  seconds={stats.monthSeconds} />
        </div>
    );
}

// ---- CategoryStats（今月カテゴリ別） ----

function CategoryStatRow({ name, color, seconds, percentage }: CategoryStat) {
    return (
        <div>
            <div className="mb-1 flex items-center justify-between">
                <div className="flex min-w-0 items-center gap-2">
                    <div
                        className="h-3 w-3 flex-shrink-0 rounded-full"
                        style={{ backgroundColor: color }}
                    />
                    <span className="truncate text-sm font-medium text-gray-700">{name}</span>
                </div>
                <div className="ml-3 flex flex-shrink-0 items-center gap-2">
                    <span className="text-sm font-semibold text-gray-900">
                        {formatDuration(seconds)}
                    </span>
                    <span className="w-9 text-right text-xs text-gray-400">
                        {percentage}%
                    </span>
                </div>
            </div>
            <div className="h-2 w-full overflow-hidden rounded-full bg-gray-100">
                <div
                    className="h-2 rounded-full transition-all duration-500"
                    style={{ width: `${percentage}%`, backgroundColor: color }}
                />
            </div>
        </div>
    );
}

interface CategoryStatsProps {
    categoryStats: CategoryStat[];
}

export function CategoryStats({ categoryStats }: CategoryStatsProps) {
    if (categoryStats.length === 0) {
        return (
            <div className="rounded-2xl border border-gray-200 bg-white px-6 py-8 text-center shadow-sm">
                <p className="text-sm text-gray-400">今月の作業記録がありません</p>
            </div>
        );
    }

    return (
        <div className="rounded-2xl border border-gray-300 bg-white p-6 shadow-md">
            <div className="space-y-4">
                {categoryStats.map((stat) => (
                    <CategoryStatRow key={stat.category_id} {...stat} />
                ))}
            </div>
        </div>
    );
}
