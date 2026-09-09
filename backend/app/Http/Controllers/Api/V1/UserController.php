<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Resources\V1\RoleResource;
use App\Http\Resources\V1\UserResource;
use App\Models\Role;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;

class UserController extends Controller
{
    public function index(Request $request): AnonymousResourceCollection
    {
        $query = User::with('role');

        $query->when($request->query('role'), function ($q, $roleSlug) {
            $q->whereHas('role', function ($roleQuery) use ($roleSlug) {
                $roleQuery->where('slug', $roleSlug);
            });
        });

        $query->when($request->query('search'), function ($q, $search) {
            $q->where(function ($subQ) use ($search) {
                $subQ->where('name', 'like', "%{$search}%")
                    ->orWhere('email', 'like', "%{$search}%");
            });
        });

        return UserResource::collection($query->orderBy('name')->get());
    }

    public function roles(): AnonymousResourceCollection
    {
        return RoleResource::collection(Role::all());
    }
}
