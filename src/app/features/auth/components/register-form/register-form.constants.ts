export const MONTH_NUMBERS = Array.from({ length: 12 }, (_, i) =>
  String(i + 1).padStart(2, '0')
);

export const YEAR_NUMBERS = Array.from({ length: 15 }, (_, i) =>
  String(new Date().getFullYear() + i)
);

export const COUNTRY_OPTIONS = [
  { value: '', label: 'Country / Region' },
  { value: 'UA', label: 'Ukraine' },
  { value: 'US', label: 'United States' },
  { value: 'GB', label: 'United Kingdom' },
  { value: 'DE', label: 'Germany' },
  { value: 'PL', label: 'Poland' },
  { value: 'FR', label: 'France' },
  { value: 'OTHER', label: 'Other' },
] as const;

export const PLAN_OPTIONS = [
  { value: 'free', label: 'Free Plan (Forever Free)' },
  { value: 'standard', label: 'Standard Plan' },
  { value: 'pro', label: 'Pro Plan (for growing schools)' },
] as const;

export const PAYMENT_OPTIONS = [
  { value: 'monthly', label: 'Monthly' },
  { value: 'yearly', label: 'Yearly' },
  { value: 'quarterly', label: 'Quarterly' },
] as const;

export type PlanOption = (typeof PLAN_OPTIONS)[number];
export type PaymentOption = (typeof PAYMENT_OPTIONS)[number];
