<?php

namespace App\Services;

use App\Enums\CeilingZone;
use App\Models\Document;
use App\Models\Organization;
use App\Models\Project;
use Carbon\CarbonImmutable;
use Illuminate\Support\Collection;

/**
 * Computes the "Bonjour [Prénom], voici ce qui compte aujourd'hui" dashboard
 * payload: ceiling gauge, cashflow, billing cycle, action queue, declarations,
 * deadlines, monthly collections and currency origin.
 */
class CeilingTracker
{
    public function forOrganization(Organization $organization, ?CarbonImmutable $today = null): array
    {
        $today ??= CarbonImmutable::now();
        $year = $today->year;
        $ceiling = (float) $organization->annual_ceiling_mad;

        $payments = $organization->payments()->whereYear('received_on', $year)->get();
        $collected = round((float) $payments->sum('amount_received_mad'), 2);
        $percent = $ceiling > 0 ? round(($collected / $ceiling) * 100, 1) : 0.0;
        $zone = CeilingZone::fromPercent($percent);
        $remaining = max(0, round($ceiling - $collected, 2));

        $monthsElapsed = max(1, $today->month);
        $runRate = round($collected / $monthsElapsed, 2);
        $monthsToCeiling = $runRate > 0 ? $remaining / $runRate : null;
        $projection = $monthsToCeiling === null
            ? null
            : $today->addMonths((int) ceil($monthsToCeiling))->locale('fr')->isoFormat('MMMM YYYY');

        $documents = $organization->documents()->with('client')->get();
        $toCollectDocs = $documents->filter(fn (Document $d) => $d->is_locked
            && $d->type->isInvoice()
            && in_array($d->status->value, ['sent', 'pending', 'overdue'], true));

        $devis = $documents->filter(fn (Document $d) => $d->type->isQuote() && $d->is_locked);
        $accepted = $documents->filter(fn (Document $d) => $d->type->isQuote() && $d->status->value === 'accepted');
        $issued = $documents->filter(fn (Document $d) => $d->is_locked && $d->type->isInvoice());
        $paidThisMonth = $payments->filter(fn ($p) => $p->received_on->isSameMonth($today));

        $unbilledTasks = $organization->projects()
            ->with(['tasks' => fn ($q) => $q->whereNotNull('completed_at')->whereNull('billed_document_id'), 'client'])
            ->get()
            ->filter(fn (Project $p) => $p->tasks->isNotEmpty())
            ->values();

        $unbilledMad = round($unbilledTasks->sum(fn (Project $p) => $p->tasks->sum(fn ($t) => $t->total())), 2);
        $acceptedMad = round($accepted->sum(fn (Document $d) => (float) $d->indicative_mad_amount), 2);

        return [
            'today' => $today->locale('fr')->isoFormat('dddd D MMMM YYYY'),
            'ceiling' => [
                'collected_mad' => $collected,
                'ceiling_mad' => $ceiling,
                'percent' => $percent,
                'remaining_mad' => $remaining,
                'zone' => ['key' => $zone->value, 'label' => $zone->label(), 'range' => $zone->range(), 'color' => $zone->color()],
                'run_rate_mad' => $runRate,
                'projection' => $projection,
                'activity_label' => $organization->activity_category === 'commercial' ? 'commerce' : 'services',
            ],
            'cashflow' => [
                'to_collect_mad' => round($toCollectDocs->sum(fn (Document $d) => (float) $d->indicative_mad_amount), 2),
                'to_collect_count' => $toCollectDocs->count(),
                'overdue_count' => $documents->where('status.value', 'overdue')->count(),
                'to_invoice_mad' => round($acceptedMad + $unbilledMad, 2),
                'accepted_count' => $accepted->count(),
                'unbilled_tasks_count' => $unbilledTasks->sum(fn (Project $p) => $p->tasks->count()),
            ],
            'cycle' => [
                'quotes_sent' => ['count' => $devis->count(), 'amount_mad' => round($devis->sum(fn ($d) => (float) $d->indicative_mad_amount), 2)],
                'accepted' => ['count' => $accepted->count(), 'amount_mad' => $acceptedMad],
                'invoiced' => ['count' => $issued->count(), 'amount_mad' => round($issued->sum(fn ($d) => (float) $d->indicative_mad_amount), 2)],
                'paid_month' => ['count' => $paidThisMonth->count(), 'amount_mad' => round((float) $paidThisMonth->sum('amount_received_mad'), 2)],
            ],
            'actions' => $this->actions($documents, $accepted, $unbilledTasks, $today),
            'declaration' => $this->declaration($payments, $today, $organization),
            'deadlines' => $this->deadlines($documents, $today),
            'monthly' => $this->monthly($payments, $today),
            'origin' => $this->origin($payments),
        ];
    }

