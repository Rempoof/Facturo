<?php

use Illuminate\Support\Facades\Schedule;

Schedule::command('facturo:ceiling-alert')->dailyAt('08:30')->timezone('Africa/Casablanca');

// Overdue invoices are flagged every night so the dashboard action queue and
// reminder e-mails stay accurate without a manual refresh.
Schedule::call(function () {
    \App\Models\Document::query()
        ->where('is_locked', true)
        ->whereIn('type', ['facture', 'acompte'])
        ->whereIn('status', ['sent', 'pending'])
        ->whereDate('due_date', '<', now()->toDateString())
        ->update(['status' => 'overdue']);
})->dailyAt('00:15');

Schedule::command('horizon:snapshot')->everyFiveMinutes();
