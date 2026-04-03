import { SCHOOL_ADMIN_DASHBOARD_INITIAL } from '../data/school-admin-dashboard.initial';

/** Початковий стан дашборду; реальні дані підставляються після GET /school-admin/dashboard. */
export function useSchoolAdminDashboard() {
  return { ...SCHOOL_ADMIN_DASHBOARD_INITIAL };
}

