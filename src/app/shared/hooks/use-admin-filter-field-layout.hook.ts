/** Єдина висота полів фільтрів у кабінетах admin / school-admin (40px). */
const ADMIN_FILTER_FIELD_BASE =
  'admin-filter-field box-border h-10 min-h-10 max-h-10 w-full rounded-lg border border-slate-200 bg-slate-50 text-sm leading-normal text-slate-900 focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-100';

export interface AdminFilterFieldLayout {
  readonly labelClass: string;
  readonly fieldClass: string;
  readonly searchFieldClass: string;
  readonly searchFieldDisabledClass: string;
}

export function useAdminFilterFieldLayout(): AdminFilterFieldLayout {
  return {
    labelClass: 'text-xs font-medium text-slate-600',
    fieldClass: `${ADMIN_FILTER_FIELD_BASE} px-3`,
    searchFieldClass: `${ADMIN_FILTER_FIELD_BASE} pl-10 pr-3 placeholder:text-slate-400`,
    searchFieldDisabledClass: 'disabled:cursor-not-allowed disabled:opacity-50',
  };
}
