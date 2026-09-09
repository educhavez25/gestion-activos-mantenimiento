<?php

namespace App\Http\Requests\V1\Incidents;

use App\Enums\IncidentSeverity;
use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rules\Enum;

class StoreIncidentRequest extends FormRequest
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
            'asset_id' => ['required', 'integer', 'exists:assets,id'],
            'severity' => ['required', new Enum(IncidentSeverity::class)],
            'description' => ['required', 'string', 'min:5', 'max:2000'],
            'assigned_to' => ['nullable', 'integer', 'exists:users,id'],
        ];
    }
}
