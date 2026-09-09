<?php

namespace App\Enums;

enum IncidentStatus: string
{
    case Open = 'open';
    case Assigned = 'assigned';
    case InProgress = 'in_progress';
    case Resolved = 'resolved';
    case Closed = 'closed';

    public function label(): string
    {
        return match ($this) {
            self::Open => 'Abierta',
            self::Assigned => 'Asignada',
            self::InProgress => 'En progreso',
            self::Resolved => 'Resuelta',
            self::Closed => 'Cerrada',
        };
    }
}
