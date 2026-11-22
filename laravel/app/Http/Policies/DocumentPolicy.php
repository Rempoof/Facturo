<?php

namespace App\Http\Policies;

use App\Models\Document;
use App\Models\User;

class DocumentPolicy
{
    public function view(User $user, Document $document): bool
    {
        return $user->belongsToOrganization($document->organization_id);
    }

    public function update(User $user, Document $document): bool
    {
        return $this->view($user, $document) && $document->canBeEdited();
    }

    public function delete(User $user, Document $document): bool
    {
        // Issued documents can never be deleted: numbering must stay continuous.
        return $this->update($user, $document);
    }

    public function issue(User $user, Document $document): bool
    {
        return $this->view($user, $document) && ! $document->is_locked;
    }

    public function recordPayment(User $user, Document $document): bool
    {
        return $this->view($user, $document) && $document->is_locked;
    }
}
