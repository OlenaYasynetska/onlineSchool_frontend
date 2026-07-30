/** Breakpoint (px): нижче — картки, від — таблиця. */
export const ADMIN_RESPONSIVE_TABLE_BREAKPOINT_PX = 1120;

export interface ResponsiveAdminTableLayout {
  readonly breakpointPx: number;
  readonly cardsOnlyClass: string;
  readonly tableOnlyClass: string;
  readonly tableWrapperClass: string;
  readonly cardsGridClass: string;
  readonly emptyStateClass: string;
  readonly emptyStateMutedClass: string;
}

/**
 * Адаптивний блок «таблиця ↔ картки» для кабінетів admin / school-admin.
 * Класи зафіксовані для Tailwind JIT (без динамічної підстановки breakpoint).
 */
export function useResponsiveAdminTableLayout(): ResponsiveAdminTableLayout {
  return {
    breakpointPx: ADMIN_RESPONSIVE_TABLE_BREAKPOINT_PX,
    cardsOnlyClass: 'min-[1120px]:hidden',
    tableOnlyClass: 'hidden min-[1120px]:block',
    tableWrapperClass:
      'hidden overflow-x-auto rounded-lg border border-slate-100 min-[1120px]:block',
    cardsGridClass: 'grid gap-4 sm:grid-cols-2',
    emptyStateClass:
      'rounded-lg border border-slate-100 bg-slate-50 px-4 py-10 text-center text-sm text-slate-500',
    emptyStateMutedClass:
      'rounded-lg border border-slate-100 bg-slate-50 px-4 py-10 text-center text-sm text-slate-600',
  };
}
