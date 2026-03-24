<?php

use App\Http\Controllers\CategoryController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\ExportController;
use App\Http\Controllers\ProfileController;
use App\Http\Controllers\SubscriptionController;
use App\Http\Controllers\WorkLogController;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::get('/', function () {
    return Inertia::render('Welcome');
});

Route::get('/dashboard', [DashboardController::class, 'index'])
    ->middleware(['auth', 'verified'])
    ->name('dashboard');

Route::middleware(['auth', 'verified'])->group(function () {
    Route::resource('categories', CategoryController::class)->except(['show']);
    Route::resource('work-logs', WorkLogController::class)->except(['show', 'create', 'edit']);
    Route::get('/export', [ExportController::class, 'export'])->name('export');
    Route::post('/subscribe/{plan}', [SubscriptionController::class, 'checkout'])->name('subscribe');
    Route::get('/billing', [SubscriptionController::class, 'billingPortal'])->name('billing');
});

Route::get('/pricing', [SubscriptionController::class, 'pricing'])->name('pricing');

Route::middleware('auth')->group(function () {
    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');
});

require __DIR__.'/auth.php';
