import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head } from '@inertiajs/react';
import { Clock, FolderKanban } from 'lucide-react';

/** 秒数を「H時間M分」形式に変換 */
function formatDuration(seconds) {
    if (seconds === 0) return '0分';
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    if (h === 0) return `${m}分`;
    if (m === 0) return `${h}時間`;
    return `${h}時間${m}分`;
}

/** ISO文字列から「HH:MM」を取得 */
function toHHMM(isoString) {
    const d = new Date(isoString);
    return d.toLocaleTimeString('ja-JP', { hour: '2-digit', minute: '2-digit', hour12: false });
}

/** ISO文字列から「M/D」を取得 */
function toMD(isoString) {
    const d = new Date(isoString);
    return `${d.getMonth() + 1}/${d.getDate()}`;
}

function StatCard({ label, seconds }) {
    return (
        <div className="rounded-2xl border border-gray-300 bg-white p-6 shadow-md">
            <p className="mb-1 text-sm font-medium text-gray-500">{label}</p>
            <p className="text-3xl font-bold text-gray-900">
                {formatDuration(seconds)}
            </p>
        </div>
    );
}

function WorkLogItem({ log }) {
    const startTime = toHHMM(log.started_at);
    const endTime   = toHHMM(log.ended_at);
    const dateLabel = toMD(log.started_at);

    return (
        <div className="flex items-center gap-4 rounded-xl border border-gray-200 bg-white px-4 py-3 shadow-sm">
            {/* カテゴリカラードット */}
            <div
                className="h-3 w-3 flex-shrink-0 rounded-full"
                style={{ backgroundColor: log.category?.color ?? '#9CA3AF' }}
            />

            {/* カテゴリ名 */}
            <span className="w-24 flex-shrink-0 truncate text-sm font-medium text-gray-700">
                {log.category?.name ?? '未分類'}
            </span>

            {/* 日付・時刻 */}
            <span className="flex-1 text-sm text-gray-500">
                {dateLabel}&nbsp;&nbsp;{startTime} 〜 {endTime}
            </span>

            {/* 時間 */}
            <span className="flex-shrink-0 text-sm font-semibold text-gray-900">
                {formatDuration(log.duration_seconds)}
            </span>

            {/* メモ */}
            {log.memo && (
                <span className="hidden max-w-[160px] truncate text-xs text-gray-400 sm:inline">
                    {log.memo}
                </span>
            )}
        </div>
    );
}

export default function Dashboard({ stats, recentLogs }) {
    return (
        <AuthenticatedLayout>
            <Head title="ダッシュボード" />

            <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">

                {/* 統計カード */}
                <section className="mb-8">
                    <h2 className="mb-4 text-lg font-semibold text-gray-900">作業時間サマリー</h2>
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                        <StatCard label="今日" seconds={stats.todaySeconds} />
                        <StatCard label="今週" seconds={stats.weekSeconds} />
                        <StatCard label="今月" seconds={stats.monthSeconds} />
                    </div>
                </section>

                {/* 直近の作業履歴 */}
                <section>
                    <h2 className="mb-4 text-lg font-semibold text-gray-900">直近の作業履歴</h2>

                    {recentLogs.length === 0 ? (
                        <div className="flex flex-col items-center justify-center rounded-2xl border border-gray-200 bg-white py-16 text-center shadow-sm">
                            <div className="mb-4 rounded-full bg-gray-100 p-4">
                                <Clock className="h-8 w-8 text-gray-400" />
                            </div>
                            <p className="mb-1 text-base font-medium text-gray-700">
                                まだ作業記録がありません
                            </p>
                            <p className="text-sm text-gray-500">
                                タイマーまたは手動入力で最初の記録を追加しましょう
                            </p>
                        </div>
                    ) : (
                        <div className="space-y-2">
                            {recentLogs.map((log) => (
                                <WorkLogItem key={log.id} log={log} />
                            ))}
                        </div>
                    )}
                </section>
            </div>
        </AuthenticatedLayout>
    );
}
