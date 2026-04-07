// @ts-ignore – GuestLayout は .jsx のため型定義なし（既存の既知エラー）
import GuestLayout from '@/Layouts/GuestLayout';
import { Head } from '@inertiajs/react';

interface Row {
    label: string;
    content: React.ReactNode;
}

const ROWS: Row[] = [
    { label: '販売事業者',     content: 'BMBlab' },
    {
        label: '連絡先',
        content: (
            <a
                href="https://ai-navi.tech/contact-us/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 underline hover:text-blue-800"
            >
                https://ai-navi.tech/contact-us/
            </a>
        ),
    },
    { label: 'サービス名',     content: 'Project Tracker' },
    { label: '販売価格',       content: 'プレミアムプラン ¥100／月（税込）' },
    { label: '支払方法',       content: 'クレジットカード（Stripe決済）' },
    { label: 'サービス提供時期', content: '決済完了後即時' },
    {
        label: '解約方法',
        content: 'ログイン後、画面右上のメニューから「請求管理」を選択し、解約手続きを行ってください。',
    },
    {
        label: '返金ポリシー',
        content: '解約後の日割り返金は行いません。解約月末まではサービスをご利用いただけます。',
    },
    {
        label: '動作環境',
        content: 'インターネット接続環境および最新の Web ブラウザ',
    },
];

export default function Legal() {
    return (
        <GuestLayout>
            <Head title="特定商取引法に基づく表記" />

            <div className="w-full sm:max-w-2xl">
                <h1 className="mb-6 text-xl font-bold text-gray-900">
                    特定商取引法に基づく表記
                </h1>

                <div className="overflow-hidden rounded-2xl border border-gray-200">
                    <table className="w-full text-sm">
                        <tbody>
                            {ROWS.map(({ label, content }, i) => (
                                <tr
                                    key={label}
                                    className={i % 2 === 0 ? 'bg-white' : 'bg-gray-50'}
                                >
                                    <th className="w-36 py-3.5 pl-4 pr-3 text-left font-medium text-gray-700 align-top sm:w-44">
                                        {label}
                                    </th>
                                    <td className="py-3.5 pl-3 pr-4 text-gray-600 align-top">
                                        {content}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </GuestLayout>
    );
}
