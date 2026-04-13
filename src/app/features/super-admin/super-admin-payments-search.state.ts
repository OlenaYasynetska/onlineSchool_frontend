import { computed, Signal, signal } from '@angular/core';
import type { PaymentHistoryRow } from './models/super-admin-dashboard.model';

export function createSuperAdminPaymentsSearchState(
  paymentsSource: Signal<PaymentHistoryRow[]>
) {
  const paymentSearch = signal('');

  const filteredPayments = computed(() => {
    const rows = paymentsSource();
    const q = paymentSearch().trim().toLowerCase();
    if (!q) {
      return rows;
    }
    return rows.filter((r) => {
      const blob = [r.id, r.date, r.organization, r.amount, r.status]
        .join(' ')
        .toLowerCase();
      return blob.includes(q);
    });
  });

  function onPaymentSearchInput(event: Event): void {
    paymentSearch.set((event.target as HTMLInputElement).value);
  }

  function clearPaymentSearch(): void {
    paymentSearch.set('');
  }

  return {
    paymentSearch,
    filteredPayments,
    onPaymentSearchInput,
    clearPaymentSearch,
  };
}

export type SuperAdminPaymentsSearchState = ReturnType<
  typeof createSuperAdminPaymentsSearchState
>;
