import { Link, usePage } from '@inertiajs/react';
import { Lock } from 'lucide-react';
import { type ReactNode } from 'react';

interface Props {
    children: ReactNode;
    /** オーバーレイに表示する機能名 */
    featureName?: string;
}

/**
 * プレミアム未加入ユーザーにはブラーオーバーレイを表示し、
 * 加入済みユーザーには children をそのまま描画する。
 */
export default function PremiumGate({ children, featureName = 'この機能' }: Props) {
    const { subscription } = usePage().props as any;
    const isSubscribed = subscription?.isSubscribed ?? false;

    if (isSubscribed) {
        return <>{children}</>;
    }

    return (
        <div className="relative">
            {/* ぼかし表示のコンテンツ */}
            <div className="pointer-events-none select-none blur-sm" aria-hidden="true">
                {children}
            </div>

            {/* オーバーレイ */}
            <div className="absolute inset-0 flex flex-col items-center justify-center rounded-2xl bg-white/80 backdrop-blur-sm">
                <div className="flex flex-col items-center gap-4 rounded-2xl border border-gray-300 bg-white p-6 shadow-md">
                    <div className="rounded-full bg-blue-100 p-3">
                        <Lock className="h-6 w-6 text-blue-600" />
                    </div>
                    <div className="text-center">
                        <p className="mb-1 text-base font-semibold text-gray-900">
                            {featureName}はプレミアム限定です
                        </p>
                        <p className="text-sm text-gray-500">
                            プレミアムプランにアップグレードして全機能を解放しましょう
                        </p>
                    </div>
                    <Link
                        href={route('pricing')}
                        className="rounded-xl bg-blue-500 px-6 py-2.5 text-sm font-semibold text-white shadow-md transition-colors hover:bg-blue-600 hover:shadow-lg"
                    >
                        アップグレードする
                    </Link>
                </div>
            </div>
        </div>
    );
}
