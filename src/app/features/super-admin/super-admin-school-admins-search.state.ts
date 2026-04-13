import { computed, Signal, signal } from '@angular/core';
import type { SchoolAdminContactRow } from './models/super-admin-dashboard.model';

/**
 * Text search across school admin table columns (name, school, email, login, dates, id).
 */
export function createSuperAdminSchoolAdminsSearchState(
  adminsSource: Signal<SchoolAdminContactRow[]>
) {
  const adminSearch = signal('');

  const filteredSchoolAdmins = computed(() => {
    const rows = adminsSource();
    const q = adminSearch().trim().toLowerCase();
    if (!q) {
      return rows;
    }
    return rows.filter((r) => {
      const blob = [
        r.userId,
        r.fullName,
        r.schoolName,
        r.email,
        r.login,
        r.registeredAt,
        r.notes ?? '',
        r.enabled === false ? 'inactive deactivated' : '',
      ]
        .join(' ')
        .toLowerCase();
      return blob.includes(q);
    });
  });

  function onAdminSearchInput(event: Event): void {
    adminSearch.set((event.target as HTMLInputElement).value);
  }

  function clearAdminSearch(): void {
    adminSearch.set('');
  }

  return {
    adminSearch,
    filteredSchoolAdmins,
    onAdminSearchInput,
    clearAdminSearch,
  };
}

export type SuperAdminSchoolAdminsSearchState = ReturnType<
  typeof createSuperAdminSchoolAdminsSearchState
>;
