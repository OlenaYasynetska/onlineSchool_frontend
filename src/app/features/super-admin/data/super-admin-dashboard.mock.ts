export interface PlanOverviewCard {
  id: string;
  label: string;
  count: number;
  percent: number;
  accentClass: string;
}

export interface OrganizationRow {
  id: string;
  name: string;
  plan: 'Pro' | 'Standard' | 'Free';
  status: 'Active' | 'Expiring soon' | 'Inactive';
  nextBilling: string;
  registered: string;
  totalReceived: string;
}

export interface PaymentHistoryRow {
  id: string;
  date: string;
  organization: string;
  amount: string;
  status: 'Paid' | 'Pending payment' | 'Failed';
}

export const PLAN_OVERVIEW_CARDS: PlanOverviewCard[] = [
  {
    id: 'pro',
    label: 'Plan Pro',
    count: 0,
    percent: 0,
    accentClass: 'border-amber-500 bg-amber-50 text-amber-900',
  },
  {
    id: 'standard',
    label: 'Plan Standard',
    count: 0,
    percent: 0,
    accentClass: 'border-blue-500 bg-blue-50 text-blue-900',
  },
  {
    id: 'free',
    label: 'Plan Free',
    count: 0,
    percent: 0,
    accentClass: 'border-slate-400 bg-slate-100 text-slate-800',
  },
];

export const ORGANIZATION_ROWS: OrganizationRow[] = [];

export const PAYMENT_HISTORY_ROWS: PaymentHistoryRow[] = [];
