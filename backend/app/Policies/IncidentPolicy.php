<?php

namespace App\Policies;

use App\Models\Incident;
use App\Models\User;

class IncidentPolicy
{
    public function viewAny(User $user): bool
    {
        return true;
    }

    public function view(User $user, Incident $incident): bool
    {
        return $user->hasRole('supervisor')
            || $incident->reported_by === $user->id
            || $incident->assigned_to === $user->id;
    }

    public function create(User $user): bool
    {
        return true;
    }

    public function updateStatus(User $user, Incident $incident): bool
    {
        return $user->hasRole('supervisor')
            || ($user->hasRole('tecnico') && $incident->assigned_to === $user->id);
    }

    public function reassign(User $user, Incident $incident): bool
    {
        return $user->hasRole('supervisor');
    }

    public function delete(User $user, Incident $incident): bool
    {
        return false;
    }
}
