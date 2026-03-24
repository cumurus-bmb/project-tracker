import Dropdown from '@/Components/Dropdown';
import { Link, usePage } from '@inertiajs/react';
import {
    BarChart3,
    ChevronDown,
    Clock,
    CreditCard,
    FolderKanban,
    LayoutDashboard,
    Lock,
    LogOut,
    Menu,
    Settings,
    Sparkles,
    X,
} from 'lucide-react';
import { useEffect, useState } from 'react';

const NAV_ITEMS = [
    { label: 'ダッシュボード', href: '/dashboard',  routeName: 'dashboard',        icon: LayoutDashboard },
    { label: '作業履歴',       href: '/work-logs',  routeName: 'work-logs.index',  icon: Clock },
    { label: 'カテゴリ',       href: '/categories', routeName: 'categories.index', icon: FolderKanban },
    { label: '詳細統計',       href: '/reports',    routeName: 'reports.index',    icon: BarChart3, premium: true },
];

function FlashMessage({ flash }) {
    const [visible, setVisible] = useState(false);

    useEffect(() => {
        if (flash.message || flash.error) {
            setVisible(true);
            const timer = setTimeout(() => setVisible(false), 4000);
            return () => clearTimeout(timer);
        }
    }, [flash]);

    if (!visible || (!flash.message && !flash.error)) return null;

    return (
        <div
            className={`fixed right-4 top-4 z-50 max-w-sm rounded-xl border px-5 py-3 shadow-lg transition-all duration-200 ${
                flash.error
                    ? 'border-red-300 bg-white text-red-700'
                    : 'border-green-300 bg-white text-green-700'
            }`}
        >
            <p className="text-sm font-medium">{flash.error ?? flash.message}</p>
        </div>
    );
}

