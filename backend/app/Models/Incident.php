<?php

namespace App\Models;

use App\Enums\IncidentSeverity;
use App\Enums\IncidentStatus;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Incident extends Model
{
    use HasFactory;

    protected $fillable = [
        'asset_id',
        'reported_by',
        'assigned_to',
        'severity',
        'status',
        'description',
        'resolution_notes',
        'resolved_at',
    ];

    protected function casts(): array
    {
        return [
            'severity' => IncidentSeverity::class,
            'status' => IncidentStatus::class,
            'resolved_at' => 'datetime',
        ];
    }

    public function asset(): BelongsTo
    {
        return $this->belongsTo(Asset::class);
    }

    public function reporter(): BelongsTo
    {
        return $this->belongsTo(User::class, 'reported_by');
    }

    public function assignee(): BelongsTo
    {
        return $this->belongsTo(User::class, 'assigned_to');
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

        $query->when($filters['severity'] ?? null, function (Builder $query, string $severity) {
            $query->where('severity', $severity);
        });

        $query->when($filters['asset_id'] ?? null, function (Builder $query, mixed $assetId) {
            $query->where('asset_id', $assetId);
        });

        $query->when($filters['reported_by'] ?? null, function (Builder $query, mixed $reportedBy) {
            $query->where('reported_by', $reportedBy);
        });

        $query->when($filters['assigned_to'] ?? null, function (Builder $query, mixed $assignedTo) {
            $query->where('assigned_to', $assignedTo);
        });

        $query->when($filters['search'] ?? null, function (Builder $query, string $search) {
            $query->where('description', 'like', "%{$search}%");
        });

        $allowedSorts = ['id', 'severity', 'status', 'created_at', 'resolved_at'];
        $sortParam = $filters['sort'] ?? '-created_at';
        $direction = str_starts_with((string) $sortParam, '-') ? 'desc' : 'asc';
        $sortField = ltrim((string) $sortParam, '-');

        if (in_array($sortField, $allowedSorts, true)) {
            $query->orderBy($sortField, $direction);
        } else {
            $query->orderBy('created_at', 'desc');
        }
    }
}
