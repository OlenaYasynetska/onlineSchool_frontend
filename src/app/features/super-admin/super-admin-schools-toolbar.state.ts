import { computed, Signal, signal } from '@angular/core';
import type { SchoolCard } from './models/super-admin-dashboard.model';

export type SchoolPlanFilter = 'all' | 'Pro' | 'Standard' | 'Free';

export type SchoolsViewMode = 'grid' | 'list';

export const SCHOOL_PLAN_FILTER_OPTIONS: SchoolPlanFilter[] = [
  'all',
  'Pro',
  'Standard',
  'Free',
];

/**
 * Композиція стану тулбара «Schools»: пошук, фільтр за планом, панель, режим сітка/список.
 * Джерело списку шкіл передається сигналом (наприклад `computed(() => dash().schools)`).
 */
export function createSuperAdminSchoolsToolbarState(
  schoolsSource: Signal<SchoolCard[]>
) {
  const schoolSearch = signal('');
  const planFilter = signal<SchoolPlanFilter>('all');
  const filterPanelOpen = signal(false);
  const schoolsViewMode = signal<SchoolsViewMode>('grid');

  const filteredSchools = computed(() => {
    const schools = schoolsSource();
    const plan = planFilter();
    const q = schoolSearch().trim().toLowerCase();
    return schools.filter((s) => {
      if (plan !== 'all' && s.plan !== plan) {
        return false;
      }
      if (!q) {
        return true;
      }
      const blob = `${s.title}\n${s.displayName}\n${s.address}`.toLowerCase();
      return blob.includes(q);
    });
  });

  const activeSchoolFilterCount = computed(() => {
    let n = 0;
    if (planFilter() !== 'all') {
      n++;
    }
    if (schoolSearch().trim()) {
      n++;
    }
    return n;
  });

  function toggleFilterPanel(): void {
    filterPanelOpen.update((v) => !v);
  }

  function setPlanFilter(value: SchoolPlanFilter): void {
    planFilter.set(value);
  }

  function clearSchoolFilters(): void {
    schoolSearch.set('');
    planFilter.set('all');
    filterPanelOpen.set(false);
  }

  function onSchoolSearchInput(event: Event): void {
    const v = (event.target as HTMLInputElement).value;
    schoolSearch.set(v);
  }

  function toggleSchoolsViewMode(): void {
    schoolsViewMode.update((m) => (m === 'grid' ? 'list' : 'grid'));
  }

  /** Закрити випадаючий фільтр, якщо клік був поза `host` (передати nativeElement з #filterHost). */
  function onOutsideClick(
    host: HTMLElement | null | undefined,
    target: Node
  ): void {
    if (!filterPanelOpen()) {
      return;
    }
    if (host && !host.contains(target)) {
      filterPanelOpen.set(false);
    }
  }

  return {
    schoolSearch,
    planFilter,
    filterPanelOpen,
    schoolsViewMode,
    schoolPlanFilterOptions: SCHOOL_PLAN_FILTER_OPTIONS,
    filteredSchools,
    activeSchoolFilterCount,
    toggleFilterPanel,
    setPlanFilter,
    clearSchoolFilters,
    onSchoolSearchInput,
    toggleSchoolsViewMode,
    onOutsideClick,
  };
}

export type SuperAdminSchoolsToolbarState = ReturnType<
  typeof createSuperAdminSchoolsToolbarState
>;
