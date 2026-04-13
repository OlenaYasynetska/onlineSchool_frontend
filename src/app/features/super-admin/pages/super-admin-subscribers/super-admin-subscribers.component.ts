import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { SuperAdminDashboardService } from '../../services/super-admin-dashboard.service';
import type {
  OrganizationRow,
  PaymentHistoryRow,
  SuperAdminDashboardResponse,
} from '../../models/super-admin-dashboard.model';
import { createSuperAdminOrganizationsSearchState } from '../../super-admin-organizations-search.state';
import { createSuperAdminPaymentsSearchState } from '../../super-admin-payments-search.state';

const emptyDash: SuperAdminDashboardResponse = {
  planOverview: [],
  schools: [],
  organizations: [],
  payments: [],
};

@Component({
  selector: 'app-super-admin-subscribers',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './super-admin-subscribers.component.html',
})
export class SuperAdminSubscribersComponent implements OnInit {
  private readonly dashboardApi = inject(SuperAdminDashboardService);

  loading = true;
  readonly dash = signal<SuperAdminDashboardResponse>(emptyDash);

  readonly orgsUi = createSuperAdminOrganizationsSearchState(
    computed(() => this.dash().organizations)
  );

  readonly paymentsUi = createSuperAdminPaymentsSearchState(
    computed(() => this.dash().payments)
  );

  ngOnInit(): void {
    this.dashboardApi.getDashboard().subscribe({
      next: (data) => {
        this.dash.set(data);
        this.loading = false;
      },
      error: (err) => {
        console.error(err);
        this.loading = false;
      },
    });
  }

  orgStatusClass(status: OrganizationRow['status']): string {
    switch (status) {
      case 'Active':
        return 'text-xs font-semibold text-emerald-700';
      case 'Expiring soon':
        return 'text-xs font-semibold text-amber-700';
      case 'Inactive':
        return 'text-xs font-semibold text-slate-500';
      default:
        return '';
    }
  }

  paymentStatusClass(status: PaymentHistoryRow['status']): string {
    switch (status) {
      case 'Paid':
        return 'text-xs font-semibold text-emerald-700';
      case 'Pending payment':
        return 'text-xs font-semibold text-amber-700';
      case 'Failed':
        return 'text-xs font-semibold text-red-600';
      default:
        return '';
    }
  }
}
