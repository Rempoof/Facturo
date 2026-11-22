<?php

namespace App\Providers;

use Illuminate\Support\Facades\Gate;
use Laravel\Horizon\Horizon;
use Laravel\Horizon\HorizonApplicationServiceProvider;

class HorizonServiceProvider extends HorizonApplicationServiceProvider
{
    public function boot(): void
    {
        parent::boot();

        // Only organisation owners may open the Horizon dashboard.
        Horizon::auth(fn ($request) => Gate::check('viewHorizon', [$request->user()]));
    }
}
