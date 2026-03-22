<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreCategoryRequest;
use App\Http\Requests\UpdateCategoryRequest;
use App\Models\Category;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use Inertia\Response;

class CategoryController extends Controller
{
    public function index(): Response
    {
        $categories = Category::where('user_id', Auth::id())
            ->orderBy('is_favorite', 'desc')
            ->orderBy('name')
            ->get();

        return Inertia::render('Categories/Index', [
            'categories' => $categories,
        ]);
    }

    public function store(StoreCategoryRequest $request): RedirectResponse
    {
        Category::create([
            ...$request->validated(),
            'user_id' => Auth::id(),
        ]);

        return redirect()->route('categories.index')
            ->with('flash', ['message' => 'カテゴリを作成しました']);
    }

    public function update(UpdateCategoryRequest $request, Category $category): RedirectResponse
    {
        abort_if($category->user_id !== Auth::id(), 403);

        $category->update($request->validated());

        return redirect()->route('categories.index')
            ->with('flash', ['message' => 'カテゴリを更新しました']);
    }

    public function destroy(Category $category): RedirectResponse
    {
        abort_if($category->user_id !== Auth::id(), 403);

        $category->delete();

        return redirect()->route('categories.index')
            ->with('flash', ['message' => 'カテゴリを削除しました']);
    }
}
