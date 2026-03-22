<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Support\Facades\Auth;
use Illuminate\Validation\Rule;

class UpdateWorkLogRequest extends FormRequest
{
    public function authorize(): bool
    {
        return Auth::check();
    }

    public function rules(): array
    {
        return [
            'category_id'      => ['required', 'integer', Rule::exists('categories', 'id')->where('user_id', Auth::id())],
            'started_at'       => ['required', 'date'],
            'ended_at'         => ['required', 'date', 'after:started_at'],
            'duration_seconds' => ['required', 'integer', 'min:1'],
            'memo'             => ['nullable', 'string', 'max:500'],
        ];
    }

    public function messages(): array
    {
        return [
            'category_id.required' => 'カテゴリを選択してください',
            'category_id.exists'   => '無効なカテゴリです',
            'started_at.required'  => '開始時刻は必須です',
            'ended_at.after'       => '終了時刻は開始時刻より後にしてください',
            'duration_seconds.min' => '作業時間が短すぎます',
        ];
    }
}
