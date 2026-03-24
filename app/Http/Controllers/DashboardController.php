<?php

namespace App\Http\Controllers;

use App\Models\Category;
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

        // 今月のカテゴリ別統計
        $categoryStats = $user->workLogs()
            ->with('category:id,name,color')
            ->where('started_at', '>=', $monthStart)
            ->get(['category_id', 'duration_seconds'])
            ->groupBy('category_id')
            ->map(fn ($logs, $categoryId) => [
                'category_id' => (int) $categoryId,
                'name'        => $logs->first()->category?->name ?? '未分類',
                'color'       => $logs->first()->category?->color ?? '#9CA3AF',
                'seconds'     => (int) $logs->sum('duration_seconds'),
            ])
            ->sortByDesc('seconds')
            ->values();

        $totalCategorySeconds = $categoryStats->sum('seconds');

        $categoryStats = $categoryStats->map(fn ($stat) => array_merge($stat, [
            'percentage' => $totalCategorySeconds > 0
                ? (int) round(($stat['seconds'] / $totalCategorySeconds) * 100)
                : 0,
        ]))->values();

        // 直近10件（カテゴリ付き）
        $recentLogs = $user->workLogs()
            ->with('category')
            ->latest('started_at')
            ->take(10)
            ->get()
            ->map(fn ($log) => [
                'id'               => $log->id,
                'category_id'      => $log->category_id,
                'started_at'       => $log->started_at->setTimezone($timezone)->toIso8601String(),
                'ended_at'         => $log->ended_at->setTimezone($timezone)->toIso8601String(),
                'duration_seconds' => $log->duration_seconds,
                'memo'             => $log->memo,
                'category'         => $log->category ? [
                    'id'    => $log->category->id,
                    'name'  => $log->category->name,
                    'color' => $log->category->color,
                ] : null,
            ]);

        $categories = Category::where('user_id', $user->id)
            ->orderBy('is_favorite', 'desc')
            ->orderBy('name')
            ->get(['id', 'name', 'color', 'is_favorite']);

        return Inertia::render('Dashboard', [
            'stats' => [
                'todaySeconds' => $todaySeconds,
                'weekSeconds'  => $weekSeconds,
                'monthSeconds' => $monthSeconds,
            ],
            'categoryStats' => $categoryStats,
            'recentLogs'    => $recentLogs,
            'timezone'      => $timezone,
            'categories'    => $categories,
        ]);
    }
}
