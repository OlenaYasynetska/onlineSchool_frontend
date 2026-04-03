export interface PlanOverviewCard {
  id: string;
  label: string;
  count: number;
  percent: number;
  accentClass?: string;
}

export interface OrganizationRow {
  id: string;
  name: string;
  plan: 'Pro' | 'Standard' | 'Free';
  status: 'Active' | 'Expiring soon' | 'Inactive';
  nextBilling: string;
  registered: string;
  totalReceived: string;
  /** Адреса з організації (рядок або кілька рядків через \n) */
  address?: string;
}

export interface PaymentHistoryRow {
  id: string;
  date: string;
  organization: string;
  amount: string;
  status: 'Paid' | 'Pending payment' | 'Failed';
}

export interface SchoolCard {
  id: string;
  title: string;
  displayName: string;
  address: string;
  plan: 'Pro' | 'Standard' | 'Free';
  studentCount: number;
}

export interface SuperAdminDashboardResponse {
  planOverview: PlanOverviewCard[];
  schools: SchoolCard[];
  organizations: OrganizationRow[];
  payments: PaymentHistoryRow[];
}

/** Рядок таблиці «Адміністратори шкіл» (суперадмін). */
export interface SchoolAdminContactRow {
  userId: string;
  fullName: string;
  schoolName: string;
  email: string;
  login: string;
  registeredAt: string;
}

