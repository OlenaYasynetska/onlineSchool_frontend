import type { SchoolCard } from './models/super-admin-dashboard.model';

/** Класи бейджа плану (таблиця списку шкіл / узгоджено з карткою). */
export function schoolPlanBadgeClass(plan: SchoolCard['plan']): string {
  switch (plan) {
    case 'Pro':
      return 'bg-[#E67E22] text-white';
    case 'Standard':
      return 'bg-blue-600 text-white';
    default:
      return 'bg-slate-400 text-white';
  }
}

export function schoolPlanBadgeLabel(plan: SchoolCard['plan']): string {
  switch (plan) {
    case 'Pro':
      return 'PRO';
    case 'Standard':
      return 'Standart';
    default:
      return 'Free';
  }
}
