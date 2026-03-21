import Dropdown from '@/Components/Dropdown';
import { Link, usePage } from '@inertiajs/react';
import {
    BarChart3,
    ChevronDown,
    Clock,
    FolderKanban,
    LayoutDashboard,
    LogOut,
    Menu,
    Settings,
    X,
    CreditCard,
} from 'lucide-react';
import { useEffect, useState } from 'react';

const NAV_ITEMS = [
    { label: 'ダッシュボード', href: '/dashboard', routeName: 'dashboard', icon: LayoutDashboard },
    { label: 'カテゴリ', href: '/categories', routeName: 'categories.index', icon: FolderKanban },
    { label: 'レポート', href: '/reports', routeName: 'reports.index', icon: BarChart3 },
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

export default function AuthenticatedLayout({ children }) {
    const { auth, flash } = usePage().props;
    const user = auth.user;
    const [mobileOpen, setMobileOpen] = useState(false);

    const isActive = (routeName) => {
        try {
            return route().current(routeName);
        } catch {
            return false;
        }
    };

    return (
        <div className="min-h-screen bg-gray-50">
            <FlashMessage flash={flash} />

            {/* ヘッダー */}
            <nav className="border-b border-gray-300 bg-white shadow-sm">
                <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
                    <div className="flex h-16 items-center justify-between">

                        {/* ロゴ */}
                        <div className="flex items-center gap-8">
                            <Link href="/dashboard" className="flex items-center gap-2">
                                <Clock className="h-6 w-6 text-blue-600" />
                                <span className="text-lg font-bold text-blue-700">
                                    Project Tracker
                                </span>
                            </Link>

                            {/* デスクトップナビ */}
                            <div className="hidden items-center gap-1 sm:flex">
                                {NAV_ITEMS.map(({ label, href, routeName, icon: Icon }) => (
                                    <Link
                                        key={href}
                                        href={href}
                                        className={`flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium transition-colors duration-150 ${
                                            isActive(routeName)
                                                ? 'bg-blue-50 text-blue-700'
                                                : 'text-gray-700 hover:bg-gray-100 hover:text-blue-700'
                                        }`}
                                    >
                                        <Icon className="h-4 w-4" />
                                        {label}
                                    </Link>
                                ))}
                            </div>
                        </div>

                        {/* ユーザーメニュー */}
                        <div className="hidden sm:flex sm:items-center">
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

                        {/* モバイルメニューボタン */}
                        <button
                            type="button"
                            onClick={() => setMobileOpen((prev) => !prev)}
                            className="rounded-lg p-2 text-gray-700 transition-colors hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 sm:hidden"
                            aria-label="メニューを開く"
                        >
                            {mobileOpen ? (
                                <X className="h-6 w-6" />
                            ) : (
                                <Menu className="h-6 w-6" />
                            )}
                        </button>
                    </div>
                </div>

                {/* モバイルメニュー */}
                {mobileOpen && (
                    <div className="border-t border-gray-200 sm:hidden">
                        <div className="space-y-1 px-4 pb-3 pt-2">
                            {NAV_ITEMS.map(({ label, href, routeName, icon: Icon }) => (
                                <Link
                                    key={href}
                                    href={href}
                                    className={`flex items-center gap-2 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                                        isActive(routeName)
                                            ? 'bg-blue-50 text-blue-700'
                                            : 'text-gray-700 hover:bg-gray-100'
                                    }`}
                                    onClick={() => setMobileOpen(false)}
                                >
                                    <Icon className="h-4 w-4" />
                                    {label}
                                </Link>
                            ))}
                        </div>
                        <div className="border-t border-gray-200 px-4 pb-3 pt-4">
                            <div className="mb-3">
                                <p className="text-sm font-semibold text-gray-900">{user.name}</p>
                                <p className="text-xs text-gray-500">{user.email}</p>
                            </div>
                            <div className="space-y-1">
                                <Link
                                    href={route('profile.edit')}
                                    className="flex items-center gap-2 rounded-lg px-3 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-100"
                                    onClick={() => setMobileOpen(false)}
                                >
                                    <Settings className="h-4 w-4" />
                                    プロフィール
                                </Link>
                                <Link
                                    href="/billing"
                                    className="flex items-center gap-2 rounded-lg px-3 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-100"
                                    onClick={() => setMobileOpen(false)}
                                >
                                    <CreditCard className="h-4 w-4" />
                                    請求管理
                                </Link>
                                <Link
                                    href={route('logout')}
                                    method="post"
                                    as="button"
                                    className="flex w-full items-center gap-2 rounded-lg px-3 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-100"
                                >
                                    <LogOut className="h-4 w-4" />
                                    ログアウト
                                </Link>
                            </div>
                        </div>
                    </div>
                )}
            </nav>

            {/* メインコンテンツ */}
            <main>{children}</main>
        </div>
    );
}
