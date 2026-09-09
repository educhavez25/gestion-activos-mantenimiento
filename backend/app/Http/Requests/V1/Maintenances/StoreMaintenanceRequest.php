<?php

namespace App\Http\Requests\V1\Maintenances;

use App\Enums\MaintenanceStatus;
use App\Enums\MaintenanceType;
use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rules\Enum;

class StoreMaintenanceRequest extends FormRequest
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
            'type' => ['required', new Enum(MaintenanceType::class)],
            'status' => ['nullable', new Enum(MaintenanceStatus::class)],
            'scheduled_date' => ['required', 'date'],
            'performed_by' => ['nullable', 'integer', 'exists:users,id'],
            'description' => ['required', 'string', 'min:5', 'max:2000'],
            'cost' => ['nullable', 'numeric', 'min:0'],
        ];
    }
}
