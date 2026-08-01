/** Breakpoint (px): нижче — картки, від — таблиця. */
export const ADMIN_RESPONSIVE_TABLE_BREAKPOINT_PX = 1100;

export interface ResponsiveAdminTableLayout {
  readonly breakpointPx: number;
  readonly cardsOnlyClass: string;
  readonly tableOnlyClass: string;
  readonly tableWrapperClass: string;
  readonly tableScrollClass: string;
  readonly cardsGridClass: string;
  readonly emptyStateClass: string;
  readonly emptyStateMutedClass: string;
  readonly tableClass560: string;
  readonly tableClass640: string;
  readonly tableClass700: string;
  readonly tableClass720: string;
  readonly tableClass880: string;
  readonly headRowClass: string;
  readonly thClass: string;
  readonly bodyRowClass: string;
  readonly tdIndexClass: string;
  readonly tdPrimaryClass: string;
  readonly tdClass: string;
  readonly tdMonoClass: string;
  readonly emptyCellClass: string;
  readonly emptyCellMutedClass: string;
  readonly emptyDashClass: string;
}

/**
 * Адаптивний блок «таблиця ↔ картки» для super-admin, school-admin, teacher.
 * Класи зафіксовані для Tailwind JIT (без динамічної підстановки breakpoint).
 */
export function useResponsiveAdminTableLayout(): ResponsiveAdminTableLayout {
  const tableBase = 'w-full text-left text-sm';
  const headRowClass =
    'border-b border-slate-200 bg-slate-50 text-xs font-semibold uppercase text-slate-600';

  return {
    breakpointPx: ADMIN_RESPONSIVE_TABLE_BREAKPOINT_PX,
    cardsOnlyClass: 'min-[1100px]:hidden',
    tableOnlyClass: 'hidden min-[1100px]:block',
    tableWrapperClass:
      'hidden overflow-x-auto rounded-lg border border-slate-100 min-[1100px]:block',
    tableScrollClass: 'overflow-x-auto rounded-lg border border-slate-100',
    cardsGridClass: 'grid gap-4 sm:grid-cols-2',
    emptyStateClass:
      'rounded-lg border border-slate-100 bg-slate-50 px-4 py-10 text-center text-sm text-slate-500',
    emptyStateMutedClass:
      'rounded-lg border border-slate-100 bg-slate-50 px-4 py-10 text-center text-sm text-slate-600',
    tableClass560: `${tableBase} min-w-[560px]`,
    tableClass640: `${tableBase} min-w-[640px]`,
    tableClass700: `${tableBase} min-w-[700px]`,
    tableClass720: `${tableBase} min-w-[720px]`,
    tableClass880: `${tableBase} min-w-[880px]`,
    headRowClass,
    thClass: 'px-3 py-3',
    bodyRowClass: 'border-b border-slate-100 hover:bg-slate-50/80',
    tdIndexClass: 'px-3 py-3 font-semibold text-slate-900',
    tdPrimaryClass: 'px-3 py-3 font-medium text-slate-900',
    tdClass: 'px-3 py-3 text-slate-600',
    tdMonoClass: 'px-3 py-3 font-mono text-slate-600',
    emptyCellClass: 'px-3 py-10 text-center text-sm text-slate-500',
    emptyCellMutedClass: 'px-3 py-10 text-center text-sm text-slate-600',
    emptyDashClass: 'text-slate-400',
  };
}
