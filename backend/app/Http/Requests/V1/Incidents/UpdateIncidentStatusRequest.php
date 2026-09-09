<?php

namespace App\Http\Requests\V1\Incidents;

use App\Enums\IncidentStatus;
use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rules\Enum;

class UpdateIncidentStatusRequest extends FormRequest
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
            'status' => ['required', new Enum(IncidentStatus::class)],
            'resolution_notes' => ['nullable', 'string', 'max:2000', 'required_if:status,'.IncidentStatus::Resolved->value],
        ];
    }
}
