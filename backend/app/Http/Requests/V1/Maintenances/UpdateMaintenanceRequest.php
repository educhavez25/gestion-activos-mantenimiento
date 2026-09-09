<?php

namespace App\Http\Requests\V1\Maintenances;

use App\Enums\MaintenanceStatus;
use App\Enums\MaintenanceType;
use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rules\Enum;

class UpdateMaintenanceRequest extends FormRequest
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
            'type' => ['required', new Enum(MaintenanceType::class)],
            'status' => ['required', new Enum(MaintenanceStatus::class)],
            'scheduled_date' => ['required', 'date'],
            'completed_date' => ['nullable', 'date', 'after_or_equal:scheduled_date', 'required_if:status,'.MaintenanceStatus::Completed->value],
            'performed_by' => ['nullable', 'integer', 'exists:users,id'],
            'description' => ['required', 'string', 'min:5', 'max:2000'],
            'cost' => ['nullable', 'numeric', 'min:0'],
        ];
    }
}
