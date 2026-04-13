import type { SchoolAdminDashboardResponse } from '../models/school-admin-dashboard.model';

/** Початковий стан до завантаження GET /school-admin/dashboard (без мок-даних). */
export const SCHOOL_ADMIN_DASHBOARD_INITIAL: SchoolAdminDashboardResponse = {
  schoolId: '',
  stats: {
    totalStudents: 0,
    totalTeachers: 0,
    totalGroups: 0,
    totalSubjects: 0,
    totalPayments: 0,
    paidPayments: 0,
    totalReceived: '0.00',
  },
  students: [],
  payments: [],
  groups: [],
  subscription: { planTitle: '—', platformAccessEndDate: '—' },
};
