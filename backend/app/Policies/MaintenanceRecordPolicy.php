<?php

namespace App\Policies;

use App\Models\MaintenanceRecord;
use App\Models\User;

class MaintenanceRecordPolicy
{
    public function viewAny(User $user): bool
    {
        return true;
    }

    public function view(User $user, MaintenanceRecord $maintenance): bool
    {
        return $user->hasRole('supervisor')
            || $user->isAdmin()
            || $maintenance->performed_by === $user->id;
    }

    public function create(User $user): bool
    {
        return $user->hasRole('supervisor');
    }

    public function update(User $user, MaintenanceRecord $maintenance): bool
    {
        return $user->hasRole('supervisor')
            || ($user->hasRole('tecnico') && $maintenance->performed_by === $user->id);
    }

    public function delete(User $user, MaintenanceRecord $maintenance): bool
    {
        return $user->hasRole('supervisor');
    }
}
