<?php

namespace App\Models;

use App\Enums\MaintenanceStatus;
use App\Enums\MaintenanceType;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class MaintenanceRecord extends Model
{
    use HasFactory;

    protected $fillable = [
        'asset_id',
        'type',
        'status',
        'scheduled_date',
        'completed_date',
        'performed_by',
        'description',
        'cost',
    ];

    protected function casts(): array
    {
        return [
            'type' => MaintenanceType::class,
            'status' => MaintenanceStatus::class,
            'scheduled_date' => 'date',
            'completed_date' => 'date',
            'cost' => 'decimal:2',
        ];
    }

    public function asset(): BelongsTo
    {
        return $this->belongsTo(Asset::class);
    }

    public function performedBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'performed_by');
    }

    /**
     * Scope a query to apply dynamic filters.
     *
     * @param  array<string, mixed>  $filters
     */
    public function scopeFilter(Builder $query, array $filters): void
    {
        $query->when($filters['status'] ?? null, function (Builder $query, string $status) {
            $query->where('status', $status);
        });

        $query->when($filters['type'] ?? null, function (Builder $query, string $type) {
            $query->where('type', $type);
        });

        $query->when($filters['asset_id'] ?? null, function (Builder $query, mixed $assetId) {
            $query->where('asset_id', $assetId);
        });

        $query->when($filters['performed_by'] ?? null, function (Builder $query, mixed $performedBy) {
            $query->where('performed_by', $performedBy);
        });

        $query->when($filters['scheduled_from'] ?? null, function (Builder $query, string $from) {
            $query->whereDate('scheduled_date', '>=', $from);
        });

        $query->when($filters['scheduled_to'] ?? null, function (Builder $query, string $to) {
            $query->whereDate('scheduled_date', '<=', $to);
        });

        $allowedSorts = ['id', 'scheduled_date', 'completed_date', 'cost', 'created_at'];
        $sortParam = $filters['sort'] ?? '-scheduled_date';
        $direction = str_starts_with((string) $sortParam, '-') ? 'desc' : 'asc';
        $sortField = ltrim((string) $sortParam, '-');

        if (in_array($sortField, $allowedSorts, true)) {
            $query->orderBy($sortField, $direction);
        } else {
            $query->orderBy('scheduled_date', 'desc');
        }
    }
}
