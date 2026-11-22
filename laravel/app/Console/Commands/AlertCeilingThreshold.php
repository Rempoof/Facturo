<?php

namespace App\Console\Commands;

use App\Enums\CeilingZone;
use App\Models\Organization;
use App\Services\CeilingTracker;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Mail;

class AlertCeilingThreshold extends Command
{
    protected $signature = 'facturo:ceiling-alert';

    protected $description = "Notifie l'auto-entrepreneur dès 60 % puis 85 % du plafond annuel atteint";

    public function handle(CeilingTracker $tracker): int
    {
        Organization::query()->each(function (Organization $organization) use ($tracker) {
            $ceiling = $tracker->forOrganization($organization)['ceiling'];

            if ($ceiling['percent'] < 60) {
                return;
            }

            $zone = CeilingZone::fromPercent($ceiling['percent']);
            Mail::raw(
                "Votre chiffre d'affaires encaissé atteint {$ceiling['percent']} % du plafond ({$ceiling['collected_mad']} MAD sur {$ceiling['ceiling_mad']} MAD). Zone : {$zone->label()}.",
                fn ($message) => $message->to($organization->email)->subject('Facturo — surveillance du plafond annuel'),
            );
        });

        return self::SUCCESS;
    }
}
