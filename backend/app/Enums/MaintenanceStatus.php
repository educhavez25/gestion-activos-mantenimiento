<?php

namespace App\Enums;

enum MaintenanceStatus: string
{
    case Scheduled = 'scheduled';
    case InProgress = 'in_progress';
    case Completed = 'completed';
    case Cancelled = 'cancelled';

    public function label(): string
    {
        return match ($this) {
            self::Scheduled => 'Programado',
            self::InProgress => 'En progreso',
            self::Completed => 'Completado',
            self::Cancelled => 'Cancelado',
        };
    }

    public function isActive(): bool
    {
        return in_array($this, [self::Scheduled, self::InProgress]);
    }
}
