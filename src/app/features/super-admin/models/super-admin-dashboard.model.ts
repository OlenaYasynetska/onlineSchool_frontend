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
  /** З GET /super-admin/dashboard — кількість учнів школи з БД */
  studentCount?: number;
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

/** Агрегати для карток /dashboard (суперадмін). */
export interface PlatformSummary {
  students: number;
  teachers: number;
  schools: number;
  courses: number;
}

export interface SuperAdminDashboardResponse {
  planOverview: PlanOverviewCard[];
  schools: SchoolCard[];
  organizations: OrganizationRow[];
  payments: PaymentHistoryRow[];
  /** З бекенду з V15+ dashboard summary; якщо немає — картки /dashboard лишаються «—». */
  summary?: PlatformSummary;
}

/** Рядок таблиці «Адміністратори шкіл» (суперадмін). */
export interface SchoolAdminContactRow {
  userId: string;
  fullName: string;
  schoolName: string;
  email: string;
  login: string;
  registeredAt: string;
  /** Внутрішні нотатки суперадміна (щоб не забути). */
  notes?: string;
  /** false — деактивовано (не може увійти), рядок лишається в списку. */
  enabled?: boolean;
}

export interface SchoolAdminUpdatePayload {
  fullName: string;
  schoolName: string;
  email: string;
  login: string;
  notes: string;
}

