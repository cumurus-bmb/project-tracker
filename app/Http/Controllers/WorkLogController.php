<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreWorkLogRequest;
use App\Http\Requests\UpdateWorkLogRequest;
use App\Models\Category;
use App\Models\WorkLog;
use Carbon\Carbon;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;

class WorkLogController extends Controller
{
    public function index(): Response
    {
        $user     = Auth::user();
        $timezone = $user->timezone ?? 'Asia/Tokyo';

        $workLogs = $user->workLogs()
            ->with('category')
            ->latest('started_at')
            ->paginate(100);

        // タイムゾーン考慮で日付グルーピング
        $grouped = $workLogs->getCollection()
            ->groupBy(fn ($log) => $log->started_at->setTimezone($timezone)->toDateString())
            ->map(fn ($logs, $date) => [
                'date'          => $date,
                'total_seconds' => $logs->sum('duration_seconds'),
                'logs'          => $logs->map(fn ($log) => [
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
                ])->values(),
            ])->values();

        $categories = Category::where('user_id', $user->id)
            ->orderBy('is_favorite', 'desc')
            ->orderBy('name')
            ->get(['id', 'name', 'color', 'is_favorite']);

        return Inertia::render('WorkLogs/Index', [
            'grouped'    => $grouped,
            'categories' => $categories,
            'timezone'   => $timezone,
        ]);
    }

    public function store(StoreWorkLogRequest $request): RedirectResponse
    {
        $user     = Auth::user();
        $timezone = $user->timezone ?? 'Asia/Tokyo';

        $segments = $this->splitAcrossMidnights(
            array_merge($request->validated(), ['user_id' => $user->id]),
            $timezone
        );

        foreach ($segments as $segment) {
            WorkLog::create($segment);
        }

        $message = count($segments) > 1
            ? '作業を記録しました（日付をまたいだため ' . count($segments) . '件に分割されました）'
            : '作業を記録しました';

        return redirect()->route('dashboard')
            ->with('flash', ['message' => $message]);
    }

    public function update(UpdateWorkLogRequest $request, WorkLog $workLog): RedirectResponse
    {
        abort_if($workLog->user_id !== Auth::id(), 403);

        $user     = Auth::user();
        $timezone = $user->timezone ?? 'Asia/Tokyo';

        $segments = $this->splitAcrossMidnights(
            array_merge($request->validated(), ['user_id' => $workLog->user_id]),
            $timezone
        );

        if (count($segments) === 1) {
            $workLog->update($segments[0]);

            return back()->with('flash', ['message' => '作業記録を更新しました']);
        }

        // 分割が発生した場合: 元レコードを削除してから新規作成
        DB::transaction(function () use ($workLog, $segments) {
            $workLog->delete();
            foreach ($segments as $segment) {
                WorkLog::create($segment);
            }
        });

        return back()->with('flash', [
            'message' => '作業記録を更新しました（日付をまたいだため ' . count($segments) . '件に分割されました）',
        ]);
    }

    public function destroy(WorkLog $workLog): RedirectResponse
    {
        abort_if($workLog->user_id !== Auth::id(), 403);

        $workLog->delete();

        return back()->with('flash', ['message' => '作業記録を削除しました']);
    }

    /**
     * ユーザーのタイムゾーンの深夜0時境界で作業記録を分割する。
     * 日付をまたがない場合はそのまま1件の配列を返す。
     */
    private function splitAcrossMidnights(array $data, string $timezone): array
    {
        $start = Carbon::parse($data['started_at'])->setTimezone($timezone);
        $end   = Carbon::parse($data['ended_at'])->setTimezone($timezone);

        $segments = [];
        $cursor   = $start->copy();

        while (true) {
            // ユーザーTZにおける次の深夜0時
            $nextMidnight = $cursor->copy()->startOfDay()->addDay();

            if ($nextMidnight->greaterThanOrEqualTo($end)) {
                // 最終セグメント（分割不要 or 最後の区間）
                $segStart = $cursor->copy()->utc();
                $segEnd   = $end->copy()->utc();
                $segments[] = array_merge($data, [
                    'started_at'       => $segStart->toISOString(),
                    'ended_at'         => $segEnd->toISOString(),
                    'duration_seconds' => (int) ($segEnd->getTimestamp() - $segStart->getTimestamp()),
                ]);
                break;
            }

            // 深夜0時をまたぐ区間
            $segStart = $cursor->copy()->utc();
            $segEnd   = $nextMidnight->copy()->utc();
            $segments[] = array_merge($data, [
                'started_at'       => $segStart->toISOString(),
                'ended_at'         => $segEnd->toISOString(),
                'duration_seconds' => (int) ($segEnd->getTimestamp() - $segStart->getTimestamp()),
            ]);

            $cursor = $nextMidnight;
        }

        return $segments;
    }
}
