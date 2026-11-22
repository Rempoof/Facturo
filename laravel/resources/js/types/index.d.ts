export interface OrganizationSummary {
  id: number
  name: string
  slug: string
  base_currency: string
  activity_category: 'services' | 'commercial'
  annual_ceiling_mad: string | number
  ice: string | null
  auto_entrepreneur_number: string | null
  email: string | null
}

export interface ClientSummary {
  id: number
  name: string
  country_code: string
  city?: string | null
  tax_id?: string | null
  tax_id_label?: string
  preferred_language?: string
  default_currency?: string
  type?: string
  contact_name?: string | null
  documents_count?: number
}

export type DocumentTypeCode = 'devis' | 'proforma' | 'facture' | 'acompte' | 'avoir'
export type DocumentStatusCode = 'draft' | 'sent' | 'accepted' | 'pending' | 'paid' | 'overdue'

export interface DocumentLinePayload {
  designation: string
  unit: 'jour' | 'heure' | 'forfait' | 'unité'
  quantity: number
  unit_price: number
  discount_pct: number
}

export interface CeilingPayload {
  collected_mad: number
  ceiling_mad: number
  percent: number
  remaining_mad: number
  zone: { key: 'safe' | 'vigilance' | 'limit'; label: string; range: string; color: string }
  run_rate_mad: number
  projection: string | null
  activity_label: string
}

export interface DashboardPayload {
  today: string
  ceiling: CeilingPayload
  cashflow: {
    to_collect_mad: number
    to_collect_count: number
    overdue_count: number
    to_invoice_mad: number
    accepted_count: number
    unbilled_tasks_count: number
  }
  cycle: Record<string, { count: number; amount_mad: number }>
  actions: Array<{
    id: string
    tone: 'red' | 'blue' | 'amber' | 'green'
    title: string
    meta: string
    cta: string
    kind: 'remind' | 'convert' | 'invoice_project' | 'record_payment'
    document_id?: number
    project_id?: number
    primary?: boolean
  }>
  declaration: {
    label: string
    period_start: string
    total_mad: number
    contribution_rate: number | null
    contribution_mad: number | null
    rate_hint: number
    deadline: string | null
  }
  deadlines: Array<{ document_id: number; day: string; month: string; title: string; client: string }>
  monthly: Array<{ key: string; label: string; total_mad: number; current: boolean }>
  origin: Array<{ currency: string; percent: number }>
}
