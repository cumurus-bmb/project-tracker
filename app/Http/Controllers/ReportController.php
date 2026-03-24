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
        $barChartData  = $this->barChartData($user, $currentStart, $currentEnd, $tab, $timezone);
        $heatmapData   = in_array($tab, ['monthly', 'yearly'])
            ? $this->heatmapData($user, $currentStart, $currentEnd, $timezone)
            : [];

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
            'barChartData'  => $barChartData,
            'heatmapData'   => $heatmapData,
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

    private function barChartData($user, Carbon $start, Carbon $end, string $tab, string $timezone): array
    {
        $logs = $user->workLogs()
            ->whereBetween('started_at', [$start->copy()->utc(), $end->copy()->utc()])
            ->get(['started_at', 'duration_seconds']);

        switch ($tab) {
            case 'daily':
                $buckets = array_fill(0, 24, 0);
                foreach ($logs as $log) {
                    $hour = Carbon::parse($log->started_at)->setTimezone($timezone)->hour;
                    $buckets[$hour] += $log->duration_seconds;
                }
                return array_map(
                    fn ($h) => ['label' => "{$h}時", 'seconds' => $buckets[$h]],
                    range(0, 23)
                );

            case 'weekly':
                $days = ['月', '火', '水', '木', '金', '土', '日'];
                $buckets = array_fill(0, 7, 0);
                foreach ($logs as $log) {
                    $dow = Carbon::parse($log->started_at)->setTimezone($timezone)->dayOfWeek;
                    $idx = $dow === 0 ? 6 : $dow - 1;
                    $buckets[$idx] += $log->duration_seconds;
                }
                return array_map(
                    fn ($i) => ['label' => $days[$i], 'seconds' => $buckets[$i]],
                    range(0, 6)
                );

            case 'yearly':
                $months = ['1月', '2月', '3月', '4月', '5月', '6月', '7月', '8月', '9月', '10月', '11月', '12月'];
                $buckets = array_fill(0, 12, 0);
                foreach ($logs as $log) {
                    $month = Carbon::parse($log->started_at)->setTimezone($timezone)->month - 1;
                    $buckets[$month] += $log->duration_seconds;
                }
                return array_map(
                    fn ($i) => ['label' => $months[$i], 'seconds' => $buckets[$i]],
                    range(0, 11)
                );

            default: // monthly
                $daysInMonth = $start->daysInMonth;
                $buckets = array_fill(0, $daysInMonth + 1, 0);
                foreach ($logs as $log) {
                    $day = Carbon::parse($log->started_at)->setTimezone($timezone)->day;
                    if ($day >= 1 && $day <= $daysInMonth) {
                        $buckets[$day] += $log->duration_seconds;
                    }
                }
                return array_map(
                    fn ($d) => ['label' => (string) $d, 'seconds' => $buckets[$d]],
                    range(1, $daysInMonth)
                );
        }
    }

    private function heatmapData($user, Carbon $start, Carbon $end, string $timezone): array
    {
        $logs = $user->workLogs()
            ->whereBetween('started_at', [$start->copy()->utc(), $end->copy()->utc()])
            ->get(['started_at', 'duration_seconds']);

        $map = [];
        foreach ($logs as $log) {
            $date = Carbon::parse($log->started_at)->setTimezone($timezone)->format('Y-m-d');
            $map[$date] = ($map[$date] ?? 0) + $log->duration_seconds;
        }

        $result  = [];
        $current = $start->copy()->startOfDay();
        $endDate = $end->copy()->startOfDay();
        while ($current->lte($endDate)) {
            $date     = $current->format('Y-m-d');
            $result[] = ['date' => $date, 'seconds' => $map[$date] ?? 0];
            $current->addDay();
        }
        return $result;
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
