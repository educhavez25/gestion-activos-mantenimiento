<?php

namespace App\Providers;

use Illuminate\Cache\RateLimiting\Limit;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Gate;
use Illuminate\Support\Facades\RateLimiter;
use Illuminate\Support\ServiceProvider;

class AppServiceProvider extends ServiceProvider
{
    public function register(): void
    {
        //
    }

    public function boot(): void
    {
        Gate::before(function ($user, string $ability) {
            return $user->isAdmin() ? true : null;
        });

        // Rate limiter para endpoints de autenticación (fuerza bruta / credential stuffing)
        RateLimiter::for('auth', function (Request $request) {
            $key = (string) ($request->input('email') ?: $request->ip());
            return Limit::perMinute(5)->by($key . '|' . $request->ip());
        });

        // Rate limiter para endpoints generales de la API (DoS / scraping)
        RateLimiter::for('api', function (Request $request) {
            return Limit::perMinute(60)->by($request->user()?->id ?: $request->ip());
        });
    }
}
