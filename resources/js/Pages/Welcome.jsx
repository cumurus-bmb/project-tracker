import { Head, Link, usePage } from '@inertiajs/react';
import {
    BarChart3,
    CheckCircle,
    Clock,
    FolderKanban,
    LayoutDashboard,
    Timer,
} from 'lucide-react';

const FEATURES = [
    {
        icon: Timer,
        title: 'タイマー計測',
        description:
            'ワンクリックでタイマーをスタート。作業中はどのページでも計測を継続。一時停止・再開も自由自在。',
    },
    {
        icon: FolderKanban,
        title: 'カテゴリ管理',
        description:
            'プロジェクトやタスクをカテゴリで色分け管理。よく使うカテゴリはお気に入り登録でさらに素早く記録。',
    },
    {
        icon: LayoutDashboard,
        title: 'ダッシュボード',
        description:
            '今日・今週・今月の作業時間を一目で確認。直近の作業履歴もまとめて把握できます。',
    },
];

const FREE_FEATURES = [
    'タイマー計測・手動入力',
    'カテゴリ管理',
    '日・週・月の合計時間表示',
    '作業履歴の閲覧',
    'CSVエクスポート',
];

const PREMIUM_FEATURES = [
    '無料プランの全機能',
    '日次・週次・月次・年次の詳細分析',
    'カテゴリ別グラフ（円・棒・ヒートマップ）',
    '生産性指標の分析',
    'PDFレポート生成',
    'カテゴリ無制限作成',
];

