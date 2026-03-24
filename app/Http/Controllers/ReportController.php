<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Carbon;
use Inertia\Inertia;
use Inertia\Response;

class ReportController extends Controller
{
    public function index(Request $request): Response
    {
        $user     = $request->user();
        $timezone = $user->timezone ?? 'Asia/Tokyo';
        $now      = Carbon::now($timezone);

        $tab    = $request->input('tab', 'monthly');
        $period = $request->input('period', 'this_month');
        $from   = $request->input('from');

        [$currentStart, $currentEnd, $previousStart, $previousEnd, $periodLabel]
            = $this->resolveDateRange($tab, $period, $from, $now, $user);

        $currentSeconds  = $this->sumSeconds($user, $currentStart, $currentEnd);
        $previousSeconds = $this->sumSeconds($user, $previousStart, $previousEnd);

        $diffSeconds    = $currentSeconds - $previousSeconds;
        $diffPercentage = $previousSeconds > 0
            ? (int) round(($diffSeconds / $previousSeconds) * 100)
            : null;

        $days         = max(1, (int) $currentStart->diffInDays($currentEnd) + 1);
        $dailyAverage = $tab !== 'daily' ? (int) round($currentSeconds / $days) : null;

        $categoryStats = $this->categoryBreakdown($user, $currentStart, $currentEnd);

        return Inertia::render('Reports/Index', [
            'tab'         => $tab,
            'period'      => $period,
            'customFrom'  => $from,
            'periodLabel' => $periodLabel,
            'stats'       => [
                'currentSeconds'  => $currentSeconds,
                'previousSeconds' => $previousSeconds,
                'diffSeconds'     => $diffSeconds,
                'diffPercentage'  => $diffPercentage,
                'dailyAverage'    => $dailyAverage,
                'days'            => $days,
            ],
            'categoryStats' => $categoryStats,
        ]);
    }

    // ──────────────────────────────────────────────────────────
    // 日付範囲の解決
    // ──────────────────────────────────────────────────────────

    private function resolveDateRange(string $tab, string $period, ?string $from, Carbon $now, $user): array
    {
        $weekStartDay = ($user->week_start ?? 'monday') === 'sunday'
            ? Carbon::SUNDAY
            : Carbon::MONDAY;

        return match ($tab) {
            'daily'  => $this->dailyRange($period, $from, $now),
            'weekly' => $this->weeklyRange($period, $from, $now, $weekStartDay),
            'yearly' => $this->yearlyRange($period, $now),
            default  => $this->monthlyRange($period, $from, $now),
        };
    }

    private function dailyRange(string $period, ?string $from, Carbon $now): array
    {
        $date = match ($period) {
            'yesterday' => $now->copy()->subDay(),
            'custom'    => $from ? Carbon::parse($from, $now->timezone) : $now,
            default     => $now,
        };

        $cs = $date->copy()->startOfDay();
        $ce = $date->copy()->endOfDay();

        return [
            $cs,
            $ce,
            $cs->copy()->subDay(),
            $ce->copy()->subDay(),
            $date->format('Y年n月j日'),
        ];
    }

    private function weeklyRange(string $period, ?string $from, Carbon $now, int $weekStartDay): array
    {
        $date = match ($period) {
            'last_week' => $now->copy()->subWeek(),
            'custom'    => $from ? Carbon::parse($from, $now->timezone) : $now,
            default     => $now,
        };

        $cs = $date->copy()->startOfWeek($weekStartDay);
        $ce = $cs->copy()->addDays(6)->endOfDay();
        $ps = $cs->copy()->subWeek();
        $pe = $ps->copy()->addDays(6)->endOfDay();

        return [
            $cs,
            $ce,
            $ps,
            $pe,
            $cs->format('Y年n月j日') . ' 〜 ' . $ce->format('n月j日'),
        ];
    }

    private function monthlyRange(string $period, ?string $from, Carbon $now): array
    {
        $date = match ($period) {
            'last_month' => $now->copy()->subMonth(),
            'custom'     => $from ? Carbon::parse($from . '-01', $now->timezone) : $now,
            default      => $now,
        };

        $cs = $date->copy()->startOfMonth();
        $ce = $date->copy()->endOfMonth();
        $ps = $cs->copy()->subMonth()->startOfMonth();
        $pe = $ps->copy()->endOfMonth();

        return [$cs, $ce, $ps, $pe, $date->format('Y年n月')];
    }

    private function yearlyRange(string $period, Carbon $now): array
    {
        $date = $period === 'last_year' ? $now->copy()->subYear() : $now;

        $cs = $date->copy()->startOfYear();
        $ce = $date->copy()->endOfYear();
        $ps = $cs->copy()->subYear();
        $pe = $ce->copy()->subYear();

        return [$cs, $ce, $ps, $pe, $date->format('Y年')];
    }

    // ──────────────────────────────────────────────────────────
    // クエリヘルパー
    // ──────────────────────────────────────────────────────────

    private function sumSeconds($user, Carbon $start, Carbon $end): int
    {
        return (int) $user->workLogs()
            ->whereBetween('started_at', [
                $start->copy()->utc(),
                $end->copy()->utc(),
            ])
            ->sum('duration_seconds');
    }

    private function categoryBreakdown($user, Carbon $start, Carbon $end): array
    {
        $logs = $user->workLogs()
            ->with('category:id,name,color')
            ->whereBetween('started_at', [
                $start->copy()->utc(),
                $end->copy()->utc(),
            ])
            ->get(['category_id', 'duration_seconds']);

        $total = $logs->sum('duration_seconds');

        return $logs->groupBy('category_id')
            ->map(fn ($rows) => [
                'name'       => $rows->first()->category?->name ?? '未分類',
                'color'      => $rows->first()->category?->color ?? '#9CA3AF',
                'seconds'    => (int) $rows->sum('duration_seconds'),
                'percentage' => $total > 0
                    ? (int) round(($rows->sum('duration_seconds') / $total) * 100)
                    : 0,
            ])
            ->sortByDesc('seconds')
            ->values()
            ->toArray();
    }
}
