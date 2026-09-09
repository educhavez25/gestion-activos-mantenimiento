<?php

namespace App\Models;

use App\Enums\AssetStatus;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;

class Asset extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'code',
        'name',
        'description',
        'category_id',
        'location_id',
        'assigned_to',
        'status',
        'purchase_date',
        'warranty_expiration',
    ];

    public function maintenanceRecords(): HasMany
    {
        return $this->hasMany(MaintenanceRecord::class);
    }

    public function incidents(): HasMany
    {
        return $this->hasMany(Incident::class);
    }

    protected function casts(): array
    {
        return [
            'status' => AssetStatus::class,
            'purchase_date' => 'date',
            'warranty_expiration' => 'date',
        ];
    }

    public function category(): BelongsTo
    {
        return $this->belongsTo(Category::class);
    }

    public function location(): BelongsTo
    {
        return $this->belongsTo(Location::class);
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
        $query->when($filters['search'] ?? null, function (Builder $query, string $search) {
            $query->where(function (Builder $q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                    ->orWhere('code', 'like', "%{$search}%");
            });
        });

        $query->when($filters['status'] ?? null, function (Builder $query, string $status) {
            $query->where('status', $status);
        });

        $query->when($filters['category_id'] ?? null, function (Builder $query, mixed $categoryId) {
            $query->where('category_id', $categoryId);
        });

        $query->when($filters['location_id'] ?? null, function (Builder $query, mixed $locationId) {
            $query->where('location_id', $locationId);
        });

        $query->when($filters['assigned_to'] ?? null, function (Builder $query, mixed $assignedTo) {
            $query->where('assigned_to', $assignedTo);
        });

        // Ordenamiento seguro con lista blanca
        $allowedSorts = ['id', 'name', 'code', 'status', 'created_at', 'purchase_date'];
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