export default function Welcome() {
    const { auth } = usePage().props;
    const isLoggedIn = !!auth?.user;

    return (
        <>
            <Head title="Project Tracker - 時間を見える化して、生産性を向上" />

            <div className="min-h-screen bg-white">
                {/* ナビゲーション */}
                <nav className="border-b border-gray-200 bg-white">
                    <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
                        <div className="flex h-16 items-center justify-between">
                            <Link href="/" className="flex items-center gap-2">
                                <Clock className="h-6 w-6 text-blue-600" />
                                <span className="text-lg font-bold text-blue-700">
                                    Project Tracker
                                </span>
                            </Link>
                            <div className="flex items-center gap-3">
                                {isLoggedIn ? (
                                    <Link
                                        href="/dashboard"
                                        className="rounded-xl bg-blue-500 px-5 py-2.5 text-sm font-semibold text-white shadow-md transition-all duration-200 hover:bg-blue-600 hover:shadow-lg"
                                    >
                                        ダッシュボードへ
                                    </Link>
                                ) : (
                                    <>
                                        <Link
                                            href="/login"
                                            className="text-sm font-semibold text-gray-700 hover:text-blue-700"
                                        >
                                            ログイン
                                        </Link>
                                        <Link
                                            href="/register"
                                            className="rounded-xl bg-blue-500 px-5 py-2.5 text-sm font-semibold text-white shadow-md transition-all duration-200 hover:bg-blue-600 hover:shadow-lg"
                                        >
                                            無料で始める
                                        </Link>
                                    </>
                                )}
                            </div>
                        </div>
                    </div>
                </nav>

                {/* ヒーローセクション */}
                <section className="py-20 sm:py-28">
                    <div className="mx-auto max-w-4xl px-4 text-center sm:px-6 lg:px-8">
                        <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-blue-200 bg-blue-50 px-4 py-1.5 text-sm font-medium text-blue-700">
                            <Clock className="h-4 w-4" />
                            シンプルな時間管理ツール
                        </div>
                        <h1 className="mb-6 text-4xl font-bold leading-tight text-gray-900 sm:text-5xl">
                            時間を見える化して、
                            <br />
                            <span className="text-blue-600">生産性を向上させる</span>
                        </h1>
                        <p className="mx-auto mb-10 max-w-2xl text-lg leading-relaxed text-gray-600">
                            タイマー計測・手動入力・カテゴリ管理。シンプルな操作で作業時間を記録し、
                            自分の時間の使い方を把握しましょう。
                        </p>
                        <div className="flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
                            {isLoggedIn ? (
                                <Link
                                    href="/dashboard"
                                    className="rounded-2xl bg-blue-500 px-8 py-4 text-base font-semibold text-white shadow-md transition-all duration-200 hover:bg-blue-600 hover:shadow-lg"
                                >
                                    ダッシュボードへ
                                </Link>
                            ) : (
                                <>
                                    <Link
                                        href="/register"
                                        className="rounded-2xl bg-blue-500 px-8 py-4 text-base font-semibold text-white shadow-md transition-all duration-200 hover:bg-blue-600 hover:shadow-lg"
                                    >
                                        無料で始める
                                    </Link>
                                    <Link
                                        href="/login"
                                        className="rounded-2xl border-2 border-blue-700 bg-white px-8 py-4 text-base font-semibold text-blue-700 shadow-sm transition-all duration-200 hover:bg-blue-50 hover:shadow-md"
                                    >
                                        ログイン
                                    </Link>
                                </>
                            )}
                        </div>
                    </div>
                </section>

                {/* 機能セクション */}
                <section className="bg-gray-50 py-20">
                    <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
                        <div className="mb-12 text-center">
                            <h2 className="mb-4 text-3xl font-semibold text-gray-900">
                                主要機能
                            </h2>
                            <p className="text-gray-600">
                                必要な機能だけをシンプルに。迷わず使えるデザイン。
                            </p>
                        </div>
                        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
                            {FEATURES.map(({ icon: Icon, title, description }) => (
                                <div
                                    key={title}
                                    className="rounded-2xl border border-gray-300 bg-white p-6 shadow-md"
                                >
                                    <div className="mb-4 inline-flex rounded-xl bg-blue-50 p-3">
                                        <Icon className="h-6 w-6 text-blue-600" />
                                    </div>
                                    <h3 className="mb-2 text-lg font-semibold text-gray-900">
                                        {title}
                                    </h3>
                                    <p className="text-sm leading-relaxed text-gray-600">
                                        {description}
                                    </p>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* 分析機能セクション */}
                <section className="py-20">
                    <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
                        <div className="rounded-2xl border border-blue-200 bg-blue-50 p-8 sm:p-12">
                            <div className="flex flex-col items-start gap-8 md:flex-row md:items-center">
                                <div className="flex-1">
                                    <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-blue-300 bg-white px-3 py-1 text-xs font-semibold text-blue-700">
                                        プレミアム機能
                                    </div>
                                    <h2 className="mb-4 text-2xl font-semibold text-gray-900">
                                        高度な分析で生産性をさらに向上
                                    </h2>
                                    <p className="mb-6 text-gray-600">
                                        日次・週次・月次・年次の詳細レポート、カテゴリ別グラフ、
                                        生産性指標など、データに基づいた時間管理を実現します。
                                    </p>
                                    <Link
                                        href="#pricing"
                                        className="inline-flex items-center gap-2 text-sm font-semibold text-blue-700 underline hover:text-blue-800"
                                    >
                                        料金プランを見る
                                    </Link>
                                </div>
                                <div className="flex-shrink-0">
                                    <div className="rounded-2xl border border-blue-200 bg-white p-6 shadow-md">
                                        <BarChart3 className="h-20 w-20 text-blue-500" />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* 料金プランセクション */}
                <section id="pricing" className="bg-gray-50 py-20">
                    <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
                        <div className="mb-12 text-center">
                            <h2 className="mb-4 text-3xl font-semibold text-gray-900">
                                料金プラン
                            </h2>
                            <p className="text-gray-600">
                                まずは無料で始めて、必要になったらアップグレード。
                            </p>
                        </div>
                        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                            {/* 無料プラン */}
                            <div className="rounded-2xl border border-gray-300 bg-white p-8 shadow-md">
                                <h3 className="mb-1 text-xl font-semibold text-gray-900">
                                    無料プラン
                                </h3>
                                <p className="mb-6 text-gray-500">ずっと無料</p>
                                <div className="mb-8">
                                    <span className="text-4xl font-bold text-gray-900">¥0</span>
                                    <span className="text-gray-500"> / 月</span>
                                </div>
                                <ul className="mb-8 space-y-3">
                                    {FREE_FEATURES.map((f) => (
                                        <li key={f} className="flex items-center gap-3">
                                            <CheckCircle className="h-5 w-5 flex-shrink-0 text-green-600" />
                                            <span className="text-sm text-gray-700">{f}</span>
                                        </li>
                                    ))}
                                </ul>
                                <Link
                                    href="/register"
                                    className="block w-full rounded-xl border-2 border-blue-700 py-3 text-center text-sm font-semibold text-blue-700 transition-all duration-200 hover:bg-blue-50"
                                >
                                    無料で始める
                                </Link>
                            </div>

                            {/* プレミアムプラン */}
                            <div className="rounded-2xl border border-blue-500 bg-white p-8 shadow-md">
                                <div className="mb-1 flex items-center gap-2">
                                    <h3 className="text-xl font-semibold text-gray-900">
                                        プレミアムプラン
                                    </h3>
                                    <span className="rounded-full bg-blue-500 px-2.5 py-0.5 text-xs font-semibold text-white">
                                        おすすめ
                                    </span>
                                </div>
                                <p className="mb-6 text-gray-500">高度な分析機能</p>
                                <div className="mb-8">
                                    <span className="text-4xl font-bold text-gray-900">¥50</span>
                                    <span className="text-gray-500"> / 月</span>
                                </div>
                                <ul className="mb-8 space-y-3">
                                    {PREMIUM_FEATURES.map((f) => (
                                        <li key={f} className="flex items-center gap-3">
                                            <CheckCircle className="h-5 w-5 flex-shrink-0 text-blue-600" />
                                            <span className="text-sm text-gray-700">{f}</span>
                                        </li>
                                    ))}
                                </ul>
                                <Link
                                    href="/register"
                                    className="block w-full rounded-xl bg-blue-500 py-3 text-center text-sm font-semibold text-white shadow-md transition-all duration-200 hover:bg-blue-600 hover:shadow-lg"
                                >
                                    無料で試す
                                </Link>
                            </div>
                        </div>
                    </div>
                </section>

                {/* フッター */}
                <footer className="border-t border-gray-200 py-8">
                    <div className="mx-auto max-w-4xl px-4 text-center sm:px-6 lg:px-8">
                        <div className="mb-3 flex items-center justify-center gap-2">
                            <Clock className="h-5 w-5 text-blue-600" />
                            <span className="font-semibold text-blue-700">Project Tracker</span>
                        </div>
                        <p className="text-sm text-gray-500">
                            © {new Date().getFullYear()} Project Tracker. All rights reserved.
                        </p>
                    </div>
                </footer>
            </div>
        </>
    );
}
