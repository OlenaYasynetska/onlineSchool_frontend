/** Спільні Tailwind-класи для карток списків (super-admin, school-admin, teacher). */
export interface AdminGridCardLayout {
  readonly articleClass: string;
  readonly articleClassWithMinHeight: string;
  readonly headerWrapClass: string;
  readonly headerMainClass: string;
  readonly indexClass: string;
  readonly titleClass: string;
  readonly indexedTitleClass: string;
  readonly subtitleClass: string;
  readonly bodyTextClass: string;
  readonly footerMetaClass: string;
  readonly dlClass: string;
  readonly dlRowStackClass: string;
  readonly dlRowPairClass: string;
  readonly dlRowSplitClass: string;
  readonly dtClass: string;
  readonly dtInlineClass: string;
  readonly ddBreakClass: string;
  readonly ddBreakRightClass: string;
  readonly ddValueClass: string;
  readonly ddStrongClass: string;
  readonly emptyDashClass: string;
  readonly planBadgeBaseClass: string;
  readonly actionsRowClass: string;
  readonly editBtnClass: string;
  readonly viewBtnClass: string;
}

export function useAdminGridCardLayout(): AdminGridCardLayout {
  return {
    articleClass:
      'flex h-full min-w-0 flex-col overflow-hidden rounded-lg border border-slate-200/90 bg-white p-5 shadow-md transition-shadow hover:shadow-lg',
    articleClassWithMinHeight:
      'flex h-full min-h-[188px] min-w-0 flex-col overflow-hidden rounded-lg border border-slate-200/90 bg-white p-5 shadow-md transition-shadow hover:shadow-lg',
    headerWrapClass: 'flex items-start justify-between gap-3',
    headerMainClass: 'min-w-0 flex-1',
    indexClass: 'text-xs font-medium text-slate-400',
    titleClass:
      'text-[17px] font-bold leading-snug tracking-tight text-[#2D3E50]',
    indexedTitleClass:
      'mt-0.5 text-[17px] font-bold leading-snug tracking-tight text-[#2D3E50]',
    subtitleClass: 'mt-2 text-[15px] font-semibold leading-snug text-[#E67E22]',
    bodyTextClass: 'mt-3 flex-1 whitespace-pre-line text-sm leading-relaxed text-slate-600',
    footerMetaClass: 'mt-4 text-right text-xs text-slate-400',
    dlClass: 'mt-4 flex-1 space-y-2.5 text-sm',
    dlRowStackClass: 'flex flex-col gap-0.5',
    dlRowPairClass: 'flex items-center justify-between gap-3',
    dlRowSplitClass:
      'flex flex-col gap-0.5 sm:flex-row sm:items-start sm:justify-between sm:gap-3',
    dtClass: 'shrink-0 text-slate-500',
    dtInlineClass: 'text-slate-500',
    ddBreakClass: 'min-w-0 break-words',
    ddBreakRightClass: 'min-w-0 break-words text-slate-700 sm:text-right',
    ddValueClass: 'text-slate-700',
    ddStrongClass: 'font-semibold text-slate-900',
    emptyDashClass: 'text-slate-400',
    planBadgeBaseClass:
      'shrink-0 rounded-full px-2.5 py-1 text-[10px] font-bold uppercase leading-none tracking-wide',
    actionsRowClass: 'mt-5 flex flex-wrap gap-2',
    editBtnClass:
      'inline-flex flex-1 items-center justify-center rounded-lg bg-amber-500 px-3 py-2 text-sm font-medium text-white transition hover:bg-amber-600 sm:flex-none',
    viewBtnClass:
      'inline-flex flex-1 items-center justify-center rounded-lg bg-slate-600 px-3 py-2 text-sm font-medium text-white transition hover:bg-slate-700 sm:flex-none',
  };
}

/** Текст або «—» для порожніх полів у картках. */
export function adminGridListLabel(items: string[] | undefined | null): string | null {
  if (!items?.length) return null;
  const joined = items.map((s) => s.trim()).filter(Boolean).join(', ');
  return joined || null;
}
