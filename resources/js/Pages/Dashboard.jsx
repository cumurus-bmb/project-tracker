import Timer from '@/Components/Timer';
import WorkLogForm from '@/Components/WorkLogForm';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { DeleteDialog, EditModal, formatDuration, toDatePart, toHHMM } from '@/Components/WorkHistory';
import { Head } from '@inertiajs/react';
import { Clock, Pencil, Trash2 } from 'lucide-react';
import { useState } from 'react';

/** ISO文字列から「M/D」を取得 */
function toMD(isoString) {
    return isoString.slice(5, 10).replace('-', '/');
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

function WorkLogItem({ log, onEdit, onDelete }) {
    return (
        <div className="flex items-center gap-3 rounded-xl border border-gray-200 bg-white px-4 py-3 shadow-sm">
            <div
                className="h-3 w-3 flex-shrink-0 rounded-full"
                style={{ backgroundColor: log.category?.color ?? '#9CA3AF' }}
            />
            <span className="w-20 flex-shrink-0 truncate text-sm font-medium text-gray-700">
                {log.category?.name ?? '未分類'}
            </span>
            <span className="flex-1 text-sm text-gray-500">
                {toMD(log.started_at)}&nbsp;&nbsp;{toHHMM(log.started_at)} 〜 {toHHMM(log.ended_at)}
            </span>
            <span className="flex-shrink-0 text-sm font-semibold text-gray-900">
                {formatDuration(log.duration_seconds)}
            </span>
            {log.memo && (
                <span className="hidden max-w-[120px] truncate text-xs text-gray-400 sm:inline">
                    {log.memo}
                </span>
            )}
            <div className="ml-auto flex gap-1">
                <button
                    type="button"
                    onClick={() => onEdit(log)}
                    className="rounded-full p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-700"
                    aria-label="編集"
                >
                    <Pencil className="h-4 w-4" />
                </button>
                <button
                    type="button"
                    onClick={() => onDelete(log)}
                    className="rounded-full p-2 text-gray-400 hover:bg-red-50 hover:text-red-600"
                    aria-label="削除"
                >
                    <Trash2 className="h-4 w-4" />
                </button>
            </div>
        </div>
    );
}

export default function Dashboard({ stats, recentLogs, categories }) {
    const [activeTab, setActiveTab]       = useState('timer');
    const [editTarget, setEditTarget]     = useState(null);
    const [deleteTarget, setDeleteTarget] = useState(null);

    return (
        <AuthenticatedLayout>
            <Head title="ダッシュボード" />

            <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">

                {/* タイマー / 手動入力 タブ */}
                <section className="mb-8">
                    <div className="mb-4 flex rounded-xl border border-gray-200 bg-gray-100 p-1">
                        <button
                            type="button"
                            onClick={() => setActiveTab('timer')}
                            className={`flex-1 rounded-lg py-2 text-sm font-medium transition-colors ${
                                activeTab === 'timer'
                                    ? 'bg-white text-gray-900 shadow-sm'
                                    : 'text-gray-500 hover:text-gray-700'
                            }`}
                        >
                            タイマー
                        </button>
                        <button
                            type="button"
                            onClick={() => setActiveTab('manual')}
                            className={`flex-1 rounded-lg py-2 text-sm font-medium transition-colors ${
                                activeTab === 'manual'
                                    ? 'bg-white text-gray-900 shadow-sm'
                                    : 'text-gray-500 hover:text-gray-700'
                            }`}
                        >
                            手動入力
                        </button>
                    </div>

                    {activeTab === 'timer' ? (
                        <Timer categories={categories ?? []} />
                    ) : (
                        <WorkLogForm categories={categories ?? []} />
                    )}
                </section>

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
                                <WorkLogItem
                                    key={log.id}
                                    log={log}
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
                    log={editTarget}
                    categories={categories ?? []}
                    onClose={() => setEditTarget(null)}
                />
            )}
            {deleteTarget && (
                <DeleteDialog
                    log={deleteTarget}
                    onClose={() => setDeleteTarget(null)}
                />
            )}
        </AuthenticatedLayout>
    );
}
