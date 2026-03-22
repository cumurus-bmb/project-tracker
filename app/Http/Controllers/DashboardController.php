<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Carbon;
use Inertia\Inertia;
use Inertia\Response;

class DashboardController extends Controller
{
    public function index(Request $request): Response
    {
        $user     = $request->user();
        $timezone = $user->timezone ?? 'Asia/Tokyo';
        $now      = Carbon::now($timezone);

        // タイムゾーン考慮した各期間の開始時刻（UTC変換してDBクエリ）
        $todayStart = $now->copy()->startOfDay()->utc();
        $monthStart = $now->copy()->startOfMonth()->utc();

        $weekStart = $user->week_start === 'sunday'
            ? $now->copy()->startOfWeek(Carbon::SUNDAY)->utc()
            : $now->copy()->startOfWeek(Carbon::MONDAY)->utc();

        // 集計
        $todaySeconds = $user->workLogs()
            ->where('started_at', '>=', $todayStart)
            ->sum('duration_seconds');

        $weekSeconds = $user->workLogs()
            ->where('started_at', '>=', $weekStart)
            ->sum('duration_seconds');

        $monthSeconds = $user->workLogs()
            ->where('started_at', '>=', $monthStart)
            ->sum('duration_seconds');

        // 直近10件（カテゴリ付き）
        $recentLogs = $user->workLogs()
            ->with('category')
            ->latest('started_at')
            ->take(10)
            ->get()
            ->map(fn ($log) => [
                'id'               => $log->id,
                'started_at'       => $log->started_at->setTimezone($timezone)->toISOString(),
                'ended_at'         => $log->ended_at->setTimezone($timezone)->toISOString(),
                'duration_seconds' => $log->duration_seconds,
                'memo'             => $log->memo,
                'category'         => $log->category ? [
                    'id'    => $log->category->id,
                    'name'  => $log->category->name,
                    'color' => $log->category->color,
                ] : null,
            ]);

        return Inertia::render('Dashboard', [
            'stats' => [
                'todaySeconds' => $todaySeconds,
                'weekSeconds'  => $weekSeconds,
                'monthSeconds' => $monthSeconds,
            ],
            'recentLogs' => $recentLogs,
            'timezone'   => $timezone,
        ]);
    }
}
