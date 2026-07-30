import type { OrganizationRow } from '../models/super-admin-dashboard.model';

export function organizationStatusClass(status: OrganizationRow['status']): string {
  switch (status) {
    case 'Active':
      return 'text-xs font-semibold text-emerald-700';
    case 'Expiring soon':
      return 'text-xs font-semibold text-amber-700';
    case 'Inactive':
      return 'text-xs font-semibold text-slate-500';
    default:
      return 'text-xs text-slate-600';
  }
}
