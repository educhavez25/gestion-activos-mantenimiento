<?php

namespace App\Http\Requests\V1\Locations;

use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;

class StoreLocationRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return true;
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'name' => ['required', 'string', 'max:100', 'unique:locations,name'],
            'description' => ['nullable', 'string', 'max:500'],
            'parent_location_id' => ['nullable', 'integer', 'exists:locations,id'],
        ];
    }
}