function NavLink({ label, href, routeName, icon: Icon, premium, isSubscribed, onClick }) {
    const isActive = () => {
        try {
            return route().current(routeName);
        } catch {
            return false;
        }
    };

    const active = isActive();
    const locked = premium && !isSubscribed;
    const resolvedHref = locked ? route('pricing') : href;

    return (
        <Link
            href={resolvedHref}
            onClick={onClick}
            className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors duration-150 ${
                active
                    ? 'bg-blue-500 text-white'
                    : locked
                        ? 'text-gray-400 hover:bg-gray-100'
                        : 'text-gray-700 hover:bg-gray-100 hover:text-blue-700'
            }`}
        >
            <Icon className="h-4 w-4 flex-shrink-0" />
            <span className="flex-1">{label}</span>
            {locked && <Lock className="h-3 w-3 flex-shrink-0" />}
        </Link>
    );
}

export default function AuthenticatedLayout({ children }) {
    const { auth, flash, subscription } = usePage().props;
    const user = auth.user;
    const isSubscribed = subscription?.isSubscribed ?? false;
    const [mobileOpen, setMobileOpen] = useState(false);

    return (
        <div className="flex min-h-screen flex-col bg-gray-50">
            <FlashMessage flash={flash} />

            {/* スリムヘッダー */}
            <header className="flex h-14 flex-shrink-0 items-center justify-between border-b border-gray-200 bg-white px-4">
                {/* ロゴ */}
                <Link href="/dashboard" className="flex items-center gap-2">
                    <Clock className="h-5 w-5 text-blue-600" />
                    <span className="text-base font-bold text-blue-700">Project Tracker</span>
                </Link>

                {/* デスクトップ: ユーザードロップダウン */}
                <div className="hidden md:flex md:items-center">
                    <Dropdown>
                        <Dropdown.Trigger>
                            <button
                                type="button"
                                className="flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-700 shadow-sm transition-all duration-150 hover:border-gray-400 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                            >
                                <span>{user.name}</span>
                                <ChevronDown className="h-4 w-4 text-gray-500" />
                            </button>
                        </Dropdown.Trigger>

                        <Dropdown.Content>
                            <Dropdown.Link href={route('profile.edit')}>
                                <span className="flex items-center gap-2">
                                    <Settings className="h-4 w-4" />
                                    プロフィール
                                </span>
                            </Dropdown.Link>
                            <Dropdown.Link href="/billing">
                                <span className="flex items-center gap-2">
                                    <CreditCard className="h-4 w-4" />
                                    請求管理
                                </span>
                            </Dropdown.Link>
                            <Dropdown.Link
                                href={route('logout')}
                                method="post"
                                as="button"
                            >
                                <span className="flex items-center gap-2">
                                    <LogOut className="h-4 w-4" />
                                    ログアウト
                                </span>
                            </Dropdown.Link>
                        </Dropdown.Content>
                    </Dropdown>
                </div>

                {/* モバイル: ハンバーガー */}
                <button
                    type="button"
                    onClick={() => setMobileOpen((prev) => !prev)}
                    className="rounded-lg p-2 text-gray-700 transition-colors hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 md:hidden"
                    aria-label="メニューを開く"
                >
                    {mobileOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
                </button>
            </header>

            {/* ボディ: サイドバー + メイン */}
            <div className="flex min-h-0 flex-1">

                {/* PC サイドバー */}
                <aside className="hidden w-56 flex-shrink-0 flex-col border-r border-gray-200 bg-white md:flex">
                    <nav className="flex-1 px-3 py-4">
                        <p className="mb-2 px-3 text-xs font-semibold uppercase tracking-wider text-gray-400">
                            メインメニュー
                        </p>
                        <div className="space-y-1">
                            {NAV_ITEMS.map((item) => (
                                <NavLink key={item.href} {...item} isSubscribed={isSubscribed} />
                            ))}
                        </div>

                        {/* アップグレード CTA（未加入ユーザーのみ） */}
                        {!isSubscribed && (
                            <div className="mt-3">
                                <Link
                                    href={route('pricing')}
                                    className="flex flex-col gap-1 rounded-xl border border-blue-200 bg-blue-50 p-3 transition-colors hover:bg-blue-100"
                                >
                                    <div className="flex items-center gap-2">
                                        <Sparkles className="h-4 w-4 text-blue-600" />
                                        <span className="text-xs font-semibold text-blue-700">プレミアムにアップグレード</span>
                                    </div>
                                    <p className="text-xs text-blue-600">詳細分析・グラフ機能を解放</p>
                                </Link>
                            </div>
                        )}
                    </nav>
                </aside>

                {/* メインコンテンツ */}
                <main className="min-w-0 flex-1">
                    {children}
                </main>
            </div>

            {/* モバイルメニュー (fixed overlay) */}
            {mobileOpen && (
                <div className="fixed inset-0 z-40 md:hidden">
                    {/* バックドロップ */}
                    <div
                        className="absolute inset-0 bg-black/40"
                        onClick={() => setMobileOpen(false)}
                    />

                    {/* スライドパネル */}
                    <div className="absolute inset-y-0 left-0 flex w-64 flex-col bg-white shadow-xl">
                        <div className="flex h-14 flex-shrink-0 items-center justify-between border-b border-gray-200 px-4">
                            <span className="text-sm font-semibold text-gray-900">メニュー</span>
                            <button
                                type="button"
                                onClick={() => setMobileOpen(false)}
                                className="rounded-lg p-2 text-gray-500 hover:bg-gray-100"
                            >
                                <X className="h-5 w-5" />
                            </button>
                        </div>

                        <nav className="flex-1 overflow-y-auto px-3 py-4">
                            <p className="mb-2 px-3 text-xs font-semibold uppercase tracking-wider text-gray-400">
                                メインメニュー
                            </p>
                            <div className="space-y-1">
                                {NAV_ITEMS.map((item) => (
                                    <NavLink
                                        key={item.href}
                                        {...item}
                                        isSubscribed={isSubscribed}
                                        onClick={() => setMobileOpen(false)}
                                    />
                                ))}
                            </div>
                        </nav>

                        {/* ユーザー情報セクション */}
                        <div className="flex-shrink-0 border-t border-gray-200 px-4 pb-4 pt-3">
                            <p className="text-sm font-semibold text-gray-900">{user.name}</p>
                            <p className="mb-3 text-xs text-gray-500">{user.email}</p>
                            <div className="space-y-1">
                                <Link
                                    href={route('profile.edit')}
                                    onClick={() => setMobileOpen(false)}
                                    className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100"
                                >
                                    <Settings className="h-4 w-4" />
                                    プロフィール
                                </Link>
                                <Link
                                    href="/billing"
                                    onClick={() => setMobileOpen(false)}
                                    className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100"
                                >
                                    <CreditCard className="h-4 w-4" />
                                    請求管理
                                </Link>
                                <Link
                                    href={route('logout')}
                                    method="post"
                                    as="button"
                                    className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100"
                                >
                                    <LogOut className="h-4 w-4" />
                                    ログアウト
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