    private function actions(Collection $documents, Collection $accepted, Collection $unbilled, CarbonImmutable $today): array
    {
        $actions = [];

        if ($overdue = $documents->firstWhere('status.value', 'overdue')) {
            $actions[] = [
                'id' => "overdue-{$overdue->id}", 'tone' => 'red',
                'title' => "{$overdue->number} · {$overdue->client->name}",
                'meta' => sprintf('En retard de %d jours · %s %s', $today->diffInDays($overdue->due_date), number_format((float) $overdue->total_amount, 2, ',', ' '), $overdue->currency->value),
                'cta' => 'Relancer', 'kind' => 'remind', 'document_id' => $overdue->id,
            ];
        }

        if ($quote = $accepted->first()) {
            $actions[] = [
                'id' => "accepted-{$quote->id}", 'tone' => 'blue', 'primary' => true,
                'title' => "{$quote->number} accepté · {$quote->client->name}",
                'meta' => sprintf('%s MAD prêts à facturer', number_format((float) $quote->indicative_mad_amount, 0, ',', ' ')),
                'cta' => 'Convertir en facture', 'kind' => 'convert', 'document_id' => $quote->id,
            ];
        }

        if ($expired = $documents->first(fn (Document $d) => $d->type->isQuote() && $d->status->value === 'pending' && $d->due_date?->isPast())) {
            $actions[] = [
                'id' => "expired-{$expired->id}", 'tone' => 'amber',
                'title' => "{$expired->number} · validité dépassée",
                'meta' => sprintf('%s · %s MAD · sans réponse', $expired->client->name, number_format((float) $expired->indicative_mad_amount, 0, ',', ' ')),
                'cta' => 'Relancer', 'kind' => 'remind', 'document_id' => $expired->id,
            ];
        }

        if ($project = $unbilled->first()) {
            $tasks = $project->tasks->count();
            $actions[] = [
                'id' => "project-{$project->id}", 'tone' => 'amber',
                'title' => "Mission « {$project->name} » · {$project->client?->name}",
                'meta' => sprintf('%d tâche%s terminée%s, non facturée%s · %s MAD', $tasks, $tasks > 1 ? 's' : '', $tasks > 1 ? 's' : '', $tasks > 1 ? 's' : '', number_format((float) $project->tasks->sum(fn ($t) => $t->total()), 0, ',', ' ')),
                'cta' => 'Créer la facture', 'kind' => 'invoice_project', 'project_id' => $project->id,
            ];
        }

        if ($waiting = $documents->first(fn (Document $d) => $d->type->isInvoice() && $d->status->value === 'sent')) {
            $actions[] = [
                'id' => "payment-{$waiting->id}", 'tone' => 'green',
                'title' => "Règlement attendu · {$waiting->number}",
                'meta' => sprintf('%s %s · saisir le montant reçu en MAD', number_format((float) $waiting->total_amount, 2, ',', ' '), $waiting->currency->value),
                'cta' => 'Enregistrer', 'kind' => 'record_payment', 'document_id' => $waiting->id,
            ];
        }

        return array_slice($actions, 0, 5);
    }

    private function declaration(Collection $payments, CarbonImmutable $today, Organization $organization): array
    {
        $quarter = (int) ceil($today->month / 3);
        $start = $today->startOfQuarter();
        $total = round((float) $payments->filter(fn ($p) => $p->received_on->greaterThanOrEqualTo($start))->sum('amount_received_mad'), 2);
        $rate = $organization->activity_category === 'commercial' ? 0.005 : 0.01;

        return [
            'label' => "T{$quarter} {$today->year}",
            'period_start' => $start->locale('fr')->isoFormat('D MMMM'),
            'total_mad' => $total,
            'contribution_rate' => null,
            'contribution_mad' => null,
            'rate_hint' => $rate * 100,
            'deadline' => null,
        ];
    }

    private function deadlines(Collection $documents, CarbonImmutable $today): array
    {
        return $documents
            ->filter(fn (Document $d) => $d->is_locked && $d->due_date?->greaterThanOrEqualTo($today)
                && in_array($d->status->value, ['sent', 'pending', 'accepted'], true))
            ->sortBy(fn (Document $d) => $d->due_date)
            ->take(3)
            ->map(fn (Document $d) => [
                'document_id' => $d->id,
                'day' => $d->due_date->format('d'),
                'month' => mb_strtoupper($d->due_date->locale('fr')->isoFormat('MMM')),
                'title' => $d->type->isQuote() ? "Fin de validité {$d->number}" : "Échéance de paiement {$d->number}",
                'client' => $d->client?->name,
            ])->values()->all();
    }

    private function monthly(Collection $payments, CarbonImmutable $today): array
    {
        $months = [];

        for ($i = 5; $i >= 0; $i--) {
            $month = $today->subMonths($i);
            $months[] = [
                'key' => $month->format('Y-m'),
                'label' => mb_strtolower($month->locale('fr')->isoFormat('MMM')),
                'total_mad' => round((float) $payments->filter(fn ($p) => $p->received_on->isSameMonth($month))->sum('amount_received_mad'), 2),
                'current' => $i === 0,
            ];
        }

        return $months;
    }

    private function origin(Collection $payments): array
    {
        $grand = (float) $payments->sum('amount_received_mad');

        return $payments->groupBy('currency')
            ->map(fn (Collection $group, string $currency) => [
                'currency' => $currency,
                'percent' => $grand > 0 ? (int) round(((float) $group->sum('amount_received_mad') / $grand) * 100) : 0,
            ])
            ->sortByDesc('percent')
            ->values()
            ->all();
    }
}
