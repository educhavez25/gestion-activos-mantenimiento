<?php

namespace App\Enums;

enum AssetStatus: string
{
    case Available = 'available';
    case Assigned = 'assigned';
    case InMaintenance = 'in_maintenance';
    case Retired = 'retired';

    public function label(): string
    {
        return match ($this) {
            self::Available => 'Disponible',
            self::Assigned => 'Asignado',
            self::InMaintenance => 'En mantenimiento',
            self::Retired => 'Dado de baja',
        };
    }
}
