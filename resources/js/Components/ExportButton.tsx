import { Download } from 'lucide-react';
import { useState } from 'react';

type Range = 'all' | 'this_month' | 'last_month' | 'this_week' | 'custom';

const RANGE_LABELS: Record<Range, string> = {
    all:        '全期間',
    this_month: '今月',
    last_month: '先月',
    this_week:  '今週',
    custom:     '期間指定',
};

export default function ExportButton() {
    const [range, setRange]         = useState<Range>('this_month');
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate]     = useState('');

    const handleExport = () => {
        const params = new URLSearchParams({ range });
        if (range === 'custom') {
            if (startDate) params.set('start_date', startDate);
            if (endDate)   params.set('end_date', endDate);
        }
        window.location.href = `/export?${params.toString()}`;
    };

    const exportDisabled = range === 'custom' && !startDate && !endDate;

    return (
        <div className="flex flex-wrap items-center gap-2">
            {/* 範囲セレクト */}
            <select
                value={range}
                onChange={(e) => setRange(e.target.value as Range)}
                className="rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-700 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            >
                {(Object.entries(RANGE_LABELS) as [Range, string][]).map(([value, label]) => (
                    <option key={value} value={value}>{label}</option>
                ))}
            </select>

            {/* カスタム期間入力 */}
            {range === 'custom' && (
                <>
                    <input
                        type="date"
                        value={startDate}
                        onChange={(e) => setStartDate(e.target.value)}
                        className="rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-700 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                    />
                    <span className="text-sm text-gray-400">〜</span>
                    <input
                        type="date"
                        value={endDate}
                        onChange={(e) => setEndDate(e.target.value)}
                        className="rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-700 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                    />
                </>
            )}

            {/* ダウンロードボタン */}
            <button
                type="button"
                onClick={handleExport}
                disabled={exportDisabled}
                className="flex items-center gap-2 rounded-xl border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40"
            >
                <Download className="h-4 w-4" />
                CSV出力
            </button>
        </div>
    );
}
