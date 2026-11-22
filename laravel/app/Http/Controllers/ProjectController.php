<?php

namespace App\Http\Controllers;

use App\Enums\Currency;
use App\Models\Organization;
use App\Models\Project;
use App\Models\ProjectTask;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class ProjectController extends Controller
{
    public function index(Organization $organization): Response
    {
        return Inertia::render('Projects/Index', [
            'projects' => $organization->projects()->with(['client', 'tasks'])->latest()->get(),
            'clients' => $organization->clients()->orderBy('name')->get(['id', 'name', 'country_code']),
            'services' => $organization->services()->orderBy('code')->get(),
            'rates' => collect(Currency::cases())->mapWithKeys(fn ($c) => [$c->value => $c->defaultRateToMad()]),
        ]);
    }

    public function toggleTask(Organization $organization, Project $project, ProjectTask $task): RedirectResponse
    {
        abort_unless($project->organization_id === $organization->id && $task->project_id === $project->id, 404);

        $task->forceFill([
            'completed_at' => $task->completed_at === null ? now() : null,
        ])->save();

        return back();
    }
}
