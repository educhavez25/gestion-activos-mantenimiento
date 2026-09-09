<?php

namespace App\Http\Requests\V1\Assets;

use App\Enums\AssetStatus;
use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;
use Illuminate\Validation\Rules\Enum;

class UpdateAssetRequest extends FormRequest
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
        $asset = $this->route('asset');
        $assetId = is_object($asset) ? $asset->id : $asset;

        return [
            'code' => ['required', 'string', 'max:50', Rule::unique('assets', 'code')->ignore($assetId)],
            'name' => ['required', 'string', 'max:255'],
            'description' => ['nullable', 'string'],
            'category_id' => ['required', 'integer', 'exists:categories,id'],
            'location_id' => ['required', 'integer', 'exists:locations,id'],
            'assigned_to' => ['nullable', 'integer', 'exists:users,id'],
            'status' => ['required', new Enum(AssetStatus::class)],
            'purchase_date' => ['nullable', 'date'],
            'warranty_expiration' => ['nullable', 'date', 'after_or_equal:purchase_date'],
        ];
    }
}
