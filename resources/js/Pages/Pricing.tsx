import { Head, Link, router, usePage } from '@inertiajs/react';
import { Check, Clock, Zap } from 'lucide-react';
import { useState } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';

const FREE_FEATURES = [
    'タイマー計測・手動入力',
    'カテゴリ管理（最大5件）',
    '日・週・月の合計時間表示',
    '作業履歴の閲覧',
    'CSVエクスポート',
];

const PREMIUM_FEATURES = [
    '無料プランの全機能',
    'カテゴリ無制限作成',
    '日次・週次・月次・年次の詳細分析',
    'カテゴリ別グラフ（円・棒・ヒートマップ）',
    '生産性指標の分析',
    'PDFレポート生成',
];

function FeatureItem({ text }: { text: string }) {
    return (
        <li className="flex items-start gap-3">
            <Check className="mt-0.5 h-5 w-5 flex-shrink-0 text-green-600" />
            <span className="text-sm text-gray-700">{text}</span>
        </li>
    );
}

interface PricingProps {
    monthlyPriceId: string | null;
}

function PricingContent({ monthlyPriceId }: PricingProps) {
    const { auth, subscription } = usePage().props as any;
    const isLoggedIn = !!auth?.user;
    const isSubscribed = subscription?.isSubscribed ?? false;
    const [loading, setLoading] = useState(false);

    const handleCheckout = () => {
        if (!monthlyPriceId) return;
        setLoading(true);
        router.post(route('subscribe', { plan: monthlyPriceId }), {}, {
            onFinish: () => setLoading(false),
        });
    };

    return (
        <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8">
            <Head title="料金プラン" />

            {/* ヘッダー */}
            <div className="mb-12 text-center">
                <h1 className="mb-3 text-3xl font-bold text-gray-900">
                    シンプルな料金プラン
                </h1>
                <p className="text-base text-gray-600">
                    まずは無料で始めて、必要に応じてアップグレード
                </p>
            </div>

            {/* プランカード */}
            <div className="grid grid-cols-1 gap-8 md:grid-cols-2">

                {/* 無料プラン */}
                <div className="flex flex-col rounded-2xl border border-gray-300 bg-white p-6 shadow-md">
                    <div className="mb-6">
                        <div className="mb-4 flex items-center gap-3">
                            <div className="rounded-xl bg-gray-100 p-2">
                                <Clock className="h-6 w-6 text-gray-600" />
                            </div>
                            <div>
                                <h2 className="text-xl font-semibold text-gray-900">フリープラン</h2>
                                <p className="text-sm text-gray-500">基本機能をすべて無料で</p>
                            </div>
                        </div>
                        <div className="flex items-end gap-1">
                            <span className="text-4xl font-bold text-gray-900">¥0</span>
                            <span className="mb-1 text-sm text-gray-500">/ 月</span>
                        </div>
                    </div>

                    <ul className="mb-8 flex-1 space-y-3">
                        {FREE_FEATURES.map((f) => (
                            <FeatureItem key={f} text={f} />
                        ))}
                    </ul>

                    {isLoggedIn ? (
                        <Link
                            href={route('dashboard')}
                            className="block rounded-xl border-2 border-gray-700 bg-white py-3 text-center text-sm font-semibold text-gray-700 shadow-sm transition-colors hover:bg-gray-50 hover:shadow-md"
                        >
                            ダッシュボードへ
                        </Link>
                    ) : (
                        <Link
                            href={route('register')}
                            className="block rounded-xl border-2 border-gray-700 bg-white py-3 text-center text-sm font-semibold text-gray-700 shadow-sm transition-colors hover:bg-gray-50 hover:shadow-md"
                        >
                            無料で始める
                        </Link>
                    )}
                </div>

                {/* プレミアムプラン */}
                <div className="relative flex flex-col rounded-2xl border border-blue-500 bg-white p-6 shadow-md">
                    {/* おすすめバッジ */}
                    <div className="absolute -top-3.5 left-1/2 -translate-x-1/2">
                        <span className="rounded-full bg-blue-500 px-4 py-1 text-xs font-semibold text-white shadow-md">
                            おすすめ
                        </span>
                    </div>

                    <div className="mb-6">
                        <div className="mb-4 flex items-center gap-3">
                            <div className="rounded-xl bg-blue-100 p-2">
                                <Zap className="h-6 w-6 text-blue-600" />
                            </div>
                            <div>
                                <h2 className="text-xl font-semibold text-gray-900">プレミアムプラン</h2>
                                <p className="text-sm text-gray-500">高度な分析と全機能を解放</p>
                            </div>
                        </div>
                        <div className="flex items-end gap-1">
                            <span className="text-4xl font-bold text-gray-900">¥100</span>
                            <span className="mb-1 text-sm text-gray-500">/ 月</span>
                        </div>
                    </div>

                    <ul className="mb-8 flex-1 space-y-3">
                        {PREMIUM_FEATURES.map((f) => (
                            <FeatureItem key={f} text={f} />
                        ))}
                    </ul>

                    {isSubscribed ? (
                        <Link
                            href={route('billing')}
                            className="block rounded-xl bg-blue-500 py-3 text-center text-sm font-semibold text-white shadow-md transition-colors hover:bg-blue-600 hover:shadow-lg"
                        >
                            プランを管理する
                        </Link>
                    ) : isLoggedIn ? (
                        <button
                            type="button"
                            onClick={handleCheckout}
                            disabled={loading || !monthlyPriceId}
                            className="block w-full rounded-xl bg-blue-500 py-3 text-center text-sm font-semibold text-white shadow-md transition-colors hover:bg-blue-600 hover:shadow-lg disabled:cursor-not-allowed disabled:opacity-50"
                        >
                            {loading ? '処理中...' : 'アップグレードする'}
                        </button>
                    ) : (
                        <Link
                            href={route('register')}
                            className="block rounded-xl bg-blue-500 py-3 text-center text-sm font-semibold text-white shadow-md transition-colors hover:bg-blue-600 hover:shadow-lg"
                        >
                            無料登録してアップグレード
                        </Link>
                    )}
                </div>
            </div>

            {/* 注記 */}
            <p className="mt-8 text-center text-xs text-gray-500">
                お支払いは Stripe による安全な決済です。いつでも解約できます。
            </p>
        </div>
    );
}

export default function Pricing({ monthlyPriceId }: PricingProps) {
    const { auth } = usePage().props as any;
    const isLoggedIn = !!auth?.user;

    if (isLoggedIn) {
        return (
            <AuthenticatedLayout>
                <PricingContent monthlyPriceId={monthlyPriceId} />
            </AuthenticatedLayout>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50">
            <header className="flex h-14 items-center border-b border-gray-200 bg-white px-6">
                <Link href="/" className="flex items-center gap-2">
                    <Clock className="h-5 w-5 text-blue-600" />
                    <span className="text-base font-bold text-blue-700">Project Tracker</span>
                </Link>
                <div className="ml-auto flex items-center gap-3">
                    <Link href={route('login')} className="text-sm font-medium text-gray-700 hover:text-blue-700">
                        ログイン
                    </Link>
                    <Link
                        href={route('register')}
                        className="rounded-lg bg-blue-500 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-600"
                    >
                        新規登録
                    </Link>
                </div>
            </header>
            <PricingContent monthlyPriceId={monthlyPriceId} />
        </div>
    );
}
