import { computed, Signal, signal } from '@angular/core';
import type { OrganizationRow } from './models/super-admin-dashboard.model';

/**
 * Текстовий пошук по таблиці Organizations (ім'я, план, статус, дати, сума, id).
 */
export function createSuperAdminOrganizationsSearchState(
  organizationsSource: Signal<OrganizationRow[]>
) {
  const organizationSearch = signal('');

  const filteredOrganizations = computed(() => {
    const rows = organizationsSource();
    const q = organizationSearch().trim().toLowerCase();
    if (!q) {
      return rows;
    }
    return rows.filter((r) => {
      const blob = [
        r.id,
        r.name,
        r.plan,
        r.status,
        r.nextBilling,
        r.registered,
        r.totalReceived,
        String(r.studentCount ?? ''),
        (r.address ?? '').replace(/\n/g, ' '),
      ]
        .join(' ')
        .toLowerCase();
      return blob.includes(q);
    });
  });

  function onOrganizationSearchInput(event: Event): void {
    organizationSearch.set((event.target as HTMLInputElement).value);
  }

  function clearOrganizationSearch(): void {
    organizationSearch.set('');
  }

  return {
    organizationSearch,
    filteredOrganizations,
    onOrganizationSearchInput,
    clearOrganizationSearch,
  };
}

export type SuperAdminOrganizationsSearchState = ReturnType<
  typeof createSuperAdminOrganizationsSearchState
>;
