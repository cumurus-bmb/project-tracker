<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Support\Facades\Auth;

class UpdateCategoryRequest extends FormRequest
{
    public function authorize(): bool
    {
        return Auth::check();
    }

    public function rules(): array
    {
        return [
            'name'        => ['required', 'string', 'max:50'],
            'color'       => ['required', 'string', 'regex:/^#[0-9A-Fa-f]{6}$/'],
            'is_favorite' => ['boolean'],
        ];
    }
}
