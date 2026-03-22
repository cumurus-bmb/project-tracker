<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreWorkLogRequest;
use App\Http\Requests\UpdateWorkLogRequest;
use App\Models\Category;
use App\Models\WorkLog;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\Auth;
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
        WorkLog::create([
            ...$request->validated(),
            'user_id' => Auth::id(),
        ]);

        return redirect()->route('dashboard')
            ->with('flash', ['message' => '作業を記録しました']);
    }

    public function update(UpdateWorkLogRequest $request, WorkLog $workLog): RedirectResponse
    {
        abort_if($workLog->user_id !== Auth::id(), 403);

        $workLog->update($request->validated());

        return back()->with('flash', ['message' => '作業記録を更新しました']);
    }

    public function destroy(WorkLog $workLog): RedirectResponse
    {
        abort_if($workLog->user_id !== Auth::id(), 403);

        $workLog->delete();

        return back()->with('flash', ['message' => '作業記録を削除しました']);
    }
}
