<?php

use App\Http\Controllers\ClientController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\DeclarationController;
use App\Http\Controllers\DocumentController;
use App\Http\Controllers\OrganizationController;
use App\Http\Controllers\PaymentController;
use App\Http\Controllers\ProjectController;
use App\Http\Controllers\SettingsController;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::get('/', function () {
    return auth()->check() && auth()->user()->currentOrganization
        ? redirect()->route('dashboard', ['organization' => auth()->user()->currentOrganization->slug])
        : redirect()->route('login');
})->name('home');

Route::middleware(['auth', 'verified', 'org'])
    ->prefix('{organization:slug}')
    ->group(function () {
        Route::get('/', DashboardController::class)->name('dashboard');

        Route::get('documents', [DocumentController::class, 'index'])->name('documents.index');
        Route::get('documents/create', [DocumentController::class, 'create'])->name('documents.create');
        Route::post('documents', [DocumentController::class, 'store'])->name('documents.store');
        Route::get('documents/{document}', [DocumentController::class, 'show'])->name('documents.show');
        Route::post('documents/{document}/issue', [DocumentController::class, 'issue'])->name('documents.issue');
        Route::post('documents/{document}/convert', [DocumentController::class, 'convert'])->name('documents.convert');
        Route::get('documents/{document}/pdf', [DocumentController::class, 'pdf'])->name('documents.pdf');

        Route::post('documents/{document}/payments', [PaymentController::class, 'store'])->name('payments.store');
        Route::get('payments', [PaymentController::class, 'index'])->name('payments.index');

        Route::get('clients', [ClientController::class, 'index'])->name('clients.index');
        Route::post('clients', [ClientController::class, 'store'])->name('clients.store');
        Route::put('clients/{client}', [ClientController::class, 'update'])->name('clients.update');

        Route::get('projects', [ProjectController::class, 'index'])->name('projects.index');
        Route::patch('projects/{project}/tasks/{task}', [ProjectController::class, 'toggleTask'])->name('projects.tasks.toggle');

        Route::get('declarations', [DeclarationController::class, 'index'])->name('declarations.index');

        Route::get('settings', [SettingsController::class, 'edit'])->name('settings.edit');
        Route::put('settings', [SettingsController::class, 'update'])->name('settings.update');

        Route::post('members/invite', [OrganizationController::class, 'invite'])->name('members.invite');
    });

Route::middleware(['auth'])->group(function () {
    Route::post('organizations', [OrganizationController::class, 'store'])->name('organizations.store');
    Route::post('organizations/{organization:slug}/switch', [OrganizationController::class, 'switch'])->name('organizations.switch');
});

Route::get('invitations/{token}', function (string $token) {
    $invitation = \App\Models\OrganizationInvitation::where('token', $token)->firstOrFail();
    abort_if($invitation->isExpired() || $invitation->accepted_at !== null, 410, 'Invitation expirée.');

    if (auth()->check()) {
        $invitation->organization->users()->syncWithoutDetaching([
            auth()->id() => ['role' => $invitation->role],
        ]);
        $invitation->update(['accepted_at' => now()]);
        auth()->user()->switchOrganization($invitation->organization);

        return redirect()->route('dashboard', ['organization' => $invitation->organization->slug]);
    }

    return redirect()->route('register', ['invitation' => $token, 'email' => $invitation->email]);
})->name('invitations.accept');
