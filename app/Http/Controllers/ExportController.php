<?php

namespace App\Http\Controllers;

use Carbon\Carbon;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\StreamedResponse;

class ExportController extends Controller
{
    public function export(Request $request): StreamedResponse
    {
        $user     = $request->user();
        $timezone = $user->timezone ?? 'Asia/Tokyo';
        $range    = $request->get('range', 'all');
        $now      = Carbon::now($timezone);

        // 期間の計算
        [$startUtc, $endUtc] = match ($range) {
            'this_month' => [
                $now->copy()->startOfMonth()->utc(),
                null,
            ],
            'last_month' => [
                $now->copy()->subMonth()->startOfMonth()->utc(),
                $now->copy()->subMonth()->endOfMonth()->utc(),
            ],
            'this_week' => [
                $user->week_start === 'monday'
                    ? $now->copy()->startOfWeek(Carbon::MONDAY)->utc()
                    : $now->copy()->startOfWeek(Carbon::SUNDAY)->utc(),
                null,
            ],
            'custom' => [
                $request->get('start_date')
                    ? Carbon::parse($request->get('start_date'), $timezone)->startOfDay()->utc()
                    : null,
                $request->get('end_date')
                    ? Carbon::parse($request->get('end_date'), $timezone)->endOfDay()->utc()
                    : null,
            ],
            default => [null, null], // 全期間
        };

        $query = $user->workLogs()
            ->with('category:id,name')
            ->latest('started_at');

        if ($startUtc) {
            $query->where('started_at', '>=', $startUtc);
        }
        if ($endUtc) {
            $query->where('started_at', '<=', $endUtc);
        }

        $logs     = $query->get();
        $filename = 'work_logs_' . $now->format('Ymd_His') . '.csv';

        return response()->streamDownload(function () use ($logs, $timezone) {
            $handle = fopen('php://output', 'w');

            // BOM（ExcelでのUTF-8文字化け防止）
            fwrite($handle, "\xEF\xBB\xBF");

            // ヘッダー行
            fputcsv($handle, ['日付', 'カテゴリ', '開始時刻', '終了時刻', '作業時間(分)', 'メモ']);

            foreach ($logs as $log) {
                $started = $log->started_at->setTimezone($timezone);
                $ended   = $log->ended_at->setTimezone($timezone);

                fputcsv($handle, [
                    $started->format('Y/m/d'),
                    $log->category?->name ?? '未分類',
                    $started->format('H:i'),
                    $ended->format('H:i'),
                    (int) round($log->duration_seconds / 60),
                    $log->memo ?? '',
                ]);
            }

            fclose($handle);
        }, $filename, [
            'Content-Type' => 'text/csv; charset=UTF-8',
        ]);
    }
}
