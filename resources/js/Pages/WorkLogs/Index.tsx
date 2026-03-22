import WorkHistory, { type GroupedLog } from '@/Components/WorkHistory';
// 後方互換のため再エクスポート
export { DeleteDialog, EditModal, formatDuration, toDatePart, toHHMM } from '@/Components/WorkHistory';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { type Category, type PageProps } from '@/types';
import { Head } from '@inertiajs/react';

interface Props extends PageProps {
    grouped:    GroupedLog[];
    categories: Category[];
    timezone:   string;
}

export default function Index({ grouped, categories }: Props) {
    const totalLogs = grouped.reduce((sum, g) => sum + g.logs.length, 0);

    return (
        <AuthenticatedLayout>
            <Head title="作業履歴" />

            <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6 lg:px-8">
                <h1 className="mb-6 text-xl font-bold text-gray-900">
                    作業履歴
                    <span className="ml-2 text-sm font-normal text-gray-500">（{totalLogs}件）</span>
                </h1>

                <WorkHistory grouped={grouped} categories={categories} />
            </div>
        </AuthenticatedLayout>
    );
}
