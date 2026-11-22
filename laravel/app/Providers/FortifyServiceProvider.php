<?php

namespace App\Providers;

use Illuminate\Support\ServiceProvider;
use Inertia\Inertia;
use Laravel\Fortify\Fortify;

class FortifyServiceProvider extends ServiceProvider
{
    public function boot(): void
    {
        Fortify::loginView(fn () => Inertia::render('Auth/Login', [
            'canResetPassword' => true,
            'status' => session('status'),
        ]));

        Fortify::registerView(fn () => Inertia::render('Auth/Register', [
            'invitation' => request('invitation'),
            'email' => request('email'),
        ]));

        Fortify::requestPasswordResetLinkView(fn () => Inertia::render('Auth/ForgotPassword'));
        Fortify::resetPasswordView(fn ($request) => Inertia::render('Auth/ResetPassword', [
            'email' => $request->email,
            'token' => $request->route('token'),
        ]));
        Fortify::verifyEmailView(fn () => Inertia::render('Auth/VerifyEmail'));
        Fortify::confirmPasswordView(fn () => Inertia::render('Auth/ConfirmPassword'));

        Fortify::twoFactorChallengeView(fn () => Inertia::render('Auth/TwoFactorChallenge'));
    }
}
