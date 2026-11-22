<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('organizations', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('slug')->unique();
            $table->string('country_code', 2)->default('MA');
            $table->string('base_currency', 3)->default('MAD');
            $table->string('activity_category')->default('services'); // services|commercial
            $table->string('ice', 20)->nullable();
            $table->string('auto_entrepreneur_number')->nullable();
            $table->string('identifiant_fiscal')->nullable();
            $table->string('taxe_professionnelle')->nullable();
            $table->string('address')->nullable();
            $table->string('city')->nullable();
            $table->string('email')->nullable();
            $table->string('phone', 40)->nullable();
            $table->decimal('annual_ceiling_mad', 14, 2)->default(200000);
            $table->jsonb('bank_accounts')->default('[]');
            $table->jsonb('legal_mentions')->default('{}');
            $table->string('logo_path')->nullable();
            $table->string('signature_path')->nullable();
            $table->timestamps();
        });

        Schema::create('users', function (Blueprint $table) {
            $table->id();
            $table->foreignId('current_organization_id')->nullable()->constrained('organizations')->nullOnDelete();
            $table->string('name');
            $table->string('email')->unique();
            $table->timestamp('email_verified_at')->nullable();
            $table->string('password');
            $table->text('two_factor_secret')->nullable();
            $table->text('two_factor_recovery_codes')->nullable();
            $table->timestamp('two_factor_confirmed_at')->nullable();
            $table->string('locale', 5)->default('fr');
            $table->rememberToken();
            $table->timestamps();
        });

        Schema::create('organization_user', function (Blueprint $table) {
            $table->id();
            $table->foreignId('organization_id')->constrained()->cascadeOnDelete();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->string('role')->default('member'); // owner|admin|member|accountant
            $table->timestamps();
            $table->unique(['organization_id', 'user_id']);
        });

        Schema::create('organization_invitations', function (Blueprint $table) {
            $table->id();
            $table->foreignId('organization_id')->constrained()->cascadeOnDelete();
            $table->foreignId('invited_by')->nullable()->constrained('users')->nullOnDelete();
            $table->string('email');
            $table->string('role')->default('member');
            $table->string('token', 64)->unique();
            $table->timestamp('expires_at');
            $table->timestamp('accepted_at')->nullable();
            $table->timestamps();
        });

        Schema::create('clients', function (Blueprint $table) {
            $table->id();
            $table->foreignId('organization_id')->constrained()->cascadeOnDelete();
            $table->string('name');
            $table->string('contact_name')->nullable();
            $table->string('type')->default('company_ma'); // company_ma|company_intl|individual
            $table->string('country_code', 2)->default('MA');
            $table->string('city')->nullable();
            $table->string('address')->nullable();
            $table->string('email')->nullable();
            $table->string('tax_id')->nullable();
            $table->string('tax_id_label')->default('ICE');
            $table->string('preferred_language', 2)->default('FR');
            $table->string('default_currency', 3)->default('MAD');
            $table->text('notes')->nullable();
            $table->timestamps();
            $table->index(['organization_id', 'name']);
        });

        Schema::create('services', function (Blueprint $table) {
            $table->id();
            $table->foreignId('organization_id')->constrained()->cascadeOnDelete();
            $table->string('code');
            $table->string('title_fr');
            $table->string('title_en');
            $table->string('title_ar');
            $table->text('description')->nullable();
            $table->string('unit')->default('jour');
            $table->decimal('unit_price_mad', 14, 2);
            $table->string('category')->nullable();
            $table->timestamps();
            $table->index(['organization_id', 'code']);
        });

        Schema::create('projects', function (Blueprint $table) {
            $table->id();
            $table->foreignId('organization_id')->constrained()->cascadeOnDelete();
            $table->foreignId('client_id')->constrained()->cascadeOnDelete();
            $table->string('code');
            $table->string('name');
            $table->string('status')->default('active'); // active|proposal|completed
            $table->string('currency', 3)->default('MAD');
            $table->decimal('budget_amount', 14, 2)->default(0);
            $table->text('description')->nullable();
            $table->date('due_date')->nullable();
            $table->timestamps();
            $table->index(['organization_id', 'status']);
        });

        Schema::create('project_tasks', function (Blueprint $table) {
            $table->id();
            $table->foreignId('project_id')->constrained()->cascadeOnDelete();
            $table->string('title');
            $table->string('unit')->default('jour');
            $table->decimal('quantity', 10, 2)->default(1);
            $table->decimal('unit_price', 14, 2)->default(0);
            $table->timestamp('completed_at')->nullable();
            $table->foreignId('billed_document_id')->nullable()->constrained('documents')->nullOnDelete();
            $table->unsignedInteger('position')->default(0);
            $table->timestamps();
        });

        Schema::create('numbering_sequences', function (Blueprint $table) {
            $table->id();
            $table->foreignId('organization_id')->constrained()->cascadeOnDelete();
            $table->string('document_type', 12); // devis|proforma|facture|acompte|avoir
            $table->unsignedSmallInteger('year');
            $table->string('prefix', 8);
            $table->unsignedTinyInteger('padding')->default(4);
            $table->unsignedBigInteger('next_number')->default(1);
            $table->timestamps();
            $table->unique(['organization_id', 'document_type', 'year']);
        });

        Schema::create('documents', function (Blueprint $table) {
            $table->id();
            $table->foreignId('organization_id')->constrained()->cascadeOnDelete();
            $table->foreignId('client_id')->constrained()->restrictOnDelete();
            $table->foreignId('project_id')->nullable()->constrained()->nullOnDelete();
            $table->foreignId('created_by')->nullable()->constrained('users')->nullOnDelete();
            $table->string('type', 12); // devis|proforma|facture|acompte|avoir
            $table->string('status')->default('draft'); // draft|sent|accepted|pending|paid|overdue
            $table->boolean('is_locked')->default(false);
            $table->string('number')->nullable()->unique();
            $table->unsignedSmallInteger('number_year')->nullable();
            $table->unsignedBigInteger('sequence_number')->nullable();
            $table->string('language', 2)->default('FR');
            $table->string('currency', 3)->default('MAD');
            $table->decimal('exchange_rate_to_mad', 12, 4)->default(1);
            $table->date('issue_date');
            $table->date('due_date');
            $table->decimal('subtotal', 14, 2)->default(0);
            $table->decimal('discount_amount', 14, 2)->default(0);
            $table->decimal('global_discount_pct', 5, 2)->default(0);
            $table->decimal('deposit_requested_pct', 5, 2)->default(0);
            $table->decimal('total_amount', 14, 2)->default(0);
            $table->decimal('indicative_mad_amount', 14, 2)->default(0);
            $table->string('vat_regime')->default('franchise_ae'); // franchise_ae|export_hors_champ
            $table->text('legal_mention')->nullable();
            $table->string('payment_method')->nullable();
            $table->string('payment_terms')->nullable();
            $table->string('bank_account_key')->nullable();
            $table->text('notes')->nullable();
            $table->timestamp('issued_at')->nullable();
            $table->timestamp('locked_at')->nullable();
            $table->timestamp('sent_at')->nullable();
            $table->timestamp('viewed_at')->nullable();
            $table->timestamp('paid_at')->nullable();
            $table->timestamps();
            $table->index(['organization_id', 'type', 'status']);
            $table->index(['organization_id', 'issue_date']);
        });

        Schema::create('document_lines', function (Blueprint $table) {
            $table->id();
            $table->foreignId('document_id')->constrained()->cascadeOnDelete();
            $table->unsignedInteger('position')->default(0);
            $table->string('designation');
            $table->string('unit')->default('jour');
            $table->decimal('quantity', 10, 2)->default(1);
            $table->decimal('unit_price', 14, 2)->default(0);
            $table->decimal('discount_pct', 5, 2)->default(0);
            $table->decimal('line_total', 14, 2)->default(0);
            $table->timestamps();
        });

        Schema::create('document_events', function (Blueprint $table) {
            $table->id();
            $table->foreignId('document_id')->constrained()->cascadeOnDelete();
            $table->foreignId('user_id')->nullable()->constrained()->nullOnDelete();
            $table->string('type'); // created|issued|sent|viewed|paid|credited
            $table->string('label_fr');
            $table->string('label_ar')->nullable();
            $table->jsonb('meta')->default('{}');
            $table->timestamp('occurred_at');
            $table->timestamps();
        });

        Schema::create('payments', function (Blueprint $table) {
            $table->id();
            $table->foreignId('organization_id')->constrained()->cascadeOnDelete();
            $table->foreignId('document_id')->constrained()->cascadeOnDelete();
            $table->foreignId('recorded_by')->nullable()->constrained('users')->nullOnDelete();
            $table->decimal('amount', 14, 2);
            $table->string('currency', 3);
            $table->decimal('exchange_rate_to_mad', 12, 4)->default(1);
            $table->decimal('amount_received_mad', 14, 2);
            $table->decimal('bank_fees_mad', 14, 2)->default(0);
            $table->date('received_on');
            $table->string('method');
            $table->string('reference')->nullable();
            $table->text('notes')->nullable();
            $table->timestamps();
            $table->index(['organization_id', 'received_on']);
        });

        // Cashier tables are published separately:
        // php artisan vendor:publish --tag=cashier-migrations && php artisan migrate
    }

    public function down(): void
    {
        Schema::dropIfExists('payments');
        Schema::dropIfExists('document_events');
        Schema::dropIfExists('document_lines');
        Schema::dropIfExists('documents');
        Schema::dropIfExists('numbering_sequences');
        Schema::dropIfExists('project_tasks');
        Schema::dropIfExists('projects');
        Schema::dropIfExists('services');
        Schema::dropIfExists('clients');
        Schema::dropIfExists('organization_invitations');
        Schema::dropIfExists('organization_user');
        Schema::dropIfExists('users');
        Schema::dropIfExists('organizations');
    }
};
